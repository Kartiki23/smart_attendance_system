# Error Handling Guide - Smart Attendance System

## 🎯 Overview

This document describes all error scenarios and how they are handled in the Smart Attendance System backend.

---

## 📋 Error Categories

### 1. Authentication Errors

#### Error: "Invalid email or password"
**Cause**: Wrong credentials or user doesn't exist  
**Solution**: 
- Verify email format
- Check if user exists in Firebase Authentication
- Reset password if needed

**Code Location**: `src/hooks/useAuth.tsx` (signIn function)

#### Error: "Email already in use"
**Cause**: Trying to sign up with existing email  
**Solution**: Use sign in instead

**Code Location**: `src/hooks/useAuth.tsx` (signUp function)

#### Error: "Weak password"
**Cause**: Password less than 6 characters  
**Solution**: Use password with at least 6 characters

---

### 2. Session Errors

#### Error: "Session not found"
**Cause**: Invalid session ID or session deleted  
**Solution**: 
- Verify session ID is correct
- Check if session exists in Firestore
- Session may have been deleted

**Code Location**: `src/lib/attendanceService.ts` (verifySession)

#### Error: "Session is not active"
**Cause**: Session status is not "active"  
**Possible Statuses**: "scheduled", "completed", "cancelled"  
**Solution**: 
- Check session status
- Wait for faculty to start session
- Session may have ended

**Code Location**: `src/lib/attendanceService.ts` (verifySession)

#### Error: "QR code has expired"
**Cause**: QR code expiry time has passed  
**Solution**: 
- Faculty needs to refresh QR code
- QR codes expire after 5 minutes (configurable)
- Request new QR code from faculty

**Code Location**: `src/lib/attendanceService.ts` (isQRCodeExpired)

#### Error: "Invalid QR code"
**Cause**: QR code string doesn't match session QR code  
**Solution**: 
- Scan QR code again
- QR code may have been refreshed
- Ensure you're scanning the correct QR code

**Code Location**: `src/lib/attendanceService.ts` (verifySession)

---

### 3. Attendance Errors

#### Error: "You have already marked attendance for this session"
**Cause**: Duplicate attendance attempt  
**Solution**: 
- Attendance already marked
- Check attendance history
- Cannot mark twice for same session

**Code Location**: 
- `src/lib/attendanceService.ts` (checkDuplicateAttendance)
- `firestore.rules` (attendance collection rules)

#### Error: "Student record not found"
**Cause**: Student document doesn't exist in Firestore  
**Solution**: 
- Contact admin to create student record
- Verify user role is "student"
- Check students collection

**Code Location**: `src/lib/attendanceService.ts` (markAttendance)

#### Error: "You are not enrolled in this class"
**Cause**: Student's class_id doesn't match session class_id  
**Solution**: 
- Verify enrollment
- Contact admin if incorrect
- Check students collection

**Code Location**: `src/lib/attendanceService.ts` (markAttendance)

---

### 4. GPS Errors

#### Error: "GPS location is required for this session"
**Cause**: Session requires GPS but location not provided  
**Solution**: 
- Enable GPS on device
- Grant location permissions
- Move to location with GPS signal

**Code Location**: `src/lib/attendanceService.ts` (markAttendance)

#### Error: "You are X meters away from the classroom"
**Cause**: Student outside allowed GPS radius  
**Default Radius**: 50 meters  
**Solution**: 
- Move closer to classroom
- Check if correct classroom location
- Contact faculty if issue persists

**Code Location**: 
- `src/lib/attendanceService.ts` (verifyGPSLocation)
- `src/lib/attendanceService.ts` (calculateDistance)

#### Error: "Session location not set"
**Cause**: Faculty didn't set classroom location  
**Solution**: 
- Contact faculty to set location
- Faculty should enable GPS when starting session

**Code Location**: `src/lib/attendanceService.ts` (verifyGPSLocation)

#### Error: "Location access denied"
**Cause**: User denied location permission  
**Solution**: 
- Enable location in device settings
- Grant permission when prompted
- Required for GPS-validated sessions

**Code Location**: `src/components/QRScanner.tsx` (requestLocation)

---

### 5. Permission Errors

#### Error: "Permission denied"
**Cause**: Security rules blocked the operation  
**Common Causes**:
- User not authenticated
- Wrong role
- Trying to access other user's data
- Missing required fields

**Solution**: 
- Check user is logged in
- Verify user role in `user_roles` collection
- Check Security Rules
- Verify you have permission for the operation

**Code Location**: `firestore.rules`

#### Error: "Missing required fields"
**Cause**: Required document fields not provided  
**Solution**: 
- Check all required fields are included
- Verify field names match schema
- Check data types

---

### 6. Network Errors

#### Error: "Network error. Please check your internet connection"
**Cause**: No internet or connection timeout  
**Solution**: 
- Check internet connection
- Try again when connection is stable
- Offline persistence will queue operations

**Code Location**: `src/hooks/useAuth.tsx`

#### Error: "Failed to mark attendance"
**Cause**: Network error during attendance marking  
**Solution**: 
- Check internet connection
- Try again
- Offline mode will sync when online

**Code Location**: `src/lib/attendanceService.ts` (markAttendance)

---

### 7. Cloud Functions Errors

#### Error: "Error auto-marking absentees"
**Cause**: Cloud Function failed  
**Check**: 
- Cloud Functions logs in Firebase Console
- Verify function is deployed
- Check Firestore permissions

**Code Location**: `functions/src/index.ts` (autoMarkAbsentees)

#### Error: "Error calculating attendance percentage"
**Cause**: Cloud Function failed  
**Check**: 
- Cloud Functions logs
- Verify attendance records exist
- Check function deployment

**Code Location**: `functions/src/index.ts` (calculateAttendancePercentage)

---

### 8. FCM Notification Errors

#### Error: "No FCM token found"
**Cause**: User hasn't registered FCM token  
**Solution**: 
- Ensure FCM is configured in app
- Token is saved to Firestore
- Check `parents` collection for `fcm_token`

**Code Location**: `functions/src/index.ts` (sendFCMNotification)

#### Error: "Invalid FCM token"
**Cause**: FCM token is expired or invalid  
**Solution**: 
- Token is automatically removed
- App should refresh token
- Re-register device

**Code Location**: `functions/src/index.ts` (sendFCMNotification)

---

## 🔧 Error Handling Best Practices

### 1. Client-Side Validation

**Before API Calls:**
- Validate email format
- Check password length
- Verify required fields
- Check GPS availability

**Code Example**:
```typescript
if (!email || !email.includes('@')) {
  return { error: new Error('Please enter a valid email address') };
}
```

### 2. Server-Side Validation

**Security Rules:**
- Validate data structure
- Check user permissions
- Verify required fields
- Prevent duplicate operations

### 3. User-Friendly Messages

**Don't Show:**
- Technical error codes
- Stack traces
- Internal error messages

**Do Show:**
- Clear, actionable messages
- What went wrong
- How to fix it

**Example**:
```typescript
// Bad
"Error: PERMISSION_DENIED: Missing or insufficient permissions."

// Good
"You don't have permission to perform this action. Please contact your administrator."
```

### 4. Error Logging

**Log for Debugging:**
- Full error details in console
- Error codes
- Stack traces
- User context

**Code Example**:
```typescript
catch (error) {
  console.error("Error marking attendance:", error);
  // Show user-friendly message
  return { success: false, message: "Failed to mark attendance" };
}
```

---

## 📱 Mobile-Specific Error Handling

### 1. Offline Errors

**Handle Gracefully:**
- Queue operations when offline
- Sync when online
- Show offline indicator
- Cache data for offline access

### 2. GPS Errors

**Provide Alternatives:**
- Allow manual location entry (if permitted)
- Show clear error message
- Guide user to enable GPS

### 3. Camera Errors

**Fallback Options:**
- Manual QR code entry
- Copy-paste QR code
- Show clear instructions

---

## 🧪 Testing Error Scenarios

### Test Cases:

1. **Invalid Credentials**
   - Wrong email
   - Wrong password
   - Non-existent user

2. **Expired QR Code**
   - Wait for QR to expire
   - Try to scan
   - Verify error message

3. **Duplicate Attendance**
   - Mark attendance once
   - Try to mark again
   - Verify duplicate error

4. **GPS Out of Range**
   - Start session with GPS
   - Try to mark from far away
   - Verify distance error

5. **Permission Denied**
   - Try to access other user's data
   - Verify security rules block
   - Check error message

---

## 📝 Error Messages Reference

| Error Code | User Message | Solution |
|------------|--------------|----------|
| `auth/user-not-found` | "Invalid email or password" | Check credentials |
| `auth/wrong-password` | "Invalid email or password" | Check password |
| `auth/email-already-in-use` | "Email already registered" | Use sign in |
| `auth/weak-password` | "Password too weak" | Use 6+ characters |
| `permission-denied` | "Permission denied" | Check role/permissions |
| `not-found` | "Resource not found" | Verify ID exists |
| `invalid-argument` | "Invalid data provided" | Check input format |
| `unavailable` | "Service unavailable" | Try again later |

---

## 🎓 For Viva

**Key Points:**

1. **Error Prevention**:
   - Client-side validation
   - Security rules
   - Input sanitization

2. **Error Handling**:
   - Try-catch blocks
   - User-friendly messages
   - Error logging

3. **Error Recovery**:
   - Retry mechanisms
   - Offline support
   - Graceful degradation

4. **Security**:
   - Don't expose sensitive errors
   - Log for debugging
   - Validate on server

---

**Last Updated**: January 2025  
**Version**: 1.0.0

