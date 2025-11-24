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
    has_started?: boolean;
    has_submitted?: boolean;
}

interface ExamStatus {
    label: string;
    color: string;
    canStart: boolean;
}

export default function StudentExamsPage() {
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
            const response = await api.get('/exams/available');
            setExams(response.data.exams || []);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Gagal memuat ujian');
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

    const getExamStatus = (exam: Exam): ExamStatus => {
        const now = new Date();
        const start = new Date(exam.start_time);
        const end = new Date(exam.end_time);

        // Cek jika sudah submit
        if (exam.has_submitted) {
            return {
                label: 'Sudah Dikerjakan',
                color: 'bg-gray-100 text-gray-800',
                canStart: false
            };
        }

        // Cek jika sedang berlangsung
        if (now >= start && now <= end) {
            if (exam.has_started) {
                return {
                    label: 'Lanjutkan',
                    color: 'bg-orange-100 text-orange-800',
                    canStart: true
                };
            }
            return {
                label: 'Tersedia',
                color: 'bg-green-100 text-green-800',
                canStart: true
            };
        }

        // Cek jika belum dimulai
        if (now < start) {
            return {
                label: 'Akan Datang',
                color: 'bg-blue-100 text-blue-800',
                canStart: false
            };
        }

        // Jika sudah lewat waktu
        return {
            label: 'Selesai',
            color: 'bg-gray-100 text-gray-800',
            canStart: false
        };
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
                        <Link href="/student/exams" className="flex items-center px-4 py-3 text-white rounded-lg" style={{ background: 'linear-gradient(135deg, #0B2353 0%, #112C70 100%)' }}>
                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Ujian Tersedia
                        </Link>
                        <Link href="/student/results" className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition">
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
                            <h2 className="text-3xl font-bold text-gray-800 mb-2">Ujian Tersedia</h2>
                            <p className="text-gray-600">Pilih ujian yang ingin Anda kerjakan</p>
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
                        ) : exams.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-md p-12 text-center">
                                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p className="text-gray-600 text-lg">Belum ada ujian tersedia saat ini</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {exams.map((exam) => (
                                    <div key={exam.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden">
                                        <div className="p-6">
                                            {(() => {
                                                const status = getExamStatus(exam);
                                                return (
                                                    <>
                                                        {/* Exam Header */}
                                                        <div className="flex items-start justify-between mb-4">
                                                            <div className="flex-1">
                                                                <h3 className="text-xl font-bold text-gray-800 mb-2">{exam.title}</h3>
                                                                <p className="text-gray-600 text-sm line-clamp-2">{exam.description}</p>
                                                            </div>
                                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${status.color}`}>
                                                                {status.label}
                                                            </span>
                                                        </div>

                                                        {/* Exam Details */}
                                                        <div className="space-y-3 mb-6">
                                                            <div className="flex items-center text-sm text-gray-600">
                                                                <svg className="w-5 h-5 mr-2 text-[#112C70]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                                Durasi: {exam.duration} menit
                                                            </div>
                                                            <div className="flex items-center text-sm text-gray-600">
                                                                <svg className="w-5 h-5 mr-2 text-[#112C70]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                </svg>
                                                                Mulai: {formatDateTime(exam.start_time)}
                                                            </div>
                                                            <div className="flex items-center text-sm text-gray-600">
                                                                <svg className="w-5 h-5 mr-2 text-[#112C70]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                </svg>
                                                                Berakhir: {formatDateTime(exam.end_time)}
                                                            </div>
                                                        </div>

                                                        {/* Action Button */}
                                                        {status.canStart ? (
                                                            <Link
                                                                href={`/student/exam/${exam.id}`}
                                                                className="block w-full py-3 px-4 text-center text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition"
                                                                style={{ background: 'linear-gradient(135deg, #0B2353 0%, #112C70 100%)' }}
                                                            >
                                                                {exam.has_started ? 'Lanjutkan Ujian' : 'Mulai Ujian'}
                                                            </Link>
                                                        ) : (
                                                            <button
                                                                disabled
                                                                className="w-full py-3 px-4 text-center text-gray-500 bg-gray-200 rounded-lg font-semibold cursor-not-allowed"
                                                            >
                                                                {status.label === 'Akan Datang' ? 'Belum Tersedia' : status.label}
                                                            </button>
                                                        )}
                                                    </>
                                                );
                                            })()}
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
