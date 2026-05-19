var App = {};

App.state = {
  layers: [],
  activeLayerId: null,
  activeTool: 'brush',
  brushSize: 10,
  brushOpacity: 100,
  brushHardness: 100,
  fgColor: '#000000',
  bgColor: '#ffffff',
  zoom: 1,
  panX: 0,
  panY: 0,
  canvasWidth: 800,
  canvasHeight: 600,
  selection: null,
  history: [],
  historyIndex: -1,
  showRulers: true,
  showGrid: false,
  isDrawing: false,
  lastX: 0,
  lastY: 0,
  isPanning: false,
  panStartX: 0,
  panStartY: 0,
  cloneSource: null,
  textContent: '',
  fontSize: 24,
  fontFamily: 'Arial',
  shapeType: 'rect',
  gradientType: 'linear',
  marqueeType: 'rect',
  lassoPoints: [],
  magicWandTolerance: 32,
};

App.init = function() {
  Canvas.init();
  Layers.init();
  Tools.init();
  Menus.init();
  FileOps.init();
  Filters.init();
  App.setupEvents();
  App.createDefaultLayer();
  Canvas.render();
  Layers.renderList();
  App.updateStatus();
};

App.createDefaultLayer = function() {
  var canvas = document.createElement('canvas');
  canvas.width = App.state.canvasWidth;
  canvas.height = App.state.canvasHeight;
  var ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  Layers.addLayer('Background', canvas, true);
};

App.setupEvents = function() {
  document.addEventListener('keydown', App.handleKey);
  document.addEventListener('click', function(e) {
    var ctxMenu = document.getElementById('context-menu');
    if (!ctxMenu.classList.contains('hidden') && !ctxMenu.contains(e.target)) {
      ctxMenu.classList.add('hidden');
    }
  });

  var workspace = document.getElementById('workspace');
  workspace.addEventListener('dragover', function(e) { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; });
  workspace.addEventListener('drop', function(e) {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      FileOps.loadFile(e.dataTransfer.files[0]);
    }
  });

  document.getElementById('zoom-slider').addEventListener('input', function() {
    App.state.zoom = parseInt(this.value) / 100;
    document.getElementById('zoom-value').textContent = this.value + '%';
    Canvas.render();
    App.updateStatus();
  });

  document.getElementById('layer-opacity').addEventListener('input', function() {
    var layer = Layers.getActive();
    if (layer) {
      layer.opacity = parseInt(this.value);
      document.getElementById('opacity-value').textContent = this.value + '%';
      Canvas.render();
    }
  });

  document.getElementById('blend-mode').addEventListener('change', function() {
    var layer = Layers.getActive();
    if (layer) {
      layer.blendMode = this.value;
      Canvas.render();
    }
  });

  document.querySelectorAll('.panel-tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
      document.querySelectorAll('.panel-tab').forEach(function(t) { t.classList.remove('active'); });
      document.querySelectorAll('.panel-content').forEach(function(p) { p.style.display = 'none'; });
      this.classList.add('active');
      var panelId = 'panel-' + this.dataset.panel;
      document.getElementById(panelId).style.display = 'flex';
      if (this.dataset.panel === 'layers') Layers.renderList();
    });
  });

  document.querySelector('[data-panel="layers"]').classList.add('active');
  document.querySelectorAll('.panel-content').forEach(function(p) { p.style.display = 'none'; });
  document.getElementById('panel-layers').style.display = 'flex';

  document.getElementById('btn-new-layer').addEventListener('click', Layers.addNewLayer);
  document.getElementById('btn-duplicate-layer').addEventListener('click', Layers.duplicateActive);
  document.getElementById('btn-delete-layer').addEventListener('click', Layers.deleteActive);
  document.getElementById('btn-merge-down').addEventListener('click', Layers.mergeDown);
  document.getElementById('btn-flatten').addEventListener('click', Layers.flatten);

  document.querySelectorAll('.adj-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      Filters.applyAdjustment(this.dataset.adj);
    });
  });
};

App.handleKey = function(e) {
  var ctrl = e.ctrlKey || e.metaKey;
  if (ctrl) {
    switch(e.key.toLowerCase()) {
      case 'z': e.preventDefault(); App.undo(); return;
      case 'y': e.preventDefault(); App.redo(); return;
      case 's': e.preventDefault(); FileOps.exportPNG(); return;
      case 'o': e.preventDefault(); FileOps.openFile(); return;
      case 'a': e.preventDefault(); App.selectAll(); return;
      case 'd': e.preventDefault(); App.deselect(); return;
      case 'j': e.preventDefault(); Layers.duplicateActive(); return;
      case 'e': e.preventDefault(); Layers.mergeDown(); return;
      case 'n': if (e.shiftKey) { e.preventDefault(); Layers.addNewLayer(); } return;
    }
  }
  switch(e.key.toLowerCase()) {
    case 'v': App.setTool('move'); break;
    case 'm': App.setTool(e.shiftKey ? 'marquee-ellipse' : 'marquee-rect'); break;
    case 'l': App.setTool(e.shiftKey ? 'magic-wand' : 'lasso'); break;
    case 'w': App.setTool('magic-wand'); break;
    case 'c': App.setTool(e.shiftKey ? 'crop' : 'eyedropper'); break;
    case 'i': App.setTool('eyedropper'); break;
    case 'j': App.setTool('spot-healing'); break;
    case 'b': App.setTool('brush'); break;
    case 's': if (!ctrl) App.setTool('clone-stamp'); break;
    case 'y': App.setTool('history-brush'); break;
    case 'e': App.setTool('eraser'); break;
    case 'g': App.setTool('gradient'); break;
    case 'r': App.setTool('blur'); break;
    case 'o': if (!ctrl) App.setTool('dodge'); break;
    case 'p': App.setTool('pen'); break;
    case 't': App.setTool('text'); break;
    case 'u': App.setTool('shape'); break;
    case 'h': App.setTool('hand'); break;
    case 'z': if (!ctrl) App.setTool('zoom'); break;
    case 'x': App.swapColors(); break;
    case 'd': if (!ctrl) { App.state.fgColor = '#000000'; App.state.bgColor = '#ffffff'; } break;
    case '[': App.state.brushSize = Math.max(1, App.state.brushSize - 5); break;
    case ']': App.state.brushSize = Math.min(500, App.state.brushSize + 5); break;
    case ' ':
      if (!e.repeat) { e.preventDefault(); App.setTool('hand'); }
      break;
    case 'delete':
    case 'backspace':
      App.clearSelection();
      break;
  }
};

App.setTool = function(tool) {
  App.state.activeTool = tool;
  document.querySelectorAll('.tool-btn').forEach(function(btn) {
    btn.classList.toggle('active', btn.dataset.tool === tool);
  });
  Tools.updateOptions();
  App.updateStatus();
  Canvas.updateCursor();
};

App.swapColors = function() {
  var temp = App.state.fgColor;
  App.state.fgColor = App.state.bgColor;
  App.state.bgColor = temp;
};

App.undo = function() {
  if (App.state.historyIndex >= 0) {
    var snap = App.state.history[App.state.historyIndex];
    Layers.restoreSnapshot(snap);
    App.state.historyIndex--;
    Canvas.render();
    Layers.renderList();
  }
};

App.redo = function() {
  if (App.state.historyIndex < App.state.history.length - 1) {
    App.state.historyIndex++;
    var snap = App.state.history[App.state.historyIndex];
    Layers.restoreSnapshot(snap);
    Canvas.render();
    Layers.renderList();
  }
};

App.saveHistory = function() {
  var snap = Layers.createSnapshot();
  App.state.history = App.state.history.slice(0, App.state.historyIndex + 1);
  App.state.history.push(snap);
  App.state.historyIndex = App.state.history.length - 1;
  if (App.state.history.length > 50) {
    App.state.history.shift();
    App.state.historyIndex--;
  }
};

App.selectAll = function() {
  App.state.selection = { x: 0, y: 0, w: App.state.canvasWidth, h: App.state.canvasHeight };
  Canvas.render();
  App.updateStatus();
};

App.deselect = function() {
  App.state.selection = null;
  Canvas.render();
  App.updateStatus();
};

App.clearSelection = function() {
  var layer = Layers.getActive();
  if (!layer) return;
  App.saveHistory();
  var ctx = layer.canvas.getContext('2d');
  if (App.state.selection) {
    ctx.clearRect(App.state.selection.x, App.state.selection.y, App.state.selection.w, App.state.selection.h);
  } else {
    ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
  }
  Canvas.render();
  Layers.updateThumb(layer);
};

App.updateStatus = function() {
  var toolNames = {
    'move': 'Move', 'marquee-rect': 'Rectangular Marquee', 'marquee-ellipse': 'Elliptical Marquee',
    'lasso': 'Lasso', 'magic-wand': 'Magic Wand', 'crop': 'Crop', 'eyedropper': 'Eyedropper',
    'spot-healing': 'Spot Healing', 'brush': 'Brush', 'clone-stamp': 'Clone Stamp',
    'history-brush': 'History Brush', 'eraser': 'Eraser', 'gradient': 'Gradient',
    'blur': 'Blur/Sharpen', 'dodge': 'Dodge/Burn', 'pen': 'Pen', 'text': 'Type',
    'shape': 'Shape', 'hand': 'Hand', 'zoom': 'Zoom'
  };
  document.getElementById('status-tool').textContent = toolNames[App.state.activeTool] || App.state.activeTool;
  document.getElementById('status-zoom').textContent = Math.round(App.state.zoom * 100) + '%';
  document.getElementById('status-size').textContent = App.state.canvasWidth + ' × ' + App.state.canvasHeight;
  var sel = document.getElementById('status-selection');
  if (App.state.selection) {
    sel.textContent = 'Sel: ' + Math.round(App.state.selection.w) + ' × ' + Math.round(App.state.selection.h);
  } else {
    sel.textContent = '';
  }
};

App.updatePos = function(x, y) {
  document.getElementById('status-pos').textContent = Math.round(x) + ', ' + Math.round(y);
  document.getElementById('info-x').textContent = Math.round(x);
  document.getElementById('info-y').textContent = Math.round(y);
};

App.showModal = function(html) {
  document.getElementById('modal').innerHTML = html;
  document.getElementById('modal-overlay').classList.remove('hidden');
};

App.hideModal = function() {
  document.getElementById('modal-overlay').classList.add('hidden');
};

App.screenToCanvas = function(sx, sy) {
  var container = document.getElementById('canvas-container');
  var rect = container.getBoundingClientRect();
  return {
    x: (sx - rect.left - App.state.panX) / App.state.zoom,
    y: (sy - rect.top - App.state.panY) / App.state.zoom
  };
};

window.App = App;
