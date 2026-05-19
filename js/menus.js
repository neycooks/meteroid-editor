var M={items:{
file:[{l:'New...',s:'Ctrl+N',a:'new'},{l:'Open...',s:'Ctrl+O',a:'open'},{sep:1},{l:'Save as PSD',a:'save-psd'},{l:'Export as PNG',s:'Ctrl+S',a:'export-png'},{l:'Export as JPG',a:'export-jpg'},{l:'Export as WebP',a:'export-webp'}],
edit:[{l:'Undo',s:'Ctrl+Z',a:'undo'},{l:'Redo',s:'Ctrl+Y',a:'redo'},{sep:1},{l:'Cut',s:'Ctrl+X',a:'cut'},{l:'Copy',s:'Ctrl+C',a:'copy'},{l:'Paste',s:'Ctrl+V',a:'paste'},{sep:1},{l:'Clear',s:'Del',a:'clear'},{l:'Fill with FG Color',s:'Alt+Backspace',a:'fill-fg'},{l:'Fill with BG Color',s:'Ctrl+Backspace',a:'fill-bg'}],
image:[{l:'Canvas Size...',s:'Ctrl+Alt+C',a:'canvas-size'},{l:'Image Size...',s:'Ctrl+Alt+I',a:'image-size'},{sep:1},{l:'Rotate 90° CW',a:'rotate-cw'},{l:'Rotate 90° CCW',a:'rotate-ccw'},{l:'Rotate 180°',a:'rotate-180'},{l:'Flip Horizontal',a:'flip-h'},{l:'Flip Vertical',a:'flip-v'}],
layer:[{l:'New Layer...',s:'Ctrl+Shift+N',a:'new-layer'},{l:'Duplicate Layer',s:'Ctrl+J',a:'dup-layer'},{l:'Delete Layer',s:'Del',a:'del-layer'},{sep:1},{l:'Merge Down',s:'Ctrl+E',a:'merge-down'},{l:'Flatten Image',a:'flatten'}],
select:[{l:'All',s:'Ctrl+A',a:'select-all'},{l:'Deselect',s:'Ctrl+D',a:'deselect'},{l:'Invert Selection',s:'Ctrl+Shift+I',a:'invert-sel'}],
filter:[{l:'Blur...',a:'blur'},{l:'Sharpen',a:'sharpen'},{sep:1},{l:'Brightness/Contrast...',a:'brightness'},{l:'Hue/Saturation...',a:'hue-sat'},{l:'Levels...',a:'levels'},{l:'Curves...',a:'curves'},{sep:1},{l:'Invert',s:'Ctrl+I',a:'invert'},{l:'Desaturate',s:'Ctrl+Shift+U',a:'desaturate'},{l:'Posterize...',a:'posterize'},{l:'Threshold...',a:'threshold'},{l:'Noise...',a:'noise'},{l:'Pixelate...',a:'pixelate'},{l:'Color Balance...',a:'color-balance'}],
view:[{l:'Zoom In',s:'Ctrl++',a:'zoom-in'},{l:'Zoom Out',s:'Ctrl+-',a:'zoom-out'},{l:'Fit on Screen',s:'Ctrl+0',a:'fit-screen'},{l:'Actual Pixels',s:'Ctrl+1',a:'actual-pixels'},{sep:1},{l:'Grid',s:"Ctrl+'",a:'grid'}],
window:[{l:'Layers',a:'win-layers'},{l:'Adjustments',a:'win-adjustments'},{l:'History',a:'win-history'}],
help:[{l:'Keyboard Shortcuts',a:'shortcuts'},{l:'About Meteroid',a:'about'}]
}};

M.init=function(){
document.querySelectorAll('.mi').forEach(function(item){
item.addEventListener('click',function(e){e.stopPropagation();var mn=this.dataset.m;var ex=document.getElementById('cmenu');if(!ex.classList.contains('hid')&&ex.dataset.m===mn){ex.classList.add('hid');return}M.show(mn,this)});
item.addEventListener('mouseenter',function(){var ex=document.getElementById('cmenu');if(!ex.classList.contains('hid'))M.show(this.dataset.m,this)});
});
};

M.show=function(mn,trigger){
var menu=document.getElementById('cmenu');
menu.dataset.m=mn;menu.classList.remove('hid');
var items=M.items[mn];if(!items){menu.classList.add('hid');return}
var html='';
items.forEach(function(item){
if(item.sep){html+='<div class="cxsep"></div>'}
else{html+='<div class="cxi" data-a="'+item.a+'"><span>'+item.l+'</span>'+(item.s?'<span class="cxs">'+item.s+'</span>':'')+'</div>'}
});
menu.innerHTML=html;
var r=trigger.getBoundingClientRect();
menu.style.top=r.bottom+'px';menu.style.left=r.left+'px';
menu.querySelectorAll('.cxi').forEach(function(el){
el.addEventListener('click',function(){M.exec(mn,this.dataset.a);menu.classList.add('hid')});
});
document.querySelectorAll('.mi').forEach(function(mi){mi.classList.toggle('act',mi.dataset.m===mn)});
};

M.exec=function(mn,a){
switch(a){
case'new':F.newFile();break;case'open':F.openFile();break;
case'save-psd':alert('PSD export coming soon.');break;
case'export-png':F.exportPNG();break;case'export-jpg':F.exportJPG();break;case'export-webp':F.exportWebP();break;
case'undo':A.undo();break;case'redo':A.redo();break;
case'cut':case'copy':case'paste':alert('Use Ctrl+C/V');break;
case'clear':A.clearSel();break;
case'fill-fg':M.fill(A.st.fg);break;case'fill-bg':M.fill(A.st.bg);break;
case'canvas-size':M.canvasSizeDlg();break;case'image-size':M.imageSizeDlg();break;
case'rotate-cw':M.rotate(90);break;case'rotate-ccw':M.rotate(-90);break;case'rotate-180':M.rotate(180);break;
case'flip-h':M.flip(true);break;case'flip-v':M.flip(false);break;
case'new-layer':L.addNew();break;case'dup-layer':L.dup();break;case'del-layer':L.del();break;
case'merge-down':L.mergeDown();break;case'flatten':L.flatten();break;
case'select-all':A.selAll();break;case'deselect':A.desel();break;case'invert-sel':alert('Invert selection');break;
case'blur':Fl.dlg('blur');break;case'sharpen':Fl.dlg('sharpen');break;
case'brightness':Fl.dlg('brightness');break;case'hue-sat':Fl.dlg('hue-sat');break;
case'levels':Fl.dlg('levels');break;case'curves':Fl.dlg('curves');break;
case'invert':Fl.quick('invert');break;case'desaturate':Fl.quick('desaturate');break;
case'posterize':Fl.dlg('posterize');break;case'threshold':Fl.dlg('threshold');break;
case'noise':Fl.dlg('noise');break;case'pixelate':Fl.dlg('pixelate');break;
case'color-balance':Fl.dlg('color-balance');break;
case'zoom-in':A.st.zoom*=1.25;M.updZoom();break;case'zoom-out':A.st.zoom/=1.25;M.updZoom();break;
case'fit-screen':A.st.zoom=1;A.st.px=0;A.st.py=0;M.updZoom();break;
case'actual-pixels':A.st.zoom=1;A.st.px=0;A.st.py=0;M.updZoom();break;
case'grid':A.st.grid=!A.st.grid;C.render();break;
case'win-layers':M.showPanel('layers');break;case'win-adjustments':M.showPanel('adjustments');break;case'win-history':M.showPanel('history');break;
case'about':A.showModal('<div class="mhdr"><span>About Meteroid</span><span class="mclose" onclick="A.hideModal()">✕</span></div><div class="mbody"><h2>Meteroid</h2><p>Free Online Photo Editor</p><p>Version 1.0.0</p><p>Built with vanilla HTML, CSS & JavaScript</p></div><div class="mfoot"><button class="btn btnp" onclick="A.hideModal()">OK</button></div>');break;
}
};

M.fill=function(color){
var l=L.get();if(!l||l.locked)return;
A.saveHist();var x=l.canvas.getContext('2d');x.fillStyle=color;
if(A.st.sel)x.fillRect(A.st.sel.x,A.st.sel.y,A.st.sel.w,A.st.sel.h);
else x.fillRect(0,0,l.canvas.width,l.canvas.height);
C.render();L.thumb(l);
};

M.canvasSizeDlg=function(){
A.showModal('<div class="mhdr"><span>Canvas Size</span><span class="mclose" onclick="A.hideModal()">✕</span></div><div class="mbody"><div class="frow"><label>Width:</label><input type="number" id="dcw" value="'+A.st.w+'"></div><div class="frow"><label>Height:</label><input type="number" id="dch" value="'+A.st.h+'"></div></div><div class="mfoot"><button class="btn btns" onclick="A.hideModal()">Cancel</button><button class="btn btnp" onclick="M.setCanvasSize()">OK</button></div>');
};
M.setCanvasSize=function(){
var w=parseInt(document.getElementById('dcw').value)||800;
var h=parseInt(document.getElementById('dch').value)||600;
A.saveHist();
A.st.layers.forEach(function(l){var t=document.createElement('canvas');t.width=w;t.height=h;t.getContext('2d').drawImage(l.canvas,0,0);l.canvas=t});
A.st.w=w;A.st.h=h;A.hideModal();C.resize();C.render();L.render();A.status();
};

M.imageSizeDlg=function(){
A.showModal('<div class="mhdr"><span>Image Size</span><span class="mclose" onclick="A.hideModal()">✕</span></div><div class="mbody"><div class="frow"><label>Width:</label><input type="number" id="diw" value="'+A.st.w+'"></div><div class="frow"><label>Height:</label><input type="number" id="dih" value="'+A.st.h+'"></div></div><div class="mfoot"><button class="btn btns" onclick="A.hideModal()">Cancel</button><button class="btn btnp" onclick="M.setImageSize()">OK</button></div>');
};
M.setImageSize=function(){
var w=parseInt(document.getElementById('diw').value)||800;
var h=parseInt(document.getElementById('dih').value)||600;
A.saveHist();
A.st.layers.forEach(function(l){var t=document.createElement('canvas');t.width=w;t.height=h;t.getContext('2d').drawImage(l.canvas,0,0,w,h);l.canvas=t});
A.st.w=w;A.st.h=h;A.hideModal();C.resize();C.render();L.render();A.status();
};

M.rotate=function(deg){
var l=L.get();if(!l)return;A.saveHist();
var t=document.createElement('canvas');var x=t.getContext('2d');
if(Math.abs(deg)===90){t.width=l.canvas.height;t.height=l.canvas.width}
else{t.width=l.canvas.width;t.height=l.canvas.height}
x.translate(t.width/2,t.height/2);x.rotate(deg*Math.PI/180);x.drawImage(l.canvas,-l.canvas.width/2,-l.canvas.height/2);
l.canvas=t;
if(Math.abs(deg)===90){var tw=A.st.w;A.st.w=A.st.h;A.st.h=tw}
C.resize();C.render();L.thumb(l);A.status();
};

M.flip=function(horiz){
var l=L.get();if(!l)return;A.saveHist();
var t=document.createElement('canvas');t.width=l.canvas.width;t.height=l.canvas.height;
var x=t.getContext('2d');
if(horiz){x.translate(t.width,0);x.scale(-1,1)}else{x.translate(0,t.height);x.scale(1,-1)}
x.drawImage(l.canvas,0,0);l.canvas=t;C.render();L.thumb(l);
};

M.updZoom=function(){
A.st.zoom=U.clamp(A.st.zoom,0.01,32);
document.getElementById('zslider').value=Math.round(A.st.zoom*100);
document.getElementById('zval').textContent=Math.round(A.st.zoom*100)+'%';
C.render();A.status();
};

M.showPanel=function(name){
document.querySelectorAll('.ptab').forEach(function(t){t.classList.toggle('act',t.dataset.p===name)});
document.querySelectorAll('.pcontent').forEach(function(p){p.style.display='none'});
document.getElementById('panel-'+name).style.display='flex';
};

window.M=M;
