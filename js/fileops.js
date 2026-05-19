var FileOps = {};

FileOps.init = function() {
  document.getElementById('file-input').addEventListener('change', function() {
    if (this.files.length > 0) {
      FileOps.loadFile(this.files[0]);
      this.value = '';
    }
  });
};

FileOps.openFile = function() {
  document.getElementById('file-input').click();
};

FileOps.loadFile = function(file) {
  var reader = new FileReader();
  reader.onload = function(e) {
    var img = new Image();
    img.onload = function() {
      var w = Math.max(App.state.canvasWidth, img.width);
      var h = Math.max(App.state.canvasHeight, img.height);
      App.state.canvasWidth = w;
      App.state.canvasHeight = h;

      App.state.layers.forEach(function(layer) {
        var temp = document.createElement('canvas');
        temp.width = w;
        temp.height = h;
        temp.getContext('2d').drawImage(layer.canvas, 0, 0);
        layer.canvas = temp;
      });

      var canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0);
      Layers.addLayer(file.name, canvas);

      App.state.panX = 0;
      App.state.panY = 0;
      App.state.zoom = 1;
      document.getElementById('zoom-slider').value = 100;
      document.getElementById('zoom-value').textContent = '100%';

      Canvas.resize();
      Canvas.render();
      Layers.renderList();
      App.updateStatus();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
};

FileOps.newFile = function() {
  App.showModal(
    '<div class="modal-header"><span>New Image</span><span class="modal-close" onclick="App.hideModal()">✕</span></div>' +
    '<div class="modal-body">' +
    '<div class="form-row"><label>Width:</label><input type="number" id="dlg-nw" value="800"></div>' +
    '<div class="form-row"><label>Height:</label><input type="number" id="dlg-nh" value="600"></div>' +
    '<div class="form-row"><label>Background:</label><select id="dlg-nbg"><option value="white">White</option><option value="black">Black</option><option value="transparent">Transparent</option></select></div>' +
    '</div>' +
    '<div class="modal-footer">' +
    '<button class="btn btn-secondary" onclick="App.hideModal()">Cancel</button>' +
    '<button class="btn btn-primary" onclick="FileOps.createNew()">Create</button>' +
    '</div>'
  );
};

FileOps.createNew = function() {
  var w = parseInt(document.getElementById('dlg-nw').value) || 800;
  var h = parseInt(document.getElementById('dlg-nh').value) || 600;
  var bg = document.getElementById('dlg-nbg').value;

  App.state.layers = [];
  App.state.canvasWidth = w;
  App.state.canvasHeight = h;
  App.state.selection = null;
  App.state.panX = 0;
  App.state.panY = 0;
  App.state.zoom = 1;
  App.state.history = [];
  App.state.historyIndex = -1;

  var canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  var ctx = canvas.getContext('2d');
  if (bg === 'white') { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h); }
  else if (bg === 'black') { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, h); }

  Layers.addLayer('Background', canvas, false);
  App.hideModal();

  document.getElementById('zoom-slider').value = 100;
  document.getElementById('zoom-value').textContent = '100%';

  Canvas.resize();
  Canvas.render();
  Layers.renderList();
  App.updateStatus();
};

FileOps.flattenForExport = function() {
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
  return canvas;
};

FileOps.exportPNG = function() {
  var canvas = FileOps.flattenForExport();
  var link = document.createElement('a');
  link.download = 'meteroid.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
};

FileOps.exportJPG = function() {
  var canvas = FileOps.flattenForExport();
  var link = document.createElement('a');
  link.download = 'meteroid.jpg';
  link.href = canvas.toDataURL('image/jpeg', 0.92);
  link.click();
};

FileOps.exportWebP = function() {
  var canvas = FileOps.flattenForExport();
  var link = document.createElement('a');
  link.download = 'meteroid.webp';
  link.href = canvas.toDataURL('image/webp', 0.92);
  link.click();
};

window.FileOps = FileOps;
