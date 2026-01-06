'use client';

import React from 'react';
import { Target, Sparkles, Gamepad2 } from 'lucide-react';
import { formatTrack } from '@/types/learning';
import { GameRenderer } from './GameRenderer';
import StorybookPage from './StorybookPage';

interface MessageContentProps {
    content: string;
}

function MessageContentComponent({ content }: MessageContentProps) {
    // ⚡ Bolt: Memoize the expensive parsing logic.
    // This prevents the component from re-parsing the content string on every
    // render, which is a significant performance improvement when the parent
    // component re-renders but the `content` prop remains the same.

    // Check if this is a Storybook message
    const isStorybook = content.startsWith('# 📖') || content.startsWith('[STORYBOOK]') || content.startsWith('# 📖 ') || content.startsWith('[STORYBOOK] ');

    if (isStorybook) {
        return <StorybookPage content={content} />;
    }

    const parsedContent = React.useMemo(() => {
        // Parse <GAME> tags for inline games
        const gameMatch = content.match(/<GAME>([\s\S]*?)<\/GAME>/);
        if (gameMatch) {
            try {
                const gameData = JSON.parse(gameMatch[1]);
                const beforeGame = content.substring(0, gameMatch.index);
                const afterGame = content.substring((gameMatch.index || 0) + gameMatch[0].length);

                return (
                    <>
                        {beforeGame && <div className="mb-4" dangerouslySetInnerHTML={{ __html: beforeGame }} />}

                        <div className="my-4">
                            <GameRenderer
                                type={gameData.type}
                                content={gameData.content}
                                onComplete={() => console.log('Game completed!')}
                            />
                        </div>

                        {afterGame && <div className="mt-4" dangerouslySetInnerHTML={{ __html: afterGame }} />}
                    </>
                );
            } catch (e) {
                console.error('Failed to parse GAME tag:', e);
            }
        }

        // Parse <GAMELAB> tags for complex games
        const gameLabMatch = content.match(/<GAMELAB>([\s\S]*?)<\/GAMELAB>/);
        if (gameLabMatch) {
            try {
                const gameLabData = JSON.parse(gameLabMatch[1]);
                const beforeGame = content.substring(0, gameLabMatch.index);
                const afterGame = content.substring((gameLabMatch.index || 0) + gameLabMatch[0].length);

                const handleLaunchGame = () => {
                    // Store game data in localStorage
                    localStorage.setItem('pendingGameTopic', gameLabData.concept);
                    localStorage.setItem('pendingGameTrack', gameLabData.track || 'creation_science');
                    localStorage.setItem('pendingGameDifficulty', gameLabData.difficulty || 'beginner');
                    localStorage.setItem('pendingGameType', gameLabData.game_type || 'educational');

                    // Navigate to Game Lab
                    window.location.href = '/gamelab';
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
            } catch (e) {
                console.error('Failed to parse GAMELAB tag:', e);
            }
        }

        // Parse <MISSION> tags for academic missions
        const missionMatch = content.match(/<MISSION>([\s\S]*?)<\/MISSION>/);
        if (missionMatch) {
            try {
                const missionData = JSON.parse(missionMatch[1]);
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
            } catch (e) {
                console.error('Failed to parse MISSION tag:', e);
            }
        }

        // No special tags, render normal content
        return <div dangerouslySetInnerHTML={{ __html: content }} />;
    }, [content]);

    return <>{parsedContent}</>;
}

const MessageContent = React.memo(MessageContentComponent);
export default MessageContent;

