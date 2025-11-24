import { NextRequest, NextResponse } from 'next/server';
const examController = require('@/lib/controllers/examController');

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
            query: Object.fromEntries(url.searchParams.entries()),
            params: {},
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
                await examController.getAllExams(mockReq, mockRes);
            } else if (request.method === 'POST') {
                await examController.createExam(mockReq, mockRes);
            } else {
                resolve(NextResponse.json({ error: 'Method not allowed' }, { status: 405 }));
            }
        } catch (error: any) {
            resolve(NextResponse.json({ error: error.message }, { status: 500 }));
        }
    });
}

export async function GET(request: NextRequest): Promise<NextResponse> {
    return handleRequest(request);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
    return handleRequest(request);
}
