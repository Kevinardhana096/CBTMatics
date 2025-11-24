// Helper to verify JWT token in Next.js API routes
import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export interface User {
    id: number;
    email: string;
    role: string;
}

export function verifyToken(request: NextRequest): User | null {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '');
        if (!token) {
            return null;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as User;
        return decoded;
    } catch (err) {
        return null;
    }
}
