/**
 * Firebase Helper Class for Android (Kotlin)
 * 
 * This class provides all Firebase operations needed for the Smart Attendance System
 * Optimized for mobile performance with offline support and batch operations
 * 
 * @author Smart Attendance System
 * @version 1.0.0
 */

package com.attendance.firebase

import android.util.Log
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseUser
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.SetOptions
import com.google.firebase.messaging.FirebaseMessaging
import kotlinx.coroutines.tasks.await
import java.util.*

class FirebaseHelper {
    
    companion object {
        private const val TAG = "FirebaseHelper"
        
        // Collection names
        private const val COLLECTION_USERS = "users"
        private const val COLLECTION_USER_ROLES = "user_roles"
        private const val COLLECTION_STUDENTS = "students"
        private const val COLLECTION_FACULTY = "faculty"
        private const val COLLECTION_PARENTS = "parents"
        private const val COLLECTION_SUBJECTS = "subjects"
        private const val COLLECTION_CLASSES = "classes"
        private const val COLLECTION_LECTURE_SESSIONS = "lecture_sessions"
        private const val COLLECTION_ATTENDANCE = "attendance"
        private const val COLLECTION_ATTENDANCE_STATS = "attendance_stats"
        private const val COLLECTION_NOTIFICATIONS = "notifications"
    }
    
    private val auth = FirebaseAuth.getInstance()
    private val db = FirebaseFirestore.getInstance()
    
    // Enable offline persistence for better mobile performance
    init {
        // Enable offline persistence (caches data locally)
        db.firestoreSettings = FirebaseFirestoreSettings.Builder()
            .setPersistenceEnabled(true)
            .build()
    }
    
    // ============================================================================
    // AUTHENTICATION METHODS
    // ============================================================================
    
    /**
     * Sign in with email and password
     * 
     * @param email User email
     * @param password User password
     * @return FirebaseUser if successful, null otherwise
     * 
     * @viva Handles authentication and error cases
     */
    suspend fun signIn(email: String, password: String): FirebaseUser? {
        return try {
            val result = auth.signInWithEmailAndPassword(email, password).await()
            result.user
        } catch (e: Exception) {
            Log.e(TAG, "Sign in error: ${e.message}")
            null
        }
    }
    
    /**
     * Sign up new user
     * 
     * @param email User email
     * @param password User password
     * @param fullName User full name
     * @param role User role (admin, faculty, student, parent)
     * @return FirebaseUser if successful, null otherwise
     */
    suspend fun signUp(
        email: String,
        password: String,
        fullName: String,
        role: String = "student"
    ): FirebaseUser? {
        return try {
            // Create auth user
            val result = auth.createUserWithEmailAndPassword(email, password).await()
            val user = result.user ?: return null
            
            // Create user profile
            val userData = hashMapOf(
                "name" to fullName,
                "email" to email,
                "created_at" to com.google.firebase.Timestamp.now(),
                "updated_at" to com.google.firebase.Timestamp.now()
            )
            db.collection(COLLECTION_USERS).document(user.uid).set(userData).await()
            
            // Create user role
            val roleData = hashMapOf(
                "user_id" to user.uid,
                "role" to role,
                "assigned_at" to com.google.firebase.Timestamp.now()
            )
            db.collection(COLLECTION_USER_ROLES).document(user.uid).set(roleData).await()
            
            user
        } catch (e: Exception) {
            Log.e(TAG, "Sign up error: ${e.message}")
            null
        }
    }
    
    /**
     * Sign out current user
     */
    fun signOut() {
        auth.signOut()
    }
    
    /**
     * Get current user
     */
    fun getCurrentUser(): FirebaseUser? {
        return auth.currentUser
    }
    
    /**
     * Get user role
     * 
     * @param userId User UID
     * @return User role or null
     */
    suspend fun getUserRole(userId: String): String? {
        return try {
            val doc = db.collection(COLLECTION_USER_ROLES)
                .document(userId)
                .get()
                .await()
            doc.getString("role")
        } catch (e: Exception) {
            Log.e(TAG, "Get user role error: ${e.message}")
            null
        }
    }
    
    // ============================================================================
    // ATTENDANCE METHODS (CORE FUNCTIONALITY)
    // ============================================================================
    
    /**
     * Mark attendance for a student
     * 
     * This is the MAIN function that handles attendance marking with all validations
     * 
     * @param studentId Student UID
     * @param sessionId Session ID from QR code
     * @param qrCode QR code string
     * @param latitude Student GPS latitude
     * @param longitude Student GPS longitude
     * @return AttendanceResult with success status and message
     * 
     * @viva This function implements all security checks: QR validation, GPS, duplicate prevention
     */
    suspend fun markAttendance(
        studentId: String,
        sessionId: String,
        qrCode: String,
        latitude: Double? = null,
        longitude: Double? = null
    ): AttendanceResult {
        return try {
            // 1. Verify session exists and is active
            val sessionDoc = db.collection(COLLECTION_LECTURE_SESSIONS)
                .document(sessionId)
                .get()
                .await()
            
            if (!sessionDoc.exists()) {
                return AttendanceResult(
                    success = false,
                    message = "Session not found"
                )
            }
            
            val sessionData = sessionDoc.data() ?: return AttendanceResult(
                success = false,
                message = "Invalid session data"
            )
            
            // 2. Check session status
            val status = sessionData["status"] as? String
            if (status != "active") {
                return AttendanceResult(
                    success = false,
                    message = "Session is not active"
                )
            }
            
            // 3. Verify QR code matches
            val sessionQRCode = sessionData["qr_code"] as? String
            if (sessionQRCode != qrCode) {
                return AttendanceResult(
                    success = false,
                    message = "Invalid QR code"
                )
            }
            
            // 4. Check QR code expiry
            val expiresAt = sessionDoc.getTimestamp("qr_expires_at")
            if (expiresAt != null && expiresAt.toDate().before(Date())) {
                return AttendanceResult(
                    success = false,
                    message = "QR code has expired"
                )
            }
            
            // 5. Check for duplicate attendance
            val existingAttendance = db.collection(COLLECTION_ATTENDANCE)
                .whereEqualTo("student_id", studentId)
                .whereEqualTo("session_id", sessionId)
                .limit(1)
                .get()
                .await()
            
            if (!existingAttendance.isEmpty) {
                return AttendanceResult(
                    success = false,
                    message = "You have already marked attendance for this session"
                )
            }
            
            // 6. Verify GPS location if required
            val gpsRequired = sessionData["gps_required"] as? Boolean ?: false
            if (gpsRequired) {
                if (latitude == null || longitude == null) {
                    return AttendanceResult(
                        success = false,
                        message = "GPS location is required for this session"
                    )
                }
                
                val sessionLat = (sessionData["location_lat"] as? Double) ?: return AttendanceResult(
                    success = false,
                    message = "Session location not set"
                )
                val sessionLng = (sessionData["location_lng"] as? Double) ?: return AttendanceResult(
                    success = false,
                    message = "Session location not set"
                )
                
                val radius = (sessionData["gps_radius_meters"] as? Long)?.toDouble() ?: 50.0
                val distance = calculateDistance(latitude, longitude, sessionLat, sessionLng)
                
                if (distance > radius) {
                    return AttendanceResult(
                        success = false,
                        message = "You are ${distance.toInt()}m away from the classroom. Please move closer."
                    )
                }
            }
            
            // 7. Verify student is enrolled in the class
            val studentDoc = db.collection(COLLECTION_STUDENTS)
                .document(studentId)
                .get()
                .await()
            
            if (!studentDoc.exists()) {
                return AttendanceResult(
                    success = false,
                    message = "Student record not found"
                )
            }
            
            val studentClassId = studentDoc.getString("class_id")
            val sessionClassId = sessionData["class_id"] as? String
            
            if (studentClassId != sessionClassId) {
                return AttendanceResult(
                    success = false,
                    message = "You are not enrolled in this class"
                )
            }
            
            // 8. Create attendance record
            val attendanceData = hashMapOf(
                "student_id" to studentId,
                "session_id" to sessionId,
                "subject_id" to (sessionData["subject_id"] as? String ?: ""),
                "faculty_id" to (sessionData["faculty_id"] as? String ?: ""),
                "status" to "present",
                "timestamp" to com.google.firebase.Timestamp.now(),
                "marked_at" to com.google.firebase.Timestamp.now(),
                "is_verified" to true,
                "qr_code" to qrCode,
                "created_at" to com.google.firebase.Timestamp.now()
            )
            
            if (latitude != null && longitude != null) {
                attendanceData["location_lat"] = latitude
                attendanceData["location_lng"] = longitude
                val sessionLat = sessionData["location_lat"] as? Double
                val sessionLng = sessionData["location_lng"] as? Double
                if (sessionLat != null && sessionLng != null) {
                    val distance = calculateDistance(latitude, longitude, sessionLat, sessionLng)
                    attendanceData["distance_meters"] = distance
                }
            }
            
            val attendanceRef = db.collection(COLLECTION_ATTENDANCE).document()
            attendanceRef.set(attendanceData).await()
            
            AttendanceResult(
                success = true,
                message = "Attendance marked successfully",
                attendanceId = attendanceRef.id
            )
            
        } catch (e: Exception) {
            Log.e(TAG, "Mark attendance error: ${e.message}")
            AttendanceResult(
                success = false,
                message = "Failed to mark attendance: ${e.message}"
            )
        }
    }
    
    /**
     * Calculate distance between two GPS coordinates (Haversine formula)
     * 
     * @param lat1 Latitude 1
     * @param lon1 Longitude 1
     * @param lat2 Latitude 2
     * @param lon2 Longitude 2
     * @return Distance in meters
     * 
     * @viva This formula is accurate for short distances (classroom radius)
     */
    private fun calculateDistance(
        lat1: Double,
        lon1: Double,
        lat2: Double,
        lon2: Double
    ): Double {
        val R = 6371000.0 // Earth radius in meters
        val dLat = Math.toRadians(lat2 - lat1)
        val dLon = Math.toRadians(lon2 - lon1)
        val a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2)
        val c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        return R * c
    }
    
    // ============================================================================
    // FACULTY METHODS
    // ============================================================================
    
    /**
     * Start a new lecture session
     * 
     * @param facultyId Faculty UID
     * @param subjectId Subject ID
     * @param classId Class ID
     * @param qrCode Generated QR code
     * @param expiresInMinutes QR code validity in minutes
     * @param latitude Classroom latitude (optional)
     * @param longitude Classroom longitude (optional)
     * @param gpsRequired Whether GPS validation is required
     * @return Session ID if successful, null otherwise
     */
    suspend fun startSession(
        facultyId: String,
        subjectId: String,
        classId: String,
        qrCode: String,
        expiresInMinutes: Int = 5,
        latitude: Double? = null,
        longitude: Double? = null,
        gpsRequired: Boolean = true
    ): String? {
        return try {
            val now = Date()
            val expiresAt = Date(now.time + expiresInMinutes * 60 * 1000L)
            
            val sessionData = hashMapOf(
                "subject_id" to subjectId,
                "class_id" to classId,
                "faculty_id" to facultyId,
                "status" to "active",
                "start_time" to com.google.firebase.Timestamp.now(),
                "qr_code" to qrCode,
                "qr_expires_at" to com.google.firebase.Timestamp(expiresAt),
                "gps_required" to gpsRequired,
                "gps_radius_meters" to 50L,
                "created_at" to com.google.firebase.Timestamp.now(),
                "updated_at" to com.google.firebase.Timestamp.now()
            )
            
            if (latitude != null && longitude != null) {
                sessionData["location_lat"] = latitude
                sessionData["location_lng"] = longitude
            }
            
            val sessionRef = db.collection(COLLECTION_LECTURE_SESSIONS).document()
            sessionRef.set(sessionData).await()
            
            sessionRef.id
        } catch (e: Exception) {
            Log.e(TAG, "Start session error: ${e.message}")
            null
        }
    }
    
    /**
     * End a lecture session
     * 
     * @param sessionId Session ID
     * @return true if successful
     */
    suspend fun endSession(sessionId: String): Boolean {
        return try {
            db.collection(COLLECTION_LECTURE_SESSIONS)
                .document(sessionId)
                .update(
                    mapOf(
                        "status" to "completed",
                        "end_time" to com.google.firebase.Timestamp.now(),
                        "updated_at" to com.google.firebase.Timestamp.now()
                    )
                )
                .await()
            true
        } catch (e: Exception) {
            Log.e(TAG, "End session error: ${e.message}")
            false
        }
    }
    
    // ============================================================================
    // DATA FETCHING METHODS (Optimized for Mobile)
    // ============================================================================
    
    /**
     * Get student attendance statistics
     * 
     * Uses cached data when offline (offline persistence enabled)
     * 
     * @param studentId Student UID
     * @param subjectId Subject ID (optional, null for overall stats)
     * @return AttendanceStats object
     */
    suspend fun getAttendanceStats(
        studentId: String,
        subjectId: String? = null
    ): AttendanceStats? {
        return try {
            if (subjectId != null) {
                // Get subject-specific stats
                val doc = db.collection(COLLECTION_ATTENDANCE_STATS)
                    .document("${studentId}_${subjectId}")
                    .get()
                    .await()
                
                if (doc.exists()) {
                    AttendanceStats(
                        studentId = doc.getString("student_id") ?: "",
                        subjectId = doc.getString("subject_id") ?: "",
                        totalClasses = (doc.getLong("total_classes") ?: 0L).toInt(),
                        presentCount = (doc.getLong("present_count") ?: 0L).toInt(),
                        absentCount = (doc.getLong("absent_count") ?: 0L).toInt(),
                        percentage = (doc.getDouble("percentage") ?: 0.0).toFloat()
                    )
                } else {
                    null
                }
            } else {
                // Get overall stats from students collection
                val doc = db.collection(COLLECTION_STUDENTS)
                    .document(studentId)
                    .get()
                    .await()
                
                if (doc.exists()) {
                    AttendanceStats(
                        studentId = studentId,
                        subjectId = "",
                        totalClasses = 0,
                        presentCount = 0,
                        absentCount = 0,
                        percentage = (doc.getDouble("attendance_percentage") ?: 0.0).toFloat()
                    )
                } else {
                    null
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Get attendance stats error: ${e.message}")
            null
        }
    }
    
    /**
     * Get recent attendance records
     * 
     * @param studentId Student UID
     * @param limit Number of records to fetch
     * @return List of attendance records
     */
    suspend fun getRecentAttendance(
        studentId: String,
        limit: Int = 10
    ): List<AttendanceRecord> {
        return try {
            val snapshot = db.collection(COLLECTION_ATTENDANCE)
                .whereEqualTo("student_id", studentId)
                .orderBy("timestamp", com.google.firebase.firestore.Query.Direction.DESCENDING)
                .limit(limit.toLong())
                .get()
                .await()
            
            snapshot.documents.map { doc ->
                AttendanceRecord(
                    id = doc.id,
                    sessionId = doc.getString("session_id") ?: "",
                    subjectId = doc.getString("subject_id") ?: "",
                    status = doc.getString("status") ?: "absent",
                    timestamp = doc.getTimestamp("timestamp")?.toDate() ?: Date()
                )
            }
        } catch (e: Exception) {
            Log.e(TAG, "Get recent attendance error: ${e.message}")
            emptyList()
        }
    }
    
    // ============================================================================
    // FCM TOKEN MANAGEMENT
    // ============================================================================
    
    /**
     * Save FCM token for push notifications
     * 
     * @param userId User UID
     * @param token FCM token
     */
    suspend fun saveFCMToken(userId: String, token: String) {
        try {
            db.collection(COLLECTION_PARENTS)
                .document(userId)
                .update("fcm_token", token)
                .await()
            Log.d(TAG, "FCM token saved for user $userId")
        } catch (e: Exception) {
            Log.e(TAG, "Save FCM token error: ${e.message}")
        }
    }
    
    /**
     * Get FCM token
     * 
     * @return FCM token or null
     */
    suspend fun getFCMToken(): String? {
        return try {
            FirebaseMessaging.getInstance().token.await()
        } catch (e: Exception) {
            Log.e(TAG, "Get FCM token error: ${e.message}")
            null
        }
    }
    
    // ============================================================================
    // DATA CLASSES
    // ============================================================================
    
    data class AttendanceResult(
        val success: Boolean,
        val message: String,
        val attendanceId: String? = null
    )
    
    data class AttendanceStats(
        val studentId: String,
        val subjectId: String,
        val totalClasses: Int,
        val presentCount: Int,
        val absentCount: Int,
        val percentage: Float
    )
    
    data class AttendanceRecord(
        val id: String,
        val sessionId: String,
        val subjectId: String,
        val status: String,
        val timestamp: Date
    )
}

