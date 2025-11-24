import { NextRequest, NextResponse } from 'next/server';
const questionController = require('@/lib/controllers/questionController');

export async function GET(request: NextRequest): Promise<NextResponse> {
    try {
        return new Promise<NextResponse>((resolve) => {
            const mockReq: any = {
                query: Object.fromEntries(request.nextUrl.searchParams.entries()),
                headers: Object.fromEntries(request.headers.entries()),
                user: (request as any).user,
            };

            const mockRes: any = {
                statusCode: 200,
                headers: {} as Record<string, string>,
                status(code: number) {
                    this.statusCode = code;
                    return this;
                },
                setHeader(name: string, value: string) {
                    this.headers[name] = value;
                    return this;
                },
                send(data: any) {
                    const headers = new Headers(this.headers);
                    resolve(new NextResponse(data, { 
                        status: this.statusCode,
                        headers 
                    }));
                },
                json(data: any) {
                    resolve(NextResponse.json(data, { status: this.statusCode }));
                },
            };

            questionController.exportQuestions(mockReq, mockRes);
        });
    } catch (error: any) {
        console.error('Error in export:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
