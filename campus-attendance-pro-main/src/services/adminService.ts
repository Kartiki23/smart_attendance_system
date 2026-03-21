import api from './api';

export interface User {
    _id: string;
    fullName: string;
    email: string;
    role: 'admin' | 'faculty' | 'student' | 'parent';
    avatar_url?: string;
    createdAt: string;
}

export interface Class {
    _id: string;
    name: string;
    department: string;
    semester: number;
    academicYear: string;
}

export interface Subject {
    _id: string;
    name: string;
    code: string;
    department: string;
    credits: number;
    semester: number;
}

export interface DashboardStats {
    totalUsers: number;
    totalStudents: number;
    totalFaculty: number;
    totalClasses: number;
    totalSubjects: number;
}

class AdminService {
    // User Management
    async getAllUsers(): Promise<User[]> {
        const response = await api.get('/admin/users');
        return response.data.users;
    }

    async createUser(userData: {
  fullName: string;
  email: string;
  password: string;
  role: "admin" | "faculty" | "student" | "parent";
  department?: string;
  employeeId?: string;
  rollNo?: string;
  semester?: number;
  studentRollNumber?: string;
  relation?: "Father" | "Mother" | "Guardian";
  contactNumber?: string;
}): Promise<User> {
  const response = await api.post("/admin/users", userData);
  return response.data.user;
}

    async updateUserRole(userId: string, role: string): Promise<User> {
        const response = await api.put(`/admin/users/${userId}/role`, { role });
        return response.data.user;
    }

    async deleteUser(userId: string): Promise<void> {
        await api.delete(`/admin/users/${userId}`);
    }

    // Class Management
    async getAllClasses(): Promise<Class[]> {
        const response = await api.get('/admin/classes');
        return response.data.classes;
    }

    async createClass(classData: Partial<Class>): Promise<Class> {
        const response = await api.post('/admin/classes', classData);
        return response.data.class;
    }

    // Subject Management
    async getAllSubjects(): Promise<Subject[]> {
        const response = await api.get('/admin/subjects');
        return response.data.subjects;
    }

    async createSubject(subjectData: Partial<Subject>): Promise<Subject> {
        const response = await api.post('/admin/subjects', subjectData);
        return response.data.subject;
    }

    // Dashboard Stats
    async getDashboardStats(): Promise<DashboardStats> {
        const response = await api.get('/admin/stats');
        return response.data.stats;
    }
}

export default new AdminService();
