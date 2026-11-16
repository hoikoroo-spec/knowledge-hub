const zlib=require('zlib');
function crc(b){let c=0xffffffff;for(const v of b){c^=v;for(let k=0;k<8;k++)c=(c>>>1)^((c&1)?0xedb88320:0)}return(c^0xffffffff)>>>0}
function chunk(t,d){const n=Buffer.alloc(4);n.writeUInt32BE(d.length);const v=Buffer.concat([Buffer.from(t),d]);const tail=Buffer.alloc(4);tail.writeUInt32BE(crc(v));return Buffer.concat([n,v,tail])}
function png(){const w=180,h=180,p=Buffer.alloc((w*4+1)*h);
function dot(x,y,v=255){x=Math.round(x);y=Math.round(y);if(x<0||x>=w||y<0||y>=h)return;const i=y*(w*4+1)+1+x*4;p[i]=v;p[i+1]=v;p[i+2]=v;p[i+3]=255}
for(let y=0;y<h;y++)for(let x=0;x<w;x++)dot(x,y,0);
function line(x1,y1,x2,y2,r=3){const n=Math.max(1,Math.ceil(Math.hypot(x2-x1,y2-y1)*3));for(let k=0;k<=n;k++){const x=x1+(x2-x1)*k/n,y=y1+(y2-y1)*k/n;for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++)if(dx*dx+dy*dy<=r*r)dot(x+dx,y+dy)}}
function path(pts,r=3){for(let i=1;i<pts.length;i++)line(...pts[i-1],...pts[i],r)}
const bulb=[];for(let i=0;i<=65;i++){const t=Math.PI+(Math.PI*2)*i/65;const x=90+37*Math.cos(t),y=64+37*Math.sin(t);if(y<=92)bulb.push([x,y])}path(bulb,4);
line(59,86,69,101,4);line(121,86,111,101,4);line(69,101,111,101,4);line(72,112,108,112,4);line(78,123,102,123,4);
path([[79,54],[74,47],[67,50],[67,58],[61,62],[65,70],[62,77],[70,83],[78,79],[83,86],[89,81],[89,48],[84,44],[79,48],[79,54]],3);
line(100,51,100,83,4);line(142,55,151,50,4);line(143,71,154,71,4);line(142,87,151,93,4);
const letters={H:['10001','10001','10001','11111','10001','10001','10001'],u:['00000','00000','10001','10001','10001','10011','01101'],b:['10000','10000','10110','11001','10001','11001','10110']};
let x0=38;for(const [ch,width] of [['H',36],['u',32],['b',32]]){const grid=letters[ch],step=5.3;for(let y=0;y<7;y++)for(let x=0;x<5;x++)if(grid[y][x]==='1')for(let dy=0;dy<5;dy++)for(let dx=0;dx<5;dx++)dot(x0+x*step+dx,139+y*step+dy);x0+=width}
const ih=Buffer.alloc(13);ih.writeUInt32BE(w,0);ih.writeUInt32BE(h,4);ih[8]=8;ih[9]=6;return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ih),chunk('IDAT',zlib.deflateSync(p)),chunk('IEND',Buffer.alloc(0))])}
module.exports=(req,res)=>{res.setHeader('Content-Type','image/png');res.setHeader('Cache-Control','public,max-age=3600');res.status(200).send(png())};