export type ToolType =
  | 'move'
  | 'marqueeRect'
  | 'marqueeEllipse'
  | 'lasso'
  | 'magicWand'
  | 'crop'
  | 'eyedropper'
  | 'spotHealing'
  | 'brush'
  | 'cloneStamp'
  | 'historyBrush'
  | 'eraser'
  | 'gradient'
  | 'blur'
  | 'dodge'
  | 'pen'
  | 'text'
  | 'shapeRect'
  | 'shapeEllipse'
  | 'shapeLine'
  | 'hand'
  | 'zoom';

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  blendMode: BlendMode;
  locked: boolean;
  canvas: HTMLCanvasElement;
  thumbnail: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export type BlendMode =
  | 'normal'
  | 'dissolve'
  | 'darken'
  | 'multiply'
  | 'colorBurn'
  | 'linearBurn'
  | 'lighten'
  | 'screen'
  | 'colorDodge'
  | 'linearDodge'
  | 'overlay'
  | 'softLight'
  | 'hardLight'
  | 'vividLight'
  | 'linearLight'
  | 'pinLight'
  | 'difference'
  | 'exclusion'
  | 'hue'
  | 'saturation'
  | 'color'
  | 'luminosity';

export interface HistoryState {
  id: number;
  name: string;
  layers: LayerSnapshot[];
  activeLayerId: string | null;
}

export interface LayerSnapshot {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  blendMode: BlendMode;
  imageData: ImageData;
  x: number;
  y: number;
}

export interface EditorState {
  layers: Layer[];
  activeLayerId: string | null;
  activeTool: ToolType;
  brushSize: number;
  brushOpacity: number;
  brushHardness: number;
  foregroundColor: string;
  backgroundColor: string;
  zoom: number;
  panX: number;
  panY: number;
  canvasWidth: number;
  canvasHeight: number;
  selection: Selection | null;
  history: HistoryState[];
  historyIndex: number;
  showGrid: boolean;
  showRulers: boolean;
  showGuides: boolean[];
  snapping: boolean;
}

export interface Selection {
  type: 'rect' | 'ellipse' | 'lasso' | 'magicWand';
  x: number;
  y: number;
  width: number;
  height: number;
  points?: { x: number; y: number }[];
}

export interface MenuAction {
  label: string;
  shortcut?: string;
  action: () => void;
  disabled?: boolean;
  separator?: boolean;
}

export interface MenuItem {
  label: string;
  items: MenuAction[];
}

export type FilterType =
  | 'blur'
  | 'gaussianBlur'
  | 'motionBlur'
  | 'sharpen'
  | 'unsharpMask'
  | 'brightnessContrast'
  | 'levels'
  | 'curves'
  | 'hueSaturation'
  | 'colorBalance'
  | 'invert'
  | 'posterize'
  | 'threshold'
  | 'desaturate'
  | 'noise'
  | 'pixelate'
  | 'distort'
  | 'liquify';

export interface FilterParams {
  type: FilterType;
  [key: string]: number | string | boolean;
}
