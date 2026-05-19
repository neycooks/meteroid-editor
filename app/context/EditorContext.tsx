'use client';

import React, { createContext, useContext, useReducer, useCallback, useRef, useEffect } from 'react';
import { EditorState, Layer, ToolType, HistoryState, LayerSnapshot, Selection, FilterType } from '@/lib/types';

const generateId = () => Math.random().toString(36).substr(2, 9);

const createEmptyCanvas = (width: number, height: number): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

const canvasToThumbnail = (canvas: HTMLCanvasElement): string => {
  const thumb = document.createElement('canvas');
  thumb.width = 40;
  thumb.height = 40;
  const ctx = thumb.getContext('2d')!;
  const scale = Math.min(40 / canvas.width, 40 / canvas.height);
  const w = canvas.width * scale;
  const h = canvas.height * scale;
  ctx.drawImage(canvas, (40 - w) / 2, (40 - h) / 2, w, h);
  return thumb.toDataURL();
};

const createInitialState = (): EditorState => {
  const width = 800;
  const height = 600;
  const bgCanvas = createEmptyCanvas(width, height);
  const bgCtx = bgCanvas.getContext('2d')!;
  bgCtx.fillStyle = '#ffffff';
  bgCtx.fillRect(0, 0, width, height);

  const bgLayer: Layer = {
    id: generateId(),
    name: 'Background',
    visible: true,
    opacity: 100,
    blendMode: 'normal',
    locked: true,
    canvas: bgCanvas,
    thumbnail: canvasToThumbnail(bgCanvas),
    x: 0,
    y: 0,
    width,
    height,
  };

  return {
    layers: [bgLayer],
    activeLayerId: bgLayer.id,
    activeTool: 'brush',
    brushSize: 10,
    brushOpacity: 100,
    brushHardness: 100,
    foregroundColor: '#000000',
    backgroundColor: '#ffffff',
    zoom: 1,
    panX: 0,
    panY: 0,
    canvasWidth: width,
    canvasHeight: height,
    selection: null,
    history: [],
    historyIndex: -1,
    showGrid: false,
    showRulers: true,
    showGuides: [],
    snapping: true,
  };
};

type EditorAction =
  | { type: 'SET_TOOL'; tool: ToolType }
  | { type: 'SET_BRUSH_SIZE'; size: number }
  | { type: 'SET_BRUSH_OPACITY'; opacity: number }
  | { type: 'SET_BRUSH_HARDNESS'; hardness: number }
  | { type: 'SET_FOREGROUND_COLOR'; color: string }
  | { type: 'SET_BACKGROUND_COLOR'; color: string }
  | { type: 'SET_ZOOM'; zoom: number }
  | { type: 'SET_PAN'; panX: number; panY: number }
  | { type: 'SET_CANVAS_SIZE'; width: number; height: number }
  | { type: 'ADD_LAYER'; layer: Layer }
  | { type: 'DELETE_LAYER'; id: string }
  | { type: 'SELECT_LAYER'; id: string }
  | { type: 'UPDATE_LAYER'; id: string; updates: Partial<Layer> }
  | { type: 'REORDER_LAYERS'; fromIndex: number; toIndex: number }
  | { type: 'DUPLICATE_LAYER'; id: string }
  | { type: 'MERGE_DOWN'; id: string }
  | { type: 'FLATTEN_IMAGE' }
  | { type: 'SET_SELECTION'; selection: Selection | null }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'SELECT_ALL' }
  | { type: 'DESELECT_ALL' }
  | { type: 'INVERT_SELECTION' }
  | { type: 'PUSH_HISTORY'; state: HistoryState }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'TOGGLE_GRID' }
  | { type: 'TOGGLE_RULERS' }
  | { type: 'LOAD_IMAGE'; image: HTMLImageElement; x?: number; y?: number }
  | { type: 'APPLY_FILTER'; filterType: FilterType; params: Record<string, number> }
  | { type: 'RESET_EDITOR' }
  | { type: 'DRAW_ON_LAYER'; id: string; canvas: HTMLCanvasElement };

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'SET_TOOL':
      return { ...state, activeTool: action.tool };

    case 'SET_BRUSH_SIZE':
      return { ...state, brushSize: action.size };

    case 'SET_BRUSH_OPACITY':
      return { ...state, brushOpacity: action.opacity };

    case 'SET_BRUSH_HARDNESS':
      return { ...state, brushHardness: action.hardness };

    case 'SET_FOREGROUND_COLOR':
      return { ...state, foregroundColor: action.color };

    case 'SET_BACKGROUND_COLOR':
      return { ...state, backgroundColor: action.color };

    case 'SET_ZOOM':
      return { ...state, zoom: Math.max(0.01, Math.min(32, action.zoom)) };

    case 'SET_PAN':
      return { ...state, panX: action.panX, panY: action.panY };

    case 'SET_CANVAS_SIZE': {
      const newLayers = state.layers.map((layer) => {
        const newCanvas = createEmptyCanvas(action.width, action.height);
        const ctx = newCanvas.getContext('2d')!;
        ctx.drawImage(layer.canvas, 0, 0);
        return { ...layer, canvas: newCanvas, width: action.width, height: action.height, thumbnail: canvasToThumbnail(newCanvas) };
      });
      return {
        ...state,
        canvasWidth: action.width,
        canvasHeight: action.height,
        layers: newLayers,
      };
    }

    case 'ADD_LAYER': {
      const newLayers = [action.layer, ...state.layers];
      return { ...state, layers: newLayers, activeLayerId: action.layer.id };
    }

    case 'DELETE_LAYER': {
      if (state.layers.length <= 1) return state;
      const newLayers = state.layers.filter((l) => l.id !== action.id);
      const newActiveId = state.activeLayerId === action.id ? newLayers[0].id : state.activeLayerId;
      return { ...state, layers: newLayers, activeLayerId: newActiveId };
    }

    case 'SELECT_LAYER':
      return { ...state, activeLayerId: action.id };

    case 'UPDATE_LAYER': {
      const updatedLayers = state.layers.map((layer) =>
        layer.id === action.id ? { ...layer, ...action.updates } : layer
      );
      return { ...state, layers: updatedLayers };
    }

    case 'REORDER_LAYERS': {
      const newLayers = [...state.layers];
      const [moved] = newLayers.splice(action.fromIndex, 1);
      newLayers.splice(action.toIndex, 0, moved);
      return { ...state, layers: newLayers };
    }

    case 'DUPLICATE_LAYER': {
      const sourceLayer = state.layers.find((l) => l.id === action.id);
      if (!sourceLayer) return state;
      const newCanvas = createEmptyCanvas(sourceLayer.width, sourceLayer.height);
      const ctx = newCanvas.getContext('2d')!;
      ctx.drawImage(sourceLayer.canvas, 0, 0);
      const newLayer: Layer = {
        ...sourceLayer,
        id: generateId(),
        name: `${sourceLayer.name} copy`,
        canvas: newCanvas,
        thumbnail: canvasToThumbnail(newCanvas),
      };
      const idx = state.layers.findIndex((l) => l.id === action.id);
      const newLayers = [...state.layers];
      newLayers.splice(idx, 0, newLayer);
      return { ...state, layers: newLayers, activeLayerId: newLayer.id };
    }

    case 'MERGE_DOWN': {
      const idx = state.layers.findIndex((l) => l.id === action.id);
      if (idx >= state.layers.length - 1) return state;
      const topLayer = state.layers[idx];
      const bottomLayer = state.layers[idx + 1];
      const mergedCanvas = createEmptyCanvas(state.canvasWidth, state.canvasHeight);
      const ctx = mergedCanvas.getContext('2d')!;
      ctx.drawImage(bottomLayer.canvas, 0, 0);
      ctx.globalAlpha = topLayer.opacity / 100;
      ctx.drawImage(topLayer.canvas, topLayer.x, topLayer.y);
      const mergedLayer: Layer = {
        ...bottomLayer,
        canvas: mergedCanvas,
        thumbnail: canvasToThumbnail(mergedCanvas),
      };
      const newLayers = state.layers.filter((l) => l.id !== action.id).map((l) =>
        l.id === bottomLayer.id ? mergedLayer : l
      );
      return { ...state, layers: newLayers, activeLayerId: mergedLayer.id };
    }

    case 'FLATTEN_IMAGE': {
      const flatCanvas = createEmptyCanvas(state.canvasWidth, state.canvasHeight);
      const ctx = flatCanvas.getContext('2d')!;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, state.canvasWidth, state.canvasHeight);
      const reversedLayers = [...state.layers].reverse();
      for (const layer of reversedLayers) {
        if (!layer.visible) continue;
        ctx.globalAlpha = layer.opacity / 100;
        ctx.drawImage(layer.canvas, layer.x, layer.y);
      }
      const flatLayer: Layer = {
        id: generateId(),
        name: 'Background',
        visible: true,
        opacity: 100,
        blendMode: 'normal',
        locked: false,
        canvas: flatCanvas,
        thumbnail: canvasToThumbnail(flatCanvas),
        x: 0,
        y: 0,
        width: state.canvasWidth,
        height: state.canvasHeight,
      };
      return { ...state, layers: [flatLayer], activeLayerId: flatLayer.id };
    }

    case 'SET_SELECTION':
      return { ...state, selection: action.selection };

    case 'CLEAR_SELECTION':
    case 'DESELECT_ALL':
      return { ...state, selection: null };

    case 'SELECT_ALL':
      return {
        ...state,
        selection: {
          type: 'rect',
          x: 0,
          y: 0,
          width: state.canvasWidth,
          height: state.canvasHeight,
        },
      };

    case 'INVERT_SELECTION':
      return state;

    case 'PUSH_HISTORY':
      return {
        ...state,
        history: [...state.history.slice(0, state.historyIndex + 1), action.state],
        historyIndex: state.historyIndex + 1,
      };

    case 'UNDO': {
      if (state.historyIndex < 0) return state;
      const prevState = state.history[state.historyIndex];
      const restoredLayers = prevState.layers.map((snap) => {
        const canvas = createEmptyCanvas(snap.imageData.width, snap.imageData.height);
        const ctx = canvas.getContext('2d')!;
        ctx.putImageData(snap.imageData, 0, 0);
        return {
          id: snap.id,
          name: snap.name,
          visible: snap.visible,
          opacity: snap.opacity,
          blendMode: snap.blendMode,
          locked: false,
          canvas,
          thumbnail: canvasToThumbnail(canvas),
          x: snap.x,
          y: snap.y,
          width: snap.imageData.width,
          height: snap.imageData.height,
        };
      });
      return {
        ...state,
        layers: restoredLayers,
        activeLayerId: prevState.activeLayerId,
        historyIndex: state.historyIndex - 1,
      };
    }

    case 'REDO': {
      if (state.historyIndex >= state.history.length - 1) return state;
      const nextState = state.history[state.historyIndex + 1];
      const restoredLayers = nextState.layers.map((snap) => {
        const canvas = createEmptyCanvas(snap.imageData.width, snap.imageData.height);
        const ctx = canvas.getContext('2d')!;
        ctx.putImageData(snap.imageData, 0, 0);
        return {
          id: snap.id,
          name: snap.name,
          visible: snap.visible,
          opacity: snap.opacity,
          blendMode: snap.blendMode,
          locked: false,
          canvas,
          thumbnail: canvasToThumbnail(canvas),
          x: snap.x,
          y: snap.y,
          width: snap.imageData.width,
          height: snap.imageData.height,
        };
      });
      return {
        ...state,
        layers: restoredLayers,
        activeLayerId: nextState.activeLayerId,
        historyIndex: state.historyIndex + 1,
      };
    }

    case 'TOGGLE_GRID':
      return { ...state, showGrid: !state.showGrid };

    case 'TOGGLE_RULERS':
      return { ...state, showRulers: !state.showRulers };

    case 'LOAD_IMAGE': {
      const imgCanvas = createEmptyCanvas(state.canvasWidth, state.canvasHeight);
      const ctx = imgCanvas.getContext('2d')!;
      const x = action.x ?? 0;
      const y = action.y ?? 0;
      ctx.drawImage(action.image, x, y);
      const imgLayer: Layer = {
        id: generateId(),
        name: 'Layer',
        visible: true,
        opacity: 100,
        blendMode: 'normal',
        locked: false,
        canvas: imgCanvas,
        thumbnail: canvasToThumbnail(imgCanvas),
        x: 0,
        y: 0,
        width: state.canvasWidth,
        height: state.canvasHeight,
      };
      return { ...state, layers: [imgLayer, ...state.layers], activeLayerId: imgLayer.id };
    }

    case 'APPLY_FILTER': {
      const activeLayer = state.layers.find((l) => l.id === state.activeLayerId);
      if (!activeLayer) return state;
      const newCanvas = createEmptyCanvas(activeLayer.width, activeLayer.height);
      const ctx = newCanvas.getContext('2d')!;
      ctx.drawImage(activeCanvas.canvas, 0, 0);
      const imageData = ctx.getImageData(0, 0, newCanvas.width, newCanvas.height);
      const data = imageData.data;
      const params = action.params;

      switch (action.filterType) {
        case 'brightnessContrast': {
          const brightness = (params.brightness ?? 0) as number;
          const contrast = (params.contrast ?? 0) as number;
          const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
          for (let i = 0; i < data.length; i += 4) {
            for (let c = 0; c < 3; c++) {
              let val = data[i + c] + brightness;
              val = factor * (val - 128) + 128;
              data[i + c] = Math.max(0, Math.min(255, val));
            }
          }
          break;
        }
        case 'hueSaturation': {
          const hue = (params.hue ?? 0) as number;
          const saturation = (params.saturation ?? 0) as number;
          for (let i = 0; i < data.length; i += 4) {
            let r = data[i] / 255;
            let g = data[i + 1] / 255;
            let b = data[i + 2] / 255;
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            let h = 0;
            let s = 0;
            const l = (max + min) / 2;
            if (max !== min) {
              const d = max - min;
              s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
              switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
              }
            }
            h = (h + hue / 360) % 1;
            if (h < 0) h += 1;
            s = Math.max(0, Math.min(1, s + saturation / 100));
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            const hue2rgb = (p: number, q: number, t: number) => {
              if (t < 0) t += 1;
              if (t > 1) t -= 1;
              if (t < 1 / 6) return p + (q - p) * 6 * t;
              if (t < 1 / 2) return q;
              if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
              return p;
            };
            data[i] = Math.round(hue2rgb(p, q, h + 1 / 3) * 255);
            data[i + 1] = Math.round(hue2rgb(p, q, h) * 255);
            data[i + 2] = Math.round(hue2rgb(p, q, h - 1 / 3) * 255);
          }
          break;
        }
        case 'invert': {
          for (let i = 0; i < data.length; i += 4) {
            data[i] = 255 - data[i];
            data[i + 1] = 255 - data[i + 1];
            data[i + 2] = 255 - data[i + 2];
          }
          break;
        }
        case 'desaturate': {
          for (let i = 0; i < data.length; i += 4) {
            const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            data[i] = gray;
            data[i + 1] = gray;
            data[i + 2] = gray;
          }
          break;
        }
        case 'posterize': {
          const levels = Math.max(2, Math.min(255, (params.levels ?? 4) as number));
          const step = 255 / (levels - 1);
          for (let i = 0; i < data.length; i += 4) {
            for (let c = 0; c < 3; c++) {
              data[i + c] = Math.round(Math.round(data[i + c] / step) * step);
            }
          }
          break;
        }
        case 'threshold': {
          const threshold = (params.threshold ?? 128) as number;
          for (let i = 0; i < data.length; i += 4) {
            const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            const val = gray >= threshold ? 255 : 0;
            data[i] = val;
            data[i + 1] = val;
            data[i + 2] = val;
          }
          break;
        }
        case 'noise': {
          const amount = (params.amount ?? 25) as number;
          for (let i = 0; i < data.length; i += 4) {
            for (let c = 0; c < 3; c++) {
              data[i + c] = Math.max(0, Math.min(255, data[i + c] + (Math.random() - 0.5) * amount));
            }
          }
          break;
        }
        case 'pixelate': {
          const size = Math.max(2, (params.size ?? 8) as number);
          for (let y = 0; y < imageData.height; y += size) {
            for (let x = 0; x < imageData.width; x += size) {
              const idx = (y * imageData.width + x) * 4;
              const r = data[idx];
              const g = data[idx + 1];
              const b = data[idx + 2];
              for (let dy = 0; dy < size && y + dy < imageData.height; dy++) {
                for (let dx = 0; dx < size && x + dx < imageData.width; dx++) {
                  const pIdx = ((y + dy) * imageData.width + (x + dx)) * 4;
                  data[pIdx] = r;
                  data[pIdx + 1] = g;
                  data[pIdx + 2] = b;
                }
              }
            }
          }
          break;
        }
        case 'blur':
        case 'gaussianBlur': {
          const radius = Math.max(1, (params.radius ?? 3) as number);
          const copy = new Uint8ClampedArray(data);
          for (let y = 0; y < imageData.height; y++) {
            for (let x = 0; x < imageData.width; x++) {
              let r = 0, g = 0, b = 0, count = 0;
              for (let dy = -radius; dy <= radius; dy++) {
                for (let dx = -radius; dx <= radius; dx++) {
                  const nx = x + dx;
                  const ny = y + dy;
                  if (nx >= 0 && nx < imageData.width && ny >= 0 && ny < imageData.height) {
                    const idx = (ny * imageData.width + nx) * 4;
                    r += copy[idx];
                    g += copy[idx + 1];
                    b += copy[idx + 2];
                    count++;
                  }
                }
              }
              const idx = (y * imageData.width + x) * 4;
              data[idx] = r / count;
              data[idx + 1] = g / count;
              data[idx + 2] = b / count;
            }
          }
          break;
        }
        case 'sharpen': {
          const copy = new Uint8ClampedArray(data);
          const kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];
          for (let y = 1; y < imageData.height - 1; y++) {
            for (let x = 1; x < imageData.width - 1; x++) {
              for (let c = 0; c < 3; c++) {
                let sum = 0;
                for (let ky = -1; ky <= 1; ky++) {
                  for (let kx = -1; kx <= 1; kx++) {
                    const idx = ((y + ky) * imageData.width + (x + kx)) * 4 + c;
                    sum += copy[idx] * kernel[(ky + 1) * 3 + (kx + 1)];
                  }
                }
                data[(y * imageData.width + x) * 4 + c] = Math.max(0, Math.min(255, sum));
              }
            }
          }
          break;
        }
      }

      ctx.putImageData(imageData, 0, 0);
      const updatedLayers = state.layers.map((layer) =>
        layer.id === state.activeLayerId
          ? { ...layer, canvas: newCanvas, thumbnail: canvasToThumbnail(newCanvas) }
          : layer
      );
      return { ...state, layers: updatedLayers };
    }

    case 'DRAW_ON_LAYER': {
      const updatedLayers = state.layers.map((layer) =>
        layer.id === action.id
          ? { ...layer, canvas: action.canvas, thumbnail: canvasToThumbnail(action.canvas) }
          : layer
      );
      return { ...state, layers: updatedLayers };
    }

    case 'RESET_EDITOR':
      return createInitialState();

    default:
      return state;
  }
}

interface EditorContextType {
  state: EditorState;
  dispatch: React.Dispatch<EditorAction>;
  getActiveLayer: () => Layer | undefined;
  saveHistory: () => void;
  undo: () => void;
  redo: () => void;
  openImage: (file: File) => void;
  exportImage: (format: string) => void;
}

const EditorContext = createContext<EditorContextType | null>(null);

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(editorReducer, null, createInitialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  const getActiveLayer = useCallback(() => {
    return state.layers.find((l) => l.id === state.activeLayerId);
  }, [state.layers, state.activeLayerId]);

  const saveHistory = useCallback(() => {
    const layerSnapshots: LayerSnapshot[] = state.layers.map((layer) => {
      const ctx = layer.canvas.getContext('2d')!;
      const imageData = ctx.getImageData(0, 0, layer.canvas.width, layer.canvas.height);
      return {
        id: layer.id,
        name: layer.name,
        visible: layer.visible,
        opacity: layer.opacity,
        blendMode: layer.blendMode,
        imageData,
        x: layer.x,
        y: layer.y,
      };
    });
    dispatch({
      type: 'PUSH_HISTORY',
      state: {
        id: Date.now(),
        name: 'Edit',
        layers: layerSnapshots,
        activeLayerId: state.activeLayerId,
      },
    });
  }, [state.layers, state.activeLayerId]);

  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' });
  }, []);

  const redo = useCallback(() => {
    dispatch({ type: 'REDO' });
  }, []);

  const openImage = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const newWidth = Math.max(stateRef.current.canvasWidth, img.width);
        const newHeight = Math.max(stateRef.current.canvasHeight, img.height);
        const newCanvas = document.createElement('canvas');
        newCanvas.width = newWidth;
        newCanvas.height = newHeight;
        const ctx = newCanvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        const newLayer: Layer = {
          id: generateId(),
          name: file.name,
          visible: true,
          opacity: 100,
          blendMode: 'normal',
          locked: false,
          canvas: newCanvas,
          thumbnail: canvasToThumbnail(newCanvas),
          x: 0,
          y: 0,
          width: newWidth,
          height: newHeight,
        };
        dispatch({ type: 'SET_CANVAS_SIZE', width: newWidth, height: newHeight });
        dispatch({ type: 'ADD_LAYER', layer: newLayer });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, []);

  const exportImage = useCallback((format: string) => {
    const flatCanvas = document.createElement('canvas');
    flatCanvas.width = state.canvasWidth;
    flatCanvas.height = state.canvasHeight;
    const ctx = flatCanvas.getContext('2d')!;
    const reversedLayers = [...state.layers].reverse();
    for (const layer of reversedLayers) {
      if (!layer.visible) continue;
      ctx.globalAlpha = layer.opacity / 100;
      ctx.drawImage(layer.canvas, layer.x, layer.y);
    }
    const mimeType = format === 'png' ? 'image/png' : format === 'webp' ? 'image/webp' : 'image/jpeg';
    const dataUrl = flatCanvas.toDataURL(mimeType, 0.92);
    const link = document.createElement('a');
    link.download = `meteroid-export.${format}`;
    link.href = dataUrl;
    link.click();
  }, [state.layers, state.canvasWidth, state.canvasHeight]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          undo();
        } else if ((e.key === 'y') || (e.key === 'z' && e.shiftKey)) {
          e.preventDefault();
          redo();
        } else if (e.key === 's') {
          e.preventDefault();
          exportImage('png');
        } else if (e.key === 'o') {
          e.preventDefault();
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.onchange = () => {
            if (input.files?.[0]) {
              openImage(input.files[0]);
            }
          };
          input.click();
        } else if (e.key === 'a') {
          e.preventDefault();
          dispatch({ type: 'SELECT_ALL' });
        } else if (e.key === 'd') {
          e.preventDefault();
          dispatch({ type: 'DESELECT_ALL' });
        }
      }
      switch (e.key.toLowerCase()) {
        case 'v': dispatch({ type: 'SET_TOOL', tool: 'move' }); break;
        case 'm': dispatch({ type: 'SET_TOOL', tool: e.shiftKey ? 'marqueeEllipse' : 'marqueeRect' }); break;
        case 'l': dispatch({ type: 'SET_TOOL', tool: e.shiftKey ? 'magicWand' : 'lasso' }); break;
        case 'c': dispatch({ type: 'SET_TOOL', tool: e.shiftKey ? 'crop' : 'eyedropper' }); break;
        case 'b': dispatch({ type: 'SET_TOOL', tool: 'brush' }); break;
        case 's': if (!e.ctrlKey && !e.metaKey) dispatch({ type: 'SET_TOOL', tool: 'cloneStamp' }); break;
        case 'e': dispatch({ type: 'SET_TOOL', tool: 'eraser' }); break;
        case 'g': dispatch({ type: 'SET_TOOL', tool: e.shiftKey ? 'gradient' : 'bucket' as any }); break;
        case 't': dispatch({ type: 'SET_TOOL', tool: 'text' }); break;
        case 'u': dispatch({ type: 'SET_TOOL', tool: 'shapeRect' }); break;
        case 'h': dispatch({ type: 'SET_TOOL', tool: 'hand' }); break;
        case 'z': if (!e.ctrlKey && !e.metaKey) dispatch({ type: 'SET_TOOL', tool: 'zoom' }); break;
        case 'x': {
          const temp = stateRef.current.foregroundColor;
          dispatch({ type: 'SET_FOREGROUND_COLOR', color: stateRef.current.backgroundColor });
          dispatch({ type: 'SET_BACKGROUND_COLOR', color: temp });
          break;
        }
        case 'd': if (!e.ctrlKey && !e.metaKey) {
          dispatch({ type: 'SET_FOREGROUND_COLOR', color: '#000000' });
          dispatch({ type: 'SET_BACKGROUND_COLOR', color: '#ffffff' });
        } break;
        case '[': dispatch({ type: 'SET_BRUSH_SIZE', size: Math.max(1, stateRef.current.brushSize - 5) }); break;
        case ']': dispatch({ type: 'SET_BRUSH_SIZE', size: Math.min(500, stateRef.current.brushSize + 5) }); break;
        case ' ':
          if (!e.repeat) {
            e.preventDefault();
            dispatch({ type: 'SET_TOOL', tool: 'hand' });
          }
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        dispatch({ type: 'SET_TOOL', tool: stateRef.current.activeTool === 'hand' ? 'move' : stateRef.current.activeTool });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [undo, redo, exportImage, openImage]);

  return (
    <EditorContext.Provider value={{ state, dispatch, getActiveLayer, saveHistory, undo, redo, openImage, exportImage }}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
}
