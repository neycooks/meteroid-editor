'use client';

import React, { useState } from 'react';
import MenuBar from '@/components/editor/MenuBar';
import Toolbar from '@/components/editor/Toolbar';
import Canvas from '@/components/editor/Canvas';
import LayersPanel from '@/components/editor/LayersPanel';
import PropertiesPanel from '@/components/editor/PropertiesPanel';
import ColorPicker from '@/components/editor/ColorPicker';
import NavigatorPanel from '@/components/editor/NavigatorPanel';
import { useEditor } from '@/context/EditorContext';

function EditorLayout() {
  const { state } = useEditor();
  const [showLayers, setShowLayers] = useState(true);
  const [showNavigator, setShowNavigator] = useState(true);
  const [showColor, setShowColor] = useState(true);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#333] overflow-hidden">
      <MenuBar />
      <PropertiesPanel />
      <div className="flex flex-1 overflow-hidden">
        <Toolbar />
        <div className="flex flex-1 overflow-hidden">
          <Canvas />
          <div className="flex flex-col w-60">
            {showNavigator && <NavigatorPanel />}
            {showColor && <ColorPicker />}
            {showLayers && <LayersPanel />}
          </div>
        </div>
      </div>
      <StatusBar />
    </div>
  );
}

function StatusBar() {
  const { state } = useEditor();

  return (
    <div className="h-6 bg-[#535353] border-t border-[#3a3a3a] flex items-center px-3 text-[#ccc] text-xs gap-4">
      <span>Tool: {state.activeTool}</span>
      <span>Zoom: {Math.round(state.zoom * 100)}%</span>
      <span>Size: {state.canvasWidth} × {state.canvasHeight}</span>
      <span>Layers: {state.layers.length}</span>
      {state.selection && (
        <span>
          Selection: {Math.round(state.selection.width)} × {Math.round(state.selection.height)}
        </span>
      )}
      <div className="flex-1" />
      <span>Memory: {Math.round((state.layers.length * state.canvasWidth * state.canvasHeight * 4) / 1024 / 1024)}MB</span>
    </div>
  );
}

export default function Editor() {
  return <EditorLayout />;
}
