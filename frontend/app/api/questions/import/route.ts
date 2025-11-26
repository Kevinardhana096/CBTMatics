import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { verifyToken } from '@/lib/auth-helper';
import { createClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';

// Lazy Supabase client
function getSupabase() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase configuration missing');
    }
    return createClient(supabaseUrl, supabaseKey);
}

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

        const buffer = Buffer.from(await file.arrayBuffer());
        const fileExt = path.extname(file.name).toLowerCase();

        let questions: any[] = [];

        // Process CSV or Excel file in memory
        if (fileExt === '.csv') {
            const csvContent = buffer.toString('utf8');
            questions = parseCSV(csvContent);
        } else if (fileExt === '.xlsx' || fileExt === '.xls') {
            const workbook = XLSX.read(buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            questions = parseExcelData(jsonData);
        } else if (fileExt === '.zip') {
            // ZIP files with images are not supported in serverless environment
            return NextResponse.json({
                error: 'ZIP files are not supported in production. Please use CSV or Excel files without images, or add images after import.'
            }, { status: 400 });
        } else {
            return NextResponse.json({ error: 'Unsupported file format. Use CSV or Excel.' }, { status: 400 });
        }

        if (questions.length === 0) {
            return NextResponse.json({ error: 'No valid questions found in file' }, { status: 400 });
        }

        // Insert questions to Supabase
        const supabase = getSupabase();
        let successCount = 0;
        let errorCount = 0;
        const errors: string[] = [];

        for (const q of questions) {
            try {
                const { error: insertError } = await supabase
                    .from('questions')
                    .insert([{
                        question_text: q.question_text,
                        question_type: q.question_type || 'multiple_choice',
                        options: q.options,
                        correct_answer: q.correct_answer,
                        subject: q.subject || 'General',
                        difficulty: q.difficulty || 'medium',
                        points: q.points || 10,
                        created_by: user.id
                    }]);

                if (insertError) {
                    errorCount++;
                    errors.push(`Row error: ${insertError.message}`);
                } else {
                    successCount++;
                }
            } catch (err: any) {
                errorCount++;
                errors.push(`Error: ${err.message}`);
            }
        }

        return NextResponse.json({
            message: `Imported ${successCount} questions successfully`,
            imported: successCount,
            failed: errorCount,
            errors: errors.slice(0, 5) // Only return first 5 errors
        });

    } catch (error: any) {
        console.error('Error in import:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

function parseCSV(csvContent: string): any[] {
    const lines = csvContent.split(/\r?\n/);
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
    const questions: any[] = [];

    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;

        const values = lines[i].match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
        const row: any = {};

        headers.forEach((header, index) => {
            if (values[index]) {
                row[header] = values[index].trim().replace(/^"|"$/g, '');
            }
        });

        if (!row.question_text) continue;

        // Build options object
        let options: Record<string, string> | null = null;
        if (row.option_a || row.option_b) {
            options = {
                A: row.option_a || '',
                B: row.option_b || '',
                C: row.option_c || '',
                D: row.option_d || '',
                E: row.option_e || ''
            };
            // Remove empty options
            Object.keys(options).forEach(key => {
                if (!options[key]) delete options[key];
            });
        }

        questions.push({
            question_text: row.question_text,
            question_type: row.question_type || 'multiple_choice',
            options: options,
            correct_answer: row.correct_answer || row.answer || '',
            subject: row.subject || 'General',
            difficulty: row.difficulty || 'medium',
            points: parseInt(row.points) || 10
        });
    }

    return questions;
}

function parseExcelData(jsonData: any[]): any[] {
    return jsonData.map(row => {
        let options = null;
        if (row.option_a || row.option_b || row.A || row.B) {
            options = {
                A: row.option_a || row.A || '',
                B: row.option_b || row.B || '',
                C: row.option_c || row.C || '',
                D: row.option_d || row.D || '',
                E: row.option_e || row.E || ''
            };
            Object.keys(options).forEach(key => {
                if (!options[key]) delete options[key];
            });
        }

        return {
            question_text: row.question_text || row.Question || '',
            question_type: row.question_type || row.Type || 'multiple_choice',
            options: options,
            correct_answer: row.correct_answer || row.Answer || '',
            subject: row.subject || row.Subject || 'General',
            difficulty: row.difficulty || row.Difficulty || 'medium',
            points: parseInt(row.points || row.Points) || 10
        };
    }).filter(q => q.question_text);
}
