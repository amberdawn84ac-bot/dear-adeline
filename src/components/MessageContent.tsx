'use client';

import React from 'react';
import { Gamepad2, Sparkles, Target } from 'lucide-react';
import { formatTrack } from '@/types/learning';
import { GameRenderer } from './GameRenderer';
import MermaidDiagram from './MermaidDiagram';
import StorybookPage from './StorybookPage';

// Helper function to safely parse JSON
function safeJSONParse(jsonString: string): Record<string, unknown> | null {
    try {
        const trimmed = jsonString.trim();
        return JSON.parse(trimmed);
    } catch (e) {
        console.error('Failed to parse JSON:', e);
        console.error('JSON string was:', jsonString.substring(0, 200));
        return null;
    }
}

interface MessageContentProps {
    content: string;
}

import { useRouter } from 'next/navigation';

// ... (imports remain)

function MessageContentComponent({ content }: MessageContentProps) {
    const router = useRouter();

    // Check if this is a Storybook message
    const isStorybook = content.startsWith('# 📖') || content.startsWith('[STORYBOOK]') || content.startsWith('# 📖 ') || content.startsWith('[STORYBOOK] ');

    const parsedContent = React.useMemo(() => {
        // Optimization: Don't parse if it's a storybook, we won't use it
        if (isStorybook) return null;

        // Parse <DIAGRAM> tags for Mermaid diagrams
        const diagramMatch = content.match(/<DIAGRAM>([\s\S]*?)<\/DIAGRAM>/);
        if (diagramMatch) {
            try {
                const diagramCode = diagramMatch[1].trim();
                const beforeDiagram = content.substring(0, diagramMatch.index);
                const afterDiagram = content.substring((diagramMatch.index || 0) + diagramMatch[0].length);

                return (
                    <>
                        {beforeDiagram && (
                            <div
                                className="mb-4 prose prose-sm max-w-none"
                                dangerouslySetInnerHTML={{ __html: beforeDiagram }}
                            />
                        )}

                        <div className="my-6 p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-sm border border-purple-100 dark:border-gray-600">
                            <MermaidDiagram chart={diagramCode} />
                        </div>

                        {afterDiagram && (
                            <div
                                className="mt-4 prose prose-sm max-w-none"
                                dangerouslySetInnerHTML={{ __html: afterDiagram }}
                            />
                        )}
                    </>
                );
            } catch (e) {
                console.error('Failed to parse DIAGRAM tag:', e);
            }
        }

        // Parse <GAME> tags for inline games
        const gameMatch = content.match(/<GAME>([\s\S]*?)<\/GAME>/);
        if (gameMatch) {
            const gameData = safeJSONParse(gameMatch[1]);

            if (gameData) {
                const beforeGame = content.substring(0, gameMatch.index);
                const afterGame = content.substring((gameMatch.index || 0) + gameMatch[0].length);

                return (
                    <>
                        {beforeGame && <div className="mb-4" dangerouslySetInnerHTML={{ __html: beforeGame }} />}

                        <div className="my-4">
                            <GameRenderer
                                type={gameData.type as 'quiz' | 'matching' | 'wordsearch' | 'fillinblank' | 'truefalse'}
                                content={gameData.content as Record<string, unknown>}
                                onComplete={() => console.log('Game completed!')}
                            />
                        </div>

                        {afterGame && <div className="mt-4" dangerouslySetInnerHTML={{ __html: afterGame }} />}
                    </>
                );
            }
        }

        // Parse <GAMELAB> tags for complex games
        const gameLabMatch = content.match(/<GAMELAB>([\s\S]*?)<\/GAMELAB>/);
        if (gameLabMatch) {
            const gameLabData = safeJSONParse(gameLabMatch[1]);

            if (gameLabData) {
                const beforeGame = content.substring(0, gameLabMatch.index);
                const afterGame = content.substring((gameLabMatch.index || 0) + gameLabMatch[0].length);

                const handleLaunchGame = () => {
                    // Store game data in localStorage
                    localStorage.setItem('pendingGameTopic', gameLabData.concept);
                    localStorage.setItem('pendingGameTrack', gameLabData.track || 'creation_science');
                    localStorage.setItem('pendingGameDifficulty', gameLabData.difficulty || 'beginner');
                    localStorage.setItem('pendingGameType', gameLabData.game_type || 'educational');

                    // Navigate to Game Lab
                    router.push('/gamelab');
                };

                return (
                    <>
                        {beforeGame && <div className="mb-4" dangerouslySetInnerHTML={{ __html: beforeGame }} />}

                        <div className="bg-gradient-to-br from-purple/10 to-blue/10 rounded-3xl p-6 border-2 border-purple/20 my-4">
                            <div className="flex items-center gap-3 mb-4">
                                <Gamepad2 className="w-6 h-6 text-purple" />
                                <h3 className="text-xl font-heading text-purple">Game Lab Challenge!</h3>
                            </div>

                            <p className="text-charcoal mb-4">
                                I've designed a custom learning simulation for you: <strong>{gameLabData.concept}</strong>
                            </p>

                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="bg-white rounded-xl p-3">
                                    <p className="text-xs text-charcoal/60 mb-1">Track</p>
                                    <p className="font-bold text-purple">{formatTrack(gameLabData.track)}</p>
                                </div>
                                <div className="bg-white rounded-xl p-3">
                                    <p className="text-xs text-charcoal/60 mb-1">Difficulty</p>
                                    <p className="font-bold text-magenta capitalize">{gameLabData.difficulty}</p>
                                </div>
                            </div>

                            <button
                                onClick={handleLaunchGame}
                                className="w-full py-3 bg-gradient-to-r from-purple to-magenta text-white rounded-2xl font-bold hover:scale-105 transition-all flex items-center justify-center gap-2"
                            >
                                <Sparkles className="w-5 h-5" />
                                Launch Game Lab
                            </button>
                        </div>

                        {afterGame && <div className="mt-4" dangerouslySetInnerHTML={{ __html: afterGame }} />}
                    </>
                );
            }
        }

        // Parse <MISSION> tags for academic missions
        const missionMatch = content.match(/<MISSION>([\s\S]*?)<\/MISSION>/);
        if (missionMatch) {
            const missionData = safeJSONParse(missionMatch[1]);

            if (missionData) {
                const beforeMission = content.substring(0, missionMatch.index);
                const afterMission = content.substring((missionMatch.index || 0) + missionMatch[0].length);

                const handleAcceptMission = async () => {
                    try {
                        const response = await fetch('/api/missions', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(missionData),
                        });

                        const data = await response.json();

                        if (data.mission) {
                            alert('Mission accepted! Check your portfolio to get started.');
                        }
                    } catch (error) {
                        console.error('Failed to accept mission:', error);
                        alert('Failed to accept mission. Please try again.');
                    }
                };

                return (
                    <>
                        {beforeMission && <div className="mb-4" dangerouslySetInnerHTML={{ __html: beforeMission }} />}

                        <div className="bg-gradient-to-br from-gold/10 to-coral/10 rounded-3xl p-6 border-2 border-gold/20 my-4">
                            <div className="flex items-center gap-3 mb-4">
                                <Target className="w-6 h-6 text-gold" />
                                <h3 className="text-xl font-heading text-gold">Academic Mission Detected!</h3>
                            </div>

                            <h4 className="text-lg font-bold text-charcoal mb-2">{missionData.topic}</h4>
                            <p className="text-charcoal/70 mb-4">
                                {missionData.conversation_context || 'A wonderful learning opportunity awaits!'}
                            </p>

                            {missionData.suggested_track && (
                                <div className="mb-4">
                                    <span className="inline-block px-3 py-1 bg-gold/10 text-gold rounded-full text-sm font-medium">
                                        {formatTrack(missionData.suggested_track)}
                                    </span>
                                </div>
                            )}

                            <button
                                onClick={handleAcceptMission}
                                className="w-full py-3 bg-gradient-to-r from-gold to-coral text-white rounded-2xl font-bold hover:scale-105 transition-all flex items-center justify-center gap-2"
                            >
                                <Target className="w-5 h-5" />
                                Accept Mission & Add to Portfolio
                            </button>
                        </div>

                        {afterMission && <div className="mt-4" dangerouslySetInnerHTML={{ __html: afterMission }} />}
                    </>
                );
            }
        }

        // No special tags, render normal content with prose styling and fun fonts
        return (
            <div
                className="prose prose-lg max-w-none prose-headings:text-purple-900 prose-a:text-purple-600 prose-strong:text-gray-900"
                style={{ fontFamily: 'Comic Neue, cursive' }}
                dangerouslySetInnerHTML={{ __html: content }}
            />
        );
    }, [content, isStorybook, router]);

    if (isStorybook) {
        return <StorybookPage content={content} />;
    }

    return <>{parsedContent}</>;
}

const MessageContent = React.memo(MessageContentComponent);
export default MessageContent;
