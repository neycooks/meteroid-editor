'use client';

import React from 'react';
import { useEditor } from '@/context/EditorContext';
import { ToolType } from '@/lib/types';

interface ToolDef {
  id: ToolType;
  icon: string;
  label: string;
  shortcut: string;
}

const tools: ToolDef[] = [
  { id: 'move', icon: '↖', label: 'Move', shortcut: 'V' },
  { id: 'marqueeRect', icon: '⬚', label: 'Rectangular Marquee', shortcut: 'M' },
  { id: 'marqueeEllipse', icon: '⬮', label: 'Elliptical Marquee', shortcut: 'M' },
  { id: 'lasso', icon: '⤹', label: 'Lasso', shortcut: 'L' },
  { id: 'magicWand', icon: '✦', label: 'Magic Wand', shortcut: 'L' },
  { id: 'crop', icon: '⬔', label: 'Crop', shortcut: 'C' },
  { id: 'eyedropper', icon: '💉', label: 'Eyedropper', shortcut: 'I' },
  { id: 'spotHealing', icon: '⊕', label: 'Spot Healing', shortcut: 'J' },
  { id: 'brush', icon: '🖌', label: 'Brush', shortcut: 'B' },
  { id: 'cloneStamp', icon: '⊘', label: 'Clone Stamp', shortcut: 'S' },
  { id: 'historyBrush', icon: '↺', label: 'History Brush', shortcut: 'Y' },
  { id: 'eraser', icon: '◻', label: 'Eraser', shortcut: 'E' },
  { id: 'gradient', icon: '▨', label: 'Gradient', shortcut: 'G' },
  { id: 'blur', icon: '◎', label: 'Blur/Sharpen', shortcut: 'R' },
  { id: 'dodge', icon: '◐', label: 'Dodge/Burn', shortcut: 'O' },
  { id: 'pen', icon: '✎', label: 'Pen', shortcut: 'P' },
  { id: 'text', icon: 'T', label: 'Text', shortcut: 'T' },
  { id: 'shapeRect', icon: '▭', label: 'Rectangle', shortcut: 'U' },
  { id: 'shapeEllipse', icon: '◯', label: 'Ellipse', shortcut: 'U' },
  { id: 'shapeLine', icon: '╱', label: 'Line', shortcut: 'U' },
  { id: 'hand', icon: '✋', label: 'Hand', shortcut: 'H' },
  { id: 'zoom', icon: '🔍', label: 'Zoom', shortcut: 'Z' },
];

export default function Toolbar() {
  const { state, dispatch } = useEditor();

  const handleToolClick = (tool: ToolType) => {
    dispatch({ type: 'SET_TOOL', tool });
  };

  return (
    <div className="w-10 bg-[#4a4a4a] border-r border-[#3a3a3a] flex flex-col items-center py-1 overflow-y-auto">
      {tools.map((tool) => (
        <button
          key={tool.id}
          className={`w-8 h-8 flex items-center justify-center text-sm rounded-sm my-[1px] transition-colors ${
            state.activeTool === tool.id
              ? 'bg-[#6a6a6a] text-white'
              : 'text-[#ccc] hover:bg-[#5a5a5a]'
          }`}
          onClick={() => handleToolClick(tool.id)}
          title={`${tool.label} (${tool.shortcut})`}
        >
          {tool.icon}
        </button>
      ))}
    </div>
  );
}
