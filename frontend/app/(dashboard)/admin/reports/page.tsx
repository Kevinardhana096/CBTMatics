'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import api from '@/lib/api';

interface Exam {
    id: number;
    title: string;
    description: string;
    start_time: string;
    end_time: string;
}

interface ExamStats {
    exam_id: number;
    exam_title: string;
    total_submissions: number;
    average_score: number;
    completion_rate: number;
}

export default function AdminReportsPage() {
    const { user, logout } = useAuth();
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchExams();
    }, []);

    const fetchExams = async () => {
        try {
            setLoading(true);
            const response = await api.get('/exams');
            setExams(response.data.exams || []);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Gagal memuat data');
        } finally {
            setLoading(false);
        }
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getExamStatus = (startTime: string, endTime: string) => {
        const now = new Date();
        const start = new Date(startTime);
        const end = new Date(endTime);

        if (now < start) return { label: 'Akan Datang', color: 'bg-blue-100 text-blue-800' };
        if (now >= start && now <= end) return { label: 'Aktif', color: 'bg-green-100 text-green-800' };
        return { label: 'Selesai', color: 'bg-gray-100 text-gray-800' };
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
                        <Link href="/admin/questions" className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition">
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
                        <Link href="/admin/reports" className="flex items-center px-4 py-3 text-white rounded-lg" style={{ background: 'linear-gradient(135deg, #0B2353 0%, #112C70 100%)' }}>
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
                            <h2 className="text-3xl font-bold text-gray-800 mb-2">Laporan & Analitik</h2>
                            <p className="text-gray-600">Lihat statistik dan hasil ujian</p>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm mb-1">Total Ujian</p>
                                        <p className="text-3xl font-bold text-gray-800">{exams.length}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-md p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm mb-1">Ujian Aktif</p>
                                        <p className="text-3xl font-bold text-green-600">
                                            {exams.filter(e => {
                                                const now = new Date();
                                                return now >= new Date(e.start_time) && now <= new Date(e.end_time);
                                            }).length}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-md p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm mb-1">Akan Datang</p>
                                        <p className="text-3xl font-bold text-yellow-600">
                                            {exams.filter(e => new Date() < new Date(e.start_time)).length}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                        <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-md p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm mb-1">Selesai</p>
                                        <p className="text-3xl font-bold text-gray-600">
                                            {exams.filter(e => new Date() > new Date(e.end_time)).length}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Exam Reports List */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-6">Laporan Per Ujian</h3>

                            {loading ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#112C70] mx-auto"></div>
                                    <p className="mt-4 text-gray-600">Memuat data...</p>
                                </div>
                            ) : error ? (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                                    {error}
                                </div>
                            ) : exams.length === 0 ? (
                                <div className="text-center py-12">
                                    <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    <p className="text-gray-600 text-lg">Belum ada ujian untuk ditampilkan</p>
                                    <Link
                                        href="/admin/exams/create"
                                        className="inline-block mt-4 px-6 py-2 text-white rounded-lg"
                                        style={{ background: 'linear-gradient(135deg, #0B2353 0%, #112C70 100%)' }}
                                    >
                                        Buat Ujian Baru
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {exams.map((exam) => {
                                        const status = getExamStatus(exam.start_time, exam.end_time);
                                        return (
                                            <div key={exam.id} className="border border-gray-200 rounded-lg p-6 hover:border-[#112C70] transition">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <h4 className="text-lg font-bold text-gray-800">{exam.title}</h4>
                                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                                                                {status.label}
                                                            </span>
                                                        </div>
                                                        <p className="text-gray-600 text-sm">{exam.description}</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                                                    <div className="flex items-center text-gray-600">
                                                        <svg className="w-5 h-5 mr-2 text-[#112C70]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        Mulai: {formatDateTime(exam.start_time)}
                                                    </div>
                                                    <div className="flex items-center text-gray-600">
                                                        <svg className="w-5 h-5 mr-2 text-[#112C70]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        Selesai: {formatDateTime(exam.end_time)}
                                                    </div>
                                                </div>

                                                <div className="flex gap-3">
                                                    <Link
                                                        href={`/admin/reports/exam/${exam.id}`}
                                                        className="px-4 py-2 text-white rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition flex items-center"
                                                        style={{ background: 'linear-gradient(135deg, #0B2353 0%, #112C70 100%)' }}
                                                    >
                                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                        </svg>
                                                        Lihat Laporan Detail
                                                    </Link>
                                                    <Link
                                                        href={`/admin/reports/exam/${exam.id}/analytics`}
                                                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold transition flex items-center"
                                                    >
                                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                                                        </svg>
                                                        Analitik Soal
                                                    </Link>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
