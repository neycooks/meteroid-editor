var Canvas = {};

Canvas.init = function() {
  Canvas.canvas = document.getElementById('canvas');
  Canvas.ctx = Canvas.canvas.getContext('2d');
  Canvas.overlay = document.getElementById('overlay');
  Canvas.octx = Canvas.overlay.getContext('2d');
  Canvas.container = document.getElementById('canvas-container');

  Canvas.canvas.addEventListener('mousedown', Canvas.onMouseDown);
  Canvas.canvas.addEventListener('mousemove', Canvas.onMouseMove);
  Canvas.canvas.addEventListener('mouseup', Canvas.onMouseUp);
  Canvas.canvas.addEventListener('mouseleave', Canvas.onMouseUp);
  Canvas.canvas.addEventListener('wheel', Canvas.onWheel, { passive: false });
  Canvas.canvas.addEventListener('contextmenu', function(e) { e.preventDefault(); });

  Canvas.resize();
  window.addEventListener('resize', Canvas.resize);
};

Canvas.resize = function() {
  var container = Canvas.container;
  Canvas.canvas.width = container.clientWidth;
  Canvas.canvas.height = container.clientHeight;
  Canvas.overlay.width = container.clientWidth;
  Canvas.overlay.height = container.clientHeight;
  Canvas.render();
};

Canvas.render = function() {
  var ctx = Canvas.ctx;
  var w = Canvas.canvas.width;
  var h = Canvas.canvas.height;
  ctx.clearRect(0, 0, w, h);

  ctx.save();
  ctx.translate(App.state.panX, App.state.panY);
  ctx.scale(App.state.zoom, App.state.zoom);

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, App.state.canvasWidth, App.state.canvasHeight);

  var cs = 8;
  for (var y = 0; y < App.state.canvasHeight; y += cs) {
    for (var x = 0; x < App.state.canvasWidth; x += cs) {
      ctx.fillStyle = ((Math.floor(x / cs) + Math.floor(y / cs)) % 2 === 0) ? '#ccc' : '#999';
      ctx.fillRect(x, y, cs, cs);
    }
  }

  for (var i = App.state.layers.length - 1; i >= 0; i--) {
    var layer = App.state.layers[i];
    if (!layer.visible) continue;
    ctx.globalAlpha = layer.opacity / 100;
    ctx.globalCompositeOperation = layer.blendMode === 'normal' ? 'source-over' : layer.blendMode;
    ctx.drawImage(layer.canvas, layer.x, layer.y);
  }

  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;

  if (App.state.selection) {
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1 / App.state.zoom;
    ctx.setLineDash([4 / App.state.zoom, 4 / App.state.zoom]);
    ctx.strokeRect(App.state.selection.x, App.state.selection.y, App.state.selection.w, App.state.selection.h);
    ctx.setLineDash([]);
  }

  if (App.state.showGrid && App.state.zoom > 4) {
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 1 / App.state.zoom;
    for (var gx = 0; gx <= App.state.canvasWidth; gx++) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, App.state.canvasHeight); ctx.stroke();
    }
    for (var gy = 0; gy <= App.state.canvasHeight; gy++) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(App.state.canvasWidth, gy); ctx.stroke();
    }
  }

  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1 / App.state.zoom;
  ctx.strokeRect(0, 0, App.state.canvasWidth, App.state.canvasHeight);

  ctx.restore();

  Canvas.renderOverlay();
};

Canvas.renderOverlay = function() {
  var ctx = Canvas.octx;
  ctx.clearRect(0, 0, Canvas.overlay.width, Canvas.overlay.height);
  ctx.save();
  ctx.translate(App.state.panX, App.state.panY);
  ctx.scale(App.state.zoom, App.state.zoom);

  if (App.state.isDrawing) {
    var tool = App.state.activeTool;
    if (tool === 'marquee-rect' || tool === 'marquee-ellipse') {
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1 / App.state.zoom;
      ctx.setLineDash([4 / App.state.zoom, 4 / App.state.zoom]);
      var x = Math.min(App.state.lastX, App.state.startX);
      var y = Math.min(App.state.lastY, App.state.startY);
      var w = Math.abs(App.state.lastX - App.state.startX);
      var h = Math.abs(App.state.lastY - App.state.startY);
      if (tool === 'marquee-rect') {
        ctx.strokeRect(x, y, w, h);
      } else {
        ctx.beginPath();
        ctx.ellipse(x + w/2, y + h/2, w/2, h/2, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }
    if (tool === 'lasso' && App.state.lassoPoints.length > 1) {
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1 / App.state.zoom;
      ctx.setLineDash([4 / App.state.zoom, 4 / App.state.zoom]);
      ctx.beginPath();
      ctx.moveTo(App.state.lassoPoints[0].x, App.state.lassoPoints[0].y);
      for (var i = 1; i < App.state.lassoPoints.length; i++) {
        ctx.lineTo(App.state.lassoPoints[i].x, App.state.lassoPoints[i].y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }
    if (tool === 'crop') {
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1 / App.state.zoom;
      var x = Math.min(App.state.lastX, App.state.startX);
      var y = Math.min(App.state.lastY, App.state.startY);
      var w = Math.abs(App.state.lastX - App.state.startX);
      var h = Math.abs(App.state.lastY - App.state.startY);
      ctx.strokeRect(x, y, w, h);
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, 0, App.state.canvasWidth, y);
      ctx.fillRect(0, y + h, App.state.canvasWidth, App.state.canvasHeight - y - h);
      ctx.fillRect(0, y, x, h);
      ctx.fillRect(x + w, y, App.state.canvasWidth - x - w, h);
    }
  }

  if (App.state.cloneSource) {
    ctx.strokeStyle = '#0f0';
    ctx.lineWidth = 1 / App.state.zoom;
    ctx.beginPath();
    ctx.arc(App.state.cloneSource.x, App.state.cloneSource.y, 10 / App.state.zoom, 0, Math.PI * 2);
    ctx.moveTo(App.state.cloneSource.x - 15 / App.state.zoom, App.state.cloneSource.y);
    ctx.lineTo(App.state.cloneSource.x + 15 / App.state.zoom, App.state.cloneSource.y);
    ctx.moveTo(App.state.cloneSource.x, App.state.cloneSource.y - 15 / App.state.zoom);
    ctx.lineTo(App.state.cloneSource.x, App.state.cloneSource.y + 15 / App.state.zoom);
    ctx.stroke();
  }

  ctx.restore();
};

Canvas.onMouseDown = function(e) {
  var pos = App.screenToCanvas(e.clientX, e.clientY);

  if (e.button === 1 || App.state.activeTool === 'hand' || (App.state.activeTool === 'move' && e.altKey)) {
    App.state.isPanning = true;
    App.state.panStartX = e.clientX - App.state.panX;
    App.state.panStartY = e.clientY - App.state.panY;
    return;
  }

  App.state.isDrawing = true;
  App.state.startX = pos.x;
  App.state.startY = pos.y;
  App.state.lastX = pos.x;
  App.state.lastY = pos.y;

  if (App.state.activeTool === 'eyedropper') {
    var layer = Layers.getActive();
    if (layer) {
      var ctx = layer.canvas.getContext('2d');
      var pixel = ctx.getImageData(Math.floor(pos.x), Math.floor(pos.y), 1, 1).data;
      App.state.fgColor = Utils.rgbToHex(pixel[0], pixel[1], pixel[2]);
      document.getElementById('info-r').textContent = pixel[0];
      document.getElementById('info-g').textContent = pixel[1];
      document.getElementById('info-b').textContent = pixel[2];
    }
    App.state.isDrawing = false;
    return;
  }

  if (App.state.activeTool === 'clone-stamp' && e.altKey) {
    App.state.cloneSource = { x: pos.x, y: pos.y };
    Canvas.renderOverlay();
    App.state.isDrawing = false;
    return;
  }

  if (App.state.activeTool === 'zoom') {
    if (e.altKey) {
      App.state.zoom /= 1.5;
    } else {
      App.state.zoom *= 1.5;
    }
    App.state.zoom = Math.max(0.01, Math.min(32, App.state.zoom));
    document.getElementById('zoom-slider').value = Math.round(App.state.zoom * 100);
    document.getElementById('zoom-value').textContent = Math.round(App.state.zoom * 100) + '%';
    Canvas.render();
    App.updateStatus();
    App.state.isDrawing = false;
    return;
  }

  if (App.state.activeTool === 'brush' || App.state.activeTool === 'eraser' || App.state.activeTool === 'clone-stamp' || App.state.activeTool === 'blur' || App.state.activeTool === 'dodge' || App.state.activeTool === 'history-brush') {
    var layer = Layers.getActive();
    if (layer && !layer.locked) {
      var ctx = layer.canvas.getContext('2d');
      Canvas.drawBrushStroke(ctx, pos.x, pos.y, pos.x, pos.y);
      Canvas.render();
    }
  }

  if (App.state.activeTool === 'text') {
    var text = prompt('Enter text:', 'Text');
    if (text) {
      App.saveHistory();
      var layer = Layers.getActive();
      if (layer && !layer.locked) {
        var ctx = layer.canvas.getContext('2d');
        ctx.fillStyle = App.state.fgColor;
        ctx.font = App.state.fontSize + 'px ' + App.state.fontFamily;
        ctx.fillText(text, pos.x, pos.y + App.state.fontSize);
        Canvas.render();
        Layers.updateThumb(layer);
      }
    }
    App.state.isDrawing = false;
  }
};

Canvas.onMouseMove = function(e) {
  var pos = App.screenToCanvas(e.clientX, e.clientY);
  App.updatePos(pos.x, pos.y);

  if (App.state.isPanning) {
    App.state.panX = e.clientX - App.state.panStartX;
    App.state.panY = e.clientY - App.state.panStartY;
    Canvas.render();
    return;
  }

  if (!App.state.isDrawing) return;

  App.state.lastX = pos.x;
  App.state.lastY = pos.y;

  var tool = App.state.activeTool;
  if (tool === 'brush' || tool === 'eraser' || tool === 'clone-stamp' || tool === 'blur' || tool === 'dodge' || tool === 'history-brush') {
    var layer = Layers.getActive();
    if (layer && !layer.locked) {
      var ctx = layer.canvas.getContext('2d');
      Canvas.drawBrushStroke(ctx, pos.x, pos.y, App.state._prevX || pos.x, App.state._prevY || pos.y);
      Canvas.render();
    }
  }

  App.state._prevX = pos.x;
  App.state._prevY = pos.y;

  if (tool === 'marquee-rect' || tool === 'marquee-ellipse' || tool === 'crop' || tool === 'lasso') {
    if (tool === 'lasso') {
      if (!App.state.lassoPoints.length) App.state.lassoPoints = [{ x: App.state.startX, y: App.state.startY }];
      App.state.lassoPoints.push({ x: pos.x, y: pos.y });
    }
    Canvas.renderOverlay();
  }
};

Canvas.onMouseUp = function(e) {
  if (App.state.isPanning) {
    App.state.isPanning = false;
    return;
  }

  if (!App.state.isDrawing) return;

  var pos = App.screenToCanvas(e.clientX, e.clientY);
  var tool = App.state.activeTool;

  if (tool === 'marquee-rect' || tool === 'marquee-ellipse') {
    var x = Math.min(App.state.startX, pos.x);
    var y = Math.min(App.state.startY, pos.y);
    var w = Math.abs(pos.x - App.state.startX);
    var h = Math.abs(pos.y - App.state.startY);
    if (w > 2 && h > 2) {
      App.state.selection = { x: x, y: y, w: w, h: h };
    }
    App.updateStatus();
  }

  if (tool === 'lasso' && App.state.lassoPoints.length > 2) {
    var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    App.state.lassoPoints.forEach(function(p) {
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    });
    App.state.selection = { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
    App.state.lassoPoints = [];
    App.updateStatus();
  }

  if (tool === 'crop') {
    var x = Math.min(App.state.startX, pos.x);
    var y = Math.min(App.state.startY, pos.y);
    var w = Math.abs(pos.x - App.state.startX);
    var h = Math.abs(pos.y - App.state.startY);
    if (w > 10 && h > 10) {
      App.saveHistory();
      App.state.layers.forEach(function(layer) {
        var temp = document.createElement('canvas');
        temp.width = w;
        temp.height = h;
        var tctx = temp.getContext('2d');
        tctx.drawImage(layer.canvas, -x, -y);
        layer.canvas = temp;
        layer.x = 0;
        layer.y = 0;
      });
      App.state.canvasWidth = Math.round(w);
      App.state.canvasHeight = Math.round(h);
      App.state.selection = null;
      App.state.panX = 0;
      App.state.panY = 0;
      Canvas.resize();
      Canvas.render();
      Layers.renderList();
      App.updateStatus();
    }
  }

  if (tool === 'brush' || tool === 'eraser' || tool === 'clone-stamp' || tool === 'blur' || tool === 'dodge' || tool === 'history-brush') {
    App.saveHistory();
    var layer = Layers.getActive();
    if (layer) Layers.updateThumb(layer);
  }

  App.state.isDrawing = false;
  App.state._prevX = null;
  App.state._prevY = null;
  Canvas.render();
};

Canvas.onWheel = function(e) {
  e.preventDefault();
  var delta = e.deltaY > 0 ? 0.9 : 1.1;
  App.state.zoom = Math.max(0.01, Math.min(32, App.state.zoom * delta));
  document.getElementById('zoom-slider').value = Math.round(App.state.zoom * 100);
  document.getElementById('zoom-value').textContent = Math.round(App.state.zoom * 100) + '%';
  Canvas.render();
  App.updateStatus();
};

Canvas.drawBrushStroke = function(ctx, x, y, lastX, lastY) {
  var layer = Layers.getActive();
  if (!layer) return;

  ctx.globalAlpha = App.state.brushOpacity / 100;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = App.state.brushSize;

  if (App.state.activeTool === 'eraser') {
    ctx.globalCompositeOperation = 'destination-out';
  } else if (App.state.activeTool === 'clone-stamp') {
    if (!App.state.cloneSource) return;
    ctx.globalCompositeOperation = 'source-over';
    var dx = x - App.state.cloneSource.x;
    var dy = y - App.state.cloneSource.y;
    var sx = lastX - dx;
    var sy = lastY - dy;
    ctx.drawImage(layer.canvas, sx - App.state.brushSize/2, sy - App.state.brushSize/2, App.state.brushSize, App.state.brushSize, lastX - App.state.brushSize/2, lastY - App.state.brushSize/2, App.state.brushSize, App.state.brushSize);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    return;
  } else if (App.state.activeTool === 'blur') {
    ctx.globalCompositeOperation = 'source-over';
    var imgData = ctx.getImageData(Math.floor(x - App.state.brushSize/2), Math.floor(y - App.state.brushSize/2), Math.ceil(App.state.brushSize), Math.ceil(App.state.brushSize));
    var data = imgData.data;
    for (var i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] + 2);
      data[i+1] = Math.min(255, data[i+1] + 2);
      data[i+2] = Math.min(255, data[i+2] + 2);
    }
    ctx.putImageData(imgData, Math.floor(x - App.state.brushSize/2), Math.floor(y - App.state.brushSize/2));
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    return;
  } else if (App.state.activeTool === 'dodge') {
    ctx.globalCompositeOperation = 'source-over';
    var imgData = ctx.getImageData(Math.floor(x - App.state.brushSize/2), Math.floor(y - App.state.brushSize/2), Math.ceil(App.state.brushSize), Math.ceil(App.state.brushSize));
    var data = imgData.data;
    for (var i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] + 5);
      data[i+1] = Math.min(255, data[i+1] + 5);
      data[i+2] = Math.min(255, data[i+2] + 5);
    }
    ctx.putImageData(imgData, Math.floor(x - App.state.brushSize/2), Math.floor(y - App.state.brushSize/2));
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    return;
  } else {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = App.state.fgColor;
  }

  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(x, y);
  ctx.stroke();

  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
};

Canvas.updateCursor = function() {
  var tool = App.state.activeTool;
  var cursor = 'crosshair';
  if (tool === 'move') cursor = 'move';
  else if (tool === 'hand') cursor = 'grab';
  else if (tool === 'zoom') cursor = 'zoom-in';
  else if (tool === 'text') cursor = 'text';
  else if (tool === 'eyedropper') cursor = 'crosshair';
  Canvas.canvas.style.cursor = cursor;
  Canvas.overlay.style.cursor = cursor;
};

window.Canvas = Canvas;
