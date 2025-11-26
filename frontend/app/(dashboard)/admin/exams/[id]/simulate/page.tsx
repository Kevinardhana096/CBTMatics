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
    options: string[];
    correct_answer: string;
    points: number;
}

interface Exam {
    id: number;
    title: string;
    description: string;
    duration: number;
    questions: Question[];
}

export default function ExamSimulatePage() {
    const router = useRouter();
    const params = useParams();
    const examId = params?.id as string;

    const [exam, setExam] = useState<Exam | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<{ [key: number]: string }>({});
    const [doubtfulQuestions, setDoubtfulQuestions] = useState<Set<number>>(new Set());
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);

    useEffect(() => {
        if (examId) {
            fetchExam();
        }
    }, [examId]);

    const fetchExam = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/exams/${examId}`);
            console.log('API Response:', response.data);

            // Process questions to ensure options are in the right format
            const processedQuestions = (response.data.questions || []).map((q: any) => {
                console.log('Question options before parse:', q.options, typeof q.options);
                return {
                    ...q,
                    options: parseOptions(q.options)
                };
            });

            // Gabungkan exam dengan questions
            const examData = {
                ...response.data.exam,
                questions: processedQuestions
            };
            console.log('Exam Data with questions:', examData);
            setExam(examData);
        } catch (err: any) {
            console.error('Error fetching exam:', err);
            setError(err.response?.data?.error || 'Gagal memuat ujian');
        } finally {
            setLoading(false);
        }
    };

    const parseOptions = (options: any): string[] => {
        console.log('parseOptions input:', options, 'type:', typeof options);

        if (!options) {
            console.log('Options is null/undefined');
            return [];
        }

        if (Array.isArray(options)) {
            console.log('Options is already array:', options);
            return options;
        }

        if (typeof options === 'string') {
            try {
                const parsed = JSON.parse(options);
                console.log('Parsed string options:', parsed);
                if (Array.isArray(parsed)) {
                    return parsed;
                }
                if (typeof parsed === 'object' && parsed !== null) {
                    const values = Object.values(parsed) as string[];
                    console.log('Converted object to array:', values);
                    return values;
                }
                return [];
            } catch (e) {
                console.log('Failed to parse string options:', e);
                return [];
            }
        }

        if (typeof options === 'object' && options !== null) {
            const values = Object.values(options) as string[];
            console.log('Converted object options to array:', values);
            return values;
        }

        console.log('Unknown options format');
        return [];
    };

    const handleAnswerChange = (questionId: number, answer: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: answer }));
    };

    const toggleDoubtful = (questionId: number) => {
        setDoubtfulQuestions(prev => {
            const newSet = new Set(prev);
            if (newSet.has(questionId)) {
                newSet.delete(questionId);
            } else {
                newSet.add(questionId);
            }
            return newSet;
        });
    };

    const clearAnswer = (questionId: number) => {
        setAnswers(prev => {
            const newAnswers = { ...prev };
            delete newAnswers[questionId];
            return newAnswers;
        });
    };

    const handleSubmit = () => {
        if (!exam || !exam.questions) return;

        let totalScore = 0;
        let correct = 0;

        exam.questions.forEach(question => {
            const studentAnswer = answers[question.id];
            if (studentAnswer && studentAnswer.toUpperCase() === question.correct_answer.toUpperCase()) {
                totalScore += question.points;
                correct++;
            }
        });

        setScore(totalScore);
        setCorrectCount(correct);
        setShowResults(true);
    };

    const currentQuestion = exam?.questions?.[currentQuestionIndex];
    const answeredCount = Object.keys(answers).length;
    const totalQuestions = exam?.questions?.length || 0;
    const progress = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#112C70] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Memuat simulasi ujian...</p>
                </div>
            </div>
        );
    }

    if (error || !exam) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-md">
                    <div className="text-red-600 mb-4">
                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 text-center mb-4">Terjadi Kesalahan</h2>
                    <p className="text-gray-600 text-center mb-6">{error || 'Ujian tidak ditemukan'}</p>
                    <Link
                        href="/admin/exams"
                        className="block w-full py-2 px-4 text-center text-white rounded-lg"
                        style={{ background: 'linear-gradient(135deg, #0B2353 0%, #112C70 100%)' }}
                    >
                        Kembali ke Ujian
                    </Link>
                </div>
            </div>
        );
    }

    // Check if exam has no questions
    if (!exam.questions || exam.questions.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-md">
                    <div className="text-yellow-600 mb-4">
                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 text-center mb-4">Belum Ada Soal</h2>
                    <p className="text-gray-600 text-center mb-6">
                        Ujian "{exam?.title}" belum memiliki soal. Silakan tambahkan soal terlebih dahulu untuk menggunakan fitur simulasi.
                    </p>
                    <div className="space-y-3">
                        <Link
                            href={`/admin/exams/${examId}/edit`}
                            className="block w-full py-2 px-4 text-center text-white rounded-lg"
                            style={{ background: 'linear-gradient(135deg, #0B2353 0%, #112C70 100%)' }}
                        >
                            Edit Ujian & Tambah Soal
                        </Link>
                        <Link
                            href="/admin/exams"
                            className="block w-full py-2 px-4 text-center border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                            Kembali ke Daftar Ujian
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (showResults) {
        const percentage = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

        return (
            <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
                <nav className="shadow-md" style={{ background: 'linear-gradient(135deg, #0B2353 0%, #112C70 100%)' }}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16 items-center">
                            <h1 className="text-white text-xl font-bold">🧪 Hasil Simulasi</h1>
                        </div>
                    </div>
                </nav>

                <div className="max-w-4xl mx-auto p-8">
                    <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                        <div className="mb-6">
                            <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center ${percentage >= 80 ? 'bg-green-100' : percentage >= 60 ? 'bg-yellow-100' : 'bg-red-100'
                                }`}>
                                <span className={`text-4xl font-bold ${percentage >= 80 ? 'text-green-600' : percentage >= 60 ? 'text-yellow-600' : 'text-red-600'
                                    }`}>
                                    {score}
                                </span>
                            </div>
                        </div>

                        <h2 className="text-3xl font-bold text-gray-800 mb-2">{exam.title}</h2>
                        <p className="text-gray-600 mb-8">Simulasi Testing Selesai</p>

                        <div className="grid grid-cols-3 gap-6 mb-8">
                            <div className="p-4 bg-green-50 rounded-lg">
                                <p className="text-sm text-gray-600 mb-1">Benar</p>
                                <p className="text-3xl font-bold text-green-600">{correctCount}</p>
                            </div>
                            <div className="p-4 bg-red-50 rounded-lg">
                                <p className="text-sm text-gray-600 mb-1">Salah</p>
                                <p className="text-3xl font-bold text-red-600">{totalQuestions - correctCount}</p>
                            </div>
                            <div className="p-4 bg-blue-50 rounded-lg">
                                <p className="text-sm text-gray-600 mb-1">Persentase</p>
                                <p className="text-3xl font-bold text-blue-600">{percentage.toFixed(0)}%</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={() => {
                                    setShowResults(false);
                                    setAnswers({});
                                    setCurrentQuestionIndex(0);
                                    setScore(0);
                                    setCorrectCount(0);
                                }}
                                className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                            >
                                Ulangi Simulasi
                            </button>
                            <Link
                                href="/admin/exams"
                                className="block w-full py-3 px-6 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                            >
                                Kembali ke Daftar Ujian
                            </Link>
                        </div>
                    </div>

                    {/* Answer Review */}
                    <div className="mt-6 space-y-4">
                        <h3 className="text-xl font-bold text-gray-800">Review Jawaban</h3>
                        {exam?.questions?.map((question, index) => {
                            const studentAnswer = answers[question.id];
                            const isCorrect = studentAnswer?.toUpperCase() === question.correct_answer.toUpperCase();

                            return (
                                <div key={question.id} className={`bg-white rounded-lg shadow p-4 border-l-4 ${isCorrect ? 'border-green-500' : 'border-red-500'
                                    }`}>
                                    <div className="flex items-start justify-between mb-2">
                                        <span className="font-semibold text-gray-700">Soal {index + 1}</span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {isCorrect ? '✓ Benar' : '✗ Salah'}
                                        </span>
                                    </div>
                                    <div
                                        className="text-sm text-gray-600 mb-2 prose prose-sm"
                                        dangerouslySetInnerHTML={{ __html: question.question_text }}
                                    />
                                    <div className="text-sm">
                                        <span className="text-gray-600">Jawaban Anda: </span>
                                        <span className={`font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                            {studentAnswer || 'Tidak dijawab'}
                                        </span>
                                        {!isCorrect && (
                                            <>
                                                <span className="text-gray-600 ml-4">Jawaban Benar: </span>
                                                <span className="font-bold text-green-600">{question.correct_answer}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
            {/* Header */}
            <nav className="shadow-md" style={{ background: 'linear-gradient(135deg, #0B2353 0%, #112C70 100%)' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div>
                            <h1 className="text-white text-xl font-bold">{exam?.title}</h1>
                            <p className="text-blue-200 text-sm">🧪 Mode Simulasi Testing</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-white text-sm">
                                <span className="font-semibold">{answeredCount}</span> / {totalQuestions} dijawab
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Progress Bar */}
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">Progress</span>
                        <span className="text-sm font-semibold text-[#112C70]">{progress.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                            className="h-3 rounded-full transition-all duration-300"
                            style={{
                                width: `${progress}%`,
                                background: 'linear-gradient(90deg, #0B2353 0%, #112C70 100%)'
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto p-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Question Navigation */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-lg p-4 sticky top-4">
                            <h3 className="font-bold text-gray-800 mb-3 text-sm">Nomor Soal</h3>
                            <div className="grid grid-cols-5 lg:grid-cols-4 gap-2">
                                {exam?.questions?.map((q, index) => (
                                    <button
                                        key={q.id}
                                        onClick={() => setCurrentQuestionIndex(index)}
                                        className={`w-10 h-10 rounded-lg font-semibold text-sm transition relative ${currentQuestionIndex === index
                                            ? 'bg-[#112C70] text-white'
                                            : doubtfulQuestions.has(q.id)
                                                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                                : answers[q.id]
                                                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        {index + 1}
                                        {doubtfulQuestions.has(q.id) && (
                                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full border-2 border-white"></span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Question Card */}
                    <div className="lg:col-span-3">
                        {currentQuestion && (
                            <div className="bg-white rounded-xl shadow-lg p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <span className="px-3 py-1 bg-[#112C70] text-white text-sm font-semibold rounded-full">
                                        Soal {currentQuestionIndex + 1} dari {totalQuestions}
                                    </span>
                                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${answers[currentQuestion.id] ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {answers[currentQuestion.id] ? '✓ Terjawab' : 'Belum dijawab'}
                                    </span>
                                </div>

                                <LatexRenderer
                                    content={currentQuestion.question_text}
                                    className="text-xl font-semibold text-gray-800 mb-6 leading-relaxed prose prose-lg max-w-none prose-img:max-w-full prose-img:rounded-lg"
                                />

                                {/* Debug Info - Remove after fixing */}
                                {currentQuestion.question_type === 'multiple_choice' && (
                                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs">
                                        <strong>Debug:</strong> Options type: {typeof currentQuestion.options} |
                                        Is Array: {Array.isArray(currentQuestion.options) ? 'Yes' : 'No'} |
                                        Length: {currentQuestion.options?.length || 0} |
                                        Data: {JSON.stringify(currentQuestion.options)}
                                    </div>
                                )}

                                <div className="space-y-3">
                                    {currentQuestion.question_type === 'multiple_choice' && currentQuestion.options && currentQuestion.options.length > 0 ? (
                                        currentQuestion.options.map((option: string, index: number) => {
                                            const optionLabel = String.fromCharCode(65 + index);
                                            const isSelected = answers[currentQuestion.id] === optionLabel;

                                            return (
                                                <label
                                                    key={index}
                                                    className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition ${isSelected
                                                        ? 'border-[#112C70] bg-blue-50'
                                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name={`question-${currentQuestion.id}`}
                                                        value={optionLabel}
                                                        checked={isSelected}
                                                        onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                                                        className="mt-1 mr-3"
                                                    />
                                                    <div className="flex-1">
                                                        <span className="font-semibold text-gray-700 mr-2">{optionLabel}.</span>
                                                        <LatexRenderer
                                                            content={option}
                                                            className="text-gray-800 prose prose-img:max-w-xs prose-img:inline-block prose-img:rounded inline"
                                                        />
                                                    </div>
                                                </label>
                                            );
                                        })
                                    ) : currentQuestion.question_type === 'multiple_choice' ? (
                                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                                            ⚠️ Options tidak tersedia atau kosong untuk soal ini
                                        </div>
                                    ) : null}

                                    {currentQuestion.question_type === 'true_false' && [
                                        { label: 'Benar', value: 'A' },
                                        { label: 'Salah', value: 'B' }
                                    ].map((option) => {
                                        const isSelected = answers[currentQuestion.id] === option.value;
                                        return (
                                            <label
                                                key={option.value}
                                                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${isSelected
                                                    ? 'border-[#112C70] bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name={`question-${currentQuestion.id}`}
                                                    value={option.value}
                                                    checked={isSelected}
                                                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                                                    className="mr-3"
                                                />
                                                <span className="text-gray-800 font-medium">{option.label}</span>
                                            </label>
                                        );
                                    })}

                                    {currentQuestion.question_type === 'essay' && (
                                        <textarea
                                            value={answers[currentQuestion.id] || ''}
                                            onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                                            placeholder="Tulis jawaban Anda di sini..."
                                            className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-[#112C70] focus:ring-2 focus:ring-blue-100 outline-none min-h-[200px]"
                                        />
                                    )}
                                </div>

                                {/* Action Buttons - Ragu & Hapus */}
                                <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                                    <button
                                        onClick={() => toggleDoubtful(currentQuestion.id)}
                                        className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${doubtfulQuestions.has(currentQuestion.id)
                                            ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                                            : 'bg-yellow-50 text-yellow-700 border-2 border-yellow-300 hover:bg-yellow-100'
                                            }`}
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        {doubtfulQuestions.has(currentQuestion.id) ? 'Hapus Ragu-ragu' : 'Ragu-ragu'}
                                    </button>

                                    {answers[currentQuestion.id] && (
                                        <button
                                            onClick={() => clearAnswer(currentQuestion.id)}
                                            className="px-4 py-2 bg-red-50 text-red-700 border-2 border-red-300 rounded-lg font-medium hover:bg-red-100 transition flex items-center gap-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                            Hapus Jawaban
                                        </button>
                                    )}
                                </div>

                                {/* Navigation Buttons */}
                                <div className="flex gap-4 mt-6">
                                    <button
                                        onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                                        disabled={currentQuestionIndex === 0}
                                        className="px-6 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Sebelumnya
                                    </button>

                                    {currentQuestionIndex < totalQuestions - 1 ? (
                                        <button
                                            onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                                            className="flex-1 py-3 px-6 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition"
                                            style={{ background: 'linear-gradient(135deg, #0B2353 0%, #112C70 100%)' }}
                                        >
                                            Selanjutnya
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleSubmit}
                                            className="flex-1 py-3 px-6 bg-green-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl hover:bg-green-700 transition"
                                        >
                                            Selesai & Lihat Hasil
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
