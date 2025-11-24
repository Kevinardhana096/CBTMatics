import { NextRequest, NextResponse } from 'next/server';
const questionController = require('@/lib/controllers/questionController');

async function handleRequest(request: NextRequest, id?: string) {
    return new Promise(async (resolve) => {
        let body: any = {};
        if (request.method !== 'GET') {
            try {
                body = await request.json();
            } catch (e) {}
        }
        
        const url = new URL(request.url);
        const mockReq: any = {
            method: request.method,
            body,
            query: Object.fromEntries(url.searchParams.entries()),
            params: id ? { id } : {},
            headers: Object.fromEntries(request.headers.entries()),
            user: null,
        };
        
        // Extract token and set user
        const token = request.headers.get('authorization')?.replace('Bearer ', '');
        if (token) {
            const jwt = require('jsonwebtoken');
            try {
                mockReq.user = jwt.verify(token, process.env.JWT_SECRET || 'secret');
            } catch (e) {}
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
            if (request.method === 'GET' && !id) {
                await questionController.getAllQuestions(mockReq, mockRes);
            } else if (request.method === 'GET' && id) {
                await questionController.getQuestionById(mockReq, mockRes);
            } else if (request.method === 'POST') {
                await questionController.createQuestion(mockReq, mockRes);
            } else if (request.method === 'PUT' && id) {
                await questionController.updateQuestion(mockReq, mockRes);
            } else if (request.method === 'DELETE' && id) {
                await questionController.deleteQuestion(mockReq, mockRes);
            } else {
                resolve(NextResponse.json({ error: 'Method not allowed' }, { status: 405 }));
            }
        } catch (error: any) {
            resolve(NextResponse.json({ error: error.message }, { status: 500 }));
        }
    });
}

export async function GET(request: NextRequest) {
    return handleRequest(request);
}

export async function POST(request: NextRequest) {
    return handleRequest(request);
}
