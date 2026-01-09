'use client';

import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface MermaidDiagramProps {
  chart: string;
}

const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'neutral',
      securityLevel: 'loose',
    });

    if (containerRef.current) {
        // Use the modern async/await API instead of callback
        mermaid.render('mermaid-graph', chart).then(({ svg }) => {
            if(containerRef.current) {
                containerRef.current.innerHTML = svg;
            }
        }).catch((error) => {
            console.error('Mermaid render error:', error);
        });
    }
  }, [chart]);

  return (
    <div className="mermaid" ref={containerRef}>
      {chart}
    </div>
  );
};

export default MermaidDiagram;
