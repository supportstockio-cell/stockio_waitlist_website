
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DISTRICTS, PITCH } from './districts.js';
import { buildDistricts } from './district-build.js';

/* ---------- palette + materials ---------- */
const C = {
  shell:0xF3F5F7, shellWarm:0xE9EBEE, concrete:0xD3D8DD, curb:0xC2C8CE,
  glassBlue:0x1E4FC8, glassDeep:0x123A9E, glassCyan:0x7FD1EE, glassTeal:0x2E9AB8,
  leafA:0x4FA524, leafB:0x76C63C, leafC:0x2F7C1D, grass:0x7BB84A,
  orange:0xE2873A, asphalt:0x3B4046, solar:0x2B3A4A, metal:0x9AA3AC,
  darkCity:0x5A6478, darkCityB:0x6B748A, litWarm:0xFFCE7A, litCyan:0x9FE6FF
};
const M = {};
const std = (name,color,o={}) => (M[name]=new THREE.MeshStandardMaterial(Object.assign({color,roughness:.62,metalness:.02,flatShading:false},o)),M[name]);
std('shell',C.shell,{roughness:.5});
std('shellWarm',C.shellWarm,{roughness:.55});
std('concrete',C.concrete,{roughness:.85});
std('curb',C.curb,{roughness:.9});
std('glass',C.glassBlue,{roughness:.16,metalness:.42});
std('glassDeep',C.glassDeep,{roughness:.18,metalness:.4});
std('glassCyan',C.glassCyan,{roughness:.12,metalness:.3});
std('glassTeal',C.glassTeal,{roughness:.15,metalness:.35});
std('leafA',C.leafA,{roughness:.9,flatShading:true});
std('leafB',C.leafB,{roughness:.9,flatShading:true});
std('leafC',C.leafC,{roughness:.9,flatShading:true});
std('grass',C.grass,{roughness:.95});
std('orange',C.orange,{roughness:.55});
std('asphalt',C.asphalt,{roughness:.95});
std('solar',C.solar,{roughness:.3,metalness:.55});
std('metal',C.metal,{roughness:.4,metalness:.7});
std('trunk',0x8A6A4A,{roughness:.9});
std('dark',C.darkCity,{roughness:.8});
std('litWarm',C.litWarm,{roughness:.4,emissive:new THREE.Color(C.litWarm),emissiveIntensity:.9});
std('litCyan',C.litCyan,{roughness:.4,emissive:new THREE.Color(C.litCyan),emissiveIntensity:.7});
std('winOff',0x4A5C74,{roughness:.25,metalness:.3});
const WINDOW_MATS = [M.litWarm, M.litCyan, M.winOff, M.winOff];

/* ---------- scene ---------- */
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({antialias:true, preserveDrawingBuffer:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.98;
document.getElementById('stage').appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(34, 2, 1, 3000);
camera.position.set(700, 520, 780);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 22, 0);
controls.enableDamping = true; controls.dampingFactor = .08;
controls.minDistance = 60; controls.maxDistance = 2000;
controls.minPolarAngle = .22; controls.maxPolarAngle = 1.32;
controls.enablePan = true; controls.panSpeed = .8; controls.screenSpacePanning = false;

/* sky */
(function sky(){
  const c = document.createElement('canvas'); c.width=8; c.height=256;
  const g = c.getContext('2d'); const grad = g.createLinearGradient(0,0,0,256);
  grad.addColorStop(0,'#0D0906'); grad.addColorStop(.45,'#1E140D'); grad.addColorStop(.72,'#432814'); grad.addColorStop(1,'#8A5324');
  g.fillStyle=grad; g.fillRect(0,0,8,256);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const dome = new THREE.Mesh(new THREE.SphereGeometry(3400,40,24), new THREE.MeshBasicMaterial({map:tex,side:THREE.BackSide}));
  dome.name='sky'; scene.add(dome);
})();
scene.fog = new THREE.Fog(0x241710, 620, 2850);

/* lights */
scene.add(new THREE.HemisphereLight(0x4A3524, 0x120E0A, .58));
const sun = new THREE.DirectionalLight(0xFFB863, 1.9);
sun.position.set(520, 700, 340);
sun.castShadow = true;
sun.shadow.mapSize.set(4096,4096);
const sc = sun.shadow.camera;
sc.left=-470; sc.right=470; sc.top=470; sc.bottom=-470; sc.near=150; sc.far=2100;
sun.shadow.bias = -0.0012; sun.shadow.normalBias = .9;
scene.add(sun);
const fill = new THREE.DirectionalLight(0x7C93C4, .3); fill.position.set(-160,120,-180); scene.add(fill);

/* ---------- helpers ---------- */
const BOX = new THREE.BoxGeometry(1,1,1);
const SPH = new THREE.SphereGeometry(1,10,7);
const CYL = new THREE.CylinderGeometry(1,1,1,16);
function box(mat,w,h,d,x,y,z,ry=0,shadow=true){
  const m = new THREE.Mesh(BOX,mat); m.scale.set(w,h,d); m.position.set(x,y,z); m.rotation.y=ry;
  m.castShadow=shadow; m.receiveShadow=shadow; return m;
}
function cyl(mat,r,h,x,y,z,rt=r){
  const g = new THREE.CylinderGeometry(rt,r,h,18);
  const m = new THREE.Mesh(g,mat); m.position.set(x,y,z); m.castShadow=true; m.receiveShadow=true; return m;
}
function blob(mat,r,x,y,z){
  const m = new THREE.Mesh(SPH,mat); m.scale.setScalar(r); m.position.set(x,y,z); m.castShadow=true; return m;
}
const rnd = (a,b)=>a+Math.random()*(b-a);
const pick = a=>a[(Math.random()*a.length)|0];

/* ---------- ground texture (roads, plaza, lawns) ---------- */
function groundTexture(){
  const S=2048, W=200, c=document.createElement('canvas'); c.width=c.height=S;
  const g=c.getContext('2d');
  const u = v => (v+W/2)/W*S;            // world → canvas px
  const p = m => m/W*S;                  // metres → px
  const rect=(x,z,w,d,fill)=>{g.fillStyle=fill;g.fillRect(u(x),u(z),p(w),p(d));};
  g.fillStyle='#E4E8EC'; g.fillRect(0,0,S,S);

  // paving grid across the whole plate
  g.strokeStyle='rgba(40,50,64,.055)'; g.lineWidth=2;
  for(let i=-100;i<=100;i+=4){ g.beginPath(); g.moveTo(u(i),0); g.lineTo(u(i),S); g.stroke();
    g.beginPath(); g.moveTo(0,u(i)); g.lineTo(S,u(i)); g.stroke(); }

  // sidewalk ring (lighter) then asphalt ring
  rect(-97,-97,194,194,'#EDF0F3');
  rect(-93,-93,186,186,'#3B4046');
  rect(-79,-79,158,158,'#EDF0F3');
  rect(-75,-75,150,150,'#E4E8EC');
  // cross street
  rect(3,-97,14,194,'#3B4046');
  rect(1,-97,2,194,'#EDF0F3'); rect(17,-97,2,194,'#EDF0F3');

  // lane markings
  g.strokeStyle='#F2F4F6';
  const dash=(x1,z1,x2,z2,w=0.5)=>{g.lineWidth=p(w);g.setLineDash([p(4),p(4)]);g.beginPath();g.moveTo(u(x1),u(z1));g.lineTo(u(x2),u(z2));g.stroke();g.setLineDash([]);};
  const solid=(x1,z1,x2,z2,w=0.45,col='#F2F4F6')=>{g.strokeStyle=col;g.lineWidth=p(w);g.beginPath();g.moveTo(u(x1),u(z1));g.lineTo(u(x2),u(z2));g.stroke();};
  [-86,86].forEach(v=>{ dash(-86,v,86,v); dash(v,-86,v,86); });
  [-93.4,-78.6,78.6,93.4].forEach(v=>{ solid(-93,v,93,v,.35,'rgba(242,244,246,.75)'); solid(v,-93,v,93,.35,'rgba(242,244,246,.75)'); });
  dash(10,-93,10,93);
  // crosswalks at the cross-street junctions
  for(const z of [-86,86]) for(let i=0;i<7;i++) rect(3.6+i*1.8,z-5.5,1.1,11,'#F2F4F6');
  for(const x of [-86,86]) for(let i=0;i<7;i++) rect(x-5.5,-6+i*1.8,11,1.1,'#F2F4F6');

  // lawns / planted beds inside the block
  const lawn=(x,z,w,d,r=6,col='#7BB84A')=>{g.fillStyle=col;g.beginPath();g.roundRect(u(x),u(z),p(w),p(d),p(r));g.fill();};
  lawn(-70,-14,46,16); lawn(-70,-12,46,12,5,'#8CC556');
  lawn(-30,44,34,22,8); lawn(-28,46,30,18,6,'#8CC556');
  lawn(24,-64,20,26,7); lawn(30,30,18,40,8);
  lawn(52,58,30,14,6); lawn(-72,58,40,14,6);
  // plaza inlay
  g.fillStyle='rgba(160,172,186,.22)'; g.beginPath(); g.roundRect(u(-64),u(6),p(46),p(30),p(10)); g.fill();
  g.fillStyle='rgba(255,255,255,.5)'; g.beginPath(); g.roundRect(u(-60),u(10),p(38),p(22),p(8)); g.fill();
  // parking hatch near the right cluster
  g.strokeStyle='rgba(255,255,255,.6)'; g.lineWidth=p(.3);
  for(let i=0;i<8;i++){ g.beginPath(); g.moveTo(u(60+i*3),u(-30)); g.lineTo(u(60+i*3),u(-19)); g.stroke(); }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 16;
  return tex;
}

/* ---------- block plate ---------- */
const blockGroup = new THREE.Group(); scene.add(blockGroup);
{
  const top = new THREE.Mesh(new THREE.PlaneGeometry(200,200),
    new THREE.MeshStandardMaterial({map:groundTexture(),roughness:.9}));
  top.rotation.x = -Math.PI/2; top.position.y = 0.02; top.receiveShadow = true; top.name='blockSurface';
  blockGroup.add(top);
  const slab = box(M.curb,200,5,200,0,-3.1,0); slab.name='blockSlab'; blockGroup.add(slab);
  // outer skirt / retaining edge
  blockGroup.add(box(M.concrete,206,1.2,206,0,-5.2,0));
}

/* surround ground */
{
  const g = new THREE.Mesh(new THREE.PlaneGeometry(6400,6400),
    new THREE.MeshStandardMaterial({color:0x4E566A,roughness:.95}));
  g.rotation.x=-Math.PI/2; g.position.y=-5.6; g.receiveShadow=true; g.name='cityGround'; scene.add(g);
}

/* ---------- clickable registry ---------- */
const clickables = [];
function register(group,info){ group.userData.info = info; clickables.push(group); }

/* ---------- animation registries ---------- */
const swayers = [], windows = [], elevators = [], spinners = [];

/* ---------- vertical farm tower (the curved hero) ---------- */
function farmTower(x,z,ry,levels,name){
  const G = new THREE.Group(); G.position.set(x,0,z); G.rotation.y = ry;
  const W=26, D=15, LH=4.6;
  // podium: three stacked terraces
  for(let i=0;i<3;i++){
    const w = W+16-i*5, d = D+20-i*5, y = 2.4+i*4.4;
    G.add(box(M.shell,w,3.2,d,0,y,0));
    G.add(box(M.orange,w-1.6,1.1,d-1.6,0,y+2.1,0));
    G.add(box(M.glassCyan,w-3,2.2,d-3,0,y-.4,0));
  }
  G.add(box(M.shell,W+22,1.6,D+26,0,.8,0));
  // curved spine of habitable slabs
  const pts=[];
  for(let i=0;i<levels;i++){
    const t = i/(levels-1);
    const y = 14 + i*LH;
    const lean = 34*Math.pow(t,2.1);
    const ang = -Math.atan(2.1*34*Math.pow(Math.max(t,.001),1.1)/(levels*LH))*.75;
    pts.push({y,lean,ang});
    const slab = box(M.shell,W,LH*.42,D,0,y,lean); slab.rotation.x = ang; G.add(slab);
    // planted terrace on the front face
    const row = new THREE.Group(); row.position.set(0,y+LH*.42,lean+ D*0.16);
    row.rotation.x = ang;
    const soil = box(M.leafC,W-2.4,.5,D*.52,0,.2,0); row.add(soil);
    const n = 5;
    for(let k=0;k<n;k++){
      const bx = -W/2+2.4+k*((W-4.8)/(n-1));
      const b = blob(pick([M.leafA,M.leafB]),rnd(1.0,1.7),bx,1.4,rnd(-1.2,1.2));
      row.add(b);
      swayers.push({o:b,amp:.05,phase:Math.random()*6.3,axis:'z'});
    }
    G.add(row);
    // back glazing + windows
    const glz = box(M.glassCyan,W-3,LH*.5,1.2,0,y+LH*.5,lean-D/2-.1); glz.rotation.x=ang; G.add(glz);
    if(i%2===0){
      for(let k=0;k<3;k++){
        const wm = new THREE.Mesh(BOX,pick(WINDOW_MATS));
        wm.scale.set(2.6,2.2,.5); wm.position.set(-8+k*8, y+LH*.55, lean+D/2+.15); wm.rotation.x=ang;
        G.add(wm); windows.push(wm);
      }
    }
  }
  // crown: solar canopy following the lean
  const top = pts[pts.length-1];
  const cap = box(M.solar,W-1,1.1,D+2,0,top.y+LH*1.1,top.lean+2.5); cap.rotation.x=top.ang; G.add(cap);
  const capEdge = box(M.shell,W+1.4,1.6,D+3.4,0,top.y+LH*.5,top.lean+2.2); capEdge.rotation.x=top.ang; G.add(capEdge);
  // side fin that gives the J its thickness
  for(const s of [-1,1]){
    const fin = new THREE.Group();
    for(let i=0;i<levels;i++){
      const q=pts[i];
      const f = box(M.shell,1.5,LH,D+1.2,s*(W/2+.5),q.y+LH/2,q.lean); f.rotation.x=q.ang; fin.add(f);
    }
    G.add(fin);
  }
  register(G,{name,tier:'Vertical farm',desc:'Stacked hydroponic terraces with a solar canopy. Residential floors face the plaza; growing decks face the sun.',h:(14+levels*LH+8).toFixed(0)+' m',p:'Farm + housing'});
  blockGroup.add(G);
  return G;
}

/* ---------- twisted glass tower ---------- */
function twistTower(x,z,name){
  const G = new THREE.Group(); G.position.set(x,0,z);
  const H=78, R0=13.5, R1=10.5;
  const core = cyl(M.glass,R0,H,0,H/2+1,0,R1); G.add(core);
  const inner = cyl(M.glassDeep,R0-.35,H-2,0,H/2+1,0,R1-.35); G.add(inner);
  // mullions
  for(let i=0;i<18;i++){
    const a = i/18*Math.PI*2;
    const m = box(M.shell,.55,H-2,.9, Math.cos(a)*(R0+ .1), H/2+1, Math.sin(a)*(R0+.1), -a, false);
    m.scale.y = H-2; G.add(m);
  }
  for(let i=1;i<9;i++){
    const y = 1+i*(H/9), r = R0+(R1-R0)*(y/H);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r+.15,.32,6,44), M.shell);
    ring.rotation.x = Math.PI/2; ring.position.y = y; G.add(ring);
  }
  // spiralling ribbon
  const turns = 2.6, segs = 150;
  for(let i=0;i<segs;i++){
    const t = i/segs;
    const a = t*Math.PI*2*turns, y = 8+t*(H-14), r = R0+(R1-R0)*(y/H)+1.9;
    const px = Math.cos(a)*r, pz = Math.sin(a)*r;
    const nx = Math.cos(a+.05)*r, nz = Math.sin(a+.05)*r;
    const seg = box(M.shell, r*0.09+1.0, 3.2, 2.0, px, y, pz, -Math.atan2(pz-nz,px-nx));
    seg.rotation.z = .30;
    G.add(seg);
  }
  // podium + crown
  G.add(cyl(M.shell,R0+7,2.2,0,1.1,0));
  G.add(cyl(M.shell,R1+1.6,2.4,0,H+2.2,0,R1+2.6));
  const crown = cyl(M.metal,1.1,10,0,H+8,0,.5); G.add(crown);
  // sky-lounge lights
  for(let i=0;i<10;i++){
    const a=i/10*Math.PI*2;
    const w = new THREE.Mesh(BOX,pick(WINDOW_MATS)); w.scale.set(2.4,1.6,.6);
    w.position.set(Math.cos(a)*(R1+.6),H-4,Math.sin(a)*(R1+.6)); w.rotation.y=-a;
    G.add(w); windows.push(w);
  }
  register(G,{name,tier:'Landmark',desc:'A 2.6-turn helical brise-soleil wraps the glass shaft, shading the west face without blocking the view.',h:'88 m',p:'Offices + sky lounge'});
  blockGroup.add(G);
  return G;
}

/* ---------- green-facade slab tower with billboards + elevators ---------- */
function slabTower(x,z,ry,name){
  const G = new THREE.Group(); G.position.set(x,0,z); G.rotation.y=ry;
  const W=34,D=24,H=86;
  G.add(box(M.shell,W+4,3,D+4,0,1.5,0));
  G.add(box(M.shell,W,H,D,0,H/2+3,0));
  // blue glazed left bay
  G.add(box(M.glass,W*.42,H-6,.9,-W*.27,H/2+3,D/2+.1));
  G.add(box(M.glass,.9,H-6,D*.7,-W/2-.1,H/2+3,0));
  // green living wall right bay
  const gw = box(M.leafA,W*.46,H-8,1.0,W*.25,H/2+2,D/2+.15); G.add(gw);
  for(let i=0;i<10;i++){
    G.add(box(M.shell,W*.46+.6,.5,1.5,W*.25,8+i*((H-12)/9),D/2+.35));
    G.add(box(M.leafB,W*.40,1.6,1.5,W*.25,9+i*((H-12)/9),D/2+.4));
  }
  // vertical white grid on the green wall
  for(let i=0;i<4;i++) G.add(box(M.shell,.6,H-8,1.4,W*.25-8+i*5.4,H/2+2,D/2+.4));
  // glass elevator shaft with two moving cars
  G.add(box(M.glassCyan,4.4,H-8,1.2,W*.02,H/2+2,D/2+.5));
  for(let k=0;k<2;k++){
    const car = box(M.litWarm,3.4,3.0,1.9,W*.02,12,D/2+.6);
    G.add(car); elevators.push({o:car,base:8,span:H-18,speed:rnd(.07,.11),ph:Math.random()*6.3});
  }
  // banner billboard
  const bb = new THREE.Group(); bb.position.set(-W*.22,H*.62,D/2+1.2);
  bb.add(box(M.shell,17,11,.8,0,0,0));
  bb.add(box(M.leafB,15.4,5.2,.4,0,2.2,.5));
  bb.add(box(M.glassCyan,15.4,3.6,.4,0,-2.6,.5));
  G.add(bb);
  // rooftop kit: solar deck, AC units, antenna mast
  G.add(box(M.shell,W+2,1.6,D+2,0,H+3.8,0));
  G.add(box(M.solar,W-6,.6,D-8,0,H+4.9,0));
  for(let i=0;i<4;i++) G.add(box(M.metal,3.2,2.2,3.2,-W/2+5+i*7,H+5.9,-D/2+4));
  const mast = cyl(M.metal,.35,14,W/2-4,H+11,D/2-4,.18); G.add(mast);
  const beacon = blob(M.litWarm,.9,W/2-4,H+18.5,D/2-4); G.add(beacon);
  windows.push(beacon);
  // windows on the flanks
  for(let i=0;i<12;i++) for(let k=0;k<3;k++){
    const wm = new THREE.Mesh(BOX,pick(WINDOW_MATS)); wm.scale.set(.5,2.4,3.2);
    wm.position.set(-W/2-.15, 10+i*6, -D/2+5+k*7); G.add(wm); windows.push(wm);
  }
  register(G,{name,tier:'Mixed use',desc:'Living wall on the sun face, glass elevators on the plaza face, and a solar deck feeding the block micro-grid.',h:'92 m',p:'Retail + offices'});
  blockGroup.add(G);
  return G;
}

/* ---------- terraced green low-rise ---------- */
function terrace(x,z,ry,name,steps=4){
  const G=new THREE.Group(); G.position.set(x,0,z); G.rotation.y=ry;
  for(let i=0;i<steps;i++){
    const w = 40-i*6, d = 30-i*5, y = 3+i*6;
    G.add(box(M.shell,w,5.4,d,0,y,i*2.2));
    G.add(box(M.orange,w-2,1.2,d-2,0,y+2.6,i*2.2));
    G.add(box(M.glassCyan,w-4,2.6,d-3.4,0,y-.6,i*2.2));
    // green roof on each step
    const rf = box(M.grass,w-4,.8,d-6,0,y+3.2,i*2.2+1.4); G.add(rf);
    for(let k=0;k<4;k++){
      const b = blob(pick([M.leafA,M.leafB]),rnd(1.1,2.0),-w/2+5+k*((w-10)/3),y+4.4,i*2.2+rnd(-1.5,2));
      G.add(b); swayers.push({o:b,amp:.045,phase:Math.random()*6.3,axis:'x'});
    }
  }
  register(G,{name,tier:'Low rise',desc:'Stepped terraces climb toward the core, each roof planted and publicly reachable from the plaza stair.',h:(3+steps*6+5)+' m',p:'Housing + market'});
  blockGroup.add(G);
  return G;
}

/* ---------- props ---------- */
function palm(x,z,h=13){
  const G=new THREE.Group(); G.position.set(x,0,z);
  const t = cyl(M.trunk,.55,h,0,h/2,0,.38); t.rotation.z=rnd(-.06,.06); G.add(t);
  for(let i=0;i<7;i++){
    const a=i/7*Math.PI*2;
    const f = box(M.leafA,7.5,.35,1.9,Math.cos(a)*3.4,h+rnd(-.4,.6),Math.sin(a)*3.4,-a);
    f.rotation.z=-.30; G.add(f);
  }
  G.add(blob(M.leafC,1.1,0,h,0));
  swayers.push({o:G,amp:.028,phase:Math.random()*6.3,axis:'z'});
  blockGroup.add(G); return G;
}
function tree(x,z,s=1){
  const G=new THREE.Group(); G.position.set(x,0,z);
  G.add(cyl(M.trunk,.45*s,4*s,0,2*s,0,.32*s));
  G.add(blob(M.leafA,2.6*s,0,5.4*s,0));
  G.add(blob(M.leafB,1.9*s,1.2*s,6.8*s,.5*s));
  G.add(blob(M.leafC,1.6*s,-1.1*s,6.2*s,-.6*s));
  swayers.push({o:G,amp:.035,phase:Math.random()*6.3,axis:'x'});
  blockGroup.add(G); return G;
}
function lamp(x,z,ry=0){
  const G=new THREE.Group(); G.position.set(x,0,z); G.rotation.y=ry;
  G.add(cyl(M.metal,.3,9,0,4.5,0,.22));
  G.add(box(M.metal,3.4,.35,.5,1.6,9,0));
  const head = box(M.litWarm,1.6,.4,1.0,3.1,8.75,0); G.add(head); windows.push(head);
  blockGroup.add(G); return G;
}
function bench(x,z,ry=0){
  const G=new THREE.Group(); G.position.set(x,0,z); G.rotation.y=ry;
  G.add(box(M.orange,5,.35,1.6,0,1.1,0));
  G.add(box(M.orange,5,1.2,.3,0,1.8,-.7));
  G.add(box(M.metal,.3,1.1,1.5,-2,.55,0)); G.add(box(M.metal,.3,1.1,1.5,2,.55,0));
  blockGroup.add(G); return G;
}
function trafficLight(x,z,ry=0){
  const G=new THREE.Group(); G.position.set(x,0,z); G.rotation.y=ry;
  G.add(cyl(M.metal,.26,7,0,3.5,0,.2));
  G.add(box(M.metal,.4,.4,3.0,0,7,1.4));
  const hd = box(M.asphalt,1.0,2.4,.9,0,6.4,2.7); G.add(hd);
  const lamp3 = blob(M.litWarm,.32,0,6.4,3.2); G.add(lamp3); windows.push(lamp3);
  blockGroup.add(G); return G;
}
function fountain(x,z){
  const G=new THREE.Group(); G.position.set(x,0,z);
  G.add(cyl(M.shell,7,1.2,0,.6,0));
  G.add(cyl(M.glassCyan,6.2,1.0,0,1.2,0));
  G.add(cyl(M.shell,1.6,3.2,0,2.4,0,1.0));
  const jet = blob(M.glassCyan,1.9,0,4.4,0); G.add(jet);
  spinners.push({o:jet,speed:.6,pulse:true});
  blockGroup.add(G); return G;
}
function kiosk(x,z,ry=0){
  const G=new THREE.Group(); G.position.set(x,0,z); G.rotation.y=ry;
  G.add(box(M.shell,6,3.6,4,0,1.8,0));
  G.add(box(M.orange,7,.5,5,0,3.8,0));
  const scr = box(M.litCyan,3.2,1.8,.3,0,2.2,2.1); G.add(scr); windows.push(scr);
  blockGroup.add(G); return G;
}
function flagPole(x,z){
  const G=new THREE.Group(); G.position.set(x,0,z);
  G.add(cyl(M.metal,.25,16,0,8,0,.18));
  const f = box(M.glassTeal,5.4,3.2,.2,2.9,14,0); G.add(f);
  swayers.push({o:f,amp:.10,phase:Math.random()*6.3,axis:'y'});
  blockGroup.add(G); return G;
}

/* ---------- compose the block ---------- */
farmTower(-70,-40, .08, 15, 'Greenline Farm A');
farmTower(-38,-46,-.05, 17, 'Greenline Farm B');
farmTower(-6,-40, .10, 14, 'Greenline Farm C');
twistTower(-46, 26, 'The Helix');
slabTower(52,-26, -Math.PI/2*0+.02, 'Verdant Exchange');
terrace(56, 34, Math.PI, 'Stepwell Housing', 4);
terrace(-72, 56, -Math.PI/2, 'Market Steps', 3);
kiosk(-14, 60, .3); kiosk(30, -62, -.4);
fountain(-41, 20); fountain(-8, 12);
flagPole(24, 6); flagPole(24, 20);

for(const [px,pz] of [[-20,-20],[-52,-4],[-26,34],[26,-46],[38,52],[-84,20],[-84,-8],[76,-52],[70,64]]) palm(px,pz,rnd(11,16));
for(let i=0;i<26;i++){
  const x = rnd(-92,92), z = rnd(-92,92);
  if(Math.abs(x)>76 || Math.abs(z)>76 || (x>2&&x<18)) continue;
  tree(x,z,rnd(.7,1.2));
}
for(let i=0;i<12;i++){ tree(rnd(-70,-26),rnd(-16,-8),rnd(.6,.9)); }
for(const z of [-70,-40,-10,20,50,74]){ lamp(-77,z,Math.PI/2); lamp(77,z,-Math.PI/2); }
for(const x of [-70,-40,-10,22,50,74]){ lamp(x,-77,0); lamp(x,77,Math.PI); }
for(let i=0;i<8;i++) lamp(i%2?0.5:19.5, -70+i*20, i%2?Math.PI:0);
bench(-52,10,.2); bench(-52,32,-.2); bench(-30,52,Math.PI/2); bench(-14,10,0); bench(40,10,Math.PI/2);
trafficLight(-2,-72,0); trafficLight(21,-72,Math.PI); trafficLight(-2,72,0); trafficLight(21,72,Math.PI);
trafficLight(-72,-72,-Math.PI/2); trafficLight(72,72,Math.PI/2);

/* ---------- district podium + corridors ---------- */
const puffs = [], crawls = [];
const dcard = document.getElementById('dcard');
const PR = PITCH + 104;                       // podium half-extent
{
  blockGroup.add(box(M.curb, PR*2, 4.96, PR*2, 0, -3.5, 0));   // top at −1.0: clear of every road surface
  scene.add(box(M.concrete, PR*2+12, 1.2, PR*2+12, 0, -5.2, 0));
  const dashTex = (()=>{
    const c=document.createElement('canvas'); c.width=8; c.height=64;
    const g=c.getContext('2d'); g.clearRect(0,0,8,64);
    g.fillStyle='#F2F4F6'; g.fillRect(2,10,4,30);
    const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace;
    t.wrapS=THREE.RepeatWrapping; t.wrapT=THREE.RepeatWrapping; return t;
  })();
  const roadMat = new THREE.MeshStandardMaterial({color:0x3B4046, roughness:.95});
  const padMat  = new THREE.MeshStandardMaterial({color:0x474D55, roughness:.95});
  for(const v of [-PITCH/2, PITCH/2]) for(const axis of [0,1]){
    const road = new THREE.Mesh(new THREE.PlaneGeometry(40, PR*2), roadMat);
    road.rotation.x = -Math.PI/2; road.receiveShadow = true; road.name = 'corridor';
    const lt = dashTex.clone(); lt.needsUpdate = true; lt.repeat.set(1, PR*2/17);
    const line = new THREE.Mesh(new THREE.PlaneGeometry(1.5, PR*2),
      new THREE.MeshBasicMaterial({map:lt, transparent:true}));
    line.rotation.x = -Math.PI/2; line.position.y = .03;
    const wrap = new THREE.Group();
    wrap.add(road); wrap.add(line);
    wrap.position.set(axis ? 0 : v, .04, axis ? v : 0);
    if(axis) wrap.rotation.y = Math.PI/2;
    scene.add(wrap);
  }
  for(const x of [-PITCH/2, PITCH/2]) for(const z of [-PITCH/2, PITCH/2]){
    const p = new THREE.Mesh(new THREE.PlaneGeometry(40,40), padMat);
    p.rotation.x = -Math.PI/2; p.position.set(x, .05, z); scene.add(p);
  }
}
const zoneLayer = new THREE.Group(); zoneLayer.name = 'layer_districts'; scene.add(zoneLayer);
const prop = (parent, fn, ...a) => { const g = fn(...a); parent.add(g); return g; };
const lampAt = (parent,x,z,ry)=>prop(parent, lamp, x, z, ry);
const treeAt = (parent,x,z,sc)=>prop(parent, tree, x, z, sc);
const { tickers: DISTRICT_TICKERS } = buildDistricts({
  M, box, cyl, blob, rnd, pick, BOX, SPH, WINDOW_MATS, windows, swayers, spinners, elevators,
  puffs, crawls, register, scene, zoneLayer, lampAt, treeAt, prop,
  props: {palm, tree, lamp, bench, trafficLight, fountain, kiosk, flagPole}
});

/* ---------- surrounding city (density gradient) ---------- */
{
  const cells=[];
  const CELL=34, R=1280;
  for(let x=-R;x<=R;x+=CELL) for(let z=-R;z<=R;z+=CELL){
      if(Math.abs(x)<396 && Math.abs(z)<396) continue;
    const d = Math.hypot(x,z);
    const falloff = Math.max(0, 1 - (d-400)/860);
    if(Math.random() > .30 + falloff*.7) continue;
    const near = THREE.MathUtils.smoothstep(d,400,640);
    const h = Math.max(6, (9 + falloff*58) * rnd(.45,1.15) * (.42+near*.58));
    const w = CELL*rnd(.5,.82), dd = CELL*rnd(.5,.82);
    cells.push({x:x+rnd(-5,5), z:z+rnd(-5,5), h, w, d:dd});
  }
  const geo = new THREE.BoxGeometry(1,1,1);
  const mat = new THREE.MeshStandardMaterial({color:0xffffff,roughness:.78,metalness:.02});
  const im = new THREE.InstancedMesh(geo, mat, cells.length);
  im.name='surroundCity'; im.castShadow = true; im.receiveShadow = true;
  const mtx = new THREE.Matrix4(), q = new THREE.Quaternion(), col = new THREE.Color();
  cells.forEach((c,i)=>{
    q.setFromAxisAngle(new THREE.Vector3(0,1,0), Math.round(rnd(0,4))*Math.PI/2 + rnd(-.06,.06));
    mtx.compose(new THREE.Vector3(c.x, c.h/2-5.4, c.z), q, new THREE.Vector3(c.w,c.h,c.d));
    im.setMatrixAt(i,mtx);
    const t = Math.min(1, Math.hypot(c.x,c.z)/1150);
    col.setHex(Math.random()<.5?C.darkCity:C.darkCityB).lerp(new THREE.Color(0x8C97AC), t*.5+rnd(0,.12));
    im.setColorAt(i,col);
  });
  im.instanceMatrix.needsUpdate = true;
  scene.add(im);

  // rooftop antennas on the tallest neighbours
  const tall = cells.filter(c=>c.h>62).slice(0,26);
  for(const c of tall){
    const a = cyl(M.metal,.5,c.h*.22,c.x,c.h-5.4+c.h*.11,c.z,.2);
    a.castShadow=false; scene.add(a);
  }
  // arterial roads leading away from the block
  const roadMat = new THREE.MeshStandardMaterial({color:0x2F343C,roughness:.95});
  for(const [w,d,px,pz] of [[26,2600,10,0],[40,2600,-PITCH/2,0],[40,2600,PITCH/2,0],[2600,40,0,-PITCH/2],[2600,40,0,PITCH/2]]){
    const r = new THREE.Mesh(new THREE.PlaneGeometry(w,d), roadMat);
    r.rotation.x=-Math.PI/2; r.position.set(px,-5.5,pz); r.receiveShadow=true; scene.add(r);
  }
}

/* ---------- traffic ---------- */
function loop(points, closed=true){
  const curve = new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(p[0],0.25,p[1])), closed, 'catmullrom', .35);
  return curve;
}
const ringIn  = loop([[-82.5,-82.5],[0,-82.5],[82.5,-82.5],[82.5,0],[82.5,82.5],[0,82.5],[-82.5,82.5],[-82.5,0]]);
const ringOut = loop([[-89.5,-89.5],[-89.5,0],[-89.5,89.5],[0,89.5],[89.5,89.5],[89.5,0],[89.5,-89.5],[0,-89.5]]);
const crossA  = loop([[6.5,-86],[6.5,0],[6.5,86],[13.5,86],[13.5,0],[13.5,-86]]);
const arterial= loop([[6.5,-1100],[6.5,-340],[6.5,340],[6.5,1100],[13.5,1100],[13.5,340],[13.5,-340],[13.5,-1100]]);
const corridors = [];
for(const v of [-PITCH/2, PITCH/2]){
  corridors.push(loop([[v-3.5,-340],[v-3.5,0],[v-3.5,340],[v+3.5,340],[v+3.5,0],[v+3.5,-340]]));
  corridors.push(loop([[-340,v-3.5],[0,v-3.5],[340,v-3.5],[340,v+3.5],[0,v+3.5],[-340,v+3.5]]));
}

const carBodyGeo = new THREE.BoxGeometry(4.6,1.3,2.1);
const carTopGeo  = new THREE.BoxGeometry(2.5,1.0,1.85);
const CAR_COLORS = [0x2E7BD6,0xF0F2F4,0xE0533C,0xF2C33D,0x3EB6A0,0x5D6470,0xE07C2E,0x9B5DE0];
const cars = [];
function fleet(curve, n, speed, dir=1){
  const body = new THREE.InstancedMesh(carBodyGeo, new THREE.MeshStandardMaterial({color:0xffffff,roughness:.35,metalness:.15}), n);
  const top  = new THREE.InstancedMesh(carTopGeo,  new THREE.MeshStandardMaterial({color:0x9FD8EF,roughness:.2,metalness:.3}), n);
  body.castShadow = true; body.name='carBodies'; top.name='carTops';
  const col = new THREE.Color();
  for(let i=0;i<n;i++){ col.setHex(pick(CAR_COLORS)); body.setColorAt(i,col); }
  scene.add(body); scene.add(top);
  const items=[];
  for(let i=0;i<n;i++) items.push({t:(i/n+rnd(0,.02))%1, v:speed*rnd(.8,1.25)});
  cars.push({curve,body,top,items,dir});
}
fleet(ringIn, 12, .012, 1);
fleet(ringOut, 12, .010, -1);
fleet(crossA, 8, .014, 1);
fleet(arterial, 16, .004, 1);
corridors.forEach((c,i)=>fleet(c, 10, .0075, i%2 ? -1 : 1));
for(const D of DISTRICTS){
  if(D.builtin) continue;
  const o = (pts)=>loop(pts.map(([x,z])=>[x+D.cx, z+D.cz]));
  fleet(o([[-82.5,-82.5],[0,-82.5],[82.5,-82.5],[82.5,0],[82.5,82.5],[0,82.5],[-82.5,82.5],[-82.5,0]]), 9, .0115, 1);
  fleet(o([[-89.5,-89.5],[-89.5,0],[-89.5,89.5],[0,89.5],[89.5,89.5],[89.5,0],[89.5,-89.5],[0,-89.5]]), 9, .0095, -1);
  if(D.cross==='ns') fleet(o([[6.5,-86],[6.5,0],[6.5,86],[13.5,86],[13.5,0],[13.5,-86]]), 6, .0135, 1);
}

const _m = new THREE.Matrix4(), _p = new THREE.Vector3(), _t = new THREE.Vector3(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(1,1,1);
const UP = new THREE.Vector3(0,1,0);
function driveCars(dt){
  for(const f of cars){
    f.items.forEach((c,i)=>{
      c.t = (c.t + c.v*dt*f.dir + 1) % 1;
      f.curve.getPointAt(c.t, _p);
      f.curve.getTangentAt(c.t, _t);
      const yaw = Math.atan2(_t.x, _t.z) - Math.PI/2;
      _q.setFromAxisAngle(UP, yaw);
      _p.y = 0.9;
      _m.compose(_p,_q,_s); f.body.setMatrixAt(i,_m);
      _p.y = 2.0; _m.compose(_p,_q,_s); f.top.setMatrixAt(i,_m);
    });
    f.body.instanceMatrix.needsUpdate = true;
    f.top.instanceMatrix.needsUpdate = true;
  }
}

/* ---------- clouds + birds ---------- */
const clouds = new THREE.Group(); scene.add(clouds);
const cloudMat = new THREE.MeshStandardMaterial({color:0xFDFEFF,roughness:1,flatShading:true,transparent:true,opacity:.92});
for(let i=0;i<9;i++){
  const g = new THREE.Group();
  const n = 4+((Math.random()*3)|0);
  for(let k=0;k<n;k++){
    const b = new THREE.Mesh(SPH,cloudMat);
    b.scale.set(rnd(14,26),rnd(6,10),rnd(12,20));
    b.position.set(rnd(-22,22),rnd(-3,3),rnd(-14,14));
    g.add(b);
  }
  g.position.set(rnd(-450,450), rnd(150,230), rnd(-450,450));
  g.userData.v = rnd(2.5,6);
  clouds.add(g);
}
const birds = [];
for(let i=0;i<7;i++){
  const g = new THREE.Group();
  const wm = new THREE.MeshStandardMaterial({color:0x39404E,roughness:.9});
  const l = new THREE.Mesh(BOX,wm); l.scale.set(2.4,.18,.7); l.position.set(-1.2,0,0); l.rotation.z=.3;
  const r = new THREE.Mesh(BOX,wm); r.scale.set(2.4,.18,.7); r.position.set(1.2,0,0); r.rotation.z=-.3;
  g.add(l); g.add(r);
  g.userData = {r:rnd(90,230), a:Math.random()*6.3, y:rnd(70,120), sp:rnd(.09,.2), wings:[l,r], ph:Math.random()*6.3};
  scene.add(g); birds.push(g);
}

/* ---------- data layers ---------- */
const layerGroups = {};
const mkLayer = n => (layerGroups[n] = Object.assign(new THREE.Group(), {name:'layer_'+n}), scene.add(layerGroups[n]), layerGroups[n]);
const flat = (c,o)=>new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:o,depthWrite:false});
function patch(g,x,z,w,d,mat,y=.18){
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w,d),mat);
  m.rotation.x=-Math.PI/2; m.position.set(x,y,z); m.renderOrder=2; g.add(m); return m;
}
{ // transit corridor
  const g = mkLayer('transit'), mat = flat(0x1D9BB0,.55);
  patch(g,10,0,3.2,196,mat,.26);
  patch(g,-86,0,3.2,190,mat,.26); patch(g,86,0,3.2,190,mat,.26);
  patch(g,0,-86,190,3.2,mat,.26); patch(g,0,86,190,3.2,mat,.26);
  for(const [x,z] of [[10,-58],[10,26],[-86,42],[86,-40]]){
    const r = new THREE.Mesh(new THREE.TorusGeometry(5,.5,6,32), flat(0x7FD1EE,.85));
    r.rotation.x=-Math.PI/2; r.position.set(x,.3,z); g.add(r);
  }
}
layerGroups.districts = zoneLayer;
{ // zoning districts
  const g = mkLayer('zoning');
  patch(g,-42,-40,124,62,flat(0x3FA6A0,.3),.2);
  patch(g,52,-24,64,60,flat(0x1D9BB0,.3),.2);
  patch(g,-46,26,58,44,flat(0xE6E3DB,.34),.2);
  patch(g,40,44,84,56,flat(0xD9A441,.26),.2);
  patch(g,-66,56,58,36,flat(0x76C63C,.26),.2);
}
{ // traffic flow
  const g = mkLayer('traffic'), hot = flat(0xE0533C,.3), warm = flat(0xF2C33D,.26);
  patch(g,-86,0,5,186,hot,.24); patch(g,86,0,5,186,warm,.24);
  patch(g,0,-86,186,5,warm,.24); patch(g,0,86,186,5,hot,.24);
  patch(g,10,0,5,190,hot,.24);
}
{ // parks
  const g = mkLayer('parks'), mat = flat(0x3FD46A,.34);
  patch(g,-47,-6,46,16,mat,.22); patch(g,-13,55,34,22,mat,.22);
  patch(g,34,-51,20,26,mat,.22); patch(g,39,50,18,40,mat,.22);
  patch(g,-52,65,40,14,mat,.22); patch(g,67,65,30,14,mat,.22);
}
{ // energy: solar roofs + micro-grid halo
  const g = mkLayer('energy'), mat = flat(0xF2C33D,.75);
  for(const [x,y,z,r] of [[52,92,-26,17],[-70,86,-40,14],[-38,96,-46,14],[-6,82,-40,13],[-46,82,26,11],[56,30,34,13]]){
    const t = new THREE.Mesh(new THREE.TorusGeometry(r,.55,6,40), mat);
    t.rotation.x=-Math.PI/2; t.position.set(x,y,z); g.add(t);
  }
  patch(g,-8,0,196,196,flat(0xF2C33D,.07),.16);
}

for(const D of DISTRICTS){                       // extend the data layers over each plate
  if(D.builtin) continue;
  const ac = new THREE.Color(D.accent).getHex();
  patch(layerGroups.transit, D.cx, D.cz, 3.2, 176, flat(0x1D9BB0,.5), .26);
  patch(layerGroups.transit, D.cx, D.cz, 176, 3.2, flat(0x1D9BB0,.5), .26);
  patch(layerGroups.zoning, D.cx, D.cz-42, 168, 74, flat(ac,.28), .2);
  patch(layerGroups.zoning, D.cx, D.cz+40, 168, 70, flat(ac,.18), .2);
  patch(layerGroups.traffic, D.cx-86, D.cz, 5, 176, flat(0xE0533C,.28), .24);
  patch(layerGroups.traffic, D.cx+86, D.cz, 5, 176, flat(0xF2C33D,.24), .24);
  patch(layerGroups.traffic, D.cx, D.cz-86, 176, 5, flat(0xE0533C,.28), .24);
  patch(layerGroups.traffic, D.cx, D.cz+86, 176, 5, flat(0xF2C33D,.24), .24);
  patch(layerGroups.parks, D.cx, D.cz-1, 140, 18, flat(0x3FD46A,.3), .22);
  for(const [ox,oz] of [[-64,-64],[64,-64],[-64,64],[64,64]])
    patch(layerGroups.parks, D.cx+ox, D.cz+oz, 18, 18, flat(0x3FD46A,.26), .22);
  const halo = flat(0xF2C33D,.75);
  for(const b of D.buildings){
    const r = Math.max(b.w,b.d)*.5;
    const m = new THREE.Mesh(new THREE.TorusGeometry(r,.55,6,36), halo);
    m.rotation.x = -Math.PI/2;
    m.position.set(D.cx+b.x, b.h + 8, D.cz+b.z);
    m.renderOrder = 2; layerGroups.energy.add(m);
  }
  patch(layerGroups.energy, D.cx, D.cz, 196, 196, flat(0xF2C33D,.07), .16);
}

/* ---------- HTML labels anchored in 3D ---------- */
const labelHost = document.getElementById('labels');
const labels = [];
function addLabel(pos, html, cls, kind){
  const el = document.createElement('div');
  el.className = 'mlabel ' + (cls||'');
  el.innerHTML = html + '<div class="pin"></div>';
  labelHost.appendChild(el);
  const rec = {pos:pos.clone(), el, kind:kind||'building'};
  labels.push(rec); return rec;
}
const _wp = new THREE.Vector3();
for(const g of clickables){
  const i = g.userData.info;
  g.getWorldPosition(_wp);
  const y = i.hm ? i.hm + 15 : parseFloat(i.h) * (i.tier==='Low rise' ? 1.25 : 1.06) + 12;
  const rec = addLabel(new THREE.Vector3(_wp.x, y, _wp.z),
    `<div class="body"><div class="nm">${i.name}</div><div class="mt">${(i.ticker||i.tier.toUpperCase())} &nbsp;|&nbsp; ${i.h} &nbsp;|&nbsp; VIEW DETAIL</div></div>`);
  rec.target = g;
  rec.always = false; // ambient embed: names show only on click, tickers stay in-scene
  g.userData.label = rec;
  rec.el.addEventListener('click', ()=>select(g));
}
const pinDefs = [
  ['transit','Metro · Greenline',  10,10,-70,'◈','#1D9BB0'],
  ['transit','Metro · Plaza',      10,10, 34,'◈','#1D9BB0'],
  ['parks',  'Greenline Park',    -30,10, 62,'✦','#3FA6A0'],
  ['energy', 'Renewable Energy',   64,34,-58,'⚡','#D9A441'],
  ['traffic','Ring Arterial',     -88,12, 10,'▲','#E0533C']
];
// ambient embed: infrastructure pin labels not rendered (geometry stays visible)
let labelsVisible = true;
const _v = new THREE.Vector3();
let panelRects = [];
function measurePanels(){
  panelRects = [...document.querySelectorAll('.panel')]
    .filter(p => getComputedStyle(p).opacity > .05)
    .map(p => { const r = p.getBoundingClientRect(); return {l:r.left-8,t:r.top-8,r:r.right+8,b:r.bottom+8}; });
}
const hits = (a,b) => !(a.r < b.l || a.l > b.r || a.b < b.t || a.t > b.b);
function updateLabels(){
  const w = innerWidth, h = innerHeight;
  const cands = [];
  for(const L of labels){
    const on = labelsVisible && (L.kind==='building' ? (L.always || selected===L.target) : layerState[L.kind]);
    if(!on){ L.el.classList.add('hide'); continue; }
    _v.copy(L.pos).project(camera);
    const x = (_v.x*.5+.5)*w, y = (-_v.y*.5+.5)*h;
    if(_v.z > 1 || x < -80 || x > w+80 || y < -40 || y > h+40){ L.el.classList.add('hide'); continue; }
    cands.push({L, x, y, d:_v.z, sel:selected===L.target});
  }
  // nearer labels win; drop any that collides with an already-placed label or a chrome panel
  cands.sort((a,b)=> (b.sel?1:0)-(a.sel?1:0) || a.d-b.d);
  const placed = [];
  for(const c of cands){
    const el = c.L.el;
    const cw = c.L.w || (c.L.w = el.offsetWidth) || 160;
    const ch = c.L.h || (c.L.h = el.offsetHeight) || 40;
    const x = Math.min(Math.max(c.x, cw/2 + 8), w - cw/2 - 8);
    const y = Math.min(Math.max(c.y, ch + 12), h - 8);
    const rect = {l:x-cw/2, t:y-ch, r:x+cw/2, b:y};
    if(placed.some(p=>hits(rect,p)) || panelRects.some(p=>hits(rect,p))){ el.classList.add('hide'); continue; }
    placed.push(rect);
    el.classList.remove('hide');
    el.style.transform = `translate(-50%,-100%) translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`;
  }
}

/* ---------- layer toggles + chrome ---------- */
const layerState = {tickers:true, districts:false, transit:true, zoning:false, traffic:true, parks:true, energy:true};
function applyLayers(){
  for(const k in layerGroups) layerGroups[k].visible = !!layerState[k];
  for(const f of cars){ f.body.visible = layerState.traffic; f.top.visible = layerState.traffic; }
  for(const s of DISTRICT_TICKERS) s.visible = layerState.tickers;
}
document.querySelectorAll('#layers .row').forEach(row=>{
  const k = row.dataset.layer;
  row.classList.toggle('on', layerState[k]);
  row.addEventListener('click', ()=>{
    layerState[k] = !layerState[k];
    row.classList.toggle('on', layerState[k]);
    applyLayers();
  });
});
applyLayers();
const HOME = {p:new THREE.Vector3(700,520,780), t:new THREE.Vector3(0,22,0)};
function dolly(f){
  const d = camera.position.clone().sub(controls.target);
  const len = THREE.MathUtils.clamp(d.length()*f, controls.minDistance, controls.maxDistance);
  camera.position.copy(controls.target).add(d.setLength(len));
}
function spin(a){
  const d = camera.position.clone().sub(controls.target);
  const x = d.x*Math.cos(a) - d.z*Math.sin(a), z = d.x*Math.sin(a) + d.z*Math.cos(a);
  camera.position.set(controls.target.x+x, camera.position.y, controls.target.z+z);
}
document.querySelectorAll('.tbtn').forEach(b=>b.addEventListener('click',()=>{
  idle = 0;
  switch(b.dataset.act){
    case 'in': dolly(.78); break;
    case 'out': dolly(1.28); break;
    case 'left': spin(-.42); break;
    case 'right': spin(.42); break;
    case 'reset': flyTo(HOME.p, HOME.t, 1.4); deselect(); setActiveDistrict(null); break;
    case 'labels': labelsVisible = !labelsVisible; b.style.color = labelsVisible ? '' : 'rgba(250,250,249,.3)'; break;
  }
}));

/* ---------- interaction: click to inspect ---------- */
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
const card = document.getElementById('card');
let selected = null, down = {x:0,y:0,t:0};
renderer.domElement.addEventListener('pointerdown', e=>{ down={x:e.clientX,y:e.clientY,t:performance.now()}; });
renderer.domElement.addEventListener('pointerup', e=>{
  if(Math.hypot(e.clientX-down.x, e.clientY-down.y) > 6 || performance.now()-down.t > 550) return;
  ndc.set((e.clientX/innerWidth)*2-1, -(e.clientY/innerHeight)*2+1);
  ray.setFromCamera(ndc, camera);
  const hits = ray.intersectObjects(clickables, true);
  if(!hits.length){ deselect(); return; }
  let o = hits[0].object;
  while(o && !o.userData.info) o = o.parent;
  if(o) select(o);
});
const _sp = new THREE.Vector3();
function select(g, fly){
  if(selected===g){ deselect(); return; }
  deselect();
  selected = g;
  const i = g.userData.info;
  const tier = card.querySelector('.tier');
  tier.textContent = i.ticker ? i.district : i.tier;
  tier.style.background = i.accent || '#1D9BB0';
  card.querySelector('h2').textContent = i.name;
  card.querySelector('.desc').textContent = i.desc;
  card.querySelector('[data-k="t"]').textContent = i.ticker || 'N/A';
  card.querySelector('[data-k="h"]').textContent = i.h;
  card.querySelector('[data-k="p"]').textContent = i.p;
  card.querySelector('[data-k="d"]').textContent = i.district || 'Greenline Block';
  card.classList.add('on');
  dcard.classList.remove('on');
  if(g.userData.label) g.userData.label.el.classList.add('sel');
  g.getWorldPosition(_sp);
  if(fly){
    const hh = i.hm || 60;
    flyTo(new THREE.Vector3(_sp.x + hh*1.4 + 70, hh + 80, _sp.z + hh*1.4 + 70),
          new THREE.Vector3(_sp.x, hh*.45, _sp.z), 1.25);
  } else {
    controls.target.lerp(new THREE.Vector3(_sp.x, 26, _sp.z), .55);
  }
  idle = 0;
}
function deselect(){
  if(selected && selected.userData.label) selected.userData.label.el.classList.remove('sel');
  selected=null; card.classList.remove('on');
}
card.querySelector('.close').addEventListener('click', deselect);

/* ---------- auto orbit ---------- */
let idle = 0;
controls.addEventListener('start', ()=>{ idle = 0; });
controls.addEventListener('end', ()=>{ idle = 0; });

/* ---------- loop ---------- */
function resize(){
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w,h); camera.aspect = w/h; camera.updateProjectionMatrix();
}
addEventListener('resize', ()=>{ resize(); measurePanels(); }); resize();
measurePanels();
new MutationObserver(()=>setTimeout(measurePanels,320)).observe(card, {attributes:true, attributeFilter:['class']});

let last = performance.now(), flickAt = 0;
window.city = {scene, camera, controls, renderer, layerState, applyLayers, flyTo, goDistrict, DISTRICTS, paused:false};
function frame(now){
  const dt = window.city.paused ? 0 : Math.min(.05,(now-last)/1000); last = now;
  const t = now/1000;
  idle += dt;

  if(idle > 3.5 && !window.city.paused){
    const a = .055*dt;
    const dx = camera.position.x - controls.target.x, dz = camera.position.z - controls.target.z;
    camera.position.x = controls.target.x + dx*Math.cos(a) - dz*Math.sin(a);
    camera.position.z = controls.target.z + dx*Math.sin(a) + dz*Math.cos(a);
  }

  driveCars(dt);

  for(const s of swayers){
    const v = Math.sin(t*1.15 + s.phase)*s.amp;
    if(s.axis==='x') s.o.rotation.x = v; else if(s.axis==='z') s.o.rotation.z = v; else s.o.rotation.y = v*3;
  }
  for(const e of elevators){
    const u = (Math.sin(t*e.speed*2*Math.PI + e.ph)+1)/2;
    e.o.position.y = e.base + u*e.span;
  }
  for(const s of spinners){ s.o.rotation[s.axis||'y'] += s.speed*dt; if(s.pulse) s.o.scale.setScalar(1.9*(1+Math.sin(t*2)*.05)); }
  for(const p of puffs){
    const u = (t*p.sp + p.ph) % 1;
    p.o.position.y = p.base + u*p.span;
    p.o.scale.setScalar(p.r*(1+u*1.6));
    p.o.material.opacity = .40*(1-u);
  }
  for(const c of crawls) c.tex.offset.x = (c.tex.offset.x + c.speed*dt) % 1;
  if(flight) stepFlight(dt);
  const _tl = Math.hypot(controls.target.x, controls.target.z);
  if(_tl > 520){ controls.target.x *= 520/_tl; controls.target.z *= 520/_tl; }

  if(now - flickAt > 240){
    flickAt = now;
    for(let i=0;i<14;i++){
      const w = windows[(Math.random()*windows.length)|0];
      if(w) w.material = pick(WINDOW_MATS);
    }
  }

  for(const c of clouds.children){
    c.position.x += c.userData.v*dt;
    if(c.position.x > 520) c.position.x = -520;
  }
  for(const b of birds){
    const u = b.userData; u.a += u.sp*dt;
    b.position.set(Math.cos(u.a)*u.r, u.y + Math.sin(u.a*2)*6, Math.sin(u.a)*u.r);
    b.rotation.y = -u.a + Math.PI/2;
    const f = Math.sin(t*7 + u.ph)*.5;
    u.wings[0].rotation.z = .3 + f; u.wings[1].rotation.z = -.3 - f;
  }

  controls.update();
  updateLabels();
  renderer.render(scene,camera);
  requestAnimationFrame(frame);
}
controls.update(); updateLabels(); renderer.render(scene,camera);   // paint once even if rAF is throttled
requestAnimationFrame(frame);
setTimeout(()=>document.getElementById('loading').classList.add('off'), 350);


/* ---------- camera flight ---------- */
let flight = null;
function flyTo(p, tgt, dur=1.4){
  flight = {t:0, dur, p0:camera.position.clone(), g0:controls.target.clone(), p1:p.clone(), g1:tgt.clone()};
  idle = -8;
}
function stepFlight(dt){
  flight.t += dt;
  const u = Math.min(1, flight.t/flight.dur);
  const e = u<.5 ? 4*u*u*u : 1-Math.pow(-2*u+2,3)/2;
  camera.position.lerpVectors(flight.p0, flight.p1, e);
  controls.target.lerpVectors(flight.g0, flight.g1, e);
  if(u>=1) flight = null;
}

/* ---------- district switcher ---------- */
function byTicker(q){
  q = (q||'').trim().toLowerCase(); if(!q) return null;
  return clickables.find(g=>{
    const i = g.userData.info;
    return (i.ticker||'').toLowerCase() === q || i.name.toLowerCase().includes(q);
  }) || null;
}
function setActiveDistrict(id){
  document.querySelectorAll('#dlist .it').forEach(el=>el.classList.toggle('on', el.dataset.id === id));
  if(!id) dcard.classList.remove('on');
}
function showDistrictCard(D){
  dcard.querySelector('.tier').textContent = D.tag;
  dcard.querySelector('.tier').style.background = D.accent;
  dcard.querySelector('h2').textContent = D.name;
  dcard.querySelector('.desc').textContent = D.blurb;
  dcard.querySelector('[data-k="jobs"]').textContent = D.stats.jobs;
  dcard.querySelector('[data-k="power"]').textContent = D.stats.power;
  dcard.querySelector('[data-k="area"]').textContent = D.stats.area;
  const tk = dcard.querySelector('.tk'); tk.textContent = '';
  for(const b of D.buildings){
    const el = document.createElement('span');
    el.textContent = b.ticker; el.style.color = D.accent;
    el.addEventListener('click', ()=>{ const g = byTicker(b.ticker); if(g) select(g, true); });
    tk.appendChild(el);
  }
  dcard.classList.add('on');
  card.classList.remove('on');
  setTimeout(measurePanels, 340);
}
function goDistrict(id){
  const D = DISTRICTS.find(d=>d.id===id); if(!D) return;
  deselect(); setActiveDistrict(id);
  flyTo(new THREE.Vector3(D.cx + 200, 172, D.cz + 228), new THREE.Vector3(D.cx, 18, D.cz), 1.5);
  if(D.builtin) dcard.classList.remove('on'); else showDistrictCard(D);
}
{
  const dlist = document.getElementById('dlist');
  const all = document.createElement('div');
  all.className = 'it all';
  all.innerHTML = '<div class="dot"></div><div class="nm">Whole city</div><div class="tg">9</div>';
  all.addEventListener('click', ()=>{ deselect(); setActiveDistrict(null); flyTo(HOME.p, HOME.t, 1.5); });
  dlist.appendChild(all);
  for(const D of DISTRICTS){
    const el = document.createElement('div');
    el.className = 'it'; el.dataset.id = D.id;
    el.innerHTML = '<div class="dot" style="background:' + D.accent + '"></div>' +
                   '<div class="nm">' + D.name + '</div>' +
                   '<div class="tg">' + (D.buildings.length || 7) + '</div>';
    el.addEventListener('click', ()=>goDistrict(D.id));
    dlist.appendChild(el);
  }
  dcard.querySelector('.close').addEventListener('click', ()=>{ dcard.classList.remove('on'); setActiveDistrict(null); });
  const sp = document.getElementById('search'), input = sp.querySelector('input');
  input.addEventListener('keydown', e=>{
    if(e.key !== 'Enter') return;
    const g = byTicker(input.value);
    if(g){ sp.classList.remove('miss'); select(g, true); setActiveDistrict(g.userData.info.districtId || null); }
    else { sp.classList.add('miss'); setTimeout(()=>sp.classList.remove('miss'), 900); }
  });
}
