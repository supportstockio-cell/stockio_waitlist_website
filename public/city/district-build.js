import * as THREE from 'three';
import { DISTRICTS } from './districts.js';
import { LANDMARKS } from './landmarks.js';

/* Builds every non-builtin district plate. ctx supplies the palette, mesh
   helpers and animation registries owned by city-main.js. */
export function buildDistricts(ctx){
  const { M, box, cyl, blob, rnd, pick, BOX, SPH, WINDOW_MATS, windows, swayers,
          spinners, elevators, puffs, crawls, register, scene, zoneLayer, prop, props } = ctx;

  const tickers = [];          // sprite list, toggled by the Tickers layer
  const districtGroups = {};
  const accentCache = {};

  const hexA = (hex,a) => {
    const n = parseInt(hex.slice(1),16);
    return `rgba(${n>>16&255},${n>>8&255},${n&255},${a})`;
  };
  function A(hex){
    if(accentCache[hex]) return accentCache[hex];
    const c = new THREE.Color(hex);
    const set = {
      solid: new THREE.MeshStandardMaterial({color:c, roughness:.55, metalness:.05}),
      deep:  new THREE.MeshStandardMaterial({color:c.clone().multiplyScalar(.62), roughness:.5, metalness:.15}),
      glass: new THREE.MeshStandardMaterial({color:c.clone().lerp(new THREE.Color(0xffffff),.25), roughness:.16, metalness:.42}),
      lit:   new THREE.MeshStandardMaterial({color:c, roughness:.4, emissive:c, emissiveIntensity:.85})
    };
    for(const k in set) set[k].name = 'accent_'+k;
    return (accentCache[hex] = set);
  }

  /* ---------- plate surface ---------- */
  function plateTexture(accent, cross){
    const S=2048, W=200, c=document.createElement('canvas'); c.width=c.height=S;
    const g=c.getContext('2d');
    const u=v=>(v+W/2)/W*S, p=m=>m/W*S;
    const rect=(x,z,w,d,f)=>{g.fillStyle=f;g.fillRect(u(x),u(z),p(w),p(d));};
    const round=(x,z,w,d,r,f)=>{g.fillStyle=f;g.beginPath();g.roundRect(u(x),u(z),p(w),p(d),p(r));g.fill();};
    g.fillStyle='#E4E8EC'; g.fillRect(0,0,S,S);
    g.strokeStyle='rgba(40,50,64,.05)'; g.lineWidth=1.4;
    for(let i=-100;i<=100;i+=4){ g.beginPath();g.moveTo(u(i),0);g.lineTo(u(i),S);g.stroke();
      g.beginPath();g.moveTo(0,u(i));g.lineTo(S,u(i));g.stroke(); }
    rect(-97,-97,194,194,'#EDF0F3');
    rect(-93,-93,186,186,'#3B4046');
    rect(-79,-79,158,158,'#EDF0F3');
    rect(-75,-75,150,150,'#E4E8EC');
    if(cross==='ns'){ rect(3,-97,14,194,'#3B4046'); rect(1,-97,2,194,'#EDF0F3'); rect(17,-97,2,194,'#EDF0F3'); }
    // ring lane markings
    g.strokeStyle='rgba(242,244,246,.8)'; g.lineWidth=p(.45);
    [-86,86].forEach(v=>{
      g.setLineDash([p(4),p(4)]);
      g.beginPath();g.moveTo(u(-86),u(v));g.lineTo(u(86),u(v));g.stroke();
      g.beginPath();g.moveTo(u(v),u(-86));g.lineTo(u(v),u(86));g.stroke();
      g.setLineDash([]);
    });
    // accent identity: inner edge stripe + plaza inlay + corner marks
    rect(-75,-76.4,150,1.6,hexA(accent,.85));
    rect(-75,74.8,150,1.6,hexA(accent,.85));
    round(-72,-10,144,20,10,hexA(accent,.13));
    round(-66,-5,132,10,5,hexA(accent,.20));
    for(const [sx,sz] of [[-72,-72],[56,-72],[-72,56],[56,56]]) round(sx,sz,16,16,4,hexA(accent,.28));
    g.fillStyle='rgba(160,172,186,.18)'; g.beginPath(); g.roundRect(u(-30),u(24),p(60),p(34),p(10)); g.fill();
    // zebra crossings at the four ring mid-points
    for(const [ox,oz,vert] of [[0,-86,false],[0,86,false],[-86,0,true],[86,0,true]]){
      for(let i=-3;i<=3;i++){
        if(vert) rect(ox-6.5, oz+i*2.6-.9, 13, 1.8, 'rgba(244,246,248,.9)');
        else     rect(ox+i*2.6-.9, oz-6.5, 1.8, 13, 'rgba(244,246,248,.9)');
      }
    }
    // stop bars
    rect(-8,-79.4,7,1.4,'rgba(244,246,248,.85)'); rect(1,78,7,1.4,'rgba(244,246,248,.85)');
    // parking bays biting into the paving inside the ring
    for(let i=0;i<11;i++){
      rect(-70+i*13, -78.6, .8, 6.4, 'rgba(120,132,148,.5)');
      rect(-70+i*13,  72.2, .8, 6.4, 'rgba(120,132,148,.5)');
    }
    // service aprons hatched behind the plaza band
    g.save(); g.globalAlpha=.16; g.strokeStyle='#5A6675'; g.lineWidth=p(.5);
    for(let i=0;i<44;i++){ g.beginPath(); g.moveTo(u(-74)+i*p(3.4), u(46)); g.lineTo(u(-74)+i*p(3.4)-p(10), u(56)); g.stroke(); }
    g.restore();
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 16;
    return tex;
  }

  /* ---------- signage ---------- */
  function signTexture(text, accent, sub){
    const c=document.createElement('canvas'); c.width=512; c.height=sub?200:160;
    const g=c.getContext('2d');
    g.fillStyle='#0C1320'; g.beginPath(); g.roundRect(6,6,500,c.height-12,22); g.fill();
    g.strokeStyle=accent; g.lineWidth=8; g.beginPath(); g.roundRect(6,6,500,c.height-12,22); g.stroke();
    g.fillStyle=accent; g.fillRect(34,c.height/2-46,10,92);
    g.fillStyle='#FAFAF9'; g.textAlign='left';
    let size = 78;
    const fit = () => { g.font = '800 ' + size + 'px ui-monospace, Menlo, Consolas, monospace'; return g.measureText(text).width; };
    while(fit() > 404 && size > 30) size -= 3;
    g.fillText(text, 62, sub?96:104);
    if(sub){ g.fillStyle=hexA(accent,.95); g.font='800 34px -apple-system, Helvetica, Arial, sans-serif';
      g.fillText(sub.toUpperCase(), 64, 152); }
    const tex=new THREE.CanvasTexture(c); tex.colorSpace=THREE.SRGBColorSpace; tex.anisotropy=4;
    return tex;
  }
  function tickerSprite(text, accent, x, y, z, scale, sub){
    const tex = signTexture(text, accent, sub);
    const s = new THREE.Sprite(new THREE.SpriteMaterial({map:tex, transparent:true, depthTest:true}));
    const ar = tex.image.height/tex.image.width;
    s.scale.set(scale, scale*ar, 1);
    s.position.set(x,y,z);
    s.name = 'ticker_'+text;
    tickers.push(s);
    return s;
  }
  function crawlBand(w,h,accent){
    const c=document.createElement('canvas'); c.width=2048; c.height=96;
    const g=c.getContext('2d');
    g.fillStyle='#080D16'; g.fillRect(0,0,2048,96);
    const feed=['AAPL 231.40 ▲','MSFT 512.05 ▲','NVDA 184.72 ▲','JPM 268.10 ▼','COIN 342.85 ▲','XOM 118.63 ▼','UNH 305.44 ▲','NFLX 1,204.6 ▲','CAT 421.09 ▲','GS 742.18 ▼'];
    g.font='800 46px ui-monospace, Menlo, Consolas, monospace'; g.textBaseline='middle';
    let x=20;
    feed.forEach((s,i)=>{ g.fillStyle = i%3===1 ? accent : '#EAF2F8'; g.fillText(s,x,52); x += g.measureText(s).width + 46; });
    const tex=new THREE.CanvasTexture(c);
    tex.colorSpace=THREE.SRGBColorSpace; tex.wrapS=THREE.RepeatWrapping; tex.repeat.x=1;
    const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h), new THREE.MeshBasicMaterial({map:tex}));
    crawls.push({tex, speed:.055});
    return m;
  }

  /* ---------- shared parts ---------- */
  function parapet(G, mat, w, d, y, t=1.4, hgt=1.5){
    G.add(box(mat, w+t, hgt, t, 0, y, -d/2-t/2+.4));
    G.add(box(mat, w+t, hgt, t, 0, y,  d/2+t/2-.4));
    G.add(box(mat, t, hgt, d+t, -w/2-t/2+.4, y, 0));
    G.add(box(mat, t, hgt, d+t,  w/2+t/2-.4, y, 0));
  }
  function floorBands(G, mat, w, d, h, y0, step){
    for(let y=y0+step; y<h-1; y+=step) G.add(box(mat, w+.5, .55, d+.5, 0, y, 0));
  }
  function windowGrid(G, w, h, d, cols, rows, y0, faceZ){
    for(let i=0;i<cols;i++) for(let k=0;k<rows;k++){
      const wm = new THREE.Mesh(BOX, pick(WINDOW_MATS));
      wm.scale.set(w/cols*.52, (h-y0)/rows*.42, .5);
      wm.position.set(-w/2 + w/cols*(i+.5), y0 + (h-y0)/rows*(k+.55), faceZ);
      G.add(wm); windows.push(wm);
    }
  }
  function fan(G, mat, r, x, y, z){
    const hub = cyl(M.metal, r*.22, .5, x, y, z);
    const rotor = new THREE.Group(); rotor.position.set(x,y+.35,z);
    for(let i=0;i<4;i++){
      const b = box(mat, r*1.7, .12, r*.42, 0, 0, 0, i*Math.PI/4);
      rotor.add(b);
    }
    G.add(hub); G.add(rotor);
    spinners.push({o:rotor, speed:rnd(2.2,3.6)});
    return rotor;
  }
  function steam(G, x, y, z, r){
    for(let i=0;i<3;i++){
      const mat = new THREE.MeshStandardMaterial({color:0xF2F6FA, roughness:1, transparent:true, opacity:.42, depthWrite:false});
      const p = blob(mat, r, x, y, z); p.castShadow=false;
      G.add(p);
      puffs.push({o:p, base:y, span:26, sp:rnd(.10,.16), ph:i/3, r});
    }
  }
  function rooftopKit(G, w, d, h){
    G.add(box(M.shell, w+1.6, 1.4, d+1.6, 0, h+.7, 0));
    G.add(box(M.solar, w-6, .5, d-7, 0, h+1.6, 0));
    for(let i=0;i<3;i++) G.add(box(M.metal, 2.6, 1.8, 2.6, -w/2+5+i*5.4, h+2.3, -d/2+4));
  }

  /* ---------- typologies ---------- */
  const T = {};

  T.tower = (G,b,ac)=>{
    const {w,d,h} = b;
    G.add(box(M.shell, w+7, 3, d+7, 0, 1.5, 0));
    G.add(box(M.shell, w, h, d, 0, h/2+3, 0));
    G.add(box(ac.glass, w*.5, h-8, .9, -w*.2, h/2+3, d/2+.15));
    G.add(box(ac.glass, .9, h-8, d*.6, w/2+.15, h/2+3, 0));
    floorBands(G, M.shellWarm, w, d, h, 6, 8);
    for(const s of [-1,1]) G.add(box(ac.solid, 1.3, h-4, 1.3, s*(w/2+.5), h/2+3, -d/2-.5));
    windowGrid(G, w, h, d, 3, Math.max(4,Math.round(h/16)), 8, -d/2-.2);
    parapet(G, ac.solid, w+1.4, d+1.4, h+4.4, 1.6, 2.4);
    G.add(box(M.shell, w-6, 3.4, d-6, 0, h+6.5, 0));
    const mast = cyl(M.metal, .32, 12, 0, h+14, 0, .16); G.add(mast);
    const beacon = blob(M.litWarm, .8, 0, h+20, 0); G.add(beacon); windows.push(beacon);
    return h+20;
  };

  T.stack = (G,b,ac)=>{
    const {w,d,h} = b;
    G.add(box(M.shell, w+9, 3.4, d+9, 0, 1.7, 0));
    const steps = 3;
    let y = 3;
    for(let i=0;i<steps;i++){
      const sw = w - i*w*.16, sd = d - i*d*.16, sh = h/steps*(1 - i*.06);
      G.add(box(i%2 ? M.shellWarm : M.shell, sw, sh, sd, 0, y+sh/2, 0));
      G.add(box(ac.glass, sw*.42, sh-6, .9, -sw*.22, y+sh/2, sd/2+.15));
      floorBands(G, M.shell, sw, sd, y+sh, y+2, 7.5);
      windowGrid(G, sw, y+sh, sd, 3, Math.max(3,Math.round(sh/15)), y+3, -sd/2-.2);
      y += sh;
      parapet(G, ac.solid, sw, sd, y+.9, 1.5, 1.8);
    }
    const spire = cyl(M.metal, .5, 16, 0, y+9, 0, .18); G.add(spire);
    const beacon = blob(M.litWarm, .9, 0, y+17.5, 0); G.add(beacon); windows.push(beacon);
    return y+17;
  };

  T.slab = (G,b,ac)=>{
    const {w,d,h} = b;
    G.add(box(M.shell, w+4, 2.6, d+4, 0, 1.3, 0));
    G.add(box(M.shell, w, h, d, 0, h/2+2.6, 0));
    G.add(box(ac.glass, w*.86, h-7, .9, 0, h/2+2.6, d/2+.15));
    for(let i=0;i<4;i++) G.add(box(M.shell, .8, h-7, 1.4, -w*.34+i*(w*.23), h/2+2.6, d/2+.4));
    floorBands(G, M.shellWarm, w, d, h, 5, 6.5);
    parapet(G, ac.solid, w, d, h+3.2, 1.4, 1.8);
    windowGrid(G, w, h, d, 5, Math.max(3,Math.round(h/13)), 6, -d/2-.2);
    rooftopKit(G, w, d, h+3.4);
    return h+8;
  };

  T.cube = (G,b,ac)=>{
    const {w,d,h} = b;
    G.add(box(M.shell, w+6, 2.4, d+6, 0, 1.2, 0));
    G.add(box(ac.glass, w, h, d, 0, h/2+2.4, 0));
    G.add(box(ac.deep, w-2, h-3, d-2, 0, h/2+2.4, 0));
    for(const [sx,sz] of [[-1,-1],[1,-1],[-1,1],[1,1]])
      G.add(box(M.shell, 4.4, h+1, 4.4, sx*(w/2-2), h/2+2.4, sz*(d/2-2)));
    for(let i=1;i<Math.round(h/9);i++) G.add(box(M.shell, w+.6, .5, d+.6, 0, 2.4+i*9, 0));
    parapet(G, ac.solid, w, d, h+3.6, 1.5, 1.9);
    G.add(box(M.shell, w-2, 1, d-2, 0, h+3, 0));
    G.add(box(M.solar, w-9, .5, d-9, 0, h+3.7, 0));
    windowGrid(G, w, h, d, 4, Math.max(3,Math.round(h/12)), 5, d/2+.2);
    return h+6;
  };

  T.campus = (G,b,ac)=>{
    const {w,d,h} = b;
    const t = 13;
    G.add(box(M.shell, w, h, t, 0, h/2, -d/2+t/2));
    G.add(box(M.shell, w, h, t, 0, h/2,  d/2-t/2));
    G.add(box(M.shell, t, h, d-t*2, -w/2+t/2, h/2, 0));
    G.add(box(M.shell, t, h, d-t*2,  w/2-t/2, h/2, 0));
    G.add(box(ac.glass, w-2, h*.5, t+.4, 0, h*.36, d/2-t/2));
    parapet(G, ac.solid, w, d, h+1, 1.5, 1.8);
    G.add(box(M.solar, w-t*2-2, .5, d-t*2-2, 0, h+.4, 0));
    const court = box(M.grass, w-t*2-1, .6, d-t*2-1, 0, .5, 0); G.add(court);
    for(let i=0;i<5;i++){
      const bb = blob(pick([M.leafA,M.leafB]), rnd(1.4,2.4), rnd(-w/2+t+3, w/2-t-3), 1.8, rnd(-d/2+t+3, d/2-t-3));
      G.add(bb); swayers.push({o:bb, amp:.04, phase:Math.random()*6.3, axis:'x'});
    }
    windowGrid(G, w, h, t, 5, Math.max(2,Math.round(h/11)), 3, -d/2-.2);
    return h+4;
  };

  T.dataHall = (G,b,ac)=>{
    const {w,d,h} = b;
    G.add(box(M.concrete, w+8, 1.2, d+8, 0, .6, 0));
    G.add(box(M.shellWarm, w, h, d, 0, h/2+1.2, 0));
    for(let i=0;i<Math.round(w/9);i++) G.add(box(M.metal, 1.1, h-3, .6, -w/2+5+i*9, h/2+1.2, d/2+.35));
    parapet(G, ac.solid, w, d, h+2, 1.5, 1.7);
    G.add(box(ac.lit, w*.3, 1.8, .5, -w*.28, h*.55, d/2+.5));
    const cols = Math.max(3, Math.round(w/14)), rowsN = Math.max(1, Math.round(d/22));
    for(let i=0;i<cols;i++) for(let k=0;k<rowsN;k++){
      const cx = -w/2+9+i*((w-18)/(cols-1||1)), cz = -d/2+9+k*((d-18)/(rowsN-1||1));
      G.add(box(M.metal, 6.4, 2.4, 6.4, cx, h+3.1, cz));
      fan(G, M.metal, 2.4, cx, h+4.4, cz);
    }
    for(const s of [-1,1]) G.add(box(M.metal, 3.4, 6, 3.4, s*(w/2+5), 3.6, -d/2+7));
    return h+8;
  };

  T.mine = (G,b,ac)=>{
    const {w,d,h} = b;
    G.add(box(M.concrete, w+7, 1, d+7, 0, .5, 0));
    G.add(box(M.metal, w, h, d, 0, h/2+1, 0));
    for(let i=0;i<Math.round(d/6);i++) G.add(box(M.shellWarm, .8, h-2, 3.4, w/2+.3, h/2+1, -d/2+4+i*6));
    parapet(G, ac.solid, w, d, h+1.8, 1.4, 1.6);
    for(let i=0;i<3;i++) fan(G, M.shell, 2.6, -w/2-.7, h*.6, -d/2+8+i*(d-16)/2);
    // immersion racks visible through the open bay
    for(let i=0;i<4;i++) G.add(box(ac.deep, w-8, 2.2, 2.6, 0, 2.4+i*2.6, -d/2+3));
    for(const s of [-1,1]) G.add(box(M.metal, 3, 5, 3, s*(w/2-4), 3.5, d/2+4));
    return h+6;
  };

  T.shed = (G,b,ac)=>{
    const {w,d,h} = b;
    G.add(box(M.concrete, w+8, 1, d+8, 0, .5, 0));
    G.add(box(M.shell, w, h, d, 0, h/2+1, 0));
    parapet(G, ac.solid, w, d, h+1.9, 1.4, 1.7);
    // sawtooth roof lights
    const n = Math.max(3, Math.round(d/12));
    for(let i=0;i<n;i++){
      const z = -d/2 + d/n*(i+.5);
      const r = box(M.shellWarm, w-2, 3.4, d/n*.62, 0, h+3.4, z); r.rotation.x = -.42; G.add(r);
      G.add(box(M.glassCyan, w-3, 2.6, .7, 0, h+4.6, z + d/n*.3));
    }
    // roller doors + apron
    for(let i=0;i<3;i++) G.add(box(ac.deep, w*.18, h*.55, .7, -w*.28+i*(w*.28), h*.28+1, d/2+.4));
    G.add(box(M.asphalt, w+4, .3, 14, 0, .3, d/2+11));
    // gantry rail
    for(const s of [-1,1]) G.add(box(M.metal, 1.2, h*.9, 1.2, s*(w/2+2.4), h*.45+1, -d/2+6));
    G.add(box(M.metal, w+6, 1.4, 2.4, 0, h*.9+1, -d/2+6));
    windowGrid(G, w, h, d, 5, 2, 4, -d/2-.2);
    return h+7;
  };

  T.hospital = (G,b,ac)=>{
    const {w,d,h} = b;
    G.add(box(M.shell, w+8, 5, d+8, 0, 2.5, 0));
    G.add(box(ac.glass, w+4, 3, d+4, 0, 3.4, 0));
    G.add(box(M.shell, w*.46, h, d, 0, h/2+5, 0));
    G.add(box(M.shell, w, h*.62, d*.34, 0, h*.31+5, 0));
    floorBands(G, M.shellWarm, w*.46, d, h+5, 7, 6);
    parapet(G, ac.solid, w*.46, d, h+6, 1.5, 1.8);
    windowGrid(G, w*.46, h+5, d, 3, Math.max(4,Math.round(h/11)), 8, d/2+.2);
    // helipad on the west wing
    const pad = cyl(M.asphalt, 11, .7, -w*.34, h*.62+6, 0); G.add(pad);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(9.2,.4,6,40), ac.lit);
    ring.rotation.x = Math.PI/2; ring.position.set(-w*.34, h*.62+6.5, 0); G.add(ring);
    G.add(box(M.shell, 2.2, .3, 8, -w*.34, h*.62+6.5, 0));
    G.add(box(M.shell, 7, .3, 2.2, -w*.34, h*.62+6.5, 0));
    // emergency apron marker
    G.add(box(ac.solid, 3.4, .8, 14, 0, 5.4, d/2+9));
    G.add(box(ac.solid, 14, .8, 3.4, 0, 5.4, d/2+9));
    G.add(box(M.asphalt, w*.7, .3, 18, 0, .35, d/2+13));
    return h+14;
  };

  T.plant = (G,b,ac)=>{
    const {w,h} = b;
    G.add(box(M.concrete, w+16, 1, b.d+16, 0, .5, 0));
    for(const s of [-1,1]){
      const pts=[];
      for(let i=0;i<=14;i++){
        const t=i/14, y=t*h;
        const r = 13*(.62 + .38*Math.pow(2*t-1, 2)) * (t>.92 ? 1.04 : 1);
        pts.push(new THREE.Vector2(r,y));
      }
      const lathe = new THREE.Mesh(new THREE.LatheGeometry(pts, 40), M.concrete);
      lathe.position.set(s*16, 1, 0); lathe.castShadow=true; lathe.receiveShadow=true;
      lathe.name = 'coolingTower'; G.add(lathe);
      const band = new THREE.Mesh(new THREE.TorusGeometry(8.6,.6,6,40), ac.solid);
      band.rotation.x=Math.PI/2; band.position.set(s*16, h*.52+1, 0); G.add(band);
      steam(G, s*16, h+4, 0, 6);
    }
    // switchyard
    G.add(box(M.metal, 26, 1.2, 14, 0, 8, b.d/2+4));
    for(let i=0;i<4;i++){
      G.add(box(M.metal, 1, 16, 1, -11+i*7.3, 8, b.d/2+4));
      G.add(box(M.glassCyan, 2.2, 2.2, 2.2, -11+i*7.3, 15, b.d/2+4));
    }
    return h+8;
  };

  T.silo = (G,b,ac)=>{
    const {w,d,h} = b;
    G.add(box(M.concrete, w+8, 1, d+8, 0, .5, 0));
    for(let i=0;i<3;i++){
      const r = 8 - i*.8, y = h*.5;
      const t = cyl(M.shellWarm, r, h*.62, -w/2+10+i*(w-20)/2, h*.31+1, -d/4);
      t.name='drum'; G.add(t);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(r+.2,.4,6,32), ac.solid);
      ring.rotation.x=Math.PI/2; ring.position.set(-w/2+10+i*(w-20)/2, h*.45, -d/4); G.add(ring);
    }
    // stacks
    for(const s of [-1,1]){
      const st = cyl(M.shell, 3.2, h, s*(w/2-8), h/2+1, d/4, 2.4); G.add(st);
      G.add(box(ac.solid, 7, 1.6, 7, s*(w/2-8), h*.86, d/4));
      steam(G, s*(w/2-8), h+3, d/4, 3.2);
    }
    G.add(box(M.metal, w*.5, 8, d*.28, 0, 5, d/2-4));
    return h+8;
  };

  T.solar = (G,b,ac)=>{
    const {w,d} = b;
    G.add(box(M.curb, w+8, .8, d+8, 0, .4, 0));
    const rows = 6, cols = 4;
    for(let i=0;i<rows;i++) for(let k=0;k<cols;k++){
      const x = -w/2+8 + k*((w-16)/(cols-1)), z = -d/2+6 + i*((d-12)/(rows-1));
      const p = box(M.solar, (w-16)/cols*.82, .4, 6.2, x, 3.2, z);
      p.rotation.x = -.55; G.add(p);
      G.add(box(M.metal, .6, 3, .6, x, 1.5, z));
    }
    const inv = box(M.shellWarm, 10, 4, 6, 0, 2.4, d/2+7); G.add(inv);
    G.add(box(ac.solid, 10.6, .9, 6.6, 0, 4.6, d/2+7));
    return 8;
  };

  T.turbine = (G,b,ac)=>{
    const {w,h} = b;
    G.add(box(M.curb, w+10, .6, b.d+10, 0, .3, 0));
    for(let i=0;i<3;i++){
      const x = -w/2 + i*(w/2), th = h*(i===1 ? 1 : .84);
      G.add(cyl(M.concrete, 4.2, 1.6, x, .8, 0));
      const t = cyl(M.shell, 1.9, th, x, th/2+1, 0, 1.0); t.name='windTower'; G.add(t);
      const nac = box(M.shellWarm, 4.6, 2.6, 2.6, x, th+1.4, 1.4); G.add(nac);
      const rotor = new THREE.Group(); rotor.position.set(x, th+1.4, 3);
      for(let k=0;k<3;k++){
        const bl = new THREE.Mesh(BOX, M.shell);
        bl.scale.set(1.6, th*.46, .5);
        bl.position.set(0, th*.23, 0);
        const arm = new THREE.Group(); arm.rotation.z = k*Math.PI*2/3; arm.add(bl);
        rotor.add(arm);
      }
      rotor.add(blob(ac.solid, 1.3, 0, 0, 0));
      G.add(rotor);
      spinners.push({o:rotor, speed:rnd(.7,1.05), axis:'z'});
    }
    return h+6;
  };

  T.dish = (G,b,ac)=>{
    const {w,h} = b;
    G.add(box(M.shell, w*.7, 14, b.d*.6, 0, 7, 8));
    G.add(box(ac.glass, w*.7-2, 5, .8, 0, 8, 8+b.d*.3));
    parapet(G, ac.solid, w*.7, b.d*.6, 15, 1.4, 1.7);
    // lattice mast
    const legs = [[-3,-3],[3,-3],[-3,3],[3,3]];
    for(const [lx,lz] of legs) G.add(cyl(M.metal, .55, h, lx*(1-.3), h/2, lz*(1-.3), .3));
    for(let i=1;i<Math.round(h/9);i++){
      const y=i*9, s=3.6*(1-y/h*.55);
      G.add(box(M.metal, s*2, .35, .35, 0, y, -s));
      G.add(box(M.metal, s*2, .35, .35, 0, y,  s));
      G.add(box(M.metal, .35, .35, s*2, -s, y, 0));
      G.add(box(M.metal, .35, .35, s*2,  s, y, 0));
    }
    const tip = blob(M.litWarm, 1.0, 0, h+2, 0); G.add(tip); windows.push(tip);
    for(let i=0;i<3;i++){
      const dsh = new THREE.Mesh(new THREE.SphereGeometry(5.4, 22, 12, 0, Math.PI*2, 0, Math.PI*.34), M.shell);
      dsh.castShadow = true;
      dsh.position.set(Math.cos(i*2.2)*7, 22+i*13, Math.sin(i*2.2)*7);
      dsh.rotation.set(-1.1, i*2.2, 0); dsh.name='uplinkDish'; G.add(dsh);
      G.add(cyl(M.metal, .3, 5, Math.cos(i*2.2)*4.2, 22+i*13, Math.sin(i*2.2)*4.2, .3));
    }
    return h+6;
  };

  /* ---------- landmark models: authored elsewhere at their own scale ----------
     Each builder returns a finished object; here it is measured, scaled to the
     slot's plan dimensions, seated on a podium and centred on the anchor. */
  const _mb = new THREE.Box3(), _mv = new THREE.Vector3();
  function placeModel(G, b, ac){
    let obj;
    try { obj = LANDMARKS[b.model](THREE); }
    catch(e){ console.warn('landmark ' + b.model + ' failed', e); return null; }
    if(!obj) return null;
    _mb.setFromObject(obj);
    _mb.getSize(_mv);
    const sx = Math.max(_mv.x, .001), sy = Math.max(_mv.y, .001), sz = Math.max(_mv.z, .001);
    const s = Math.min((b.w*1.15)/sx, (b.d*1.15)/sz, (b.h*1.8)/sy);
    obj.position.set(-(_mb.min.x+_mb.max.x)/2, -_mb.min.y, -(_mb.min.z+_mb.max.z)/2);
    obj.traverse(o => { if(o.isMesh){ o.castShadow = true; o.receiveShadow = true; } });
    const holder = new THREE.Group();
    holder.scale.setScalar(s);
    holder.position.y = 2.1;
    holder.add(obj);
    G.add(box(M.concrete, sx*s + 7, 1.8, sz*s + 7, 0, .9, 0));
    G.add(box(ac.solid, sx*s + 7.6, .3, sz*s + 7.6, 0, 1.95, 0));
    G.add(holder);
    return sy*s + 2.1;
  }

  /* ---------- background infill so plates read as built-up ground ---------- */
  let RECTS = [], CROSS = false;
  /* live lanes: the ring roadway band and, on n-s plates, the cross street */
  const RB0 = 78, RB1 = 94;
  const inRoad = (v0, v1) => v1 > RB0 && v0 < RB1;        // span vs the ring band, either sign
  function onRoad(x,z,w,d){
    const ax0 = Math.abs(x) - w/2, ax1 = Math.abs(x) + w/2;
    const az0 = Math.abs(z) - d/2, az1 = Math.abs(z) + d/2;
    if(inRoad(ax0, ax1) || inRoad(az0, az1)) return true;
    if(CROSS && x - w/2 < 20 && x + w/2 > 0) return true;
    return false;
  }
  const occupied = (x,z,w,d,pad=6) =>
    onRoad(x,z,w+pad*.5,d+pad*.5) ||
    RECTS.some(r => Math.abs(x-r.x) < r.w/2 + w/2 + pad && Math.abs(z-r.z) < r.d/2 + d/2 + pad);
  function claim(x,z,w,d){ RECTS.push({x,z,w,d}); return {x,z}; }
  /* nudges a prop anchor off any footprint or live lane; null when nowhere near it is free */
  function fit(x,z,w,d,pad=6,keep=false){
    if(!occupied(x,z,w,d,pad)) return keep ? {x,z} : claim(x,z,w,d);
    for(const rad of [9,17,25,34,44]) for(let a=0;a<8;a++){
      const nx = x + Math.cos(a*Math.PI/4)*rad, nz = z + Math.sin(a*Math.PI/4)*rad;
      if(Math.abs(nx) + w/2 > 76 || Math.abs(nz) + d/2 > 76) continue;
      if(!occupied(nx,nz,w,d,pad)) return keep ? {x:nx,z:nz} : claim(nx,nz,w,d);
    }
    return null;
  }

  function infill(plate, D, ac){
    const spots = [];
    for(let x=-66;x<=66;x+=24) for(let z=-66;z<=66;z+=24) spots.push([x,z]);
    let made = 0;
    for(const [sx,sz] of spots){
      if(made >= 8) break;
      if(Math.abs(sz) < 15) continue;                            // keep the accent plaza band clear
      if(D.cross === 'ns' && sx > -10 && sx < 28) continue;        // keep the cross street clear
      const x = sx + rnd(-4,4), z = sz + rnd(-4,4);
      const w = rnd(15,23), d = rnd(15,23);
      if(occupied(x,z,w,d,9)) continue;
      if(Math.random() < .3) continue;
      const h = rnd(9,30);
      const G = new THREE.Group(); G.position.set(x,0,z); G.rotation.y = rnd(-.05,.05);
      G.name = 'infill';
      G.add(box(M.shell, w, h, d, 0, h/2, 0));
      G.add(box(pick([M.glassCyan, ac.glass]), w*.8, Math.min(3.4, h*.3), .8, 0, Math.min(2.6, h*.3), d/2+.15));
      for(let y=5; y<h-1.5; y+=4.4) G.add(box(M.shellWarm, w+.4, .45, d+.4, 0, y, 0));
      parapet(G, ac.solid, w, d, h+.8, 1.1, 1.2);
      G.add(box(M.solar, w-5, .4, d-5, 0, h+.3, 0));
      for(let k=0;k<2;k++){
        const wm = new THREE.Mesh(BOX, pick(WINDOW_MATS));
        wm.scale.set(w*.3, h*.16, .5);
        wm.position.set(-w*.2 + k*w*.4, h*.62, -d/2-.2);
        G.add(wm); windows.push(wm);
      }
      plate.add(G); made++; claim(x,z,w,d);
    }
  }

  /* ---------- streetscape: the prop density of the founding block ---------- */
  const CARC = [0x2E7BD6,0xF0F2F4,0xE0533C,0xF2C33D,0x3EB6A0,0x5D6470,0xE07C2E,0x9B5DE0]
    .map(c=>new THREE.MeshStandardMaterial({color:c, roughness:.35, metalness:.15}));

  function parkedCar(plate, x, z, ry){
    const G = new THREE.Group(); G.position.set(x,0,z); G.rotation.y = ry;
    G.name = 'parkedCar';
    G.add(box(pick(CARC), 4.6, 1.3, 2.1, 0, 1.15, 0));
    G.add(box(M.glassCyan, 2.5, 1.0, 1.85, -.2, 2.2, 0));
    for(const [wx,wz] of [[-1.5,-1.05],[1.5,-1.05],[-1.5,1.05],[1.5,1.05]])
      G.add(cyl(M.asphalt, .5, .35, wx, .5, wz));
    plate.add(G); return G;
  }
  function planter(plate, x, z, w, d, ac){
    const G = new THREE.Group(); G.position.set(x,0,z); G.name='planter';
    G.add(box(M.shell, w, 1.6, d, 0, .8, 0));
    G.add(box(ac.solid, w-.8, .5, d-.8, 0, 1.5, 0));
    const n = Math.max(2, Math.round(w/4));
    for(let i=0;i<n;i++){
      const b = blob(pick([M.leafA, M.leafB]), rnd(1.1,1.9), -w/2+w/(n+1)*(i+1)+rnd(-.6,.6), 2.6, rnd(-d*.2,d*.2));
      G.add(b); swayers.push({o:b, amp:.05, phase:Math.random()*6.3, axis:'x'});
    }
    plate.add(G); return G;
  }
  function bollards(plate, x, z, n, dx, dz){
    for(let i=0;i<n;i++) plate.add(cyl(M.metal, .32, 1.7, x+i*dx, .85, z+i*dz, .26));
  }
  function truck(plate, x, z, ry, ac, len=13){
    const G = new THREE.Group(); G.position.set(x,0,z); G.rotation.y=ry; G.name='truck';
    G.add(box(M.shell, 5.4, 3.4, 3.0, -len/2+2.7, 2.4, 0));
    G.add(box(M.glassCyan, .7, 1.5, 2.6, -len/2+.2, 3.0, 0));
    G.add(box(ac.deep, len-5.6, 4.2, 3.2, 2.9, 2.9, 0));
    for(const sx of [-len/2+2.6, len/2-4.4, len/2-1.6]) for(const sz of [-1.65,1.65])
      G.add(cyl(M.asphalt, .8, .55, sx, .8, sz));
    plate.add(G); return G;
  }
  function container(plate, x, z, ry, mat, h=1){
    const G = new THREE.Group(); G.position.set(x,0,z); G.rotation.y=ry; G.name='container';
    for(let i=0;i<h;i++) G.add(box(i%2?mat:M.metal, 12.2, 2.9, 3.2, 0, 1.5+i*3.0, 0));
    plate.add(G); return G;
  }

  const kerb = o => { if(o) o.userData.kerbside = true; return o; };
  function streetscape(plate, D, ac){
    // lighting along both ring edges + the cross street
    const clear = (x,z,pad=3) =>                              // kerbside kit: footprints only
      !RECTS.some(r => Math.abs(x-r.x) < r.w/2 + 1.5 + pad && Math.abs(z-r.z) < r.d/2 + 1.5 + pad);
    for(const z of [-70,-42,-12,18,48,72]){
      if(clear(-77,z)) kerb(prop(plate, props.lamp, -77, z, Math.PI/2));
      if(clear(77,z))  kerb(prop(plate, props.lamp, 77, z, -Math.PI/2));
    }
    for(const x of [-70,-42,-12,18,48,72]){
      if(clear(x,-77)) kerb(prop(plate, props.lamp, x, -77, 0));
      if(clear(x,77))  kerb(prop(plate, props.lamp, x, 77, Math.PI));
    }
    if(D.cross==='ns') for(let i=0;i<6;i++){
      const lx = i%2?.5:19.5, lz = -70+i*28;
      if(clear(lx,lz)) kerb(prop(plate, props.lamp, lx, lz, i%2?Math.PI:0));
    }
    // signals at the crossings and two corners
    for(const [tx,tz,tr] of [[-8,-72,0],[8,72,Math.PI],[-72,-8,-Math.PI/2],[72,8,Math.PI/2],
                             [-72,-72,-Math.PI/2],[72,72,Math.PI/2]])
      if(clear(tx,tz,4)) kerb(prop(plate, props.trafficLight, tx, tz, tr));
    // plaza band furniture
    for(const [bx,bz,br] of [[-54,-12,.18],[-30,12,-.18],[34,-12,.12],[56,12,Math.PI/2]]){
      const f = fit(bx,bz,6,3,3); if(f) prop(plate, props.bench, f.x, f.z, br);
    }
    for(const [kx,kz,kr] of [[-18,13,.3],[44,-14,-.4]]){
      const f = fit(kx,kz,7,5,4); if(f) prop(plate, props.kiosk, f.x, f.z, kr);
    }
    { let placed = 0;
      for(let i=0;i<9;i++){
        const bxx = -66 + i*7;
        if(!occupied(bxx,18,3,3,3)){ bollards(plate, bxx, 18, 1, 0, 0); placed++; }
      }
    }
    for(const [px,pz,pw] of [[-60,-14,14],[8,14,16],[62,-14,12]]){
      const f = fit(px,pz,pw,7,4); if(f) planter(plate, f.x, f.z, pw, 6, ac);
    }
    // palms mark the plaza; verge trees sit between ring road and plate edge
    for(const [px,pz] of [[-34,-14],[-10,-14],[14,14],[38,14],[-64,44],[64,44]]){
      const f = fit(px,pz,5,5,4); if(f) prop(plate, props.palm, f.x, f.z, rnd(11,15));
    }
    for(const z of [-56,-26,4,34,64]){ kerb(prop(plate, props.tree, -96, z, rnd(.7,1.1))); kerb(prop(plate, props.tree, 96, z, rnd(.7,1.1))); }
    for(const x of [-56,-26,4,34,64]){ kerb(prop(plate, props.tree, x, -96, rnd(.7,1.1))); kerb(prop(plate, props.tree, x, 96, rnd(.7,1.1))); }
    // parked cars in the bays
    for(let i=0;i<9;i++){
      if(Math.random()<.25) continue;
      kerb(parkedCar(plate, -68+i*13 + rnd(-1,1), -75.5, Math.PI/2 + rnd(-.03,.03)));
    }
    for(let i=0;i<9;i++){
      if(Math.random()<.35) continue;
      kerb(parkedCar(plate, -68+i*13 + rnd(-1,1), 75.5, -Math.PI/2 + rnd(-.03,.03)));
    }
  }

  /* ---------- one signature ground set per district ---------- */
  const SIG = {
    tech(plate, ac){
      for(const [x,z] of [[-16,58],[16,58]]){                        // shuttle stops
        const f = fit(x,z,13,7,5); if(!f) continue;
        plate.add(box(M.shell, 12, .4, 4.4, f.x, 3.6, f.z));
        plate.add(box(ac.glass, 11, 3.2, .4, f.x, 1.8, f.z-2));
        for(const sx of [-5,5]) plate.add(cyl(M.metal, .28, 3.6, f.x+sx, 1.8, f.z+2, .24));
      }
      { const f = fit(-40,66,13,5,4); if(f) truck(plate, f.x, f.z, 0, ac, 11); }
      for(let i=0;i<3;i++){                                          // bike racks
        const f = fit(-60+i*13, 24, 10, 3, 4); if(!f) continue;
        plate.add(box(M.metal, 9, .3, .3, f.x, 1.5, f.z));
        for(const sx of [-4,0,4]) plate.add(cyl(M.metal, .22, 1.5, f.x+sx, .75, f.z));
      }
    },
    ai(plate, ac){
      for(let i=0;i<4;i++){                                          // dry-cooler yard
        const f = fit(-58+i*15, 66, 11, 7, 4); if(!f) continue;
        plate.add(box(M.metal, 10, 4.4, 6, f.x, 2.2, f.z));
        plate.add(box(ac.deep, 9, .5, 5, f.x, 4.7, f.z));
      }
      for(let i=0;i<5;i++){                                          // fibre trench covers
        const f = fit(26+i*7, 62, 4, 26, 3); if(!f) continue;
        plate.add(box(M.concrete, 3.4, .5, 26, f.x, .35, f.z));
      }
      for(const [x,z] of [[62,-70],[70,-62]]){                       // cable spools
        const f = fit(x,z,7,7,4); if(f) plate.add(cyl(M.shellWarm, 3.2, 2.2, f.x, 1.1, f.z));
      }
    },
    crypto(plate, ac){
      { const f = fit(-14,66,11,5,4); if(f) truck(plate, f.x, f.z, .1, ac, 9); }
      for(let i=0;i<3;i++){                                          // generator containers
        const f = fit(34, 60+i*5, 13, 4, 3); if(f) container(plate, f.x, f.z, 0, ac.deep, 1);
      }
      const q = fit(-53, 22, 29, 3, 3);                              // queue rail
      if(q){
        for(let i=0;i<7;i++) plate.add(cyl(M.metal, .26, 1.4, q.x-13+i*4.4, .7, q.z, .22));
        plate.add(box(M.metal, 27, .2, .2, q.x, 1.4, q.z));
      }
    },
    finance(plate, ac){
      for(let i=0;i<5;i++){                                          // flag row on the square
        const f = fit(-50+i*9, 20, 7, 5, 5); if(!f) continue;
        plate.add(cyl(M.metal, .24, 15, f.x, 7.5, f.z, .18));
        plate.add(box(ac.solid, 5.4, 3.2, .2, f.x+3, 13.4, f.z));
      }
      const sc = fit(40, 22, 19, 4, 5);                               // plaza screen
      if(sc){
        plate.add(box(M.shell, 18, 9, 1.6, sc.x, 5.5, sc.z));
        plate.add(box(ac.lit, 16.4, 7.6, .5, sc.x, 5.5, sc.z+.9));
      }
      for(let i=0;i<4;i++){                                           // taxi rank
        const f = fit(-30+i*7.5, 66, 6, 3, 3); if(f) kerb(parkedCar(plate, f.x, f.z, 0));
      }
    },
    healthcare(plate, ac){
      const cn = fit(-34, 62, 27, 13, 5);                             // ambulance canopy
      if(cn){
        plate.add(box(M.shell, 26, .9, 12, cn.x, 6.4, cn.z));
        for(const sx of [-11,11]) for(const sz of [-4.6,4.6])
          plate.add(cyl(M.metal, .42, 6.4, cn.x+sx, 3.2, cn.z+sz, .34));
      }
      for(let i=0;i<2;i++){
        const f = fit(-42+i*17, 62, 6, 10, 3); if(!f) continue;
        const amb = truck(plate, f.x, f.z, Math.PI/2, ac, 8);
        amb.children[2].material = M.shell;
        const bar = box(M.litCyan, 2.2, .5, 1.4, 0, 4.4, 0); amb.add(bar); windows.push(bar);
      }
      { const f = fit(30, 64, 13, 13, 4); if(f) plate.add(box(ac.solid, 12, .3, 12, f.x, .35, f.z)); }
    },
    energy(plate, ac){
      for(let i=0;i<3;i++){                                            // transformer yard
        const f = fit(-58+i*14, 66, 9, 9, 4); if(!f) continue;
        plate.add(box(M.metal, 8, 5.4, 8, f.x, 2.7, f.z));
        for(const sx of [-2.4,0,2.4]) plate.add(cyl(M.shellWarm, .8, 3, f.x+sx, 6.6, f.z, .8));
      }
      for(let i=0;i<3;i++){                                            // hydrogen tanks
        const f = fit(30+i*9, 64, 6, 6, 4); if(f) plate.add(cyl(M.shell, 2.6, 16, f.x, 8, f.z, 2.6));
      }
      const pr = fit(4, 8, 24, 5, 4) || fit(-14, 62, 24, 5, 4);          // pipe rack on trestles
      if(pr){
        for(let i=0;i<5;i++){
          const p = cyl(M.metal, .5, 22, pr.x, 5.4 + i*1.6, pr.z, .5);
          p.rotation.z = Math.PI/2; plate.add(p);
        }
        for(let k=0;k<3;k++){
          const tx = pr.x - 9 + k*9;
          for(const sz of [-1.6,1.6]) plate.add(box(M.metal, .8, 5.4, .8, tx, 2.7, pr.z+sz));
          plate.add(box(M.metal, 1.2, .6, 4.4, tx, 5.4, pr.z));
        }
      }
    },
    media(plate, ac){
      for(let i=0;i<3;i++){                                            // OB trucks
        const f = fit(-52+i*18, 64, 16, 5, 4); if(f) truck(plate, f.x, f.z, 0, ac, 14);
      }
      for(const [x,z] of [[26,58],[44,66],[62,58]]){                    // light towers
        const f = fit(x,z,6,6,6); if(!f) continue;
        plate.add(cyl(M.metal, .5, 18, f.x, 9, f.z, .4));
        plate.add(box(M.litWarm, 4.4, 1.6, 1.2, f.x, 18.4, f.z));
      }
      for(let i=0;i<4;i++){                                            // exterior street set flats
        const f = fit(-60+i*13, 22, 12, 4, 4); if(!f) continue;
        plate.add(box(M.shellWarm, 11, 12, 1.2, f.x, 6, f.z));
        plate.add(box(ac.glass, 8, 3.4, .4, f.x, 8.4, f.z-.7));
      }
    },
    manufacturing(plate, ac){
      for(const [x,z,h,mt] of [[-52,64,3,ac.deep],[-52,69,2,ac.solid],[-34,64,2,ac.deep]]){
        const f = fit(x,z,13,4,3); if(f) container(plate, f.x, f.z, 0, mt, h);
      }
      for(let i=0;i<2;i++){                                            // flatbeds
        const f = fit(24+i*20, 66, 17, 5, 4); if(f) truck(plate, f.x, f.z, Math.PI, ac, 15);
      }
      const gy = fit(22, 58, 40, 6, 5);                                  // yard gantry
      if(gy){
        plate.add(box(M.metal, 38, 1.6, 2.4, gy.x, 15, gy.z));
        for(const sx of [-18,18]) plate.add(box(M.metal, 1.6, 15, 1.6, gy.x+sx, 7.5, gy.z));
      }
      for(let i=0;i<4;i++){                                            // pallet stacks
        const f = fit(-66+i*7, 22, 6, 6, 3); if(f) plate.add(box(M.shellWarm, 5, 2.2, 5, f.x, 1.1, f.z));
      }
    }
  };

  /* ---------- buildable envelope: measure what was actually built, then confine it ----------
     Authored anchors only describe the mass; every typology adds aprons, podium skirts and
     helipads on top of it, so the real footprint is measured here and kept inside |HALF|. */
  const HALF = 76;
  const _b3 = new THREE.Box3();
  function footprint(G){
    G.updateWorldMatrix(true, true);
    _b3.makeEmpty();
    G.traverse(o => { if(o.isMesh && o.geometry) _b3.expandByObject(o); });
    return {x0:_b3.min.x, x1:_b3.max.x, z0:_b3.min.z, z1:_b3.max.z};
  }
  /* the cross street is a second forbidden band, not just an envelope edge */
  const XB0 = 0, XB1 = 20;
  function dodgeCross(r){
    if(!CROSS) return r;
    const w = r.x1 - r.x0, d = r.z1 - r.z0;
    if(r.x1 <= XB0 - 1.5 || r.x0 >= XB1 + 1.5) return r;
    const west = -1.5 - r.x1, east = XB1 + 1.5 - r.x0;         // shift needed either way
    const okW = r.x0 + west >= -HALF, okE = r.x1 + east <= HALF;
    let dx = 0;
    if(okW && okE) dx = Math.abs(west) <= Math.abs(east) ? west : east;
    else if(okW) dx = west;
    else if(okE) dx = east;
    else return r;                                             // too wide for either side
    return {x0:r.x0+dx, x1:r.x1+dx, z0:r.z0, z1:r.z1};
  }
  function confine(placed){
    for(const p of placed){
      const f = p.f, w = f.x1-f.x0, d = f.z1-f.z0;
      if(w > HALF*2 || d > HALF*2){                       // too big for the plate: scale about its anchor
        const s = Math.min(HALF*2/w, HALF*2/d) * .98;
        p.G.scale.setScalar(s);
        const ax = p.G.position.x, az = p.G.position.z;
        f.x0 = ax + (f.x0-ax)*s; f.x1 = ax + (f.x1-ax)*s;
        f.z0 = az + (f.z0-az)*s; f.z1 = az + (f.z1-az)*s;
      }
      let dx = 0, dz = 0;
      if(f.x1 > HALF) dx = HALF - f.x1; else if(f.x0 < -HALF) dx = -HALF - f.x0;
      if(f.z1 > HALF) dz = HALF - f.z1; else if(f.z0 < -HALF) dz = -HALF - f.z0;
      p.f = dodgeCross({x0:f.x0+dx, x1:f.x1+dx, z0:f.z0+dz, z1:f.z1+dz});
    }
    for(let pass=0; pass<24; pass++){                      // push apart anything the shift collided
      let moved = false;
      for(let i=0;i<placed.length;i++) for(let k=i+1;k<placed.length;k++){
        const a = placed[i].f, b = placed[k].f;
        const ox = Math.min(a.x1,b.x1) - Math.max(a.x0,b.x0);
        const oz = Math.min(a.z1,b.z1) - Math.max(a.z0,b.z0);
        if(ox <= 2 || oz <= 2) continue;
        moved = true;
        const push = (r, mx, mz) => {
          const w = r.x1-r.x0, d = r.z1-r.z0;
          const nx = THREE.MathUtils.clamp(r.x0+mx, -HALF, HALF - w);
          const nz = THREE.MathUtils.clamp(r.z0+mz, -HALF, HALF - d);
          return dodgeCross({x0:nx, x1:nx+w, z0:nz, z1:nz+d});
        };
        const s = (ox < oz) ? [ (a.x0<b.x0?-1:1)*(ox/2+.6), 0 ] : [ 0, (a.z0<b.z0?-1:1)*(oz/2+.6) ];
        placed[i].f = push(a,  s[0],  s[1]);
        placed[k].f = push(b, -s[0], -s[1]);
      }
      if(!moved) break;
    }
    for(const p of placed){                                // anything still on the cross street is too wide: shrink it
      const r = p.f, w = r.x1-r.x0;
      if(!CROSS || (r.x1 <= XB0-1.5 || r.x0 >= XB1+1.5)) continue;
      const room = Math.max(HALF - (XB1+1.5), HALF - 1.5) ;
      const s = Math.min(1, (room / w) * .98);
      p.G.scale.multiplyScalar(s);
      const cx = (r.x0+r.x1)/2, cz = (r.z0+r.z1)/2;
      p.f = {x0:cx-w*s/2, x1:cx+w*s/2, z0:cz-(r.z1-r.z0)*s/2, z1:cz+(r.z1-r.z0)*s/2};
      p.f = dodgeCross(p.f);
    }
    for(const p of placed){                                // apply the resolved centres
      p.G.position.x = (p.f.x0 + p.f.x1)/2 + p.cx;
      p.G.position.z = (p.f.z0 + p.f.z1)/2 + p.cz;
      p.rect = {x:(p.f.x0+p.f.x1)/2, z:(p.f.z0+p.f.z1)/2, w:p.f.x1-p.f.x0, d:p.f.z1-p.f.z0};
    }
  }

  /* ---------- final sweep: nothing may sit inside a building footprint ---------- */
  function sweep(plate, D, rects){
    for(const c of [...plate.children]){
      if(c.userData.ground) continue;                                    // paving, curb, podium slab
      if(D.buildings.some(b => b.ticker === c.name)) continue;           // the buildings themselves
      if(c.isSprite) continue;
      const p = c.position;
      if(c.userData.kerbside) continue;                                 // lamps, signals, parked cars, pylon
      if(rects.some(r => Math.abs(p.x-r.x) < r.w/2 + 1 && Math.abs(p.z-r.z) < r.d/2 + 1)
         || onRoad(p.x, p.z, 3, 3)) plate.remove(c);
    }
  }

  /* ---------- assemble ---------- */
  for(const D of DISTRICTS){
    if(D.builtin) continue;
    const ac = A(D.accent);
    const plate = new THREE.Group();
    plate.position.set(D.cx, 0, D.cz);
    plate.name = 'district_' + D.id;
    scene.add(plate);
    districtGroups[D.id] = plate;

    // ground + slab
    const top = new THREE.Mesh(new THREE.PlaneGeometry(200,200),
      new THREE.MeshStandardMaterial({map:plateTexture(D.accent, D.cross), roughness:.9}));
    top.rotation.x = -Math.PI/2; top.position.y = .02; top.receiveShadow = true;
    top.name = D.id+'Surface'; top.userData.ground = true; plate.add(top);
    for(const g of [box(M.curb, 200, 5, 200, 0, -3.1, 0), box(M.concrete, 206, 1.2, 206, 0, -5.8, 0)]){
      g.userData.ground = true; plate.add(g);
    }

    // zone tint for the Districts layer
    const zone = new THREE.Mesh(new THREE.PlaneGeometry(190,190),
      new THREE.MeshBasicMaterial({color:new THREE.Color(D.accent), transparent:true, opacity:.22, depthWrite:false}));
    zone.rotation.x=-Math.PI/2; zone.position.set(D.cx, .19, D.cz); zone.renderOrder=2;
    zoneLayer.add(zone);

    // entry pylon on the plate's inner corner, facing the centre
    const pylon = new THREE.Group();
    const sx = D.cx === 0 ? 0 : (D.cx > 0 ? -1 : 1);
    const sz = D.cz === 0 ? 0 : (D.cz > 0 ? -1 : 1);
    pylon.position.set(sx*62 || 62, 0, sz*84 || 84);
    pylon.add(cyl(M.shell, 1.4, 20, 0, 10, 0, 1.4));
    pylon.add(box(ac.solid, 3.2, 21, 3.2, 0, 10.5, 0));
    pylon.userData.kerbside = true; plate.add(pylon);
    plate.add(tickerSprite(D.tag.toUpperCase().slice(0,14), D.accent, pylon.position.x, 26, pylon.position.z, 34, D.name));

    // buildings
    CROSS = D.cross === 'ns';
    const placed = [];
    for(const b of D.buildings){
      const G = new THREE.Group();
      G.position.set(b.x, 0, b.z);
      G.rotation.y = (b.ry || 0);
      G.name = b.ticker;
      const modelled = b.model && LANDMARKS[b.model];
      const topY = (modelled && placeModel(G, b, ac)) || (T[b.type] || T.slab)(G, b, ac);
      if(b.crawl){
        const band = crawlBand(b.w*.9, 3.6, D.accent);
        band.position.set(0, Math.min(topY*.5, 26), b.d/2 + 1.2);
        G.add(band);
      }
        if(b.h >= 70 && !modelled){                      // glass cabs on the plaza face
        for(let k=0;k<2;k++){
          const cab = box(M.litWarm, 3.2, 2.8, 1.8, (k?-1:1)*b.w*.22, 12, b.d/2+.9);
          G.add(cab); elevators.push({o:cab, base:8, span:b.h-16, speed:rnd(.07,.11), ph:Math.random()*6.3});
        }
      }
      if(!modelled && (b.type === 'slab' || b.type === 'campus')){  // living wall on the shaded face
        for(let y=6; y<b.h-4; y+=5.5){
          G.add(box(M.leafA, b.w*.72, 1.4, .7, 0, y, -b.d/2-.35));
          if(Math.random()<.5) G.add(box(M.leafB, b.w*.3, 1.2, .8, rnd(-b.w*.2,b.w*.2), y+2.4, -b.d/2-.4));
        }
      }
      const f = footprint(G);        // measured unparented, so these are plate-local coords
      plate.add(G);
      placed.push({G, b, topY, f, cx:G.position.x - (f.x0+f.x1)/2, cz:G.position.z - (f.z0+f.z1)/2});
    }
    confine(placed);
    for(const p of placed){
      p.G.add(tickerSprite(p.b.ticker, D.accent, 0, p.topY + 9, 0, 26));
      register(p.G, {
        name: p.b.name, ticker: p.b.ticker, tier: D.tag, district: D.name, districtId: D.id,
        accent: D.accent, desc: p.b.desc, h: p.b.h + ' m', hm: p.topY, p: p.b.program
      });
    }

    const BRECTS = placed.map(p => p.rect);
    RECTS = BRECTS.map(r => ({...r}));
    RECTS.push({x:pylon.position.x, z:pylon.position.z, w:6, d:6});
    infill(plate, D, ac);
    streetscape(plate, D, ac);
    (SIG[D.id] || (()=>{}))(plate, ac);
    if(D.id === 'tech' || D.id === 'healthcare' || D.id === 'media'){
      const f = fit(-20, 4, 16, 16, 4); if(f) prop(plate, props.fountain, f.x, f.z);
    } else {
      for(const fz of [6, 18]){ const f = fit(-24, fz, 5, 5, 5); if(f) prop(plate, props.flagPole, f.x, f.z); }
    }
    for(let i=0;i<14;i++){
      const tx = rnd(-88,88), tz = rnd(-88,88);
      if(Math.abs(tx) < 76 && Math.abs(tz) < 76) continue;
      ctx.treeAt(plate, tx, tz, rnd(.6,1.0));
    }
    for(let i=0;i<6;i++) ctx.treeAt(plate, rnd(-66,66), rnd(-6,10), rnd(.7,1.1));
    sweep(plate, D, BRECTS);
  }

  return { tickers, districtGroups };
}
