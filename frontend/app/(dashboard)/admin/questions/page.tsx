'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
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
    created_at: string;
}

export default function AdminQuestionsPage() {
    const { user, logout } = useAuth();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSubject, setFilterSubject] = useState('');
    const [filterDifficulty, setFilterDifficulty] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
    const [deleting, setDeleting] = useState(false);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchQuestions();
    }, [filterSubject, filterDifficulty]);

    const fetchQuestions = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            params.append('limit', '1000'); // Ambil semua soal
            if (filterSubject) params.append('subject', filterSubject);
            if (filterDifficulty) params.append('difficulty', filterDifficulty);

            const response = await api.get(`/questions?${params.toString()}`);
            setQuestions(response.data.questions || []);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Gagal memuat soal');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Apakah Anda yakin ingin menghapus soal ini?')) return;

        try {
            await api.delete(`/questions/${id}`);
            setSelectedQuestions(prev => prev.filter(qId => qId !== id));
            fetchQuestions();
        } catch (err: any) {
            alert(err.response?.data?.error || 'Gagal menghapus soal');
        }
    };

    const handleBulkDelete = async () => {
        if (selectedQuestions.length === 0) {
            alert('Pilih soal yang ingin dihapus terlebih dahulu!');
            return;
        }

        if (!confirm(`Apakah Anda yakin ingin menghapus ${selectedQuestions.length} soal yang dipilih?`)) return;

        try {
            setDeleting(true);
            // Delete all selected questions
            await Promise.all(selectedQuestions.map(id => api.delete(`/questions/${id}`)));
            setSelectedQuestions([]);
            fetchQuestions();
            alert(`Berhasil menghapus ${selectedQuestions.length} soal`);
        } catch (err: any) {
            alert(err.response?.data?.error || 'Gagal menghapus beberapa soal');
        } finally {
            setDeleting(false);
        }
    };

    const toggleSelectAll = () => {
        if (selectedQuestions.length === currentQuestions.length) {
            // Deselect all on current page
            const currentIds = currentQuestions.map(q => q.id);
            setSelectedQuestions(prev => prev.filter(id => !currentIds.includes(id)));
        } else {
            // Select all on current page
            const currentIds = currentQuestions.map(q => q.id);
            setSelectedQuestions(prev => {
                const newSelected = [...prev];
                currentIds.forEach(id => {
                    if (!newSelected.includes(id)) {
                        newSelected.push(id);
                    }
                });
                return newSelected;
            });
        }
    };

    const toggleSelectQuestion = (id: number) => {
        setSelectedQuestions(prev => {
            if (prev.includes(id)) {
                return prev.filter(qId => qId !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    const filteredQuestions = questions.filter(q =>
        q.question_text.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination calculation
    const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentQuestions = filteredQuestions.slice(startIndex, endIndex);

    // Check if all questions on current page are selected
    const isAllCurrentPageSelected = currentQuestions.length > 0 &&
        currentQuestions.every(q => selectedQuestions.includes(q.id));

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
        setSelectedQuestions([]); // Clear selections when filters change
    }, [searchTerm, filterSubject, filterDifficulty]);

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
                            <h1 className="text-white text-xl font-bold">CBT System - Admin</h1>
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

            {/* Sidebar & Content */}
            <div className="flex">
                {/* Sidebar */}
                <aside className="w-64 min-h-screen bg-white shadow-lg">
                    <nav className="p-4 space-y-2">
                        <Link href="/admin/questions" className="flex items-center px-4 py-3 text-white rounded-lg" style={{ background: 'linear-gradient(135deg, #0B2353 0%, #112C70 100%)' }}>
                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Bank Soal
                        </Link>
                        <Link href="/admin/exams" className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition">
                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Ujian
                        </Link>
                        <Link href="/admin/users" className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition">
                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            Pengguna
                        </Link>
                        <Link href="/admin/reports" className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition">
                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Laporan
                        </Link>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-8">
                    <div className="max-w-7xl mx-auto">
                        {/* Header Section */}
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-gray-800 mb-2">Bank Soal</h2>
                            <p className="text-gray-600">Kelola soal ujian Anda</p>
                        </div>

                        {/* Actions & Filters */}
                        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                                {/* Search */}
                                <div className="flex-1 w-full md:w-auto">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Cari soal..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#112C70] focus:border-transparent"
                                        />
                                        <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Filters */}
                                <div className="flex gap-3 w-full md:w-auto">
                                    <select
                                        value={filterDifficulty}
                                        onChange={(e) => setFilterDifficulty(e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#112C70] focus:border-transparent"
                                    >
                                        <option value="">Semua Tingkat</option>
                                        <option value="easy">Mudah</option>
                                        <option value="medium">Sedang</option>
                                        <option value="hard">Sulit</option>
                                    </select>

                                    <Link
                                        href="/admin/questions/create"
                                        className="px-6 py-2 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition flex items-center"
                                        style={{ background: 'linear-gradient(135deg, #0B2353 0%, #112C70 100%)' }}
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Tambah Soal
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Questions List */}
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#112C70] mx-auto"></div>
                                <p className="mt-4 text-gray-600">Memuat soal...</p>
                            </div>
                        ) : error ? (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                                {error}
                            </div>
                        ) : filteredQuestions.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-md p-12 text-center">
                                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                                <p className="text-gray-600 text-lg">Belum ada soal</p>
                                <Link href="/admin/questions/create" className="inline-block mt-4 px-6 py-2 text-white rounded-lg" style={{ background: 'linear-gradient(135deg, #0B2353 0%, #112C70 100%)' }}>
                                    Tambah Soal Pertama
                                </Link>
                            </div>
                        ) : (
                            <>
                                {/* Questions Stats & Bulk Actions */}
                                <div className="bg-white rounded-xl shadow-md p-4 mb-4">
                                    <div className="flex items-center justify-between flex-wrap gap-4">
                                        <div className="flex items-center gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={isAllCurrentPageSelected}
                                                    onChange={toggleSelectAll}
                                                    className="w-5 h-5 text-[#112C70] border-gray-300 rounded focus:ring-2 focus:ring-[#112C70]"
                                                />
                                                <span className="text-sm font-semibold text-gray-700">
                                                    Pilih Semua di Halaman Ini
                                                </span>
                                            </label>
                                            {selectedQuestions.length > 0 && (
                                                <button
                                                    onClick={handleBulkDelete}
                                                    disabled={deleting}
                                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-semibold disabled:opacity-50 flex items-center gap-2"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    {deleting ? 'Menghapus...' : `Hapus ${selectedQuestions.length} Soal`}
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <p className="text-gray-600">
                                                Menampilkan <span className="font-semibold">{startIndex + 1}</span> - <span className="font-semibold">{Math.min(endIndex, filteredQuestions.length)}</span> dari <span className="font-semibold">{filteredQuestions.length}</span> soal
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Halaman {currentPage} dari {totalPages}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-4">
                                    {currentQuestions.map((question) => (
                                        <div key={question.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-6">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start gap-4 flex-1">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedQuestions.includes(question.id)}
                                                        onChange={() => toggleSelectQuestion(question.id)}
                                                        className="mt-1 w-5 h-5 text-[#112C70] border-gray-300 rounded focus:ring-2 focus:ring-[#112C70]"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(question.difficulty)}`}>
                                                                {question.difficulty === 'easy' ? 'Mudah' : question.difficulty === 'medium' ? 'Sedang' : 'Sulit'}
                                                            </span>
                                                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                                                {question.subject}
                                                            </span>
                                                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                                                                {question.points} poin
                                                            </span>
                                                        </div>
                                                        <LatexRenderer
                                                            content={question.question_text}
                                                            className="text-gray-800 text-lg mb-2 prose prose-img:max-w-xs prose-img:rounded prose-img:shadow line-clamp-2"
                                                        />
                                                        <p className="text-sm text-gray-500">
                                                            Tipe: {question.question_type === 'multiple_choice' ? 'Pilihan Ganda' : question.question_type === 'true_false' ? 'Benar/Salah' : 'Essay'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 ml-4 flex-shrink-0">
                                                    <Link
                                                        href={`/admin/questions/${question.id}/preview`}
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                                                        title="Preview/Testing"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </Link>
                                                    <Link
                                                        href={`/admin/questions/${question.id}/edit`}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                        title="Edit"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(question.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                        title="Hapus"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="bg-white rounded-xl shadow-md p-6 mt-6">
                                        <div className="flex items-center justify-between">
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                disabled={currentPage === 1}
                                                className={`flex items-center px-4 py-2 rounded-lg font-semibold transition ${currentPage === 1
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    : 'bg-[#112C70] text-white hover:bg-[#0B2353]'
                                                    }`}
                                            >
                                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                </svg>
                                                Sebelumnya
                                            </button>

                                            <div className="flex gap-2">
                                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                                    // Show first page, last page, current page, and pages around current
                                                    if (
                                                        page === 1 ||
                                                        page === totalPages ||
                                                        (page >= currentPage - 1 && page <= currentPage + 1)
                                                    ) {
                                                        return (
                                                            <button
                                                                key={page}
                                                                onClick={() => setCurrentPage(page)}
                                                                className={`w-10 h-10 rounded-lg font-semibold transition ${currentPage === page
                                                                    ? 'bg-[#112C70] text-white'
                                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                                    }`}
                                                            >
                                                                {page}
                                                            </button>
                                                        );
                                                    } else if (
                                                        page === currentPage - 2 ||
                                                        page === currentPage + 2
                                                    ) {
                                                        return <span key={page} className="w-10 h-10 flex items-center justify-center text-gray-400">...</span>;
                                                    }
                                                    return null;
                                                })}
                                            </div>

                                            <button
                                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                                disabled={currentPage === totalPages}
                                                className={`flex items-center px-4 py-2 rounded-lg font-semibold transition ${currentPage === totalPages
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    : 'bg-[#112C70] text-white hover:bg-[#0B2353]'
                                                    }`}
                                            >
                                                Selanjutnya
                                                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
