import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth-helper';
const submissionController = require('@/lib/controllers/submissionController');

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    try {
        const user = verifyToken(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        return new Promise<NextResponse>((resolve) => {
            const mockReq: any = {
                params: { id },
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

            submissionController.getSubmissionById(mockReq, mockRes);
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
