var A={
st:{
layers:[],aid:null,tool:'brush',bsize:10,bopacity:100,bhard:100,
fg:'#000000',bg:'#ffffff',zoom:1,px:0,py:0,w:800,h:600,
sel:null,hist:[],hidx:-1,grid:false,
drawing:false,lx:0,ly:0,sx:0,sy:0,
panning:false,psx:0,psy:0,
cloneSrc:null,lassoPts:null,
ffamily:'Arial',fsize:24
}
};

A.init=function(){
T.init();L.init();C.init();M.init();F.init();Fl.init();
A.events();A.defaultLayer();C.render();L.render();A.status();A.opts();
};

A.defaultLayer=function(){
var c=document.createElement('canvas');c.width=A.st.w;c.height=A.st.h;
var x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);
L.add('Background',c,true);
};

A.events=function(){
document.addEventListener('keydown',A.key);
document.addEventListener('click',function(e){var m=document.getElementById('cmenu');if(!m.classList.contains('hid')&&!m.contains(e.target))m.classList.add('hid')});
var ws=document.getElementById('workspace');
ws.addEventListener('dragover',function(e){e.preventDefault();e.dataTransfer.dropEffect='copy'});
ws.addEventListener('drop',function(e){e.preventDefault();if(e.dataTransfer.files.length>0)F.load(e.dataTransfer.files[0])});
document.getElementById('zslider').addEventListener('input',function(){A.st.zoom=parseInt(this.value)/100;document.getElementById('zval').textContent=this.value+'%';C.render();A.status()});
document.getElementById('lopacity').addEventListener('input',function(){var l=L.get();if(l){l.opacity=parseInt(this.value);document.getElementById('oval').textContent=this.value+'%';C.render()}});
document.getElementById('blend').addEventListener('change',function(){var l=L.get();if(l){l.blend=this.value;C.render()}});
document.querySelectorAll('.ptab').forEach(function(tab){tab.addEventListener('click',function(){document.querySelectorAll('.ptab').forEach(function(t){t.classList.remove('act')});document.querySelectorAll('.pcontent').forEach(function(p){p.style.display='none'});this.classList.add('act');document.getElementById('panel-'+this.dataset.p).style.display='flex'})});
document.getElementById('btn-nl').addEventListener('click',L.addNew);
document.getElementById('btn-dl').addEventListener('click',L.dup);
document.getElementById('btn-rl').addEventListener('click',L.del);
document.getElementById('btn-ml').addEventListener('click',L.mergeDown);
document.getElementById('btn-fl').addEventListener('click',L.flatten);
document.querySelectorAll('.abtn').forEach(function(btn){btn.addEventListener('click',function(){Fl.applyAdj(this.dataset.a)})});
};

A.key=function(e){
var ctrl=e.ctrlKey||e.metaKey;
if(ctrl){switch(e.key.toLowerCase()){
case'z':e.preventDefault();A.undo();return;
case'y':e.preventDefault();A.redo();return;
case's':e.preventDefault();F.exportPNG();return;
case'o':e.preventDefault();F.openFile();return;
case'a':e.preventDefault();A.selAll();return;
case'd':e.preventDefault();A.desel();return;
case'j':e.preventDefault();L.dup();return;
case'e':e.preventDefault();L.mergeDown();return;
case'n':if(e.shiftKey){e.preventDefault();L.addNew()}return;
}}
switch(e.key.toLowerCase()){
case'v':A.setTool('move');break;
case'm':A.setTool(e.shiftKey?'marquee-ellipse':'marquee-rect');break;
case'l':A.setTool(e.shiftKey?'magic-wand':'lasso');break;
case'w':A.setTool('magic-wand');break;
case'c':A.setTool(e.shiftKey?'crop':'eyedropper');break;
case'i':A.setTool('eyedropper');break;
case'j':if(!ctrl)A.setTool('spot-healing');break;
case'b':A.setTool('brush');break;
case's':if(!ctrl)A.setTool('clone-stamp');break;
case'y':A.setTool('history-brush');break;
case'e':A.setTool('eraser');break;
case'g':A.setTool('gradient');break;
case'r':A.setTool('blur');break;
case'o':if(!ctrl)A.setTool('dodge');break;
case'p':A.setTool('pen');break;
case't':A.setTool('text');break;
case'u':A.setTool('shape');break;
case'h':A.setTool('hand');break;
case'z':if(!ctrl)A.setTool('zoom');break;
case'x':var t=A.st.fg;A.st.fg=A.st.bg;A.st.bg=t;break;
case'd':if(!ctrl){A.st.fg='#000000';A.st.bg='#ffffff'}break;
case'[':A.st.bsize=Math.max(1,A.st.bsize-5);A.opts();break;
case']':A.st.bsize=Math.min(500,A.st.bsize+5);A.opts();break;
case' ':if(!e.repeat){e.preventDefault();A.setTool('hand')}break;
case'delete':case'backspace':A.clearSel();break;
}
};

A.setTool=function(tool){
A.st.tool=tool;
document.querySelectorAll('.tb').forEach(function(b){b.classList.toggle('act',b.dataset.t===tool)});
A.opts();A.status();C.cursor();
};

A.undo=function(){if(A.st.hidx>=0){var s=A.st.hist[A.st.hidx];L.restore(s);A.st.hidx--;C.render();L.render();A.renderHist()}};
A.redo=function(){if(A.st.hidx<A.st.hist.length-1){A.st.hidx++;var s=A.st.hist[A.st.hidx];L.restore(s);C.render();L.render();A.renderHist()}};

A.saveHist=function(){
var s=L.snapshot();
A.st.hist=A.st.hist.slice(0,A.st.hidx+1);
A.st.hist.push(s);A.st.hidx=A.st.hist.length-1;
if(A.st.hist.length>50){A.st.hist.shift();A.st.hidx--}
A.renderHist();
};

A.renderHist=function(){
var list=document.getElementById('hlist');if(!list)return;list.innerHTML='';
for(var i=0;i<A.st.hist.length;i++){
var item=document.createElement('div');
item.className='hi'+(i===A.st.hidx?' act':'')+(i>A.st.hidx?' fut':'');
item.textContent=A.st.hist[i].name;
item.addEventListener('click',function(){
var idx=Array.prototype.indexOf.call(list.children,this);
if(idx<=A.st.hidx){while(A.st.hidx>idx)A.undo()}
else{while(A.st.hidx<idx)A.redo()}
});
list.appendChild(item);
}
};

A.selAll=function(){A.st.sel={x:0,y:0,w:A.st.w,h:A.st.h};C.render();A.status()};
A.desel=function(){A.st.sel=null;C.render();A.status()};
A.clearSel=function(){var l=L.get();if(!l)return;A.saveHist();var c=l.canvas.getContext('2d');if(A.st.sel)c.clearRect(A.st.sel.x,A.st.sel.y,A.st.sel.w,A.st.sel.h);else c.clearRect(0,0,l.canvas.width,l.canvas.height);C.render();L.thumb(l)};

A.status=function(){
var n={move:'Move','marquee-rect':'Rect Marquee','marquee-ellipse':'Ellip Marquee',lasso:'Lasso','magic-wand':'Magic Wand',crop:'Crop',eyedropper:'Eyedropper','spot-healing':'Spot Healing',brush:'Brush','clone-stamp':'Clone Stamp','history-brush':'History Brush',eraser:'Eraser',gradient:'Gradient',blur:'Blur',dodge:'Dodge/Burn',pen:'Pen',text:'Type',shape:'Shape',hand:'Hand',zoom:'Zoom'};
document.getElementById('stool').textContent=n[A.st.tool]||A.st.tool;
document.getElementById('szoom').textContent=Math.round(A.st.zoom*100)+'%';
document.getElementById('ssize').textContent=A.st.w+' × '+A.st.h;
var s=document.getElementById('ssel');
if(A.st.sel)s.textContent='Sel: '+Math.round(A.st.sel.w)+' × '+Math.round(A.st.sel.h);
else s.textContent='';
};

A.opts=function(){
var c=document.getElementById('tool-options');var h='',t=A.st.tool;
if(['brush','eraser','clone-stamp','history-brush'].indexOf(t)!==-1){
h='<label>Size:</label><input type="number" id="obs" value="'+A.st.bsize+'" min="1" max="500" style="width:50px"><label>Opacity:</label><input type="number" id="obo" value="'+A.st.bopacity+'" min="1" max="100" style="width:50px"><label>Hardness:</label><input type="number" id="obh" value="'+A.st.bhard+'" min="0" max="100" style="width:50px"'}
else if(t==='text'){
h='<label>Font:</label><select id="ofont"><option'+(A.st.ffamily==='Arial'?' selected':'')+'>Arial</option><option'+(A.st.ffamily==='Helvetica'?' selected':'')+'>Helvetica</option><option'+(A.st.ffamily==='Times New Roman'?' selected':'')+'>Times</option><option'+(A.st.ffamily==='Courier New'?' selected':'')+'>Courier</option><option'+(A.st.ffamily==='Verdana'?' selected':'')+'>Verdana</option></select><label>Size:</label><input type="number" id="ofs" value="'+A.st.fsize+'" min="1" max="500" style="width:50px"'}
else if(t==='marquee-rect'||t==='marquee-ellipse'){
h='<label>Mode:</label><select><option>New Selection</option><option>Add</option><option>Subtract</option><option>Intersect</option></select>'}
else if(t==='magic-wand'){
h='<label>Tolerance:</label><input type="number" id="otol" value="32" min="0" max="255" style="width:50px"'}
else if(t==='gradient'){
h='<label>Type:</label><select id="ogt"><option value="linear">Linear</option><option value="radial">Radial</option></select>'}
else if(t==='shape'){
h='<label>Shape:</label><select id="osh"><option value="rect">Rectangle</option><option value="ellipse">Ellipse</option><option value="line">Line</option></select>'}
else if(t==='zoom'){
h='<label>Zoom:</label><span>'+Math.round(A.st.zoom*100)+'%</span>'}
else if(t==='crop'){
h='<label>Crop:</label><span>Drag to select area</span>'}
else{
h='<span style="color:#888">'+(T.list.find(function(x){return x.id===t})||{}).l||t+'</span>'}
c.innerHTML=h;
var bs=document.getElementById('obs');if(bs)bs.addEventListener('change',function(){A.st.bsize=parseInt(this.value)});
var bo=document.getElementById('obo');if(bo)bo.addEventListener('change',function(){A.st.bopacity=parseInt(this.value)});
var bh=document.getElementById('obh');if(bh)bh.addEventListener('change',function(){A.st.bhard=parseInt(this.value)});
var fo=document.getElementById('ofont');if(fo)fo.addEventListener('change',function(){A.st.ffamily=this.value});
var fs=document.getElementById('ofs');if(fs)fs.addEventListener('change',function(){A.st.fsize=parseInt(this.value)});
var ot=document.getElementById('otol');if(ot)ot.addEventListener('change',function(){A.st.magicWandTolerance=parseInt(this.value)});
var og=document.getElementById('ogt');if(og)og.addEventListener('change',function(){A.st.gradientType=this.value});
var os=document.getElementById('osh');if(os)os.addEventListener('change',function(){A.st.shapeType=this.value});
};

A.toCanvas=function(sx,sy){var r=document.getElementById('canvas-container').getBoundingClientRect();return{x:(sx-r.left-A.st.px)/A.st.zoom,y:(sy-r.top-A.st.py)/A.st.zoom}};

A.showModal=function(html){document.getElementById('modal').innerHTML=html;document.getElementById('moverlay').classList.remove('hid')};
A.hideModal=function(){document.getElementById('moverlay').classList.add('hid')};

window.A=A;
