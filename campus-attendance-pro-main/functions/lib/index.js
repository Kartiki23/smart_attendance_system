"use strict";
/**
 * Firebase Cloud Functions for Smart Attendance System
 *
 * This file contains all backend serverless functions that handle:
 * - Auto-marking absent students
 * - Calculating attendance percentages
 * - Sending FCM push notifications
 * - Cleaning up expired sessions
 * - Low attendance alerts
 *
 * @author Smart Attendance System
 * @version 1.0.0
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.recalculateAttendance = exports.cleanupExpiredSessions = exports.calculateAttendancePercentage = exports.autoMarkAbsentees = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
// Initialize Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();
const messaging = admin.messaging();
// ============================================================================
// 1. AUTO-MARK ABSENTEES
// ============================================================================
/**
 * Auto-mark absent students when a lecture session ends
 *
 * Trigger: When lecture_sessions document status changes to "completed"
 *
 * Process:
 * 1. Get all students enrolled in the class
 * 2. Get all students who marked attendance (present)
 * 3. Mark remaining students as "absent"
 * 4. Send FCM notifications to parents of absent students
 *
 * @viva This function ensures no student is missed when marking attendance
 */
exports.autoMarkAbsentees = functions.firestore
    .document("lecture_sessions/{sessionId}")
    .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const sessionId = context.params.sessionId;
    // Only process if session was just completed
    if (before.status !== "completed" && after.status === "completed") {
        try {
            console.log(`Processing session completion: ${sessionId}`);
            // Get all students enrolled in the class
            const classId = after.class_id;
            const studentsSnapshot = await db
                .collection("students")
                .where("class_id", "==", classId)
                .get();
            if (studentsSnapshot.empty) {
                console.log(`No students found for class ${classId}`);
                return null;
            }
            // Get all students who marked attendance (present)
            const attendanceSnapshot = await db
                .collection("attendance")
                .where("session_id", "==", sessionId)
                .where("status", "==", "present")
                .get();
            const presentStudentIds = new Set(attendanceSnapshot.docs.map((doc) => doc.data().student_id));
            console.log(`Total students: ${studentsSnapshot.size}, Present: ${presentStudentIds.size}`);
            // Mark absent students using batch write for performance
            const batch = db.batch();
            let absentCount = 0;
            const absentStudentIds = [];
            for (const studentDoc of studentsSnapshot.docs) {
                const studentId = studentDoc.id;
                if (!presentStudentIds.has(studentId)) {
                    const attendanceRef = db.collection("attendance").doc();
                    batch.set(attendanceRef, {
                        student_id: studentId,
                        session_id: sessionId,
                        subject_id: after.subject_id,
                        faculty_id: after.faculty_id,
                        status: "absent",
                        timestamp: admin.firestore.FieldValue.serverTimestamp(),
                        marked_at: admin.firestore.FieldValue.serverTimestamp(),
                        is_verified: false,
                        qr_code: "", // No QR code for auto-marked absentees
                    });
                    absentCount++;
                    absentStudentIds.push(studentId);
                }
            }
            // Commit batch write (max 500 operations per batch)
            if (absentCount > 0) {
                await batch.commit();
                console.log(`Marked ${absentCount} students as absent for session ${sessionId}`);
                // Send notifications to parents (async, don't wait)
                for (const studentId of absentStudentIds) {
                    notifyParentOfAbsence(studentId, sessionId, after).catch((error) => {
                        console.error(`Error notifying parent for student ${studentId}:`, error);
                    });
                }
            }
            return null;
        }
        catch (error) {
            console.error("Error auto-marking absentees:", error);
            // Don't throw - log error but don't fail the function
            return null;
        }
    }
    return null;
});
// ============================================================================
// 2. CALCULATE ATTENDANCE PERCENTAGE
// ============================================================================
/**
 * Calculate and update attendance percentage for a student
 *
 * Trigger: When a new attendance record is created (present or absent)
 *
 * Process:
 * 1. Get all attendance records for student + subject
 * 2. Calculate present/absent counts
 * 3. Calculate percentage
 * 4. Update attendance_stats collection
 * 5. Update overall attendance in students collection
 * 6. Check for low attendance and notify parent
 *
 * @viva This function maintains real-time attendance statistics
 */
exports.calculateAttendancePercentage = functions.firestore
    .document("attendance/{attendanceId}")
    .onCreate(async (snap, context) => {
    const attendanceData = snap.data();
    const studentId = attendanceData.student_id;
    const subjectId = attendanceData.subject_id;
    try {
        console.log(`Calculating attendance for student ${studentId}, subject ${subjectId}`);
        // Get all attendance records for this student and subject
        const attendanceSnapshot = await db
            .collection("attendance")
            .where("student_id", "==", studentId)
            .where("subject_id", "==", subjectId)
            .get();
        let totalClasses = 0;
        let presentCount = 0;
        let absentCount = 0;
        let lateCount = 0;
        attendanceSnapshot.docs.forEach((doc) => {
            const data = doc.data();
            totalClasses++;
            if (data.status === "present") {
                presentCount++;
            }
            else if (data.status === "absent") {
                absentCount++;
            }
            else if (data.status === "late") {
                lateCount++;
                presentCount++; // Late counts as present
            }
        });
        const percentage = totalClasses > 0 ? (presentCount / totalClasses) * 100 : 0;
        const roundedPercentage = Math.round(percentage * 100) / 100;
        // Update subject-wise attendance stats
        const statsRef = db
            .collection("attendance_stats")
            .doc(`${studentId}_${subjectId}`);
        await statsRef.set({
            student_id: studentId,
            subject_id: subjectId,
            total_classes: totalClasses,
            present_count: presentCount,
            absent_count: absentCount,
            late_count: lateCount,
            percentage: roundedPercentage,
            last_updated: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        // Calculate overall attendance across all subjects
        const overallStatsSnapshot = await db
            .collection("attendance_stats")
            .where("student_id", "==", studentId)
            .get();
        let totalOverallClasses = 0;
        let totalPresentCount = 0;
        overallStatsSnapshot.docs.forEach((doc) => {
            const data = doc.data();
            totalOverallClasses += data.total_classes || 0;
            totalPresentCount += data.present_count || 0;
        });
        const overallPercentage = totalOverallClasses > 0
            ? (totalPresentCount / totalOverallClasses) * 100
            : 0;
        const roundedOverallPercentage = Math.round(overallPercentage * 100) / 100;
        // Update overall attendance in students collection
        await db.collection("students").doc(studentId).update({
            attendance_percentage: roundedOverallPercentage,
            last_attendance_update: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`Updated attendance: Student ${studentId}, Subject ${subjectId}: ${roundedPercentage}% (Overall: ${roundedOverallPercentage}%)`);
        // Check for low attendance threshold (below 75%)
        if (roundedPercentage < 75 && totalClasses >= 5) {
            // Only alert if at least 5 classes have been conducted
            checkAndNotifyLowAttendance(studentId, subjectId, roundedPercentage).catch((error) => {
                console.error("Error checking low attendance:", error);
            });
        }
        return null;
    }
    catch (error) {
        console.error("Error calculating attendance percentage:", error);
        return null;
    }
});
// ============================================================================
// 3. CLEANUP EXPIRED SESSIONS
// ============================================================================
/**
 * Cleanup expired sessions automatically
 *
 * Trigger: Runs every hour (scheduled function)
 *
 * Process:
 * 1. Find all active sessions with expired QR codes
 * 2. Mark them as "completed"
 * 3. This triggers autoMarkAbsentees function
 *
 * @viva This ensures sessions don't stay active forever
 */
exports.cleanupExpiredSessions = functions.pubsub
    .schedule("every 1 hours")
    .timeZone("Asia/Kolkata") // Adjust to your timezone
    .onRun(async (context) => {
    try {
        console.log("Running cleanup for expired sessions...");
        const now = admin.firestore.Timestamp.now();
        // Find all active sessions with expired QR codes
        const expiredSessions = await db
            .collection("lecture_sessions")
            .where("status", "==", "active")
            .where("qr_expires_at", "<", now)
            .get();
        if (expiredSessions.empty) {
            console.log("No expired sessions found");
            return null;
        }
        // Use batch write for performance
        const batch = db.batch();
        let count = 0;
        expiredSessions.docs.forEach((doc) => {
            batch.update(doc.ref, {
                status: "completed",
                end_time: admin.firestore.FieldValue.serverTimestamp(),
                updated_at: admin.firestore.FieldValue.serverTimestamp(),
            });
            count++;
        });
        await batch.commit();
        console.log(`Cleaned up ${count} expired sessions`);
        return null;
    }
    catch (error) {
        console.error("Error cleaning up expired sessions:", error);
        return null;
    }
});
// ============================================================================
// 4. NOTIFY PARENT OF ABSENCE
// ============================================================================
/**
 * Send notification to parent when student is absent
 *
 * @param studentId Student UID
 * @param sessionId Session ID
 * @param sessionData Session data
 *
 * @viva This function sends both Firestore notification and FCM push
 */
async function notifyParentOfAbsence(studentId, sessionId, sessionData) {
    var _a, _b;
    try {
        // Get student data
        const studentDoc = await db.collection("students").doc(studentId).get();
        if (!studentDoc.exists) {
            console.log(`Student ${studentId} not found`);
            return;
        }
        const studentData = studentDoc.data();
        const parentId = studentData === null || studentData === void 0 ? void 0 : studentData.parent_id;
        if (!parentId) {
            console.log(`No parent linked for student ${studentId}`);
            return;
        }
        // Get subject and class names for notification message
        const [subjectDoc, classDoc] = await Promise.all([
            db.collection("subjects").doc(sessionData.subject_id).get(),
            db.collection("classes").doc(sessionData.class_id).get(),
        ]);
        const subjectName = ((_a = subjectDoc.data()) === null || _a === void 0 ? void 0 : _a.name) || "Unknown Subject";
        const className = ((_b = classDoc.data()) === null || _b === void 0 ? void 0 : _b.name) || "Unknown Class";
        const studentName = (studentData === null || studentData === void 0 ? void 0 : studentData.name) || "Your child";
        // Create Firestore notification document
        const notificationData = {
            user_id: parentId,
            type: "absence",
            title: "Student Absence Alert",
            message: `${studentName} was absent from ${subjectName} (${className})`,
            student_id: studentId,
            session_id: sessionId,
            read: false,
            fcm_sent: false,
            created_at: admin.firestore.FieldValue.serverTimestamp(),
        };
        const notificationRef = await db
            .collection("notifications")
            .add(notificationData);
        console.log(`Created notification ${notificationRef.id} for parent ${parentId}`);
        // Send FCM push notification
        await sendFCMNotification(parentId, {
            title: notificationData.title,
            body: notificationData.message,
            data: {
                type: "absence",
                studentId: studentId,
                sessionId: sessionId,
                notificationId: notificationRef.id,
            },
        });
        // Update notification to mark FCM as sent
        await notificationRef.update({ fcm_sent: true });
        console.log(`Notification sent to parent ${parentId} for student ${studentId}`);
    }
    catch (error) {
        console.error("Error notifying parent:", error);
        // Don't throw - log error but continue
    }
}
// ============================================================================
// 5. CHECK AND NOTIFY LOW ATTENDANCE
// ============================================================================
/**
 * Check if student has low attendance and notify parent
 *
 * @param studentId Student UID
 * @param subjectId Subject ID
 * @param percentage Current attendance percentage
 *
 * @viva This prevents students from falling below threshold
 */
async function checkAndNotifyLowAttendance(studentId, subjectId, percentage) {
    var _a;
    try {
        // Get student data
        const studentDoc = await db.collection("students").doc(studentId).get();
        if (!studentDoc.exists)
            return;
        const studentData = studentDoc.data();
        const parentId = studentData === null || studentData === void 0 ? void 0 : studentData.parent_id;
        if (!parentId)
            return;
        // Get subject name
        const subjectDoc = await db.collection("subjects").doc(subjectId).get();
        const subjectName = ((_a = subjectDoc.data()) === null || _a === void 0 ? void 0 : _a.name) || "Unknown Subject";
        // Check if we already sent a low attendance notification recently (within 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentNotification = await db
            .collection("notifications")
            .where("user_id", "==", parentId)
            .where("type", "==", "low_attendance")
            .where("student_id", "==", studentId)
            .where("subject_id", "==", subjectId)
            .where("created_at", ">", admin.firestore.Timestamp.fromDate(sevenDaysAgo))
            .limit(1)
            .get();
        if (!recentNotification.empty) {
            console.log(`Low attendance notification already sent recently for student ${studentId}`);
            return;
        }
        // Create notification
        const notificationData = {
            user_id: parentId,
            type: "low_attendance",
            title: "Low Attendance Alert",
            message: `${(studentData === null || studentData === void 0 ? void 0 : studentData.name) || "Your child"}'s attendance in ${subjectName} is ${percentage.toFixed(1)}%. Please ensure regular attendance.`,
            student_id: studentId,
            subject_id: subjectId,
            read: false,
            fcm_sent: false,
            created_at: admin.firestore.FieldValue.serverTimestamp(),
        };
        const notificationRef = await db
            .collection("notifications")
            .add(notificationData);
        // Send FCM push notification
        await sendFCMNotification(parentId, {
            title: notificationData.title,
            body: notificationData.message,
            data: {
                type: "low_attendance",
                studentId: studentId,
                subjectId: subjectId,
                percentage: percentage.toString(),
                notificationId: notificationRef.id,
            },
        });
        await notificationRef.update({ fcm_sent: true });
        console.log(`Low attendance notification sent for student ${studentId}, subject ${subjectId}`);
    }
    catch (error) {
        console.error("Error checking low attendance:", error);
    }
}
// ============================================================================
// 6. SEND FCM PUSH NOTIFICATION
// ============================================================================
/**
 * Send FCM push notification to user
 *
 * @param userId Target user UID
 * @param notification Notification payload
 *
 * @viva This function handles FCM token management and sending
 */
async function sendFCMNotification(userId, notification) {
    var _a;
    try {
        // Get user's FCM tokens from parents collection or fcm_tokens collection
        const parentDoc = await db.collection("parents").doc(userId).get();
        const fcmToken = (_a = parentDoc.data()) === null || _a === void 0 ? void 0 : _a.fcm_token;
        if (!fcmToken) {
            console.log(`No FCM token found for user ${userId}`);
            return;
        }
        // Prepare FCM message
        const message = {
            token: fcmToken,
            notification: {
                title: notification.title,
                body: notification.body,
            },
            data: notification.data || {},
            android: {
                priority: "high",
                notification: {
                    sound: "default",
                    channelId: "attendance_alerts", // Create this channel in Android app
                },
            },
            apns: {
                payload: {
                    aps: {
                        sound: "default",
                        badge: 1,
                    },
                },
            },
        };
        // Send notification
        const response = await messaging.send(message);
        console.log(`FCM notification sent successfully: ${response}`);
        // Handle invalid tokens (optional - cleanup)
        // If token is invalid, remove it from database
    }
    catch (error) {
        if (error.code === "messaging/invalid-registration-token") {
            console.log(`Invalid FCM token for user ${userId}, removing...`);
            await db.collection("parents").doc(userId).update({
                fcm_token: admin.firestore.FieldValue.delete(),
            });
        }
        else {
            console.error(`Error sending FCM notification to ${userId}:`, error);
        }
    }
}
// ============================================================================
// 7. HTTP ENDPOINTS (For Admin/Manual Operations)
// ============================================================================
/**
 * HTTP endpoint to manually recalculate attendance
 *
 * Usage: POST /recalculateAttendance?studentId=xxx&subjectId=yyy
 *
 * @viva Useful for admin corrections and data migration
 */
exports.recalculateAttendance = functions.https.onRequest(async (req, res) => {
    // Enable CORS
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET, POST");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") {
        res.status(204).send("");
        return;
    }
    const studentId = req.query.studentId;
    const subjectId = req.query.subjectId;
    if (!studentId || !subjectId) {
        res.status(400).json({
            error: "Missing required parameters",
            message: "studentId and subjectId are required",
        });
        return;
    }
    try {
        // Get all attendance records
        const attendanceSnapshot = await db
            .collection("attendance")
            .where("student_id", "==", studentId)
            .where("subject_id", "==", subjectId)
            .get();
        let totalClasses = 0;
        let presentCount = 0;
        let absentCount = 0;
        let lateCount = 0;
        attendanceSnapshot.docs.forEach((doc) => {
            const data = doc.data();
            totalClasses++;
            if (data.status === "present") {
                presentCount++;
            }
            else if (data.status === "absent") {
                absentCount++;
            }
            else if (data.status === "late") {
                lateCount++;
                presentCount++;
            }
        });
        const percentage = totalClasses > 0 ? (presentCount / totalClasses) * 100 : 0;
        const roundedPercentage = Math.round(percentage * 100) / 100;
        // Update stats
        await db
            .collection("attendance_stats")
            .doc(`${studentId}_${subjectId}`)
            .set({
            student_id: studentId,
            subject_id: subjectId,
            total_classes: totalClasses,
            present_count: presentCount,
            absent_count: absentCount,
            late_count: lateCount,
            percentage: roundedPercentage,
            last_updated: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        res.json({
            success: true,
            studentId,
            subjectId,
            percentage: roundedPercentage,
            totalClasses,
            presentCount,
            absentCount,
            lateCount,
        });
    }
    catch (error) {
        console.error("Error recalculating attendance:", error);
        res.status(500).json({
            error: "Internal server error",
            message: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
// ============================================================================
// END OF CLOUD FUNCTIONS
// ============================================================================
//# sourceMappingURL=index.js.map