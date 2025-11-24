import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth-helper';
const submissionController = require('@/lib/controllers/submissionController');

export async function POST(request: NextRequest): Promise<NextResponse> {
    const user = verifyToken(request);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        const body = await request.json();

        return new Promise<NextResponse>((resolve) => {
            const mockReq: any = {
                body,
                headers: Object.fromEntries(request.headers.entries()),
                user: user,
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

            submissionController.submitExam(mockReq, mockRes);
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
