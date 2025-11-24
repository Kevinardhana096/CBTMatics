import { NextRequest, NextResponse } from 'next/server';

// Simple middleware to handle Express-like middleware in Next.js
export function runMiddleware(req: NextRequest, res: any, fn: Function) {
    return new Promise((resolve, reject) => {
        fn(req, res, (result: any) => {
            if (result instanceof Error) {
                return reject(result);
            }
            return resolve(result);
        });
    });
}

// Convert Express handler to Next.js API handler
export function expressToNextAPI(expressApp: any) {
    return async (req: NextRequest) => {
        return new Promise((resolve) => {
            const mockRes = {
                statusCode: 200,
                headers: new Headers(),
                body: null as any,
                status(code: number) {
                    this.statusCode = code;
                    return this;
                },
                json(data: any) {
                    this.body = data;
                    resolve(NextResponse.json(data, { status: this.statusCode }));
                    return this;
                },
                send(data: any) {
                    this.body = data;
                    resolve(new NextResponse(data, { status: this.statusCode }));
                    return this;
                },
                setHeader(key: string, value: string) {
                    this.headers.set(key, value);
                    return this;
                }
            };

            expressApp(req, mockRes);
        });
    };
}
