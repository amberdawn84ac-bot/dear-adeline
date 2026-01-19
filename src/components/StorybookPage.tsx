import React from 'react';
import ReactMarkdown from 'react-markdown';

interface StorybookPageProps {
    content: string;
}

export default function StorybookPage({ content }: StorybookPageProps) {
    // 1. Extract the first image from markdown
    const imageMatch = content.match(/!\[([^\]]*)\]\(([^)]+)\)/);
    const heroImage = imageMatch ? { alt: imageMatch[1], src: imageMatch[2] } : null;

    // 2. Remove the first image from content to avoid duplication
    // We replace the full match with an empty string, but only the first occurrence.
    const contentWithoutHero = heroImage ? content.replace(imageMatch![0], '') : content;

    // 3. Remove the trigger tag if present
    const cleanContent = contentWithoutHero
        .replace('# 📖', '')
        .replace('[STORYBOOK]', '')
        .trim();

    return (
        <div className="bg-[#fdfbf7] max-w-3xl mx-auto rounded-lg shadow-md border border-stone-200 overflow-hidden my-4 font-serif">
            {/* Hero Image */}
            {heroImage && (
                <div className="w-full h-64 overflow-hidden relative border-b border-stone-200">
                    <img
                        src={heroImage.src}
                        alt={heroImage.alt}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#fdfbf7] to-transparent opacity-20 pointer-events-none" />
                </div>
            )}

            <div className="p-8 md:p-12">
                <div className="prose prose-stone prose-lg max-w-none prose-headings:font-serif prose-p:font-serif">
                    <ReactMarkdown
                        components={{
                            h1: ({ node, ...props }: any) => (
                                <h1 className="text-4xl text-amber-900 font-bold mb-6 mt-4 text-center border-b border-amber-200 pb-4" {...props} />
                            ),
                            h2: ({ node, ...props }: any) => (
                                <h2 className="text-2xl text-amber-800 font-bold mb-4 mt-8" {...props} />
                            ),
                            p: ({ node, ...props }: any) => (
                                <p className="text-amber-900 leading-relaxed text-lg mb-4" {...props} />
                            ),
                            blockquote: ({ node, ...props }: any) => (
                                <blockquote className="bg-amber-50 border-l-4 border-amber-400 p-6 my-6 rounded-r italic text-lg text-amber-800 not-italic" {...props} />
                            ),
                            hr: ({ node, ...props }: any) => (
                                <hr className="border-t-2 border-stone-200 my-8 w-1/2 mx-auto" {...props} />
                            ),
                            img: ({ node, ...props }: any) => (
                                <img className="rounded-lg shadow-sm my-6 border-4 border-white" {...props} />
                            ),
                        }}
                    >
                        {cleanContent}
                    </ReactMarkdown>
                </div>

                {/* Footer Decoration */}
                <div className="flex justify-center mt-12 mb-4 opacity-50">
                    <div className="text-amber-300 text-2xl">❦</div>
                </div>
            </div>
        </div>
    );
}
