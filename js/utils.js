var U={};
U.id=function(){return Math.random().toString(36).substr(2,9)};
U.hex=function(r,g,b){return'#'+[r,g,b].map(function(x){var h=x.toString(16);return h.length===1?'0'+h:h}).join('')};
U.rgb=function(hex){var r=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);return r?{r:parseInt(r[1],16),g:parseInt(r[2],16),b:parseInt(r[3],16)}:{r:0,g:0,b:0}};
U.clamp=function(v,a,b){return Math.max(a,Math.min(b,v))};
window.U=U;
