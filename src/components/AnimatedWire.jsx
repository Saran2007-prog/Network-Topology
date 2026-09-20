import React, { useEffect, useState } from 'react';
import { BaseEdge, getBezierPath, getSmoothStepPath } from '@xyflow/react';

export default function AnimatedWire({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  markerEnd,
}) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 20,
  });

  const isAnimating = data?.isAnimating;
  const packetColor = data?.packetColor || '#3b82f6';
  
  // Custom SVG path length animation trick
  const [dashOffset, setDashOffset] = useState(0);

  useEffect(() => {
    if (isAnimating) {
      let req;
      let offset = 100;
      const animate = () => {
        offset -= 1.5; // speed
        if (offset < 0) offset = 100;
        setDashOffset(offset);
        req = requestAnimationFrame(animate);
      };
      req = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(req);
    }
  }, [isAnimating]);

  return (
    <>
      {/* Base interactive edge */}
      <BaseEdge 
        path={edgePath} 
        markerEnd={markerEnd} 
        style={{
          ...style,
          strokeWidth: 4,
          stroke: data?.color || '#22c55e', // default green
          opacity: isAnimating ? 0.6 : 1
        }} 
      />
      
      {/* Packet Animation Layer */}
      {isAnimating && (
        <path
          d={edgePath}
          fill="none"
          className="animate-packet-flow"
          style={{
            stroke: packetColor,
            strokeWidth: 8,
            strokeLinecap: 'round',
            strokeDasharray: '1 99', // creates a "dot" relative to path length
            strokeDashoffset: `${dashOffset}%`, 
            filter: 'drop-shadow(0 0 4px rgba(59, 130, 246, 0.8))',
            pointerEvents: 'none',
          }}
        />
      )}
    </>
  );
}
