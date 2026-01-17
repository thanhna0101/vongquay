import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { WheelSegment } from '../types';
import { ChevronDown } from 'lucide-react';

interface WheelProps {
  segments: WheelSegment[];
  onSpinEnd: (winner: WheelSegment) => void;
  isSpinning: boolean;
  setIsSpinning: (spinning: boolean) => void;
}

const Wheel: React.FC<WheelProps> = ({ segments, onSpinEnd, isSpinning, setIsSpinning }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState(0);
  
  // D3 dimensions
  const width = 500;
  const height = 500;
  const radius = Math.min(width, height) / 2;

  // Render the wheel segments
  useEffect(() => {
    if (!svgRef.current || segments.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous

    const chartGroup = svg
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    const pie = d3.pie<WheelSegment>()
      .value(1)
      .sort(null);

    const arc = d3.arc<d3.PieArcDatum<WheelSegment>>()
      .innerRadius(20)
      .outerRadius(radius - 10);

    const arcs = chartGroup.selectAll("g.slice")
      .data(pie(segments))
      .enter()
      .append("g")
      .attr("class", "slice");

    // Draw paths
    arcs.append("path")
      .attr("fill", (d) => d.data.color)
      .attr("d", arc)
      .attr("stroke", "white")
      .attr("stroke-width", "2px");

    // Add text
    arcs.append("text")
      .attr("transform", (d) => {
        const _d = arc.centroid(d);
        // Calculate angle for text rotation
        const angle = (d.startAngle + d.endAngle) / 2 * 180 / Math.PI - 90;
        // Move text out towards edge
        const x = Math.cos((d.startAngle + d.endAngle) / 2 - Math.PI / 2) * (radius * 0.65);
        const y = Math.sin((d.startAngle + d.endAngle) / 2 - Math.PI / 2) * (radius * 0.65);
        
        // If it's on the left side, flip the text so it's readable? 
        // Standard wheel text usually radiates out.
        return `translate(${x}, ${y}) rotate(${angle})`;
      })
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .text((d) => {
        const text = d.data.text;
        return text.length > 15 ? text.substring(0, 14) + '...' : text;
      })
      .style("font-size", segments.length > 20 ? "10px" : "14px")
      .style("font-weight", "bold")
      .style("fill", "white")
      .style("pointer-events", "none"); // Prevent text selection

  }, [segments, radius]);

  const handleSpin = () => {
    if (isSpinning || segments.length === 0) return;

    setIsSpinning(true);
    
    // Random rotation between 5 and 10 full spins (1800 - 3600 degrees) + random offset
    const spins = 5 + Math.random() * 5;
    const extraDegrees = Math.random() * 360;
    const totalDegrees = spins * 360 + extraDegrees;
    
    const newRotation = rotation + totalDegrees;
    setRotation(newRotation);

    // Calculate winner
    // The pointer is usually at the top (270 degrees in SVG coords or -90). 
    // But we are rotating the GROUP. 
    // If we rotate +90 deg, the item at 0 deg (3 o'clock) moves to 90 deg (6 o'clock).
    // Let's assume pointer is at Top (12 o'clock).
    // In D3 arc, 0 is at 12 o'clock due to the way we typically map, 
    // OR default 0 is 12 o'clock if we subtract PI/2.
    // Standard D3 arc: 0 is 12 o'clock.
    
    // Actually, let's normalize the final rotation.
    // The rotation is applied to the SVG group. 
    // Pointer is static at top (0 degrees visual).
    // We need to find which segment is at 0 degrees visual after rotation.
    // Effectively: (currentRotation % 360) is the shift.
    
    setTimeout(() => {
      setIsSpinning(false);
      
      // Calculate index
      const actualRotation = newRotation % 360;
      // Because we rotate the wheel clockwise, the segments effectively move counter-clockwise relative to the pointer
      // The segment at "Top" is determined by:
      const sliceAngle = 360 / segments.length;
      // 360 - actualRotation gives us the angle relative to the start that is now at the top
      // Wait, let's correct logic.
      // If we rotate 10 degrees clockwise, the item at 350 degrees moves to 0/360.
      const winningAngle = (360 - actualRotation) % 360;
      const winningIndex = Math.floor(winningAngle / sliceAngle);
      
      onSpinEnd(segments[winningIndex]);
    }, 5000); // 5s matches the CSS transition
  };

  return (
    <div className="flex flex-col items-center justify-center relative">
      {/* Pointer */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20 text-slate-800 drop-shadow-lg">
         <ChevronDown size={48} fill="currentColor" className="stroke-white stroke-2" />
      </div>

      {/* Outer Rim */}
      <div 
        className="rounded-full p-2 bg-white shadow-2xl border-4 border-slate-200"
        ref={containerRef}
      >
         <div 
            style={{ 
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? 'transform 5s cubic-bezier(0.25, 0.1, 0.25, 1)' : 'none'
            }}
         >
            <svg 
              ref={svgRef} 
              width={width} 
              height={height} 
              viewBox={`0 0 ${width} ${height}`}
              className="max-w-full h-auto max-h-[70vh]"
            />
         </div>
      </div>

      {/* Center Button */}
      <button
        onClick={handleSpin}
        disabled={isSpinning || segments.length === 0}
        className={`
          absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          w-20 h-20 rounded-full z-10
          flex items-center justify-center
          shadow-[0_0_15px_rgba(0,0,0,0.2)]
          border-4 border-white
          text-white font-bold text-lg uppercase tracking-wider
          transition-all duration-200
          ${isSpinning 
            ? 'bg-gray-400 cursor-not-allowed scale-95' 
            : 'bg-gradient-to-br from-rose-500 to-rose-600 hover:scale-110 active:scale-95 cursor-pointer hover:shadow-rose-500/50'}
        `}
      >
        {isSpinning ? '...' : 'QUAY'}
      </button>
    </div>
  );
};

export default Wheel;