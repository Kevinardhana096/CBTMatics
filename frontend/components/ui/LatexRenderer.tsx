'use client';

import { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface LatexRendererProps {
    content: string;
    className?: string;
}

export function LatexRenderer({ content, className = '' }: LatexRendererProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current || !content) return;

        try {
            // Replace LaTeX delimiters with rendered math
            let processedContent = content;

            // Process display math ($$...$$)
            processedContent = processedContent.replace(/\$\$(.*?)\$\$/g, (match, formula) => {
                try {
                    const rendered = katex.renderToString(formula, {
                        displayMode: true,
                        throwOnError: false,
                        trust: true
                    });
                    return `<div class="katex-display">${rendered}</div>`;
                } catch (e) {
                    console.error('KaTeX render error (display):', e);
                    return match;
                }
            });

            // Process inline math ($...$)
            processedContent = processedContent.replace(/\$([^\$]+?)\$/g, (match, formula) => {
                try {
                    const rendered = katex.renderToString(formula, {
                        displayMode: false,
                        throwOnError: false,
                        trust: true
                    });
                    return `<span class="katex-inline">${rendered}</span>`;
                } catch (e) {
                    console.error('KaTeX render error (inline):', e);
                    return match;
                }
            });

            // Process \(...\) inline
            processedContent = processedContent.replace(/\\\((.*?)\\\)/g, (match, formula) => {
                try {
                    const rendered = katex.renderToString(formula, {
                        displayMode: false,
                        throwOnError: false,
                        trust: true
                    });
                    return `<span class="katex-inline">${rendered}</span>`;
                } catch (e) {
                    console.error('KaTeX render error (inline):', e);
                    return match;
                }
            });

            // Process \[...\] display
            processedContent = processedContent.replace(/\\\[(.*?)\\\]/g, (match, formula) => {
                try {
                    const rendered = katex.renderToString(formula, {
                        displayMode: true,
                        throwOnError: false,
                        trust: true
                    });
                    return `<div class="katex-display">${rendered}</div>`;
                } catch (e) {
                    console.error('KaTeX render error (display):', e);
                    return match;
                }
            });

            containerRef.current.innerHTML = processedContent;
        } catch (error) {
            console.error('Error rendering LaTeX:', error);
            containerRef.current.innerHTML = content;
        }
    }, [content]);

    return <div ref={containerRef} className={className} />;
}
