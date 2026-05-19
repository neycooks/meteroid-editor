'use client';

import React from 'react';
import { useEditor } from '@/context/EditorContext';

export default function PropertiesPanel() {
  const { state, dispatch } = useEditor();

  const renderToolOptions = () => {
    switch (state.activeTool) {
      case 'brush':
      case 'eraser':
      case 'cloneStamp':
        return (
          <>
            <div className="flex items-center gap-2">
              <span className="text-[#999] text-xs w-12">Size:</span>
              <input
                type="range"
                min="1"
                max="500"
                value={state.brushSize}
                onChange={(e) => dispatch({ type: 'SET_BRUSH_SIZE', size: parseInt(e.target.value) })}
                className="flex-1 h-1"
              />
              <span className="w-8 text-right text-xs">{state.brushSize}px</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#999] text-xs w-12">Opacity:</span>
              <input
                type="range"
                min="1"
                max="100"
                value={state.brushOpacity}
                onChange={(e) => dispatch({ type: 'SET_BRUSH_OPACITY', opacity: parseInt(e.target.value) })}
                className="flex-1 h-1"
              />
              <span className="w-8 text-right text-xs">{state.brushOpacity}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#999] text-xs w-12">Hardness:</span>
              <input
                type="range"
                min="0"
                max="100"
                value={state.brushHardness}
                onChange={(e) => dispatch({ type: 'SET_BRUSH_HARDNESS', hardness: parseInt(e.target.value) })}
                className="flex-1 h-1"
              />
              <span className="w-8 text-right text-xs">{state.brushHardness}%</span>
            </div>
          </>
        );
      case 'marqueeRect':
      case 'marqueeEllipse':
        return (
          <div className="text-xs text-[#999]">
            {state.selection ? (
              <div className="space-y-1">
                <div>X: {Math.round(state.selection.x)} Y: {Math.round(state.selection.y)}</div>
                <div>W: {Math.round(state.selection.width)} H: {Math.round(state.selection.height)}</div>
              </div>
            ) : (
              <div>Drag to create selection</div>
            )}
          </div>
        );
      case 'text':
        return (
          <>
            <div className="flex items-center gap-2">
              <span className="text-[#999] text-xs w-12">Size:</span>
              <input
                type="number"
                value={state.brushSize}
                onChange={(e) => dispatch({ type: 'SET_BRUSH_SIZE', size: parseInt(e.target.value) || 16 })}
                className="w-16 bg-[#3a3a3a] border border-[#5a5a5a] text-[#ddd] px-1 py-0.5 rounded text-xs"
              />
              <span className="text-xs">px</span>
            </div>
          </>
        );
      case 'zoom':
        return (
          <div className="flex items-center gap-2">
            <button
              className="bg-[#5a5a5a] hover:bg-[#6a6a6a] px-2 py-1 rounded text-xs"
              onClick={() => dispatch({ type: 'SET_ZOOM', zoom: state.zoom * 1.25 })}
            >
              +
            </button>
            <button
              className="bg-[#5a5a5a] hover:bg-[#6a6a6a] px-2 py-1 rounded text-xs"
              onClick={() => dispatch({ type: 'SET_ZOOM', zoom: state.zoom / 1.25 })}
            >
              −
            </button>
            <span className="text-xs">{Math.round(state.zoom * 100)}%</span>
          </div>
        );
      default:
        return (
          <div className="text-xs text-[#999]">
            {getToolDescription(state.activeTool)}
          </div>
        );
    }
  };

  return (
    <div className="bg-[#4a4a4a] border-b border-[#3a3a3a] p-2 text-xs">
      <div className="flex items-center gap-4">
        <span className="text-white font-semibold capitalize">{state.activeTool}</span>
        {renderToolOptions()}
      </div>
    </div>
  );
}

function getToolDescription(tool: string): string {
  const descriptions: Record<string, string> = {
    move: 'Click and drag to move layers',
    marqueeRect: 'Drag to create rectangular selection',
    marqueeEllipse: 'Drag to create elliptical selection',
    lasso: 'Freehand selection tool',
    magicWand: 'Select by color similarity',
    crop: 'Drag to crop the image',
    eyedropper: 'Click to sample color',
    spotHealing: 'Click to heal imperfections',
    brush: 'Paint with the foreground color',
    cloneStamp: 'Alt+click to sample, then paint',
    historyBrush: 'Paint from history state',
    eraser: 'Erase to transparency',
    gradient: 'Drag to create gradient fill',
    blur: 'Drag to blur areas',
    dodge: 'Lighten or darken areas',
    pen: 'Create vector paths',
    text: 'Click to add text',
    shapeRect: 'Drag to create rectangle',
    shapeEllipse: 'Drag to create ellipse',
    shapeLine: 'Drag to create line',
    hand: 'Drag to pan the canvas',
    zoom: 'Click to zoom in, Alt+click to zoom out',
  };
  return descriptions[tool] || '';
}
