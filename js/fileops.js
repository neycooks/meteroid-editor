var F={};

F.init=function(){document.getElementById('file-input').addEventListener('change',function(){if(this.files.length>0){F.load(this.files[0]);this.value=''}})};

F.openFile=function(){document.getElementById('file-input').click()};

F.load=function(file){
var reader=new FileReader();
reader.onload=function(e){
var img=new Image();
img.onload=function(){
var w=Math.max(A.st.w,img.width);var h=Math.max(A.st.h,img.height);
A.st.w=w;A.st.h=h;
A.st.layers.forEach(function(l){var t=document.createElement('canvas');t.width=w;t.height=h;t.getContext('2d').drawImage(l.canvas,0,0);l.canvas=t});
var c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(img,0,0);
L.add(file.name,c);
A.st.px=0;A.st.py=0;A.st.zoom=1;
document.getElementById('zslider').value=100;document.getElementById('zval').textContent='100%';
C.resize();C.render();L.render();A.status();
};
img.src=e.target.result;
};
reader.readAsDataURL(file);
};

F.newFile=function(){
A.showModal('<div class="mhdr"><span>New Image</span><span class="mclose" onclick="A.hideModal()">✕</span></div><div class="mbody"><div class="frow"><label>Width:</label><input type="number" id="dnw" value="800"></div><div class="frow"><label>Height:</label><input type="number" id="dnh" value="600"></div><div class="frow"><label>Background:</label><select id="dnbg"><option value="white">White</option><option value="black">Black</option><option value="transparent">Transparent</option></select></div></div><div class="mfoot"><button class="btn btns" onclick="A.hideModal()">Cancel</button><button class="btn btnp" onclick="F.create()">Create</button></div>');
};

F.create=function(){
var w=parseInt(document.getElementById('dnw').value)||800;
var h=parseInt(document.getElementById('dnh').value)||600;
var bg=document.getElementById('dnbg').value;
A.st.layers=[];A.st.w=w;A.st.h=h;A.st.sel=null;A.st.px=0;A.st.py=0;A.st.zoom=1;A.st.hist=[];A.st.hidx=-1;
var c=document.createElement('canvas');c.width=w;c.height=h;var x=c.getContext('2d');
if(bg==='white'){x.fillStyle='#fff';x.fillRect(0,0,w,h)}
else if(bg==='black'){x.fillStyle='#000';x.fillRect(0,0,w,h)}
L.add('Background',c,false);
A.hideModal();
document.getElementById('zslider').value=100;document.getElementById('zval').textContent='100%';
C.resize();C.render();L.render();A.status();
};

F.flatten=function(){
var c=document.createElement('canvas');c.width=A.st.w;c.height=A.st.h;
var x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);
for(var i=A.st.layers.length-1;i>=0;i--){var l=A.st.layers[i];if(!l.visible)continue;x.globalAlpha=l.opacity/100;x.drawImage(l.canvas,l.x,l.y)}
return c;
};

F.exportPNG=function(){var c=F.flatten();var a=document.createElement('a');a.download='meteroid.png';a.href=c.toDataURL('image/png');a.click()};
F.exportJPG=function(){var c=F.flatten();var a=document.createElement('a');a.download='meteroid.jpg';a.href=c.toDataURL('image/jpeg',0.92);a.click()};
F.exportWebP=function(){var c=F.flatten();var a=document.createElement('a');a.download='meteroid.webp';a.href=c.toDataURL('image/webp',0.92);a.click()};

window.F=F;
