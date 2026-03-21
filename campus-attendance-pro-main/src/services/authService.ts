import api from './api';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    fullName: string;
    email: string;
    password: string;
    role?: 'admin' | 'faculty' | 'student' | 'parent';
}

export interface AuthResponse {
    success: boolean;
    token: string;
    user: {
        id: string;
        fullName: string;
        email: string;
        role: string;
        avatar_url?: string;
    };
}

class AuthService {
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const response = await api.post('/auth/login', credentials);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    }

    async register(data: RegisterData): Promise<AuthResponse> {
        const response = await api.post('/auth/register', data);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    }

    async getMe(): Promise<AuthResponse> {
        const response = await api.get('/auth/me');
        return response.data;
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }

    getToken() {
        return localStorage.getItem('token');
    }
}

export default new AuthService();
