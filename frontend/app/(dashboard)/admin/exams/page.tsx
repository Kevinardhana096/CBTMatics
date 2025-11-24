'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import api from '@/lib/api';

interface Exam {
    id: number;
    title: string;
    description: string;
    duration: number;
    start_time: string;
    end_time: string;
    created_by_name?: string;
    created_at: string;
}

export default function AdminExamsPage() {
    const { user, logout } = useAuth();
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchExams();
    }, []);

    const fetchExams = async () => {
        try {
            setLoading(true);
            const response = await api.get('/exams');
            setExams(response.data.exams || []);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Gagal memuat ujian');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Apakah Anda yakin ingin menghapus ujian ini?')) return;

        try {
            await api.delete(`/exams/${id}`);
            fetchExams();
        } catch (err: any) {
            alert(err.response?.data?.error || 'Gagal menghapus ujian');
        }
    };

    const filteredExams = exams.filter(exam =>
        exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                        <Link href="/admin/exams" className="flex items-center px-4 py-3 text-white rounded-lg" style={{ background: 'linear-gradient(135deg, #0B2353 0%, #112C70 100%)' }}>
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
                            <h2 className="text-3xl font-bold text-gray-800 mb-2">Kelola Ujian</h2>
                            <p className="text-gray-600">Buat dan kelola ujian untuk siswa</p>
                        </div>

                        {/* Actions & Search */}
                        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                                {/* Search */}
                                <div className="flex-1 w-full md:w-auto">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Cari ujian..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#112C70] focus:border-transparent"
                                        />
                                        <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Create Button */}
                                <Link
                                    href="/admin/exams/create"
                                    className="px-6 py-2 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition flex items-center"
                                    style={{ background: 'linear-gradient(135deg, #0B2353 0%, #112C70 100%)' }}
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Buat Ujian
                                </Link>
                            </div>
                        </div>

                        {/* Exams List */}
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#112C70] mx-auto"></div>
                                <p className="mt-4 text-gray-600">Memuat ujian...</p>
                            </div>
                        ) : error ? (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                                {error}
                            </div>
                        ) : filteredExams.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-md p-12 text-center">
                                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p className="text-gray-600 text-lg">Belum ada ujian</p>
                                <Link href="/admin/exams/create" className="inline-block mt-4 px-6 py-2 text-white rounded-lg" style={{ background: 'linear-gradient(135deg, #0B2353 0%, #112C70 100%)' }}>
                                    Buat Ujian Pertama
                                </Link>
                            </div>
                        ) : (
                            <div className="grid gap-6">
                                {filteredExams.map((exam) => {
                                    const status = getExamStatus(exam.start_time, exam.end_time);
                                    return (
                                        <div key={exam.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="text-xl font-bold text-gray-800">{exam.title}</h3>
                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                                                            {status.label}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-600 mb-3">{exam.description}</p>

                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                        <div className="flex items-center text-gray-600">
                                                            <svg className="w-5 h-5 mr-2 text-[#112C70]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            Durasi: {exam.duration} menit
                                                        </div>
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
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-3 pt-4 border-t border-gray-200">
                                                <Link
                                                    href={`/admin/exams/${exam.id}/simulate`}
                                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition flex items-center"
                                                >
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    Simulasi
                                                </Link>
                                                <Link
                                                    href={`/admin/reports/exam/${exam.id}`}
                                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition flex items-center"
                                                >
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                    </svg>
                                                    Lihat Laporan
                                                </Link>
                                                <Link
                                                    href={`/admin/exams/${exam.id}/edit`}
                                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition flex items-center"
                                                >
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(exam.id)}
                                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition flex items-center"
                                                >
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    Hapus
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
