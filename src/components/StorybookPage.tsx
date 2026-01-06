'use client';

import React from 'react';

interface StorybookPageProps {
    content: string;
}

// Simple markdown parser for storybook content
function parseMarkdown(content: string): JSX.Element[] {
    const lines = content.split('\n');
    const elements: JSX.Element[] = [];
    let currentParagraph: string[] = [];
    let inBlockquote = false;
    let key = 0;

    const flushParagraph = () => {
        if (currentParagraph.length > 0) {
            const text = currentParagraph.join(' ').trim();
            if (text) {
                // Parse inline markdown in paragraph
                const parsed = text
                    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.+?)\*/g, '<em>$1</em>')
                    .replace(/`(.+?)`/g, '<code>$1</code>');
                elements.push(
                    <p key={key++} className="text-stone-800 leading-relaxed mb-4 text-lg" dangerouslySetInnerHTML={{ __html: parsed }} />
                );
                currentParagraph = [];
            }
        }
    };

    lines.forEach((line) => {
        const trimmed = line.trim();

        // Horizontal rule
        if (trimmed.match(/^(\*\*\*|---)$/)) {
            flushParagraph();
            elements.push(<hr key={key++} className="my-8 border-t-2 border-amber-300" />);
            return;
        }

        // H1 - Title
        if (trimmed.startsWith('# ')) {
            flushParagraph();
            const title = trimmed.substring(2).trim();
            elements.push(
                <h1 key={key++} className="text-center text-3xl md:text-4xl font-bold text-amber-900 mb-6 pb-4 border-b-2 border-amber-300">
                    {title}
                </h1>
            );
            return;
        }

        // H2
        if (trimmed.startsWith('## ')) {
            flushParagraph();
            const title = trimmed.substring(3).trim();
            elements.push(
                <h2 key={key++} className="text-2xl font-bold text-amber-900 mt-6 mb-4">
                    {title}
                </h2>
            );
            return;
        }

        // H3
        if (trimmed.startsWith('### ')) {
            flushParagraph();
            const title = trimmed.substring(4).trim();
            elements.push(
                <h3 key={key++} className="text-xl font-bold text-amber-800 mt-4 mb-3">
                    {title}
                </h3>
            );
            return;
        }

        // Blockquote
        if (trimmed.startsWith('> ')) {
            flushParagraph();
            const quote = trimmed.substring(2).trim();
            elements.push(
                <blockquote key={key++} className="bg-amber-50 p-4 rounded-lg italic text-amber-900 border-l-4 border-amber-300 my-4">
                    {quote}
                </blockquote>
            );
            return;
        }

        // Image
        const imgMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
        if (imgMatch) {
            flushParagraph();
            const [, alt, src] = imgMatch;
            elements.push(
                <div key={key++} className="my-6 flex justify-center">
                    <img
                        src={src}
                        alt={alt}
                        className="rounded-lg shadow-md rotate-1 max-w-full h-auto"
                    />
                </div>
            );
            return;
        }

        // Regular paragraph line
        if (trimmed) {
            currentParagraph.push(trimmed);
        } else {
            flushParagraph();
        }
    });

    flushParagraph();
    return elements;
}

export default function StorybookPage({ content }: StorybookPageProps) {
    // Remove the storybook tag if present
    const cleanContent = content.replace(/^#\s*📖\s*/i, '').replace(/^\[STORYBOOK\]\s*/i, '').trim();
    const elements = parseMarkdown(cleanContent);

    return (
        <div className="bg-[#faf9f6] border border-stone-200 rounded-lg p-8 font-serif shadow-lg my-4 max-w-3xl mx-auto">
            {elements}
        </div>
    );
}
