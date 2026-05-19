var Tools = {};

Tools.list = [
  { id: 'move', icon: '↖', label: 'Move Tool', shortcut: 'V' },
  { id: 'marquee-rect', icon: '⬚', label: 'Rectangular Marquee', shortcut: 'M' },
  { id: 'marquee-ellipse', icon: '⬮', label: 'Elliptical Marquee', shortcut: 'M' },
  { id: 'lasso', icon: '⤹', label: 'Lasso', shortcut: 'L' },
  { id: 'magic-wand', icon: '✦', label: 'Magic Wand', shortcut: 'W' },
  { id: 'crop', icon: '⬔', label: 'Crop', shortcut: 'C' },
  { id: 'eyedropper', icon: '💉', label: 'Eyedropper', shortcut: 'I' },
  { id: 'spot-healing', icon: '⊕', label: 'Spot Healing Brush', shortcut: 'J' },
  { id: 'brush', icon: '🖌', label: 'Brush', shortcut: 'B' },
  { id: 'clone-stamp', icon: '⊘', label: 'Clone Stamp', shortcut: 'S' },
  { id: 'history-brush', icon: '↺', label: 'History Brush', shortcut: 'Y' },
  { id: 'eraser', icon: '◻', label: 'Eraser', shortcut: 'E' },
  { id: 'gradient', icon: '▨', label: 'Gradient', shortcut: 'G' },
  { id: 'blur', icon: '◎', label: 'Blur/Sharpen', shortcut: 'R' },
  { id: 'dodge', icon: '◐', label: 'Dodge/Burn', shortcut: 'O' },
  { id: 'pen', icon: '✎', label: 'Pen', shortcut: 'P' },
  { id: 'text', icon: 'T', label: 'Type', shortcut: 'T' },
  { id: 'shape', icon: '▭', label: 'Shape', shortcut: 'U' },
  { id: 'hand', icon: '✋', label: 'Hand', shortcut: 'H' },
  { id: 'zoom', icon: '🔍', label: 'Zoom', shortcut: 'Z' },
];

Tools.init = function() {
  var toolbar = document.getElementById('toolbar');
  Tools.list.forEach(function(tool, i) {
    if (i === 1 || i === 6 || i === 8 || i === 12 || i === 16) {
      var sep = document.createElement('div');
      sep.className = 'tool-sep';
      toolbar.appendChild(sep);
    }
    var btn = document.createElement('div');
    btn.className = 'tool-btn' + (tool.id === App.state.activeTool ? ' active' : '');
    btn.dataset.tool = tool.id;
    btn.innerHTML = tool.icon + '<span class="shortcut">' + tool.shortcut + '</span>';
    btn.title = tool.label + ' (' + tool.shortcut + ')';
    btn.addEventListener('click', function() {
      App.setTool(tool.id);
    });
    toolbar.appendChild(btn);
  });
  Tools.updateOptions();
};

Tools.updateOptions = function() {
  var container = document.getElementById('tool-options');
  var html = '';
  switch(App.state.activeTool) {
    case 'brush':
    case 'eraser':
    case 'clone-stamp':
    case 'history-brush':
      html = '<label>Size:</label><input type="number" id="opt-size" value="' + App.state.brushSize + '" min="1" max="500">' +
             '<label>Opacity:</label><input type="number" id="opt-opacity" value="' + App.state.brushOpacity + '" min="1" max="100">' +
             '<label>Hardness:</label><input type="number" id="opt-hardness" value="' + App.state.brushHardness + '" min="0" max="100">';
      break;
    case 'text':
      html = '<label>Font:</label><select id="opt-font"><option>Arial</option><option>Helvetica</option><option>Times New Roman</option><option>Courier New</option><option>Verdana</option><option>Georgia</option></select>' +
             '<label>Size:</label><input type="number" id="opt-fontsize" value="' + App.state.fontSize + '" min="1" max="500">';
      break;
    case 'marquee-rect':
    case 'marquee-ellipse':
      html = '<label>Mode:</label><select><option>New Selection</option><option>Add to Selection</option><option>Subtract</option><option>Intersect</option></select>';
      break;
    case 'magic-wand':
      html = '<label>Tolerance:</label><input type="number" id="opt-tolerance" value="' + App.state.magicWandTolerance + '" min="0" max="255">' +
             '<label><input type="checkbox" checked> Contiguous</label>';
      break;
    case 'gradient':
      html = '<label>Type:</label><select id="opt-gradtype"><option value="linear">Linear</option><option value="radial">Radial</option></select>' +
             '<label><input type="checkbox" checked> Dither</label>';
      break;
    case 'shape':
      html = '<label>Shape:</label><select id="opt-shape"><option value="rect">Rectangle</option><option value="ellipse">Ellipse</option><option value="line">Line</option></select>' +
             '<label>Fill:</label><input type="color" id="opt-shapefill" value="' + App.state.fgColor + '">';
      break;
    case 'zoom':
      html = '<label>Zoom:</label><span>' + Math.round(App.state.zoom * 100) + '%</span>';
      break;
    default:
      html = '<span style="color:#777">' + (Tools.list.find(function(t){return t.id===App.state.activeTool}) || {}).label + '</span>';
  }
  container.innerHTML = html;

  var sizeInput = document.getElementById('opt-size');
  if (sizeInput) sizeInput.addEventListener('change', function() { App.state.brushSize = parseInt(this.value); });
  var opacityInput = document.getElementById('opt-opacity');
  if (opacityInput) opacityInput.addEventListener('change', function() { App.state.brushOpacity = parseInt(this.value); });
  var hardnessInput = document.getElementById('opt-hardness');
  if (hardnessInput) hardnessInput.addEventListener('change', function() { App.state.brushHardness = parseInt(this.value); });
  var fontInput = document.getElementById('opt-font');
  if (fontInput) fontInput.addEventListener('change', function() { App.state.fontFamily = this.value; });
  var fontsizeInput = document.getElementById('opt-fontsize');
  if (fontsizeInput) fontsizeInput.addEventListener('change', function() { App.state.fontSize = parseInt(this.value); });
  var toleranceInput = document.getElementById('opt-tolerance');
  if (toleranceInput) toleranceInput.addEventListener('change', function() { App.state.magicWandTolerance = parseInt(this.value); });
  var gradtypeInput = document.getElementById('opt-gradtype');
  if (gradtypeInput) gradtypeInput.addEventListener('change', function() { App.state.gradientType = this.value; });
  var shapeInput = document.getElementById('opt-shape');
  if (shapeInput) shapeInput.addEventListener('change', function() { App.state.shapeType = this.value; });
};

window.Tools = Tools;
