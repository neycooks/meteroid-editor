'use client';

import React, { useState } from 'react';
/* eslint-disable @next/next/no-img-element */
import { useEditor } from '@/context/EditorContext';

export default function LayersPanel() {
  const { state, dispatch, saveHistory } = useEditor();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const activeLayer = state.layers.find((l) => l.id === state.activeLayerId);

  const handleAddLayer = () => {
    const canvas = document.createElement('canvas');
    canvas.width = state.canvasWidth;
    canvas.height = state.canvasHeight;
    dispatch({
      type: 'ADD_LAYER',
      layer: {
        id: Math.random().toString(36).substr(2, 9),
        name: `Layer ${state.layers.length + 1}`,
        visible: true,
        opacity: 100,
        blendMode: 'normal',
        locked: false,
        canvas,
        thumbnail: '',
        x: 0,
        y: 0,
        width: state.canvasWidth,
        height: state.canvasHeight,
      },
    });
  };

  const handleDeleteLayer = (id: string) => {
    dispatch({ type: 'DELETE_LAYER', id });
  };

  const handleDuplicateLayer = (id: string) => {
    dispatch({ type: 'DUPLICATE_LAYER', id });
  };

  const handleToggleVisibility = (id: string) => {
    const layer = state.layers.find((l) => l.id === id);
    if (layer) {
      dispatch({ type: 'UPDATE_LAYER', id, updates: { visible: !layer.visible } });
    }
  };

  const handleToggleLock = (id: string) => {
    const layer = state.layers.find((l) => l.id === id);
    if (layer) {
      dispatch({ type: 'UPDATE_LAYER', id, updates: { locked: !layer.locked } });
    }
  };

  const handleOpacityChange = (id: string, opacity: number) => {
    dispatch({ type: 'UPDATE_LAYER', id, updates: { opacity } });
  };

  const handleBlendModeChange = (id: string, blendMode: string) => {
    dispatch({ type: 'UPDATE_LAYER', id, updates: { blendMode: blendMode as any } });
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    dispatch({ type: 'REORDER_LAYERS', fromIndex: draggedIndex, toIndex: index });
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const blendModes = [
    'normal', 'dissolve', 'darken', 'multiply', 'colorBurn',
    'lighten', 'screen', 'colorDodge', 'overlay', 'softLight',
    'hardLight', 'difference', 'exclusion', 'hue', 'saturation',
    'color', 'luminosity',
  ];

  return (
    <div className="w-60 bg-[#4a4a4a] border-l border-[#3a3a3a] flex flex-col text-[#ddd] text-xs">
      <div className="p-2 border-b border-[#3a3a3a]">
        <div className="flex items-center gap-2 mb-2">
          <select
            className="flex-1 bg-[#3a3a3a] border border-[#5a5a5a] text-[#ddd] px-1 py-0.5 rounded text-xs"
            value={activeLayer?.blendMode || 'normal'}
            onChange={(e) => activeLayer && handleBlendModeChange(activeLayer.id, e.target.value)}
          >
            {blendModes.map((mode) => (
              <option key={mode} value={mode}>
                {mode.charAt(0).toUpperCase() + mode.slice(1).replace(/([A-Z])/g, ' $1')}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#999]">Opacity:</span>
          <input
            type="range"
            min="0"
            max="100"
            value={activeLayer?.opacity || 100}
            onChange={(e) => activeLayer && handleOpacityChange(activeLayer.id, parseInt(e.target.value))}
            className="flex-1 h-1"
          />
          <span className="w-8 text-right">{activeLayer?.opacity || 100}%</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {state.layers.map((layer, index) => (
          <div
            key={layer.id}
            className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer border-b border-[#3a3a3a] ${
              layer.id === state.activeLayerId ? 'bg-[#6a6a6a]' : 'hover:bg-[#555]'
            } ${draggedIndex === index ? 'opacity-50' : ''}`}
            onClick={() => dispatch({ type: 'SELECT_LAYER', id: layer.id })}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
          >
            <button
              className="text-[#999] hover:text-white"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleVisibility(layer.id);
              }}
            >
              {layer.visible ? '👁' : '○'}
            </button>
            <div className="w-8 h-8 bg-[#333] border border-[#555] flex-shrink-0 overflow-hidden">
              {layer.thumbnail && layer.thumbnail.length > 0
                ? <img src={layer.thumbnail} alt="" className="w-full h-full object-contain" />
                : <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-700" />
              }
            </div>
            <span className="flex-1 truncate">{layer.name}</span>
            {layer.locked && <span className="text-[#999]">🔒</span>}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1 p-2 border-t border-[#3a3a3a]">
        <button
          className="flex-1 bg-[#5a5a5a] hover:bg-[#6a6a6a] px-2 py-1 rounded text-xs"
          onClick={handleAddLayer}
          title="New Layer"
        >
          + New
        </button>
        {activeLayer && (
          <>
            <button
              className="bg-[#5a5a5a] hover:bg-[#6a6a6a] px-2 py-1 rounded text-xs"
              onClick={() => handleDuplicateLayer(activeLayer.id)}
              title="Duplicate"
            >
              ⧉
            </button>
            <button
              className="bg-[#5a5a5a] hover:bg-[#6a6a6a] px-2 py-1 rounded text-xs"
              onClick={() => handleToggleLock(activeLayer.id)}
              title="Lock"
            >
              {activeLayer.locked ? '🔓' : '🔒'}
            </button>
            <button
              className="bg-[#5a5a5a] hover:bg-[#6a6a6a] px-2 py-1 rounded text-xs"
              onClick={() => handleDeleteLayer(activeLayer.id)}
              title="Delete"
            >
              🗑
            </button>
          </>
        )}
      </div>
    </div>
  );
}
