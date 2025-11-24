import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { verifyToken } from '@/lib/auth-helper';
const questionController = require('@/lib/controllers/questionController');

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        // Verify authentication
        const user = verifyToken(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file');

        if (!file || !(file instanceof File)) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Create uploads directory matching controller's expected path
        // Controller uses: path.join(__dirname, '../../uploads')
        // From lib/controllers -> goes up 2 levels to root, then uploads/
        const uploadDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Also ensure public/uploads/questions exists for images
        const questionsImagesDir = path.join(process.cwd(), 'public', 'uploads', 'questions');
        if (!fs.existsSync(questionsImagesDir)) {
            fs.mkdirSync(questionsImagesDir, { recursive: true });
        }

        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = 'questions-' + uniqueSuffix + path.extname(file.name);
        const filepath = path.join(uploadDir, filename);

        // Write file to disk
        const buffer = Buffer.from(await file.arrayBuffer());
        fs.writeFileSync(filepath, buffer);

        return new Promise<NextResponse>((resolve) => {
            const mockReq: any = {
                file: {
                    originalname: file.name,
                    mimetype: file.type,
                    size: file.size,
                    filename: filename,
                    path: filepath,
                    buffer: buffer,
                },
                body: {},
                headers: Object.fromEntries(request.headers.entries()),
                user: user, // From JWT token
            };

            const mockRes: any = {
                statusCode: 200,
                status(code: number) {
                    this.statusCode = code;
                    return this;
                },
                json(data: any) {
                    // Clean up uploaded file
                    try {
                        if (fs.existsSync(filepath)) {
                            fs.unlinkSync(filepath);
                        }
                    } catch (err) {
                        console.error('Error deleting temp file:', err);
                    }
                    resolve(NextResponse.json(data, { status: this.statusCode }));
                },
            };

            questionController.importQuestions(mockReq, mockRes);
        });
    } catch (error: any) {
        console.error('Error in import:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
