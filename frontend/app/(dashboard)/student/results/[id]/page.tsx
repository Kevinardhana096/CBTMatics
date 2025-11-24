'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import api from '@/lib/api';

interface Answer {
    question_id: number;
    question_text: string;
    question_type: string;
    options: any;
    correct_answer: string;
    student_answer: string;
    points: number;
    is_correct?: boolean;
}

interface ResultDetail {
    submission: {
        id: number;
        exam_id: number;
        exam_title: string;
        exam_description: string;
        score: number;
        submitted_at: string;
        duration: number;
    };
    answers: Answer[];
    stats: {
        total_questions: number;
        correct_answers: number;
        wrong_answers: number;
        unanswered: number;
    };
}

export default function ResultDetailPage() {
    const router = useRouter();
    const params = useParams();
    const { user, logout } = useAuth();
    const submissionId = params?.id as string;

    const [result, setResult] = useState<ResultDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (submissionId) {
            fetchResultDetail();
        }
    }, [submissionId]);

    const fetchResultDetail = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/exams/submission/${submissionId}`);

            // Calculate is_correct for each answer
            const answers = response.data.answers.map((answer: Answer) => ({
                ...answer,
                is_correct: answer.student_answer?.toUpperCase().trim() === answer.correct_answer?.toUpperCase().trim()
            }));

            const stats = {
                total_questions: answers.length,
                correct_answers: answers.filter((a: Answer) => a.is_correct).length,
                wrong_answers: answers.filter((a: Answer) => !a.is_correct && a.student_answer).length,
                unanswered: answers.filter((a: Answer) => !a.student_answer).length
            };

            setResult({
                submission: response.data.submission,
                answers,
                stats
            });
        } catch (err: any) {
            console.error('Error fetching result detail:', err);
            setError(err.response?.data?.error || 'Gagal memuat detail hasil ujian');
        } finally {
            setLoading(false);
        }
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getScoreBgColor = (score: number) => {
        if (score >= 80) return 'bg-green-100';
        if (score >= 60) return 'bg-yellow-100';
        return 'bg-red-100';
    };

    const parseOptions = (options: any): { [key: string]: string } => {
        if (typeof options === 'string') {
            try {
                return JSON.parse(options);
            } catch {
                return {};
            }
        }
        return options || {};
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#112C70] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Memuat detail hasil...</p>
                </div>
            </div>
        );
    }

    if (error || !result) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-md">
                    <div className="text-red-600 mb-4">
                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 text-center mb-4">Terjadi Kesalahan</h2>
                    <p className="text-gray-600 text-center mb-6">{error}</p>
                    <Link
                        href="/student/results"
                        className="block w-full py-2 px-4 text-center text-white rounded-lg"
                        style={{ background: 'linear-gradient(135deg, #0B2353 0%, #112C70 100%)' }}
                    >
                        Kembali ke Hasil Ujian
                    </Link>
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
                            <Link href="/student/results" className="text-white text-xl font-bold hover:opacity-80 transition">
                                ← Kembali ke Hasil Ujian
                            </Link>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-white text-sm">👤 {user?.username}</span>
                            <button
                                onClick={logout}
                                className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg transition"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto p-8">
                {/* Header Section */}
                <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">{result.submission.exam_title}</h1>
                    <p className="text-gray-600 mb-6">{result.submission.exam_description}</p>

                    {/* Statistics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {/* Score */}
                        <div className={`p-4 rounded-lg ${getScoreBgColor(result.submission.score)}`}>
                            <p className="text-sm text-gray-600 mb-1">Nilai</p>
                            <p className={`text-4xl font-bold ${getScoreColor(result.submission.score)}`}>
                                {result.submission.score}
                            </p>
                        </div>

                        {/* Correct Answers */}
                        <div className="p-4 bg-green-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Benar</p>
                            <p className="text-3xl font-bold text-green-600">{result.stats.correct_answers}</p>
                        </div>

                        {/* Wrong Answers */}
                        <div className="p-4 bg-red-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Salah</p>
                            <p className="text-3xl font-bold text-red-600">{result.stats.wrong_answers}</p>
                        </div>

                        {/* Total Questions */}
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Total Soal</p>
                            <p className="text-3xl font-bold text-blue-600">{result.stats.total_questions}</p>
                        </div>

                        {/* Date */}
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Tanggal</p>
                            <p className="text-xs font-semibold text-gray-800">
                                {formatDateTime(result.submission.submitted_at)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Questions and Answers */}
                <div className="space-y-6">
                    {result.answers.map((answer, index) => {
                        const options = parseOptions(answer.options);
                        const isMultipleChoice = answer.question_type === 'multiple_choice';
                        const isTrueFalse = answer.question_type === 'true_false';

                        return (
                            <div key={answer.question_id} className="bg-white rounded-xl shadow-md overflow-hidden">
                                {/* Question Header */}
                                <div className={`p-4 ${answer.is_correct ? 'bg-green-50' : 'bg-red-50'}`}>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-gray-700">
                                            Soal {index + 1} dari {result.stats.total_questions}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${answer.is_correct
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                }`}>
                                                {answer.is_correct ? '✓ Benar' : '✗ Salah'}
                                            </span>
                                            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                                                {answer.points} poin
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Question Content */}
                                <div className="p-6">
                                    {/* Question Text */}
                                    <div
                                        className="text-lg font-semibold text-gray-800 mb-6 prose prose-img:max-w-full prose-img:rounded-lg"
                                        dangerouslySetInnerHTML={{ __html: answer.question_text }}
                                    />

                                    {/* Multiple Choice Options */}
                                    {isMultipleChoice && (
                                        <div className="space-y-3 mb-4">
                                            {Object.entries(options).map(([key, value]) => {
                                                const isStudentAnswer = answer.student_answer === key;
                                                const isCorrectAnswer = answer.correct_answer === key;

                                                let bgColor = 'bg-gray-50';
                                                let borderColor = 'border-gray-200';
                                                let icon = null;

                                                if (isCorrectAnswer) {
                                                    bgColor = 'bg-green-50';
                                                    borderColor = 'border-green-500';
                                                    icon = (
                                                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                    );
                                                } else if (isStudentAnswer && !isCorrectAnswer) {
                                                    bgColor = 'bg-red-50';
                                                    borderColor = 'border-red-500';
                                                    icon = (
                                                        <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                        </svg>
                                                    );
                                                }

                                                return (
                                                    <div
                                                        key={key}
                                                        className={`flex items-start gap-3 p-4 border-2 rounded-lg ${bgColor} ${borderColor}`}
                                                    >
                                                        <span className="font-semibold text-gray-700 min-w-[24px]">{key}.</span>
                                                        <div
                                                            className="flex-1 prose prose-sm prose-img:max-w-xs prose-img:inline-block prose-img:rounded"
                                                            dangerouslySetInnerHTML={{ __html: value as string }}
                                                        />
                                                        {icon}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* True/False Options */}
                                    {isTrueFalse && (
                                        <div className="space-y-3 mb-4">
                                            {[{ key: 'A', label: 'Benar' }, { key: 'B', label: 'Salah' }].map((option) => {
                                                const isStudentAnswer = answer.student_answer === option.key;
                                                const isCorrectAnswer = answer.correct_answer === option.key;

                                                let bgColor = 'bg-gray-50';
                                                let borderColor = 'border-gray-200';
                                                let icon = null;

                                                if (isCorrectAnswer) {
                                                    bgColor = 'bg-green-50';
                                                    borderColor = 'border-green-500';
                                                    icon = (
                                                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                    );
                                                } else if (isStudentAnswer && !isCorrectAnswer) {
                                                    bgColor = 'bg-red-50';
                                                    borderColor = 'border-red-500';
                                                    icon = (
                                                        <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                        </svg>
                                                    );
                                                }

                                                return (
                                                    <div
                                                        key={option.key}
                                                        className={`flex items-center gap-3 p-4 border-2 rounded-lg ${bgColor} ${borderColor}`}
                                                    >
                                                        <span className="flex-1 font-medium text-gray-800">{option.label}</span>
                                                        {icon}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Essay Answer */}
                                    {answer.question_type === 'essay' && (
                                        <div className="space-y-3">
                                            <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                                                <p className="text-sm font-semibold text-gray-700 mb-2">Jawaban Anda:</p>
                                                <p className="text-gray-800">{answer.student_answer || 'Tidak dijawab'}</p>
                                            </div>
                                            {answer.correct_answer && (
                                                <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                                                    <p className="text-sm font-semibold text-gray-700 mb-2">Jawaban yang Diharapkan:</p>
                                                    <p className="text-gray-800">{answer.correct_answer}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Answer Summary */}
                                    {!answer.question_type.includes('essay') && (
                                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center justify-between text-sm">
                                                <div>
                                                    <span className="text-gray-600">Jawaban Anda: </span>
                                                    <span className={`font-bold ${answer.is_correct ? 'text-green-600' : 'text-red-600'}`}>
                                                        {answer.student_answer || 'Tidak dijawab'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600">Jawaban Benar: </span>
                                                    <span className="font-bold text-green-600">{answer.correct_answer}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Back Button */}
                <div className="mt-8 text-center">
                    <Link
                        href="/student/results"
                        className="inline-block px-8 py-3 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition"
                        style={{ background: 'linear-gradient(135deg, #0B2353 0%, #112C70 100%)' }}
                    >
                        Kembali ke Hasil Ujian
                    </Link>
                </div>
            </div>
        </div>
    );
}
