import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5172/api';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);


// // Mark attendance manually
// export const markAttendance = (data) =>
//   api.post("/attendance/mark", data);


// // Get student attendance history
// export const getAttendanceHistory = () =>
//   api.get("/attendance/history");


// // Get subject stats
// export const getAttendanceStats = () =>
//   api.get("/attendance/stats");


// // Generate QR
// export const generateQR = (data) =>
//   api.post("/attendance/generate-qr", data);


// // Scan QR
// export const scanQR = (data) =>
//   api.post("/attendance/scan", data);


// // Faculty attendance view
// export const getFacultyAttendance = () =>
//   api.get("/attendance/faculty/attendance");

export default api;
