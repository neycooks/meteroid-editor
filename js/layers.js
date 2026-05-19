var L={};
L.init=function(){A.st.layers=[];A.st.aid=null};

L.add=function(name,canvas,locked){
var id=U.id();
var layer={id:id,name:name||('Layer '+(A.st.layers.length+1)),visible:true,opacity:100,blend:'normal',locked:locked||false,canvas:canvas,x:0,y:0};
A.st.layers.unshift(layer);
A.st.aid=id;
L.render();
return layer;
};

L.addNew=function(){
var c=document.createElement('canvas');
c.width=A.st.w;c.height=A.st.h;
A.saveHist();
L.add('Layer '+(A.st.layers.length+1),c);
C.render();L.render();
};

L.del=function(){
if(A.st.layers.length<=1)return;
var i=A.st.layers.findIndex(function(l){return l.id===A.st.aid});
if(i<0)return;
A.saveHist();
A.st.layers.splice(i,1);
A.st.aid=A.st.layers[Math.min(i,A.st.layers.length-1)].id;
C.render();L.render();
};

L.dup=function(){
var l=A.st.layers.find(function(x){return x.id===A.st.aid});
if(!l)return;
A.saveHist();
var c=document.createElement('canvas');
c.width=l.canvas.width;c.height=l.canvas.height;
c.getContext('2d').drawImage(l.canvas,0,0);
L.add(l.name+' copy',c);
C.render();L.render();
};

L.mergeDown=function(){
var i=A.st.layers.findIndex(function(l){return l.id===A.st.aid});
if(i<0||i>=A.st.layers.length-1)return;
A.saveHist();
var top=A.st.layers[i],bot=A.st.layers[i+1];
var c=document.createElement('canvas');
c.width=A.st.w;c.height=A.st.h;
var x=c.getContext('2d');
x.drawImage(bot.canvas,0,0);
x.globalAlpha=top.opacity/100;
x.drawImage(top.canvas,top.x,top.y);
A.st.layers.splice(i,1);
bot.canvas=c;
A.st.aid=bot.id;
C.render();L.render();
};

L.flatten=function(){
A.saveHist();
var c=document.createElement('canvas');
c.width=A.st.w;c.height=A.st.h;
var x=c.getContext('2d');
x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);
for(var i=A.st.layers.length-1;i>=0;i--){
var l=A.st.layers[i];
if(!l.visible)continue;
x.globalAlpha=l.opacity/100;
x.drawImage(l.canvas,l.x,l.y);
}
A.st.layers=[];
L.add('Background',c,false);
C.render();L.render();
};

L.get=function(){return A.st.layers.find(function(l){return l.id===A.st.aid})};

L.thumb=function(layer){
if(!layer)return;
var t=document.querySelector('.li[data-id="'+layer.id+'"] .lthumb canvas');
if(t){var x=t.getContext('2d');x.clearRect(0,0,32,32);var s=Math.min(32/layer.canvas.width,32/layer.canvas.height);x.drawImage(layer.canvas,(32-layer.canvas.width*s)/2,(32-layer.canvas.height*s)/2,layer.canvas.width*s,layer.canvas.height*s)}
};

L.render=function(){
var list=document.getElementById('llist');
list.innerHTML='';
A.st.layers.forEach(function(layer){
var item=document.createElement('div');
item.className='li'+(layer.id===A.st.aid?' act':'');
item.dataset.id=layer.id;
var tc=document.createElement('canvas');tc.width=32;tc.height=32;
var tx=tc.getContext('2d');
var s=Math.min(32/layer.canvas.width,32/layer.canvas.height);
tx.drawImage(layer.canvas,(32-layer.canvas.width*s)/2,(32-layer.canvas.height*s)/2,layer.canvas.width*s,layer.canvas.height*s);
var vis=document.createElement('span');
vis.className='lvis';
vis.textContent=layer.visible?'👁':'○';
vis.addEventListener('click',function(e){e.stopPropagation();layer.visible=!layer.visible;L.render();C.render()});
var thumb=document.createElement('div');
thumb.className='lthumb';
thumb.appendChild(tc);
var name=document.createElement('span');
name.className='lname';
name.textContent=layer.name;
name.addEventListener('dblclick',function(){var n=prompt('Layer name:',layer.name);if(n){layer.name=n;L.render()}});
item.appendChild(vis);
item.appendChild(thumb);
item.appendChild(name);
if(layer.locked){var lk=document.createElement('span');lk.style.fontSize='10px';lk.style.color='#888';lk.textContent='🔒';item.appendChild(lk)}
item.addEventListener('click',function(e){
if(e.target!==vis){
A.st.aid=layer.id;
L.render();
document.getElementById('lopacity').value=layer.opacity;
document.getElementById('oval').textContent=layer.opacity+'%';
document.getElementById('blend').value=layer.blend;
}
});
list.appendChild(item);
});
};

L.snapshot=function(){
var layers=A.st.layers.map(function(layer){
var x=layer.canvas.getContext('2d');
var d=x.getImageData(0,0,layer.canvas.width,layer.canvas.height);
return{id:layer.id,name:layer.name,visible:layer.visible,opacity:layer.opacity,blend:layer.blend,imageData:d,x:layer.x,y:layer.y};
});
return{layers:layers,aid:A.st.aid,w:A.st.w,h:A.st.h,name:'Edit'};
};

L.restore=function(snap){
A.st.w=snap.w;A.st.h=snap.h;
A.st.layers=snap.layers.map(function(s){
var c=document.createElement('canvas');
c.width=s.imageData.width;c.height=s.imageData.height;
var x=c.getContext('2d');
x.putImageData(s.imageData,0,0);
return{id:s.id,name:s.name,visible:s.visible,opacity:s.opacity,blend:s.blend,canvas:c,x:s.x,y:s.y,locked:false};
});
A.st.aid=snap.aid;
};

window.L=L;
