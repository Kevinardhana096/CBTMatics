'use client';

import React, { useRef, useState, useEffect } from 'react';
import katex from 'katex';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    required?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
    value,
    onChange,
    placeholder = 'Tulis pertanyaan di sini...',
    label,
    required = false
}) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showMathModal, setShowMathModal] = useState(false);
    const [mathInput, setMathInput] = useState('');
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [videoUrl, setVideoUrl] = useState('');
    const [isEmpty, setIsEmpty] = useState(!value);

    useEffect(() => {
        if (editorRef.current && value !== editorRef.current.innerHTML) {
            const currentCursor = window.getSelection();
            const cursorPosition = currentCursor?.focusOffset;
            const cursorNode = currentCursor?.focusNode;

            editorRef.current.innerHTML = value;
            setIsEmpty(!value || value.trim() === '' || value === '<br>');

            // Restore cursor position if possible
            if (cursorNode && editorRef.current.contains(cursorNode)) {
                try {
                    const range = document.createRange();
                    range.setStart(cursorNode, Math.min(cursorPosition || 0, cursorNode.textContent?.length || 0));
                    range.collapse(true);
                    currentCursor?.removeAllRanges();
                    currentCursor?.addRange(range);
                } catch (e) {
                    // Cursor restoration failed, that's okay
                    console.debug('Could not restore cursor position');
                }
            }
        }
    }, [value]);

    const handleInput = () => {
        if (editorRef.current) {
            // Force BLACK color on all text nodes
            const walker = document.createTreeWalker(
                editorRef.current,
                NodeFilter.SHOW_ELEMENT,
                null
            );

            let node;
            while (node = walker.nextNode()) {
                if (node instanceof HTMLElement) {
                    // Skip math and video elements
                    if (!node.classList.contains('math-formula') &&
                        !node.classList.contains('video-container')) {
                        (node as HTMLElement).style.color = '#000000';
                    }
                }
            }

            const content = editorRef.current.innerHTML;
            onChange(content);
            setIsEmpty(!content || content.trim() === '' || content === '<br>');
        }
    };

    const execCommand = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Hanya file gambar yang diperbolehkan');
            e.target.value = ''; // Reset input
            return;
        }

        // Check file size (max 2MB before compression)
        if (file.size > 2 * 1024 * 1024) {
            alert('Ukuran gambar terlalu besar. Maksimal 2MB. Gambar akan dikompres otomatis.');
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                try {
                    // Create canvas untuk resize dan compress
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Resize jika terlalu besar (max 800px width)
                    const maxWidth = 800;
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        alert('Gagal memproses gambar');
                        return;
                    }

                    ctx.drawImage(img, 0, 0, width, height);

                    // Convert ke base64 dengan quality 0.8 (kompresi JPEG)
                    const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);

                    // Focus editor dulu
                    editorRef.current?.focus();

                    // Insert image dengan spasi setelahnya
                    const imgHtml = `<img src="${compressedDataUrl}" alt="image" style="max-width: 100%; height: auto; margin: 10px 0; border-radius: 4px;" /><br/>`;
                    document.execCommand('insertHTML', false, imgHtml);

                    // Force update state after DOM mutation
                    setTimeout(() => {
                        handleInput();
                    }, 0);

                    // Reset input file
                    if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                    }

                    console.log('Image inserted successfully');
                } catch (error) {
                    console.error('Error processing image:', error);
                    alert('Gagal memproses gambar');
                }
            };

            img.onerror = () => {
                alert('Gagal memuat gambar');
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            };

            img.src = event.target?.result as string;
        };

        reader.onerror = () => {
            alert('Gagal membaca file');
            e.target.value = '';
        };

        reader.readAsDataURL(file);
    };

    const insertMath = () => {
        if (!mathInput.trim()) return;

        try {
            const mathHtml = katex.renderToString(mathInput, {
                throwOnError: false,
                displayMode: true
            });
            const mathElement = `<span class="math-formula" contenteditable="false" style="display: inline-block; margin: 10px 0; padding: 10px; background: #f8f9fa; border-radius: 4px;">${mathHtml}</span>&nbsp;`;
            document.execCommand('insertHTML', false, mathElement);
            handleInput();
            setShowMathModal(false);
            setMathInput('');
        } catch (error) {
            alert('Format LaTeX tidak valid');
        }
    };

    const insertVideo = () => {
        if (!videoUrl.trim()) return;

        let embedUrl = videoUrl;

        // Convert YouTube URL to embed format
        const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/;
        const youtubeMatch = videoUrl.match(youtubeRegex);
        if (youtubeMatch) {
            embedUrl = `https://www.youtube.com/embed/${youtubeMatch[1]}`;
        }

        const videoHtml = `<div class="video-container" contenteditable="false" style="position: relative; padding-bottom: 56.25%; height: 0; margin: 10px 0;">
            <iframe src="${embedUrl}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" allowfullscreen></iframe>
        </div><br/>`;

        document.execCommand('insertHTML', false, videoHtml);
        handleInput();
        setShowVideoModal(false);
        setVideoUrl('');
    };

    return (
        <div className="space-y-2">
            {label && (
                <label className="block text-sm font-semibold text-gray-700">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}

            {/* Toolbar */}
            <div className="border border-gray-300 rounded-t-lg bg-gray-50 p-2 flex flex-wrap gap-1">
                {/* Text Formatting */}
                <button
                    type="button"
                    onClick={() => execCommand('bold')}
                    className="p-2 hover:bg-gray-200 rounded transition"
                    title="Bold (Ctrl+B)"
                >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z" />
                    </svg>
                </button>
                <button
                    type="button"
                    onClick={() => execCommand('italic')}
                    className="p-2 hover:bg-gray-200 rounded transition"
                    title="Italic (Ctrl+I)"
                >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z" />
                    </svg>
                </button>
                <button
                    type="button"
                    onClick={() => execCommand('underline')}
                    className="p-2 hover:bg-gray-200 rounded transition"
                    title="Underline (Ctrl+U)"
                >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z" />
                    </svg>
                </button>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                {/* Lists */}
                <button
                    type="button"
                    onClick={() => execCommand('insertUnorderedList')}
                    className="p-2 hover:bg-gray-200 rounded transition"
                    title="Bullet List"
                >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z" />
                    </svg>
                </button>
                <button
                    type="button"
                    onClick={() => execCommand('insertOrderedList')}
                    className="p-2 hover:bg-gray-200 rounded transition"
                    title="Numbered List"
                >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z" />
                    </svg>
                </button>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                {/* Media */}
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 hover:bg-gray-200 rounded transition"
                    title="Insert Image"
                >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                    </svg>
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                />

                <button
                    type="button"
                    onClick={() => setShowMathModal(true)}
                    className="p-2 hover:bg-gray-200 rounded transition"
                    title="Insert Math Formula (LaTeX)"
                >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <text x="4" y="18" fontSize="14" fontFamily="serif" fontStyle="italic">ƒ(x)</text>
                    </svg>
                </button>

                <button
                    type="button"
                    onClick={() => setShowVideoModal(true)}
                    className="p-2 hover:bg-gray-200 rounded transition"
                    title="Insert Video"
                >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
                    </svg>
                </button>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                {/* Clear Formatting */}
                <button
                    type="button"
                    onClick={() => execCommand('removeFormat')}
                    className="p-2 hover:bg-gray-200 rounded transition"
                    title="Clear Formatting"
                >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3.27 5L2 6.27l6.97 6.97L6.5 19h3l1.57-3.66L16.73 21 18 19.73 3.55 5.27 3.27 5zM6 5v.18L8.82 8h2.4l-.72 1.68 2.1 2.1L14.21 8H20V5H6z" />
                    </svg>
                </button>
            </div>

            {/* Editor Container */}
            <div className="relative">
                <div
                    ref={editorRef}
                    contentEditable
                    onInput={handleInput}
                    onPaste={(e) => {
                        // Force black after paste
                        setTimeout(() => handleInput(), 10);
                    }}
                    className="rte-editor"
                    style={{
                        border: '1px solid #d1d5db',
                        borderTop: 'none',
                        borderRadius: '0 0 0.5rem 0.5rem',
                        padding: '1rem',
                        minHeight: '200px',
                        maxHeight: '400px',
                        overflowY: 'auto',
                        backgroundColor: '#ffffff',
                        wordWrap: 'break-word',
                        whiteSpace: 'pre-wrap',
                        lineHeight: '1.6',
                        fontSize: '16px',
                        color: '#000000',
                        caretColor: '#000000',
                        WebkitTextFillColor: '#000000',
                        fontFamily: 'inherit',
                        outline: 'none'
                    }}
                    onFocus={(e) => {
                        e.currentTarget.style.boxShadow = '0 0 0 2px #112C70';
                        e.currentTarget.style.borderColor = '#112C70';
                        e.currentTarget.style.color = '#000000';
                    }}
                    onBlur={(e) => {
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.borderColor = '#d1d5db';
                    }}
                    onKeyDown={() => {
                        // Force color after each keystroke
                        setTimeout(() => {
                            if (editorRef.current) {
                                editorRef.current.style.color = '#000000';
                            }
                        }, 0);
                    }}
                    suppressContentEditableWarning
                    data-placeholder={isEmpty ? placeholder : ''}
                />
            </div>

            {/* Math Modal */}
            {showMathModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-bold mb-4">Insert Math Formula (LaTeX)</h3>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                LaTeX Formula
                            </label>
                            <input
                                type="text"
                                value={mathInput}
                                onChange={(e) => setMathInput(e.target.value)}
                                placeholder="Contoh: x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#112C70]"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Gunakan syntax LaTeX. Contoh: x^2, \sqrt&#123;x&#125;, \frac&#123;a&#125;&#123;b&#125;
                            </p>
                        </div>
                        {mathInput && (
                            <div className="mb-4 p-3 bg-gray-50 rounded border">
                                <p className="text-xs text-gray-600 mb-1">Preview:</p>
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: katex.renderToString(mathInput, {
                                            throwOnError: false,
                                            displayMode: true
                                        })
                                    }}
                                />
                            </div>
                        )}
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={insertMath}
                                className="flex-1 px-4 py-2 bg-[#112C70] text-white rounded-lg hover:bg-[#0B2353]"
                            >
                                Insert
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowMathModal(false);
                                    setMathInput('');
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Video Modal */}
            {showVideoModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-bold mb-4">Insert Video</h3>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Video URL
                            </label>
                            <input
                                type="url"
                                value={videoUrl}
                                onChange={(e) => setVideoUrl(e.target.value)}
                                placeholder="https://www.youtube.com/watch?v=..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#112C70]"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Support: YouTube, Vimeo, atau URL embed lainnya
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={insertVideo}
                                className="flex-1 px-4 py-2 bg-[#112C70] text-white rounded-lg hover:bg-[#0B2353]"
                            >
                                Insert
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowVideoModal(false);
                                    setVideoUrl('');
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
