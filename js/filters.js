var Filters = {};

Filters.init = function() {};

Filters.applyQuick = function(type) {
  var layer = Layers.getActive();
  if (!layer || layer.locked) return;
  App.saveHistory();
  var ctx = layer.canvas.getContext('2d');
  var imageData = ctx.getImageData(0, 0, layer.canvas.width, layer.canvas.height);
  var data = imageData.data;

  switch(type) {
    case 'invert':
      for (var i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i];
        data[i+1] = 255 - data[i+1];
        data[i+2] = 255 - data[i+2];
      }
      break;
    case 'desaturate':
      for (var i = 0; i < data.length; i += 4) {
        var gray = 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2];
        data[i] = gray; data[i+1] = gray; data[i+2] = gray;
      }
      break;
  }

  ctx.putImageData(imageData, 0, 0);
  Canvas.render();
  Layers.updateThumb(layer);
};

Filters.applyDialog = function(type) {
  var layer = Layers.getActive();
  if (!layer || layer.locked) return;

  var body = '';
  switch(type) {
    case 'blur':
      body = '<div class="form-row"><label>Radius:</label><input type="number" id="dlg-radius" value="3" min="1" max="50"></div>';
      break;
    case 'sharpen':
      body = '<div class="form-row"><label>Amount:</label><input type="number" id="dlg-amount" value="1" min="0" max="5" step="0.1"></div>';
      break;
    case 'brightness':
      body = '<div class="form-row"><label>Brightness:</label><input type="number" id="dlg-brightness" value="0" min="-100" max="100"></div>' +
             '<div class="form-row"><label>Contrast:</label><input type="number" id="dlg-contrast" value="0" min="-100" max="100"></div>';
      break;
    case 'hue-sat':
      body = '<div class="form-row"><label>Hue:</label><input type="number" id="dlg-hue" value="0" min="-180" max="180"></div>' +
             '<div class="form-row"><label>Saturation:</label><input type="number" id="dlg-saturation" value="0" min="-100" max="100"></div>' +
             '<div class="form-row"><label>Lightness:</label><input type="number" id="dlg-lightness" value="0" min="-100" max="100"></div>';
      break;
    case 'levels':
      body = '<div class="form-row"><label>In Black:</label><input type="number" id="dlg-inblack" value="0" min="0" max="255"></div>' +
             '<div class="form-row"><label>In White:</label><input type="number" id="dlg-inwhite" value="255" min="0" max="255"></div>' +
             '<div class="form-row"><label>Gamma:</label><input type="number" id="dlg-gamma" value="1" min="0.1" max="10" step="0.1"></div>' +
             '<div class="form-row"><label>Out Black:</label><input type="number" id="dlg-outblack" value="0" min="0" max="255"></div>' +
             '<div class="form-row"><label>Out White:</label><input type="number" id="dlg-outwhite" value="255" min="0" max="255"></div>';
      break;
    case 'curves':
      body = '<p style="color:#999;font-size:12px">Curves editor coming soon. Use Levels instead.</p>';
      break;
    case 'posterize':
      body = '<div class="form-row"><label>Levels:</label><input type="number" id="dlg-levels" value="4" min="2" max="255"></div>';
      break;
    case 'threshold':
      body = '<div class="form-row"><label>Threshold:</label><input type="number" id="dlg-threshold" value="128" min="0" max="255"></div>';
      break;
    case 'noise':
      body = '<div class="form-row"><label>Amount:</label><input type="number" id="dlg-noise" value="25" min="0" max="255"></div>';
      break;
    case 'pixelate':
      body = '<div class="form-row"><label>Size:</label><input type="number" id="dlg-pixelsize" value="8" min="2" max="100"></div>';
      break;
    case 'color-balance':
      body = '<div class="form-row"><label>Cyan/Red:</label><input type="number" id="dlg-cr" value="0" min="-100" max="100"></div>' +
             '<div class="form-row"><label>Magenta/Green:</label><input type="number" id="dlg-mg" value="0" min="-100" max="100"></div>' +
             '<div class="form-row"><label>Yellow/Blue:</label><input type="number" id="dlg-yb" value="0" min="-100" max="100"></div>';
      break;
  }

  App.showModal(
    '<div class="modal-header"><span>' + type.charAt(0).toUpperCase() + type.slice(1) + '</span><span class="modal-close" onclick="App.hideModal()">✕</span></div>' +
    '<div class="modal-body">' + body + '</div>' +
    '<div class="modal-footer">' +
    '<button class="btn btn-secondary" onclick="App.hideModal()">Cancel</button>' +
    '<button class="btn btn-primary" onclick="Filters.execute(\'' + type + '\')">OK</button>' +
    '</div>'
  );
};

Filters.execute = function(type) {
  var layer = Layers.getActive();
  if (!layer || layer.locked) return;
  App.saveHistory();
  var ctx = layer.canvas.getContext('2d');
  var imageData = ctx.getImageData(0, 0, layer.canvas.width, layer.canvas.height);
  var data = imageData.data;

  switch(type) {
    case 'blur': {
      var radius = parseInt(document.getElementById('dlg-radius').value) || 3;
      var copy = new Uint8ClampedArray(data);
      for (var y = 0; y < imageData.height; y++) {
        for (var x = 0; x < imageData.width; x++) {
          var r = 0, g = 0, b = 0, count = 0;
          for (var dy = -radius; dy <= radius; dy++) {
            for (var dx = -radius; dx <= radius; dx++) {
              var nx = x + dx, ny = y + dy;
              if (nx >= 0 && nx < imageData.width && ny >= 0 && ny < imageData.height) {
                var idx = (ny * imageData.width + nx) * 4;
                r += copy[idx]; g += copy[idx+1]; b += copy[idx+2]; count++;
              }
            }
          }
          var idx = (y * imageData.width + x) * 4;
          data[idx] = r/count; data[idx+1] = g/count; data[idx+2] = b/count;
        }
      }
      break;
    }
    case 'sharpen': {
      var amount = parseFloat(document.getElementById('dlg-amount').value) || 1;
      var copy = new Uint8ClampedArray(data);
      var kernel = [0, -amount, 0, -amount, 1+4*amount, -amount, 0, -amount, 0];
      for (var y = 1; y < imageData.height-1; y++) {
        for (var x = 1; x < imageData.width-1; x++) {
          for (var c = 0; c < 3; c++) {
            var sum = 0;
            for (var ky = -1; ky <= 1; ky++) {
              for (var kx = -1; kx <= 1; kx++) {
                var idx = ((y+ky)*imageData.width+(x+kx))*4+c;
                sum += copy[idx] * kernel[(ky+1)*3+(kx+1)];
              }
            }
            data[(y*imageData.width+x)*4+c] = Math.max(0, Math.min(255, sum));
          }
        }
      }
      break;
    }
    case 'brightness': {
      var brightness = parseInt(document.getElementById('dlg-brightness').value) || 0;
      var contrast = parseInt(document.getElementById('dlg-contrast').value) || 0;
      var factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
      for (var i = 0; i < data.length; i += 4) {
        for (var c = 0; c < 3; c++) {
          var val = data[i+c] + brightness;
          val = factor * (val - 128) + 128;
          data[i+c] = Math.max(0, Math.min(255, val));
        }
      }
      break;
    }
    case 'hue-sat': {
      var hue = parseInt(document.getElementById('dlg-hue').value) || 0;
      var saturation = parseInt(document.getElementById('dlg-saturation').value) || 0;
      var lightness = parseInt(document.getElementById('dlg-lightness').value) || 0;
      for (var i = 0; i < data.length; i += 4) {
        var r = data[i]/255, g = data[i+1]/255, b = data[i+2]/255;
        var max = Math.max(r,g,b), min = Math.min(r,g,b);
        var h = 0, s = 0, l = (max+min)/2;
        if (max !== min) {
          var d = max - min;
          s = l > 0.5 ? d/(2-max-min) : d/(max+min);
          switch(max) {
            case r: h = ((g-b)/d + (g<b?6:0))/6; break;
            case g: h = ((b-r)/d + 2)/6; break;
            case b: h = ((r-g)/d + 4)/6; break;
          }
        }
        h = (h + hue/360) % 1; if (h < 0) h += 1;
        s = Math.max(0, Math.min(1, s + saturation/100));
        l = Math.max(0, Math.min(1, l + lightness/100));
        var q = l < 0.5 ? l*(1+s) : l+s-l*s;
        var p = 2*l - q;
        var hue2rgb = function(p,q,t) {
          if(t<0)t+=1; if(t>1)t-=1;
          if(t<1/6)return p+(q-p)*6*t;
          if(t<1/2)return q;
          if(t<2/3)return p+(q-p)*(2/3-t)*6;
          return p;
        };
        data[i] = Math.round(hue2rgb(p,q,h+1/3)*255);
        data[i+1] = Math.round(hue2rgb(p,q,h)*255);
        data[i+2] = Math.round(hue2rgb(p,q,h-1/3)*255);
      }
      break;
    }
    case 'levels': {
      var inBlack = parseInt(document.getElementById('dlg-inblack').value) || 0;
      var inWhite = parseInt(document.getElementById('dlg-inwhite').value) || 255;
      var gamma = parseFloat(document.getElementById('dlg-gamma').value) || 1;
      var outBlack = parseInt(document.getElementById('dlg-outblack').value) || 0;
      var outWhite = parseInt(document.getElementById('dlg-outwhite').value) || 255;
      var inRange = inWhite - inBlack;
      var outRange = outWhite - outBlack;
      for (var i = 0; i < data.length; i += 4) {
        for (var c = 0; c < 3; c++) {
          var val = (data[i+c] - inBlack) / inRange;
          val = Math.max(0, Math.min(1, val));
          val = Math.pow(val, 1/gamma);
          val = outBlack + val * outRange;
          data[i+c] = Math.max(0, Math.min(255, val));
        }
      }
      break;
    }
    case 'posterize': {
      var levels = parseInt(document.getElementById('dlg-levels').value) || 4;
      var step = 255 / (levels - 1);
      for (var i = 0; i < data.length; i += 4) {
        for (var c = 0; c < 3; c++) {
          data[i+c] = Math.round(Math.round(data[i+c]/step) * step);
        }
      }
      break;
    }
    case 'threshold': {
      var threshold = parseInt(document.getElementById('dlg-threshold').value) || 128;
      for (var i = 0; i < data.length; i += 4) {
        var gray = 0.299*data[i] + 0.587*data[i+1] + 0.114*data[i+2];
        var val = gray >= threshold ? 255 : 0;
        data[i] = val; data[i+1] = val; data[i+2] = val;
      }
      break;
    }
    case 'noise': {
      var amount = parseInt(document.getElementById('dlg-noise').value) || 25;
      for (var i = 0; i < data.length; i += 4) {
        for (var c = 0; c < 3; c++) {
          data[i+c] = Math.max(0, Math.min(255, data[i+c] + (Math.random()-0.5)*amount));
        }
      }
      break;
    }
    case 'pixelate': {
      var size = parseInt(document.getElementById('dlg-pixelsize').value) || 8;
      for (var y = 0; y < imageData.height; y += size) {
        for (var x = 0; x < imageData.width; x += size) {
          var idx = (y*imageData.width+x)*4;
          var r = data[idx], g = data[idx+1], b = data[idx+2], a = data[idx+3];
          for (var dy = 0; dy < size && y+dy < imageData.height; dy++) {
            for (var dx = 0; dx < size && x+dx < imageData.width; dx++) {
              var pIdx = ((y+dy)*imageData.width+(x+dx))*4;
              data[pIdx] = r; data[pIdx+1] = g; data[pIdx+2] = b; data[pIdx+3] = a;
            }
          }
        }
      }
      break;
    }
    case 'color-balance': {
      var cr = parseInt(document.getElementById('dlg-cr').value) || 0;
      var mg = parseInt(document.getElementById('dlg-mg').value) || 0;
      var yb = parseInt(document.getElementById('dlg-yb').value) || 0;
      for (var i = 0; i < data.length; i += 4) {
        data[i] = Math.max(0, Math.min(255, data[i] + cr));
        data[i+1] = Math.max(0, Math.min(255, data[i+1] + mg));
        data[i+2] = Math.max(0, Math.min(255, data[i+2] + yb));
      }
      break;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  App.hideModal();
  Canvas.render();
  Layers.updateThumb(layer);
};

Filters.applyAdjustment = function(type) {
  switch(type) {
    case 'levels': Filters.applyDialog('levels'); break;
    case 'curves': Filters.applyDialog('curves'); break;
    case 'brightness': Filters.applyDialog('brightness'); break;
    case 'huesat': Filters.applyDialog('hue-sat'); break;
    case 'colorbalance': Filters.applyDialog('color-balance'); break;
    case 'invert': Filters.applyQuick('invert'); break;
    case 'desaturate': Filters.applyQuick('desaturate'); break;
    case 'threshold': Filters.applyDialog('threshold'); break;
    case 'posterize': Filters.applyDialog('posterize'); break;
  }
};

window.Filters = Filters;
