var Menus = {};

Menus.items = {
  file: [
    { label: 'New...', shortcut: 'Ctrl+N', action: 'new' },
    { label: 'Open...', shortcut: 'Ctrl+O', action: 'open' },
    { sep: true },
    { label: 'Save as PSD', action: 'save-psd' },
    { label: 'Export as PNG', shortcut: 'Ctrl+S', action: 'export-png' },
    { label: 'Export as JPG', action: 'export-jpg' },
    { label: 'Export as WebP', action: 'export-webp' },
  ],
  edit: [
    { label: 'Undo', shortcut: 'Ctrl+Z', action: 'undo' },
    { label: 'Redo', shortcut: 'Ctrl+Y', action: 'redo' },
    { sep: true },
    { label: 'Cut', shortcut: 'Ctrl+X', action: 'cut' },
    { label: 'Copy', shortcut: 'Ctrl+C', action: 'copy' },
    { label: 'Paste', shortcut: 'Ctrl+V', action: 'paste' },
    { sep: true },
    { label: 'Clear', shortcut: 'Del', action: 'clear' },
    { label: 'Fill with FG Color', shortcut: 'Alt+Backspace', action: 'fill-fg' },
    { label: 'Fill with BG Color', shortcut: 'Ctrl+Backspace', action: 'fill-bg' },
  ],
  image: [
    { label: 'Canvas Size...', shortcut: 'Ctrl+Alt+C', action: 'canvas-size' },
    { label: 'Image Size...', shortcut: 'Ctrl+Alt+I', action: 'image-size' },
    { sep: true },
    { label: 'Rotate 90° CW', action: 'rotate-cw' },
    { label: 'Rotate 90° CCW', action: 'rotate-ccw' },
    { label: 'Rotate 180°', action: 'rotate-180' },
    { label: 'Flip Horizontal', action: 'flip-h' },
    { label: 'Flip Vertical', action: 'flip-v' },
  ],
  layer: [
    { label: 'New Layer...', shortcut: 'Ctrl+Shift+N', action: 'new-layer' },
    { label: 'Duplicate Layer', shortcut: 'Ctrl+J', action: 'dup-layer' },
    { label: 'Delete Layer', shortcut: 'Del', action: 'del-layer' },
    { sep: true },
    { label: 'Merge Down', shortcut: 'Ctrl+E', action: 'merge-down' },
    { label: 'Flatten Image', action: 'flatten' },
  ],
  select: [
    { label: 'All', shortcut: 'Ctrl+A', action: 'select-all' },
    { label: 'Deselect', shortcut: 'Ctrl+D', action: 'deselect' },
    { label: 'Invert Selection', shortcut: 'Ctrl+Shift+I', action: 'invert-sel' },
  ],
  filter: [
    { label: 'Blur...', action: 'blur' },
    { label: 'Sharpen', action: 'sharpen' },
    { sep: true },
    { label: 'Brightness/Contrast...', action: 'brightness' },
    { label: 'Hue/Saturation...', action: 'hue-sat' },
    { label: 'Levels...', action: 'levels' },
    { label: 'Curves...', action: 'curves' },
    { sep: true },
    { label: 'Invert', shortcut: 'Ctrl+I', action: 'invert' },
    { label: 'Desaturate', shortcut: 'Ctrl+Shift+U', action: 'desaturate' },
    { label: 'Posterize...', action: 'posterize' },
    { label: 'Threshold...', action: 'threshold' },
    { label: 'Noise...', action: 'noise' },
    { label: 'Pixelate...', action: 'pixelate' },
    { label: 'Color Balance...', action: 'color-balance' },
  ],
  view: [
    { label: 'Zoom In', shortcut: 'Ctrl++', action: 'zoom-in' },
    { label: 'Zoom Out', shortcut: 'Ctrl+-', action: 'zoom-out' },
    { label: 'Fit on Screen', shortcut: 'Ctrl+0', action: 'fit-screen' },
    { label: 'Actual Pixels', shortcut: 'Ctrl+1', action: 'actual-pixels' },
    { sep: true },
    { label: 'Grid', shortcut: "Ctrl+'", action: 'grid' },
    { label: 'Rulers', shortcut: 'Ctrl+R', action: 'rulers' },
  ],
  window: [
    { label: 'Navigator', action: 'win-navigator' },
    { label: 'Info', action: 'win-info' },
    { label: 'Histogram', action: 'win-histogram' },
    { label: 'Adjustments', action: 'win-adjustments' },
    { label: 'Layers', action: 'win-layers' },
    { label: 'Channels', action: 'win-channels' },
    { label: 'Paths', action: 'win-paths' },
  ],
  help: [
    { label: 'Keyboard Shortcuts', action: 'shortcuts' },
    { label: 'About Meteroid', action: 'about' },
  ],
};

Menus.init = function() {
  document.querySelectorAll('.menu-item').forEach(function(item) {
    item.addEventListener('click', function(e) {
      e.stopPropagation();
      var menuName = this.dataset.menu;
      var existing = document.getElementById('context-menu');
      if (!existing.classList.contains('hidden') && existing.dataset.menu === menuName) {
        existing.classList.add('hidden');
        return;
      }
      Menus.showMenu(menuName, this);
    });
    item.addEventListener('mouseenter', function() {
      var existing = document.getElementById('context-menu');
      if (!existing.classList.contains('hidden')) {
        var menuName = this.dataset.menu;
        Menus.showMenu(menuName, this);
      }
    });
  });
};

Menus.showMenu = function(menuName, triggerEl) {
  var menu = document.getElementById('context-menu');
  menu.dataset.menu = menuName;
  menu.classList.remove('hidden');

  var items = Menus.items[menuName];
  if (!items) { menu.classList.add('hidden'); return; }

  var html = '';
  items.forEach(function(item) {
    if (item.sep) {
      html += '<div class="ctx-sep"></div>';
    } else {
      html += '<div class="ctx-item" data-action="' + item.action + '">' +
        '<span>' + item.label + '</span>' +
        (item.shortcut ? '<span class="ctx-shortcut">' + item.shortcut + '</span>' : '') +
        '</div>';
    }
  });
  menu.innerHTML = html;

  var rect = triggerEl.getBoundingClientRect();
  menu.style.top = rect.bottom + 'px';
  menu.style.left = rect.left + 'px';

  menu.querySelectorAll('.ctx-item').forEach(function(el) {
    el.addEventListener('click', function() {
      Menus.execute(menuName, this.dataset.action);
      menu.classList.add('hidden');
    });
  });

  document.querySelectorAll('.menu-item').forEach(function(mi) {
    mi.classList.toggle('active', mi.dataset.menu === menuName);
  });
};

Menus.execute = function(menuName, action) {
  switch(action) {
    case 'new': FileOps.newFile(); break;
    case 'open': FileOps.openFile(); break;
    case 'save-psd': alert('PSD export coming soon. Use PNG/JPG instead.'); break;
    case 'export-png': FileOps.exportPNG(); break;
    case 'export-jpg': FileOps.exportJPG(); break;
    case 'export-webp': FileOps.exportWebP(); break;
    case 'undo': App.undo(); break;
    case 'redo': App.redo(); break;
    case 'cut': case 'copy': case 'paste': alert('Clipboard operations via Ctrl+C/V'); break;
    case 'clear': App.clearSelection(); break;
    case 'fill-fg': Menus.fillColor(App.state.fgColor); break;
    case 'fill-bg': Menus.fillColor(App.state.bgColor); break;
    case 'canvas-size': Menus.canvasSizeDialog(); break;
    case 'image-size': Menus.imageSizeDialog(); break;
    case 'rotate-cw': Menus.rotateCanvas(90); break;
    case 'rotate-ccw': Menus.rotateCanvas(-90); break;
    case 'rotate-180': Menus.rotateCanvas(180); break;
    case 'flip-h': Menus.flipCanvas(true); break;
    case 'flip-v': Menus.flipCanvas(false); break;
    case 'new-layer': Layers.addNewLayer(); break;
    case 'dup-layer': Layers.duplicateActive(); break;
    case 'del-layer': Layers.deleteActive(); break;
    case 'merge-down': Layers.mergeDown(); break;
    case 'flatten': Layers.flatten(); break;
    case 'select-all': App.selectAll(); break;
    case 'deselect': App.deselect(); break;
    case 'invert-sel': alert('Invert selection'); break;
    case 'blur': Filters.applyDialog('blur'); break;
    case 'sharpen': Filters.applyDialog('sharpen'); break;
    case 'brightness': Filters.applyDialog('brightness'); break;
    case 'hue-sat': Filters.applyDialog('hue-sat'); break;
    case 'levels': Filters.applyDialog('levels'); break;
    case 'curves': Filters.applyDialog('curves'); break;
    case 'invert': Filters.applyQuick('invert'); break;
    case 'desaturate': Filters.applyQuick('desaturate'); break;
    case 'posterize': Filters.applyDialog('posterize'); break;
    case 'threshold': Filters.applyDialog('threshold'); break;
    case 'noise': Filters.applyDialog('noise'); break;
    case 'pixelate': Filters.applyDialog('pixelate'); break;
    case 'color-balance': Filters.applyDialog('color-balance'); break;
    case 'zoom-in': App.state.zoom *= 1.25; Menus.updateZoom(); break;
    case 'zoom-out': App.state.zoom /= 1.25; Menus.updateZoom(); break;
    case 'fit-screen': App.state.zoom = 1; App.state.panX = 0; App.state.panY = 0; Menus.updateZoom(); break;
    case 'actual-pixels': App.state.zoom = 1; App.state.panX = 0; App.state.panY = 0; Menus.updateZoom(); break;
    case 'grid': App.state.showGrid = !App.state.showGrid; Canvas.render(); break;
    case 'rulers': App.state.showRulers = !App.state.showRulers; document.getElementById('rulers').style.display = App.state.showRulers ? '' : 'none'; break;
    case 'about': App.showModal('<div class="modal-header"><span>About Meteroid</span><span class="modal-close" onclick="App.hideModal()">✕</span></div><div class="modal-body"><h2>Meteroid</h2><p>Free Online Photo Editor</p><p>Version 1.0.0</p><p>Built with vanilla HTML, CSS & JavaScript</p></div><div class="modal-footer"><button class="btn btn-primary" onclick="App.hideModal()">OK</button></div>'); break;
  }
  Canvas.render();
  App.updateStatus();
};

Menus.fillColor = function(color) {
  var layer = Layers.getActive();
  if (!layer || layer.locked) return;
  App.saveHistory();
  var ctx = layer.canvas.getContext('2d');
  ctx.fillStyle = color;
  if (App.state.selection) {
    ctx.fillRect(App.state.selection.x, App.state.selection.y, App.state.selection.w, App.state.selection.h);
  } else {
    ctx.fillRect(0, 0, layer.canvas.width, layer.canvas.height);
  }
  Canvas.render();
  Layers.updateThumb(layer);
};

Menus.canvasSizeDialog = function() {
  var w = App.state.canvasWidth;
  var h = App.state.canvasHeight;
  App.showModal(
    '<div class="modal-header"><span>Canvas Size</span><span class="modal-close" onclick="App.hideModal()">✕</span></div>' +
    '<div class="modal-body">' +
    '<div class="form-row"><label>Width:</label><input type="number" id="dlg-cw" value="' + w + '"></div>' +
    '<div class="form-row"><label>Height:</label><input type="number" id="dlg-ch" value="' + h + '"></div>' +
    '</div>' +
    '<div class="modal-footer">' +
    '<button class="btn btn-secondary" onclick="App.hideModal()">Cancel</button>' +
    '<button class="btn btn-primary" onclick="Menus.setCanvasSize()">OK</button>' +
    '</div>'
  );
};

Menus.setCanvasSize = function() {
  var w = parseInt(document.getElementById('dlg-cw').value) || 800;
  var h = parseInt(document.getElementById('dlg-ch').value) || 600;
  App.saveHistory();
  App.state.layers.forEach(function(layer) {
    var temp = document.createElement('canvas');
    temp.width = w;
    temp.height = h;
    temp.getContext('2d').drawImage(layer.canvas, 0, 0);
    layer.canvas = temp;
  });
  App.state.canvasWidth = w;
  App.state.canvasHeight = h;
  App.hideModal();
  Canvas.resize();
  Canvas.render();
  Layers.renderList();
  App.updateStatus();
};

Menus.imageSizeDialog = function() {
  var w = App.state.canvasWidth;
  var h = App.state.canvasHeight;
  App.showModal(
    '<div class="modal-header"><span>Image Size</span><span class="modal-close" onclick="App.hideModal()">✕</span></div>' +
    '<div class="modal-body">' +
    '<div class="form-row"><label>Width:</label><input type="number" id="dlg-iw" value="' + w + '"></div>' +
    '<div class="form-row"><label>Height:</label><input type="number" id="dlg-ih" value="' + h + '"></div>' +
    '</div>' +
    '<div class="modal-footer">' +
    '<button class="btn btn-secondary" onclick="App.hideModal()">Cancel</button>' +
    '<button class="btn btn-primary" onclick="Menus.setImageSize()">OK</button>' +
    '</div>'
  );
};

Menus.setImageSize = function() {
  var w = parseInt(document.getElementById('dlg-iw').value) || 800;
  var h = parseInt(document.getElementById('dlg-ih').value) || 600;
  App.saveHistory();
  App.state.layers.forEach(function(layer) {
    var temp = document.createElement('canvas');
    temp.width = w;
    temp.height = h;
    temp.getContext('2d').drawImage(layer.canvas, 0, 0, w, h);
    layer.canvas = temp;
  });
  App.state.canvasWidth = w;
  App.state.canvasHeight = h;
  App.hideModal();
  Canvas.resize();
  Canvas.render();
  Layers.renderList();
  App.updateStatus();
};

Menus.rotateCanvas = function(degrees) {
  var layer = Layers.getActive();
  if (!layer) return;
  App.saveHistory();
  var temp = document.createElement('canvas');
  var ctx = temp.getContext('2d');
  if (Math.abs(degrees) === 90) {
    temp.width = layer.canvas.height;
    temp.height = layer.canvas.width;
  } else {
    temp.width = layer.canvas.width;
    temp.height = layer.canvas.height;
  }
  ctx.translate(temp.width / 2, temp.height / 2);
  ctx.rotate(degrees * Math.PI / 180);
  ctx.drawImage(layer.canvas, -layer.canvas.width / 2, -layer.canvas.height / 2);
  layer.canvas = temp;
  if (Math.abs(degrees) === 90) {
    var tw = App.state.canvasWidth;
    App.state.canvasWidth = App.state.canvasHeight;
    App.state.canvasHeight = tw;
  }
  Canvas.resize();
  Canvas.render();
  Layers.updateThumb(layer);
  App.updateStatus();
};

Menus.flipCanvas = function(horizontal) {
  var layer = Layers.getActive();
  if (!layer) return;
  App.saveHistory();
  var temp = document.createElement('canvas');
  temp.width = layer.canvas.width;
  temp.height = layer.canvas.height;
  var ctx = temp.getContext('2d');
  if (horizontal) {
    ctx.translate(temp.width, 0);
    ctx.scale(-1, 1);
  } else {
    ctx.translate(0, temp.height);
    ctx.scale(1, -1);
  }
  ctx.drawImage(layer.canvas, 0, 0);
  layer.canvas = temp;
  Canvas.render();
  Layers.updateThumb(layer);
};

Menus.updateZoom = function() {
  App.state.zoom = Math.max(0.01, Math.min(32, App.state.zoom));
  document.getElementById('zoom-slider').value = Math.round(App.state.zoom * 100);
  document.getElementById('zoom-value').textContent = Math.round(App.state.zoom * 100) + '%';
  Canvas.render();
  App.updateStatus();
};

window.Menus = Menus;
