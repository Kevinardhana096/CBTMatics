import { NextRequest, NextResponse } from 'next/server';
const questionController = require('@/lib/controllers/questionController');

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        // Get form data (for file upload)
        const formData = await request.formData();

        return new Promise<NextResponse>((resolve) => {
            const mockReq: any = {
                body: {},
                files: {},
                headers: Object.fromEntries(request.headers.entries()),
                user: (request as any).user,
            };

            // Convert FormData to express-like format
            const file = formData.get('file');
            if (file && file instanceof File) {
                mockReq.file = {
                    originalname: file.name,
                    mimetype: file.type,
                    size: file.size,
                    buffer: null, // Will be set below
                    path: null,
                };

                // Read file buffer
                file.arrayBuffer().then(buffer => {
                    mockReq.file.buffer = Buffer.from(buffer);
                    
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

                    questionController.importQuestions(mockReq, mockRes);
                });
            } else {
                resolve(NextResponse.json({ error: 'No file uploaded' }, { status: 400 }));
            }
        });
    } catch (error: any) {
        console.error('Error in import:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
