
'use client';

import React from 'react';
import { ComposedUIPage, UIComponent } from '@/lib/services/genUIOrchestrator';
import { DynamicLedger } from '@/components/genui/static/DynamicLedger';
import { HandDrawnIllustration } from '@/components/genui/static/HandDrawnIllustration';
import { GuidingQuestion } from '@/components/genui/static/GuidingQuestion';

//================================================================================
// ComposedPageRenderer Component
//================================================================================

interface ComposedPageRendererProps {
  composedPage: ComposedUIPage;
}

/**
 * This component acts as the interpreter for Adeline's AI-generated
 * "Journal Pages". It takes a structured `ComposedUIPage` object and renders
 * the appropriate React components based on the `component.type` defined
 * by the `GenUIOrchestrator`.
 *
 * This is crucial for realizing the vision of multi-component experiences
 * where Adeline composes entire UI layouts dynamically.
 */
export const ComposedPageRenderer: React.FC<ComposedPageRendererProps> = ({ composedPage }) => {

  const renderComponent = (component: UIComponent, index: number) => {
    switch (component.type) {
      case 'handDrawnIllustration':
        return <HandDrawnIllustration key={index} {...component.props as any} />;
      case 'dynamicLedger':
        // The DynamicLedger may need an onComplete handler eventually.
        // For now, we just pass its props.
        return <DynamicLedger key={index} {...component.props as any} />;
      case 'guidingQuestion':
        return <GuidingQuestion key={index} {...component.props as any} />;
      // Add other component types as they are implemented
      default:
        console.warn(`Unknown component type: ${component.type}`);
        return (
          <div key={index} className="bg-red-100 p-2 my-2 rounded border border-red-400 text-red-700">
            Error: Unknown component type "{component.type}"
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      {composedPage.dialogue && (
        <p className="text-lg font-['Kalam'] text-gray-800 leading-relaxed my-4">
          {composedPage.dialogue}
        </p>
      )}
      {composedPage.components.map((component, index) => renderComponent(component, index))}
      {/* TODO: Render nextActions as interactive elements, possibly below a horizontal rule */}
    </div>
  );
};
