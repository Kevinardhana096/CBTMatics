import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth-helper';
const userController = require('@/lib/controllers/userController');

async function handleRequest(request: NextRequest): Promise<NextResponse> {
    return new Promise<NextResponse>(async (resolve) => {
        let body: any = {};
        if (request.method !== 'GET') {
            try {
                body = await request.json();
            } catch (e) { }
        }

        const url = new URL(request.url);
        const mockReq: any = {
            method: request.method,
            body,
            query: Object.fromEntries(url.searchParams),
            headers: Object.fromEntries(request.headers.entries()),
            user: (request as any).user,
        };

        const mockRes: any = {
            statusCode: 200,
            status(code: number) {
                this.statusCode = code;
                return this;
            },
            json(data: any) {
                resolve(NextResponse.json(data, { status: this.statusCode }));
            },
        };

        if (request.method === 'GET') {
            userController.getUsers(mockReq, mockRes);
        } else if (request.method === 'POST') {
            userController.createUser(mockReq, mockRes);
        }
    });
}

export async function GET(request: NextRequest): Promise<NextResponse> {
    const user = verifyToken(request);
    if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return handleRequest(request);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
    const user = verifyToken(request);
    if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return handleRequest(request);
}
