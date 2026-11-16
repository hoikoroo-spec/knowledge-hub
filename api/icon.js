const zlib=require('zlib');
function crc(b){let c=0xffffffff;for(const v of b){c^=v;for(let k=0;k<8;k++)c=(c>>>1)^((c&1)?0xedb88320:0)}return(c^0xffffffff)>>>0}
function chunk(t,d){const n=Buffer.alloc(4);n.writeUInt32BE(d.length);const v=Buffer.concat([Buffer.from(t),d]);const tail=Buffer.alloc(4);tail.writeUInt32BE(crc(v));return Buffer.concat([n,v,tail])}
function png(){const w=180,h=180,p=Buffer.alloc((w*4+1)*h);function dot(x,y,r,g,b,a=255){x=Math.round(x);y=Math.round(y);if(x<0||x>=w||y<0||y>=h)return;let i=y*(w*4+1)+1+x*4;p[i]=r;p[i+1]=g;p[i+2]=b;p[i+3]=a}
for(let y=0;y<h;y++){for(let x=0;x<w;x++){let t=y/180;dot(x,y,Math.round(29-19*t),Math.round(45-23*t),Math.round(112-53*t))}}
function line(x1,y1,x2,y2,width,color){let n=Math.ceil(Math.hypot(x2-x1,y2-y1)*2);for(let k=0;k<=n;k++){let x=x1+(x2-x1)*k/n,y=y1+(y2-y1)*k/n;for(let dy=-width;dy<=width;dy++)for(let dx=-width;dx<=width;dx++)if(dx*dx+dy*dy<=width*width)dot(x+dx,y+dy,...color)}}
for(let k=0;k<420;k++){let a=k/420*Math.PI*2,x=90+67*Math.cos(a),y=83+34*Math.sin(a),ang=-.42;line(90+(x-90)*Math.cos(ang)-(y-83)*Math.sin(ang),83+(x-90)*Math.sin(ang)+(y-83)*Math.cos(ang),90+(x-90)*Math.cos(ang)-(y-83)*Math.sin(ang),83+(x-90)*Math.sin(ang)+(y-83)*Math.cos(ang),2,[105,123,255])}
const white=[250,250,255];line(43,56,43,113,5,white);line(43,86,70,56,5,white);line(44,86,73,113,5,white);line(94,56,94,113,5,white);line(134,56,134,113,5,white);line(95,85,133,85,5,white);
for(let y=0;y<25;y++){let f=y/25;line(90,137+y*.62,47,129+y*.48,1,[242,242,255]);line(90,137+y*.62,133,129+y*.48,1,[242,242,255])}line(90,137,90,154,2,[112,120,255]);
for(let y=-12;y<=12;y++)for(let x=-12;x<=12;x++)if(Math.abs(x)+Math.abs(y)*1.15<12)dot(143+x,42+y,255,244,211);
const ih=Buffer.alloc(13);ih.writeUInt32BE(w,0);ih.writeUInt32BE(h,4);ih[8]=8;ih[9]=6;return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ih),chunk('IDAT',zlib.deflateSync(p)),chunk('IEND',Buffer.alloc(0))])}
module.exports=(req,res)=>{res.setHeader('Content-Type','image/png');res.setHeader('Cache-Control','public, max-age=3600');res.status(200).send(png())};