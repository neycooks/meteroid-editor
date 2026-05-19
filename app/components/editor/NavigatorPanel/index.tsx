'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useEditor } from '@/context/EditorContext';

export default function NavigatorPanel() {
  const { state, dispatch } = useEditor();
  const miniCanvasRef = useRef<HTMLCanvasElement>(null);
  const [viewport, setViewport] = useState({ x: 0, y: 0, width: 100, height: 100 });

  useEffect(() => {
    const canvas = miniCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scale = Math.min(canvas.width / state.canvasWidth, canvas.height / state.canvasHeight);
    const offsetX = (canvas.width - state.canvasWidth * scale) / 2;
    const offsetY = (canvas.height - state.canvasHeight * scale) / 2;

    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const reversedLayers = [...state.layers].reverse();
    for (const layer of reversedLayers) {
      if (!layer.visible) continue;
      ctx.globalAlpha = layer.opacity / 100;
      ctx.drawImage(
        layer.canvas,
        offsetX + layer.x * scale,
        offsetY + layer.y * scale,
        layer.canvas.width * scale,
        layer.canvas.height * scale
      );
    }

    const container = canvas.parentElement;
    if (container) {
      const vw = (container.clientWidth / state.zoom) * scale;
      const vh = (container.clientHeight / state.zoom) * scale;
      const vx = offsetX - (-state.panX / state.zoom) * scale;
      const vy = offsetY - (-state.panY / state.zoom) * scale;
      setViewport({ x: vx, y: vy, width: vw, height: vh });
    }
  }, [state.layers, state.canvasWidth, state.canvasHeight, state.zoom, state.panX, state.panY]);

  return (
    <div className="bg-[#4a4a4a] border-t border-[#3a3a3a] p-2">
      <div className="text-xs text-[#999] mb-1">Navigator</div>
      <div className="relative bg-[#333] border border-[#555]" style={{ height: 100 }}>
        <canvas
          ref={miniCanvasRef}
          width={160}
          height={100}
          className="w-full h-full"
        />
        <div
          className="absolute border border-red-500 pointer-events-none"
          style={{
            left: viewport.x,
            top: viewport.y,
            width: viewport.width,
            height: viewport.height,
          }}
        />
      </div>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-[#999] text-xs">-</span>
        <input
          type="range"
          min="1"
          max="3200"
          value={state.zoom * 100}
          onChange={(e) => dispatch({ type: 'SET_ZOOM', zoom: parseInt(e.target.value) / 100 })}
          className="flex-1 h-1"
        />
        <span className="text-[#999] text-xs">+</span>
      </div>
    </div>
  );
}
