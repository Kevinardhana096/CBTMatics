import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth-helper';
const examController = require('@/lib/controllers/examController');

export async function GET(request: NextRequest): Promise<NextResponse> {
    try {
        // Verify token and get user
        const user = verifyToken(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        return new Promise<NextResponse>((resolve) => {
            const mockReq: any = {
                headers: Object.fromEntries(request.headers.entries()),
                user: user, // Pass verified user
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

            examController.getAvailableExams(mockReq, mockRes);
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
