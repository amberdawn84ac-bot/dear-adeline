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
        mermaid.render('mermaid-graph', chart, (svgCode) => {
            if(containerRef.current) {
                containerRef.current.innerHTML = svgCode;
            }
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
