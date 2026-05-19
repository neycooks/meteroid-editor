var Fl={};

Fl.quick=function(type){
var l=L.get();if(!l||l.locked)return;
A.saveHist();var x=l.canvas.getContext('2d');
var img=x.getImageData(0,0,l.canvas.width,l.canvas.height);var d=img.data;
if(type==='invert'){for(var i=0;i<d.length;i+=4){d[i]=255-d[i];d[i+1]=255-d[i+1];d[i+2]=255-d[i+2]}}
else if(type==='desaturate'){for(var i=0;i<d.length;i+=4){var g=0.299*d[i]+0.587*d[i+1]+0.114*d[i+2];d[i]=g;d[i+1]=g;d[i+2]=g}}
x.putImageData(new ImageData(new Uint8ClampedArray(d),img.width,img.height),0,0);
C.render();L.thumb(l);
};

Fl.dlg=function(type){
var l=L.get();if(!l||l.locked)return;
var b='';
switch(type){
case'blur':b='<div class="frow"><label>Radius:</label><input type="number" id="dr" value="3" min="1" max="50"></div>';break;
case'sharpen':b='<div class="frow"><label>Amount:</label><input type="number" id="da" value="1" min="0" max="5" step="0.1"></div>';break;
case'brightness':b='<div class="frow"><label>Brightness:</label><input type="number" id="dbr" value="0" min="-100" max="100"></div><div class="frow"><label>Contrast:</label><input type="number" id="dco" value="0" min="-100" max="100"></div>';break;
case'hue-sat':b='<div class="frow"><label>Hue:</label><input type="number" id="dhu" value="0" min="-180" max="180"></div><div class="frow"><label>Saturation:</label><input type="number" id="dsa" value="0" min="-100" max="100"></div><div class="frow"><label>Lightness:</label><input type="number" id="dli" value="0" min="-100" max="100"></div>';break;
case'levels':b='<div class="frow"><label>In Black:</label><input type="number" id="dib" value="0" min="0" max="255"></div><div class="frow"><label>In White:</label><input type="number" id="diw" value="255" min="0" max="255"></div><div class="frow"><label>Gamma:</label><input type="number" id="dga" value="1" min="0.1" max="10" step="0.1"></div><div class="frow"><label>Out Black:</label><input type="number" id="dob" value="0" min="0" max="255"></div><div class="frow"><label>Out White:</label><input type="number" id="dow" value="255" min="0" max="255"></div>';break;
case'curves':b='<p style="color:#999;font-size:12px">Curves coming soon. Use Levels instead.</p>';break;
case'posterize':b='<div class="frow"><label>Levels:</label><input type="number" id="dlv" value="4" min="2" max="255"></div>';break;
case'threshold':b='<div class="frow"><label>Threshold:</label><input type="number" id="dth" value="128" min="0" max="255"></div>';break;
case'noise':b='<div class="frow"><label>Amount:</label><input type="number" id="dno" value="25" min="0" max="255"></div>';break;
case'pixelate':b='<div class="frow"><label>Size:</label><input type="number" id="dpz" value="8" min="2" max="100"></div>';break;
case'color-balance':b='<div class="frow"><label>Cyan/Red:</label><input type="number" id="dcr" value="0" min="-100" max="100"></div><div class="frow"><label>Magenta/Green:</label><input type="number" id="dmg" value="0" min="-100" max="100"></div><div class="frow"><label>Yellow/Blue:</label><input type="number" id="dyb" value="0" min="-100" max="100"></div>';break;
}
A.showModal('<div class="mhdr"><span>'+type.charAt(0).toUpperCase()+type.slice(1)+'</span><span class="mclose" onclick="A.hideModal()">✕</span></div><div class="mbody">'+b+'</div><div class="mfoot"><button class="btn btns" onclick="A.hideModal()">Cancel</button><button class="btn btnp" onclick="Fl.exec(\''+type+'\')">OK</button></div>');
};

Fl.exec=function(type){
var l=L.get();if(!l||l.locked)return;
A.saveHist();var x=l.canvas.getContext('2d');
var img=x.getImageData(0,0,l.canvas.width,l.canvas.height);var d=img.data;
switch(type){
case'blur':{var r=parseInt(document.getElementById('dr').value)||3;var c=new Uint8ClampedArray(d);for(var y=0;y<img.height;y++){for(var xx=0;xx<img.width;xx++){var rr=0,gg=0,bb=0,cnt=0;for(var dy=-r;dy<=r;dy++){for(var dx=-r;dx<=r;dx++){var nx=xx+dx,ny=y+dy;if(nx>=0&&nx<img.width&&ny>=0&&ny<img.height){var i=(ny*img.width+nx)*4;rr+=c[i];gg+=c[i+1];bb+=c[i+2];cnt++}}}var i=(y*img.width+xx)*4;d[i]=rr/cnt;d[i+1]=gg/cnt;d[i+2]=bb/cnt}}break}
case'sharpen':{var a=parseFloat(document.getElementById('da').value)||1;var c=new Uint8ClampedArray(d);var k=[0,-a,0,-a,1+4*a,-a,0,-a,0];for(var y=1;y<img.height-1;y++){for(var xx=1;xx<img.width-1;xx++){for(var cc=0;cc<3;cc++){var s=0;for(var ky=-1;ky<=1;ky++){for(var kx=-1;kx<=1;kx++){var i=((y+ky)*img.width+(xx+kx))*4+cc;s+=c[i]*k[(ky+1)*3+(kx+1)]}d[(y*img.width+xx)*4+cc]=Math.max(0,Math.min(255,s))}}}break}
case'brightness':{var br=parseInt(document.getElementById('dbr').value)||0;var co=parseInt(document.getElementById('dco').value)||0;var f=(259*(co+255))/(255*(259-co));for(var i=0;i<d.length;i+=4){for(var c=0;c<3;c++){var v=d[i+c]+br;v=f*(v-128)+128;d[i+c]=Math.max(0,Math.min(255,v))}}break}
case'hue-sat':{var hu=parseInt(document.getElementById('dhu').value)||0;var sa=parseInt(document.getElementById('dsa').value)||0;var li=parseInt(document.getElementById('dli').value)||0;for(var i=0;i<d.length;i+=4){var r=d[i]/255,g=d[i+1]/255,b=d[i+2]/255;var mx=Math.max(r,g,b),mn=Math.min(r,g,b);var h=0,s=0,l=(mx+mn)/2;if(mx!==mn){var dd=mx-mn;s=l>0.5?dd/(2-mx-mn):dd/(mx+mn);switch(mx){case r:h=((g-b)/dd+(g<b?6:0))/6;break;case g:h=((b-r)/dd+2)/6;break;case b:h=((r-g)/dd+4)/6;break}}h=(h+hu/360)%1;if(h<0)h+=1;s=Math.max(0,Math.min(1,s+sa/100));l=Math.max(0,Math.min(1,l+li/100));var q=l<0.5?l*(1+s):l+s-l*s;var p=2*l-q;var h2r=function(p,q,t){if(t<0)t+=1;if(t>1)t-=1;if(t<1/6)return p+(q-p)*6*t;if(t<1/2)return q;if(t<2/3)return p+(q-p)*(2/3-t)*6;return p};d[i]=Math.round(h2r(p,q,h+1/3)*255);d[i+1]=Math.round(h2r(p,q,h)*255);d[i+2]=Math.round(h2r(p,q,h-1/3)*255)}break}
case'levels':{var ib=parseInt(document.getElementById('dib').value)||0;var iw=parseInt(document.getElementById('diw').value)||255;var ga=parseFloat(document.getElementById('dga').value)||1;var ob=parseInt(document.getElementById('dob').value)||0;var ow=parseInt(document.getElementById('dow').value)||255;var ir=iw-ib;var or2=ow-ob;for(var i=0;i<d.length;i+=4){for(var c=0;c<3;c++){var v=(d[i+c]-ib)/ir;v=Math.max(0,Math.min(1,v));v=Math.pow(v,1/ga);v=ob+v*or2;d[i+c]=Math.max(0,Math.min(255,v))}}break}
case'posterize':{var lv=parseInt(document.getElementById('dlv').value)||4;var st=255/(lv-1);for(var i=0;i<d.length;i+=4){for(var c=0;c<3;c++){d[i+c]=Math.round(Math.round(d[i+c]/st)*st)}}break}
case'threshold':{var th=parseInt(document.getElementById('dth').value)||128;for(var i=0;i<d.length;i+=4){var g=0.299*d[i]+0.587*d[i+1]+0.114*d[i+2];var v=g>=th?255:0;d[i]=v;d[i+1]=v;d[i+2]=v}break}
case'noise':{var am=parseInt(document.getElementById('dno').value)||25;for(var i=0;i<d.length;i+=4){for(var c=0;c<3;c++){d[i+c]=Math.max(0,Math.min(255,d[i+c]+(Math.random()-0.5)*am)}}break}
case'pixelate':{var sz=parseInt(document.getElementById('dpz').value)||8;for(var y=0;y<img.height;y+=sz){for(var xx=0;xx<img.width;xx+=sz){var i=(y*img.width+xx)*4;var r=d[i],g=d[i+1],b=d[i+2],a=d[i+3];for(var dy=0;dy<sz&&y+dy<img.height;dy++){for(var dx=0;dx<sz&&xx+dx<img.width;dx++){var p=((y+dy)*img.width+(xx+dx))*4;d[p]=r;d[p+1]=g;d[p+2]=b;d[p+3]=a}}}break}
case'color-balance':{var cr=parseInt(document.getElementById('dcr').value)||0;var mg=parseInt(document.getElementById('dmg').value)||0;var yb=parseInt(document.getElementById('dyb').value)||0;for(var i=0;i<d.length;i+=4){d[i]=Math.max(0,Math.min(255,d[i]+cr));d[i+1]=Math.max(0,Math.min(255,d[i+1]+mg));d[i+2]=Math.max(0,Math.min(255,d[i+2]+yb))}break}
}
x.putImageData(new ImageData(new Uint8ClampedArray(d),img.width,img.height),0,0);
A.hideModal();C.render();L.thumb(l);
};

Fl.applyAdj=function(type){
switch(type){case'levels':Fl.dlg('levels');break;case'curves':Fl.dlg('curves');break;case'brightness':Fl.dlg('brightness');break;case'huesat':Fl.dlg('hue-sat');break;case'colorbalance':Fl.dlg('color-balance');break;case'invert':Fl.quick('invert');break;case'desaturate':Fl.quick('desaturate');break;case'threshold':Fl.dlg('threshold');break;case'posterize':Fl.dlg('posterize');break}
};

window.Fl=Fl;
