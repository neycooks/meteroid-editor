'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useEditor } from '@/context/EditorContext';

export default function Canvas() {
  const { state, dispatch, saveHistory, getActiveLayer } = useEditor();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDrawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const startPos = useRef({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });
  const tempCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const getCanvasCoords = useCallback(
    (e: React.MouseEvent) => {
      if (!canvasRef.current) return { x: 0, y: 0 };
      const rect = canvasRef.current.getBoundingClientRect();
      return {
        x: (e.clientX - rect.left) / state.zoom,
        y: (e.clientY - rect.top) / state.zoom,
      };
    },
    [state.zoom]
  );

  const drawBrush = useCallback(
    (ctx: CanvasRenderingContext2D, x: number, y: number, lastX: number, lastY: number) => {
      const layer = getActiveLayer();
      if (!layer || layer.locked) return;

      ctx.globalAlpha = state.brushOpacity / 100;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = state.brushSize;

      if (state.activeTool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = state.foregroundColor;
      }

      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.stroke();

      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
    },
    [state.brushSize, state.brushOpacity, state.foregroundColor, state.activeTool, getActiveLayer]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 1 || state.activeTool === 'hand' || (state.activeTool === 'move' && e.altKey)) {
        setIsPanning(true);
        panStart.current = { x: e.clientX - state.panX, y: e.clientY - state.panY };
        return;
      }

      const { x, y } = getCanvasCoords(e);
      isDrawing.current = true;
      lastPos.current = { x, y };
      startPos.current = { x, y };

      if (state.activeTool === 'eyedropper') {
        const layer = getActiveLayer();
        if (layer) {
          const ctx = layer.canvas.getContext('2d')!;
          const pixel = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
          const hex = `#${pixel[0].toString(16).padStart(2, '0')}${pixel[1].toString(16).padStart(2, '0')}${pixel[2].toString(16).padStart(2, '0')}`;
          dispatch({ type: 'SET_FOREGROUND_COLOR', color: hex });
        }
        isDrawing.current = false;
      }

      if (state.activeTool === 'brush' || state.activeTool === 'eraser' || state.activeTool === 'cloneStamp' || state.activeTool === 'blur') {
        const layer = getActiveLayer();
        if (layer) {
          const ctx = layer.canvas.getContext('2d')!;
          if (state.activeTool === 'brush' || state.activeTool === 'eraser') {
            drawBrush(ctx, x, y, x, y);
            dispatch({ type: 'DRAW_ON_LAYER', id: layer.id, canvas: layer.canvas });
          }
        }
      }
    },
    [state.activeTool, state.panX, state.panY, getCanvasCoords, getActiveLayer, dispatch, drawBrush]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning) {
        dispatch({
          type: 'SET_PAN',
          panX: e.clientX - panStart.current.x,
          panY: e.clientY - panStart.current.y,
        });
        return;
      }

      if (!isDrawing.current) return;

      const { x, y } = getCanvasCoords(e);

      if (state.activeTool === 'brush' || state.activeTool === 'eraser' || state.activeTool === 'cloneStamp') {
        const layer = getActiveLayer();
        if (layer) {
          const ctx = layer.canvas.getContext('2d')!;
          drawBrush(ctx, x, y, lastPos.current.x, lastPos.current.y);
          dispatch({ type: 'DRAW_ON_LAYER', id: layer.id, canvas: layer.canvas });
        }
      }

      if (state.activeTool === 'marqueeRect' || state.activeTool === 'marqueeEllipse') {
        const selX = Math.min(startPos.current.x, x);
        const selY = Math.min(startPos.current.y, y);
        const selW = Math.abs(x - startPos.current.x);
        const selH = Math.abs(y - startPos.current.y);
        dispatch({
          type: 'SET_SELECTION',
          selection: {
            type: state.activeTool === 'marqueeRect' ? 'rect' : 'ellipse',
            x: selX,
            y: selY,
            width: selW,
            height: selH,
          },
        });
      }

      lastPos.current = { x, y };
    },
    [isPanning, state.activeTool, getCanvasCoords, getActiveLayer, dispatch, drawBrush]
  );

  const handleMouseUp = useCallback(() => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (isDrawing.current) {
      if (state.activeTool === 'brush' || state.activeTool === 'eraser' || state.activeTool === 'cloneStamp') {
        saveHistory();
      }
    }
    isDrawing.current = false;
  }, [state.activeTool, saveHistory, isPanning]);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.max(0.01, Math.min(32, state.zoom * delta));
      dispatch({ type: 'SET_ZOOM', zoom: newZoom });
    },
    [state.zoom, dispatch]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const displayCanvas = document.createElement('canvas');
    displayCanvas.width = state.canvasWidth;
    displayCanvas.height = state.canvasHeight;
    tempCanvasRef.current = displayCanvas;
  }, [state.canvasWidth, state.canvasHeight]);

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(state.panX, state.panY);
    ctx.scale(state.zoom, state.zoom);

    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, state.canvasWidth, state.canvasHeight);

    const checkerSize = 8;
    for (let y = 0; y < state.canvasHeight; y += checkerSize) {
      for (let x = 0; x < state.canvasWidth; x += checkerSize) {
        ctx.fillStyle = (Math.floor(x / checkerSize) + Math.floor(y / checkerSize)) % 2 === 0 ? '#cccccc' : '#999999';
        ctx.fillRect(x, y, checkerSize, checkerSize);
      }
    }

    const reversedLayers = [...state.layers].reverse();
    for (const layer of reversedLayers) {
      if (!layer.visible) continue;
      ctx.globalAlpha = layer.opacity / 100;
      ctx.drawImage(layer.canvas, layer.x, layer.y);
    }

    ctx.globalAlpha = 1;

    if (state.selection) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1 / state.zoom;
      ctx.setLineDash([4 / state.zoom, 4 / state.zoom]);
      if (state.selection.type === 'rect') {
        ctx.strokeRect(state.selection.x, state.selection.y, state.selection.width, state.selection.height);
      } else if (state.selection.type === 'ellipse') {
        ctx.beginPath();
        ctx.ellipse(
          state.selection.x + state.selection.width / 2,
          state.selection.y + state.selection.height / 2,
          state.selection.width / 2,
          state.selection.height / 2,
          0,
          0,
          Math.PI * 2
        );
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }

    if (state.showGrid && state.zoom > 4) {
      ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      ctx.lineWidth = 1 / state.zoom;
      for (let x = 0; x <= state.canvasWidth; x++) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, state.canvasHeight);
        ctx.stroke();
      }
      for (let y = 0; y <= state.canvasHeight; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(state.canvasWidth, y);
        ctx.stroke();
      }
    }

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1 / state.zoom;
    ctx.strokeRect(0, 0, state.canvasWidth, state.canvasHeight);

    ctx.restore();
  }, [state]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-hidden bg-[#333] relative"
      style={{ cursor: state.activeTool === 'hand' || isPanning ? 'grab' : state.activeTool === 'zoom' ? 'zoom-in' : 'crosshair' }}
    >
      <canvas
        ref={canvasRef}
        width={containerRef.current?.clientWidth || 800}
        height={containerRef.current?.clientHeight || 600}
        className="block"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />
      <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
        {Math.round(state.zoom * 100)}% | {state.canvasWidth} × {state.canvasHeight}
      </div>
    </div>
  );
}
