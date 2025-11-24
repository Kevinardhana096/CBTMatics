import { NextRequest, NextResponse } from 'next/server';
const examController = require('@/lib/controllers/examController');

export async function GET(request: NextRequest): Promise<NextResponse> {
    try {
        return new Promise<NextResponse>((resolve) => {
            const mockReq: any = {
                headers: Object.fromEntries(request.headers.entries()),
                user: (request as any).user, // From auth middleware
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
