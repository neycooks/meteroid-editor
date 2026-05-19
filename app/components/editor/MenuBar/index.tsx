'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useEditor } from '@/context/EditorContext';
import { MenuItem, MenuAction } from '@/lib/types';

export default function MenuBar() {
  const { state, dispatch, saveHistory, undo, redo, openImage, exportImage } = useEditor();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFileAction = (action: string) => {
    switch (action) {
      case 'new': {
        const width = parseInt(prompt('Width (px):', '800') || '800');
        const height = parseInt(prompt('Height (px):', '600') || '600');
        dispatch({ type: 'SET_CANVAS_SIZE', width, height });
        break;
      }
      case 'open': {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*,.psd,.pdf,.svg,.webp,.avif';
        input.onchange = () => {
          if (input.files?.[0]) openImage(input.files[0]);
        };
        input.click();
        break;
      }
      case 'save-psd':
        alert('PSD export requires additional libraries. Use PNG/JPEG export instead.');
        break;
      case 'export-png':
        exportImage('png');
        break;
      case 'export-jpg':
        exportImage('jpg');
        break;
      case 'export-webp':
        exportImage('webp');
        break;
    }
  };

  const handleEditAction = (action: string) => {
    switch (action) {
      case 'undo': undo(); break;
      case 'redo': redo(); break;
      case 'cut':
      case 'copy':
      case 'paste':
        alert(`${action.toUpperCase()} - Clipboard operations`);
        break;
      case 'clear':
        saveHistory();
        const layer = state.layers.find(l => l.id === state.activeLayerId);
        if (layer) {
          const ctx = layer.canvas.getContext('2d')!;
          if (state.selection) {
            ctx.clearRect(state.selection.x, state.selection.y, state.selection.width, state.selection.height);
          } else {
            ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
          }
          dispatch({ type: 'DRAW_ON_LAYER', id: layer.id, canvas: layer.canvas });
        }
        break;
      case 'fill-fg':
        saveHistory();
        const fillLayer = state.layers.find(l => l.id === state.activeLayerId);
        if (fillLayer) {
          const ctx = fillLayer.canvas.getContext('2d')!;
          ctx.fillStyle = state.foregroundColor;
          if (state.selection) {
            ctx.fillRect(state.selection.x, state.selection.y, state.selection.width, state.selection.height);
          } else {
            ctx.fillRect(0, 0, fillLayer.canvas.width, fillLayer.canvas.height);
          }
          dispatch({ type: 'DRAW_ON_LAYER', id: fillLayer.id, canvas: fillLayer.canvas });
        }
        break;
      case 'fill-bg':
        saveHistory();
        const bgLayer = state.layers.find(l => l.id === state.activeLayerId);
        if (bgLayer) {
          const ctx = bgLayer.canvas.getContext('2d')!;
          ctx.fillStyle = state.backgroundColor;
          if (state.selection) {
            ctx.fillRect(state.selection.x, state.selection.y, state.selection.width, state.selection.height);
          } else {
            ctx.fillRect(0, 0, bgLayer.canvas.width, bgLayer.canvas.height);
          }
          dispatch({ type: 'DRAW_ON_LAYER', id: bgLayer.id, canvas: bgLayer.canvas });
        }
        break;
    }
  };

  const handleImageAction = (action: string) => {
    switch (action) {
      case 'canvas-size': {
        const w = parseInt(prompt('Width:', state.canvasWidth.toString()) || '800');
        const h = parseInt(prompt('Height:', state.canvasHeight.toString()) || '600');
        dispatch({ type: 'SET_CANVAS_SIZE', width: w, height: h });
        break;
      }
      case 'resize': {
        const w = parseInt(prompt('New width:', state.canvasWidth.toString()) || '800');
        const h = parseInt(prompt('New height:', state.canvasHeight.toString()) || '600');
        dispatch({ type: 'SET_CANVAS_SIZE', width: w, height: h });
        break;
      }
      case 'rotate-cw':
      case 'rotate-ccw':
      case 'flip-h':
      case 'flip-v':
        saveHistory();
        const layer = state.layers.find(l => l.id === state.activeLayerId);
        if (layer) {
          const tempCanvas = document.createElement('canvas');
          const tempCtx = tempCanvas.getContext('2d')!;
          if (action.includes('rotate')) {
            tempCanvas.width = layer.canvas.height;
            tempCanvas.height = layer.canvas.width;
            tempCtx.translate(tempCanvas.width / 2, tempCanvas.height / 2);
            tempCtx.rotate(action === 'rotate-cw' ? Math.PI / 2 : -Math.PI / 2);
            tempCtx.drawImage(layer.canvas, -layer.canvas.width / 2, -layer.canvas.height / 2);
          } else if (action === 'flip-h') {
            tempCanvas.width = layer.canvas.width;
            tempCanvas.height = layer.canvas.height;
            tempCtx.translate(tempCanvas.width, 0);
            tempCtx.scale(-1, 1);
            tempCtx.drawImage(layer.canvas, 0, 0);
          } else {
            tempCanvas.width = layer.canvas.width;
            tempCanvas.height = layer.canvas.height;
            tempCtx.translate(0, tempCanvas.height);
            tempCtx.scale(1, -1);
            tempCtx.drawImage(layer.canvas, 0, 0);
          }
          dispatch({ type: 'DRAW_ON_LAYER', id: layer.id, canvas: tempCanvas });
        }
        break;
    }
  };

  const handleLayerAction = (action: string) => {
    switch (action) {
      case 'new-layer': {
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
        break;
      }
      case 'duplicate-layer':
        if (state.activeLayerId) dispatch({ type: 'DUPLICATE_LAYER', id: state.activeLayerId });
        break;
      case 'delete-layer':
        if (state.activeLayerId) dispatch({ type: 'DELETE_LAYER', id: state.activeLayerId });
        break;
      case 'merge-down':
        if (state.activeLayerId) dispatch({ type: 'MERGE_DOWN', id: state.activeLayerId });
        break;
      case 'flatten':
        dispatch({ type: 'FLATTEN_IMAGE' });
        break;
    }
  };

  const handleSelectAction = (action: string) => {
    switch (action) {
      case 'all': dispatch({ type: 'SELECT_ALL' }); break;
      case 'deselect': dispatch({ type: 'DESELECT_ALL' }); break;
      case 'invert': dispatch({ type: 'INVERT_SELECTION' }); break;
    }
  };

  const handleFilterAction = (action: string) => {
    saveHistory();
    const params: Record<string, number> = {};
    switch (action) {
      case 'blur':
        params.radius = parseInt(prompt('Blur radius:', '3') || '3');
        dispatch({ type: 'APPLY_FILTER', filterType: 'blur', params });
        break;
      case 'sharpen':
        dispatch({ type: 'APPLY_FILTER', filterType: 'sharpen', params });
        break;
      case 'brightness-contrast':
        params.brightness = parseInt(prompt('Brightness (-100 to 100):', '0') || '0');
        params.contrast = parseInt(prompt('Contrast (-100 to 100):', '0') || '0');
        dispatch({ type: 'APPLY_FILTER', filterType: 'brightnessContrast', params });
        break;
      case 'hue-saturation':
        params.hue = parseInt(prompt('Hue (-180 to 180):', '0') || '0');
        params.saturation = parseInt(prompt('Saturation (-100 to 100):', '0') || '0');
        dispatch({ type: 'APPLY_FILTER', filterType: 'hueSaturation', params });
        break;
      case 'invert':
        dispatch({ type: 'APPLY_FILTER', filterType: 'invert', params });
        break;
      case 'desaturate':
        dispatch({ type: 'APPLY_FILTER', filterType: 'desaturate', params });
        break;
      case 'posterize':
        params.levels = parseInt(prompt('Levels (2-255):', '4') || '4');
        dispatch({ type: 'APPLY_FILTER', filterType: 'posterize', params });
        break;
      case 'threshold':
        params.threshold = parseInt(prompt('Threshold (0-255):', '128') || '128');
        dispatch({ type: 'APPLY_FILTER', filterType: 'threshold', params });
        break;
      case 'noise':
        params.amount = parseInt(prompt('Noise amount (0-255):', '25') || '25');
        dispatch({ type: 'APPLY_FILTER', filterType: 'noise', params });
        break;
      case 'pixelate':
        params.size = parseInt(prompt('Pixel size:', '8') || '8');
        dispatch({ type: 'APPLY_FILTER', filterType: 'pixelate', params });
        break;
    }
  };

  const handleViewAction = (action: string) => {
    switch (action) {
      case 'zoom-in':
        dispatch({ type: 'SET_ZOOM', zoom: state.zoom * 1.25 });
        break;
      case 'zoom-out':
        dispatch({ type: 'SET_ZOOM', zoom: state.zoom / 1.25 });
        break;
      case 'fit-screen':
        dispatch({ type: 'SET_ZOOM', zoom: 1 });
        dispatch({ type: 'SET_PAN', panX: 0, panY: 0 });
        break;
      case 'grid':
        dispatch({ type: 'TOGGLE_GRID' });
        break;
      case 'rulers':
        dispatch({ type: 'TOGGLE_RULERS' });
        break;
    }
  };

  type MenuItemType = { label: string; shortcut?: string; action: string; separator?: boolean } | { separator: true; label?: never; shortcut?: never; action?: never };
  const menus: { label: string; items: MenuItemType[] }[] = [
    {
      label: 'File',
      items: [
        { label: 'New', shortcut: 'Ctrl+N', action: 'new' },
        { label: 'Open', shortcut: 'Ctrl+O', action: 'open' },
        { label: 'Open PSD', action: 'open' },
        { separator: true },
        { label: 'Save as PSD', action: 'save-psd' },
        { label: 'Export as PNG', shortcut: 'Ctrl+S', action: 'export-png' },
        { label: 'Export as JPG', action: 'export-jpg' },
        { label: 'Export as WebP', action: 'export-webp' },
      ],
    },
    {
      label: 'Edit',
      items: [
        { label: 'Undo', shortcut: 'Ctrl+Z', action: 'undo' },
        { label: 'Redo', shortcut: 'Ctrl+Y', action: 'redo' },
        { separator: true },
        { label: 'Cut', shortcut: 'Ctrl+X', action: 'cut' },
        { label: 'Copy', shortcut: 'Ctrl+C', action: 'copy' },
        { label: 'Paste', shortcut: 'Ctrl+V', action: 'paste' },
        { separator: true },
        { label: 'Clear', shortcut: 'Delete', action: 'clear' },
        { label: 'Fill with Foreground', shortcut: 'Alt+Backspace', action: 'fill-fg' },
        { label: 'Fill with Background', shortcut: 'Ctrl+Backspace', action: 'fill-bg' },
      ],
    },
    {
      label: 'Image',
      items: [
        { label: 'Canvas Size', shortcut: 'Ctrl+Alt+C', action: 'canvas-size' },
        { label: 'Resize', shortcut: 'Ctrl+Alt+I', action: 'resize' },
        { separator: true },
        { label: 'Rotate 90° CW', action: 'rotate-cw' },
        { label: 'Rotate 90° CCW', action: 'rotate-ccw' },
        { label: 'Flip Horizontal', action: 'flip-h' },
        { label: 'Flip Vertical', action: 'flip-v' },
      ],
    },
    {
      label: 'Layer',
      items: [
        { label: 'New Layer', shortcut: 'Ctrl+Shift+N', action: 'new-layer' },
        { label: 'Duplicate Layer', shortcut: 'Ctrl+J', action: 'duplicate-layer' },
        { label: 'Delete Layer', shortcut: 'Delete', action: 'delete-layer' },
        { separator: true },
        { label: 'Merge Down', shortcut: 'Ctrl+E', action: 'merge-down' },
        { label: 'Flatten Image', action: 'flatten' },
      ],
    },
    {
      label: 'Select',
      items: [
        { label: 'All', shortcut: 'Ctrl+A', action: 'all' },
        { label: 'Deselect', shortcut: 'Ctrl+D', action: 'deselect' },
        { label: 'Invert', shortcut: 'Ctrl+Shift+I', action: 'invert' },
      ],
    },
    {
      label: 'Filter',
      items: [
        { label: 'Blur', action: 'blur' },
        { label: 'Sharpen', action: 'sharpen' },
        { separator: true },
        { label: 'Brightness/Contrast', action: 'brightness-contrast' },
        { label: 'Hue/Saturation', action: 'hue-saturation' },
        { separator: true },
        { label: 'Invert', shortcut: 'Ctrl+I', action: 'invert' },
        { label: 'Desaturate', shortcut: 'Ctrl+Shift+U', action: 'desaturate' },
        { label: 'Posterize', action: 'posterize' },
        { label: 'Threshold', action: 'threshold' },
        { label: 'Add Noise', action: 'noise' },
        { label: 'Pixelate', action: 'pixelate' },
      ],
    },
    {
      label: 'View',
      items: [
        { label: 'Zoom In', shortcut: 'Ctrl+', action: 'zoom-in' },
        { label: 'Zoom Out', shortcut: 'Ctrl-', action: 'zoom-out' },
        { label: 'Fit on Screen', shortcut: 'Ctrl+0', action: 'fit-screen' },
        { separator: true },
        { label: 'Grid', shortcut: 'Ctrl+\'', action: 'grid' },
        { label: 'Rulers', shortcut: 'Ctrl+R', action: 'rulers' },
      ],
    },
  ];

  const executeAction = (menuLabel: string, action: string) => {
    switch (menuLabel) {
      case 'File': handleFileAction(action); break;
      case 'Edit': handleEditAction(action); break;
      case 'Image': handleImageAction(action); break;
      case 'Layer': handleLayerAction(action); break;
      case 'Select': handleSelectAction(action); break;
      case 'Filter': handleFilterAction(action); break;
      case 'View': handleViewAction(action); break;
    }
    setActiveMenu(null);
  };

  return (
    <div ref={menuRef} className="flex items-center h-8 bg-[#535353] border-b border-[#3a3a3a] select-none text-[#ddd] text-xs">
      <div className="flex items-center px-2">
        <span className="text-white font-bold text-sm mr-2">Meteroid</span>
      </div>
      {menus.map((menu) => (
        <div key={menu.label} className="relative">
          <button
            className={`px-3 py-1 hover:bg-[#6a6a6a] ${activeMenu === menu.label ? 'bg-[#6a6a6a]' : ''}`}
            onClick={() => setActiveMenu(activeMenu === menu.label ? null : menu.label)}
          >
            {menu.label}
          </button>
          {activeMenu === menu.label && (
            <div className="absolute top-full left-0 bg-[#4a4a4a] border border-[#3a3a3a] shadow-lg min-w-[200px] z-50 py-1">
              {menu.items.map((item, idx) =>
                item.separator ? (
                  <div key={idx} className="border-t border-[#5a5a5a] my-1" />
                ) : (
                  <button
                    key={idx}
                    className="w-full text-left px-4 py-1.5 hover:bg-[#6a6a6a] flex justify-between items-center"
                    onClick={() => executeAction(menu.label, item.action)}
                  >
                    <span>{item.label}</span>
                    {item.shortcut && <span className="text-[#999] ml-8">{item.shortcut}</span>}
                  </button>
                )
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
