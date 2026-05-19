var Utils = {};

Utils.genId = function() {
  return Math.random().toString(36).substr(2, 9);
};

Utils.rgbToHex = function(r, g, b) {
  return '#' + [r, g, b].map(function(x) {
    var hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

Utils.hexToRgb = function(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
};

Utils.clamp = function(val, min, max) {
  return Math.max(min, Math.min(max, val));
};

Utils.lerp = function(a, b, t) {
  return a + (b - a) * t;
};

Utils.distance = function(x1, y1, x2, y2) {
  return Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
};

window.Utils = Utils;
