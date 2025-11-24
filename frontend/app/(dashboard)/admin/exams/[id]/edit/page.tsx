'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

interface Question {
    id: number;
    question_text: string;
    question_type: string;
    subject: string;
    difficulty: string;
    points: number;
}

interface Exam {
    id: number;
    title: string;
    description: string;
    duration: number;
    start_time: string;
    end_time: string;
}

export default function EditExamPage() {
    const router = useRouter();
    const params = useParams();
    const examId = params.id as string;

    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);
    const [error, setError] = useState('');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        duration: 60,
        start_time: '',
        end_time: ''
    });

    useEffect(() => {
        fetchExamData();
        fetchQuestions();
    }, [examId]);

    const fetchExamData = async () => {
        try {
            const response = await api.get(`/exams/${examId}`);
            const exam = response.data.exam;
            const examQuestions = response.data.questions || [];

            // Format datetime for input[type="datetime-local"]
            const formatDateTime = (dateString: string) => {
                const date = new Date(dateString);
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                return `${year}-${month}-${day}T${hours}:${minutes}`;
            };

            setFormData({
                title: exam.title || '',
                description: exam.description || '',
                duration: exam.duration || 60,
                start_time: formatDateTime(exam.start_time),
                end_time: formatDateTime(exam.end_time)
            });

            // Set selected questions
            setSelectedQuestions(examQuestions.map((q: any) => q.id));
        } catch (err: any) {
            console.error('Error fetching exam:', err);
            setError('Gagal memuat data ujian');
        } finally {
            setFetchingData(false);
        }
    };

    const fetchQuestions = async () => {
        try {
            const response = await api.get('/questions?limit=100');
            setQuestions(response.data.questions || []);
        } catch (err: any) {
            console.error('Error fetching questions:', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (selectedQuestions.length === 0) {
            setError('Pilih minimal 1 soal untuk ujian');
            setLoading(false);
            return;
        }

        try {
            const payload = {
                ...formData,
                question_ids: selectedQuestions
            };

            await api.put(`/exams/${examId}`, payload);
            router.push('/admin/exams');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Gagal mengupdate ujian');
        } finally {
            setLoading(false);
        }
    };

    const toggleQuestion = (questionId: number) => {
        setSelectedQuestions(prev =>
            prev.includes(questionId)
                ? prev.filter(id => id !== questionId)
                : [...prev, questionId]
        );
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return 'bg-green-100 text-green-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'hard': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (fetchingData) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#112C70] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Memuat data ujian...</p>
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
                            <Link href="/admin/exams" className="text-white text-xl font-bold flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Kembali ke Ujian
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto p-8">
                <div className="bg-white rounded-xl shadow-lg p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-800">Edit Ujian</h2>
                    </div>

                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Judul Ujian *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#112C70] focus:border-transparent"
                                placeholder="Ujian Tengah Semester"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Deskripsi
                            </label>
                            <textarea
                                rows={3}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#112C70] focus:border-transparent"
                                placeholder="Deskripsi ujian..."
                            />
                        </div>

                        {/* Duration, Start Time, End Time */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Durasi (menit) *
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#112C70] focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Waktu Mulai *
                                </label>
                                <input
                                    type="datetime-local"
                                    required
                                    value={formData.start_time}
                                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#112C70] focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Waktu Selesai *
                                </label>
                                <input
                                    type="datetime-local"
                                    required
                                    value={formData.end_time}
                                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#112C70] focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Question Selection */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Pilih Soal
                                </label>
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                                    {selectedQuestions.length} soal dipilih
                                </span>
                            </div>

                            {questions.length === 0 ? (
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                                    <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                    </svg>
                                    <p className="text-gray-600 mb-4">Belum ada soal tersedia</p>
                                    <Link
                                        href="/admin/questions/create"
                                        className="inline-block px-6 py-2 text-white rounded-lg"
                                        style={{ background: 'linear-gradient(135deg, #0B2353 0%, #112C70 100%)' }}
                                    >
                                        Buat Soal Baru
                                    </Link>
                                </div>
                            ) : (
                                <div className="border border-gray-300 rounded-lg max-h-96 overflow-y-auto">
                                    <div className="divide-y divide-gray-200">
                                        {questions.map((question) => (
                                            <label
                                                key={question.id}
                                                className={`flex items-start p-4 cursor-pointer hover:bg-gray-50 transition ${selectedQuestions.includes(question.id) ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                                                    }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedQuestions.includes(question.id)}
                                                    onChange={() => toggleQuestion(question.id)}
                                                    className="mt-1 mr-4 w-5 h-5 text-[#112C70] rounded focus:ring-[#112C70]"
                                                />
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(question.difficulty)}`}>
                                                            {question.difficulty === 'easy' ? 'Mudah' : question.difficulty === 'medium' ? 'Sedang' : 'Sulit'}
                                                        </span>
                                                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                                            {question.subject}
                                                        </span>
                                                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                                                            {question.points} poin
                                                        </span>
                                                    </div>
                                                    <div
                                                        className="text-gray-800 line-clamp-2"
                                                        dangerouslySetInnerHTML={{ __html: question.question_text }}
                                                    />
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        Tipe: {question.question_type === 'multiple_choice' ? 'Pilihan Ganda' : question.question_type === 'true_false' ? 'Benar/Salah' : 'Essay'}
                                                    </p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex gap-4 pt-6 border-t border-gray-200">
                            <button
                                type="submit"
                                disabled={loading || selectedQuestions.length === 0}
                                className="flex-1 py-3 px-6 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                style={{ background: loading ? '#9ca3af' : 'linear-gradient(135deg, #0B2353 0%, #112C70 100%)' }}
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Simpan Perubahan
                                    </>
                                )}
                            </button>
                            <Link
                                href="/admin/exams"
                                className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition text-center flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Batal
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
