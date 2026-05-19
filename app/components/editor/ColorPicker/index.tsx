'use client';

import React, { useState } from 'react';
import { useEditor } from '@/context/EditorContext';

export default function ColorPicker() {
  const { state, dispatch } = useEditor();
  const [showPicker, setShowPicker] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'fg' | 'bg'>('fg');

  const handleColorSwap = () => {
    dispatch({ type: 'SET_FOREGROUND_COLOR', color: state.backgroundColor });
    dispatch({ type: 'SET_BACKGROUND_COLOR', color: state.foregroundColor });
  };

  const handleColorReset = () => {
    dispatch({ type: 'SET_FOREGROUND_COLOR', color: '#000000' });
    dispatch({ type: 'SET_BACKGROUND_COLOR', color: '#ffffff' });
  };

  const handleColorClick = (target: 'fg' | 'bg') => {
    setPickerTarget(target);
    setShowPicker(true);
  };

  const handleColorChange = (color: string) => {
    if (pickerTarget === 'fg') {
      dispatch({ type: 'SET_FOREGROUND_COLOR', color });
    } else {
      dispatch({ type: 'SET_BACKGROUND_COLOR', color });
    }
  };

  const presetColors = [
    '#000000', '#808080', '#C0C0C0', '#FFFFFF',
    '#800000', '#FF0000', '#800080', '#FF00FF',
    '#008000', '#00FF00', '#808000', '#FFFF00',
    '#000080', '#0000FF', '#008080', '#00FFFF',
    '#FF6600', '#FF9900', '#FFCC00', '#CC6600',
    '#993300', '#CC3300', '#FF3300', '#FF6633',
  ];

  return (
    <div className="bg-[#4a4a4a] border-t border-[#3a3a3a] p-2">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div
            className="w-10 h-10 border-2 border-[#555] cursor-pointer relative"
            onClick={() => handleColorClick('fg')}
          >
            <div
              className="absolute inset-0"
              style={{ backgroundColor: state.foregroundColor }}
            />
          </div>
          <div
            className="w-6 h-6 border-2 border-[#555] cursor-pointer absolute -bottom-1 -right-1"
            onClick={() => handleColorClick('bg')}
            style={{ backgroundColor: state.backgroundColor }}
          />
          <button
            className="absolute -top-1 -left-1 text-[10px] text-[#999] hover:text-white"
            onClick={handleColorSwap}
            title="Swap colors (X)"
          >
            ⇄
          </button>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[#999] text-xs">FG:</span>
            <input
              type="text"
              value={state.foregroundColor}
              onChange={(e) => dispatch({ type: 'SET_FOREGROUND_COLOR', color: e.target.value })}
              className="w-20 bg-[#3a3a3a] border border-[#5a5a5a] text-[#ddd] px-1 py-0.5 rounded text-xs"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#999] text-xs">BG:</span>
            <input
              type="text"
              value={state.backgroundColor}
              onChange={(e) => dispatch({ type: 'SET_BACKGROUND_COLOR', color: e.target.value })}
              className="w-20 bg-[#3a3a3a] border border-[#5a5a5a] text-[#ddd] px-1 py-0.5 rounded text-xs"
            />
          </div>
        </div>

        <button
          className="text-[#999] hover:text-white text-xs"
          onClick={handleColorReset}
          title="Default colors (D)"
        >
          ◪
        </button>
      </div>

      <div className="grid grid-cols-12 gap-0.5 mt-2">
        {presetColors.map((color) => (
          <button
            key={color}
            className="w-full aspect-square border border-[#555] hover:border-white"
            style={{ backgroundColor: color }}
            onClick={() => handleColorChange(color)}
          />
        ))}
      </div>

      {showPicker && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowPicker(false)}>
          <div className="bg-[#4a4a4a] p-4 rounded shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-white text-sm mb-2">
              {pickerTarget === 'fg' ? 'Foreground' : 'Background'} Color
            </h3>
            <input
              type="color"
              value={pickerTarget === 'fg' ? state.foregroundColor : state.backgroundColor}
              onChange={(e) => handleColorChange(e.target.value)}
              className="w-48 h-48 cursor-pointer"
            />
            <div className="flex justify-end mt-2">
              <button
                className="bg-[#5a5a5a] hover:bg-[#6a6a6a] px-3 py-1 rounded text-xs text-white"
                onClick={() => setShowPicker(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
