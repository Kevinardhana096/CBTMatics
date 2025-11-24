'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { RichTextEditor } from '@/components/ui/RichTextEditor';

interface Question {
    id: number;
    question_text: string;
    question_type: string;
    subject: string;
    difficulty: string;
    points: number;
    correct_answer: string;
    options: any;
}

export default function EditQuestionPage() {
    const router = useRouter();
    const params = useParams();
    const questionId = params?.id as string;

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState('');
    const [originalQuestion, setOriginalQuestion] = useState<Question | null>(null);

    const [formData, setFormData] = useState({
        question_text: '',
        question_type: 'multiple_choice',
        subject: '',
        difficulty: 'medium',
        points: 10,
        correct_answer: '',
        options: {
            A: '',
            B: '',
            C: '',
            D: ''
        }
    });

    useEffect(() => {
        console.log('Params:', params);
        console.log('Question ID:', questionId);
        if (questionId && questionId !== 'undefined') {
            fetchQuestion();
        } else {
            setError('ID soal tidak valid');
            setFetching(false);
        }
    }, [questionId]);

    // Debug: Log formData changes
    useEffect(() => {
        console.log('FormData updated:', {
            hasQuestionText: !!formData.question_text,
            questionTextLength: formData.question_text?.length,
            subject: formData.subject,
            difficulty: formData.difficulty,
            points: formData.points,
            correct_answer: formData.correct_answer,
            optionsA: formData.options.A
        });
    }, [formData]);

    const fetchQuestion = async () => {
        try {
            setFetching(true);
            console.log('Fetching question with ID:', questionId);
            const response = await api.get(`/questions/${questionId}`);
            console.log('API Response:', response.data);
            const question: Question = response.data;

            // Parse options
            let options = { A: '', B: '', C: '', D: '' };
            if (question.options) {
                console.log('Raw options:', question.options, 'Type:', typeof question.options);
                if (typeof question.options === 'string') {
                    try {
                        const parsed = JSON.parse(question.options);
                        console.log('Parsed options:', parsed);
                        if (Array.isArray(parsed)) {
                            // Convert array to object
                            options = {
                                A: parsed[0] || '',
                                B: parsed[1] || '',
                                C: parsed[2] || '',
                                D: parsed[3] || ''
                            };
                        } else {
                            options = parsed;
                        }
                    } catch (e) {
                        console.error('Failed to parse options:', e);
                        options = { A: '', B: '', C: '', D: '' };
                    }
                } else if (typeof question.options === 'object') {
                    if (Array.isArray(question.options)) {
                        options = {
                            A: question.options[0] || '',
                            B: question.options[1] || '',
                            C: question.options[2] || '',
                            D: question.options[3] || ''
                        };
                    } else {
                        options = question.options;
                    }
                }
            }

            console.log('Final parsed options:', options);
            console.log('Setting form data:', {
                question_text: question.question_text?.substring(0, 50),
                question_type: question.question_type,
                subject: question.subject,
                difficulty: question.difficulty,
                points: question.points,
                correct_answer: question.correct_answer,
                options
            });

            // Simpan data original untuk preview
            setOriginalQuestion(question);

            setFormData({
                question_text: question.question_text || '',
                question_type: question.question_type || 'multiple_choice',
                subject: question.subject || '',
                difficulty: question.difficulty || 'medium',
                points: question.points || 10,
                correct_answer: question.correct_answer || '',
                options
            });
        } catch (err: any) {
            console.error('Error fetching question:', err);
            setError(err.response?.data?.error || 'Gagal memuat soal');
        } finally {
            setFetching(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Format data sesuai dengan backend
            const payload: any = {
                question_text: formData.question_text,
                question_type: formData.question_type,
                subject: formData.subject,
                difficulty: formData.difficulty,
                points: formData.points,
                correct_answer: formData.correct_answer,
            };

            // Untuk multiple choice, kirim sebagai object (bukan array)
            if (formData.question_type === 'multiple_choice') {
                payload.options = {
                    A: formData.options.A,
                    B: formData.options.B,
                    C: formData.options.C,
                    D: formData.options.D
                };
            } else if (formData.question_type === 'true_false') {
                payload.options = {
                    A: 'Benar',
                    B: 'Salah'
                };
            } else {
                payload.options = null;
            }

            await api.put(`/questions/${questionId}`, payload);
            router.push('/admin/questions');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Gagal mengupdate soal');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#112C70] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Memuat soal...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
            {/* Header */}
            <nav className="shadow-md" style={{ background: 'linear-gradient(135deg, #0B2353 0%, #112C70 100%)' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Link href="/admin/questions" className="text-white text-xl font-bold">
                                ← Kembali ke Bank Soal
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Preview Soal Original */}
                    {originalQuestion && (
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-gray-800">Preview Soal Saat Ini</h3>
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                                    Read Only
                                </span>
                            </div>

                            <div className="space-y-4">
                                {/* Metadata */}
                                <div className="flex flex-wrap gap-2 mb-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${originalQuestion.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                                            originalQuestion.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                        }`}>
                                        {originalQuestion.difficulty === 'easy' ? 'Mudah' :
                                            originalQuestion.difficulty === 'medium' ? 'Sedang' : 'Sulit'}
                                    </span>
                                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                                        {originalQuestion.subject}
                                    </span>
                                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                                        {originalQuestion.points} poin
                                    </span>
                                    <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">
                                        {originalQuestion.question_type === 'multiple_choice' ? 'Pilihan Ganda' :
                                            originalQuestion.question_type === 'true_false' ? 'Benar/Salah' : 'Essay'}
                                    </span>
                                </div>

                                {/* Question Text */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Pertanyaan:</label>
                                    <div
                                        className="prose prose-sm max-w-none"
                                        dangerouslySetInnerHTML={{ __html: originalQuestion.question_text }}
                                    />
                                </div>

                                {/* Options */}
                                {originalQuestion.question_type === 'multiple_choice' && originalQuestion.options && (
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">Pilihan Jawaban:</label>
                                        <div className="space-y-2">
                                            {Object.entries(
                                                typeof originalQuestion.options === 'string'
                                                    ? JSON.parse(originalQuestion.options)
                                                    : originalQuestion.options
                                            ).map(([key, value]) => (
                                                <div
                                                    key={key}
                                                    className={`flex items-start gap-3 p-3 rounded-lg ${originalQuestion.correct_answer === key
                                                            ? 'bg-green-100 border-2 border-green-500'
                                                            : 'bg-white border border-gray-200'
                                                        }`}
                                                >
                                                    <span className="font-semibold text-gray-700 min-w-[24px]">{key}.</span>
                                                    <span className="flex-1 text-gray-800">{value as string}</span>
                                                    {originalQuestion.correct_answer === key && (
                                                        <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Correct Answer for Essay/True-False */}
                                {originalQuestion.question_type !== 'multiple_choice' && (
                                    <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Jawaban Benar:</label>
                                        <p className="text-gray-800">{originalQuestion.correct_answer}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Form Edit */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-800">Edit Soal</h2>
                            {formData.question_text && (
                                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                                    ✓ Data Terisi
                                </span>
                            )}
                        </div>

                        {error && (
                            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                                {error}
                            </div>
                        )}

                        {/* Debug Info - Hapus setelah testing */}
                        {process.env.NODE_ENV === 'development' && (
                            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs">
                                <strong>Debug:</strong>
                                <div>Question Text Length: {formData.question_text?.length || 0}</div>
                                <div>Subject: {formData.subject || 'empty'}</div>
                                <div>Options A: {formData.options.A || 'empty'}</div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Question Text with Rich Text Editor */}
                            <div className="relative">
                                <RichTextEditor
                                    label="Pertanyaan *"
                                    value={formData.question_text}
                                    onChange={(value) => setFormData({ ...formData, question_text: value })}
                                    placeholder="Tuliskan pertanyaan di sini... Gunakan toolbar untuk format teks, gambar, rumus matematika, dan video."
                                    required
                                />
                            </div>

                            {/* Question Type */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Tipe Soal *
                                </label>
                                <select
                                    value={formData.question_type}
                                    onChange={(e) => setFormData({ ...formData, question_type: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#112C70] focus:border-transparent"
                                >
                                    <option value="multiple_choice">Pilihan Ganda</option>
                                    <option value="true_false">Benar/Salah</option>
                                    <option value="essay">Essay</option>
                                </select>
                            </div>

                            {/* Options (for multiple choice) */}
                            {formData.question_type === 'multiple_choice' && (
                                <div className="space-y-3">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Pilihan Jawaban *
                                    </label>
                                    {['A', 'B', 'C', 'D'].map((option) => (
                                        <div key={option} className="flex items-center gap-3">
                                            <span className="font-semibold text-gray-700 w-8">{option}.</span>
                                            <input
                                                type="text"
                                                required
                                                value={formData.options[option as keyof typeof formData.options]}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    options: { ...formData.options, [option]: e.target.value }
                                                })}
                                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#112C70] focus:border-transparent"
                                                placeholder={`Pilihan ${option}`}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Correct Answer */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Jawaban Benar *
                                </label>
                                {formData.question_type === 'multiple_choice' ? (
                                    <select
                                        required
                                        value={formData.correct_answer}
                                        onChange={(e) => setFormData({ ...formData, correct_answer: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#112C70] focus:border-transparent"
                                    >
                                        <option value="">Pilih jawaban benar</option>
                                        <option value="A">A</option>
                                        <option value="B">B</option>
                                        <option value="C">C</option>
                                        <option value="D">D</option>
                                    </select>
                                ) : formData.question_type === 'true_false' ? (
                                    <select
                                        required
                                        value={formData.correct_answer}
                                        onChange={(e) => setFormData({ ...formData, correct_answer: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#112C70] focus:border-transparent"
                                    >
                                        <option value="">Pilih jawaban benar</option>
                                        <option value="A">Benar</option>
                                        <option value="B">Salah</option>
                                    </select>
                                ) : (
                                    <textarea
                                        required
                                        value={formData.correct_answer}
                                        onChange={(e) => setFormData({ ...formData, correct_answer: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#112C70] focus:border-transparent"
                                        placeholder="Masukkan jawaban benar untuk essay"
                                        rows={4}
                                    />
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Subject */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Mata Pelajaran *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#112C70] focus:border-transparent"
                                        placeholder="Matematika"
                                    />
                                </div>

                                {/* Difficulty */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Tingkat Kesulitan *
                                    </label>
                                    <select
                                        value={formData.difficulty}
                                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#112C70] focus:border-transparent"
                                    >
                                        <option value="easy">Mudah</option>
                                        <option value="medium">Sedang</option>
                                        <option value="hard">Sulit</option>
                                    </select>
                                </div>

                                {/* Points */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Poin *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={formData.points}
                                        onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#112C70] focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex gap-4 pt-6">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 py-3 px-6 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition disabled:opacity-50"
                                    style={{ background: loading ? '#9ca3af' : 'linear-gradient(135deg, #0B2353 0%, #112C70 100%)' }}
                                >
                                    {loading ? 'Menyimpan...' : 'Update Soal'}
                                </button>
                                <Link
                                    href="/admin/questions"
                                    className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition text-center"
                                >
                                    Batal
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
