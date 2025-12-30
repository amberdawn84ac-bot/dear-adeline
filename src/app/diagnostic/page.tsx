'use client';

import { DiagnosticCenter } from '@/components/DiagnosticCenter';

export default function DiagnosticPage() {
    return (
        <div className="min-h-screen bg-[var(--cream)] p-8">
            <div className="max-w-6xl mx-auto">
                <DiagnosticCenter />
            </div>
        </div>
    );
}
