const $=id=>document.getElementById(id),canvas=$('stage'),ctx=canvas.getContext('2d'),W=canvas.width,H=canvas.height;
let step=0,approved=[false,false,false];let clips=[],pictures=[],scenePictures=[[],[],[]],urls=[],segmenter=null,mask=null,ready=false,playing=false,recorder=null,audioCtx=null,activeVideo=null,raf=0;
function status(s,p){$('status').textContent=s;if(p!==undefined)$('progress').value=p}
function cleanup(){playing=false;cancelAnimationFrame(raf);if(activeVideo){activeVideo.pause();activeVideo=null}if(audioCtx){audioCtx.close().catch(()=>{});audioCtx=null}}
function drawCover(image,x,y,w,h){const iw=image.videoWidth||image.naturalWidth,ih=image.videoHeight||image.naturalHeight;if(!iw||!ih)return;const k=Math.max(w/iw,h/ih),sw=w/k,sh=h/k,sx=(iw-sw)/2,sy=(ih-sh)/2;ctx.drawImage(image,sx,sy,sw,sh,x,y,w,h)}
function backdrop(t){const mode=$('fallback').value,colors=mode==='purple'?['#081b0b','#247b36']:mode==='dark'?['#090d0a','#182c1d']:['#06160b','#16833a'];const g=ctx.createLinearGradient(0,0,W,H);g.addColorStop(0,colors[0]);g.addColorStop(1,colors[1]);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);for(let i=0;i<8;i++){ctx.strokeStyle='rgba(255,255,255,.09)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(W/2,H/2,90+i*70+t*3,0,Math.PI*2);ctx.stroke()}}
const sceneStyles=['historic','numbers','legends'];let activeStyle='historic';const personCanvas=document.createElement('canvas'),personCtx=personCanvas.getContext('2d');
function selectedStyle(){return step===3?activeStyle:(document.querySelector('input[name="style"]:checked')?.value||'historic')}
function ellipse(x,y,rx,ry,color){ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill()}
function ball(x,y,r,rotation=0){ctx.save();ctx.translate(x,y);ctx.rotate(rotation);ctx.fillStyle='#f5f5f0';ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#252a26';ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='#202622';const poly=(cx,cy,rad,n=5)=>{ctx.beginPath();for(let i=0;i<n;i++){const a=-Math.PI/2+i*2*Math.PI/n;i?ctx.lineTo(cx+rad*Math.cos(a),cy+rad*Math.sin(a)):ctx.moveTo(cx+rad*Math.cos(a),cy+rad*Math.sin(a))}ctx.closePath();ctx.fill()};poly(0,0,r*.34);for(let i=0;i<5;i++){const a=i*2*Math.PI/5-Math.PI/2;poly(Math.cos(a)*r*.77,Math.sin(a)*r*.77,r*.19);ctx.beginPath();ctx.moveTo(Math.cos(a)*r*.32,Math.sin(a)*r*.32);ctx.lineTo(Math.cos(a)*r*.58,Math.sin(a)*r*.58);ctx.stroke()}ctx.restore()}
function labelText(text,x,y,size=32,color='#fff',align='left'){ctx.textAlign=align;ctx.fillStyle=color;ctx.font='900 '+size+'px system-ui';ctx.fillText(text,x,y)}
function recordData(scene){return {number:($('recordNumber')?.value||'').trim().slice(0,16),name:($('recordName')?.value||'').trim().slice(0,44)}}
function footballBackground(t,mode,scene){const g=ctx.createLinearGradient(0,0,0,H);if(mode==='historic'){g.addColorStop(0,'#020a0b');g.addColorStop(.52,'#122c25');g.addColorStop(1,'#164d2b')}else if(mode==='numbers'){g.addColorStop(0,'#070c0b');g.addColorStop(.6,'#111b16');g.addColorStop(1,'#07100d')}else{g.addColorStop(0,'#10100e');g.addColorStop(.6,'#262016');g.addColorStop(1,'#0c1410')}ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
if(mode==='historic'){ctx.fillStyle='#0b1b14';ctx.fillRect(0,260,W,330);for(let r=0;r<9;r++)for(let c=0;c<36;c++){ctx.fillStyle=(r+c)%7===0?'rgba(255,235,160,.35)':'rgba(180,226,192,.12)';ctx.fillRect(c*16,285+r*27,5,3)}for(const x of [80,460]){const light=ctx.createRadialGradient(x,180,2,x,180,260);light.addColorStop(0,'rgba(255,247,199,.45)');light.addColorStop(1,'rgba(255,247,199,0)');ctx.fillStyle=light;ctx.fillRect(0,0,W,550)}ctx.fillStyle='#1d6434';ctx.beginPath();ctx.moveTo(0,H);ctx.lineTo(W,H);ctx.lineTo(410,650);ctx.lineTo(130,650);ctx.fill();ctx.strokeStyle='rgba(235,250,223,.3)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(130,650);ctx.lineTo(410,650);ctx.moveTo(0,835);ctx.lineTo(W,835);ctx.stroke();labelText('HISTORIA DEL FÚTBOL',270,170,25,'#e2c88a','center');labelText('RÉCORD MUNDIAL',270,245,39,'#fff','center')}
else if(mode==='numbers'){ctx.fillStyle='#0b2519';ctx.fillRect(30,145,480,470);ctx.strokeStyle='#27b65d';ctx.lineWidth=5;ctx.strokeRect(30,145,480,470);ctx.fillStyle='#b82732';ctx.fillRect(30,145,480,12);labelText('EL DATO IMPOSIBLE',270,210,30,'#e6f7e8','center');for(let i=0;i<9;i++){ctx.fillStyle=i%3?'#155d36':'#c82b35';ctx.fillRect(45+i*51,530-(Math.sin(i*1.4+t*.6)+1)*55,27,130)}ctx.fillStyle='#07110d';ctx.fillRect(0,635,W,325);labelText('11 RÉCORDS',270,695,35,'#30c96b','center')}
else{for(let i=0;i<6;i++){const x=85+i*75;const glow=ctx.createRadialGradient(x,170,0,x,170,100);glow.addColorStop(0,'rgba(255,221,140,.22)');glow.addColorStop(1,'rgba(255,221,140,0)');ctx.fillStyle=glow;ctx.fillRect(x-100,70,200,200)}ctx.fillStyle='#1b2118';ctx.fillRect(225,275,255,310);ctx.strokeStyle='#b9a06a';ctx.lineWidth=7;ctx.strokeRect(225,275,255,310);ctx.fillStyle='#b9a06a';ctx.beginPath();ctx.moveTo(315,345);ctx.lineTo(375,345);ctx.lineTo(397,415);ctx.lineTo(375,460);ctx.lineTo(315,460);ctx.lineTo(293,415);ctx.closePath();ctx.fill();ctx.fillRect(325,460,40,45);ctx.fillRect(285,505,120,14);labelText('SALÓN DE LEYENDAS',270,175,29,'#eddbb3','center');ctx.fillStyle='#0c120d';ctx.fillRect(0,735,W,225)}
const d=recordData(scene);if(d.number){ctx.save();ctx.shadowColor=mode==='legends'?'#d9a847':'#16b956';ctx.shadowBlur=18;labelText(d.number,mode==='numbers'?270:mode==='historic'?340:mode==='legends'?350:270,mode==='numbers'?365:mode==='historic'?345:355,mode==='numbers'?145:95,mode==='legends'?'#e9cc83':'#f9fff6','center');ctx.restore()}if(d.name){labelText(d.name.toUpperCase(),mode==='historic'?365:270,mode==='numbers'?445:mode==='historic'?415:425,Math.max(18,Math.min(31,780/d.name.length)),'#f3f8ee','center')}}
// 11 Récords: proportional, orientation-independent layout engine (540 x 960).
// All important content is kept inside a conservative shared safe region.
const SAFE={left:58,top:140,right:445,bottom:645};
function imageInfo(image){const w=image.naturalWidth||image.videoWidth||1,h=image.naturalHeight||image.videoHeight||1;return{w,h,ratio:w/h}}
function fitRect(image,box){const {w,h}=imageInfo(image),k=Math.min(box.w/w,box.h/h),rw=w*k,rh=h*k;return{x:box.x+(box.w-rw)/2,y:box.y+(box.h-rh)/2,w:rw,h:rh}}
function drawContained(image,box){const r=fitRect(image,box);ctx.drawImage(image,r.x,r.y,r.w,r.h);return r}
// Content-aware composition: face detector where available, otherwise image-detail heuristic.
// Full source image is always visible; important subjects are never cropped by default.
const imageProfiles=new WeakMap();
async function analyzePhoto(img){const {w,h,ratio}=imageInfo(img);const profile={ratio,faces:[],detailX:.5,kind:ratio>2.1?'panorama':ratio>1.25?'landscape':ratio<.7?'portrait':'square'};
try{if('FaceDetector'in window){const fd=new FaceDetector({fastMode:true,maxDetectedFaces:12});const faces=await fd.detect(img);profile.faces=faces.map(f=>({x:(f.boundingBox.x+f.boundingBox.width/2)/w,y:(f.boundingBox.y+f.boundingBox.height/2)/h}));if(profile.faces.length>1)profile.kind='group';else if(profile.faces.length===1)profile.kind='portrait-face';}}catch(e){console.warn('Detección de rostros no disponible',e)}
try{const c=document.createElement('canvas');c.width=72;c.height=72;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(img,0,0,72,72);const d=x.getImageData(0,0,72,72).data;let left=0,right=0;for(let y=4;y<68;y+=2)for(let xx=4;xx<68;xx+=2){const p=(y*72+xx)*4,q=(y*72+xx+2)*4;const v=Math.abs(d[p]-d[q])+Math.abs(d[p+1]-d[q+1])+Math.abs(d[p+2]-d[q+2]);if(xx<36)left+=v;else right+=v}profile.detailX=left+right?right/(left+right):.5}catch(e){}
imageProfiles.set(img,profile);return profile}
function profileFor(img){return imageProfiles.get(img)||{ratio:imageInfo(img).ratio,faces:[],detailX:.5,kind:'unknown'}}
function intersects(a,b){return Math.max(0,Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x))*Math.max(0,Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y))}
// Photo layouts preserve the three original visual themes.
const sceneLayouts=['auto','auto','auto'];
function layoutFor(video,img,mode,scene=0){
const R={x:SAFE.left,y:SAFE.top,w:SAFE.right-SAFE.left,h:SAFE.bottom-SAFE.top};
const ratio=img?imageInfo(img).ratio:1,wide=ratio>1.28,tall=ratio<.76;
const choices=img?[
{id:'editorial',photo:{x:66,y:218,w:370,h:wide?225:278},speaker:{x:66,y:468,w:205,h:173},tag:{x:278,y:530,w:156,h:98}},
{id:'overlay',photo:{x:65,y:212,w:372,h:340},speaker:{x:65,y:365,w:192,h:270},tag:{x:267,y:555,w:167,h:77}},
{id:'split',photo:{x:238,y:215,w:195,h:325},speaker:{x:65,y:285,w:165,h:300},tag:{x:235,y:555,w:197,h:78}},
{id:'right',photo:{x:65,y:215,w:235,h:320},speaker:{x:295,y:305,w:140,h:265},tag:{x:65,y:548,w:218,h:84}},
{id:'cinema',photo:{x:65,y:217,w:370,h:wide?240:300},speaker:{x:275,y:425,w:158,h:205},tag:{x:67,y:550,w:194,h:81}}
]:[{id:'solo',photo:null,speaker:{x:82,y:300,w:255,h:330},tag:{x:275,y:545,w:155,h:84}}];
const requested=$('layoutMode')?.value||'auto';
let best=choices[0];
if(requested!=='auto'){best=choices.find(c=>c.id===requested)||best}
else if(img){
const profile=profileFor(img);
if(mode==='numbers')best=choices[2];
else if(mode==='legends')best=choices[4];
else if(tall)best=choices[2];
else if(profile.faces.length>1)best=choices[0];
else if(wide)best=choices[1];
else best=choices[0];
}
const box=best.speaker,factor=Math.max(.65,Math.min(1.45,Number($('scale').value)/65));
return{photo:best.photo,person:{x:box.x,y:box.y,w:Math.min(box.w*factor,R.w),h:Math.min(box.h*factor,R.h)},tag:best.tag,profile:img?profileFor(img):null,id:best.id}}
function composition(video,scene,mode,img){return layoutFor(video,img||null,mode,scene)}
function roundedPanel(x,y,w,h,color){ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(x,y,w,h,12);ctx.fill()}
function drawRecordTag(scene,layout,mode){const d=recordData(scene),r=layout.tag;
if(!d.number&&!d.name)return;
roundedPanel(r.x,r.y,r.w,r.h,'rgba(4,17,11,.92)');
ctx.save();ctx.beginPath();ctx.rect(r.x+8,r.y+5,r.w-16,r.h-10);ctx.clip();
if(d.number){let sz=Math.min(43,Math.floor((r.w-18)/Math.max(1,d.number.length*.64)));labelText(d.number,r.x+r.w/2,r.y+Math.min(48,r.h*.58),sz,mode==='legends'?'#efd19a':'#f5fff7','center')}
if(d.name){let sz=Math.min(19,Math.floor((r.w-16)/Math.max(1,d.name.length*.6)));labelText(d.name.toUpperCase(),r.x+r.w/2,r.y+r.h-13,sz,'#b9e6c5','center')}
ctx.restore()}
function alphaBounds(maskImage){if(!maskImage||!maskImage.width)return null;const w=maskImage.width,h=maskImage.height;
const scan=document.createElement('canvas');scan.width=96;scan.height=96;const c=scan.getContext('2d',{willReadFrequently:true});c.drawImage(maskImage,0,0,96,96);const d=c.getImageData(0,0,96,96).data;let minX=96,minY=96,maxX=0,maxY=0,n=0;
for(let y=0;y<96;y+=2)for(let x=0;x<96;x+=2){const i=(y*96+x)*4;if(d[i+3]>100&&Math.max(d[i],d[i+1],d[i+2])>80){minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);n++}}
if(n<40)return null;return{x:Math.max(0,minX/96-.03),y:Math.max(0,minY/96-.03),w:Math.min(1,(maxX-minX)/96+.06),h:Math.min(1,(maxY-minY)/96+.06)}}
function drawPresenter(video,scene,mode,layout){
const p=layout.person;
if(!mask||!mask.width){const r=fitRect(video,p);ctx.save();ctx.fillStyle='rgba(8,26,15,.9)';ctx.fillRect(p.x-2,p.y-2,p.w+4,p.h+4);ctx.drawImage(video,r.x,r.y,r.w,r.h);ctx.restore();return}
const mw=mask.width,mh=mask.height;
if(personCanvas.width!==mw||personCanvas.height!==mh){personCanvas.width=mw;personCanvas.height=mh}
personCtx.clearRect(0,0,mw,mh);personCtx.globalCompositeOperation='source-over';
personCtx.drawImage(mask,0,0,mw,mh);personCtx.globalCompositeOperation='source-in';
personCtx.drawImage(video,0,0,mw,mh);personCtx.globalCompositeOperation='source-over';
const bounds=alphaBounds(mask)||{x:0,y:0,w:1,h:1};
const sx=bounds.x*mw,sy=bounds.y*mh,sw=bounds.w*mw,sh=bounds.h*mh;
const k=Math.min(p.w/sw,p.h/sh),dw=sw*k,dh=sh*k;
const position=$('position').value;
let x=p.x+(p.w-dw)/2;if(position==='right')x=p.x+p.w-dw;else if(position==='left')x=p.x;
const y=p.y+p.h-dh;
ctx.save();ctx.shadowColor='rgba(0,0,0,.7)';ctx.shadowBlur=14;
ctx.drawImage(personCanvas,sx,sy,sw,sh,x,y,dw,dh);ctx.restore()}
function drawScene(video,scene,t,mode=sceneStyles[scene]||selectedStyle()){
ctx.clearRect(0,0,W,H);
const imgs=scenePictures[scene]||[],img=imgs.length?imgs[Math.floor(t/3)%imgs.length]:null;
if(img){
const g=ctx.createLinearGradient(0,0,W,H);
if(mode==='historic'){g.addColorStop(0,'#061b15');g.addColorStop(1,'#164a2b')}
else if(mode==='numbers'){g.addColorStop(0,'#080e0d');g.addColorStop(1,'#112d20')}
else{g.addColorStop(0,'#16130d');g.addColorStop(1,'#4c3520')}
ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
ctx.fillStyle=mode==='legends'?'#e6c584':'#c9f6d8';
labelText(mode==='historic'?'RÉCORD HISTÓRICO':mode==='numbers'?'EL RÉCORD EN CIFRAS':'LEYENDAS DEL FÚTBOL',SAFE.left+8,SAFE.top+29,23,mode==='legends'?'#e6c584':'#d5f3dc');
ctx.fillStyle=mode==='legends'?'#c8a468':mode==='numbers'?'#d82f43':'#23c56c';ctx.fillRect(SAFE.left+8,SAFE.top+40,116,5);
}else footballBackground(t,mode,scene);
const layout=composition(video,scene,mode,img);
if(img){const slot=layout.photo;roundedPanel(slot.x-5,slot.y-5,slot.w+10,slot.h+10,mode==='legends'?'#51402a':'#10271b');ctx.save();ctx.strokeStyle=mode==='legends'?'#c9aa70':mode==='numbers'?'#d94b55':'#4dbb75';ctx.lineWidth=3;ctx.strokeRect(slot.x-5,slot.y-5,slot.w+10,slot.h+10);drawContained(img,slot);ctx.restore()}
drawRecordTag(scene,layout,mode);
if(scene===2&&!recordData(scene).number&&!img)labelText('¿QUIÉN LO SUPERARÁ?',270,250,24,'#e7efdf','center');
drawPresenter(video,scene,mode,layout);
ctx.fillStyle='#121d15';ctx.fillRect(0,H-23,W,23);ctx.fillStyle='#18b852';ctx.fillRect(0,H-23,W*.82,7);ctx.fillStyle='#e32834';ctx.fillRect(W*.82,H-23,W*.18,7)}
async function loadMedia(file){return new Promise((resolve,reject)=>{const url=URL.createObjectURL(file);urls.push(url);const v=document.createElement('video');v.src=url;v.preload='auto';v.playsInline=true;v.muted=true;v.onloadedmetadata=()=>{if(!Number.isFinite(v.duration)||v.duration<=0||v.duration>120)reject(Error('Cada video debe durar entre 1 segundo y 2 minutos.'));else resolve(v)};v.onerror=()=>reject(Error('No se pudo leer '+file.name));setTimeout(()=>reject(Error('No se pudo cargar el video.')),20000)})}
async function initSegmenter(){if(!window.SelfieSegmentation)throw Error('No se pudo descargar el modelo de recorte. Comprueba tu conexión.');segmenter=new SelfieSegmentation({locateFile:file=>'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation@0.1/'+file});segmenter.setOptions({modelSelection:0,selfieMode:false});segmenter.onResults(r=>{mask=r.segmentationMask});}
function updateSafe(){const layer=$('safeOverlay');if(layer)layer.hidden=!$('showSafe').checked}function screen(name){for(const id of ['uploadScreen','styleScreen','reviewScreen','finalScreen'])$(id).hidden=id!==name;window.scrollTo(0,0)}
const labels=['Gancho','Contenido','Pregunta'];let loaded=[false,false,false];
let preparationToken=0,segmentBusy=false,segmentationUnavailable=false;
function bounded(promise,ms,label){return Promise.race([promise,new Promise((_,reject)=>setTimeout(()=>reject(Error(label)),ms))])}
async function firstFrame(v){if(v.readyState>=2&&v.videoWidth)return;v.load();await bounded(new Promise((resolve,reject)=>{const done=()=>{v.removeEventListener('loadeddata',done);v.removeEventListener('canplay',done);v.removeEventListener('error',fail);resolve()};const fail=()=>{v.removeEventListener('loadeddata',done);v.removeEventListener('canplay',done);v.removeEventListener('error',fail);reject(Error('No se puede decodificar el video'))};v.addEventListener('loadeddata',done);v.addEventListener('canplay',done);v.addEventListener('error',fail);if(v.readyState>=2&&v.videoWidth)done()}),9000,'El video no entregó su primer fotograma')}
async function trySegmentation(v,timeout=7000){if(segmentationUnavailable||!segmenter)return false;try{await bounded(segmenter.send({image:v}),timeout,'El recorte tardó demasiado');return !!mask}catch(e){segmentationUnavailable=true;console.warn('Recorte deshabilitado para esta sesión:',e);return false}}
async function prepareScene(){const token=++preparationToken;cleanup();ready=false;mask=null;$('play').disabled=true;$('approve').disabled=true;sceneStyles[step]=selectedStyle();const scene=step,v=clips[scene];status('Cargando vista previa...',10);try{await firstFrame(v);if(token!==preparationToken)return;drawScene(v,scene,0,sceneStyles[scene]);ready=true;$('play').disabled=false;$('approve').disabled=false;status('Vista previa lista. Preparando eliminación de fondo...',55);if(!segmenter&&!segmentationUnavailable){try{await bounded(initSegmenter(),7000,'Modelo no disponible')}catch(e){segmentationUnavailable=true;console.warn(e)}}if(token!==preparationToken)return;const ok=await trySegmentation(v,6500);if(token!==preparationToken)return;drawScene(v,scene,0,sceneStyles[scene]);status(ok?'Recorte listo. Puedes revisar.':'Video disponible sin recorte. Puedes revisar o intentar de nuevo.',100)}catch(e){if(token!==preparationToken)return;status('No se pudo mostrar el video: '+e.message,0);$('play').disabled=true;$('approve').disabled=true}}
async function receiveFile(i){const file=$(['hook','body','cta'][i]).files[0];if(!file)return;ready=false;try{clips[i]=await loadMedia(file);loaded[i]=true;step=i;showStage('style')}catch(e){alert(e.message)}}
function showStage(stage){preparationToken++;cleanup();ready=false;mask=null;if(stage==='upload'){screen('uploadScreen');$('stepTitle').textContent=(step+1)+'. '+labels[step];for(let i=0;i<3;i++)$(['hookBox','bodyBox','ctaBox'][i]).hidden=i!==step;$('backUpload').hidden=step===0}else if(stage==='style'){$('styleStepLabel').textContent=labels[step];const chosen=sceneStyles[step];document.querySelectorAll('input[name="style"]').forEach(el=>el.checked=el.value===chosen);$('imagesBox').hidden=false;screen('styleScreen')}else if(stage==='review'){$('reviewStepLabel').textContent=labels[step];screen('reviewScreen');updateSafe();prepareScene()}else{screen('finalScreen');ready=true}}
for(let i=0;i<3;i++)$(['hook','body','cta'][i]).addEventListener('change',()=>receiveFile(i));
$('backUpload').onclick=()=>{if(step>0){step--;showStage('review')}};
$('backStyle').onclick=()=>showStage('upload');
$('nextStyle').onclick=async()=>{try{const files=[...$('images').files];if(files.length){scenePictures[step]=await Promise.all(files.map(file=>new Promise((resolve,reject)=>{const img=new Image(),u=URL.createObjectURL(file);urls.push(u);img.onload=()=>resolve(img);img.onerror=()=>reject(Error('No se pudo abrir '+file.name));img.src=u})));await Promise.all(scenePictures[step].map(analyzePhoto));}showStage('review')}catch(e){alert('No se pudieron procesar las imágenes: '+e.message);$('nextStyle').disabled=false}};
$('backReview').onclick=()=>showStage('style');
$('prepare').onclick=prepareScene;$('showSafe').onchange=updateSafe;$('scale').oninput=()=>{if(ready&&!playing&&step<3)drawScene(clips[step],step,0,sceneStyles[step])};$('position').onchange=()=>{if(ready&&!playing&&step<3)drawScene(clips[step],step,0,sceneStyles[step])};
$('approve').onclick=()=>{if(!ready)return;approved[step]=true;if(step===2){step=3;showStage('final')}else{step++;showStage('upload')}};
$('back').onclick=()=>{step=2;showStage('review')};
$('finalPlay').onclick=()=>{step=3;ready=true;screen('reviewScreen');$('reviewStepLabel').textContent='Video completo';$('approve').disabled=true;run(false)};
function waitEnd(video){return new Promise(resolve=>{let done=false;const finish=()=>{if(done)return;done=true;video.removeEventListener('ended',finish);resolve()};video.addEventListener('ended',finish);if(!playing)finish();const check=()=>{if(!playing)finish();else if(!video.ended)setTimeout(check,120)};check()})}
async function run(exporting){if(!ready||playing)return;playing=true;$('play').disabled=true;$('export').disabled=true;$('stop').disabled=false;mask=null;let chunks=[],stream=null,mixed=null;try{if(exporting){if(!window.MediaRecorder||!canvas.captureStream)throw Error('Este navegador no admite exportación.');const type=['video/webm;codecs=vp8,opus','video/webm'].find(t=>MediaRecorder.isTypeSupported(t));if(!type)throw Error('Formato WebM no disponible.');stream=canvas.captureStream(24);audioCtx=new AudioContext();const dest=audioCtx.createMediaStreamDestination();for(const v of clips){v.muted=false;v.volume=1;const source=audioCtx.createMediaElementSource(v);source.connect(dest)}mixed=new MediaStream([...stream.getVideoTracks(),...dest.stream.getAudioTracks()]);recorder=new MediaRecorder(mixed,{mimeType:type,videoBitsPerSecond:3500000});recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};recorder.start(1000)}
const total=(exporting||step===3?clips:[clips[step]]).reduce((s,v)=>s+v.duration,0);let elapsed=0;for(let scene=(exporting||step===3?0:step);scene<(exporting||step===3?3:step+1)&&playing;scene++){const v=clips[scene];mask=null;v.currentTime=0;activeVideo=v;v.muted=!exporting;await v.play();let processing=false;const render=async()=>{if(!playing||v.paused||v.ended)return;const t=v.currentTime;drawScene(v,scene,t,sceneStyles[scene]);if(!processing&&segmenter&&!segmentationUnavailable){processing=true;try{await trySegmentation(v,5000)}finally{processing=false}}status((exporting?'Exportando':'Reproduciendo')+' · '+['Gancho','Contenido','Pregunta'][scene],Math.min(99,Math.round((elapsed+t)/total*100)));raf=requestAnimationFrame(render)};raf=requestAnimationFrame(render);await waitEnd(v);v.pause();cancelAnimationFrame(raf);elapsed+=v.duration}if(exporting&&recorder&&recorder.state!=='inactive'){await new Promise(resolve=>{recorder.onstop=resolve;recorder.stop()});if(chunks.length){const blob=new Blob(chunks,{type:'video/webm'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='videoshort-studio.webm';a.click();setTimeout(()=>URL.revokeObjectURL(url),30000)}}status(playing?'Proceso finalizado.':'Proceso detenido.',playing?100:0)}catch(e){status('Error: '+e.message,0)}finally{if(recorder&&recorder.state!=='inactive')recorder.stop();if(mixed)mixed.getTracks().forEach(t=>t.stop());if(stream)stream.getTracks().forEach(t=>t.stop());cleanup();$('play').disabled=!ready;$('export').disabled=false;$('stop').disabled=true;recorder=null}}
$('play').onclick=()=>run(false);$('export').onclick=()=>{step=3;ready=true;run(true)};$('stop').onclick=()=>{playing=false;if(activeVideo)activeVideo.pause();status('Deteniendo...',0)};showStage('upload');
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(console.warn));
