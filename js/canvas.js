var C={};

C.init=function(){
C.cv=document.getElementById('canvas');
C.cx=C.cv.getContext('2d');
C.ov=document.getElementById('overlay');
C.ox=C.ov.getContext('2d');
C.ct=document.getElementById('canvas-container');
C.bc=document.getElementById('bcur');
C.cv.addEventListener('mousedown',C.down);
C.cv.addEventListener('mousemove',C.move);
C.cv.addEventListener('mouseup',C.up);
C.cv.addEventListener('mouseleave',C.up);
C.cv.addEventListener('wheel',C.wheel,{passive:false});
C.cv.addEventListener('contextmenu',function(e){e.preventDefault()});
C.resize();
window.addEventListener('resize',C.resize);
};

C.resize=function(){
var w=C.ct.clientWidth;
var h=C.ct.clientHeight;
C.cv.width=w;C.cv.height=h;
C.ov.width=w;C.ov.height=h;
C.render();
};

C.render=function(){
var c=C.cx;
var w=C.cv.width;
var h=C.cv.height;
c.clearRect(0,0,w,h);
c.save();
c.translate(A.st.px,A.st.py);
c.scale(A.st.zoom,A.st.zoom);
c.fillStyle='#808080';
c.fillRect(0,0,A.st.w,A.st.h);
var cs=8;
for(var y=0;y<A.st.h;y+=cs){for(var x=0;x<A.st.w;x+=cs){c.fillStyle=((Math.floor(x/cs)+Math.floor(y/cs))%2===0)?'#ccc':'#999';c.fillRect(x,y,cs,cs)}}
for(var i=A.st.layers.length-1;i>=0;i--){
var l=A.st.layers[i];
if(!l.visible)continue;
c.globalAlpha=l.opacity/100;
c.globalCompositeOperation=l.blend==='normal'?'source-over':l.blend;
c.drawImage(l.canvas,l.x,l.y);
}
c.globalCompositeOperation='source-over';
c.globalAlpha=1;
if(A.st.sel){
c.strokeStyle='#fff';c.lineWidth=1/A.st.zoom;
c.setLineDash([4/A.st.zoom,4/A.st.zoom]);
c.strokeRect(A.st.sel.x,A.st.sel.y,A.st.sel.w,A.st.sel.h);
c.setLineDash([]);
}
c.strokeStyle='#000';c.lineWidth=1/A.st.zoom;
c.strokeRect(0,0,A.st.w,A.st.h);
c.restore();
};

C.down=function(e){
var p=A.toCanvas(e.clientX,e.clientY);
if(e.button===1||A.st.tool==='hand'||(A.st.tool==='move'&&e.altKey)){
A.st.panning=true;A.st.psx=e.clientX-A.st.px;A.st.psy=e.clientY-A.st.py;
return;
}
A.st.drawing=true;
A.st.sx=p.x;A.st.sy=p.y;
A.st.lx=p.x;A.st.ly=p.y;
if(A.st.tool==='eyedropper'){
var l=L.get();
if(l){var x=l.canvas.getContext('2d');var px=x.getImageData(Math.floor(p.x),Math.floor(p.y),1,1).data;A.st.fg=U.hex(px[0],px[1],px[2])}
A.st.drawing=false;return;
}
if(A.st.tool==='clone-stamp'&&e.altKey){
A.st.cloneSrc={x:p.x,y:p.y};
A.st.drawing=false;return;
}
if(A.st.tool==='zoom'){
A.st.zoom=e.altKey?A.st.zoom/1.5:A.st.zoom*1.5;
A.st.zoom=U.clamp(A.st.zoom,0.01,32);
document.getElementById('zslider').value=Math.round(A.st.zoom*100);
document.getElementById('zval').textContent=Math.round(A.st.zoom*100)+'%';
C.render();A.status();A.st.drawing=false;return;
}
if(['brush','eraser','clone-stamp','blur','dodge','history-brush'].indexOf(A.st.tool)!==-1){
var l=L.get();
if(l&&!l.locked){var x=l.canvas.getContext('2d');C.brush(x,p.x,p.y,p.x,p.y);C.render()}
}
if(A.st.tool==='text'){
var txt=prompt('Enter text:','Text');
if(txt){
A.saveHist();
var l=L.get();
if(l&&!l.locked){
var x=l.canvas.getContext('2d');
x.fillStyle=A.st.fg;
x.font=A.st.fsize+'px '+A.st.ffamily;
x.fillText(txt,p.x,p.y+A.st.fsize);
C.render();L.thumb(l);
}
}
A.st.drawing=false;
}
};

C.move=function(e){
var p=A.toCanvas(e.clientX,e.clientY);
document.getElementById('spos').textContent=Math.round(p.x)+', '+Math.round(p.y);
if(A.st.panning){
A.st.px=e.clientX-A.st.psx;
A.st.py=e.clientY-A.st.psy;
C.render();return;
}
if(!A.st.drawing)return;
A.st.lx=p.x;A.st.ly=p.y;
if(['brush','eraser','clone-stamp','blur','dodge','history-brush'].indexOf(A.st.tool)!==-1){
var l=L.get();
if(l&&!l.locked){var x=l.canvas.getContext('2d');C.brush(x,p.x,p.y,A.st._px||p.x,A.st._py||p.y);C.render()}
}
A.st._px=p.x;A.st._py=p.y;
if(['marquee-rect','marquee-ellipse','crop','lasso'].indexOf(A.st.tool)!==-1){
if(A.st.tool==='lasso'){if(!A.st.lassoPts)A.st.lassoPts=[];A.st.lassoPts.push({x:p.x,y:p.y})}
C.overlay();
}
};

C.up=function(e){
if(A.st.panning){A.st.panning=false;return}
if(!A.st.drawing)return;
var p=A.toCanvas(e.clientX,e.clientY);
var t=A.st.tool;
if(t==='marquee-rect'||t==='marquee-ellipse'){
var x=Math.min(A.st.sx,p.x),y=Math.min(A.st.sy,p.y);
var w=Math.abs(p.x-A.st.sx),h=Math.abs(p.y-A.st.sy);
if(w>2&&h>2)A.st.sel={x:x,y:y,w:w,h:h};
A.status();
}
if(t==='lasso'&&A.st.lassoPts&&A.st.lassoPts.length>2){
var mnX=Infinity,mnY=Infinity,mxX=-Infinity,mxY=-Infinity;
A.st.lassoPts.forEach(function(pt){if(pt.x<mnX)mnX=pt.x;if(pt.y<mnY)mnY=pt.y;if(pt.x>mxX)mxX=pt.x;if(pt.y>mxY)mxY=pt.y});
A.st.sel={x:mnX,y:mnY,w:mxX-mnX,h:mxY-mnY};
A.st.lassoPts=[];A.status();
}
if(t==='crop'){
var x=Math.min(A.st.sx,p.x),y=Math.min(A.st.sy,p.y);
var w=Math.abs(p.x-A.st.sx),h=Math.abs(p.y-A.st.sy);
if(w>10&&h>10){
A.saveHist();
A.st.layers.forEach(function(l){var tmp=document.createElement('canvas');tmp.width=w;tmp.height=h;tmp.getContext('2d').drawImage(l.canvas,-x,-y);l.canvas=tmp;l.x=0;l.y=0});
A.st.w=Math.round(w);A.st.h=Math.round(h);
A.st.sel=null;A.st.px=0;A.st.py=0;
C.resize();C.render();L.render();A.status();
}
}
if(['brush','eraser','clone-stamp','blur','dodge','history-brush'].indexOf(t)!==-1){
A.saveHist();var l=L.get();if(l)L.thumb(l);
}
A.st.drawing=false;A.st._px=null;A.st._py=null;
C.render();
};

C.wheel=function(e){
e.preventDefault();
var d=e.deltaY>0?0.9:1.1;
A.st.zoom=U.clamp(A.st.zoom*d,0.01,32);
document.getElementById('zslider').value=Math.round(A.st.zoom*100);
document.getElementById('zval').textContent=Math.round(A.st.zoom*100)+'%';
C.render();A.status();
};

C.brush=function(ctx,x,y,lx,ly){
var l=L.get();if(!l)return;
ctx.globalAlpha=A.st.bopacity/100;
ctx.lineCap='round';ctx.lineJoin='round';
ctx.lineWidth=A.st.bsize;
if(A.st.tool==='eraser'){ctx.globalCompositeOperation='destination-out'}
else if(A.st.tool==='clone-stamp'){
if(!A.st.cloneSrc)return;
ctx.globalCompositeOperation='source-over';
var dx=x-A.st.cloneSrc.x,dy=y-A.st.cloneSrc.y;
var sx=lx-dx,sy=ly-dy;
ctx.drawImage(l.canvas,sx-A.st.bsize/2,sy-A.st.bsize/2,A.st.bsize,A.st.bsize,lx-A.st.bsize/2,ly-A.st.bsize/2,A.st.bsize,A.st.bsize);
ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;return;
}
else if(A.st.tool==='blur'){
ctx.globalCompositeOperation='source-over';
var d=ctx.getImageData(Math.floor(x-A.st.bsize/2),Math.floor(y-A.st.bsize/2),Math.ceil(A.st.bsize),Math.ceil(A.st.bsize));
for(var i=0;i<d.data.length;i+=4){d.data[i]=Math.min(255,d.data[i]+2);d.data[i+1]=Math.min(255,d.data[i+1]+2);d.data[i+2]=Math.min(255,d.data[i+2]+2)}
ctx.putImageData(d,Math.floor(x-A.st.bsize/2),Math.floor(y-A.st.bsize/2));
ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;return;
}
else if(A.st.tool==='dodge'){
ctx.globalCompositeOperation='source-over';
var d=ctx.getImageData(Math.floor(x-A.st.bsize/2),Math.floor(y-A.st.bsize/2),Math.ceil(A.st.bsize),Math.ceil(A.st.bsize));
for(var i=0;i<d.data.length;i+=4){d.data[i]=Math.min(255,d.data[i]+5);d.data[i+1]=Math.min(255,d.data[i+1]+5);d.data[i+2]=Math.min(255,d.data[i+2]+5)}
ctx.putImageData(d,Math.floor(x-A.st.bsize/2),Math.floor(y-A.st.bsize/2));
ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;return;
}
else{ctx.globalCompositeOperation='source-over';ctx.strokeStyle=A.st.fg}
ctx.beginPath();ctx.moveTo(lx,ly);ctx.lineTo(x,y);ctx.stroke();
ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
};

C.overlay=function(){
var c=C.ox;
c.clearRect(0,0,C.ov.width,C.ov.height);
c.save();
c.translate(A.st.px,A.st.py);
c.scale(A.st.zoom,A.st.zoom);
if(A.st.drawing){
var t=A.st.tool;
if(t==='marquee-rect'||t==='marquee-ellipse'){
c.strokeStyle='#fff';c.lineWidth=1/A.st.zoom;c.setLineDash([4/A.st.zoom,4/A.st.zoom]);
var x=Math.min(A.st.lx,A.st.sx),y=Math.min(A.st.ly,A.st.sy);
var w=Math.abs(A.st.lx-A.st.sx),h=Math.abs(A.st.ly-A.st.sy);
if(t==='marquee-rect')c.strokeRect(x,y,w,h);
else{c.beginPath();c.ellipse(x+w/2,y+h/2,w/2,h/2,0,0,Math.PI*2);c.stroke()}
c.setLineDash([]);
}
if(t==='lasso'&&A.st.lassoPts&&A.st.lassoPts.length>1){
c.strokeStyle='#fff';c.lineWidth=1/A.st.zoom;c.setLineDash([4/A.st.zoom,4/A.st.zoom]);
c.beginPath();c.moveTo(A.st.lassoPts[0].x,A.st.lassoPts[0].y);
for(var i=1;i<A.st.lassoPts.length;i++)c.lineTo(A.st.lassoPts[i].x,A.st.lassoPts[i].y);
c.stroke();c.setLineDash([]);
}
if(t==='crop'){
c.strokeStyle='#fff';c.lineWidth=1/A.st.zoom;
var x=Math.min(A.st.lx,A.st.sx),y=Math.min(A.st.ly,A.st.sy);
var w=Math.abs(A.st.lx-A.st.sx),h=Math.abs(A.st.ly-A.st.sy);
c.strokeRect(x,y,w,h);
c.fillStyle='rgba(0,0,0,0.5)';
c.fillRect(0,0,A.st.w,y);c.fillRect(0,y+h,A.st.w,A.st.h-y-h);
c.fillRect(0,y,x,h);c.fillRect(x+w,y,A.st.w-x-w,h);
}
}
if(A.st.cloneSrc){
c.strokeStyle='#0f0';c.lineWidth=1/A.st.zoom;
c.beginPath();c.arc(A.st.cloneSrc.x,A.st.cloneSrc.y,10/A.st.zoom,0,Math.PI*2);
c.moveTo(A.st.cloneSrc.x-15/A.st.zoom,A.st.cloneSrc.y);c.lineTo(A.st.cloneSrc.x+15/A.st.zoom,A.st.cloneSrc.y);
c.moveTo(A.st.cloneSrc.x,A.st.cloneSrc.y-15/A.st.zoom);c.lineTo(A.st.cloneSrc.x,A.st.cloneSrc.y+15/A.st.zoom);
c.stroke();
}
c.restore();
};

C.cursor=function(){
var t=A.st.tool;
if(['brush','eraser','clone-stamp','blur','dodge','history-brush'].indexOf(t)!==-1){
C.bc.style.display='block';
C.bc.style.width=(A.st.bsize*A.st.zoom)+'px';
C.bc.style.height=(A.st.bsize*A.st.zoom)+'px';
C.cv.style.cursor='none';C.ov.style.cursor='none';
}else{
C.bc.style.display='none';
var cur='crosshair';
if(t==='move')cur='move';
else if(t==='hand')cur='grab';
else if(t==='zoom')cur='zoom-in';
else if(t==='text')cur='text';
C.cv.style.cursor=cur;C.ov.style.cursor=cur;
}
};

window.C=C;
