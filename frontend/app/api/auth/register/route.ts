import { NextRequest, NextResponse } from 'next/server';
const authController = require('@/lib/controllers/authController');

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const body = await request.json();

        return new Promise<NextResponse>((resolve) => {
            const mockReq: any = {
                body,
                headers: Object.fromEntries(request.headers.entries()),
            };

            const mockRes: any = {
                statusCode: 201,
                status(code: number) {
                    this.statusCode = code;
                    return this;
                },
                json(data: any) {
                    resolve(NextResponse.json(data, { status: this.statusCode }));
                },
            };

            authController.register(mockReq, mockRes);
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
