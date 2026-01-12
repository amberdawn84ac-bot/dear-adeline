/**
 * MODEL ROUTER
 * 
 * Intelligently routes requests to the best AI model for the task:
 * - Gemini Flash: Default, fast, conversational learning
 * - Grok: Investigation mode, corporate research, unfiltered
 * - GPT-4: Deep analysis, complex reasoning (future)
 */

export type ModelMode = 'learning' | 'investigate' | 'deep_research';

export interface ModelRoute {
    model: 'gemini' | 'grok' | 'gpt4';
    reason: string;
}

export class ModelRouter {
    
    /**
     * Auto-detect which model to use based on message content
     */
    static detectMode(message: string, explicitMode?: ModelMode): ModelRoute {
        // If user explicitly selected a mode, use it
        if (explicitMode) {
            return this.getModeRoute(explicitMode);
        }

        const lowerMessage = message.toLowerCase();

        // INVESTIGATION MODE → Grok
        // Triggers: Corporate names, "investigate", "follow the money", research keywords
        const investigationKeywords = [
            'investigate', 'monsanto', 'bayer', 'pfizer', 'big pharma',
            'fda', 'cdc', 'who', 'follow the money', 'funded by',
            'corporate', 'corruption', 'conflict of interest',
            'flexner report', 'rockefeller', 'lobbying'
        ];

        if (investigationKeywords.some(keyword => lowerMessage.includes(keyword))) {
            return {
                model: 'grok',
                reason: 'Investigation/corporate research detected'
            };
        }

        // DEEP RESEARCH MODE → GPT-4 (future)
        // Triggers: "analyze", "compare", very long messages, complex requests
        const deepResearchKeywords = [
            'analyze', 'compare', 'contrast', 'evaluate',
            'systematic review', 'meta-analysis'
        ];

        if (
            deepResearchKeywords.some(keyword => lowerMessage.includes(keyword)) ||
            message.length > 500
        ) {
            return {
                model: 'gpt4',
                reason: 'Complex analysis or long-form research detected'
            };
        }

        // DEFAULT: LEARNING MODE → Gemini
        return {
            model: 'gemini',
            reason: 'Default conversational learning'
        };
    }

    /**
     * Get route for explicit mode selection
     */
    private static getModeRoute(mode: ModelMode): ModelRoute {
        switch (mode) {
            case 'investigate':
                return { model: 'grok', reason: 'User selected investigation mode' };
            case 'deep_research':
                return { model: 'gpt4', reason: 'User selected deep research mode' };
            case 'learning':
            default:
                return { model: 'gemini', reason: 'User selected learning mode' };
        }
    }

    /**
     * Get display name for model
     */
    static getModelDisplayName(model: 'gemini' | 'grok' | 'gpt4'): string {
        switch (model) {
            case 'gemini':
                return 'Gemini Flash';
            case 'grok':
                return 'Grok (Investigation Mode)';
            case 'gpt4':
                return 'GPT-4 (Deep Analysis)';
        }
    }

    /**
     * Get icon for model
     */
    static getModelIcon(model: 'gemini' | 'grok' | 'gpt4'): string {
        switch (model) {
            case 'gemini':
                return '💬';
            case 'grok':
                return '🔍';
            case 'gpt4':
                return '🧠';
        }
    }
}
