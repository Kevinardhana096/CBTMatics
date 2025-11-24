'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { LatexRenderer } from '@/components/ui/LatexRenderer';

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

export default function QuestionPreviewPage() {
    const router = useRouter();
    const params = useParams();
    const questionId = params?.id as string;

    const [question, setQuestion] = useState<Question | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedAnswer, setSelectedAnswer] = useState<string>('');
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);

    useEffect(() => {
        if (questionId) {
            fetchQuestion();
        }
    }, [questionId]);

    const fetchQuestion = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/questions/${questionId}`);
            setQuestion(response.data);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Gagal memuat soal');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckAnswer = () => {
        if (!selectedAnswer) {
            alert('Pilih jawaban terlebih dahulu!');
            return;
        }

        const correct = selectedAnswer.toUpperCase() === question?.correct_answer.toUpperCase();
        setIsCorrect(correct);
        setShowResult(true);
    };

    const handleReset = () => {
        setSelectedAnswer('');
        setShowResult(false);
        setIsCorrect(false);
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

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return 'bg-green-100 text-green-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'hard': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#112C70] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Memuat soal...</p>
                </div>
            </div>
        );
    }

    if (error || !question) {
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
                        href="/admin/questions"
                        className="block w-full py-2 px-4 text-center text-white rounded-lg"
                        style={{ background: 'linear-gradient(135deg, #0B2353 0%, #112C70 100%)' }}
                    >
                        Kembali ke Bank Soal
                    </Link>
                </div>
            </div>
        );
    }

    const options = parseOptions(question.options);

    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
            {/* Header */}
            <nav className="shadow-md" style={{ background: 'linear-gradient(135deg, #0B2353 0%, #112C70 100%)' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Link href="/admin/questions" className="text-white text-xl font-bold hover:opacity-80 transition">
                                ← Kembali ke Bank Soal
                            </Link>
                        </div>
                        <div className="flex items-center space-x-3">
                            <span className="px-3 py-1 bg-blue-500 text-white text-sm font-semibold rounded-full">
                                🧪 Mode Preview/Testing
                            </span>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto p-8">
                {/* Info Card */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold text-gray-800">Preview & Testing Soal</h1>
                        <div className="flex gap-2">
                            <Link
                                href={`/admin/questions/${questionId}/edit`}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold"
                            >
                                Edit Soal
                            </Link>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(question.difficulty)}`}>
                            {question.difficulty === 'easy' ? 'Mudah' : question.difficulty === 'medium' ? 'Sedang' : 'Sulit'}
                        </span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                            {question.subject}
                        </span>
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                            {question.points} poin
                        </span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">
                            {question.question_type === 'multiple_choice' ? 'Pilihan Ganda' :
                                question.question_type === 'true_false' ? 'Benar/Salah' : 'Essay'}
                        </span>
                    </div>
                </div>

                {/* Question Card */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    {/* Question Header */}
                    <div className="bg-gradient-to-r from-[#0B2353] to-[#112C70] text-white p-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold">Pertanyaan</h2>
                            {showResult && (
                                <span className={`px-4 py-2 rounded-full text-sm font-bold ${isCorrect ? 'bg-green-500' : 'bg-red-500'
                                    }`}>
                                    {isCorrect ? '✓ BENAR' : '✗ SALAH'}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Question Content */}
                    <div className="p-8">
                        {/* Question Text */}
                        <LatexRenderer
                            content={question.question_text}
                            className="text-xl font-semibold text-gray-800 mb-8 leading-relaxed prose prose-lg max-w-none prose-img:max-w-full prose-img:rounded-lg prose-img:shadow-lg prose-video:w-full prose-video:rounded-lg"
                        />

                        {/* Answer Options */}
                        <div className="space-y-4">
                            {/* Multiple Choice */}
                            {question.question_type === 'multiple_choice' && Object.entries(options).map(([key, value]) => {
                                const isSelected = selectedAnswer === key;
                                const isCorrectAnswer = question.correct_answer === key;

                                let borderColor = 'border-gray-300';
                                let bgColor = 'bg-white hover:bg-gray-50';

                                if (showResult) {
                                    if (isCorrectAnswer) {
                                        borderColor = 'border-green-500';
                                        bgColor = 'bg-green-50';
                                    } else if (isSelected && !isCorrectAnswer) {
                                        borderColor = 'border-red-500';
                                        bgColor = 'bg-red-50';
                                    }
                                } else if (isSelected) {
                                    borderColor = 'border-[#112C70]';
                                    bgColor = 'bg-blue-50';
                                }

                                return (
                                    <label
                                        key={key}
                                        className={`flex items-start p-5 border-2 rounded-xl cursor-pointer transition-all ${borderColor} ${bgColor} ${!showResult ? 'hover:shadow-md' : ''
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="answer"
                                            value={key}
                                            checked={isSelected}
                                            onChange={(e) => !showResult && setSelectedAnswer(e.target.value)}
                                            disabled={showResult}
                                            className="mt-1.5 mr-4"
                                        />
                                        <div className="flex-1">
                                            <span className="font-bold text-gray-700 text-lg mr-3">{key}.</span>
                                            <LatexRenderer
                                                content={value as string}
                                                className="text-gray-800 prose prose-img:max-w-xs prose-img:inline-block prose-img:rounded inline"
                                            />
                                        </div>
                                        {showResult && isCorrectAnswer && (
                                            <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                        {showResult && isSelected && !isCorrectAnswer && (
                                            <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </label>
                                );
                            })}

                            {/* True/False */}
                            {question.question_type === 'true_false' && [
                                { key: 'A', label: 'Benar' },
                                { key: 'B', label: 'Salah' }
                            ].map((option) => {
                                const isSelected = selectedAnswer === option.key;
                                const isCorrectAnswer = question.correct_answer === option.key;

                                let borderColor = 'border-gray-300';
                                let bgColor = 'bg-white hover:bg-gray-50';

                                if (showResult) {
                                    if (isCorrectAnswer) {
                                        borderColor = 'border-green-500';
                                        bgColor = 'bg-green-50';
                                    } else if (isSelected && !isCorrectAnswer) {
                                        borderColor = 'border-red-500';
                                        bgColor = 'bg-red-50';
                                    }
                                } else if (isSelected) {
                                    borderColor = 'border-[#112C70]';
                                    bgColor = 'bg-blue-50';
                                }

                                return (
                                    <label
                                        key={option.key}
                                        className={`flex items-center justify-between p-5 border-2 rounded-xl cursor-pointer transition-all ${borderColor} ${bgColor} ${!showResult ? 'hover:shadow-md' : ''
                                            }`}
                                    >
                                        <div className="flex items-center">
                                            <input
                                                type="radio"
                                                name="answer"
                                                value={option.key}
                                                checked={isSelected}
                                                onChange={(e) => !showResult && setSelectedAnswer(e.target.value)}
                                                disabled={showResult}
                                                className="mr-4"
                                            />
                                            <span className="text-lg font-semibold text-gray-800">{option.label}</span>
                                        </div>
                                        {showResult && isCorrectAnswer && (
                                            <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                        {showResult && isSelected && !isCorrectAnswer && (
                                            <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </label>
                                );
                            })}

                            {/* Essay */}
                            {question.question_type === 'essay' && (
                                <div className="space-y-4">
                                    <textarea
                                        value={selectedAnswer}
                                        onChange={(e) => !showResult && setSelectedAnswer(e.target.value)}
                                        disabled={showResult}
                                        placeholder="Tulis jawaban Anda di sini..."
                                        className="w-full p-4 border-2 border-gray-300 rounded-xl focus:border-[#112C70] focus:ring-2 focus:ring-blue-100 outline-none min-h-[200px] resize-y"
                                    />
                                    {showResult && (
                                        <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                                            <p className="text-sm font-semibold text-gray-700 mb-2">Jawaban yang Diharapkan:</p>
                                            <p className="text-gray-800">{question.correct_answer}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-8 flex gap-4">
                            {!showResult ? (
                                <button
                                    onClick={handleCheckAnswer}
                                    disabled={!selectedAnswer}
                                    className="flex-1 py-4 px-6 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ background: selectedAnswer ? 'linear-gradient(135deg, #0B2353 0%, #112C70 100%)' : '#9ca3af' }}
                                >
                                    Cek Jawaban
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={handleReset}
                                        className="flex-1 py-4 px-6 bg-gray-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:bg-gray-700 transition"
                                    >
                                        Coba Lagi
                                    </button>
                                    <Link
                                        href="/admin/questions"
                                        className="flex-1 py-4 px-6 text-center text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition"
                                        style={{ background: 'linear-gradient(135deg, #0B2353 0%, #112C70 100%)' }}
                                    >
                                        Kembali ke Bank Soal
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Result Summary */}
                        {showResult && (
                            <div className={`mt-6 p-6 rounded-xl border-2 ${isCorrect
                                ? 'bg-green-50 border-green-500'
                                : 'bg-red-50 border-red-500'
                                }`}>
                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isCorrect ? 'bg-green-500' : 'bg-red-500'
                                        }`}>
                                        {isCorrect ? (
                                            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        ) : (
                                            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className={`text-xl font-bold mb-2 ${isCorrect ? 'text-green-800' : 'text-red-800'
                                            }`}>
                                            {isCorrect ? 'Jawaban Benar!' : 'Jawaban Salah!'}
                                        </h3>
                                        <p className="text-gray-700">
                                            <span className="font-semibold">Jawaban Anda:</span> {selectedAnswer || 'Tidak dijawab'}
                                        </p>
                                        {!isCorrect && question.question_type !== 'essay' && (
                                            <p className="text-gray-700 mt-1">
                                                <span className="font-semibold">Jawaban Benar:</span> {question.correct_answer}
                                            </p>
                                        )}
                                        {isCorrect && (
                                            <p className="text-green-700 mt-2">
                                                Poin yang didapat: <span className="font-bold text-2xl">{question.points}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
