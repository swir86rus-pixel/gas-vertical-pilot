/* Движок сюжетных эпизодов «Газовая вертикаль».
   Эпизод подключает этот файл и вызывает Engine.run(cfg). */
(function(){
const INK='#2a211b';
const S=`stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;
const S2=`stroke="${INK}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"`;

/* ---------- стили и разметка ---------- */
document.head.insertAdjacentHTML('beforeend',`<style>
:root{--ink:${INK};--paper:#f3e6cc;--acc:#d0632a}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html,body{margin:0;height:100%;height:100dvh;overscroll-behavior:none;touch-action:manipulation;background:#1c1714;font-family:Georgia,'Times New Roman',serif;color:var(--ink);overflow:hidden;user-select:none}
#game{position:relative;width:100%;height:100%;max-width:1100px;margin:0 auto;overflow:hidden}
#world{position:absolute;left:0;bottom:0;height:100%;will-change:transform;filter:saturate(.72) sepia(.08) contrast(1.04)}
.layer{position:absolute;left:0;bottom:0;height:100%;width:100%}
svg{display:block}
#hud{position:absolute;top:10px;left:10px;right:10px;display:flex;justify-content:space-between;gap:8px;pointer-events:none;z-index:5}
.paper{background:var(--paper);border:3px solid var(--ink);border-radius:4px;box-shadow:4px 4px 0 #0005;padding:8px 12px}
#goal{font-size:15px;max-width:70%}#temp{font-size:15px;white-space:nowrap}
.bubble{position:absolute;transform:translate(-50%,-100%);background:#fff;border:3px solid var(--ink);border-radius:14px;padding:4px 10px;font-weight:bold;font-size:14px;z-index:4;pointer-events:none;animation:bob 1s ease-in-out infinite;white-space:nowrap}
@keyframes bob{50%{margin-top:-5px}}
#dlg{position:absolute;left:50%;bottom:90px;transform:translateX(-50%);width:min(92%,640px);z-index:8;display:none}
#dlg .who{font-weight:bold;color:var(--acc);margin-bottom:4px;font-size:15px}
#dlg .txt{font-size:17px;line-height:1.4}
#dlg .ch{display:flex;flex-direction:column;gap:6px;margin-top:10px}
#dlg button,.btn{font:inherit;font-size:15px;background:#fff;border:3px solid var(--ink);border-radius:6px;padding:8px 12px;text-align:left;cursor:pointer;box-shadow:3px 3px 0 #0004;color:var(--ink);text-decoration:none;display:inline-block}
#dlg button:hover,.btn:hover{background:#ffe9c7}
.next{font-size:13px;opacity:.7;margin-top:6px;text-align:right}
#pad{position:absolute;bottom:12px;left:0;right:0;display:flex;justify-content:space-between;padding:0 14px;z-index:6}
#pad button{width:64px;height:64px;border-radius:50%;border:3px solid var(--ink);background:var(--paper);font-size:26px;box-shadow:3px 3px 0 #0005;touch-action:none}
#pad .grp{display:flex;gap:12px}
#over{position:absolute;inset:0;background:#000a;display:none;align-items:center;justify-content:center;z-index:9;padding:16px}
#over>.paper{max-width:560px;width:100%;padding:18px;max-height:90%;overflow:auto}
#over h2{margin:0 0 8px}
.snowf{position:absolute;top:-10px;width:4px;height:4px;background:#fff;border-radius:50%;opacity:.8;z-index:3;pointer-events:none}
.rainf{position:absolute;top:-20px;width:2px;height:14px;background:#9fb6d9;opacity:.6;z-index:3;pointer-events:none}
.gauge{display:inline-block;margin:6px;text-align:center;vertical-align:top}
.meter{position:relative;height:34px;border:3px solid var(--ink);border-radius:6px;background:#fff;margin:14px 0;overflow:hidden}
.meter .zone{position:absolute;top:0;bottom:0;background:#8fd19e}
.meter .mark{position:absolute;top:-2px;bottom:-2px;width:6px;background:var(--ink);border-radius:2px}
.hits{font-size:22px;letter-spacing:4px}
/* мобильная вёрстка */
#hud{top:calc(10px + env(safe-area-inset-top))}
#pad{bottom:calc(12px + env(safe-area-inset-bottom));padding:0 calc(14px + env(safe-area-inset-right)) 0 calc(14px + env(safe-area-inset-left))}
@media (hover:hover) and (pointer:fine){#pad{opacity:.85}}
@media (max-height:460px){#goal,#temp{font-size:13px;padding:5px 8px}#pad button{width:54px;height:54px;font-size:22px}
 #dlg{bottom:calc(72px + env(safe-area-inset-bottom));max-height:60%;overflow:auto;padding:6px 10px}#dlg .txt{font-size:15px}#dlg button{font-size:14px;padding:6px 10px}}
/* портрет: сцена — полоса по центру, сверху задание, снизу кнопки и диалог */
@media (orientation:portrait) and (max-width:820px){
 #world{height:min(100%,105vw);bottom:auto;top:calc(50% - 52vw - 50px)}
 #goal{max-width:100%;font-size:14px}#hud{flex-direction:column;align-items:flex-start}
 #pad button{width:72px;height:72px;font-size:30px}
 #dlg{bottom:calc(100px + env(safe-area-inset-bottom));width:calc(100% - 20px)}}
</style>`);
document.body.innerHTML=`<div id="game">
 <div id="world"><svg class="layer" id="bg" viewBox="0 0 2600 600" preserveAspectRatio="xMinYMax slice"></svg>
 <svg class="layer" id="fg" viewBox="0 0 2600 600" preserveAspectRatio="xMinYMax slice"></svg></div>
 <div id="hud"><div class="paper" id="goal"></div><div class="paper" id="temp"></div></div>
 <div id="dlg" class="paper"><div class="who"></div><div class="txt"></div><div class="ch"></div><div class="next">нажмите, чтобы продолжить ▸</div></div>
 <div id="pad"><div class="grp"><button id="bl">◀</button><button id="br">▶</button></div><button id="bu">✋</button></div>
 <div id="over"><div class="paper"></div></div></div>`;
const $=id=>document.getElementById(id);
const bg=$('bg'),fg=$('fg'),W=$('world'),D=$('dlg'),GAME=$('game');

/* ---------- графические заготовки ---------- */
const G={
 flange:(x,y,h=26)=>`<rect x="${x-4}" y="${y-h/2}" width="8" height="${h}" rx="2" fill="#7d7a73" ${S2}/>`,
 wheel:(x,y,r,id,col)=>`<rect x="${x-2}" y="${y}" width="4" height="16" fill="#555"/><g ${id?`id="g${id}"`:''}>
  <circle ${id?`id="${id}"`:''} cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${col||'#c0392b'}" stroke-width="${r>10?6:4}"/>
  <circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${INK}" stroke-width="2"/>
  ${[0,60,120].map(a=>{const c=Math.cos(a*Math.PI/180)*r,s=Math.sin(a*Math.PI/180)*r;return `<path d="M${x-c} ${y-s} L${x+c} ${y+s}" stroke="${INK}" stroke-width="2.5"/>`}).join('')}
  <circle cx="${x}" cy="${y}" r="${Math.max(2,r/4)}" fill="#555" ${S2}/></g>`,
 gauge:(x,y,r=11,id)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" ${S2}/><path ${id?`id="${id}"`:''} d="M${x} ${y} l${r*0.55} ${-r*0.5}" stroke="#c0392b" stroke-width="2"/><circle cx="${x}" cy="${y}" r="2" fill="${INK}"/>`,
 ladder:(x,y1,y2)=>{let h=`<path d="M${x} ${y1} V${y2} M${x+18} ${y1} V${y2}" stroke="#555" stroke-width="3"/>`;for(let y=y1+10;y<y2;y+=14)h+=`<path d="M${x} ${y} h18" stroke="#555" stroke-width="2"/>`;return h},
 platform:(x,y,w)=>{let h=`<rect x="${x}" y="${y}" width="${w}" height="6" fill="#e2b93b" ${S2}/><path d="M${x} ${y-26} h${w}" stroke="#e2b93b" stroke-width="4"/>`;for(let i=0;i<=w;i+=w/4)h+=`<path d="M${x+i} ${y} v-26" stroke="#e2b93b" stroke-width="3"/>`;return h},
 snowcap:(x,y,w)=>`<path d="M${x-4} ${y+2} q${w/4} -10 ${w/2} -4 q${w/4} -8 ${w/2+8} 2 v4 h${-w-8}z" fill="#fff" ${S2}/>`,
 plate:(cx,cy,w,h,text,rot)=>`<rect x="${cx-w/2}" y="${cy-h/2}" width="${w}" height="${h}" rx="2" fill="#f3efe4" ${S2} ${rot?`transform="rotate(-90 ${cx} ${cy})"`:''}/>
  <text x="${cx}" y="${cy}" font-size="12" text-anchor="middle" dominant-baseline="central" font-weight="bold" data-w="${w-8}" data-h="${h-2}" ${rot?`transform="rotate(-90 ${cx} ${cy})"`:''}>${text}</text>`,
 vessel:(x,y,w,h,label,col)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${w/2}" fill="${col}" ${S}/>
  <rect x="${x+w*0.2}" y="${y+w/2}" width="6" height="${h-w}" fill="#fff" opacity=".35"/>
  ${G.plate(x+w/2,y+h/2,Math.min(116,h-w),30,label,true)}
  <path d="M${x+10} ${y+h} l-10 ${500-y-h} M${x+w-10} ${y+h} l10 ${500-y-h}" stroke="#555" stroke-width="5"/>`,
 building:(x,y,w,col,label,o={})=>`<g><rect x="${x}" y="${y}" width="${w}" height="${500-y}" fill="${col}" ${S}/>
  ${Array.from({length:Math.floor((500-y)/20)},(_,i)=>`<path d="M${x} ${y+18+i*20} H${x+w}" stroke="#0001" stroke-width="2"/>`).join('')}
  <rect x="${x-8}" y="${y-8}" width="${w+16}" height="14" fill="#8a7d70" ${S2}/>
  ${(o.windows||[]).map(([wx,wy,ww,wh])=>`<rect x="${x+wx}" y="${y+wy}" width="${ww}" height="${wh}" fill="#ffe7a3" ${S2}/><path d="M${x+wx+ww/2} ${y+wy} v${wh}" stroke="${INK}" stroke-width="1.5"/>`).join('')}
  ${o.door?`<rect x="${x+o.door}" y="${400}" width="46" height="100" fill="#7a5a3a" ${S}/><circle cx="${x+o.door+38}" cy="455" r="3" fill="#e2b93b"/>`:''}
  ${label?G.plate(x+w/2,y+26,Math.min(w-20,190),22,label):''}
  ${o.snow?G.snowcap(x-8,y-10,w+16):''}</g>`,
 pipe:(x1,x2,y=466,step=130)=>{let h='';for(let x=x1+40;x<x2;x+=step)h+=`<path d="M${x} 500 V${y+12} M${x-14} ${y+12} h28" stroke="#6b6660" stroke-width="5"/>`;
  h+=`<rect x="${x1}" y="${y-8}" width="${x2-x1}" height="16" fill="#9aa3a6" ${S2}/><rect x="${x1}" y="${y-5}" width="${x2-x1}" height="4" fill="#fff" opacity=".4"/>`;
  for(let x=x1+80;x<x2;x+=260)h+=G.flange(x,y);return h},
 tree:(x,s=1,col='#4f6b4a')=>`<g transform="translate(${x} 500) scale(${s})"><rect x="-4" y="-20" width="8" height="20" fill="#6b4a33"/><path d="M0 -130 L-28 -60 h14 L-36 -20 h72 L14 -60 h14z" fill="${col}" ${S2}/></g>`,
 sign:(x,text,col='#f2c230')=>`<g><rect x="${x-2}" y="410" width="5" height="90" fill="#555"/><path d="M${x} 360 l34 30 l-34 30 l-34 -30z" fill="${col}" ${S}/><text x="${x}" y="392" font-size="11" text-anchor="middle" dominant-baseline="central" font-weight="bold" data-w="36" data-h="20">${text}</text></g>`,
 ground:(col='#f7f2e8',mark='#c9c2b3')=>`<rect x="0" y="500" width="2600" height="100" fill="${col}" ${S}/>${Array.from({length:40},(_,i)=>`<path d="M${i*67+10} ${520+(i%3)*18} q10 -4 20 0" stroke="${mark}" stroke-width="2" fill="none"/>`).join('')}`,
};

/* ---------- персонаж ---------- */
/* приглушённая «пыльная» палитра: любой цвет смешиваем с тёплым серым */
function hex2(c){c=c.replace('#','');if(c.length===3)c=c.split('').map(x=>x+x).join('');return [0,2,4].map(i=>parseInt(c.substr(i,2),16))}
function mix(c1,c2,k){const a=hex2(c1),b=hex2(c2);return '#'+a.map((v,i)=>Math.round(v*(1-k)+b[i]*k).toString(16).padStart(2,'0')).join('')}
const mute=(c,k=.38)=>mix(c,'#8a8378',k), shade=(c,k=.3)=>mix(c,'#1e1a17',k);
function person(suit0,helmet0,o={}){
 const OL='#1b1714',SO=`stroke="${OL}" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round"`,SO2=`stroke="${OL}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"`;
 const suit=mute(suit0,.42),suitD=shade(suit,.35),suitL=mix(suit,'#f3eee2',.18),helmet=mute(helmet0,.3),helmD=shade(helmet,.3);
 const refl='#c9c2ae',glove='#4a3a2e',boot='#2b2420',skin=mute(o.skin||'#efc6a2',.22),skinD=shade(skin,.22),belt='#5b4634',strap='#6a5440';
 const hair=o.hair?mute(o.hair,.2):null;
 // типы телосложения: худой (молодой специалист), «бочка» (опытный мастер), «силач»
 const T=o.body||(o.beard||o.mustache?'barrel':'slim');
 const B={slim:{sh:19,wa:16,bl:2,top:-84,hy:-110,hr:19,aw:13},barrel:{sh:24,wa:24,bl:20,top:-80,hy:-99,hr:18,aw:15},strong:{sh:36,wa:18,bl:0,top:-90,hy:-104,hr:16,aw:20}}[T];
 const {sh,wa,bl,top,hy,hr,aw}=B,hip=-38;
 const hw=y=>{const k=(y-top)/(hip-top);return sh+(wa-sh)*k+bl*Math.sin(Math.PI*Math.min(1,k*1.15))};
 const torso=`M${-sh} ${top+6} Q${-sh-1} ${top-4} ${-sh+9} ${top-6} H${sh-9} Q${sh+1} ${top-4} ${sh} ${top+6} C${sh+bl*1.3} ${top+24} ${wa+bl*1.1} ${hip-16} ${wa} ${hip} H${-wa} C${-wa-bl*0.8} ${hip-16} ${-sh-bl*0.7} ${top+24} ${-sh} ${top+6}Z`;
 const band=y=>`<path d="M${-hw(y)+1} ${y} H${hw(y)-1} v6 H${-hw(y+6)+1}z" fill="${refl}" ${SO2}/>`;
 const leg=(cls,x)=>`<g class="${cls}"><path d="M${x} ${hip} h14 l-1 ${hip*-1-13} h-12z" fill="${suitD}" ${SO}/><path d="M${x+8} ${hip} h6 l-1 ${hip*-1-13} h-5z" fill="url(#hx)"/>
  <path d="M${x-1} -24 h15 v4 h-15z" fill="${refl}" stroke="${OL}" stroke-width="1.4"/>
  <path d="M${x-2} -14 q2 -2 6 -2 h8 q8 0 9 7 q1 6 -2 9 h-20 q-3 -6 -1 -14z" fill="${boot}" ${SO}/><path d="M${x-2} -3 h20" stroke="#4d4038" stroke-width="2"/></g>`;
 const arm=(cls,front)=>{const c=front?suit:suitD,ox=(front?1:-1)*Math.round(sh*0.62);return `<g class="${cls}" data-ox="${ox}"><g transform="translate(${ox} 0)">
  <path d="M${-aw/2} -84 q${aw/2} -6 ${aw} 0 q3 20 1 42 q${-aw/2} 4 ${-aw-2} 0 q-2 -22 1 -42z" fill="${c}" ${SO}/>
  ${front?`<path d="M${aw/2-4} -83 q5 20 3 41 h-4 q1 -20 -2 -40z" fill="url(#hx)"/>`:''}
  <path d="M${-aw/2-1} -46 h${aw+3} v6 h${-aw-3}z" fill="${front?refl:shade(refl,.3)}" stroke="${OL}" stroke-width="1.6"/>
  ${front?`<g class="tool" style="display:none"><rect x="-2" y="-36" width="6" height="24" rx="2" fill="#333" ${SO2}/><rect x="0" y="-14" width="2" height="12" fill="#888"/></g>`:''}
  <path d="M${-aw/2-2} -40 q-3 12 5 15 q${aw} 3 ${aw+2} -8 q1 -6 -3 -7z" fill="${glove}" ${SO}/><path d="M${aw/2+1} -37 q6 1 4 7" fill="none" stroke="${OL}" stroke-width="2.2"/></g></g>`};
 const fx=4,fy=hy,uid='t'+(++person.n||(person.n=1));
 return `<g>
 <ellipse cx="0" cy="1" rx="${sh+10}" ry="5" fill="#34404e" opacity=".22"/><path d="M${-sh} 1 L${-sh-90} 8 L${-sh-86} 12 L${-sh+8} 5z" fill="#6b7d90" opacity=".2"/>
 ${arm('armB',false)}${leg('legL',-15)}${leg('legR',2)}
 ${hair&&o.long!==false&&T==='slim'?`<path d="M${-hr+2} ${hy-6} q-10 26 -4 44 q6 4 12 0 l0 -40z" fill="${hair}" ${SO2}/>`:''}
 <defs><clipPath id="${uid}"><path d="${torso}"/></clipPath></defs>
 <path d="${torso}" fill="${suit}"/>
 <g clip-path="url(#${uid})">
 <path d="M4 ${top-6} H${sh-9} Q${sh+1} ${top-4} ${sh} ${top+6} C${sh+bl*1.3} ${top+24} ${wa+bl*1.1} ${hip-16} ${wa} ${hip} H6 Q10 ${top+30} 4 ${top-6}z" fill="${suitD}" opacity=".45"/>
 <path d="M8 ${top-2} H${sh-6} C${sh+bl} ${top+24} ${wa+bl} ${hip-16} ${wa-2} ${hip-2} H10z" fill="url(#hx)"/>
 <path d="M${-sh+6} ${top+4} q-3 14 0 26" stroke="${suitL}" stroke-width="3" fill="none" opacity=".6"/>
 ${band(top+24)}${band(top+36)}
 <path d="M${-sh+4} ${top} L${wa-3} ${hip-4}" stroke="${strap}" stroke-width="5"/><path d="M${-sh+4} ${top} L${wa-3} ${hip-4}" stroke="${OL}" stroke-width="1.2" opacity=".5"/>
 </g><path d="${torso}" fill="none" ${SO}/>
 <path d="M1 ${top-4} V${hip}" stroke="${OL}" stroke-width="1.5"/>${[0,1,2].map(i=>`<circle cx="4.5" cy="${top+8+i*10}" r="1.4" fill="${OL}"/>`).join('')}
 <rect x="${-sh+6}" y="${top+8}" width="11" height="10" rx="1.5" fill="${suitD}" ${SO2}/><path d="M${-sh+6} ${top+11} h11" stroke="${OL}" stroke-width="1.2"/>
 <path d="M${-wa-1} ${hip-8} H${wa+1} v8 H${-wa-1}z" fill="${belt}" ${SO2}/><rect x="-3" y="${hip-8}" width="7" height="8" fill="#a28a58" stroke="${OL}" stroke-width="1.4"/>
 <rect x="${wa-12}" y="${hip-6}" width="10" height="12" rx="2" fill="${strap}" ${SO2}/>
 <g class="analyzer" style="display:none"><rect x="${-wa-4}" y="${hip-10}" width="11" height="16" rx="2" fill="#b39238" ${SO2}/><rect x="${-wa-2}" y="${hip-7}" width="7" height="5" fill="#8fc49a"/></g>
 <path d="M${-sh+4} ${top-4} q${sh-4} 10 ${sh*2-8} 0 l-2 -8 q${-sh+6} 8 ${-sh*2+12} 0z" fill="${mute(o.scarf||'#6b6358',.2)}" ${SO2}/>
 <g class="head">
 <path d="M${fx-hr*0.9} ${fy-4} q-2 ${hr*1.1} ${hr*0.9} ${hr*1.05} q${hr*1.05} 1 ${hr*1.05} ${-hr*1.05} q0 ${-hr*0.8} ${-hr} ${-hr*0.8} q${-hr*0.9} 0 ${-hr*1.05} ${hr*0.8}z" fill="${skin}" ${SO}/>
 <path d="M${fx-hr*0.9} ${fy-2} q-1 ${hr} ${hr*0.6} ${hr*1.02} q-${hr*0.3} -${hr*0.4} -${hr*0.2} -${hr*1.1}z" fill="${skinD}" opacity=".55"/>
 <path d="M${fx-hr*0.95} ${fy+2} q-6 -1 -6 5 q1 6 6 5z" fill="${skin}" ${SO2}/>
 ${T==='barrel'&&!o.beard?`<path d="M${fx-hr*0.5} ${fy+10} q${hr*0.7} ${hr*0.45} ${hr*1.5} 0" stroke="#6b5a4a" stroke-width="1" stroke-dasharray="1 2.5" fill="none" opacity=".7"/>`:''}
 <ellipse cx="${fx+5}" cy="${fy-1}" rx="2.1" ry="2.8" fill="${OL}"/><ellipse cx="${fx+14}" cy="${fy-2}" rx="1.7" ry="2.4" fill="${OL}"/>
 <path class="brow" d="M${fx+1} ${fy-7} q4 -2 8 0 M${fx+11} ${fy-8} q3 -1 6 0" stroke="${OL}" stroke-width="2.2" fill="none"/>
 <path d="M${fx+11} ${fy} q7 1 9 7 q0 5 -6 4 q-3 0 -4 -2" fill="${mix(skin,'#c97a5a',.25)}" ${SO2}/>
 <circle cx="${fx+3}" cy="${fy+8}" r="3.4" fill="#b8604a" opacity=".22"/>
 ${o.beard?`<path d="M${fx-hr*0.85} ${fy+3} q2 ${hr*0.9} ${hr*0.9} ${hr*0.95} q${hr*0.9} 0 ${hr*1.1} ${-hr*0.85} q-5 5 -10 3 q-6 -3 -12 0 q-5 2 -9 -3z" fill="${mute(o.beard,.15)}" ${SO2}/><path d="M${fx+6} ${fy+9} q5 -3 11 0" stroke="${shade(mute(o.beard,.15),.35)}" stroke-width="4" fill="none" stroke-linecap="round"/>`
  :o.mustache?`<path d="M${fx+6} ${fy+10} q6 -4 13 0" stroke="${mute(o.mustache,.15)}" stroke-width="4.5" fill="none" stroke-linecap="round"/>`:`<path class="m0" d="M${fx+8} ${fy+12} q4 1.5 7 0" stroke="${OL}" stroke-width="2" fill="none"/>`}
 <g class="ex ex-happy" style="display:none"><path d="M${fx+6} ${fy+11} q5 6 10 0" stroke="${OL}" stroke-width="2" fill="#f4efe4"/></g>
 <g class="ex ex-worry" style="display:none"><ellipse cx="${fx+11}" cy="${fy+13}" rx="2" ry="2.6" fill="#4a2a20"/></g>
 <g class="ex ex-angry" style="display:none"><path d="M${fx+7} ${fy+13} h8" stroke="${OL}" stroke-width="2.4"/></g>
 <ellipse class="mouth" cx="${fx+11}" cy="${fy+(o.beard?14:13)}" rx="2.6" ry="2" fill="#4a2a20" style="display:none"/>
 ${o.glasses?`<circle cx="${fx+5}" cy="${fy-1}" r="5" fill="#dfe7ea" fill-opacity=".25" stroke="${OL}" stroke-width="1.8"/><circle cx="${fx+15}" cy="${fy-2}" r="4.2" fill="#dfe7ea" fill-opacity=".25" stroke="${OL}" stroke-width="1.8"/><path d="M${fx+10} ${fy-2} h1" stroke="${OL}" stroke-width="1.6"/>`:''}
 ${hair?`<path d="M${fx-hr*0.95} ${fy-8} q-2 8 1 14 l3 -12z M${fx+hr*0.6} ${fy-9} q5 2 6 7 l-6 -2z" fill="${hair}" stroke="${OL}" stroke-width="1.6"/>`:''}
 <path d="M${fx-hr-3} ${fy-8} q0 ${-hr*1.25} ${hr+3} ${-hr*1.3} q${hr+5} 1 ${hr+6} ${hr*1.3}z" fill="${helmet}" ${SO}/>
 <path d="M${fx+6} ${fy-8-hr*1.28} q${hr} 6 ${hr-3} ${hr*1.28} h-8 q2 ${-hr*0.9} -2 ${-hr*1.25}z" fill="${helmD}" opacity=".45"/>
 <path d="M${fx-2} ${fy-8-hr*1.3} q3 -1 7 0 v${hr*1.3} h-7z" fill="${helmD}" opacity=".35"/>
 <path d="M${fx-hr-7} ${fy-9} h${hr*2+16} q6 1 6 4 q-3 3 -8 3 h${-hr*2-10} q-6 -2 -4 -7z" fill="${helmet}" ${SO}/>
 <path d="M${fx-hr+2} ${fy-5} h${hr*2} q-3 3 -10 3 h${-hr*2+14}z" fill="${OL}" opacity=".13"/>
 <g class="mask" style="display:none"><path d="M${fx-4} ${fy-14} h22 q7 0 7 9 v28 q0 6 -7 6 h-20z" fill="#3a3632" ${SO2}/><rect x="${fx+7}" y="${fy-3}" width="13" height="8" fill="#3c5a44" ${SO2}/></g>
 </g>${arm('armF',true)}</g>`}

/* ---------- состояние и API ---------- */
const st={x:400,dir:1,step:0,busy:false,done:false,mistakes:0,pose:null,talk:null,crank:0,f:{}};
let cfg,PL,NPC,near=null,bubble=null;
const keys={};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
function setGoal(){$('goal').innerHTML='📋 <b>Задача:</b> '+cfg.goals[Math.min(cfg.goals.length-1,cfg.goalIdx(st.f))]}
function say(who,txt,choices){return new Promise(res=>{st.busy=true;
 const npcName=cfg.npc&&cfg.npc.name;
 st.talk=who==='Вы'?'pl':npcName&&who===npcName?'npc':null;
 if(who==='Вы'){if(near)st.dir=near.x>=st.x?1:-1;if(!st.pose)st.pose={f:-75,b:8,auto:1}}
 else if(who.includes('рации'))st.pose={f:0,b:-150,auto:1};
 if(st.talk==='npc')st.dir=cfg.npc.x>st.x?1:-1;
 if(st.talk==='npc'&&/Молод|Верно|Правильн|Отлично|Хорош|Спасибо/.test(txt))setExpr('npc','happy',2500);
 if(/Стоп|СТОЙ|НИКАКОГО|Нельзя|нельзя!/.test(txt)&&who.startsWith&&!who.startsWith('Вы'))setExpr('pl','worry',2500);
 D.style.display='block';D.querySelector('.who').textContent=who;D.querySelector('.txt').innerHTML=txt;
 const ch=D.querySelector('.ch');ch.innerHTML='';D.querySelector('.next').style.display=choices?'none':'block';
 const close=v=>{D.style.display='none';D.onclick=null;st.busy=false;st.talk=null;if(st.pose&&st.pose.auto)st.pose=null;res(v)};
 if(choices)choices.forEach((c,i)=>{const b=document.createElement('button');b.innerHTML=c;b.onclick=e=>{e.stopPropagation();close(i)};ch.appendChild(b)});
 else setTimeout(()=>D.onclick=()=>close(),150)})}
async function seq(lines){for(const[w,t]of lines)await say(w,t)}
async function walkTo(x){st.busy=true;while(Math.abs(st.x-x)>3){st.dir=Math.sign(x-st.x);st.x+=st.dir*3;st.step+=0.25;st.walking=true;await wait(16)}st.walking=false}
// поза рук, чтобы кисти оказались на высоте hgt над землёй (плечо ~84, длина руки ~44)
const K=1.15;// масштаб персонажей в сцене
function reach(hgt){const c=Math.max(-1,Math.min(1,(80*K-hgt)/(50*K)));const th=Math.acos(c);return{deg:th*180/Math.PI,dx:(50*Math.sin(th)+12)*K}}
/* ---------- рисованные персонажи (спрайты-позы) ----------
 cfg.player.sprites / cfg.npc.sprites = {h: высота в сцене, poses:{имя:[url, ширина, высота, якорь_x 0..1]}} */
function spriteG(id,sp){const k=sp.h/Math.max(...Object.values(sp.poses).map(p=>p[2]));
 const im=(u,w,h,ax,c='')=>`<image ${c} href="${u}" x="${-w*k*(ax??.5)}" y="${-h*k}" width="${w*k}" height="${h*k}"/>`;
 const rig=sp.rig?(()=>{const r=sp.rig,[w,h]=r.size,ox=-w*k*(r.ax??.5),oy=-h*k;sp._piv=r.hips.map(([x,y])=>[ox+x*k,oy+y*k]);
  return `<g class="p-walk" style="display:none">${['legR','legL'].map(l=>`<g class="rig-${l}">${im(r[l],w,h,r.ax)}</g>`).join('')}${im(r.body,w,h,r.ax)}</g>`})():'';
 return `<g id="${id}" class="spr">`+Object.entries(sp.poses).filter(([n])=>!(rig&&n==='walk')).map(([n,[u,w,h,ax]])=>im(u,w,h,ax,`class="p-${n}" style="display:none"`)).join('')+rig+'</g>'}
function sprPose(el,name){if(el._pose===name)return;const n=el.querySelector('.p-'+name)?name:'idle';el.querySelectorAll('[class^="p-"]').forEach(i=>i.style.display='none');el.querySelector('.p-'+n).style.display='';el._pose=name}
function isSpr(el){return el&&el.classList.contains('spr')}
async function turnWheel(id,cx,cy,open,turns=1.5){
 if(isSpr(PL)){const off=(cfg.player.sprites.valveDx||60);await walkTo(cx-off);st.dir=1;st.busy=true;st.pose={spr:cfg.player.sprites.poses.crank?'crank':'valve'};
  await wait(900*turns);st.pose=null;await wait(150);st.busy=false;return}
 {const r=reach(500-cy);await walkTo(cx-r.dx);st.dir=1;
 const g=$('g'+id);st.pose={f:-r.deg,b:-r.deg-6,grip:1};st.busy=true;await wait(250);
 const t0=performance.now(),T=900*turns;
 await new Promise(res=>{const f=now=>{const k=Math.min(1,(now-t0)/T);g.setAttribute('transform',`rotate(${(open?-1:1)*k*360*turns} ${cx} ${cy})`);st.crank=Math.sin(k*Math.PI*4*turns);k<1?requestAnimationFrame(f):res()};requestAnimationFrame(f)});
 st.crank=0;st.pose=null;await wait(150);st.busy=false}}
async function work(x,hgt,ms,opts={}){
 if(isSpr(PL)){await walkTo(x-(opts.dx??50));st.dir=1;st.busy=true;st.pose={spr:opts.pose||'detector'};await wait(ms);st.pose=null;st.busy=false;return}const r=reach(hgt);await walkTo(x-r.dx);st.dir=1;st.busy=true;st.pose={f:-r.deg,b:-r.deg+10,grip:1};
 if(opts.tool)PL.querySelector('.tool').style.display='';if(opts.mask)PL.querySelector('.mask').style.display='';
 const t0=performance.now();while(performance.now()-t0<ms){st.crank=Math.sin((performance.now()-t0)/120);if(opts.sparks)sparks(x,500+(st.y||0)-hgt);await wait(opts.sparks?60:30)}
 st.crank=0;st.pose=null;PL.querySelector('.tool').style.display='none';PL.querySelector('.mask').style.display='none';st.busy=false}
function sparks(x,y){for(let i=0;i<4;i++){const c=document.createElementNS('http://www.w3.org/2000/svg','circle');c.setAttribute('cx',x);c.setAttribute('cy',y);c.setAttribute('r',2+Math.random()*2);c.setAttribute('fill',Math.random()<.5?'#ffd23a':'#fff');fg.appendChild(c);
 const dx=(Math.random()-.5)*80,dy=-Math.random()*50;c.animate([{transform:'translate(0,0)',opacity:1},{transform:`translate(${dx}px,${dy+60}px)`,opacity:0}],{duration:500+Math.random()*300}).onfinish=()=>c.remove()}}
async function climb(y){const y0=st.y||0;for(let k=1;k<=20;k++){st.y=y0+(y-y0)*k/20;st.step+=0.3;st.walking=true;await wait(30)}st.walking=false}
function puff(x,y,d){const c=document.createElementNS('http://www.w3.org/2000/svg','circle');c.setAttribute('cx',x);c.setAttribute('cy',y);c.setAttribute('r',4);c.setAttribute('fill','#fff');c.setAttribute('opacity','.8');fg.appendChild(c);
 c.animate([{transform:'translate(0,0) scale(1)',opacity:.8},{transform:`translate(${d*18}px,-22px) scale(2.4)`,opacity:0}],{duration:1400,easing:'ease-out'}).onfinish=()=>c.remove()}
function dust(x,y){const c=document.createElementNS('http://www.w3.org/2000/svg','circle');c.setAttribute('cx',x);c.setAttribute('cy',y);c.setAttribute('r',3);c.setAttribute('fill',cfg._temp<=0?'#fff':'#b8a88a');c.setAttribute('opacity','.7');fg.appendChild(c);
 c.animate([{transform:'translate(0,0) scale(1)',opacity:.7},{transform:`translate(${-st.dir*10}px,-6px) scale(2)`,opacity:0}],{duration:500}).onfinish=()=>c.remove()}
function show(item,on=true){if(isSpr(PL))return;PL.querySelector('.'+item).style.display=on?'':'none'}
/* мини-игра «поймай момент»: бегунок ходит по шкале, надо останавливать в зелёной зоне */
function timing(title,text,{hits=3,zone=[40,60],speed=1.4,label='Стоп!'}={}){return new Promise(res=>{st.busy=true;
 const o=$('over');o.style.display='flex';let got=0,miss=0,pos=0,dirn=1,alive=true;
 o.firstElementChild.innerHTML=`<h2>${title}</h2><p>${text}</p><div class="meter"><div class="zone" style="left:${zone[0]}%;width:${zone[1]-zone[0]}%"></div><div class="mark"></div></div>
 <div class="hits"></div><button class="btn" id="tbtn">${label}</button><p style="font-size:13px;opacity:.7">Нажмите кнопку, пробел или ✋, когда бегунок в зелёной зоне</p>`;
 const mark=o.querySelector('.mark'),hitsEl=o.querySelector('.hits');
 const draw=()=>hitsEl.textContent='✅'.repeat(got)+'⬜'.repeat(hits-got)+(miss?'  ❌'.repeat(0)+` промахов: ${miss}`:'');draw();
 const tick=()=>{if(!alive)return;pos+=dirn*speed;if(pos>=97||pos<=0)dirn*=-1;mark.style.left=pos+'%';requestAnimationFrame(tick)};tick();
 st.onAction=()=>{if(pos>=zone[0]&&pos<=zone[1]-2)got++;else miss++;draw();o.querySelector('.meter').animate([{background:pos>=zone[0]&&pos<=zone[1]-2?'#d5f5dc':'#ffd6d6'},{background:'#fff'}],300);
  if(got>=hits){alive=false;st.onAction=null;setTimeout(()=>{o.style.display='none';st.busy=false;res(miss)},400)}};
 $('tbtn').onclick=e=>{e.stopPropagation();st.onAction&&st.onAction()}})}
/* выбор порядка действий: возвращает массив индексов */
async function order(title,intro,opts,onStep){await say(title,intro);const ord=[];
 for(let k=0;k<opts.length;k++){const left=opts.map((_,i)=>i).filter(i=>!ord.includes(i));
  const i=await say(title,`Шаг ${k+1} из ${opts.length}. Что делаем?`,left.map(x=>opts[x]));ord.push(left[i]);if(onStep)await onStep(left[i],k)}
 return ord}
function setExpr(who,ex,ms=1800){const el=who==='npc'?NPC:PL;if(!el)return;
 if(isSpr(el)){el._expr=ex;clearTimeout(el._ex);if(ex&&ms)el._ex=setTimeout(()=>setExpr(who,null),ms);return}
 el.querySelectorAll('.ex').forEach(g=>g.style.display='none');const m0=el.querySelector('.m0');if(m0)m0.style.display=ex?'none':'';
 const br=el.querySelector('.brow');if(br)br.setAttribute('d',ex==='angry'?'M2 -127 q4 2 8 3':ex==='worry'?'M2 -123 q4 -6 8 -2':'M2 -124 q4 -3 8 0');
 if(ex){const g=el.querySelector('.ex-'+ex);if(g)g.style.display=''}
 clearTimeout(el._ex);if(ex&&ms)el._ex=setTimeout(()=>setExpr(who,null),ms)}
function mark(who,sym,col='#c0392b'){const el=who==='npc'?NPC:PL;if(!el)return;const x=who==='npc'?cfg.npc.x:st.x;
 const hh=isSpr(el)?(who==='npc'?cfg.npc:cfg.player).sprites.h+20:175;const t=document.createElementNS('http://www.w3.org/2000/svg','g');t.innerHTML=`<circle cx="${x}" cy="${500+(st.y||0)*(who==='npc'?0:1)-hh}" r="16" fill="#fff" stroke="${INK}" stroke-width="3"/><text x="${x}" y="${500+(st.y||0)*(who==='npc'?0:1)-168}" text-anchor="middle" font-size="22" font-weight="bold" fill="${col}">${sym}</text>`;t.firstElementChild.nextElementSibling.setAttribute('y',500-hh+7);
 fg.appendChild(t);t.animate([{transform:'translateY(8px)',opacity:0},{transform:'translateY(0)',opacity:1,offset:.2},{opacity:1,offset:.8},{opacity:0}],{duration:1800}).onfinish=()=>t.remove()}
function mistake(){st.mistakes++;setExpr('npc','angry',2500);setExpr('pl','worry',2500);mark('npc','!')}
function finish(extra=''){st.done=true;setExpr('npc','happy',0);setExpr('pl','happy',0);const o=$('over');o.style.display='flex';
 const stars=st.mistakes===0?'⭐⭐⭐':st.mistakes<=2?'⭐⭐':'⭐';
 try{localStorage.setItem('gv_last_ep',cfg.id)}catch(e){}
 if(window.GV)GV.ep(cfg.id,[...stars].length);
 try{const k='gv_ep_'+cfg.id,prev=+localStorage.getItem(k)||0,n=stars.length/1;localStorage.setItem(k,Math.max(prev,[...stars].length))}catch(e){}
 o.firstElementChild.innerHTML=`<h2>${cfg.title}: пройдено ${stars}</h2><p>Профессия: <b>${cfg.profession}</b> · ошибок: <b>${st.mistakes}</b></p>
 <p><b>Что вы узнали:</b></p><ul>${cfg.lessons.map(l=>`<li>${l}</li>`).join('')}</ul>${extra}
 ${cfg.pilot?'<p><b>🎖 Первая смена пройдена!</b> Продолжение — в следующих эпизодах.</p>':`<p><b>🎖 Вас повышают до мастера участка!</b></p><a class="btn" style="background:#d0632a;color:#fff" href="master.html?from=${cfg.id}">Уровень 2: мастер участка →</a>`} <a class="btn" href="index.html">🏠 На главную</a> <button class="btn" onclick="location.reload()">Пройти заново</button>`}

/* ---------- фон ---------- */
function background(type){
 const hills=(y,col)=>{let d=`M0 ${y}`;for(let x=0;x<=2600;x+=100)d+=` Q${x+50} ${y-20+Math.sin(x/170)*18} ${x+100} ${y-5+Math.cos(x/130)*10}`;return `<path d="${d} L2600 600 L0 600Z" fill="${col}" stroke="${INK}" stroke-width="3"/>`};
 const tod=cfg._tod||'day';
 let h='';
 if(tod==='night'){h+=Array.from({length:70},(_,i)=>`<circle cx="${(i*137)%2600}" cy="${(i*53)%300}" r="${i%5?1.2:2}" fill="#fff" opacity="${.4+(i%4)*.15}"><animate attributeName="opacity" values="1;.3;1" dur="${2+i%5}s" repeatCount="indefinite"/></circle>`).join('');
  h+=`<circle cx="420" cy="110" r="46" fill="#f4efd8" opacity=".12"/><path d="M430 78 a34 34 0 1 0 22 58 a27 27 0 1 1 -22 -58z" fill="#f4efd8"/>`}
 else h+=`<circle cx="300" cy="${tod==='dawn'?260:120}" r="${tod==='dawn'?55:40}" fill="${tod==='dawn'?'#f8b76a':'#f6e3b0'}" opacity=".85"/>`;
 if(tod!=='night'&&!cfg.noClouds)h+=[[200,80,1],[900,140,.8],[1600,90,1.1],[2200,130,.9]].map(([x,y,k],i)=>`<g opacity=".85"><g transform="translate(${x} ${y}) scale(${k})"><ellipse cx="0" cy="0" rx="60" ry="18" fill="${cfg.precip?'#c7cdd4':'#fff'}"/><ellipse cx="-25" cy="-10" rx="30" ry="18" fill="${cfg.precip?'#c7cdd4':'#fff'}"/><ellipse cx="20" cy="-14" rx="34" ry="20" fill="${cfg.precip?'#c7cdd4':'#fff'}"/></g><animateTransform attributeName="transform" type="translate" from="0 0" to="${-300-i*60} 0" dur="${60+i*15}s" repeatCount="indefinite"/></g>`).join('');
 if(type==='tundra'){h+=hills(430,'#c9d3d6')+Array.from({length:14},(_,i)=>`<path d="M${80+i*190} 430 l14 -60 l14 60z" fill="#6c7a6a" stroke="${INK}" stroke-width="2"/>`).join('')}
 if(type==='taiga'){h+=hills(420,'#b8c4a0');for(let i=0;i<60;i++){const x=i*45+(i%3)*9,s=.45+(i%4)*.1;h+=`<g transform="translate(${x} ${430}) scale(${s})"><path d="M0 -130 L-28 -60 h14 L-36 -20 h72 L14 -60 h14z" fill="${i%2?'#556b4a':'#4a6040'}" stroke="${INK}" stroke-width="3"/></g>`}}
 if(type==='steppe'){h+=hills(440,'#d9c79a')}
 if(type==='city'){h+=hills(445,'#c7cbd1');for(let i=0;i<22;i++){const x=i*120+10,hh=60+((i*37)%90);h+=`<rect x="${x}" y="${440-hh}" width="${70+(i%3)*15}" height="${hh}" fill="#a9b0ba" stroke="${INK}" stroke-width="2"/>`;for(let j=0;j<Math.floor(hh/22);j++)h+=`<rect x="${x+10}" y="${445-hh+j*22}" width="10" height="10" fill="${(i+j)%3?'#f6e3b0':'#8d95a0'}"/><rect x="${x+34}" y="${445-hh+j*22}" width="10" height="10" fill="${(i*j)%4?'#f6e3b0':'#8d95a0'}"/>`}}
 if(cfg.flare)h+=`<rect x="${cfg.flare}" y="250" width="10" height="180" fill="#8a7d70" stroke="${INK}" stroke-width="2"/><path id="flare" style="transform-box:fill-box;transform-origin:50% 100%" d="M${cfg.flare+5} 250 q-12 -25 0 -50 q12 25 0 50z" fill="#f29a3a" stroke="${INK}" stroke-width="2"/>`;
 return h}

/* ---------- цикл ---------- */
function interact(){if(st.onAction){st.onAction();return}if(D.style.display==='block'){if(D.onclick)D.onclick();return}if(near&&!st.busy&&!st.lock&&!st.done){st.lock=true;Promise.resolve(near.act()).catch(e=>console.error(e)).finally(()=>{st.lock=false;setGoal()})}}
function rotArm(el,a){el.setAttribute('transform',`rotate(${a} ${el.dataset.ox||0} -80)`)}
function loop(){
 const vw=GAME.clientWidth,vh=W.clientHeight,top0=W.offsetTop,scale=vh/600,WW=cfg.worldW||2600;
 const L=keys.arrowleft||keys.a||keys['ф'],R=keys.arrowright||keys.d||keys['в'];
 if(!st.busy&&!st.lock){const v=L?-4:R?4:0;if(v){st.x=Math.max(40,Math.min(WW-40,st.x+v));st.dir=Math.sign(v);st.step+=0.25}}
 const moving=st.walking||(!st.busy&&!st.lock&&(L||R));const sw=Math.sin(st.step)*(moving?12:0);
 if(isSpr(PL)){sprLoop(moving);}else{
 PL.setAttribute('transform',`translate(${st.x} ${500+(st.y||0)}) scale(${st.dir*K} ${K})`);
 PL.querySelector('.legL').setAttribute('transform',`rotate(${sw} -8 -38)`);PL.querySelector('.legR').setAttribute('transform',`rotate(${-sw} 9 -38)`);
 const t=Date.now()/400,p=st.pose;let aF=-sw*1.2,aB=sw*1.2;
 if(p){aF=p.f+(p.grip?st.crank*10:Math.sin(t*2)*3);aB=p.b+(p.grip?-st.crank*10:0)}
 rotArm(PL.querySelector('.armF'),aF);rotArm(PL.querySelector('.armB'),aB);
 const talkK=Math.abs(Math.sin(Date.now()/90))>.4;
 PL.querySelector('.mouth').style.display=st.talk==='pl'&&talkK?'':'none';
 PL.querySelector('.head').setAttribute('transform',`translate(0 ${sw?Math.abs(Math.sin(st.step))*-2:Math.sin(t)*0.8})`);
 if(NPC){NPC.querySelector('.mouth').style.display=st.talk==='npc'&&talkK?'':'none';
  NPC.setAttribute('transform',`translate(${cfg.npc.x} 500) scale(${(st.x<cfg.npc.x?-1:1)*K} ${K})`);
  if(st.talk==='npc'){rotArm(NPC.querySelector('.armF'),-55+Math.sin(t*2.5)*18);rotArm(NPC.querySelector('.armB'),-15+Math.sin(t*1.7)*8)}
  else{rotArm(NPC.querySelector('.armF'),Math.sin(t)*4);NPC.querySelector('.armB').setAttribute('transform','')}}}
 const cam=WW*scale<=vw?(WW*scale-vw)/2:Math.max(0,Math.min(WW*scale-vw,st.x*scale-vw/2));
 W.style.transform=`translateX(${-cam}px)`;W.style.width=WW*scale+'px';bg.style.transform=`translateX(${cam*0.3}px)`;
 near=cfg.hotspots.filter(h=>Math.abs(h.x-st.x)<h.r&&(!h.when||h.when(st.f))).sort((a,b)=>Math.abs(a.x-st.x)/a.r-Math.abs(b.x-st.x)/b.r)[0]||null;
 if(near&&!st.busy&&!st.lock&&!(st.pose&&st.pose.spr)){if(!bubble){bubble=document.createElement('div');bubble.className='bubble';GAME.appendChild(bubble)}
  bubble.textContent='✋ '+near.label;bubble.style.left=(st.x*scale-cam)+'px';bubble.style.top=(top0+vh-185*scale)+'px';bubble.style.display='block'}
 else if(bubble)bubble.style.display='none';
 if(st._ptr){const p=cfg.pointer(st.f);if(p&&!st.done&&!st.busy&&!(Math.abs(p.x-st.x)<60)){st._ptr.style.display='';st._ptr.setAttribute('transform',`translate(${p.x} ${p.y+Math.sin(Date.now()/220)*8})`)}else st._ptr.style.display='none'}
 const fl=$('flare');if(fl)fl.style.transform=`scale(1,${1+Math.sin(Date.now()/150)*0.12})`;
if(cfg.tick)cfg.tick(Date.now()/400);
 const now=Date.now();
 if(cfg._temp<=0&&now-(st._br||0)>2600){st._br=now;const hp=isSpr(PL)?cfg.player.sprites.mouth:[14,108],hn=isSpr(NPC)?cfg.npc.sprites.mouth:[14,108];puff(st.x+st.dir*hp[0],500+(st.y||0)-hp[1],st.dir);if(NPC)setTimeout(()=>puff(cfg.npc.x+(st.x<cfg.npc.x?-hn[0]:hn[0]),500-hn[1],st.x<cfg.npc.x?-1:1),900)}
 if(moving&&now-(st._du||0)>220&&!(st.y>0)){st._du=now;dust(st.x-st.dir*6,498)}
 requestAnimationFrame(loop)}
function sprLoop(moving){const t=Date.now();
 const p=st.pose;let n='idle';
 if(p&&p.spr)n=p.spr;else if(moving)n='walk';else if(p&&p.b<-100)n='radio';else if(st.talk==='pl')n='talk';else if(PL._expr==='worry')n='alarm';else if(PL._expr==='happy')n='happy';
 const sp=cfg.player.sprites;if(n==='walk'&&sp.walkFrames)n=sp.walkFrames[Math.floor(st.step/(sp.walkStep||1.6))%sp.walkFrames.length];
 sprPose(PL,n);
 if(n==='walk'&&sp._piv){const a=Math.sin(st.step*1.1)*14;const[[lx,ly],[rx,ry]]=sp._piv;
  PL.querySelector('.rig-legL').setAttribute('transform',`rotate(${a} ${lx} ${ly})`);PL.querySelector('.rig-legR').setAttribute('transform',`rotate(${-a} ${rx} ${ry})`)}
 const wk=n.startsWith('walk');const bob=wk&&!sp.walkFrames?-Math.abs(Math.sin(st.step*1.1))*4:0;const br=wk?0:Math.sin(t/700)*.006;
 PL.setAttribute('transform',`translate(${st.x} ${500+(st.y||0)+bob}) scale(${st.dir*(1-br/2)} ${1+br})`);
 if(NPC){const c=cfg.npc;let m=c.sprites.idleCycle?c.sprites.idleCycle[Math.floor(t/7000)%c.sprites.idleCycle.length]:'idle';
  if(c.walking&&c.sprites.walkFrames)m=c.sprites.walkFrames[Math.floor((c.step||0)/(c.sprites.walkStep||1.1))%c.sprites.walkFrames.length];else if(st.talk==='npc')m='talk';else if(NPC._expr==='angry')m='angry';else if(NPC._expr==='happy')m='happy';else if(c.pointAt&&c.pointAt(st.f))m='point';
  sprPose(NPC,m);const b2=Math.sin(t/800+1)*.006;const nd=c.walking?(c.dir||1):(st.x<c.x?-1:1);NPC.setAttribute('transform',`translate(${c.x} 500) scale(${nd*(1-b2/2)} ${1+b2})`)}}
function fitLabels(){fg.querySelectorAll('text[data-w]').forEach(t=>{let fs=+t.getAttribute('font-size');const w=+t.dataset.w,h=+t.dataset.h;
 while(fs>6&&(t.getComputedTextLength()>w||fs>h*0.8)){fs-=0.5;t.setAttribute('font-size',fs)}})}

function run(c){cfg=c;document.title=c.title;
 const hm=/(\d{1,2}):(\d{2})/.exec(c.weather||'');const hr=hm?+hm[1]:12;
 c._tod=hr<6||hr>=20?'night':hr<8||hr>=18?'dawn':'day';
 const tm=/([−-]?\d+)\s*°C/.exec(c.weather||'');c._temp=tm?+tm[1].replace('−','-'):10;
 if(c._tod==='night'){c.sky='#1d2a44';c.sky2='#5b5f7a'}
 if(c._tod==='dawn'&&!c.keepSky){c.sky='#7d8fb3';c.sky2='#f0c79a'}
 GAME.style.background=`linear-gradient(${mute(c.sky||'#9fb6c9',.3)},${mute(c.sky2||'#e9d9bd',.25)} 70%)`;
 if(c._tod==='dawn'){const tint=document.createElement('div');tint.style.cssText='position:absolute;inset:0;pointer-events:none;z-index:2;mix-blend-mode:multiply;background:linear-gradient(#ffb07a33,#8a6a9a44)';GAME.appendChild(tint)}
 $('temp').textContent=c.weather;
 if(c.worldW){bg.setAttribute('viewBox',`0 0 ${c.worldW} 600`);fg.setAttribute('viewBox',`0 0 ${c.worldW} 600`)}
 if(c.startMistakes)st.mistakes=c.startMistakes;
 bg.innerHTML=c.bgImage?'':background(c.bg||'tundra');
 fg.innerHTML='<defs><pattern id="hx" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(38)"><path d="M0 0v5" stroke="#1b1714" stroke-width="1.2" opacity=".32"/></pattern></defs>'+(c.bgImage?`<image href="${c.bgImage.src}" x="${c.bgImage.x||0}" y="${c.bgImage.y}" width="${c.bgImage.w}" height="${c.bgImage.h}" preserveAspectRatio="none"/>`:G.ground(c.groundCol,c.groundMark))+c.scene()+
  (c.npc?(c.npc.sprites?spriteG('npc',c.npc.sprites):`<g id="npc">${person(c.npc.suit,c.npc.helmet,c.npc.look||{})}</g>`):'')+
  (c.player?.sprites?spriteG('pl',c.player.sprites):`<g id="pl">${person(c.player?.suit||'#d0632a',c.player?.helmet||'#f2f2f2',Object.assign({dark:'#a84c1d'},c.player?.look||{}))}</g>`);
 PL=$('pl');NPC=$('npc');st.x=c.start||400;
 /* стрелка-указатель: куда идти */
 if(c.pointer){const g=document.createElementNS('http://www.w3.org/2000/svg','g');g.id='ptr';g.style.pointerEvents='none';
  g.innerHTML=c.pointerImg?`<image href="${c.pointerImg}" x="-22" y="-40" width="44" height="40"/>`:`<path d="M-14 -46 h28 v22 h14 l-28 26 l-28 -26 h14z" fill="#ffd23a" stroke="#2a211b" stroke-width="3" stroke-linejoin="round"/>`;fg.appendChild(g);st._ptr=g}
 /* всплывающие подсказки при наведении */
 const tip=document.createElement('div');tip.style.cssText='position:absolute;z-index:7;pointer-events:none;background:#f3e6cc;border:2px solid #2a211b;border-radius:5px;padding:3px 8px;font-size:14px;display:none;white-space:nowrap;box-shadow:2px 2px 0 #0005';GAME.appendChild(tip);
 GAME.addEventListener('mousemove',ev=>{const r=GAME.getBoundingClientRect(),sc=W.clientHeight/600,cam=-parseFloat((W.style.transform.match(/-?[\d.]+/)||[0])[0]);
  const wx=(ev.clientX-r.left+cam)/sc,wy=(ev.clientY-r.top-W.offsetTop)/sc;
  const h=(c.hotspots||[]).find(h=>h.tip&&Math.abs(h.x-wx)<Math.max(50,h.r*0.8)&&wy>180&&wy<520&&(!h.when||h.when(st.f)));
  if(h){tip.textContent=h.tip;tip.style.left=(ev.clientX-r.left+14)+'px';tip.style.top=(ev.clientY-r.top-30)+'px';tip.style.display='block';GAME.style.cursor='help'}else{tip.style.display='none';GAME.style.cursor=''}});
 if(c._tod==='night'){fg.style.filter='brightness(.6) saturate(.8) hue-rotate(-10deg)';bg.style.filter='brightness(.55)';
  const gl=document.createElementNS('http://www.w3.org/2000/svg','svg');gl.setAttribute('class','layer');gl.setAttribute('viewBox','0 0 2600 600');gl.setAttribute('preserveAspectRatio','xMinYMax slice');gl.style.pointerEvents='none';
  let h='<defs><filter id="glw" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter></defs>';
  fg.querySelectorAll('rect[fill="#ffe7a3"]').forEach(r=>{const x=+r.getAttribute('x'),y=+r.getAttribute('y'),w=+r.getAttribute('width'),hh=+r.getAttribute('height');
   h+=`<rect x="${x-4}" y="${y-4}" width="${w+8}" height="${hh+8}" fill="#ffd36a" opacity=".55" filter="url(#glw)"/><rect x="${x}" y="${y}" width="${w}" height="${hh}" fill="#ffe28a" stroke="#2a211b" stroke-width="2"/>`});
  gl.innerHTML=h;W.appendChild(gl)}
 fitLabels();document.fonts&&document.fonts.ready.then(fitLabels);
 addEventListener('keydown',e=>{const k=e.key.toLowerCase();keys[k]=true;if(['e','у',' ','enter'].includes(k)){e.preventDefault();interact()}});
 addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
 const hold=(id,k)=>{const b=$(id);b.onpointerdown=()=>keys[k]=true;b.onpointerup=b.onpointerleave=()=>keys[k]=false};
 hold('bl','arrowleft');hold('br','arrowright');$('bu').onclick=interact;GAME.addEventListener('contextmenu',e=>e.preventDefault());
 if(c.precip){setInterval(()=>{const s=document.createElement('div');s.className=c.precip==='rain'?'rainf':'snowf';s.style.left=Math.random()*100+'%';GAME.appendChild(s);
  s.animate([{transform:'translate(0,0)'},{transform:`translate(${c.precip==='rain'?-20:-60+Math.random()*40}px,${innerHeight+20}px)`}],{duration:c.precip==='rain'?900:4000+Math.random()*3000}).onfinish=()=>s.remove()},c.precip==='rain'?40:120)}
 /* фоновая музыка: включается с первым действием игрока (браузеры запрещают автозапуск звука) */
 if(c.music!==false){const mus=new Audio(c.music||'audio/music.m4a');mus.loop=true;mus.volume=.35;
  let off=false;try{off=localStorage.getItem('gv_music')==='off'}catch(e){}
  const mb=document.createElement('button');mb.className='paper';mb.style.cssText='position:absolute;top:58px;right:10px;z-index:6;font-size:18px;cursor:pointer;padding:4px 10px';
  const upd=()=>{mb.textContent=off?'🔇':'🎵';mb.title=off?'Включить музыку':'Выключить музыку'};upd();GAME.appendChild(mb);
  const start=()=>{if(!off&&mus.paused)mus.play().catch(()=>{})};
  ['pointerdown','keydown'].forEach(ev=>addEventListener(ev,start,{once:false}));
  mb.onclick=e=>{e.stopPropagation();off=!off;try{localStorage.setItem('gv_music',off?'off':'on')}catch(e){}off?mus.pause():mus.play().catch(()=>{});upd()};
  document.addEventListener('visibilitychange',()=>{document.hidden?mus.pause():start()})}
 setGoal();loop();
 seq(c.intro.concat(c.noHint?[]:[['Подсказка',matchMedia('(pointer:coarse)').matches?'Ходите кнопками ◀ ▶ внизу экрана. Действие — кнопка ✋.':'Ходите стрелками ◀ ▶ (или A/D). Действие — клавиша E, пробел или кнопка ✋.']])).then(()=>c.afterIntro&&c.afterIntro());
}
window.Engine={person,setExpr,mark,climb,run,G,S,S2,INK,st,say,seq,wait,walkTo,turnWheel,work,sparks,show,timing,order,mistake,finish,setGoal,$};
})();
