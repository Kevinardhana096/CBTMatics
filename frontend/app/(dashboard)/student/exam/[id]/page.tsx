'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useTimer } from '@/hooks/useTimer';
import api from '@/lib/api';
import { LatexRenderer } from '@/components/ui/LatexRenderer';

interface Question {
    id: number;
    question_text: string;
    question_type: string;
    options: string[] | { [key: string]: string };
    order_number: number;
}

interface Exam {
    id: number;
    title: string;
    duration: number;
    start_time: string;
    end_time: string;
    questions: Question[];
}

interface ExamSubmission {
    id: number;
    start_time: string;
    remaining_time?: number;
}

export default function TakeExamPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const examId = params.id as string;

    const [exam, setExam] = useState<Exam | null>(null);
    const [submissionId, setSubmissionId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<{ [key: number]: string }>({});
    const [doubtfulQuestions, setDoubtfulQuestions] = useState<Set<number>>(new Set());
    const [submitting, setSubmitting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [initialDuration, setInitialDuration] = useState(0);
    const [savedAnswers, setSavedAnswers] = useState<Set<number>>(new Set());
    const autoSaveTimeoutRef = useRef<{ [key: number]: NodeJS.Timeout }>({});

    const { seconds, formatTime, start: startTimer, reset: resetTimer } = useTimer({
        initialSeconds: initialDuration,
        onComplete: () => handleSubmit(true),
        autoStart: false
    });

    useEffect(() => {
        initExam();

        // Cleanup on unmount
        return () => {
            Object.values(autoSaveTimeoutRef.current).forEach(timeout => clearTimeout(timeout));
        };
    }, [examId]);

    const initExam = async () => {
        try {
            setLoading(true);
            setError('');

            // Get exam details
            const examResponse = await api.get(`/exams/${examId}`);
            const examData = {
                ...examResponse.data.exam,
                questions: examResponse.data.questions || []
            };

            // Validasi waktu ujian
            const now = new Date();
            const startTime = new Date(examData.start_time);
            const endTime = new Date(examData.end_time);

            console.log('Exam time validation:', {
                now: now.toISOString(),
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                hasNotStarted: now < startTime,
                hasEnded: now > endTime,
                isActive: now >= startTime && now <= endTime
            });

            if (now < startTime) {
                const startTimeStr = startTime.toLocaleString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                setError(`Ujian belum dimulai. Akan dimulai pada: ${startTimeStr}`);
                return;
            }

            if (now > endTime) {
                setError('Ujian sudah berakhir');
                return;
            }

            setExam(examData);

            // Start atau lanjutkan exam submission
            try {
                const startResponse = await api.post('/exams/start', {
                    exam_id: Number(examId)
                });

                console.log('Start exam response:', startResponse.data);

                const submission = startResponse.data.submission;
                setSubmissionId(submission.id);

                // Hitung remaining time
                let remainingSeconds = examData.duration * 60;

                if (submission.remaining_time !== undefined && submission.remaining_time !== null) {
                    remainingSeconds = submission.remaining_time;
                } else if (submission.start_time) {
                    const submissionStartTime = new Date(submission.start_time);
                    const elapsed = Math.floor((now.getTime() - submissionStartTime.getTime()) / 1000);
                    remainingSeconds = Math.max(0, (examData.duration * 60) - elapsed);
                }

                console.log('Timer setup:', {
                    duration: examData.duration,
                    remainingSeconds,
                    submissionStartTime: submission.start_time
                });

                // Load existing answers jika ada
                if (startResponse.data.answers && Array.isArray(startResponse.data.answers)) {
                    const loadedAnswers: { [key: number]: string } = {};
                    const savedQuestionIds = new Set<number>();

                    startResponse.data.answers.forEach((ans: any) => {
                        loadedAnswers[ans.question_id] = ans.answer;
                        savedQuestionIds.add(ans.question_id);
                    });

                    setAnswers(loadedAnswers);
                    setSavedAnswers(savedQuestionIds);

                    console.log('Loaded answers:', Object.keys(loadedAnswers).length);
                }

                setInitialDuration(remainingSeconds);

                // Reset timer dengan remaining seconds dan start
                setTimeout(() => {
                    resetTimer(remainingSeconds);
                    startTimer();
                }, 100);

            } catch (startErr: any) {
                console.error('Error starting exam:', startErr);
                const errMsg = startErr.response?.data?.error || 'Gagal memulai ujian';

                console.log('Start exam error:', {
                    status: startErr.response?.status,
                    message: errMsg,
                    fullError: startErr.response?.data
                });

                // Mapping error messages
                if (errMsg.includes('already submitted') || errMsg.includes('sudah mengirim')) {
                    setError('Anda sudah mengerjakan ujian ini');
                } else if (errMsg.includes('not started') || errMsg.includes('belum dimulai')) {
                    const startTimeStr = startTime.toLocaleString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    setError(`Ujian belum dimulai. Akan dimulai pada: ${startTimeStr}`);
                } else if (errMsg.includes('has ended') || errMsg.includes('berakhir')) {
                    setError('Ujian sudah berakhir');
                } else if (errMsg.includes('not available')) {
                    setError('Ujian tidak tersedia saat ini');
                } else {
                    setError(errMsg);
                }
            }

        } catch (err: any) {
            console.error('Error loading exam:', err);
            setError(err.response?.data?.error || 'Gagal memuat ujian');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerChange = (questionId: number, answer: string) => {
        // Update local state immediately
        setAnswers(prev => ({ ...prev, [questionId]: answer }));

        // Mark as unsaved
        setSavedAnswers(prev => {
            const newSet = new Set(prev);
            newSet.delete(questionId);
            return newSet;
        });

        // Clear existing timeout for this question
        if (autoSaveTimeoutRef.current[questionId]) {
            clearTimeout(autoSaveTimeoutRef.current[questionId]);
        }

        // Auto-save after 1.5 seconds of inactivity
        if (submissionId) {
            autoSaveTimeoutRef.current[questionId] = setTimeout(async () => {
                try {
                    await api.post('/exams/save-answer', {
                        submission_id: submissionId,
                        question_id: questionId,
                        answer
                    });

                    // Mark as saved
                    setSavedAnswers(prev => new Set(prev).add(questionId));
                } catch (err) {
                    console.error('Error saving answer:', err);
                }
            }, 1500);
        }
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

        // Also clear from saved answers
        setSavedAnswers(prev => {
            const newSet = new Set(prev);
            newSet.delete(questionId);
            return newSet;
        });

        // Save cleared answer to server
        if (submissionId) {
            api.post('/exams/save-answer', {
                submission_id: submissionId,
                question_id: questionId,
                answer: ''
            }).catch(err => console.error('Error clearing answer:', err));
        }
    };

    const handleSubmit = async (autoSubmit = false) => {
        if (!autoSubmit) {
            setShowConfirmModal(false);
        }

        if (!submissionId) {
            alert('Submission ID tidak ditemukan');
            return;
        }

        try {
            setSubmitting(true);

            // Clear all pending auto-saves
            Object.values(autoSaveTimeoutRef.current).forEach(timeout => clearTimeout(timeout));

            // Save all unsaved answers before submitting
            const unsavedQuestions = Object.keys(answers)
                .map(Number)
                .filter(qId => !savedAnswers.has(qId));

            if (unsavedQuestions.length > 0) {
                await Promise.all(
                    unsavedQuestions.map(qId =>
                        api.post('/exams/save-answer', {
                            submission_id: submissionId,
                            question_id: qId,
                            answer: answers[qId]
                        }).catch(err => console.error('Error saving answer:', err))
                    )
                );
            }

            // Submit the exam
            await api.post('/exams/submit', { submission_id: submissionId });

            // Redirect to results
            router.push('/student/results');
        } catch (err: any) {
            const errMsg = err.response?.data?.error || 'Gagal mengirim jawaban';
            alert(errMsg);

            // Jika error karena sudah submit, redirect ke results
            if (errMsg.includes('sudah') || errMsg.includes('already')) {
                router.push('/student/results');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const currentQuestion = exam?.questions[currentQuestionIndex];
    const answeredCount = Object.keys(answers).length;
    const totalQuestions = exam?.questions.length || 0;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#112C70] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Memuat ujian...</p>
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
                    <p className="text-gray-600 text-center mb-6">{error}</p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => router.push('/student/exams')}
                            className="flex-1 py-2 px-4 text-white rounded-lg"
                            style={{ background: 'linear-gradient(135deg, #0B2353 0%, #112C70 100%)' }}
                        >
                            Daftar Ujian
                        </button>
                        {error.includes('sudah') && (
                            <button
                                onClick={() => router.push('/student/results')}
                                className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                            >
                                Lihat Hasil
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Prevent access if exam hasn't loaded properly
    if (!submissionId) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#112C70] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Mempersiapkan ujian...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
            {/* Fixed Header */}
            <header className="fixed top-0 left-0 right-0 z-50 shadow-lg" style={{ background: 'linear-gradient(135deg, #0B2353 0%, #112C70 100%)' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div>
                            <h1 className="text-white text-xl font-bold">{exam.title}</h1>
                            <p className="text-white text-sm opacity-90">👤 {user?.username}</p>
                        </div>
                        <div className="flex items-center space-x-6">
                            {/* Auto-save indicator */}
                            <div className="flex items-center text-white text-sm">
                                {Object.keys(answers).some(qId => !savedAnswers.has(Number(qId))) ? (
                                    <>
                                        <svg className="w-4 h-4 mr-1 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        <span className="opacity-90">Menyimpan...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="opacity-90">Tersimpan</span>
                                    </>
                                )}
                            </div>

                            {/* Timer */}
                            <div className="flex items-center bg-white px-4 py-2 rounded-lg shadow-md">
                                <svg className="w-5 h-5 mr-2 text-[#112C70]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className={`font-mono text-lg font-bold ${seconds < 300 ? 'animate-pulse text-red-600' : 'text-gray-800'}`}>
                                    {formatTime()}
                                </span>
                            </div>

                            {/* Submit Button */}
                            <button
                                onClick={() => setShowConfirmModal(true)}
                                disabled={submitting}
                                className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition disabled:opacity-50 flex items-center gap-2"
                            >
                                {submitting ? (
                                    <>
                                        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Mengirim...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Selesai
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="pt-24 pb-8 px-4">
                <div className="max-w-7xl mx-auto flex gap-6">
                    {/* Sidebar - Question Navigator */}
                    <div className="w-64 flex-shrink-0">
                        <div className="bg-white rounded-xl shadow-lg p-4 sticky top-24">
                            <h3 className="font-bold text-gray-800 mb-4 text-center">Navigasi Soal</h3>

                            {/* Progress Info */}
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                <div className="text-sm text-gray-600 mb-1">Progress:</div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs text-gray-600">{answeredCount} dari {totalQuestions}</span>
                                    <span className="text-xs font-semibold text-[#112C70]">{Math.round((answeredCount / totalQuestions) * 100)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="h-2 rounded-full transition-all"
                                        style={{
                                            width: `${(answeredCount / totalQuestions) * 100}%`,
                                            background: 'linear-gradient(135deg, #0B2353 0%, #112C70 100%)'
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Question Numbers Grid */}
                            <div className="grid grid-cols-5 gap-2 max-h-[calc(100vh-350px)] overflow-y-auto pr-1">
                                {exam.questions.map((q, index) => (
                                    <button
                                        key={q.id}
                                        onClick={() => setCurrentQuestionIndex(index)}
                                        className={`w-10 h-10 rounded-lg font-semibold transition relative text-sm ${currentQuestionIndex === index
                                            ? 'text-white shadow-lg'
                                            : doubtfulQuestions.has(q.id)
                                                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                                : answers[q.id]
                                                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        style={currentQuestionIndex === index ? { background: 'linear-gradient(135deg, #0B2353 0%, #112C70 100%)' } : {}}
                                    >
                                        {index + 1}
                                        {doubtfulQuestions.has(q.id) && (
                                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full border-2 border-white"></span>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Legend */}
                            <div className="mt-4 pt-4 border-t border-gray-200 space-y-2 text-xs">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-green-100 border border-green-200"></div>
                                    <span className="text-gray-600">Terjawab</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-yellow-100 border border-yellow-200"></div>
                                    <span className="text-gray-600">Ragu-ragu</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-gray-100 border border-gray-200"></div>
                                    <span className="text-gray-600">Belum dijawab</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1">

                        {/* Question Card */}
                        {currentQuestion && (
                            <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
                                <div className="flex items-center justify-between mb-6">
                                    <span className="px-3 py-1 bg-[#112C70] text-white text-sm font-semibold rounded-full">
                                        Soal {currentQuestionIndex + 1} dari {totalQuestions}
                                    </span>
                                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${answers[currentQuestion.id] ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                        {answers[currentQuestion.id] ? '✓ Terjawab' : 'Belum dijawab'}
                                    </span>
                                </div>

                                {/* Question Text */}
                                <LatexRenderer
                                    content={currentQuestion.question_text}
                                    className="text-xl font-semibold text-gray-800 mb-6 leading-relaxed prose prose-img:max-w-full prose-img:rounded-lg prose-img:shadow-md"
                                />

                                {/* Answer Options */}
                                <div className="space-y-3">
                                    {currentQuestion.question_type === 'multiple_choice' && (() => {
                                        // Convert options to array if it's an object {A: "...", B: "...", C: "...", D: "..."}
                                        let optionsArray: string[] = [];
                                        if (Array.isArray(currentQuestion.options)) {
                                            optionsArray = currentQuestion.options;
                                        } else if (typeof currentQuestion.options === 'object' && currentQuestion.options !== null) {
                                            // Convert object to array in order: A, B, C, D, E, etc.
                                            const optionsObj = currentQuestion.options as { [key: string]: string };
                                            optionsArray = Object.keys(optionsObj)
                                                .sort()
                                                .map(key => optionsObj[key]);
                                        }

                                        return optionsArray.map((option, index) => {
                                            const optionLabel = String.fromCharCode(65 + index); // A, B, C, D
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
                                        });
                                    })()}

                                    {currentQuestion.question_type === 'essay' && (
                                        <textarea
                                            value={answers[currentQuestion.id] || ''}
                                            onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                                            placeholder="Tulis jawaban Anda di sini..."
                                            className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-[#112C70] focus:ring-2 focus:ring-blue-100 outline-none min-h-[200px] resize-y"
                                        />
                                    )}

                                    {currentQuestion.question_type === 'true_false' && (
                                        <>
                                            {[{ label: 'Benar', value: 'A' }, { label: 'Salah', value: 'B' }].map((option) => {
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
                                        </>
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
                            </div>
                        )}

                        {/* Navigation */}
                        <div className="flex justify-between items-center">
                            <button
                                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                                disabled={currentQuestionIndex === 0}
                                className="px-6 py-3 bg-gray-800 text-white rounded-lg font-semibold shadow-md hover:bg-gray-900 hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Sebelumnya
                            </button>

                            <button
                                onClick={() => setCurrentQuestionIndex(prev => Math.min(exam.questions.length - 1, prev + 1))}
                                disabled={currentQuestionIndex === exam.questions.length - 1}
                                className="px-6 py-3 bg-gray-800 text-white rounded-lg font-semibold shadow-md hover:bg-gray-900 hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                                Selanjutnya
                                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirm Submit Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Konfirmasi Pengiriman</h3>
                            <p className="text-gray-600 mb-4">
                                Anda telah menjawab {answeredCount} dari {totalQuestions} soal.
                            </p>
                            {answeredCount < totalQuestions && (
                                <p className="text-orange-600 font-semibold">
                                    {totalQuestions - answeredCount} soal belum terjawab!
                                </p>
                            )}
                        </div>
                        <p className="text-gray-700 text-center mb-6">
                            Apakah Anda yakin ingin mengakhiri ujian?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition"
                            >
                                Batal
                            </button>
                            <button
                                onClick={() => handleSubmit(false)}
                                disabled={submitting}
                                className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition disabled:opacity-50"
                            >
                                {submitting ? 'Mengirim...' : 'Ya, Kirim'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
