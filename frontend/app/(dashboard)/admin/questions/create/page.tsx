'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { RichTextEditor } from '@/components/ui/RichTextEditor';

export default function CreateQuestionPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showImport, setShowImport] = useState(false);
    const [importing, setImporting] = useState(false);
    const [importResult, setImportResult] = useState<any>(null);

    const [formData, setFormData] = useState({
        question_text: '',
        question_type: 'multiple_choice',
        subject: '',
        difficulty: 'medium',
        points: 10,
        correct_answer: '',
        options: {
            A: '',
            B: '',
            C: '',
            D: ''
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Format data sesuai dengan backend
            const payload: any = {
                question_text: formData.question_text,
                question_type: formData.question_type,
                subject: formData.subject,
                difficulty: formData.difficulty,
                points: formData.points,
                correct_answer: formData.correct_answer,
            };

            // Untuk multiple choice, kirim sebagai object (bukan array)
            if (formData.question_type === 'multiple_choice') {
                payload.options = {
                    A: formData.options.A,
                    B: formData.options.B,
                    C: formData.options.C,
                    D: formData.options.D
                };
            } else if (formData.question_type === 'true_false') {
                payload.options = {
                    A: 'Benar',
                    B: 'Salah'
                };
            } else {
                payload.options = null;
            }

            await api.post('/questions', payload);
            router.push('/admin/questions');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Gagal membuat soal');
        } finally {
            setLoading(false);
        }
    };

    const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['.xlsx', '.xls', '.csv', '.zip'];
        const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
        if (!allowedTypes.includes(fileExt)) {
            setError('Format file tidak valid. Gunakan file Excel (.xlsx, .xls), CSV, atau ZIP');
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Ukuran file terlalu besar. Maksimal 5MB');
            return;
        }

        setImporting(true);
        setError('');
        setImportResult(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await api.post('/questions/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setImportResult(response.data);

            // If successful, redirect after 3 seconds
            if (response.data.success > 0) {
                setTimeout(() => {
                    router.push('/admin/questions');
                }, 3000);
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Gagal mengimport soal');
        } finally {
            setImporting(false);
        }
    };

    const downloadTemplate = (type: 'basic' | 'matematika' = 'basic') => {
        let csvContent = '';
        let filename = '';

        if (type === 'matematika') {
            // Template Matematika dengan gambar
            csvContent = `question_text,question_type,options,correct_answer,subject,difficulty,points
"Berapa banyak cara menyusun 5 orang dalam satu barisan?",multiple_choice,"120|720|24|5040",A,Kombinatorika,easy,10
"Dalam suatu kelas terdapat 10 siswa laki-laki dan 8 siswa perempuan. Berapa banyak cara memilih 3 siswa yang terdiri dari 2 laki-laki dan 1 perempuan?",multiple_choice,"360|720|180|540",A,Kombinatorika,medium,15
"<p>Berapa banyak cara membagi 12 bola identik ke dalam 4 kotak yang berbeda?</p>",multiple_choice,"455|364|495|220",A,Kombinatorika,medium,15
"Tentukan apakah himpunan bilangan bulat dengan operasi penjumlahan membentuk grup?",multiple_choice,"Ya karena tertutup dan memiliki elemen identitas|Tidak karena tidak memiliki invers|Ya karena komutatif|Tidak karena tidak asosiatif",A,Struktur Aljabar,medium,15
"Jika A adalah matriks 3×3 dan det(A) = 5 maka det(2A) = ?",multiple_choice,"10|40|25|5",B,Aljabar Linear,medium,15
"Rank dari matriks nol 4×4 adalah?",multiple_choice,"0|1|4|Tidak terdefinisi",A,Aljabar Linear,easy,10
"Fungsi f(z) = z² adalah fungsi analitik untuk?",multiple_choice,"Semua z ∈ ℂ|Hanya z ≠ 0|Hanya Re(z) > 0|Tidak ada z",A,Analisis Kompleks,medium,15
"Jika fungsi f: ℝ → ℝ kontinu di setiap titik maka f adalah?",multiple_choice,"Terintegral Riemann|Terdiferensiasi|Monoton|Terbatas",A,Analisis Riil,medium,15`;
            filename = 'template_soal_matematika.csv';
        } else {
            // Template basic
            csvContent = `question_text,question_type,options,correct_answer,subject,difficulty,points
"Berapa hasil dari 2 + 2?",multiple_choice,"2|3|4|5",C,Matematika,easy,10
"Ibu kota Indonesia adalah Jakarta",true_false,"Benar|Salah",A,IPS,easy,5
"Jelaskan proses fotosintesis",essay,null,"Fotosintesis adalah proses...",Biologi,medium,20
"<p>Contoh soal dengan <strong>HTML formatting</strong></p>",multiple_choice,"Pilihan A|Pilihan B|Pilihan C|Pilihan D",A,Umum,easy,10`;
            filename = 'template_soal.csv';
        }

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    };

    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
            {/* Header */}
            <nav className="shadow-md" style={{ background: 'linear-gradient(135deg, #0B2353 0%, #112C70 100%)' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Link href="/admin/questions" className="text-white text-xl font-bold">
                                ← Kembali ke Bank Soal
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto p-8">
                <div className="bg-white rounded-xl shadow-lg p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-3xl font-bold text-gray-800">Buat Soal Baru</h2>
                        <button
                            type="button"
                            onClick={() => setShowImport(!showImport)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            {showImport ? 'Tutup Import' : 'Import dari File'}
                        </button>
                    </div>

                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                            {error}
                        </div>
                    )}

                    {importResult && (
                        <div className={`mb-6 border rounded-lg p-4 ${importResult.failed > 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'
                            }`}>
                            <h3 className="font-bold text-lg mb-2">Hasil Import</h3>
                            <div className="space-y-1 text-sm">
                                <p className="text-green-700">✓ Berhasil: {importResult.success} soal</p>
                                {importResult.failed > 0 && (
                                    <p className="text-red-700">✗ Gagal: {importResult.failed} soal</p>
                                )}
                                <p className="text-gray-700">Total: {importResult.total} baris</p>
                            </div>
                            {importResult.errors && importResult.errors.length > 0 && (
                                <div className="mt-3 max-h-32 overflow-y-auto">
                                    <p className="font-semibold text-sm text-gray-700 mb-1">Error Details:</p>
                                    <ul className="text-xs text-gray-600 space-y-1">
                                        {importResult.errors.map((err: any, idx: number) => (
                                            <li key={idx}>Baris {err.row}: {err.error}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {importResult.success > 0 && (
                                <p className="mt-3 text-sm text-gray-600">Mengalihkan ke daftar soal...</p>
                            )}
                        </div>
                    )}

                    {/* Import Section */}
                    {showImport && (
                        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Import Soal dari File</h3>

                            <div className="mb-4">
                                <div className="flex items-start gap-3 text-sm text-gray-700 mb-3">
                                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div>
                                        <p className="font-semibold mb-1">Format File:</p>
                                        <ul className="list-disc list-inside space-y-1 ml-2">
                                            <li>Gunakan file Excel (.xlsx, .xls), CSV, atau <strong>ZIP (dengan gambar)</strong></li>
                                            <li>Kolom: question_text, question_type, options, correct_answer, subject, difficulty, points</li>
                                            <li>question_type: multiple_choice, true_false, atau essay</li>
                                            <li>options untuk multiple_choice: format JSON array atau pisahkan dengan |</li>
                                            <li>correct_answer untuk multiple_choice: A, B, C, atau D</li>
                                            <li>difficulty: easy, medium, atau hard</li>
                                            <li><strong>Untuk soal dengan gambar:</strong> Upload file ZIP berisi CSV + folder images</li>
                                            <li>Kolom tambahan untuk ZIP: <code>image</code> (nama file gambar), <code>option_a_image</code>, <code>option_b_image</code>, dll</li>
                                            <li>Maksimal ukuran file: 5MB</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3 mb-4">
                                <button
                                    type="button"
                                    onClick={() => downloadTemplate('basic')}
                                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2 text-sm font-medium"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Template Basic
                                </button>
                                <button
                                    type="button"
                                    onClick={() => downloadTemplate('matematika')}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 text-sm font-medium"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                    Template Matematika
                                </button>
                            </div>

                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition">
                                <input
                                    type="file"
                                    accept=".xlsx,.xls,.csv,.zip"
                                    onChange={handleFileImport}
                                    disabled={importing}
                                    className="hidden"
                                    id="file-upload"
                                />
                                <label
                                    htmlFor="file-upload"
                                    className="cursor-pointer flex flex-col items-center"
                                >
                                    <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    <span className="text-sm text-gray-600 mb-1">
                                        {importing ? 'Mengupload dan memproses...' : 'Klik untuk upload file atau drag & drop'}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        Excel (.xlsx, .xls), CSV, atau ZIP dengan gambar (Maks. 5MB)
                                    </span>
                                </label>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Question Text with Rich Text Editor */}
                        <div className="relative">
                            <RichTextEditor
                                label="Pertanyaan *"
                                value={formData.question_text}
                                onChange={(value) => setFormData({ ...formData, question_text: value })}
                                placeholder="Tuliskan pertanyaan di sini... Gunakan toolbar untuk format teks, gambar, rumus matematika, dan video."
                                required
                            />
                        </div>

                        {/* Question Type */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Tipe Soal *
                            </label>
                            <select
                                value={formData.question_type}
                                onChange={(e) => setFormData({ ...formData, question_type: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#112C70] focus:border-transparent"
                            >
                                <option value="multiple_choice">Pilihan Ganda</option>
                                <option value="true_false">Benar/Salah</option>
                                <option value="essay">Essay</option>
                            </select>
                        </div>

                        {/* Options (for multiple choice) */}
                        {formData.question_type === 'multiple_choice' && (
                            <div className="space-y-3">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Pilihan Jawaban *
                                </label>
                                {['A', 'B', 'C', 'D'].map((option) => (
                                    <div key={option} className="flex items-center gap-3">
                                        <span className="font-semibold text-gray-700 w-8">{option}.</span>
                                        <input
                                            type="text"
                                            required
                                            value={formData.options[option as keyof typeof formData.options]}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                options: { ...formData.options, [option]: e.target.value }
                                            })}
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#112C70] focus:border-transparent"
                                            placeholder={`Pilihan ${option}`}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Correct Answer */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Jawaban Benar *
                            </label>
                            {formData.question_type === 'multiple_choice' ? (
                                <select
                                    required
                                    value={formData.correct_answer}
                                    onChange={(e) => setFormData({ ...formData, correct_answer: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#112C70] focus:border-transparent"
                                >
                                    <option value="">Pilih jawaban benar</option>
                                    <option value="A">A</option>
                                    <option value="B">B</option>
                                    <option value="C">C</option>
                                    <option value="D">D</option>
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    required
                                    value={formData.correct_answer}
                                    onChange={(e) => setFormData({ ...formData, correct_answer: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#112C70] focus:border-transparent"
                                    placeholder="Masukkan jawaban benar"
                                />
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Subject */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Mata Pelajaran *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#112C70] focus:border-transparent"
                                    placeholder="Matematika"
                                />
                            </div>

                            {/* Difficulty */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Tingkat Kesulitan *
                                </label>
                                <select
                                    value={formData.difficulty}
                                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#112C70] focus:border-transparent"
                                >
                                    <option value="easy">Mudah</option>
                                    <option value="medium">Sedang</option>
                                    <option value="hard">Sulit</option>
                                </select>
                            </div>

                            {/* Points */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Poin *
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    value={formData.points}
                                    onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#112C70] focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex gap-4 pt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-3 px-6 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition disabled:opacity-50"
                                style={{ background: loading ? '#9ca3af' : 'linear-gradient(135deg, #0B2353 0%, #112C70 100%)' }}
                            >
                                {loading ? 'Menyimpan...' : 'Simpan Soal'}
                            </button>
                            <Link
                                href="/admin/questions"
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
