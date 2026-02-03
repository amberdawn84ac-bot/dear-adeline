
'use client';

import { useCallback } from 'react';

//================================================================================
// Type Definitions
//================================================================================

/**
 * The payload for an interaction event. This structure is designed to be
 * extensible to capture a wide variety of student actions.
 */
export interface InteractionEvent {
  // The unique identifier of the component instance, if available.
  componentId?: string;
  // The type of the component that was interacted with (e.g., 'dynamicLedger').
  componentType: string;
  // The specific action taken by the student (e.g., 'slider_change', 'button_click').
  action: string;
  // A serializable object containing data relevant to the interaction.
  // e.g., { itemName: 'Loaf', newPrice: 4.50 }
  data: Record<string, any>;
  // The timestamp of the interaction.
  timestamp: number;
}


//================================================================================
// useInteractionLogger Hook
//================================================================================

/**
 * Provides a function to log student interactions within a component.
 * This hook is the first step in creating a feedback loop for Adeline.
 * By capturing granular interactions, we can feed this data back to the
 * GenUIOrchestrator, allowing Adeline to "watch" the student and provide
 * contextual, scaffolded guidance.
 *
 * @example
 * const logInteraction = useInteractionLogger('dynamicLedger');
 * logInteraction('slider_change', { itemName: 'Loaf', newPrice: 4.50 });
 */
export const useInteractionLogger = (componentType: string, componentId?: string) => {

  const logInteraction = useCallback((action: string, data: Record<string, any>) => {
    const event: InteractionEvent = {
      componentId,
      componentType,
      action,
      data,
      timestamp: Date.now(),
    };

    // In the future, this will send the event to a WebSocket or a
    // dedicated logging endpoint that feeds into the GenUIOrchestrator's
    // context for real-time, contextual AI responses.
    
    // For now, we log to the console for development and debugging.
    console.log('[Interaction]', event);

  }, [componentType, componentId]);

  return logInteraction;
};
