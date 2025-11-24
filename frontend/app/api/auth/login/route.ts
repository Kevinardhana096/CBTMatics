import { NextRequest, NextResponse } from 'next/server';
const authController = require('@/lib/controllers/authController');

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        return new Promise((resolve) => {
            const mockReq: any = {
                body,
                headers: Object.fromEntries(request.headers.entries()),
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

            authController.login(mockReq, mockRes);
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
