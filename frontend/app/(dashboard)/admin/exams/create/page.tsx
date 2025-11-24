'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

export default function CreateExamPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        duration: '60',
        start_time: '',
        end_time: ''
    });

    useEffect(() => {
        fetchQuestions();
    }, []);

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
                duration: parseInt(formData.duration) || 60,
                question_ids: selectedQuestions
            };

            await api.post('/exams', payload);
            router.push('/admin/exams');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Gagal membuat ujian');
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

    const toggleSelectAll = () => {
        if (selectedQuestions.length === questions.length) {
            // Unselect all
            setSelectedQuestions([]);
        } else {
            // Select all
            setSelectedQuestions(questions.map(q => q.id));
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return 'bg-green-100 text-green-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'hard': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

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
                    <h2 className="text-3xl font-bold text-gray-800 mb-6">Buat Ujian Baru</h2>

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
                                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
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
                                    Pilih Soal ({selectedQuestions.length} dari {questions.length} soal dipilih)
                                </label>
                                {questions.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={toggleSelectAll}
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#112C70] bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedQuestions.length === questions.length}
                                            onChange={() => { }}
                                            className="w-4 h-4 text-[#112C70] rounded focus:ring-[#112C70]"
                                        />
                                        {selectedQuestions.length === questions.length ? 'Batalkan Pilih Semua' : 'Pilih Semua Soal'}
                                    </button>
                                )}
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
                                                className={`flex items-start p-4 cursor-pointer hover:bg-gray-50 transition ${selectedQuestions.includes(question.id) ? 'bg-blue-50' : ''
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
                                                    <p className="text-gray-800">{question.question_text}</p>
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
                        <div className="flex gap-4 pt-6">
                            <button
                                type="submit"
                                disabled={loading || selectedQuestions.length === 0}
                                className="flex-1 py-3 px-6 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ background: loading ? '#9ca3af' : 'linear-gradient(135deg, #0B2353 0%, #112C70 100%)' }}
                            >
                                {loading ? 'Menyimpan...' : 'Buat Ujian'}
                            </button>
                            <Link
                                href="/admin/exams"
                                className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition text-center"
                            >
                                Batal
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
