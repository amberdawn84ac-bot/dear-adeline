'use client';

import React, { useEffect, useRef } from 'react';
import rough from 'roughjs';

interface RoughBoxProps {
    children: React.ReactNode;
    type?: 'rectangle' | 'circle' | 'underline';
    color?: string;
    fill?: string;
    fillStyle?: 'hachure' | 'solid' | 'zigzag' | 'dots'; 
    className?: string;
}

const RoughBox: React.FC<RoughBoxProps> = ({ 
    children, 
    type = 'rectangle', 
    color = '#4a5568', 
    fill,
    fillStyle = 'hachure',
    className = ''
}) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!svgRef.current || !contentRef.current) return;

        const svg = svgRef.current;
        const rc = rough.svg(svg);
        
        // Clear previous drawings to prevent duplicates on re-renders
        while (svg.lastChild) {
            svg.removeChild(svg.lastChild);
        }

        const { offsetWidth: w, offsetHeight: h } = contentRef.current;
        const padding = 8; 

        const options = {
            stroke: color,
            strokeWidth: 2,
            roughness: 2.5, // "Messy" look
            bowing: 1.5,    // Curved lines
            fill: fill,
            fillStyle: fillStyle,
            fillWeight: 1.5 
        };

        let node;

        if (type === 'circle') {
            node = rc.ellipse(w / 2, h / 2, w + padding, h + padding, options);
        } else if (type === 'underline') {
             // Draw a scribbly underline at the bottom
             node = rc.line(0, h - 2, w, h - 2, { ...options, strokeWidth: 3, roughness: 3 });
        } else {
            node = rc.rectangle(2, 2, w - 4, h - 4, options);
        }

        svg.appendChild(node);

    }, [children, type, color, fill, fillStyle]);

    return (
        <div className={`relative inline-block ${className}`} style={{ padding: '10px' }}>
            {/* SVG Layer (Background) */}
            <svg 
                ref={svgRef}
                className="absolute inset-0 w-full h-full pointer-events-none z-0"
                style={{ overflow: 'visible' }}
            />
            {/* Content Layer (Foreground) */}
            <div ref={contentRef} className="relative z-10">
                {children}
            </div>
        </div>
    );
};

export default RoughBox;
