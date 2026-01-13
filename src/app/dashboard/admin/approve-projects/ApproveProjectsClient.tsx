'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, Eye, Clock, AlertCircle } from 'lucide-react';

interface Project {
    id: string;
    title: string;
    description: string;
    category: string;
    instructions: string;
    materials: string[];
    credit_value: number;
    difficulty: string;
    approval_status: string;
    rejection_reason: string | null;
    created_at: string;
    created_by_profile?: {
        full_name: string;
        email: string;
    };
}

interface ApproveProjectsClientProps {
    projects: Project[];
    adminId: string;
}

export default function ApproveProjectsClient({ projects, adminId }: ApproveProjectsClientProps) {
    const router = useRouter();
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [processing, setProcessing] = useState(false);

    const handleApprove = async (projectId: string) => {
        setProcessing(true);
        try {
            const res = await fetch('/api/admin/projects/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId,
                    approved: true,
                    adminId
                }),
            });

            if (res.ok) {
                router.refresh();
                setSelectedProject(null);
            }
        } catch (error) {
            console.error('Approval error:', error);
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async (projectId: string) => {
        if (!rejectionReason.trim()) {
            alert('Please provide a reason for rejection');
            return;
        }

        setProcessing(true);
        try {
            const res = await fetch('/api/admin/projects/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId,
                    approved: false,
                    rejectionReason,
                    adminId
                }),
            });

            if (res.ok) {
                router.refresh();
                setSelectedProject(null);
                setRejectionReason('');
            }
        } catch (error) {
            console.error('Rejection error:', error);
        } finally {
            setProcessing(false);
        }
    };

    const pendingProjects = projects.filter(p => p.approval_status === 'pending');
    const rejectedProjects = projects.filter(p => p.approval_status === 'rejected');

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Project Approval Queue
                    </h1>
                    <p className="text-xl text-gray-600">
                        Review and approve projects for the library
                    </p>
                </div>

                {/* Stats */}
                <div className="grid md:grid-cols-2 gap-4 mb-8">
                    <div className="bg-white rounded-xl p-6 shadow-md">
                        <div className="flex items-center gap-3 mb-2">
                            <Clock className="w-6 h-6 text-yellow-600" />
                            <h3 className="text-lg font-semibold">Pending Review</h3>
                        </div>
                        <p className="text-3xl font-bold text-yellow-600">{pendingProjects.length}</p>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-md">
                        <div className="flex items-center gap-3 mb-2">
                            <XCircle className="w-6 h-6 text-red-600" />
                            <h3 className="text-lg font-semibold">Rejected</h3>
                        </div>
                        <p className="text-3xl font-bold text-red-600">{rejectedProjects.length}</p>
                    </div>
                </div>

                {/* Pending Projects */}
                {pendingProjects.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Pending Projects</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {pendingProjects.map((project) => (
                                <div
                                    key={project.id}
                                    className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                                            Pending
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {new Date(project.created_at).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                                        {project.title}
                                    </h3>

                                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                                        {project.description}
                                    </p>

                                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                                        <span className="px-2 py-1 bg-gray-100 rounded">
                                            {project.category}
                                        </span>
                                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                                            {project.credit_value} credits
                                        </span>
                                    </div>

                                    {project.created_by_profile && (
                                        <p className="text-xs text-gray-500 mb-4">
                                            By: {project.created_by_profile.full_name}
                                        </p>
                                    )}

                                    <button
                                        onClick={() => setSelectedProject(project)}
                                        className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Eye className="w-4 h-4" />
                                        Review
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Rejected Projects */}
                {rejectedProjects.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Rejected Projects</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {rejectedProjects.map((project) => (
                                <div
                                    key={project.id}
                                    className="bg-white rounded-xl p-6 shadow-md opacity-60"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                            Rejected
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {new Date(project.created_at).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                                        {project.title}
                                    </h3>

                                    {project.rejection_reason && (
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                                            <p className="text-xs text-red-600">
                                                <strong>Reason:</strong> {project.rejection_reason}
                                            </p>
                                        </div>
                                    )}

                                    <button
                                        onClick={() => setSelectedProject(project)}
                                        className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Eye className="w-4 h-4" />
                                        View
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {projects.length === 0 && (
                    <div className="text-center py-20">
                        <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            All caught up!
                        </h3>
                        <p className="text-gray-600">
                            No projects pending approval
                        </p>
                    </div>
                )}
            </div>

            {/* Project Review Modal */}
            {selectedProject && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-8">
                            {/* Header */}
                            <div className="mb-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                        selectedProject.approval_status === 'pending'
                                            ? 'bg-yellow-100 text-yellow-700'
                                            : 'bg-red-100 text-red-700'
                                    }`}>
                                        {selectedProject.approval_status}
                                    </span>
                                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                        {selectedProject.category}
                                    </span>
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                    {selectedProject.title}
                                </h2>
                                {selectedProject.created_by_profile && (
                                    <p className="text-sm text-gray-600">
                                        Submitted by: {selectedProject.created_by_profile.full_name}
                                    </p>
                                )}
                            </div>

                            {/* Description */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                                <p className="text-gray-700">{selectedProject.description}</p>
                            </div>

                            {/* Instructions */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-900 mb-2">Instructions</h3>
                                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap">
                                    {selectedProject.instructions}
                                </div>
                            </div>

                            {/* Materials */}
                            {selectedProject.materials && selectedProject.materials.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="font-semibold text-gray-900 mb-2">Materials</h3>
                                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                                        {selectedProject.materials.map((material, idx) => (
                                            <li key={idx}>{material}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Metadata */}
                            <div className="mb-6 grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">
                                        Difficulty
                                    </h4>
                                    <p className="text-sm text-gray-900 capitalize">
                                        {selectedProject.difficulty}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">
                                        Credit Value
                                    </h4>
                                    <p className="text-sm text-gray-900">
                                        {selectedProject.credit_value} credits
                                    </p>
                                </div>
                            </div>

                            {/* Rejection Reason (if rejected) */}
                            {selectedProject.approval_status === 'rejected' && selectedProject.rejection_reason && (
                                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                                        <div>
                                            <h4 className="font-semibold text-red-900 mb-1">
                                                Rejection Reason
                                            </h4>
                                            <p className="text-sm text-red-700">
                                                {selectedProject.rejection_reason}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Rejection Form (for pending) */}
                            {selectedProject.approval_status === 'pending' && (
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Rejection Reason (if rejecting)
                                    </label>
                                    <textarea
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        placeholder="Provide feedback if rejecting this project..."
                                        rows={3}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none resize-none"
                                    />
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3">
                                {selectedProject.approval_status === 'pending' && (
                                    <>
                                        <button
                                            onClick={() => handleApprove(selectedProject.id)}
                                            disabled={processing}
                                            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle2 className="w-5 h-5" />
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleReject(selectedProject.id)}
                                            disabled={processing}
                                            className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            <XCircle className="w-5 h-5" />
                                            Reject
                                        </button>
                                    </>
                                )}
                                <button
                                    onClick={() => {
                                        setSelectedProject(null);
                                        setRejectionReason('');
                                    }}
                                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
