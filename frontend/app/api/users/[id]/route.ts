import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth-helper';
const userController = require('@/lib/controllers/userController');

type RouteParams = { params: Promise<{ id: string }> };

async function handleRequest(request: NextRequest, id: string): Promise<NextResponse> {
    return new Promise<NextResponse>(async (resolve) => {
        let body: any = {};
        if (request.method !== 'GET') {
            try {
                body = await request.json();
            } catch (e) { }
        }

        const mockReq: any = {
            method: request.method,
            body,
            params: { id },
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
            userController.getUserById(mockReq, mockRes);
        } else if (request.method === 'PUT') {
            userController.updateUser(mockReq, mockRes);
        } else if (request.method === 'DELETE') {
            userController.deleteUser(mockReq, mockRes);
        }
    });
}

export async function GET(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
    const user = verifyToken(request);
    if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    return handleRequest(request, id);
}

export async function PUT(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
    const user = verifyToken(request);
    if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    return handleRequest(request, id);
}

export async function DELETE(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
    const user = verifyToken(request);
    if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    return handleRequest(request, id);
}
