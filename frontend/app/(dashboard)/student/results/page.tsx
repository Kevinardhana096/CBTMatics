'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import api from '@/lib/api';

interface Result {
    submission_id: number;
    exam_id: number;
    exam_title: string;
    exam_description: string;
    score: number;
    submitted_at: string;
    status: string;
}

export default function StudentResultsPage() {
    const { user, logout } = useAuth();
    const [results, setResults] = useState<Result[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchResults();
    }, []);

    const fetchResults = async () => {
        try {
            setLoading(true);
            const response = await api.get('/exams/my-results');
            setResults(response.data.results || []);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Gagal memuat hasil ujian');
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

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'submitted':
            case 'completed':
                return <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">Selesai</span>;
            case 'grading':
                return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">Sedang Dinilai</span>;
            case 'in_progress':
                return <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">Sedang Dikerjakan</span>;
            default:
                return <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded-full">{status}</span>;
        }
    };

    const calculateAverageScore = () => {
        if (results.length === 0) return 0;
        const total = results.reduce((sum, result) => sum + (result.score || 0), 0);
        const avg = total / results.length;
        return isNaN(avg) ? 0 : Math.round(avg);
    };

    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
            {/* Header */}
            <nav className="shadow-md" style={{ background: 'linear-gradient(135deg, #0B2353 0%, #112C70 100%)' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-white text-xl font-bold">CBT System - Student</h1>
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
                        <Link href="/student/exams" className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition">
                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Ujian Tersedia
                        </Link>
                        <Link href="/student/results" className="flex items-center px-4 py-3 text-white rounded-lg" style={{ background: 'linear-gradient(135deg, #0B2353 0%, #112C70 100%)' }}>
                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                            Hasil Ujian
                        </Link>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-8">
                    <div className="max-w-6xl mx-auto">
                        {/* Header Section */}
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-gray-800 mb-2">Hasil Ujian</h2>
                            <p className="text-gray-600">Lihat hasil ujian yang telah Anda kerjakan</p>
                        </div>

                        {/* Statistics Cards */}
                        {!loading && results.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-white rounded-xl shadow-md p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-gray-600 text-sm mb-1">Total Ujian</p>
                                            <p className="text-3xl font-bold text-gray-800">{results.length}</p>
                                        </div>
                                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                            <svg className="w-6 h-6 text-[#112C70]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl shadow-md p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-gray-600 text-sm mb-1">Rata-rata Nilai</p>
                                            <p className={`text-3xl font-bold ${getScoreColor(calculateAverageScore())}`}>
                                                {calculateAverageScore()}
                                            </p>
                                        </div>
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getScoreBgColor(calculateAverageScore())}`}>
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl shadow-md p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-gray-600 text-sm mb-1">Nilai Tertinggi</p>
                                            <p className="text-3xl font-bold text-green-600">
                                                {results.length > 0 ? Math.max(...results.map(r => r.score || 0)) : 0}
                                            </p>
                                        </div>
                                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Results List */}
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#112C70] mx-auto"></div>
                                <p className="mt-4 text-gray-600">Memuat hasil ujian...</p>
                            </div>
                        ) : error ? (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                                {error}
                            </div>
                        ) : results.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-md p-12 text-center">
                                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                </svg>
                                <p className="text-gray-600 text-lg mb-4">Belum ada hasil ujian</p>
                                <Link
                                    href="/student/exams"
                                    className="inline-block px-6 py-3 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition"
                                    style={{ background: 'linear-gradient(135deg, #0B2353 0%, #112C70 100%)' }}
                                >
                                    Lihat Ujian Tersedia
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {results.map((result) => (
                                    <div key={result.submission_id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden">
                                        <div className="p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1">
                                                    <h3 className="text-xl font-bold text-gray-800 mb-2">{result.exam_title}</h3>
                                                    <p className="text-gray-600 text-sm">{result.exam_description}</p>
                                                </div>
                                                {getStatusBadge(result.status)}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                {/* Score */}
                                                <div className={`p-4 rounded-lg ${getScoreBgColor(result.score)}`}>
                                                    <p className="text-sm text-gray-600 mb-1">Nilai</p>
                                                    <p className={`text-4xl font-bold ${getScoreColor(result.score)}`}>
                                                        {result.score}
                                                    </p>
                                                </div>

                                                {/* Submission Date */}
                                                <div className="p-4 bg-gray-50 rounded-lg">
                                                    <p className="text-sm text-gray-600 mb-1">Tanggal Pengerjaan</p>
                                                    <p className="text-sm font-semibold text-gray-800">
                                                        {formatDateTime(result.submitted_at)}
                                                    </p>
                                                </div>

                                                {/* Grade */}
                                                <div className="p-4 bg-gray-50 rounded-lg">
                                                    <p className="text-sm text-gray-600 mb-1">Predikat</p>
                                                    <p className={`text-lg font-bold ${getScoreColor(result.score)}`}>
                                                        {result.score >= 80 ? 'Sangat Baik' : result.score >= 60 ? 'Baik' : 'Kurang'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* View Details Button */}
                                            <div className="mt-4">
                                                <Link
                                                    href={`/student/results/${result.submission_id}`}
                                                    className="inline-flex items-center px-4 py-2 text-sm text-white rounded-lg font-semibold transition hover:opacity-90"
                                                    style={{ background: 'linear-gradient(135deg, #0B2353 0%, #112C70 100%)' }}
                                                >
                                                    Lihat Detail
                                                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
