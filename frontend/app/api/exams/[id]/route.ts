import { NextRequest, NextResponse } from 'next/server';
const examController = require('@/lib/controllers/examController');

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
            user: null,
        };

        const token = request.headers.get('authorization')?.replace('Bearer ', '');
        if (token) {
            const jwt = require('jsonwebtoken');
            try {
                mockReq.user = jwt.verify(token, process.env.JWT_SECRET || 'secret');
            } catch (e) { }
        }

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

        try {
            if (request.method === 'GET') {
                await examController.getExamById(mockReq, mockRes);
            } else if (request.method === 'PUT') {
                await examController.updateExam(mockReq, mockRes);
            } else if (request.method === 'DELETE') {
                await examController.deleteExam(mockReq, mockRes);
            } else {
                resolve(NextResponse.json({ error: 'Method not allowed' }, { status: 405 }));
            }
        } catch (error: any) {
            resolve(NextResponse.json({ error: error.message }, { status: 500 }));
        }
    });
}

export async function GET(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
    const { id } = await params;
    return handleRequest(request, id);
}

export async function PUT(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
    const { id } = await params;
    return handleRequest(request, id);
}

export async function DELETE(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
    const { id } = await params;
    return handleRequest(request, id);
}
