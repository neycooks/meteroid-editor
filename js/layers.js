var Layers = {};

Layers.init = function() {
  App.state.layers = [];
  App.state.activeLayerId = null;
};

Layers.addLayer = function(name, canvas, locked) {
  var id = Utils.genId();
  var layer = {
    id: id,
    name: name || ('Layer ' + (App.state.layers.length + 1)),
    visible: true,
    opacity: 100,
    blendMode: 'normal',
    locked: locked || false,
    canvas: canvas,
    x: 0,
    y: 0,
  };
  App.state.layers.unshift(layer);
  App.state.activeLayerId = id;
  Layers.renderList();
  return layer;
};

Layers.addNewLayer = function() {
  var canvas = document.createElement('canvas');
  canvas.width = App.state.canvasWidth;
  canvas.height = App.state.canvasHeight;
  App.saveHistory();
  Layers.addLayer('Layer ' + (App.state.layers.length + 1), canvas);
  Canvas.render();
  Layers.renderList();
};

Layers.deleteActive = function() {
  if (App.state.layers.length <= 1) return;
  var idx = Layers.getActiveIndex();
  if (idx < 0) return;
  App.saveHistory();
  App.state.layers.splice(idx, 1);
  App.state.activeLayerId = App.state.layers[Math.min(idx, App.state.layers.length - 1)].id;
  Canvas.render();
  Layers.renderList();
};

Layers.duplicateActive = function() {
  var layer = Layers.getActive();
  if (!layer) return;
  App.saveHistory();
  var canvas = document.createElement('canvas');
  canvas.width = layer.canvas.width;
  canvas.height = layer.canvas.height;
  canvas.getContext('2d').drawImage(layer.canvas, 0, 0);
  var newLayer = Layers.addLayer(layer.name + ' copy', canvas);
  Canvas.render();
  Layers.renderList();
};

Layers.mergeDown = function() {
  var idx = Layers.getActiveIndex();
  if (idx < 0 || idx >= App.state.layers.length - 1) return;
  App.saveHistory();
  var top = App.state.layers[idx];
  var bottom = App.state.layers[idx + 1];
  var canvas = document.createElement('canvas');
  canvas.width = App.state.canvasWidth;
  canvas.height = App.state.canvasHeight;
  var ctx = canvas.getContext('2d');
  ctx.drawImage(bottom.canvas, 0, 0);
  ctx.globalAlpha = top.opacity / 100;
  ctx.drawImage(top.canvas, top.x, top.y);
  App.state.layers.splice(idx, 1);
  bottom.canvas = canvas;
  App.state.activeLayerId = bottom.id;
  Canvas.render();
  Layers.renderList();
};

Layers.flatten = function() {
  App.saveHistory();
  var canvas = document.createElement('canvas');
  canvas.width = App.state.canvasWidth;
  canvas.height = App.state.canvasHeight;
  var ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (var i = App.state.layers.length - 1; i >= 0; i--) {
    var layer = App.state.layers[i];
    if (!layer.visible) continue;
    ctx.globalAlpha = layer.opacity / 100;
    ctx.drawImage(layer.canvas, layer.x, layer.y);
  }
  App.state.layers = [];
  Layers.addLayer('Background', canvas, false);
  Canvas.render();
  Layers.renderList();
};

Layers.getActive = function() {
  return App.state.layers.find(function(l) { return l.id === App.state.activeLayerId; });
};

Layers.getActiveIndex = function() {
  return App.state.layers.findIndex(function(l) { return l.id === App.state.activeLayerId; });
};

Layers.updateThumb = function(layer) {
  if (!layer) return;
  var thumb = document.querySelector('.layer-item[data-id="' + layer.id + '"] .layer-thumb canvas');
  if (thumb) {
    var ctx = thumb.getContext('2d');
    ctx.clearRect(0, 0, 32, 32);
    var scale = Math.min(32 / layer.canvas.width, 32 / layer.canvas.height);
    var w = layer.canvas.width * scale;
    var h = layer.canvas.height * scale;
    ctx.drawImage(layer.canvas, (32 - w) / 2, (32 - h) / 2, w, h);
  }
};

Layers.renderList = function() {
  var list = document.getElementById('layers-list');
  list.innerHTML = '';
  App.state.layers.forEach(function(layer) {
    var item = document.createElement('div');
    item.className = 'layer-item' + (layer.id === App.state.activeLayerId ? ' active' : '');
    item.dataset.id = layer.id;

    var thumbCanvas = document.createElement('canvas');
    thumbCanvas.width = 32;
    thumbCanvas.height = 32;
    var tctx = thumbCanvas.getContext('2d');
    var scale = Math.min(32 / layer.canvas.width, 32 / layer.canvas.height);
    var w = layer.canvas.width * scale;
    var h = layer.canvas.height * scale;
    tctx.drawImage(layer.canvas, (32 - w) / 2, (32 - h) / 2, w, h);

    item.innerHTML =
      '<span class="layer-vis">' + (layer.visible ? '👁' : '○') + '</span>' +
      '<div class="layer-thumb"></div>' +
      '<span class="layer-name">' + layer.name + '</span>' +
      (layer.locked ? '<span class="layer-lock">🔒</span>' : '');

    item.querySelector('.layer-thumb').appendChild(thumbCanvas);

    item.addEventListener('click', function(e) {
      if (e.target.classList.contains('layer-vis')) {
        layer.visible = !layer.visible;
        Layers.renderList();
        Canvas.render();
        return;
      }
      App.state.activeLayerId = layer.id;
      Layers.renderList();
      document.getElementById('layer-opacity').value = layer.opacity;
      document.getElementById('opacity-value').textContent = layer.opacity + '%';
      document.getElementById('blend-mode').value = layer.blendMode;
    });

    item.addEventListener('dblclick', function() {
      var name = prompt('Layer name:', layer.name);
      if (name) {
        layer.name = name;
        Layers.renderList();
      }
    });

    list.appendChild(item);
  });
};

Layers.createSnapshot = function() {
  var layers = App.state.layers.map(function(layer) {
    var ctx = layer.canvas.getContext('2d');
    var imageData = ctx.getImageData(0, 0, layer.canvas.width, layer.canvas.height);
    return {
      id: layer.id,
      name: layer.name,
      visible: layer.visible,
      opacity: layer.opacity,
      blendMode: layer.blendMode,
      imageData: imageData,
      x: layer.x,
      y: layer.y,
    };
  });
  return {
    layers: layers,
    activeLayerId: App.state.activeLayerId,
    canvasWidth: App.state.canvasWidth,
    canvasHeight: App.state.canvasHeight,
  };
};

Layers.restoreSnapshot = function(snap) {
  App.state.canvasWidth = snap.canvasWidth;
  App.state.canvasHeight = snap.canvasHeight;
  App.state.layers = snap.layers.map(function(s) {
    var canvas = document.createElement('canvas');
    canvas.width = s.imageData.width;
    canvas.height = s.imageData.height;
    var ctx = canvas.getContext('2d');
    ctx.putImageData(s.imageData, 0, 0);
    return {
      id: s.id,
      name: s.name,
      visible: s.visible,
      opacity: s.opacity,
      blendMode: s.blendMode,
      canvas: canvas,
      x: s.x,
      y: s.y,
      locked: false,
    };
  });
  App.state.activeLayerId = snap.activeLayerId;
};

window.Layers = Layers;
