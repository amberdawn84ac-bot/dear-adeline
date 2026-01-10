'use client';

import { useState, useEffect } from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';
import { parseMermaidToExcalidraw } from '@excalidraw/mermaid-to-excalidraw';
import { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types';
import { AppState } from '@excalidraw/excalidraw/types/types';

interface AdelineSketchProps {
  mermaidCode: string;
}

export default function AdelineSketch({ mermaidCode }: AdelineSketchProps) {
  const [elements, setElements] = useState<ExcalidrawElement[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const convertMermaid = async () => {
      try {
        setIsLoading(true);
        const { elements: convertedElements } = await parseMermaidToExcalidraw(mermaidCode, {
          fontSize: 16,
        });
        
        // Apply hand-drawn styling to all elements
        const styledElements = convertedElements.map((el) => ({
          ...el,
          strokeColor: '#1e293b', // Slate gray
          backgroundColor: el.backgroundColor || '#fef3c7', // Warm cream
          roughness: 2, // Maximum sketchiness
          strokeStyle: 'solid' as const,
          strokeWidth: 2,
          fillStyle: 'solid' as const,
          fontFamily: 3, // Hand-drawn font (Virgil)
        }));

        setElements(styledElements);
      } catch (error) {
        console.error('Error converting Mermaid to Excalidraw:', error);
      } finally {
        setIsLoading(false);
      }
    };

    convertMermaid();
  }, [mermaidCode]);

  const initialAppState: Partial<AppState> = {
    viewBackgroundColor: '#fffbeb', // Warm paper color
    currentItemRoughness: 2,
    currentItemStrokeColor: '#1e293b',
    currentItemBackgroundColor: '#fef3c7',
    currentItemFontFamily: 3, // Virgil (hand-drawn)
    gridSize: null,
    zenModeEnabled: !isEditMode,
    viewModeEnabled: !isEditMode,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-amber-50 rounded-lg border-2 border-amber-200">
        <div className="text-amber-800 font-handwriting">✨ Sketching diagram...</div>
      </div>
    );
  }

  return (
    <div className="relative my-4 rounded-lg overflow-hidden border-2 border-amber-200 shadow-md">
      {/* Edit Mode Toggle */}
      <button
        onClick={() => setIsEditMode(!isEditMode)}
        className="absolute top-2 right-2 z-10 px-3 py-1 bg-amber-100 hover:bg-amber-200 rounded-md text-sm font-semibold text-amber-800 border border-amber-300 shadow-sm transition-colors"
      >
        {isEditMode ? '👁️ View' : '✏️ Edit & Doodle'}
      </button>

      {/* Excalidraw Canvas */}
      <div className="h-[500px]" style={{ fontFamily: 'Virgil, cursive' }}>
        <Excalidraw
          initialData={{
            elements,
            appState: initialAppState,
          }}
          onChange={(elements) => {
            // Update elements when user edits
            setElements(elements as ExcalidrawElement[]);
          }}
          viewModeEnabled={!isEditMode}
          zenModeEnabled={!isEditMode}
          gridModeEnabled={false}
          theme="light"
        />
      </div>

      {/* Helper Text */}
      {isEditMode && (
        <div className="absolute bottom-2 left-2 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded">
          💡 Add your own doodles, arrows, and notes!
        </div>
      )}
    </div>
  );
}
