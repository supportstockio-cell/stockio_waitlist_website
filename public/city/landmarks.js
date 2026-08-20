/* Landmark builders extracted from the uploaded low-poly model pages.
   Each entry: (THREE) => THREE.Object3D, authored at its own scale; the city
   scales and seats it into its district slot. */
import * as THREE from 'three';
const LM = {};

/* ---- nvda ---- */
LM.nvda = function(THREE){


// Low-poly stylised interpretation of a triangulated-roof tech campus building:
// a wide arrowhead-plan glass pavilion under a big faceted white roof shell.
function buildTower(THREE_ = THREE) {
  const T = THREE_;
  const g = new T.Group();
  g.name = 'tech_pavilion_A01';

  const M = {
    roof: new T.MeshStandardMaterial({ name: 'white_roof_panel', color: 0xdadde0, roughness: 0.55, metalness: 0.15, flatShading: true }),
    seam: new T.MeshStandardMaterial({ name: 'roof_seam_metal', color: 0xb2b7bc, roughness: 0.4, metalness: 0.35, flatShading: true }),
    glass: new T.MeshStandardMaterial({ name: 'blue_window_glass', color: 0x33556f, roughness: 0.12, metalness: 0.3, flatShading: true }),
    frame: new T.MeshStandardMaterial({ name: 'anodized_dark', color: 0x24282b, roughness: 0.6, metalness: 0.25, flatShading: true }),
    glow: new T.MeshStandardMaterial({ name: 'signal_green', color: 0x7cc000, emissive: 0x6fae00, emissiveIntensity: 0.8, roughness: 0.45, flatShading: true })
  };

  const add = (mesh, name) => {
    mesh.name = name; mesh.castShadow = true; mesh.receiveShadow = true;
    g.add(mesh); return mesh;
  };

  // ── plan outline (arrowhead with a rear notch), metres ──────────────
  const plan = [
    [0, -46], [34, -29], [46, 2], [28, 34], [8, 40],
    [0, 33], [-8, 40], [-28, 34], [-46, 2], [-34, -29]
  ];
  const C = [0, -2];
  const ring = (s, y, jit) => plan.map((p, i) => new T.Vector3(
    C[0] + (p[0] - C[0]) * s,
    y + (jit ? Math.sin(i * 2.3) * jit : 0),
    C[1] + (p[1] - C[1]) * s
  ));

  // ── glass body: two storeys, extruded plan ─────────────────────────
  const shape = new T.Shape(plan.map(p => new T.Vector2(p[0], -p[1])));
  const body = new T.Mesh(new T.ExtrudeGeometry(shape, { depth: 11.4, bevelEnabled: false }), M.glass);
  body.rotation.x = -Math.PI / 2; body.position.y = 0;
  add(body, 'curtain_wall_glass');

  const bandRing = (s, y, h, mat, name) => {
    const sh = new T.Shape(plan.map(p => new T.Vector2(C[0] + (p[0] - C[0]) * s, -(C[1] + (p[1] - C[1]) * s))));
    const m = new T.Mesh(new T.ExtrudeGeometry(sh, { depth: h, bevelEnabled: false }), mat);
    m.rotation.x = -Math.PI / 2; m.position.y = y;
    return add(m, name);
  };
  bandRing(1.012, 0, 1.1, M.frame, 'plinth');
  bandRing(1.02, 5.4, 0.7, M.frame, 'floor_slab_band');
  bandRing(1.0, 10.9, 0.5, M.frame, 'parapet_band');
  bandRing(1.055, 11.2, 0.22, M.glow, 'soffit_light_line');

  // ── faceted roof shell: ring-to-ring triangle strips ───────────────
  const r0 = ring(1.075, 12.0, 0);      // overhanging edge, lowest
  const r1 = ring(0.72, 14.6, 0.35);
  const r2 = ring(0.36, 15.6, 0.22);
  const apex = new T.Vector3(C[0], 15.9, C[1]);

  const tris = [];
  const strip = (a, b) => {
    for (let i = 0; i < a.length; i++) {
      const j = (i + 1) % a.length;
      tris.push([a[i], b[i], b[j]]);
      tris.push([a[i], b[j], a[j]]);
    }
  };
  strip(r0, r1); strip(r1, r2);
  for (let i = 0; i < r2.length; i++) tris.push([r2[i], apex, r2[(i + 1) % r2.length]]);

  const roofGeo = new T.BufferGeometry();
  const pos = [];
  for (const t of tris) for (const v of t) pos.push(v.x, v.y, v.z);
  roofGeo.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
  roofGeo.computeVertexNormals();
  add(new T.Mesh(roofGeo, M.roof), 'roof_shell');

  // roof underside skin so it reads solid from below
  const under = roofGeo.clone();
  under.scale(1, 1, 1); under.translate(0, -0.35, 0);
  const underMesh = new T.Mesh(under, M.frame);
  underMesh.name = 'roof_soffit';
  underMesh.geometry.index = null;
  underMesh.material.side = T.BackSide;
  g.add(underMesh);

  // ── triangular skylight punches, patterned across the shell ────────
  const skyPos = [];
  tris.forEach((t, ti) => {
    const cx = (t[0].x + t[1].x + t[2].x) / 3, cy = (t[0].y + t[1].y + t[2].y) / 3, cz = (t[0].z + t[1].z + t[2].z) / 3;
    const n = new T.Vector3().subVectors(t[1], t[0]).cross(new T.Vector3().subVectors(t[2], t[0])).normalize();
    if (n.y < 0) n.negate();
    const count = ti % 3 === 0 ? 3 : ti % 3 === 1 ? 2 : 1;
    for (let k = 0; k < count; k++) {
      const w = [0.55, 0.25, 0.2], sh = [[0.55, 0.25, 0.2], [0.2, 0.55, 0.25], [0.25, 0.2, 0.55]][k];
      const bx = t[0].x * sh[0] + t[1].x * sh[1] + t[2].x * sh[2];
      const by = t[0].y * sh[0] + t[1].y * sh[1] + t[2].y * sh[2];
      const bz = t[0].z * sh[0] + t[1].z * sh[1] + t[2].z * sh[2];
      void w; void cx; void cy; void cz;
      for (const v of t) {
        skyPos.push(
          bx + (v.x - bx) * 0.17 + n.x * 0.06,
          by + (v.y - by) * 0.17 + n.y * 0.06,
          bz + (v.z - bz) * 0.17 + n.z * 0.06
        );
      }
    }
  });
  const skyGeo = new T.BufferGeometry();
  skyGeo.setAttribute('position', new T.Float32BufferAttribute(skyPos, 3));
  skyGeo.computeVertexNormals();
  const sky = new T.Mesh(skyGeo, M.glass);
  sky.name = 'roof_skylights'; g.add(sky);

  // central diamond skylight
  const lantern = new T.Mesh(new T.ConeGeometry(4.2, 1.6, 4, 1), M.glass);
  lantern.name = 'central_lantern';
  lantern.position.set(C[0], 16.4, C[1]); lantern.rotation.y = Math.PI / 4;
  add(lantern, 'central_lantern');

  // ── facade detail: mullions, perimeter columns, roof seam ribs ─────
  const seg = (a, b, r, mat, name, yOff = 0) => {
    const A = new T.Vector3(a.x, a.y + yOff, a.z), B = new T.Vector3(b.x, b.y + yOff, b.z);
    const len = A.distanceTo(B);
    const m = new T.Mesh(new T.CylinderGeometry(r, r, len, 5), mat);
    m.position.copy(A).add(B).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), new T.Vector3().subVectors(B, A).normalize());
    return add(m, name);
  };

  const wall = ring(1.0, 0, 0);
  let mi = 0, ci = 0;
  for (let i = 0; i < wall.length; i++) {
    const a = wall[i], b = wall[(i + 1) % wall.length];
    const steps = Math.max(2, Math.round(a.distanceTo(b) / 6));
    for (let k = 0; k <= steps; k++) {
      const t = k / steps;
      const x = a.x + (b.x - a.x) * t, z = a.z + (b.z - a.z) * t;
      const mull = new T.Mesh(new T.BoxGeometry(0.3, 10.6, 0.5), M.seam);
      mull.position.set(x, 5.8, z);
      mull.rotation.y = Math.atan2(b.x - a.x, b.z - a.z);
      add(mull, `mullion_${++mi}`);
    }
    const col = new T.Mesh(new T.CylinderGeometry(0.42, 0.42, 12.0, 6), M.seam);
    const ea = ring(1.06, 0, 0)[i];
    col.position.set(ea.x, 6.0, ea.z);
    add(col, `perimeter_column_${++ci}`);
  }

  let ri = 0;
  for (const rr of [r0, r1, r2]) {
    for (let i = 0; i < rr.length; i++) {
      seg(rr[i], rr[(i + 1) % rr.length], 0.16, M.seam, `roof_rib_${++ri}`, 0.1);
    }
  }
  for (let i = 0; i < r0.length; i++) {
    seg(r0[i], r1[i], 0.14, M.seam, `roof_spine_${i + 1}`, 0.1);
    seg(r1[i], r2[i], 0.12, M.seam, `roof_spine_inner_${i + 1}`, 0.1);
  }

  // rooftop plant near the lantern
  [[8, 6, 3.2, 1.2, 4.0], [-9, 2, 2.4, 1.0, 3.0], [2, 14, 3.0, 0.9, 2.4]].forEach((v, i) => {
    const m = new T.Mesh(new T.BoxGeometry(v[2], v[3], v[4]), M.seam);
    m.position.set(v[0], 15.2 + v[3] / 2, v[1]);
    m.rotation.y = i * 0.4;
    add(m, `roof_plant_${i + 1}`);
  });

  // ── signage ────────────────────────────────────────────
  const emblem = new T.Mesh(new T.BoxGeometry(7.2, 1.4, 0.5), M.glow);
  emblem.name = 'entrance_sign'; emblem.position.set(0, 3.4, -47.6);
  add(emblem, 'entrance_sign');

  return { group: g, emblem, materials: M };
}
  
  const r = buildTower(THREE);
  return r.group || r;
};

/* ---- msft ---- */
LM.msft = function(THREE){


// Low-poly low-rise campus building: full-height glass curtain wall under a
// deep louvered roof canopy, dark finned cladding volume at one end, and a
// low sign wall carrying a four-colour accent motif.
function buildBuilding(THREE_ = THREE) {
  const T = THREE_;
  const g = new T.Group();
  g.name = 'tech_block_A02';

  const M = {
    glass: new T.MeshStandardMaterial({ name: 'curtain_wall_glass', color: 0x2f4f6b, roughness: 0.1, metalness: 0.3, flatShading: true }),
    mull: new T.MeshStandardMaterial({ name: 'mullion_metal', color: 0x9aa2a8, roughness: 0.4, metalness: 0.4, flatShading: true }),
    clad: new T.MeshStandardMaterial({ name: 'dark_fin_cladding', color: 0x2b3134, roughness: 0.65, metalness: 0.2, flatShading: true }),
    canopy: new T.MeshStandardMaterial({ name: 'canopy_panel', color: 0xd9d7d2, roughness: 0.6, metalness: 0.1, flatShading: true }),
    lobby: new T.MeshStandardMaterial({ name: 'lobby_light', color: 0xffd9a8, emissive: 0xffc478, emissiveIntensity: 0.5, roughness: 0.5, flatShading: true }),
    accentBlue: new T.MeshStandardMaterial({ name: 'accent_blue', color: 0x1e88d8, emissive: 0x1567a8, emissiveIntensity: 0.55, roughness: 0.35, flatShading: true }),
    accentRed: new T.MeshStandardMaterial({ name: 'accent_red', color: 0xd8503b, emissive: 0xa03828, emissiveIntensity: 0.55, roughness: 0.35, flatShading: true }),
    accentGreen: new T.MeshStandardMaterial({ name: 'accent_green', color: 0x74b342, emissive: 0x4d7a2c, emissiveIntensity: 0.55, roughness: 0.35, flatShading: true }),
    accentYellow: new T.MeshStandardMaterial({ name: 'accent_yellow', color: 0xe8b83c, emissive: 0xa8842a, emissiveIntensity: 0.55, roughness: 0.35, flatShading: true })
  };

  const add = (m, name) => { m.name = name; m.castShadow = true; m.receiveShadow = true; g.add(m); return m; };
  const box = (w, h, d, mat, name, x, y, z) => add(new T.Mesh(new T.BoxGeometry(w, h, d), mat), name).position.set(x, y, z) || g.getObjectByName(name);

  const W = 64, D = 24, FL = 4.2, FLOORS = 3, H = FL * FLOORS;

  // ── glazed volume ──────────────────────────────────────────────────
  box(W - 12, H, D, M.glass, 'curtain_wall_glass_volume', 6, H / 2, 0);
  for (let i = 0; i < FLOORS; i++) {
    box(W - 11.6, 0.55, D + 0.3, M.mull, `floor_line_${i + 1}`, 6, (i + 1) * FL - 0.3, 0);
    box(W - 12.4, 0.35, D - 4, M.lobby, `interior_light_${i + 1}`, 6, (i + 1) * FL - 1.0, 0);
  }
  // slim vertical mullions on both long faces
  const bays = 16;
  for (let k = 0; k <= bays; k++) {
    const x = 6 - (W - 12) / 2 + ((W - 12) / bays) * k;
    for (const z of [-D / 2 - 0.05, D / 2 + 0.05]) {
      box(0.2, H, 0.35, M.mull, `mullion_${k + 1}_${z > 0 ? 'b' : 'a'}`, x, H / 2, z);
    }
  }
  box(W - 11.6, 0.5, D + 0.4, M.mull, 'head_transom', 6, H + 0.25, 0);

  // ── dark finned cladding volume at the far end ─────────────────────
  const CX = -W / 2 + 6;
  box(12, H + 0.8, D + 0.6, M.clad, 'clad_volume', CX, (H + 0.8) / 2, 0);
  for (let k = 0; k < 22; k++) {
    const z = -D / 2 + 0.6 + k * ((D - 1.2) / 21);
    box(0.35, H - 0.6, 0.55, M.clad, `clad_fin_${k + 1}`, CX - 6.3, H / 2, z);
  }
  for (let k = 0; k < 11; k++) {
    box(0.9, H - 0.6, 0.3, M.clad, `clad_fin_front_${k + 1}`, CX - 5 + k, H / 2, D / 2 + 0.45);
  }

  // ── deep roof canopy with louvered brise-soleil ────────────────────
  const CH = 14.2, CW = W + 3, CD = D + 11;
  box(CW, 0.7, CD, M.canopy, 'canopy_slab', 2, CH, 3);
  box(CW + 0.5, 0.45, 0.6, M.mull, 'canopy_fascia_front', 2, CH + 0.5, 3 + CD / 2);
  for (let k = 0; k < 26; k++) {
    const x = 2 - CW / 2 + 1.4 + k * ((CW - 2.8) / 25);
    box(0.9, 0.28, CD - 1.5, M.canopy, `louvre_${k + 1}`, x, CH + 0.75, 3);
  }
  for (let k = 0; k < 5; k++) {
    const bm = new T.Mesh(new T.BoxGeometry(0.5, 0.9, CD - 1.0), M.mull);
    bm.position.set(2 - CW / 2 + 6 + k * ((CW - 12) / 4), CH - 0.75, 3);
    add(bm, `canopy_beam_${k + 1}`);
  }
  for (let k = 0; k < 6; k++) {
    const c = new T.Mesh(new T.CylinderGeometry(0.28, 0.28, CH - 0.4, 6), M.mull);
    c.position.set(2 - CW / 2 + 7 + k * ((CW - 14) / 5), (CH - 0.4) / 2, 3 + CD / 2 - 1.4);
    add(c, `canopy_column_${k + 1}`);
  }

  // ── low sign wall with the four-colour accent motif ────────────────
  const SW = 18, SX = 6, SZ = 3 + CD / 2 + 4.0;
  box(SW, 3.4, 1.2, M.clad, 'sign_wall', SX, 1.7, SZ);
  const accents = [M.accentRed, M.accentGreen, M.accentBlue, M.accentYellow];
  accents.forEach((mat, i) => {
    box(1.5, 1.5, 0.28, mat, `signal_pane_${i + 1}`, SX - SW / 2 + 2.4 + i * 2.1, 1.9, SZ + 0.72);
  });
  // same palette repeated as lit panes high on the glass facade
  accents.forEach((mat, i) => {
    box(2.6, 1.6, 0.3, mat, `facade_pane_${i + 1}`, 18 + i * 4.0, H - 2.0 - (i % 2) * 1.9, D / 2 + 0.35);
  });

  const emblem = g.getObjectByName('signal_pane_3');
  return { group: g, emblem, materials: M };
}
  
  const r = buildBuilding(THREE);
  return r.group || r;
};

/* ---- googl ---- */
LM.googl = function(THREE){


// Low-poly campus building: bowed glass curtain wall with a dense mullion
// grid, low white rear block, and an open rooftop pergola carrying a grid
// array of small colour-cycling lights.
function buildBuilding(THREE_ = THREE) {
  const T = THREE_;
  const g = new T.Group();
  g.name = 'tech_campus_A03';

  const M = {
    glass: new T.MeshStandardMaterial({ name: 'reflective_glass', color: 0x2c4460, roughness: 0.08, metalness: 0.35, flatShading: true }),
    mull: new T.MeshStandardMaterial({ name: 'mullion_metal', color: 0xa6adb2, roughness: 0.4, metalness: 0.4, flatShading: true }),
    panel: new T.MeshStandardMaterial({ name: 'panel_white', color: 0xdcdad6, roughness: 0.7, metalness: 0.05, flatShading: true }),
    steel: new T.MeshStandardMaterial({ name: 'pergola_steel', color: 0x8d949a, roughness: 0.45, metalness: 0.4, flatShading: true }),
    interior: new T.MeshStandardMaterial({ name: 'interior_light', color: 0xffe6bf, emissive: 0xffc98a, emissiveIntensity: 0.4, roughness: 0.55, flatShading: true })
  };
  const accentSpecs = [['blue', 0x2f7de1], ['red', 0xdd4b3e], ['yellow', 0xecb731], ['green', 0x53a24b]];
  const accents = accentSpecs.map(([n, c]) => new T.MeshStandardMaterial({
    name: `accent_${n}`, color: c, emissive: c, emissiveIntensity: 0.9, roughness: 0.35, flatShading: true
  }));
  accents.forEach((m, i) => { M[`accent${i}`] = m; });

  const add = (m, name) => { m.name = name; m.castShadow = true; m.receiveShadow = true; g.add(m); return m; };
  const box = (w, h, d, mat, name, x, y, z, ry = 0) => {
    const m = new T.Mesh(new T.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z); m.rotation.y = ry;
    return add(m, name);
  };

  // ── bowed glass curtain wall ───────────────────────────────────────
  const R = 74, TH = 1.05, T0 = -TH / 2, FL = 4.25, FLOORS = 4, H = FL * FLOORS;
  const arc = (r, h, y, mat, name, segs = 20) => {
    const m = new T.Mesh(new T.CylinderGeometry(r, r, h, segs, 1, true, T0, TH), mat);
    m.position.set(0, y, -R); return add(m, name);
  };
  arc(R, H, H / 2, M.glass, 'curved_curtain_wall');
  arc(R - 1.6, H - 1.0, H / 2, M.interior, 'interior_floorplate_glow', 14);

  for (let i = 0; i <= FLOORS; i++) {
    arc(R + 0.25, 0.5, i === 0 ? 0.3 : i * FL - 0.35, M.mull, `floor_line_${i + 1}`);
  }
  const bays = 26;
  for (let k = 0; k <= bays; k++) {
    const th = T0 + (TH / bays) * k;
    box(0.24, H, 0.55, M.mull, `mullion_${k + 1}`,
      Math.sin(th) * (R + 0.25), H / 2, -R + Math.cos(th) * (R + 0.25), th);
  }
  arc(R + 0.7, 1.5, H + 0.75, M.panel, 'parapet_band');
  arc(R + 0.55, 1.1, 0.55, M.panel, 'base_plinth');

  const roofPlate = new T.Mesh(new T.RingGeometry(R - 13, R + 0.5, 20, 1, T0 + Math.PI / 2, TH), M.panel);
  roofPlate.rotation.x = -Math.PI / 2; roofPlate.rotation.z = Math.PI;
  roofPlate.position.set(0, H + 0.02, -R);
  add(roofPlate, 'roof_plate');

  // close the back of the bowed volume
  const endX = Math.sin(TH / 2) * R, endZ = -R + Math.cos(TH / 2) * R;
  box(endX * 2 + 0.6, H, 0.6, M.panel, 'back_wall', 0, H / 2, endZ - 0.3);
  box(endX * 2 + 0.9, 1.5, 0.9, M.panel, 'back_wall_parapet', 0, H + 0.75, endZ - 0.3);

  // ── rear block, stepped back ───────────────────────────────────────
  const RZ = endZ - 12;
  box(52, H, 24, M.panel, 'rear_block', 0, H / 2, RZ);
  for (let i = 1; i < FLOORS; i++) {
    box(52.5, 0.5, 24.5, M.mull, `rear_floor_line_${i}`, 0, i * FL - 0.35, RZ);
    box(50, FL - 1.6, 0.4, M.glass, `rear_glazing_${i}`, 0, i * FL + (FL - 1.6) / 2 - 1.1, RZ - 12.3);
  }
  box(53, 0.7, 25, M.panel, 'rear_parapet', 0, H + 0.35, RZ);

  // ── rooftop pergola with a colour-cycling light array ──────────────
  const PY = H + 4.0, PW = 44, PD = 16, PZ = -12;
  for (const [i, x] of [-PW / 2, -PW / 6, PW / 6, PW / 2].entries()) {
    for (const [j, z] of [PZ - PD / 2, PZ + PD / 2].entries()) {
      const c = new T.Mesh(new T.CylinderGeometry(0.18, 0.18, 4.0, 6), M.steel);
      c.position.set(x, H + 2.0, z);
      add(c, `pergola_post_${i + 1}_${j + 1}`);
    }
  }
  for (let j = 0; j < 4; j++) {
    box(PW + 2, 0.28, 0.4, M.steel, `pergola_beam_${j + 1}`, 0, PY, PZ - PD / 2 + (PD / 3) * j);
  }
  for (let k = 0; k < 12; k++) {
    box(0.32, 0.22, PD + 1.5, M.steel, `pergola_purlin_${k + 1}`, -PW / 2 + (PW / 11) * k, PY + 0.22, PZ);
  }

  const lights = [];
  let li = 0;
  for (let k = 0; k < 11; k++) {
    for (let j = 0; j < 3; j++) {
      const mat = accents[(k + j) % accents.length].clone();
      mat.name = accents[(k + j) % accents.length].name;
      const m = new T.Mesh(new T.BoxGeometry(1.1, 0.5, 1.1), mat);
      m.position.set(-PW / 2 + 2 + (PW - 4) / 10 * k, PY + 0.6, PZ - PD / 2 + 3 + (PD - 6) / 2 * j);
      add(m, `crown_light_${++li}`);
      lights.push(m);
    }
  }

  // rooftop plant on the rear block
  [[-14, RZ - 4, 7, 2.0, 5], [8, RZ + 4, 5, 1.5, 4]].forEach((v, i) => {
    box(v[2], v[3], v[4], M.steel, `roof_plant_${i + 1}`, v[0], H + 0.7 + v[3] / 2, v[1]);
  });

  return { group: g, emblem: lights[0], lights, materials: M };
}
  
  const r = buildBuilding(THREE);
  return r.group || r;
};

/* ---- meta ---- */
LM.meta = function(THREE){


// Low-poly twin glass towers linked by a sky-bridge, with a continuous
// glowing light strip looping around the bridge.
function buildBuilding(THREE_ = THREE) {
  const T = THREE_;
  const g = new T.Group();
  g.name = 'tech_twins_A04';

  const M = {
    glass: new T.MeshStandardMaterial({ name: 'tower_glass', color: 0x33546f, roughness: 0.1, metalness: 0.32, flatShading: true }),
    mull: new T.MeshStandardMaterial({ name: 'mullion_metal', color: 0xaeb5ba, roughness: 0.4, metalness: 0.4, flatShading: true }),
    panel: new T.MeshStandardMaterial({ name: 'panel_white', color: 0xe2e1dd, roughness: 0.65, metalness: 0.05, flatShading: true }),
    steel: new T.MeshStandardMaterial({ name: 'structure_steel', color: 0x8b9298, roughness: 0.45, metalness: 0.4, flatShading: true }),
    interior: new T.MeshStandardMaterial({ name: 'interior_light', color: 0xffe8c6, emissive: 0xffca8c, emissiveIntensity: 0.35, roughness: 0.55, flatShading: true })
  };
  const strip = new T.MeshStandardMaterial({ name: 'accent_blue_strip', color: 0x2f7de1, emissive: 0x2f7de1, emissiveIntensity: 1.0, roughness: 0.3, flatShading: true });
  M.strip = strip;

  const add = (m, name) => { m.name = name; m.castShadow = true; m.receiveShadow = true; g.add(m); return m; };
  const box = (w, h, d, mat, name, x, y, z) => {
    const m = new T.Mesh(new T.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z); return add(m, name);
  };

  const FL = 4.1, W = 24, D = 20, GAP = 22;
  const towers = [
    { x: -(GAP / 2 + W / 2), floors: 9, tag: 'tower_a' },
    { x: (GAP / 2 + W / 2), floors: 9, tag: 'tower_b' }
  ];

  towers.forEach(({ x, floors, tag }) => {
    const H = floors * FL;
    box(W, H, D, M.glass, `${tag}_glass_volume`, x, H / 2, 0);
    box(W - 3, H - 2, D - 3, M.interior, `${tag}_interior_glow`, x, H / 2, 0);
    box(W + 1.0, 2.0, D + 1.0, M.panel, `${tag}_base_plinth`, x, 1.0, 0);
    for (let i = 1; i <= floors; i++) {
      box(W + 0.4, 0.5, D + 0.4, M.mull, `${tag}_floor_line_${i}`, x, i * FL - 0.3, 0);
    }
    const bays = 7;
    for (let k = 0; k <= bays; k++) {
      const mx = x - W / 2 + (W / bays) * k;
      for (const z of [-D / 2 - 0.2, D / 2 + 0.2]) {
        box(0.24, H, 0.4, M.mull, `${tag}_mullion_${k + 1}_${z > 0 ? 'b' : 'a'}`, mx, H / 2, z);
      }
    }
    const dbays = 6;
    for (let k = 1; k < dbays; k++) {
      const mz = -D / 2 + (D / dbays) * k;
      for (const sx of [-1, 1]) {
        box(0.4, H, 0.24, M.mull, `${tag}_side_mullion_${k}_${sx > 0 ? 'b' : 'a'}`, x + sx * (W / 2 + 0.2), H / 2, mz);
      }
    }
    box(W + 1.6, 1.6, D + 1.6, M.panel, `${tag}_crown_parapet`, x, H + 0.8, 0);
    box(W - 2, 0.5, D - 2, M.panel, `${tag}_roof_plate`, x, H + 0.26, 0);
    box(8, 2.4, 6, M.steel, `${tag}_roof_plant`, x - 5, H + 1.7, -4);
  });

  // ── sky-bridge ─────────────────────────────────────────────────────
  const BY = 6 * FL, BW = GAP + 2, BH = 4.6, BD = 11;
  box(BW, BH, BD, M.glass, 'skybridge_glass', 0, BY + BH / 2, 0);
  box(BW, 0.8, BD + 0.8, M.panel, 'skybridge_deck', 0, BY + 0.4, 0);
  box(BW, 0.6, BD + 0.8, M.panel, 'skybridge_soffit_cap', 0, BY + BH - 0.3, 0);
  for (let k = 0; k <= 8; k++) {
    const bx = -BW / 2 + (BW / 8) * k;
    for (const z of [-BD / 2 - 0.15, BD / 2 + 0.15]) {
      box(0.22, BH - 1.4, 0.3, M.mull, `skybridge_mullion_${k + 1}_${z > 0 ? 'b' : 'a'}`, bx, BY + BH / 2, z);
    }
  }
  for (let k = 0; k < 2; k++) {
    const bm = new T.Mesh(new T.BoxGeometry(BW, 0.5, 0.5), M.steel);
    bm.position.set(0, BY - 0.1, (k ? 1 : -1) * (BD / 2 - 0.8));
    add(bm, `skybridge_beam_${k + 1}`);
  }

  // continuous glowing strip looping around the bridge
  const S = 0.34;
  const loop = [
    ['strip_front_low', BW, S, S, 0, BY + 1.0, BD / 2 + 0.35],
    ['strip_front_high', BW, S, S, 0, BY + BH - 0.9, BD / 2 + 0.35],
    ['strip_back_low', BW, S, S, 0, BY + 1.0, -BD / 2 - 0.35],
    ['strip_back_high', BW, S, S, 0, BY + BH - 0.9, -BD / 2 - 0.35],
    ['strip_end_a_low', S, S, BD + 0.7, -(GAP / 2 - 0.4), BY + 1.0, 0],
    ['strip_end_a_high', S, S, BD + 0.7, -(GAP / 2 - 0.4), BY + BH - 0.9, 0],
    ['strip_end_b_low', S, S, BD + 0.7, GAP / 2 - 0.4, BY + 1.0, 0],
    ['strip_end_b_high', S, S, BD + 0.7, GAP / 2 - 0.4, BY + BH - 0.9, 0]
  ];
  const strips = loop.map(([n, w, h, d, x, y, z]) => box(w, h, d, strip, n, x, y, z));
  for (const sx of [-1, 1]) {
    strips.push(box(S, BH - 1.6, S, strip, `strip_riser_${sx > 0 ? 'b' : 'a'}`, sx * (GAP / 2 - 0.4), BY + BH / 2, BD / 2 + 0.35));
  }

  return { group: g, emblem: strips[0], strips, materials: M };
}
  
  const r = buildBuilding(THREE);
  return r.group || r;
};

/* ---- lly ---- */
LM.lly = function(THREE){


// Low-poly clinical HQ: stepped limestone blocks with a punched square
// window grid, red-brown base band, glazed setback skylights, and a glowing
// red accent bar at the crown.
function buildBuilding(THREE_ = THREE) {
  const T = THREE_;
  const g = new T.Group();
  g.name = 'health_hq_A05';

  const M = {
    stone: new T.MeshStandardMaterial({ name: 'limestone_panel', color: 0xe4e0d8, roughness: 0.75, metalness: 0.04, flatShading: true }),
    stoneTrim: new T.MeshStandardMaterial({ name: 'limestone_trim', color: 0xd2cdc3, roughness: 0.7, metalness: 0.05, flatShading: true }),
    base: new T.MeshStandardMaterial({ name: 'red_brown_base', color: 0x6d4640, roughness: 0.8, metalness: 0.05, flatShading: true }),
    window: new T.MeshStandardMaterial({ name: 'window_glass', color: 0x3b444d, roughness: 0.14, metalness: 0.3, flatShading: true }),
    skylight: new T.MeshStandardMaterial({ name: 'skylight_glass', color: 0x7f9fb2, roughness: 0.1, metalness: 0.25, flatShading: true }),
    steel: new T.MeshStandardMaterial({ name: 'trim_metal', color: 0x8f959a, roughness: 0.45, metalness: 0.4, flatShading: true }),
    accent: new T.MeshStandardMaterial({ name: 'accent_red', color: 0xd23a33, emissive: 0xc22f28, emissiveIntensity: 0.95, roughness: 0.35, flatShading: true })
  };

  const add = (m, name) => { m.name = name; m.castShadow = true; m.receiveShadow = true; g.add(m); return m; };
  const box = (w, h, d, mat, name, x, y, z) => {
    const m = new T.Mesh(new T.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z); return add(m, name);
  };

  const FL = 3.8, BASE_H = 4.6;

  const block = (w, d, x, z, floors, tag, covers = []) => {
    const H = BASE_H + floors * FL;
    const hidden = (px, py, pz) => covers.some(c =>
      px > c.x0 - 0.6 && px < c.x1 + 0.6 && pz > c.z0 - 0.6 && pz < c.z1 + 0.6 && py < c.y1);
    box(w, H, d, M.stone, `${tag}_volume`, x, H / 2, z);
    box(w + 0.5, BASE_H, d + 0.5, M.base, `${tag}_base_band`, x, BASE_H / 2, z);
    box(w + 0.9, 1.4, d + 0.9, M.stoneTrim, `${tag}_cornice`, x, H + 0.7, z);
    box(w - 2.5, 0.5, d - 2.5, M.stoneTrim, `${tag}_roof_plate`, x, H + 0.26, z);

    // punched square windows: front, back and both sides
    const bx = Math.max(3, Math.round(w / 4.4)), bz = Math.max(2, Math.round(d / 4.4));
    for (let f = 0; f < floors; f++) {
      const wy = BASE_H + f * FL + FL / 2 + 0.1;
      for (let k = 0; k < bx; k++) {
        const wx = x - w / 2 + (w / bx) * (k + 0.5);
        if (!hidden(wx, wy, z + d / 2)) box(2.5, 2.1, 0.5, M.window, `${tag}_win_f${f + 1}_${k + 1}_s`, wx, wy, z + d / 2 + 0.05);
        if (!hidden(wx, wy, z - d / 2)) box(2.5, 2.1, 0.5, M.window, `${tag}_win_f${f + 1}_${k + 1}_n`, wx, wy, z - d / 2 - 0.05);
      }
      for (let k = 0; k < bz; k++) {
        const wz = z - d / 2 + (d / bz) * (k + 0.5);
        if (!hidden(x + w / 2, wy, wz)) box(0.5, 2.1, 2.5, M.window, `${tag}_win_f${f + 1}_${k + 1}_e`, x + w / 2 + 0.05, wy, wz);
        if (!hidden(x - w / 2, wy, wz)) box(0.5, 2.1, 2.5, M.window, `${tag}_win_f${f + 1}_${k + 1}_w`, x - w / 2 - 0.05, wy, wz);
      }
      // ground-floor tall glazing inside the base band
      if (f === 0) {
        for (let k = 0; k < bx; k++) {
          const wx = x - w / 2 + (w / bx) * (k + 0.5);
          if (!hidden(wx, 2.4, z + d / 2)) box(3.0, 3.0, 0.4, M.window, `${tag}_lobby_glazing_${k + 1}`, wx, 2.4, z + d / 2 + 0.3);
        }
      }
    }
    // stone piers between window bays, expressing the grid
    for (let k = 0; k <= bx; k++) {
      const px = x - w / 2 + (w / bx) * k;
      if (hidden(px, H - 1, z + d / 2)) continue;
      box(0.8, H - BASE_H, 0.5, M.stoneTrim, `${tag}_pier_${k + 1}`, px, BASE_H + (H - BASE_H) / 2, z + d / 2 + 0.05);
    }
    return H;
  };

  // three descending stepped volumes
  const boxes = {
    high: { x0: -39, x1: -5, z0: -13, z1: 13, y1: BASE_H + 9 * FL },
    mid: { x0: -9, x1: 15, z0: -7, z1: 15, y1: BASE_H + 6 * FL },
    low: { x0: 15, x1: 37, z0: -2, z1: 18, y1: BASE_H + 4 * FL }
  };
  const H1 = block(34, 26, -22, 0, 9, 'tower_high', [boxes.mid]);
  block(24, 22, 3, 4, 6, 'tower_mid', [boxes.high, boxes.low]);
  block(22, 20, 26, 8, 4, 'tower_low', [boxes.mid]);
  const H2 = boxes.mid.y1, H3 = boxes.low.y1;

  // glazed pyramidal skylights on the two lower setbacks
  [[3, 4, H2, 'skylight_mid'], [26, 8, H3, 'skylight_low']].forEach(([x, z, h, name]) => {
    const p = new T.Mesh(new T.ConeGeometry(4.6, 3.0, 4, 1), M.skylight);
    p.position.set(x, h + 1.9, z); p.rotation.y = Math.PI / 4;
    add(p, name);
  });

  // glowing red accent bar at the crown of the tallest block, plus a slim
  // stripe running down the front face
  const bar = box(24, 1.1, 1.1, M.accent, 'crown_accent_bar', -22, H1 + 1.9, 13.6);
  box(1.0, H1 - BASE_H - 2, 0.7, M.accent, 'facade_accent_stripe', -6.5, BASE_H + (H1 - BASE_H) / 2, 13.4);
  box(26, 0.6, 0.6, M.stoneTrim, 'crown_bar_rail', -22, H1 + 1.1, 13.6);

  // rooftop plant
  box(9, 2.4, 7, M.steel, 'roof_plant_1', -30, H1 + 1.7, -4);
  box(6, 1.6, 5, M.steel, 'roof_plant_2', -14, H1 + 1.3, -6);

  return { group: g, emblem: bar, materials: M };
}
  
  const r = buildBuilding(THREE);
  return r.group || r;
};

/* ---- wmt ---- */
LM.wmt = function(THREE){


// Low-poly retail HQ: big-box base in dark metal panel with stone piers and a
// deep lit eave, a glazed tower rising from its centre, and an abstract
// starburst beacon on the tower roof.
function buildBuilding(THREE_ = THREE) {
  const T = THREE_;
  const g = new T.Group();
  g.name = 'retail_hq_A06';

  const M = {
    panel: new T.MeshStandardMaterial({ name: 'dark_metal_panel', color: 0x343a3e, roughness: 0.6, metalness: 0.25, flatShading: true }),
    stone: new T.MeshStandardMaterial({ name: 'stone_pier', color: 0xb6afa2, roughness: 0.85, metalness: 0.04, flatShading: true }),
    glass: new T.MeshStandardMaterial({ name: 'atrium_glass', color: 0x3d5c74, roughness: 0.1, metalness: 0.3, flatShading: true }),
    mull: new T.MeshStandardMaterial({ name: 'mullion_dark', color: 0x22262a, roughness: 0.5, metalness: 0.3, flatShading: true }),
    soffit: new T.MeshStandardMaterial({ name: 'warm_soffit', color: 0xd8b98d, emissive: 0xc09258, emissiveIntensity: 0.4, roughness: 0.6, flatShading: true }),
    steel: new T.MeshStandardMaterial({ name: 'trim_metal', color: 0x8d949a, roughness: 0.45, metalness: 0.4, flatShading: true }),
    blue: new T.MeshStandardMaterial({ name: 'accent_blue', color: 0x1f6fd0, emissive: 0x1f6fd0, emissiveIntensity: 0.8, roughness: 0.35, flatShading: true }),
    spark: new T.MeshStandardMaterial({ name: 'accent_yellow_spark', color: 0xf2c230, emissive: 0xe8b21c, emissiveIntensity: 1.0, roughness: 0.3, flatShading: true })
  };

  const add = (m, name) => { m.name = name; m.castShadow = true; m.receiveShadow = true; g.add(m); return m; };
  const box = (w, h, d, mat, name, x, y, z, rz = 0) => {
    const m = new T.Mesh(new T.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z); m.rotation.z = rz; return add(m, name);
  };

  // ── big-box base ───────────────────────────────────────────────────
  const BW = 92, BD = 58, BH = 11.4;
  box(BW, BH, BD, M.panel, 'base_volume', 0, BH / 2, 0);
  box(BW + 0.6, 0.8, BD + 0.6, M.mull, 'base_floor_line', 0, 5.9, 0);

  // stone piers + glazing bays around the perimeter
  const bxN = 15, bzN = 9;
  for (let k = 0; k <= bxN; k++) {
    const x = -BW / 2 + (BW / bxN) * k;
    for (const sz of [-1, 1]) {
      box(1.6, BH, 0.5, M.stone, `pier_x${k + 1}_${sz > 0 ? 'b' : 'a'}`, x, BH / 2, sz * (BD / 2 + 0.2));
    }
  }
  for (let k = 0; k <= bzN; k++) {
    const z = -BD / 2 + (BD / bzN) * k;
    for (const sx of [-1, 1]) {
      box(0.5, BH, 1.6, M.stone, `pier_z${k + 1}_${sx > 0 ? 'b' : 'a'}`, sx * (BW / 2 + 0.2), BH / 2, z);
    }
  }
  for (let k = 0; k < bxN; k++) {
    const x = -BW / 2 + (BW / bxN) * (k + 0.5);
    for (const sz of [-1, 1]) {
      box(BW / bxN - 2.2, 4.4, 0.4, M.glass, `base_glazing_low_x${k + 1}_${sz > 0 ? 'b' : 'a'}`, x, 3.1, sz * (BD / 2 + 0.15));
      box(BW / bxN - 2.2, 3.4, 0.4, M.glass, `base_glazing_high_x${k + 1}_${sz > 0 ? 'b' : 'a'}`, x, 8.4, sz * (BD / 2 + 0.15));
    }
  }
  for (let k = 0; k < bzN; k++) {
    const z = -BD / 2 + (BD / bzN) * (k + 0.5);
    for (const sx of [-1, 1]) {
      box(0.4, 4.4, BD / bzN - 2.2, M.glass, `base_glazing_low_z${k + 1}_${sx > 0 ? 'b' : 'a'}`, sx * (BW / 2 + 0.15), 3.1, z);
      box(0.4, 3.4, BD / bzN - 2.2, M.glass, `base_glazing_high_z${k + 1}_${sx > 0 ? 'b' : 'a'}`, sx * (BW / 2 + 0.15), 8.4, z);
    }
  }

  // deep overhanging eave with a warm soffit and a blue light line
  box(BW + 9, 1.0, BD + 9, M.panel, 'eave_slab', 0, BH + 0.5, 0);
  box(BW + 8.4, 0.35, BD + 8.4, M.soffit, 'eave_soffit', 0, BH - 0.1, 0);
  const EW = BW + 9.3, ED = BD + 9.3;
  for (const sz of [-1, 1]) {
    box(EW, 0.3, 0.3, M.blue, `eave_light_line_${sz > 0 ? 'south' : 'north'}`, 0, BH + 1.15, sz * ED / 2);
  }
  for (const sx of [-1, 1]) {
    box(0.3, 0.3, ED, M.blue, `eave_light_line_${sx > 0 ? 'east' : 'west'}`, sx * EW / 2, BH + 1.15, 0);
  }

  // ── glazed tower rising from the centre ────────────────────────────
  const TW = 26, TD = 26, TH = 21, TY = BH + 1.0;
  box(TW, TH, TD, M.glass, 'tower_glass_volume', 0, TY + TH / 2, 0);
  for (let i = 1; i < 5; i++) {
    box(TW + 0.5, 0.45, TD + 0.5, M.mull, `tower_floor_line_${i}`, 0, TY + i * (TH / 5), 0);
  }
  for (let k = 0; k <= 6; k++) {
    const t = -TW / 2 + (TW / 6) * k;
    for (const s of [-1, 1]) {
      box(0.3, TH, 0.45, M.mull, `tower_mullion_x${k + 1}_${s > 0 ? 'b' : 'a'}`, t, TY + TH / 2, s * (TD / 2 + 0.2));
      box(0.45, TH, 0.3, M.mull, `tower_mullion_z${k + 1}_${s > 0 ? 'b' : 'a'}`, s * (TW / 2 + 0.2), TY + TH / 2, t);
    }
  }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    box(1.1, TH + 1.2, 1.1, M.mull, `tower_corner_${sx > 0 ? 'e' : 'w'}${sz > 0 ? 's' : 'n'}`,
      sx * (TW / 2 + 0.1), TY + (TH + 1.2) / 2, sz * (TD / 2 + 0.1));
  }
  box(TW + 2.4, 1.6, TD + 2.4, M.panel, 'tower_crown_parapet', 0, TY + TH + 0.8, 0);
  box(TW - 2, 0.5, TD - 2, M.panel, 'tower_roof_plate', 0, TY + TH + 0.26, 0);
  box(9, 2.2, 7, M.steel, 'tower_roof_plant', -6, TY + TH + 1.6, -6);

  // ── rooftop starburst beacon ───────────────────────────────────────
  const SY = TY + TH + 4.6;
  box(2.0, 2.0, 2.0, M.spark, 'spark_core', 0, SY, 0);
  for (let k = 0; k < 8; k++) {
    const a = (k * Math.PI) / 4;
    const len = k % 2 ? 3.2 : 4.6;
    box(len, 0.7, 0.7, M.spark, `spark_ray_${k + 1}`, Math.cos(a) * (len / 2 + 1.2), SY + Math.sin(a) * (len / 2 + 1.2), 0, a);
  }
  const mast = new T.Mesh(new T.CylinderGeometry(0.3, 0.4, 3.0, 6), M.steel);
  mast.position.set(0, TY + TH + 2.0, 0);
  add(mast, 'spark_mast');

  const emblem = g.getObjectByName('spark_core');
  return { group: g, emblem, materials: M };
}
  
  const r = buildBuilding(THREE);
  return r.group || r;
};

/* ---- v ---- */
LM.v = function(THREE){


// Low-poly finance tower: white precast exoskeleton grid over glass, stepped
// crown, low podium wing, and a blue 'swipe line' climbing one facade.
function buildBuilding(THREE_ = THREE) {
  const T = THREE_;
  const g = new T.Group();
  g.name = 'finance_tower_A07';

  const M = {
    precast: new T.MeshStandardMaterial({ name: 'white_precast', color: 0xe8e5de, roughness: 0.72, metalness: 0.05, flatShading: true }),
    precastShade: new T.MeshStandardMaterial({ name: 'white_precast_shade', color: 0xd6d2ca, roughness: 0.75, metalness: 0.05, flatShading: true }),
    glass: new T.MeshStandardMaterial({ name: 'tower_glass', color: 0x33566d, roughness: 0.1, metalness: 0.3, flatShading: true }),
    mull: new T.MeshStandardMaterial({ name: 'mullion_metal', color: 0x8e969c, roughness: 0.42, metalness: 0.4, flatShading: true }),
    steel: new T.MeshStandardMaterial({ name: 'trim_metal', color: 0x8a9197, roughness: 0.45, metalness: 0.4, flatShading: true })
  };
  const blue = new T.MeshStandardMaterial({ name: 'accent_blue_line', color: 0x1a56d6, emissive: 0x1a56d6, emissiveIntensity: 1.0, roughness: 0.3, flatShading: true });
  M.blue = blue;

  const add = (m, name) => { m.name = name; m.castShadow = true; m.receiveShadow = true; g.add(m); return m; };
  const box = (w, h, d, mat, name, x, y, z) => {
    const m = new T.Mesh(new T.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z); return add(m, name);
  };

  const FL = 3.9;

  // exoskeleton volume: glass box wrapped in white bands + fins
  const volume = (w, d, x, z, y0, floors, tag) => {
    const H = floors * FL;
    box(w, H, d, M.glass, `${tag}_glass`, x, y0 + H / 2, z);
    for (let i = 0; i <= floors; i++) {
      box(w + 1.4, 0.9, d + 1.4, M.precast, `${tag}_band_${i + 1}`, x, y0 + i * FL, z);
    }
    const fx = Math.round(w / 2.9), fz = Math.round(d / 2.9);
    for (let k = 0; k <= fx; k++) {
      const px = x - w / 2 + (w / fx) * k;
      for (const s of [-1, 1]) {
        box(0.55, H, 1.5, M.precastShade, `${tag}_fin_x${k + 1}_${s > 0 ? 'b' : 'a'}`, px, y0 + H / 2, z + s * (d / 2 + 0.45));
      }
    }
    for (let k = 0; k <= fz; k++) {
      const pz = z - d / 2 + (d / fz) * k;
      for (const s of [-1, 1]) {
        box(1.5, H, 0.55, M.precastShade, `${tag}_fin_z${k + 1}_${s > 0 ? 'b' : 'a'}`, x + s * (w / 2 + 0.45), y0 + H / 2, pz);
      }
    }
    return y0 + H;
  };

  // ── tower with two setbacks ────────────────────────────────────────
  const TW = 27, TD = 24;
  const y1 = volume(TW, TD, 0, 0, 0, 11, 'tower_low');
  const y2 = volume(TW - 6, TD - 4, -1.5, -1, y1, 3, 'tower_mid');
  const y3 = volume(TW - 13, TD - 8, -3.5, -2, y2, 2, 'tower_top');
  box(TW - 12, 0.6, TD - 7, M.precast, 'tower_roof_plate', -3.5, y3 + 0.3, -2);
  box(8, 2.2, 6, M.steel, 'tower_roof_plant', -6, y3 + 1.4, -4);

  // ── podium wing ────────────────────────────────────────────────────
  const PY = volume(30, 20, TW / 2 + 15, 6, 0, 4, 'podium');
  box(30, 0.6, 20, M.precast, 'podium_roof_plate', TW / 2 + 15, PY + 0.3, 6);
  for (let k = 0; k < 7; k++) {
    box(2.6, 4.6, 0.4, M.glass, `podium_shopfront_${k + 1}`, TW / 2 + 15 - 12 + k * 4, 2.6, 6 + 10.5);
  }

  // ── blue swipe line: verticals with jogs, climbing the front facade ─
  const S = 0.36, ZF = TD / 2 + 1.35;
  const segs = [];
  let cx = -TW / 2 + 3.5, cy = 1.2;
  const runs = [6.0, 8.0, 7.0, 9.0, 6.0];
  const jogs = [5.0, -3.2, 6.4, -4.6, 5.2];
  runs.forEach((len, i) => {
    segs.push(box(S, len, S, blue, `swipe_run_${i + 1}`, cx, cy + len / 2, ZF));
    cy += len;
    const j = jogs[i];
    segs.push(box(Math.abs(j) + S, S, S, blue, `swipe_jog_${i + 1}`, cx + j / 2, cy, ZF));
    cx += j;
  });
  segs.push(box(S, 3.0, S, blue, 'swipe_run_top', cx, cy + 1.5, ZF));
  segs.push(box(3.0, S, S, blue, 'swipe_terminus', cx + 1.5, cy + 3.0, ZF));
  segs.forEach(m => { const c = blue.clone(); c.name = blue.name; m.material = c; });

  return { group: g, emblem: segs[0], segs, materials: M };
}
  
  const r = buildBuilding(THREE);
  return r.group || r;
};

/* ---- jnj ---- */
LM.jnj = function(THREE){


// Low-poly healthcare tower: chamfered white banded volume over a brick
// podium, with a red plus-motif crown light.
function buildBuilding(THREE_ = THREE) {
  const T = THREE_;
  const g = new T.Group();
  g.name = 'health_tower_A08';

  const M = {
    white: new T.MeshStandardMaterial({ name: 'white_panel', color: 0xeceae5, roughness: 0.68, metalness: 0.05, flatShading: true }),
    whiteShade: new T.MeshStandardMaterial({ name: 'white_panel_shade', color: 0xd8d5cf, roughness: 0.72, metalness: 0.05, flatShading: true }),
    glass: new T.MeshStandardMaterial({ name: 'ribbon_glass', color: 0x2c3740, roughness: 0.12, metalness: 0.3, flatShading: true }),
    brick: new T.MeshStandardMaterial({ name: 'podium_brick', color: 0x7a4a3c, roughness: 0.85, metalness: 0.04, flatShading: true }),
    steel: new T.MeshStandardMaterial({ name: 'trim_metal', color: 0x8d949a, roughness: 0.45, metalness: 0.4, flatShading: true })
  };
  const red = new T.MeshStandardMaterial({ name: 'accent_red', color: 0xd6362f, emissive: 0xc32a24, emissiveIntensity: 0.95, roughness: 0.35, flatShading: true });
  M.red = red;

  const add = (m, name) => { m.name = name; m.castShadow = true; m.receiveShadow = true; g.add(m); return m; };
  const oct = (r, h, mat, name, y, rot = Math.PI / 8) => {
    const m = new T.Mesh(new T.CylinderGeometry(r, r, h, 8, 1), mat);
    m.position.y = y; m.rotation.y = rot; return add(m, name);
  };
  const box = (w, h, d, mat, name, x, y, z, ry = 0) => {
    const m = new T.Mesh(new T.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z); m.rotation.y = ry; return add(m, name);
  };

  const FL = 3.7, FLOORS = 12, R = 17, PH = 8.2;

  // ── brick podium ───────────────────────────────────────────────────
  oct(R + 5, PH, M.brick, 'podium_volume', PH / 2);
  oct(R + 5.4, 0.7, M.whiteShade, 'podium_cornice', PH + 0.35);
  for (let k = 0; k < 8; k++) {
    const th = k * Math.PI / 4 + Math.PI / 8;
    box(6.0, 4.4, 0.5, M.glass, `podium_shopfront_${k + 1}`,
      Math.sin(th) * (R + 5.1), 2.8, Math.cos(th) * (R + 5.1), th);
  }
  // glazed entry porch
  box(9.0, 5.4, 4.0, M.glass, 'entry_porch_glass', 0, 2.7, R + 6.6);
  box(10.0, 0.5, 4.8, M.whiteShade, 'entry_porch_roof', 0, 5.6, R + 6.7);
  for (const sx of [-1, 1]) {
    const c = new T.Mesh(new T.CylinderGeometry(0.3, 0.3, 5.4, 8), M.steel);
    c.position.set(sx * 4.2, 2.7, R + 8.4); add(c, `entry_column_${sx > 0 ? 'b' : 'a'}`);
  }

  // ── banded tower ───────────────────────────────────────────────────
  const Y0 = PH + 0.7;
  for (let i = 0; i < FLOORS; i++) {
    const y = Y0 + i * FL;
    oct(R + 0.7, 1.5, M.white, `band_${i + 1}`, y + 0.75);
    oct(R, FL - 1.5, M.glass, `ribbon_glazing_${i + 1}`, y + 1.5 + (FL - 1.5) / 2);
  }
  const TOP = Y0 + FLOORS * FL;
  // vertical white fins at every chamfer, tying the bands together
  for (let k = 0; k < 8; k++) {
    const th = k * Math.PI / 4 + Math.PI / 8;
    box(2.2, TOP - Y0, 0.8, M.whiteShade, `corner_fin_${k + 1}`,
      Math.sin(th) * (R + 0.9), Y0 + (TOP - Y0) / 2, Math.cos(th) * (R + 0.9), th);
  }

  // window mullions dividing each glazing ribbon into panes
  for (let i = 0; i < FLOORS; i++) {
    const y = Y0 + i * FL + 1.5 + (FL - 1.5) / 2;
    for (let k = 0; k < 8; k++) {
      const th = k * Math.PI / 4;
      for (let b = 1; b < 4; b++) {
        const t = -0.5 + b / 4;
        const face = R * Math.cos(Math.PI / 8);
        const w = 2 * R * Math.sin(Math.PI / 8);
        box(0.16, FL - 1.7, 0.4, M.whiteShade, `pane_mullion_${i + 1}_${k + 1}_${b}`,
          Math.sin(th) * face + Math.cos(th) * t * w, y, Math.cos(th) * face - Math.sin(th) * t * w, th);
      }
    }
  }
  // podium brick pilasters between the shopfronts
  for (let k = 0; k < 8; k++) {
    const th = k * Math.PI / 4;
    box(1.4, PH, 0.5, M.brick, `podium_pilaster_${k + 1}`,
      Math.sin(th) * (R + 5.2), PH / 2, Math.cos(th) * (R + 5.2), th);
  }
  box(2 * (R + 5) * Math.sin(Math.PI / 8) - 2, 0.4, 0.5, M.whiteShade, 'podium_sign_band', 0, 6.6, R + 5.3);

  // ── crown with red plus motif ──────────────────────────────────────
  oct(R + 1.4, 2.2, M.white, 'crown_parapet', TOP + 1.1);
  oct(R - 1.5, 0.6, M.whiteShade, 'crown_roof_plate', TOP + 0.3);
  box(9, 2.2, 7, M.steel, 'roof_plant', -9, TOP + 1.7, -8);

  const crossBars = [];
  crossBars.push(box(18, 0.8, 2.4, red, 'crown_cross_bar_x', 0, TOP + 2.6, 0));
  crossBars.push(box(2.4, 0.8, 18, red, 'crown_cross_bar_z', 0, TOP + 2.6, 0));
  // small plus signs repeated on the parapet faces
  for (let k = 0; k < 4; k++) {
    const th = k * Math.PI / 2 + Math.PI / 8;
    const nx = Math.sin(th), nz = Math.cos(th);
    const rr = (R + 1.4) * Math.cos(Math.PI / 8) + 0.2;
    crossBars.push(box(3.2, 0.6, 0.5, red, `parapet_plus_h_${k + 1}`, nx * rr, TOP + 1.1, nz * rr, th));
    crossBars.push(box(0.6, 2.0, 0.5, red, `parapet_plus_v_${k + 1}`, nx * rr, TOP + 1.1, nz * rr, th));
  }

  return { group: g, emblem: crossBars[0], crossBars, materials: M };
}
  
  const r = buildBuilding(THREE);
  return r.group || r;
};

/* ---- ma ---- */
LM.ma = function(THREE){


// Low-poly twin circular towers, slightly overlapping in plan. Black metal
// and dark glass, with a red-orange gradient of floor trims and a warm
// orange glow filling the lens-shaped zone where the two drums overlap.
function buildBuilding(THREE_ = THREE) {
  const T = THREE_;
  const g = new T.Group();
  g.name = 'twin_circles_A09';

  const M = {
    black: new T.MeshStandardMaterial({ name: 'black_panel', color: 0x14161a, roughness: 0.62, metalness: 0.25, flatShading: true }),
    blackShade: new T.MeshStandardMaterial({ name: 'black_panel_shade', color: 0x0c0e11, roughness: 0.7, metalness: 0.2, flatShading: true }),
    glass: new T.MeshStandardMaterial({ name: 'dark_glass', color: 0x1d242b, roughness: 0.14, metalness: 0.35, flatShading: true }),
    steel: new T.MeshStandardMaterial({ name: 'trim_metal', color: 0x6f757b, roughness: 0.45, metalness: 0.45, flatShading: true }),
    plaza: new T.MeshStandardMaterial({ name: 'plaza_stone', color: 0x2a2c30, roughness: 0.9, metalness: 0.03, flatShading: true })
  };
  // red-orange gradient, deep red at the base rising to hot orange
  const grad = [0xa3111b, 0xc12318, 0xdc3a17, 0xef5a1c, 0xf87a22, 0xffa03a].map((c, i) =>
    new T.MeshStandardMaterial({
      name: `accent_grad_${i + 1}`, color: c, emissive: c,
      emissiveIntensity: 0.5 + i * 0.09, roughness: 0.34, flatShading: true
    }));
  M.grad = grad;
  const glow = new T.MeshStandardMaterial({
    name: 'overlap_glow', color: 0xff7a2a, emissive: 0xff6a1e,
    emissiveIntensity: 1.35, roughness: 0.3, flatShading: true
  });
  M.glow = glow;

  const add = (m, name) => { m.name = name; m.castShadow = true; m.receiveShadow = true; g.add(m); return m; };
  const cyl = (r, h, mat, name, x, y, seg = 16) => {
    const m = new T.Mesh(new T.CylinderGeometry(r, r, h, seg, 1), mat);
    m.position.set(x, y, 0); m.rotation.y = Math.PI / seg; return add(m, name);
  };
  const box = (w, h, d, mat, name, x, y, z, ry = 0) => {
    const m = new T.Mesh(new T.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z); m.rotation.y = ry; return add(m, name);
  };

  const R = 22, FL = 4.2, FLOORS = 6, OV = 9;      // low-rise, ~25 m tall
  const CX = R - OV / 2;                            // drum centre offset
  const SEG = 16, TOP = 1.2 + FLOORS * FL;

  // ── plaza plinth under both drums ──────────────────────────────────
  for (const s of [-1, 1]) {
    cyl(R + 3.2, 1.2, M.plaza, `plaza_apron_${s > 0 ? 'b' : 'a'}`, s * CX, 0.6, SEG);
    cyl(R + 0.9, 1.2, M.blackShade, `drum_base_${s > 0 ? 'b' : 'a'}`, s * CX, 0.62, SEG);
  }

  // ── two circular drums, floor by floor ────────────────────────────
  for (const s of [-1, 1]) {
    const tag = s > 0 ? 'b' : 'a';
    for (let i = 0; i < FLOORS; i++) {
      const y = 1.2 + i * FL;
      cyl(R, 1.35, M.black, `spandrel_${tag}_${i + 1}`, s * CX, y + 0.675, SEG);
      cyl(R + 0.35, 0.34, M.grad[i], `floor_trim_${tag}_${i + 1}`, s * CX, y + 1.4, SEG);
      cyl(R - 0.5, FL - 1.35, M.glass, `glazing_${tag}_${i + 1}`, s * CX, y + 1.35 + (FL - 1.35) / 2, SEG);
    }
    // vertical black mullion fins around each drum
    for (let k = 0; k < SEG; k++) {
      const th = k * 2 * Math.PI / SEG;
      box(0.5, TOP - 1.2, 0.7, M.blackShade, `fin_${tag}_${k + 1}`,
        s * CX + Math.sin(th) * (R + 0.2), 1.2 + (TOP - 1.2) / 2, Math.cos(th) * (R + 0.2), th);
    }
    // roof cap + hot orange rim
    cyl(R + 0.9, 1.1, M.black, `parapet_${tag}`, s * CX, TOP + 0.55, SEG);
    cyl(R + 1.25, 0.3, M.grad[5], `parapet_rim_${tag}`, s * CX, TOP + 1.0, SEG);
    cyl(R - 2.2, 0.5, M.blackShade, `roof_plate_${tag}`, s * CX, TOP + 0.25, SEG);
    box(7, 2.0, 5.5, M.steel, `roof_plant_${tag}`, s * CX - s * 6, TOP + 1.5, -7);
  }

  // ── the overlap lens, glowing warm orange ─────────────────────────
  // lens boundary: |x| < OV/2, half-width z = sqrt(R^2 - (CX + |x|)^2)
  const glowParts = [];
  const SLABS = 7, step = OV / SLABS;
  for (let j = 0; j < SLABS; j++) {
    const xc = -OV / 2 + step * (j + 0.5);
    const hw = Math.sqrt(Math.max(0, R * R - Math.pow(CX + Math.abs(xc) + step / 2, 2)));
    if (hw < 0.4) continue;
    glowParts.push(box(step + 0.02, TOP - 1.2, hw * 2, glow,
      `overlap_glow_slab_${j + 1}`, xc, 1.2 + (TOP - 1.2) / 2, 0));
  }
  // glowing core column and cap marking the intersection axis
  glowParts.push(cyl(3.0, TOP + 2.6, glow, 'overlap_core_column', 0, (TOP + 2.6) / 2, 8));
  glowParts.push(cyl(5.2, 0.5, glow, 'overlap_core_cap', 0, TOP + 2.9, 8));

  // link bridges tucked into the overlap at two levels
  for (const i of [2, 4]) {
    box(OV + 2, 0.4, 15, M.blackShade, `overlap_deck_${i}`, 0, 1.2 + i * FL - 0.2, 0);
  }

  return { group: g, emblem: glowParts[0], glowParts, materials: M };
}
  
  const r = buildBuilding(THREE);
  return r.group || r;
};

/* ---- csco ---- */
LM.csco = function(THREE){


// Low-poly network tower: white precast shaft with blue ribbon glazing,
// topped by a suspension-bridge crown, two pylons, catenary main cables and
// vertical hangers, all traced in illuminated blue lines over a modular
// lattice deck.
function buildBuilding(THREE_ = THREE) {
  const T = THREE_;
  const g = new T.Group();
  g.name = 'network_tower_A10';

  const M = {
    white: new T.MeshStandardMaterial({ name: 'white_precast', color: 0xeef0ef, roughness: 0.66, metalness: 0.05, flatShading: true }),
    whiteShade: new T.MeshStandardMaterial({ name: 'white_precast_shade', color: 0xd6d9da, roughness: 0.72, metalness: 0.05, flatShading: true }),
    glass: new T.MeshStandardMaterial({ name: 'blue_glass', color: 0x1b3f5c, roughness: 0.13, metalness: 0.34, flatShading: true }),
    steel: new T.MeshStandardMaterial({ name: 'crown_steel', color: 0x8f979d, roughness: 0.42, metalness: 0.5, flatShading: true }),
    plaza: new T.MeshStandardMaterial({ name: 'plaza_stone', color: 0x9a9c98, roughness: 0.9, metalness: 0.03, flatShading: true })
  };
  const cable = new T.MeshStandardMaterial({
    name: 'cable_light', color: 0x2ea8e6, emissive: 0x1e9ada,
    emissiveIntensity: 1.15, roughness: 0.3, flatShading: true
  });
  M.cable = cable;

  const add = (m, name) => { m.name = name; m.castShadow = true; m.receiveShadow = true; g.add(m); return m; };
  const box = (w, h, d, mat, name, x, y, z, ry = 0) => {
    const m = new T.Mesh(new T.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z); m.rotation.y = ry; return add(m, name);
  };
  // thin cylinder spanning two points, used for every cable and lattice line
  const line = (a, b, r, mat, name) => {
    const dir = new T.Vector3().subVectors(b, a);
    const m = new T.Mesh(new T.CylinderGeometry(r, r, dir.length(), 6, 1), mat);
    m.position.copy(a).add(b).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), dir.clone().normalize());
    return add(m, name);
  };
  const V = (x, y, z) => new T.Vector3(x, y, z);

  const W = 30, D = 22, FL = 3.9, FLOORS = 16, PH = 7.0;

  // ── podium ─────────────────────────────────────────────────────────
  box(W + 16, 0.6, D + 16, M.plaza, 'plaza_slab', 0, 0.3, 0);
  box(W + 12, PH, D + 10, M.whiteShade, 'podium_volume', 0, PH / 2 + 0.6, 0);
  box(W + 12.6, 0.7, D + 10.6, M.white, 'podium_cornice', 0, PH + 0.95, 0);
  for (let k = -2; k <= 2; k++) {
    box(6.4, 4.6, 0.5, M.glass, `podium_shopfront_${k + 3}`, k * 8.4, 3.2, (D + 10) / 2 + 0.3);
    box(6.4, 4.6, 0.5, M.glass, `podium_shopfront_r${k + 3}`, k * 8.4, 3.2, -(D + 10) / 2 - 0.3);
  }
  box(12, 5.6, 4.2, M.glass, 'entry_glazing', 0, 3.4, (D + 10) / 2 + 2.4);
  box(13.4, 0.6, 5.0, M.white, 'entry_canopy', 0, 6.5, (D + 10) / 2 + 2.6);

  // ── shaft: white spandrel bands + blue ribbon glazing ─────────────
  const Y0 = PH + 1.3;
  for (let i = 0; i < FLOORS; i++) {
    const y = Y0 + i * FL;
    box(W, 1.4, D, M.white, `spandrel_${i + 1}`, 0, y + 0.7, 0);
    box(W - 1.2, FL - 1.4, D - 1.2, M.glass, `glazing_${i + 1}`, 0, y + 1.4 + (FL - 1.4) / 2, 0);
  }
  const TOP = Y0 + FLOORS * FL;
  // vertical precast fins on all four corners + facade rhythm
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      box(2.4, TOP - Y0, 2.4, M.whiteShade, `corner_fin_${sx > 0 ? 'e' : 'w'}${sz > 0 ? 's' : 'n'}`,
        sx * (W / 2 - 0.6), Y0 + (TOP - Y0) / 2, sz * (D / 2 - 0.6));
    }
    for (let k = -1; k <= 1; k++) {
      box(0.7, TOP - Y0, 0.6, M.whiteShade, `facade_fin_${sx > 0 ? 'e' : 'w'}${k + 2}`,
        k * 9.5, Y0 + (TOP - Y0) / 2, sx * (D / 2 + 0.25));
    }
  }
  box(W + 1.6, 1.6, D + 1.6, M.white, 'shaft_capital', 0, TOP + 0.8, 0);

  // ── suspension-bridge crown ───────────────────────────────────────
  const RY = TOP + 1.6;                 // crown deck level
  const PYH = 20, PX = 11.5;            // pylon height / spacing along x
  const cables = [];

  box(W - 2, 0.6, D - 2, M.steel, 'crown_deck', 0, RY + 0.3, 0);
  // modular grid lattice on the deck, repeated blocks, Cisco campus rhythm
  for (let ix = -3; ix <= 3; ix++) {
    cables.push(line(V(ix * 4.2, RY + 0.7, -8.5), V(ix * 4.2, RY + 0.7, 8.5), 0.1, cable, `lattice_x_${ix + 4}`));
  }
  for (let iz = -2; iz <= 2; iz++) {
    cables.push(line(V(-13, RY + 0.7, iz * 4.2), V(13, RY + 0.7, iz * 4.2), 0.1, cable, `lattice_z_${iz + 3}`));
  }

  for (const sx of [-1, 1]) {
    const tag = sx > 0 ? 'b' : 'a';
    for (const sz of [-1, 1]) {
      box(1.8, PYH, 1.8, M.steel, `pylon_leg_${tag}${sz > 0 ? 's' : 'n'}`,
        sx * PX, RY + PYH / 2, sz * 7.0);
    }
    // pylon cross-braces, ladder-like
    for (let k = 1; k <= 4; k++) {
      box(1.4, 1.0, 15.2, M.steel, `pylon_brace_${tag}_${k}`, sx * PX, RY + k * PYH / 5, 0);
    }
    box(4.6, 1.2, 17.6, M.whiteShade, `pylon_cap_${tag}`, sx * PX, RY + PYH + 0.6, 0);
  }

  // main catenary cables, sagging between the two pylon tops
  const TY = RY + PYH, SAG = 11;
  const STEPS = 8;
  const cat = t => {                     // t in [-1, 1] across the span
    const x = t * PX * 1.05;
    const y = TY - SAG * (1 - t * t);
    return { x, y };
  };
  for (const sz of [-1, 1]) {
    for (let s = 0; s < STEPS; s++) {
      const a = cat(-1 + 2 * s / STEPS), b = cat(-1 + 2 * (s + 1) / STEPS);
      cables.push(line(V(a.x, a.y, sz * 7.0), V(b.x, b.y, sz * 7.0), 0.24, cable,
        `main_cable_${sz > 0 ? 's' : 'n'}_${s + 1}`));
    }
    // back-stays running from pylon tops down to the deck ends
    for (const sx of [-1, 1]) {
      cables.push(line(V(sx * PX, TY, sz * 7.0), V(sx * (W / 2 - 1), RY + 0.6, sz * 7.0), 0.24, cable,
        `back_stay_${sx > 0 ? 'b' : 'a'}${sz > 0 ? 's' : 'n'}`));
    }
  }
  // vertical hangers from the catenary down to the deck
  for (const sz of [-1, 1]) {
    for (let h = 1; h < STEPS; h++) {
      const p = cat(-1 + 2 * h / STEPS);
      cables.push(line(V(p.x, p.y, sz * 7.0), V(p.x, RY + 0.6, sz * 7.0), 0.12, cable,
        `hanger_${sz > 0 ? 's' : 'n'}_${h}`));
    }
  }
  // cross ties between the two cable planes at each pylon top
  cables.push(line(V(-PX, TY, -7), V(-PX, TY, 7), 0.16, cable, 'cable_tie_a'));
  cables.push(line(V(PX, TY, -7), V(PX, TY, 7), 0.16, cable, 'cable_tie_b'));
  // mid-span beacon at the low point of the sag
  const beacon = box(3.0, 0.7, 15.2, cable, 'midspan_beacon', 0, TY - SAG, 0);
  cables.push(beacon);

  return { group: g, emblem: beacon, cables, materials: M };
}
  
  const r = buildBuilding(THREE);
  return r.group || r;
};

/* ---- orcl ---- */
LM.orcl = function(THREE){


// Low-poly cylindrical glass drum tower: white slab
// edges between full-height glazing rings, with a glowing red ring band
// circling the mid-section.
function buildBuilding(THREE_ = THREE) {
  const T = THREE_;
  const g = new T.Group();
  g.name = 'drum_tower_A11';

  const M = {
    white: new T.MeshStandardMaterial({ name: 'white_slab', color: 0xf1f1ef, roughness: 0.64, metalness: 0.05, flatShading: true }),
    whiteShade: new T.MeshStandardMaterial({ name: 'white_slab_shade', color: 0xdadbd8, roughness: 0.7, metalness: 0.05, flatShading: true }),
    glass: new T.MeshStandardMaterial({ name: 'drum_glass', color: 0x2a4450, roughness: 0.1, metalness: 0.4, flatShading: true }),
    steel: new T.MeshStandardMaterial({ name: 'trim_metal', color: 0x8d949a, roughness: 0.44, metalness: 0.45, flatShading: true }),
    steelDark: new T.MeshStandardMaterial({ name: 'trim_metal_dark', color: 0x6d747a, roughness: 0.5, metalness: 0.4, flatShading: true })
  };
  const red = new T.MeshStandardMaterial({
    name: 'accent_red', color: 0xe4342a, emissive: 0xd21f16,
    emissiveIntensity: 1.1, roughness: 0.32, flatShading: true
  });
  M.red = red;

  const add = (m, name) => { m.name = name; m.castShadow = true; m.receiveShadow = true; g.add(m); return m; };
  const SEG = 20;
  const cyl = (r, h, mat, name, y, seg = SEG) => {
    const m = new T.Mesh(new T.CylinderGeometry(r, r, h, seg, 1), mat);
    m.position.y = y; m.rotation.y = Math.PI / seg; return add(m, name);
  };
  const box = (w, h, d, mat, name, x, y, z, ry = 0) => {
    const m = new T.Mesh(new T.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z); m.rotation.y = ry; return add(m, name);
  };

  const R = 19, FL = 3.9, FLOORS = 18, RING_FLOOR = 9;

  // ── podium ────────────────────────────────────────────────────────
  cyl(R + 9.5, 1.6, M.whiteShade, 'podium_terrace', 0.8, SEG);
  cyl(R + 4.5, 5.4, M.white, 'podium_volume', 2.7 + 1.6);
  cyl(R + 4.5 - 0.4, 4.0, M.glass, 'podium_glazing', 2.6 + 1.6);
  cyl(R + 5.1, 0.7, M.whiteShade, 'podium_cornice', 8.05);
  box(11, 5.2, 4.2, M.glass, 'entry_glazing', 0, 4.2, R + 5.4);
  box(12.4, 0.6, 5.2, M.white, 'entry_canopy', 0, 7.1, R + 5.6);

  // ── glazed drum shaft ─────────────────────────────────────────────
  const Y0 = 8.4;
  let ringY = 0;
  for (let i = 0; i < FLOORS; i++) {
    const y = Y0 + i * FL;
    cyl(R + 0.5, 1.0, M.white, `slab_edge_${i + 1}`, y + 0.5);
    cyl(R, FL - 1.0, M.glass, `glazing_${i + 1}`, y + 1.0 + (FL - 1.0) / 2);
    if (i + 1 === RING_FLOOR) ringY = y + FL;
  }
  const TOP = Y0 + FLOORS * FL;
  // slim white mullion fins running the full height
  for (let k = 0; k < SEG; k++) {
    const th = k * 2 * Math.PI / SEG;
    box(0.42, TOP - Y0, 0.55, M.whiteShade, `mullion_fin_${k + 1}`,
      Math.sin(th) * (R + 0.25), Y0 + (TOP - Y0) / 2, Math.cos(th) * (R + 0.25), th);
  }

  // ── glowing red ring band at mid-height ───────────────────────────
  const ringParts = [];
  ringParts.push(cyl(R + 1.15, 2.0, red, 'mid_ring_band', ringY));
  ringParts.push(cyl(R + 1.7, 0.32, red, 'mid_ring_lip_top', ringY + 1.15));
  ringParts.push(cyl(R + 1.7, 0.32, red, 'mid_ring_lip_bottom', ringY - 1.15));
  // short red tick fins reading as a segmented band
  for (let k = 0; k < SEG; k++) {
    const th = k * 2 * Math.PI / SEG + Math.PI / SEG;
    ringParts.push(box(0.9, 2.4, 0.7, red, `mid_ring_tick_${k + 1}`,
      Math.sin(th) * (R + 1.5), ringY, Math.cos(th) * (R + 1.5), th));
  }

  // ── crown ─────────────────────────────────────────────────────────
  cyl(R + 1.4, 1.8, M.white, 'crown_parapet', TOP + 0.9);
  cyl(R - 2.0, 0.6, M.whiteShade, 'roof_plate', TOP + 0.3);
  cyl(R + 1.9, 0.3, red, 'crown_rim', TOP + 1.6);
  box(9, 2.2, 6.5, M.steel, 'roof_plant', -7, TOP + 1.7, -6);
  const mast = new T.Mesh(new T.CylinderGeometry(0.35, 0.35, 9, 6), M.steel);
  mast.position.y = TOP + 6.3; add(mast, 'roof_mast');

  return { group: g, emblem: ringParts[0], ringParts, materials: M };
}
  
  const r = buildBuilding(THREE);
  return r.group || r;
};

/* ---- cvx ---- */
LM.cvx = function(THREE){


// Low-poly industrial tower: uniform low-rise campus wings at the base, a
// pale precast shaft with refinery hardware, and a chevron-striped crown.
// Glowing blue/red chevrons climb the facade.
function buildBuilding(THREE_ = THREE) {
  const T = THREE_;
  const g = new T.Group();
  g.name = 'industrial_tower_A12';

  const M = {
    pale: new T.MeshStandardMaterial({ name: 'pale_precast', color: 0xe8e6df, roughness: 0.7, metalness: 0.05, flatShading: true }),
    paleShade: new T.MeshStandardMaterial({ name: 'pale_precast_shade', color: 0xcfccc4, roughness: 0.75, metalness: 0.05, flatShading: true }),
    glass: new T.MeshStandardMaterial({ name: 'tinted_glass', color: 0x27353f, roughness: 0.14, metalness: 0.34, flatShading: true }),
    steel: new T.MeshStandardMaterial({ name: 'plant_steel', color: 0x8b9298, roughness: 0.45, metalness: 0.45, flatShading: true }),
    steelDark: new T.MeshStandardMaterial({ name: 'plant_steel_dark', color: 0x5d646a, roughness: 0.55, metalness: 0.4, flatShading: true }),
    plaza: new T.MeshStandardMaterial({ name: 'plaza_stone', color: 0xa9a8a1, roughness: 0.9, metalness: 0.03, flatShading: true })
  };
  const blue = new T.MeshStandardMaterial({ name: 'accent_blue', color: 0x1d6fc4, emissive: 0x1560b8, emissiveIntensity: 1.05, roughness: 0.33, flatShading: true });
  const red = new T.MeshStandardMaterial({ name: 'accent_red', color: 0xd8342c, emissive: 0xc42219, emissiveIntensity: 1.05, roughness: 0.33, flatShading: true });
  M.blue = blue; M.red = red;

  const add = (m, name) => { m.name = name; m.castShadow = true; m.receiveShadow = true; g.add(m); return m; };
  const box = (w, h, d, mat, name, x, y, z, ry = 0, rz = 0) => {
    const m = new T.Mesh(new T.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z); m.rotation.y = ry; m.rotation.z = rz; return add(m, name);
  };
  const tube = (r, h, mat, name, x, y, z, seg = 8) => {
    const m = new T.Mesh(new T.CylinderGeometry(r, r, h, seg, 1), mat);
    m.position.set(x, y, z); return add(m, name);
  };

  const W = 26, D = 20, FL = 4.0, FLOORS = 14, PH = 8.0;

  // ── low-rise campus wings ─────────────────────────────────────────
  box(96, 0.6, 62, M.plaza, 'plaza_slab', 0, 0.3, 0);
  for (const sx of [-1, 1]) {
    const tag = sx > 0 ? 'e' : 'w';
    box(26, PH, 44, M.pale, `wing_volume_${tag}`, sx * 30, PH / 2 + 0.6, 0);
    box(26.8, 0.8, 44.8, M.paleShade, `wing_cornice_${tag}`, sx * 30, PH + 1.0, 0);
    for (let f = 0; f < 2; f++) {
      box(26.4, 2.2, 44.4, M.glass, `wing_glazing_${tag}_${f + 1}`, sx * 30, 2.6 + f * 3.4, 0);
    }
    for (let k = -2; k <= 2; k++) {
      box(1.2, PH, 0.6, M.paleShade, `wing_pier_${tag}_${k + 3}`, sx * 30 + k * 5.6, PH / 2 + 0.6, 22.3);
    }
    // roof plant on the wings, refinery hardware, kept blocky
    box(9, 2.0, 6, M.steel, `wing_plant_${tag}`, sx * 30, PH + 2.4, -12);
    for (let k = 0; k < 3; k++) {
      tube(1.5, 6.5, M.steelDark, `wing_vessel_${tag}_${k + 1}`, sx * 30 - 7 + k * 7, PH + 4.6, 12);
    }
  }
  // linking pipe-rack bridges from wings to the shaft
  for (const sx of [-1, 1]) {
    box(18, 1.2, 4.0, M.steel, `pipe_rack_${sx > 0 ? 'e' : 'w'}`, sx * 21, PH - 1.4, 0);
    for (let k = 0; k < 4; k++) {
      tube(0.4, 18, M.steelDark, `pipe_run_${sx > 0 ? 'e' : 'w'}_${k + 1}`, sx * 21, PH - 0.4, -1.4 + k * 0.95)
        .rotation.z = Math.PI / 2;
    }
  }

  // ── podium + shaft ────────────────────────────────────────────────
  box(W + 10, PH, D + 8, M.paleShade, 'podium_volume', 0, PH / 2 + 0.6, 0);
  box(W + 10.8, 0.8, D + 8.8, M.pale, 'podium_cornice', 0, PH + 1.0, 0);
  box(12, 5.6, 4.4, M.glass, 'entry_glazing', 0, 3.6, (D + 8) / 2 + 2.4);
  box(13.6, 0.6, 5.2, M.pale, 'entry_canopy', 0, 6.7, (D + 8) / 2 + 2.6);

  const Y0 = PH + 1.4;
  for (let i = 0; i < FLOORS; i++) {
    const y = Y0 + i * FL;
    box(W, 1.6, D, M.pale, `spandrel_${i + 1}`, 0, y + 0.8, 0);
    box(W - 1.4, FL - 1.6, D - 1.4, M.glass, `glazing_${i + 1}`, 0, y + 1.6 + (FL - 1.6) / 2, 0);
  }
  const TOP = Y0 + FLOORS * FL;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    box(2.6, TOP - Y0, 2.6, M.paleShade, `corner_pier_${sx > 0 ? 'e' : 'w'}${sz > 0 ? 's' : 'n'}`,
      sx * (W / 2 - 0.7), Y0 + (TOP - Y0) / 2, sz * (D / 2 - 0.7));
  }
  // exterior stair/vent tower against the north face, refinery flavour
  box(6.0, TOP - Y0 + 4, 5.0, M.steel, 'service_tower', 0, Y0 + (TOP - Y0 + 4) / 2, -(D / 2 + 2.4));
  for (let k = 0; k < 7; k++) {
    box(6.4, 0.4, 5.4, M.steelDark, `service_landing_${k + 1}`, 0, Y0 + 3 + k * 7.6, -(D / 2 + 2.4));
  }

  // ── glowing chevrons climbing the facade ──────────────────────────
  const chevrons = [];
  const ANG = 0.6, LEN = 11.0, THK = 1.1;
  const faces = [
    { z: D / 2 + 0.5, ry: 0, tag: 's' },
    { z: -(D / 2 + 0.5), ry: Math.PI, tag: 'n' }
  ];
  for (const f of faces) {
    for (let i = 0; i < 7; i++) {
      const y = Y0 + 4.5 + i * FL * 2;
      const mat = i % 2 === 0 ? blue : red;
      for (const sx of [-1, 1]) {
        chevrons.push(box(LEN, THK, 0.7, mat,
          `chevron_${f.tag}_${i + 1}_${sx > 0 ? 'b' : 'a'}`,
          sx * LEN * Math.cos(ANG) / 2, y, f.z, f.ry, sx * ANG));
      }
    }
  }

  // ── chevron-striped crown ─────────────────────────────────────────
  box(W + 3.0, 1.4, D + 3.0, M.pale, 'crown_shelf', 0, TOP + 0.7, 0);
  const CH = 12;
  box(W - 2, CH, D - 2, M.paleShade, 'crown_core', 0, TOP + 1.4 + CH / 2, 0);
  for (const f of faces) {
    for (let i = 0; i < 4; i++) {
      const y = TOP + 3.0 + i * 2.9;
      const mat = i % 2 === 0 ? red : blue;
      for (const sx of [-1, 1]) {
        chevrons.push(box(9.2, 1.2, 0.7, mat,
          `crown_chevron_${f.tag}_${i + 1}_${sx > 0 ? 'b' : 'a'}`,
          sx * 9.2 * Math.cos(ANG) / 2, y, f.z - Math.sign(f.z) * 1.6, f.ry, sx * ANG));
      }
    }
  }
  box(W + 1.0, 1.6, D + 1.0, M.pale, 'crown_parapet', 0, TOP + 1.4 + CH + 0.8, 0);
  box(10, 2.2, 7, M.steel, 'roof_plant', -6, TOP + CH + 3.3, -5);
  tube(0.8, 14, M.steelDark, 'flare_stack', 9, TOP + CH + 9, 4);
  const flare = tube(1.1, 1.6, red, 'flare_tip', 9, TOP + CH + 16.6, 4);
  chevrons.push(flare);

  return { group: g, emblem: chevrons[0], chevrons, materials: M };
}
  
  const r = buildBuilding(THREE);
  return r.group || r;
};

/* ---- ko ---- */
LM.ko = function(THREE){


// Low-poly tower with an abstracted curved silhouette, a stack of faceted
// drums whose radius swells, pinches at a waist, then tapers to the crown —
// wrapped by a glowing red ribbon that spirals diagonally up the facade.
function buildBuilding(THREE_ = THREE) {
  const T = THREE_;
  const g = new T.Group();
  g.name = 'curve_tower_A13';

  const M = {
    white: new T.MeshStandardMaterial({ name: 'white_panel', color: 0xf2f1ee, roughness: 0.66, metalness: 0.05, flatShading: true }),
    whiteShade: new T.MeshStandardMaterial({ name: 'white_panel_shade', color: 0xdbd9d5, roughness: 0.72, metalness: 0.05, flatShading: true }),
    glass: new T.MeshStandardMaterial({ name: 'tinted_glass', color: 0x28353d, roughness: 0.13, metalness: 0.34, flatShading: true }),
    steel: new T.MeshStandardMaterial({ name: 'trim_metal', color: 0x8d949a, roughness: 0.44, metalness: 0.45, flatShading: true }),
    plaza: new T.MeshStandardMaterial({ name: 'plaza_stone', color: 0xa8a7a2, roughness: 0.9, metalness: 0.03, flatShading: true })
  };
  const red = new T.MeshStandardMaterial({
    name: 'accent_red', color: 0xe0201f, emissive: 0xcf1213,
    emissiveIntensity: 1.1, roughness: 0.32, flatShading: true
  });
  M.red = red;

  const add = (m, name) => { m.name = name; m.castShadow = true; m.receiveShadow = true; g.add(m); return m; };
  const SEG = 16;
  const cyl = (r, h, mat, name, y, seg = SEG, rTop = r) => {
    const m = new T.Mesh(new T.CylinderGeometry(rTop, r, h, seg, 1), mat);
    m.position.y = y; m.rotation.y = Math.PI / seg; return add(m, name);
  };
  const box = (w, h, d, mat, name, x, y, z, ry = 0) => {
    const m = new T.Mesh(new T.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z); m.rotation.y = ry; return add(m, name);
  };
  const V = (x, y, z) => new T.Vector3(x, y, z);
  const link = (a, b, w, h, mat, name) => {          // flat bar spanning a→b
    const dir = new T.Vector3().subVectors(b, a);
    const m = new T.Mesh(new T.BoxGeometry(w, dir.length(), h), mat);
    m.position.copy(a).add(b).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(V(0, 1, 0), dir.clone().normalize());
    return add(m, name);
  };

  const FL = 3.8, FLOORS = 20, PH = 7.4;
  const H = FLOORS * FL;

  // curved profile: wide shoulders, pinched waist, gentle taper up top
  const keys = [[0, 18.5], [0.16, 17.2], [0.42, 13.4], [0.62, 14.6], [0.82, 15.2], [1, 12.8]];
  const radius = t => {
    for (let k = 0; k < keys.length - 1; k++) {
      const [t0, r0] = keys[k], [t1, r1] = keys[k + 1];
      if (t <= t1) {
        const u = (t - t0) / (t1 - t0);
        return r0 + (r1 - r0) * (0.5 - 0.5 * Math.cos(Math.PI * u));   // smooth blend
      }
    }
    return keys[keys.length - 1][1];
  };

  // ── podium ─────────────────────────────────────────────────────────
  cyl(24.5, PH, M.whiteShade, 'podium_volume', PH / 2 + 0.6);
  cyl(24.1, 4.6, M.glass, 'podium_glazing', 3.1 + 0.6);
  cyl(25.2, 0.8, M.white, 'podium_cornice', PH + 1.0);
  for (let k = 0; k < SEG; k++) {
    const th = k * 2 * Math.PI / SEG;
    box(1.3, PH, 0.6, M.whiteShade, `podium_pier_${k + 1}`,
      Math.sin(th) * 24.4, PH / 2 + 0.6, Math.cos(th) * 24.4, th);
  }
  box(12, 5.6, 4.4, M.glass, 'entry_glazing', 0, 3.6, 25.6);
  box(13.6, 0.6, 5.2, M.white, 'entry_canopy', 0, 6.8, 25.8);

  // ── curved shaft ──────────────────────────────────────────────────
  const Y0 = PH + 1.4;
  for (let i = 0; i < FLOORS; i++) {
    const y = Y0 + i * FL;
    const rb = radius(i / FLOORS), rt = radius((i + 1) / FLOORS);
    const rm = (rb + rt) / 2;
    cyl(rb + 0.45, 1.25, M.white, `slab_edge_${i + 1}`, y + 0.625, SEG, rm + 0.45);
    cyl(rm, FL - 1.25, M.glass, `glazing_${i + 1}`, y + 1.25 + (FL - 1.25) / 2, SEG, rt);
  }
  const TOP = Y0 + H;
  // short mullion fins per floor, following the curve
  for (let i = 0; i < FLOORS; i++) {
    const y = Y0 + i * FL + FL / 2;
    const r = radius((i + 0.5) / FLOORS) + 0.2;
    for (let k = 0; k < SEG; k += 2) {
      const th = k * 2 * Math.PI / SEG;
      box(0.38, FL - 1.3, 0.5, M.whiteShade, `mullion_fin_${i + 1}_${k / 2 + 1}`,
        Math.sin(th) * r, y, Math.cos(th) * r, th);
    }
  }

  // ── glowing red ribbon spiralling up the facade ───────────────────
  const ribbon = [];
  const STEPS = 58, TURNS = 1.85;
  const pt = s => {
    const t = s / STEPS;
    const th = t * TURNS * 2 * Math.PI - 0.6;
    const r = radius(t) + 1.15;
    return V(Math.sin(th) * r, Y0 + 1.5 + t * (H - 3), Math.cos(th) * r);
  };
  for (let s = 0; s < STEPS; s++) {
    ribbon.push(link(pt(s), pt(s + 1), 2.6, 0.9, red, `ribbon_segment_${s + 1}`));
  }

  // ── crown ─────────────────────────────────────────────────────────
  const rTop = radius(1);
  cyl(rTop + 1.2, 1.7, M.white, 'crown_parapet', TOP + 0.85);
  cyl(rTop - 1.8, 0.6, M.whiteShade, 'roof_plate', TOP + 0.3);
  cyl(rTop + 1.7, 0.3, red, 'crown_rim', TOP + 1.55);
  box(8.5, 2.2, 6, M.steel, 'roof_plant', -6, TOP + 1.8, -5);
  const mast = new T.Mesh(new T.CylinderGeometry(0.32, 0.32, 8.5, 6), M.steel);
  mast.position.y = TOP + 5.9; add(mast, 'roof_mast');

  return { group: g, emblem: ribbon[0], ribbon, materials: M };
}
  
  const r = buildBuilding(THREE);
  return r.group || r;
};

/* ---- tsla ---- */
LM.tsla = function(THREE){




/* Palette: matte black + graphite dominant, red accent, electric white glow */
const mat = (name, color, o = {}) => {
  const m = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color), roughness: 0.85, metalness: 0, flatShading: true, ...o
  });
  m.name = name; return m;
};
const M = {
  black:   mat('matte_black',  0x191a1d, { roughness: 0.88 }),
  graphite:mat('graphite',     0x2c2f34, { roughness: 0.78 }),
  red:     mat('accent_red',   0xd22a2a, { roughness: 0.6 }),
  white:   mat('trim_white',   0xeef1f4, { roughness: 0.68 }),
  glass:   mat('glass_dark',   0x415260, { roughness: 0.24, metalness: 0.32 }),
  glow:    mat('electric_glow', 0xffffff, {
    roughness: 0.35, emissive: new THREE.Color(0xdff2ff), emissiveIntensity: 2.0 }),
};

const g = new THREE.Group();
g.name = 'ev_tower_stage3';
const add = (mesh, name, x, y, z, rot) => {
  mesh.name = name; mesh.position.set(x, y, z);
  if (rot) mesh.rotation.set(rot[0] || 0, rot[1] || 0, rot[2] || 0);
  g.add(mesh); return mesh;
};
const box = (name, w, h, d, x, y, z, m, rot) =>
  add(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m), name, x, y, z, rot);
const cyl = (name, rt, rb, h, seg, x, y, z, m, rot) =>
  add(new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m), name, x, y, z, rot);

/* Fixed grid plot 12 x 12 m, footprint identical across all 5 stages; growth is height only */
const LIM = 5.95;
const MW = 11.4, MD = 6.6, MH = 2.0;      // main flat production hall
const WD = 3.4, WH = 1.5;                  // lower wing to the south
const CW = 3.2, CH = 2.7;                  // taller central bay

box('ground_pad', 11.9, 0.16, 11.9, 0, 0.08, 0, M.graphite);

/* ---- Main hall: long, low, matte-dark facade under a pale roof ---- */
box('hall_mass', MW, MH - 0.16, MD, 0, 0.16 + (MH - 0.16) / 2, 0.9, M.black);
box('hall_datum', MW + 0.06, 0.14, MD + 0.06, 0, 0.42, 0.9, M.red);
box('hall_roof', MW - 0.12, 0.16, MD - 0.12, 0, MH + 0.02, 0.9, M.white);
box('hall_fascia', MW + 0.12, 0.2, MD + 0.12, 0, MH - 0.02, 0.9, M.white);
box('hall_fascia_red', MW + 0.14, 0.09, MD + 0.14, 0, MH - 0.16, 0.9, M.red);

/* ---- Taller central bay + lower south wing: stepped silhouette ---- */
box('central_bay', CW, CH - 0.16, MD - 1.4, -1.4, 0.16 + (CH - 0.16) / 2, 0.9, M.black);
box('central_bay_roof', CW + 0.14, 0.16, MD - 1.26, -1.4, CH + 0.02, 0.9, M.white);
box('central_bay_red', CW + 0.16, 0.09, MD - 1.24, -1.4, CH - 0.16, 0.9, M.red);
box('wing_mass', MW - 2.2, WH - 0.16, WD, 0.4, 0.16 + (WH - 0.16) / 2, -4.0, M.black);
box('wing_roof', MW - 2.3, 0.14, WD - 0.1, 0.4, WH + 0.01, -4.0, M.white);
box('wing_red', MW - 2.16, 0.08, WD + 0.04, 0.4, WH - 0.14, -4.0, M.red);

/* structural column lines on every elevation */
for (let i = -5; i <= 5; i++) {
  box(`column_n_${i + 5}`, 0.12, MH - 0.4, 0.14, i * 1.05, 1.0, 0.9 + MD / 2 + 0.03, M.graphite);
  box(`column_s_${i + 5}`, 0.12, MH - 0.4, 0.14, i * 1.05, 1.0, 0.9 - MD / 2 - 0.03, M.graphite);
}
for (let i = -3; i <= 3; i++) {
  box(`column_e_${i + 3}`, 0.14, MH - 0.4, 0.12, MW / 2 + 0.03, 1.0, 0.9 + i * 0.95, M.graphite);
  box(`column_w_${i + 3}`, 0.14, MH - 0.4, 0.12, -MW / 2 - 0.03, 1.0, 0.9 + i * 0.95, M.graphite);
}
for (let i = -3; i <= 3; i++)
  box(`wing_column_${i + 3}`, 0.12, WH - 0.35, 0.12, 0.4 + i * 1.3, 0.82, -4.0 - WD / 2 - 0.03, M.graphite);

/* continuous glazing strip + entry */
box('window_strip', MW - 1.4, 0.7, 0.08, 0, 1.34, 0.9 + MD / 2 + 0.03, M.glass);
box('window_head', MW - 1.3, 0.1, 0.14, 0, 1.74, 0.9 + MD / 2 + 0.05, M.white);
box('entry_portal', 2.4, 1.5, 0.2, 2.6, 0.9, 0.9 + MD / 2 - 0.02, M.graphite);
box('entry_glass', 2.1, 1.2, 0.1, 2.6, 0.85, 0.9 + MD / 2 + 0.05, M.glass);
box('entry_glowline', 2.4, 0.06, 0.1, 2.6, 1.7, 0.9 + MD / 2 + 0.08, M.glow);
box('entry_canopy', 2.9, 0.12, 0.7, 2.6, 1.86, 0.9 + MD / 2 + 0.3, M.white);

/* loading docks along the west end of the wing */
[-3.6, -2.2, -0.8].forEach((x, i) => {
  box(`dock_door_${i}`, 1.1, 1.0, 0.1, x, 0.66, -4.0 - WD / 2 - 0.05, M.graphite);
  box(`dock_door_line_${i}`, 1.1, 0.06, 0.12, x, 1.2, -4.0 - WD / 2 - 0.07, M.red);
});
box('dock_apron', 5.4, 0.08, 0.7, -2.2, 0.2, -5.6, M.graphite);

/* ---- Solar array across the roofs, laid in clean rows ---- */
for (let r = -4; r <= 4; r++) {
  for (let c = -1; c <= 1; c++) {
    if (r >= -2 && r <= 0 && c >= -1 && c <= 1) continue;  // clear of the central bay
    box(`solar_${r + 4}_${c + 1}`, 1.05, 0.09, 1.6, r * 1.15, MH + 0.15, 0.9 + c * 1.8, M.graphite);
  }
}
for (let r = -1; r <= 1; r++)
  box(`solar_bay_${r + 1}`, 0.85, 0.09, 3.4, -1.4 + r * 1.0, CH + 0.15, 0.9, M.graphite);
for (let r = -2; r <= 2; r++)
  box(`solar_wing_${r + 2}`, 1.3, 0.08, 1.9, 0.4 + r * 1.55, WH + 0.13, -4.0, M.graphite);

/* roof plant, kept low and sparse */
[[-4.6, 3.4], [-3.2, 3.4], [4.4, -1.4]].forEach(([x, z], i) => {
  box(`hvac_${i}`, 1.0, 0.4, 0.8, x, MH + 0.3, z, M.white);
  box(`hvac_vent_${i}`, 0.8, 0.12, 0.06, x, MH + 0.3, z + 0.42, M.graphite);
});
[[2.0, 3.6], [3.4, 3.6]].forEach(([x, z], i) =>
  cyl(`vent_stack_${i}`, 0.14, 0.14, 0.4, 10, x, MH + 0.3, z, M.graphite));

/* ---- Hook: charging pylon at the south-east corner, rings light in sequence ---- */
const PX = 4.9, PZ = -3.4, PTOP = 7.4;
box('pylon_spine', 0.34, PTOP, 0.48, PX, PTOP / 2, PZ, M.graphite);
box('pylon_face', 0.1, PTOP - 0.5, 0.32, PX + 0.19, PTOP / 2, PZ, M.black);
const RINGS = 12;
for (let i = 0; i < RINGS; i++) {
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.055, 6, 16), M.glow);
  add(ring, `pylon_ring_${i}`, PX, 0.9 + i * ((PTOP - 1.6) / (RINGS - 1)), PZ, [Math.PI / 2, 0, 0]);
  ring.castShadow = false;
}
box('pylon_cap', 0.48, 0.3, 0.6, PX, PTOP + 0.15, PZ, M.graphite);
box('pylon_beacon', 0.28, 0.1, 0.38, PX, PTOP + 0.35, PZ, M.glow);
box('pylon_base', 0.9, 0.22, 1.1, PX, 0.25, PZ, M.graphite);
box('pylon_base_red', 0.94, 0.07, 1.14, PX, 0.4, PZ, M.red);
[-1.5, -0.2].forEach((z, i) => {
  box(`charge_stall_${i}`, 1.6, 0.05, 0.9, PX - 0.1, 0.19, z, M.white);
  box(`charge_post_${i}`, 0.2, 0.7, 0.26, PX + 0.6, 0.52, z, M.graphite);
  box(`charge_post_light_${i}`, 0.08, 0.32, 0.16, PX + 0.71, 0.6, z, M.glow);
});

return g;

};

/* ---- jpm ---- */
LM.jpm = function(THREE){




/* Palette: deep navy + navy glass dominant, gold trim accent, pale stone base */
const mat = (name, color, o = {}) => {
  const m = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color), roughness: 0.84, metalness: 0, flatShading: true, ...o
  });
  m.name = name; return m;
};
const M = {
  navy:  mat('deep_navy',   0x1d2a44, { roughness: 0.8 }),
  navy2: mat('navy_dark',   0x141d31, { roughness: 0.82 }),
  glass: mat('navy_glass',  0x2f4666, { roughness: 0.26, metalness: 0.3 }),
  gold:  mat('gold_trim',   0xc9a04a, { roughness: 0.45, metalness: 0.4 }),
  glow:  mat('gold_glow',   0xf2cd77, {
    roughness: 0.4, emissive: new THREE.Color(0xd9a63c), emissiveIntensity: 1.5 }),
  stone: mat('pale_stone',  0xcfc9bb, { roughness: 0.9 }),
};

const g = new THREE.Group();
g.name = 'bank_tower_stage3';
const add = (mesh, name, x, y, z, rot) => {
  mesh.name = name; mesh.position.set(x, y, z);
  if (rot) mesh.rotation.set(rot[0] || 0, rot[1] || 0, rot[2] || 0);
  g.add(mesh); return mesh;
};
const box = (name, w, h, d, x, y, z, m, rot) =>
  add(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m), name, x, y, z, rot);
const cyl = (name, rt, rb, h, seg, x, y, z, m, rot) =>
  add(new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m), name, x, y, z, rot);

/* Fixed grid plot 12 x 12 m, footprint identical across all 5 stages; growth is height only */
const PW = 7.4, PD = 6.2;            // tower plan
const BH = 4.2;                       // colonnade / bracing storey
const FLOORS = 10, FH = 1.42;         // stage 3 of 5, floors added upward only
const top = BH + FLOORS * FH;

box('site_pad', 11.9, 0.16, 11.9, 0, 0.08, 0, M.stone);
box('plaza_inset', 10.4, 0.06, 9.2, 0, 0.19, 0, M.navy2);

/* ---- Stone base: colonnade around a recessed banking hall ---- */
box('hall_mass', PW - 0.6, BH - 0.5, PD - 0.6, 0, 0.16 + (BH - 0.5) / 2, 0, M.navy2);
[[0, 1], [0, -1]].forEach(([, sz], i) =>
  box(`hall_glass_${i}`, PW - 1.6, BH - 1.6, 0.1, 0, 1.9, sz * ((PD - 0.6) / 2 + 0.02), M.glass));
[[1, 0], [-1, 0]].forEach(([sx], i) =>
  box(`hall_glass_side_${i}`, 0.1, BH - 1.6, PD - 1.6, sx * ((PW - 0.6) / 2 + 0.02), 1.9, 0, M.glass));

const colX = [-3.9, -2.3, 2.3, 3.9], colZ = [-2.6, -0.9, 0.9, 2.6];
colX.forEach((x, i) => [1, -1].forEach((sz, k) => {
  cyl(`column_${i}_${k}`, 0.26, 0.3, BH - 0.7, 12, x, 0.16 + (BH - 0.7) / 2, sz * 3.7, M.stone);
  box(`column_cap_${i}_${k}`, 0.76, 0.2, 0.76, x, BH - 0.44, sz * 3.7, M.stone);
  box(`column_base_${i}_${k}`, 0.72, 0.22, 0.72, x, 0.27, sz * 3.7, M.stone);
}));
colZ.forEach((z, i) => [1, -1].forEach((sx, k) => {
  cyl(`column_s_${i}_${k}`, 0.26, 0.3, BH - 0.7, 12, sx * 4.3, 0.16 + (BH - 0.7) / 2, z, M.stone);
  box(`column_s_cap_${i}_${k}`, 0.76, 0.2, 0.76, sx * 4.3, BH - 0.44, z, M.stone);
  box(`column_s_base_${i}_${k}`, 0.72, 0.22, 0.72, sx * 4.3, 0.27, z, M.stone);
}));
box('entablature', 9.6, 0.5, 8.4, 0, BH - 0.1, 0, M.stone);
box('entablature_fillet', 9.9, 0.14, 8.7, 0, BH - 0.32, 0, M.gold);
box('cornice', 10.0, 0.26, 8.8, 0, BH + 0.22, 0, M.stone);

/* ---- Vault-door entrance: circular gold door motif, glows when thriving ---- */
const EZ = (PD - 0.6) / 2 + 0.06;
box('entry_reveal', 3.6, 3.0, 0.24, 0, 1.62, EZ - 0.06, M.navy2);
cyl('vault_ring_inner', 1.2, 1.2, 0.2, 32, 0, 1.62, EZ + 0.02, M.glow, [Math.PI / 2, 0, 0]);
cyl('vault_ring_outer', 1.44, 1.44, 0.3, 32, 0, 1.62, EZ + 0.08, M.gold, [Math.PI / 2, 0, 0]);
cyl('vault_door', 1.04, 1.04, 0.22, 32, 0, 1.62, EZ + 0.2, M.navy, [Math.PI / 2, 0, 0]);
cyl('vault_hub', 0.26, 0.26, 0.18, 16, 0, 1.62, EZ + 0.43, M.gold, [Math.PI / 2, 0, 0]);
for (let i = 0; i < 8; i++) {
  const a = (i / 8) * Math.PI * 2;
  cyl(`vault_bolt_${i}`, 0.09, 0.09, 0.14, 8,
      Math.cos(a) * 1.3, 1.62 + Math.sin(a) * 1.3, EZ + 0.28, M.gold, [Math.PI / 2, 0, 0]);
  box(`vault_spoke_${i}`, 0.09, 0.86, 0.1, Math.cos(a) * 0.48, 1.62 + Math.sin(a) * 0.48, EZ + 0.36,
      M.gold, [0, 0, -a + Math.PI / 2]);
}
[-2.0, 2.0].forEach((x, i) => {
  box(`entry_leaf_${i}`, 1.0, 2.3, 0.1, x, 1.3, EZ + 0.04, M.glass);
  box(`entry_leaf_trim_${i}`, 1.1, 0.09, 0.12, x, 2.5, EZ + 0.06, M.gold);
});
box('entry_threshold', 5.0, 0.12, 1.2, 0, 0.28, EZ + 0.6, M.stone);

/* ---- Diagonal structural bracing: gold V-legs lifting the tower ---- */
const braceLen = Math.hypot(3.5, BH - 0.4);
const braceAng = Math.atan2(3.5, BH - 0.4);
const BZ = 4.62;   // outboard of the colonnade (front columns end at z 4.0)
[1, -1].forEach((sz) => [1, -1].forEach((sx) => {
  const tag = `${sx > 0 ? 'e' : 'w'}${sz > 0 ? 'n' : 's'}`;
  box(`brace_${tag}`, 0.42, braceLen, 0.46,
    sx * 2.35, 0.16 + (BH - 0.4) / 2, sz * BZ, M.gold, [0, 0, -sx * braceAng]);
  box(`brace_glow_${tag}`, 0.1, braceLen - 0.5, 0.12,
    sx * 2.59, 0.16 + (BH - 0.4) / 2, sz * (BZ + 0.26), M.glow, [0, 0, -sx * braceAng]);
  box(`brace_pad_${tag}`, 1.1, 0.3, 1.1, sx * 4.15, 0.31, sz * BZ, M.stone);
  box(`brace_foot_${tag}`, 0.8, 0.34, 0.8, sx * 4.15, 0.6, sz * BZ, M.gold);
}));
[1, -1].forEach((sz, i) => {
  box(`brace_apex_${i}`, 1.3, 0.5, 0.7, 0, BH - 0.2, sz * BZ, M.gold);
  box(`brace_tie_${i}`, 0.7, 0.34, BZ - PD / 2, 0, BH - 0.2, sz * (BZ + PD / 2) / 2, M.gold);
  box(`brace_apex_glow_${i}`, 1.1, 0.1, 0.1, 0, BH - 0.42, sz * (BZ + 0.38), M.glow);
});

/* ---- Tower shaft: navy glass, gold vertical fins, faceted setback ---- */
box('tower_transfer', PW + 0.5, 0.4, PD + 0.5, 0, BH + 0.42, 0, M.navy2);
box('tower_shaft', PW, FLOORS * FH, PD, 0, BH + (FLOORS * FH) / 2, 0, M.navy);
for (let i = 0; i < FLOORS; i++) {
  const y = BH + i * FH + FH / 2;
  [[0, 1], [0, -1]].forEach(([, sz], k) =>
    box(`glass_band_${i}_${k}`, PW - 0.7, FH - 0.36, 0.09, 0, y, sz * (PD / 2 + 0.02), M.glass));
  [[1, 0], [-1, 0]].forEach(([sx], k) =>
    box(`glass_band_side_${i}_${k}`, 0.09, FH - 0.36, PD - 0.7, sx * (PW / 2 + 0.02), y, 0, M.glass));
  box(`slab_line_${i}`, PW + 0.1, 0.14, PD + 0.1, 0, BH + i * FH, 0, M.navy2);
}
const finX = [-3.0, -1.8, -0.6, 0.6, 1.8, 3.0];
finX.forEach((x, i) => [1, -1].forEach((sz, k) =>
  box(`fin_${i}_${k}`, 0.14, FLOORS * FH, 0.22, x, BH + (FLOORS * FH) / 2, sz * (PD / 2 + 0.1), M.gold)));
[-2.2, -0.7, 0.7, 2.2].forEach((z, i) => [1, -1].forEach((sx, k) =>
  box(`fin_side_${i}_${k}`, 0.22, FLOORS * FH, 0.14, sx * (PW / 2 + 0.1), BH + (FLOORS * FH) / 2, z, M.gold)));
[[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([sx, sz], i) =>
  box(`corner_chamfer_${i}`, 0.5, FLOORS * FH, 0.5,
      sx * (PW / 2 - 0.1), BH + (FLOORS * FH) / 2, sz * (PD / 2 - 0.1), M.navy2, [0, sx * sz * 0.6, 0]));
/* seam of glowing diagonals continuing the bracing motif up the north face */
const chevH = 3.1, chevW = 3.3, chevLen = Math.hypot(chevW, chevH), chevA = Math.atan2(chevW, chevH);
for (let i = 0; i < 3; i++) {
  const y = BH + 1.4 + i * 4.2;
  [1, -1].forEach((sx, k) => {
    box(`seam_n_${i}_${k}`, 0.13, chevLen, 0.12, sx * (chevW / 2), y, PD / 2 + 0.13, M.glow, [0, 0, sx * chevA]);
    box(`seam_s_${i}_${k}`, 0.13, chevLen, 0.12, sx * (chevW / 2), y, -PD / 2 - 0.13, M.glow, [0, 0, sx * chevA]);
  });
  box(`seam_node_${i}`, 0.3, 0.3, 0.14, 0, y + chevH / 2, PD / 2 + 0.13, M.gold);
  box(`seam_node_s_${i}`, 0.3, 0.3, 0.14, 0, y + chevH / 2, -PD / 2 - 0.13, M.gold);
}

/* ---- Crown: gold-banded setback, plain cap ---- */
box('crown_setback', PW - 0.9, 1.3, PD - 0.9, 0, top + 0.65, 0, M.navy2);
[[0, 1], [0, -1]].forEach(([, sz], i) =>
  box(`crown_glass_${i}`, PW - 2.0, 0.8, 0.08, 0, top + 0.62, sz * ((PD - 0.9) / 2 + 0.03), M.glass));
box('crown_band', PW - 0.7, 0.16, PD - 0.7, 0, top + 0.06, 0, M.gold);
box('crown_cap', PW - 0.5, 0.22, PD - 0.5, 0, top + 1.4, 0, M.stone);
box('crown_cap_reveal', PW - 0.44, 0.06, PD - 0.44, 0, top + 1.29, 0, M.glow);
box('mech_house', 2.4, 0.9, 2.0, -0.5, top + 1.96, -0.3, M.navy2);
box('mech_louvre', 1.8, 0.4, 0.07, -0.5, top + 1.96, 0.74, M.gold);
[[1.9, 1.3], [1.9, -1.4]].forEach(([x, z], i) =>
  box(`roof_unit_${i}`, 0.8, 0.4, 0.7, x, top + 1.71, z, M.stone));
cyl('mast', 0.05, 0.07, 2.0, 8, -2.0, top + 2.5, 1.3, M.stone);
cyl('mast_light', 0.08, 0.08, 0.16, 8, -2.0, top + 3.58, 1.3, M.glow);

return g;

};

/* ---- cat ---- */
LM.cat = function(THREE){




/* Palette: black + graphite dominant, CAT yellow accent, cool glass */
const mat = (name, color, o = {}) => {
  const m = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color), roughness: 0.85, metalness: 0, flatShading: true, ...o
  });
  m.name = name; return m;
};
const M = {
  black:    mat('cat_black',   0x1a1b1d, { roughness: 0.86 }),
  graphite: mat('graphite',    0x35383c, { roughness: 0.8 }),
  yellow:   mat('cat_yellow',  0xf0b323, { roughness: 0.62 }),
  glow:     mat('yellow_glow', 0xffd45e, {
    roughness: 0.42, emissive: new THREE.Color(0xf2b21c), emissiveIntensity: 1.4 }),
  steel:    mat('steel_grey',  0x9aa0a6, { roughness: 0.62, metalness: 0.2 }),
  glass:    mat('glass',       0x4c6a80, { roughness: 0.25, metalness: 0.3 }),
};

const g = new THREE.Group();
g.name = 'gantry_tower_stage3';
const add = (mesh, name, x, y, z, rot) => {
  mesh.name = name; mesh.position.set(x, y, z);
  if (rot) mesh.rotation.set(rot[0] || 0, rot[1] || 0, rot[2] || 0);
  g.add(mesh); return mesh;
};
const box = (name, w, h, d, x, y, z, m, rot) =>
  add(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m), name, x, y, z, rot);
const cyl = (name, rt, rb, h, seg, x, y, z, m, rot) =>
  add(new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m), name, x, y, z, rot);

/* Fixed grid plot 12 x 12 m, footprint identical across all 5 stages; growth is height only */
const PW = 7.2, PD = 6.0;             // tower plan
const BH = 2.4;                        // industrial podium
const FLOORS = 7, FH = 1.55;           // stage 3 of 5, floors added upward only
const top = BH + FLOORS * FH;

box('site_pad', 11.9, 0.18, 11.9, 0, 0.09, 0, M.graphite);
[-3.2, 3.2].forEach((x, i) =>
  box(`hazard_stripe_${i}`, 2.0, 0.05, 1.6, x, 0.21, 5.0, M.yellow));

/* ---- Podium: heavy black plinth, yellow datum, exposed frame ---- */
box('podium_mass', 10.8, BH - 0.18, 8.8, 0, 0.18 + (BH - 0.18) / 2, -0.6, M.black);
box('podium_datum', 10.9, 0.22, 8.9, 0, 1.0, -0.6, M.yellow);
box('podium_cap', 11.1, 0.26, 9.1, 0, BH + 0.02, -0.6, M.graphite);
box('podium_kick', 11.0, 0.4, 9.0, 0, 0.38, -0.6, M.graphite);
for (let i = -5; i <= 5; i++) {
  box(`pod_col_n_${i + 5}`, 0.16, BH - 0.6, 0.18, i * 1.05, 1.3, 3.86, M.graphite);
  box(`pod_col_s_${i + 5}`, 0.16, BH - 0.6, 0.18, i * 1.05, 1.3, -5.06, M.graphite);
}
for (let i = -4; i <= 4; i++) {
  box(`pod_col_e_${i + 4}`, 0.18, BH - 0.6, 0.16, 5.46, 1.3, -0.6 + i * 1.0, M.graphite);
  box(`pod_col_w_${i + 4}`, 0.18, BH - 0.6, 0.16, -5.46, 1.3, -0.6 + i * 1.0, M.graphite);
}
box('podium_glass_n', 8.8, 0.9, 0.1, 0, 1.75, 3.84, M.glass);
box('podium_glass_e', 0.1, 0.9, 7.4, 5.44, 1.75, -0.6, M.glass);
box('podium_glass_w', 0.1, 0.9, 7.4, -5.44, 1.75, -0.6, M.glass);
/* entry: yellow blade canopy over a glazed bay */
box('entry_recess', 3.6, 1.9, 0.4, 1.2, 1.15, 3.7, M.graphite);
box('entry_glass', 3.2, 1.6, 0.1, 1.2, 1.1, 3.94, M.glass);
box('entry_canopy', 4.6, 0.16, 1.3, 1.2, 2.16, 4.5, M.graphite);
box('entry_canopy_blade', 4.6, 0.26, 0.14, 1.2, 2.04, 5.12, M.yellow);
box('entry_step', 5.2, 0.14, 0.9, 1.2, 0.25, 5.3, M.graphite);
[-1.6, 4.0].forEach((x, i) =>
  cyl(`bollard_${i}`, 0.11, 0.13, 0.7, 8, x, 0.55, 4.9, M.yellow));
/* plant doors on the west return */
[-3.0, -1.4].forEach((z, i) => {
  box(`plant_door_${i}`, 0.12, 1.7, 1.4, -5.46, 1.05, z, M.graphite);
  box(`plant_door_bar_${i}`, 0.08, 0.1, 1.4, -5.52, 1.85, z, M.yellow);
});

/* ---- Tower: black shaft with exposed steel girder frame ---- */
box('tower_shaft', PW, FLOORS * FH, PD, 0, BH + (FLOORS * FH) / 2, -0.6, M.black);
for (let i = 0; i <= FLOORS; i++)
  box(`girder_ring_${i}`, PW + 0.3, 0.2, PD + 0.3, 0, BH + i * FH, -0.6, M.steel);
[[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([sx, sz], i) =>
  box(`girder_col_${i}`, 0.26, FLOORS * FH, 0.26,
      sx * (PW / 2 + 0.1), BH + (FLOORS * FH) / 2, -0.6 + sz * (PD / 2 + 0.1), M.steel));
/* diagonal bracing in alternating bays, the industrial motif */
const brLen = Math.hypot(PW - 0.6, FH), brA = Math.atan2(PW - 0.6, FH);
for (let i = 0; i < FLOORS; i++) {
  const y = BH + i * FH + FH / 2;
  const dir = i % 2 ? 1 : -1;
  [1, -1].forEach((sz, k) =>
    box(`brace_n${k}_${i}`, 0.16, brLen, 0.14, 0, y, -0.6 + sz * (PD / 2 + 0.14), M.steel, [0, 0, dir * brA]));
  [1, -1].forEach((sx, k) =>
    box(`brace_e${k}_${i}`, 0.14, brLen * 0.84, 0.16, sx * (PW / 2 + 0.14), y, -0.6, M.steel, [-dir * brA * 0.9, 0, 0]));
  [1, -1].forEach((sz, k) =>
    box(`glass_n${k}_${i}`, PW - 1.2, FH - 0.44, 0.08, 0, y, -0.6 + sz * (PD / 2 + 0.02), M.glass));
  [1, -1].forEach((sx, k) =>
    box(`glass_e${k}_${i}`, 0.08, FH - 0.44, PD - 1.2, sx * (PW / 2 + 0.02), y, -0.6, M.glass));
  if (i % 3 === 1) box(`yellow_band_${i}`, PW + 0.36, 0.14, PD + 0.36, 0, BH + i * FH + 0.16, -0.6, M.yellow);
}
/* service ladder and cage up the east face */
for (let i = 0; i < 14; i++)
  box(`ladder_rung_${i}`, 0.5, 0.07, 0.07, PW / 2 + 0.3, BH + 0.4 + i * 0.78, -3.0, M.steel);
[-0.22, 0.22].forEach((dz, i) =>
  box(`ladder_rail_${i}`, 0.07, FLOORS * FH, 0.07, PW / 2 + 0.3, BH + (FLOORS * FH) / 2, -3.0 + dz, M.yellow));

/* ---- Crown deck: machine deck the gantry stands on ---- */
box('deck_slab', PW + 1.2, 0.3, PD + 1.2, 0, top + 0.15, -0.6, M.graphite);
box('deck_edge', PW + 1.3, 0.12, PD + 1.3, 0, top + 0.36, -0.6, M.yellow);
box('deck_rail_n', PW + 1.2, 0.5, 0.07, 0, top + 0.6, -0.6 + (PD + 1.2) / 2, M.steel);
box('deck_rail_s', PW + 1.2, 0.5, 0.07, 0, top + 0.6, -0.6 - (PD + 1.2) / 2, M.steel);
box('deck_rail_e', 0.07, 0.5, PD + 1.2, (PW + 1.2) / 2, top + 0.6, -0.6, M.steel);
box('deck_rail_w', 0.07, 0.5, PD + 1.2, -(PW + 1.2) / 2, top + 0.6, -0.6, M.steel);
box('machine_house', 2.6, 1.1, 2.2, -2.2, top + 0.85, -2.0, M.graphite);
box('machine_house_cap', 2.74, 0.14, 2.34, -2.2, top + 1.47, -2.0, M.yellow);
box('machine_louvre', 2.0, 0.42, 0.07, -2.2, top + 0.85, -0.86, M.black);

/* ---- Hook: functional rooftop gantry crane, taller each tier ---- */
const GY = top + 0.3;                       // gantry base sits on the machine deck
const MASTH = 5.4;                          // stage 3 mast height, grows with each tier
const GX = 0.6, GZ = -0.6;
/* four-legged mast with lattice */
const legs = [[0.55, 0.5], [0.55, -0.5], [-0.55, 0.5], [-0.55, -0.5]];
legs.forEach(([dx, dz], i) =>
  box(`mast_leg_${i}`, 0.16, MASTH, 0.16, GX + dx, GY + MASTH / 2, GZ + dz, M.yellow));
for (let i = 0; i < 7; i++) {
  const y = GY + 0.45 + i * (MASTH - 0.9) / 6;
  box(`mast_ring_n_${i}`, 1.26, 0.09, 0.09, GX, y, GZ + 0.5, M.yellow);
  box(`mast_ring_s_${i}`, 1.26, 0.09, 0.09, GX, y, GZ - 0.5, M.yellow);
  box(`mast_ring_e_${i}`, 0.09, 0.09, 1.16, GX + 0.55, y, GZ, M.yellow);
  box(`mast_ring_w_${i}`, 0.09, 0.09, 1.16, GX - 0.55, y, GZ, M.yellow);
  const dL = Math.hypot(1.1, (MASTH - 0.9) / 6), dA = Math.atan2(1.1, (MASTH - 0.9) / 6);
  const d = i % 2 ? 1 : -1;
  box(`mast_diag_n_${i}`, 0.08, dL, 0.08, GX, y + (MASTH - 0.9) / 12, GZ + 0.5, M.graphite, [0, 0, d * dA]);
  box(`mast_diag_s_${i}`, 0.08, dL, 0.08, GX, y + (MASTH - 0.9) / 12, GZ - 0.5, M.graphite, [0, 0, d * dA]);
}
box('mast_base', 1.7, 0.4, 1.6, GX, GY + 0.2, GZ, M.black);
box('mast_base_ring', 1.8, 0.1, 1.7, GX, GY + 0.44, GZ, M.glow);
/* slew platform, counter-jib and jib */
box('slew_ring', 1.5, 0.28, 1.4, GX, GY + MASTH + 0.14, GZ, M.graphite);
box('cab', 0.9, 0.85, 0.9, GX - 0.9, GY + MASTH + 0.7, GZ, M.yellow);
box('cab_glass', 0.72, 0.55, 0.1, GX - 0.9, GY + MASTH + 0.78, GZ + 0.46, M.glass);
box('jib', 4.4, 0.34, 0.42, GX + 2.2, GY + MASTH + 0.62, GZ, M.yellow);
box('jib_chord', 4.4, 0.1, 0.5, GX + 2.2, GY + MASTH + 0.36, GZ, M.graphite);
for (let i = 0; i < 6; i++) {
  const x = GX + 0.2 + i * 0.72;
  box(`jib_web_${i}`, 0.08, 0.44, 0.08, x, GY + MASTH + 0.46, GZ + 0.2, M.graphite, [0, 0, (i % 2 ? 0.6 : -0.6)]);
  box(`jib_web2_${i}`, 0.08, 0.44, 0.08, x, GY + MASTH + 0.46, GZ - 0.2, M.graphite, [0, 0, (i % 2 ? -0.6 : 0.6)]);
}
box('counter_jib', 2.2, 0.32, 0.42, GX - 1.9, GY + MASTH + 0.62, GZ, M.yellow);
box('counterweight', 1.0, 0.7, 0.8, GX - 2.6, GY + MASTH + 0.3, GZ, M.black);
box('counterweight_stripe', 1.06, 0.1, 0.86, GX - 2.6, GY + MASTH + 0.5, GZ, M.yellow);
/* A-frame and tie bars */
box('a_frame_l', 0.14, 1.5, 0.14, GX - 0.35, GY + MASTH + 1.05, GZ, M.graphite, [0, 0, 0.3]);
box('a_frame_r', 0.14, 1.5, 0.14, GX + 0.35, GY + MASTH + 1.05, GZ, M.graphite, [0, 0, -0.3]);
box('tie_fore', 3.0, 0.07, 0.07, GX + 1.6, GY + MASTH + 1.32, GZ, M.graphite, [0, 0, 0.19]);
box('tie_aft', 1.9, 0.07, 0.07, GX - 1.4, GY + MASTH + 1.36, GZ, M.graphite, [0, 0, -0.3]);
/* trolley, hoist line and hook block */
box('trolley', 0.6, 0.26, 0.5, GX + 2.9, GY + MASTH + 0.36, GZ, M.graphite);
box('hoist_line', 0.06, 2.6, 0.06, GX + 2.9, GY + MASTH - 1.0, GZ, M.steel);
box('hook_block', 0.42, 0.4, 0.4, GX + 2.9, GY + MASTH - 2.45, GZ, M.yellow);
box('hook', 0.14, 0.34, 0.14, GX + 2.9, GY + MASTH - 2.8, GZ, M.steel);
/* beacons */
box('gantry_beacon', 0.2, 0.2, 0.2, GX, GY + MASTH + 1.9, GZ, M.glow);
box('jib_tip_light', 0.2, 0.2, 0.2, GX + 4.1, GY + MASTH + 0.86, GZ, M.glow);

/* ---- Yard plant on the deck ---- */
[[2.1, -2.6], [3.4, -2.6]].forEach(([x, z], i) => {
  box(`deck_unit_${i}`, 1.1, 0.5, 0.9, x, top + 0.55, z, M.steel);
  box(`deck_unit_vent_${i}`, 0.85, 0.2, 0.06, x, top + 0.55, z + 0.48, M.graphite);
});
cyl('deck_stack', 0.2, 0.2, 0.7, 10, -3.4, top + 0.65, 1.4, M.graphite);
cyl('deck_stack_cap', 0.28, 0.28, 0.1, 10, -3.4, top + 1.05, 1.4, M.yellow);

return g;

};

/* ---- amzn ---- */
LM.amzn = function(THREE){




/* Palette: black + charcoal dominant, orange accent, cool glass, white trim */
const mat = (name, color, o = {}) => {
  const m = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color), roughness: 0.82, metalness: 0, flatShading: true, ...o
  });
  m.name = name; return m;
};
const M = {
  black:    mat('shell_black',   0x1c1e22, { roughness: 0.7 }),
  charcoal: mat('charcoal_grey', 0x33373e, { roughness: 0.75 }),
  orange:   mat('accent_orange', 0xf5820b, { roughness: 0.6 }),
  glow:     mat('orange_glow',   0xffa733, {
    roughness: 0.4, emissive: new THREE.Color(0xff8c1a), emissiveIntensity: 1.6 }),
  white:    mat('trim_white',    0xe9eaea, { roughness: 0.7 }),
  glass:    mat('glass_dark',    0x46596a, { roughness: 0.25, metalness: 0.32 }),
  dome:     mat('dome_glass',    0x86a58f, {
    roughness: 0.2, metalness: 0.25, transparent: true, opacity: 0.55, flatShading: false }),
  strut:    mat('dome_strut',    0xd8dcd6, { roughness: 0.6, wireframe: true }),
};

const g = new THREE.Group();
g.name = 'logistics_tower_stage3';
const add = (mesh, name, x, y, z, rot) => {
  mesh.name = name; mesh.position.set(x, y, z);
  if (rot) mesh.rotation.set(rot[0] || 0, rot[1] || 0, rot[2] || 0);
  g.add(mesh); return mesh;
};
const box = (name, w, h, d, x, y, z, m, rot) =>
  add(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m), name, x, y, z, rot);
const cyl = (name, rt, rb, h, seg, x, y, z, m, rot, open) =>
  add(new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg, 1, !!open), m), name, x, y, z, rot);

/* Fixed grid plot 12 x 12 m, footprint identical across all 5 stages; growth is height only */
const PW = 11.9, PD = 11.9;
const BW = 11.4, BD = 9.4, BH = 3.4;      // warehouse base
const TW = 3.6, TD = 3.6;                  // slim tower
const FLOORS = 7, FH = 1.55;               // stage 3 of 5, tower grows upward only
const tTop = BH + FLOORS * FH;

/* ---- Warehouse base ---- */
box('base_slab', PW, 0.26, PD, 0, 0.13, 0, M.charcoal);
box('warehouse_mass', BW, BH - 0.26, BD, 0, 0.26 + (BH - 0.26) / 2, 0, M.black);
box('warehouse_band', BW + 0.1, 0.3, BD + 0.1, 0, 1.0, 0, M.charcoal);
box('warehouse_parapet', BW + 0.22, 0.5, BD + 0.22, 0, BH + 0.1, 0, M.charcoal);
box('warehouse_roof', BW - 0.1, 0.12, BD - 0.1, 0, BH - 0.02, 0, M.charcoal);
/* ribbed cladding */
for (let i = -5; i <= 5; i++) {
  box(`rib_front_${i + 5}`, 0.1, BH - 0.5, 0.1, i * 1.0, 1.7, BD / 2 + 0.02, M.charcoal);
  box(`rib_back_${i + 5}`, 0.1, BH - 0.5, 0.1, i * 1.0, 1.7, -BD / 2 - 0.02, M.charcoal);
}
for (let i = -4; i <= 4; i++) {
  box(`rib_east_${i + 4}`, 0.1, BH - 0.5, 0.1, BW / 2 + 0.02, 1.7, i * 1.0, M.charcoal);
  box(`rib_west_${i + 4}`, 0.1, BH - 0.5, 0.1, -BW / 2 - 0.02, 1.7, i * 1.0, M.charcoal);
}
/* loading dock: orange roll-up doors + canopy + bumpers */
[-4.1, -2.05, 0, 2.05, 4.1].forEach((x, i) => {
  box(`dock_door_${i}`, 1.5, 1.9, 0.12, x, 1.2, BD / 2 + 0.06, M.orange);
  box(`dock_door_frame_${i}`, 1.72, 2.1, 0.08, x, 1.24, BD / 2 + 0.02, M.charcoal);
  [-0.62, 0.62].forEach((dx, k) =>
    box(`dock_bumper_${i}_${k}`, 0.16, 0.26, 0.14, x + dx, 0.42, BD / 2 + 0.1, M.charcoal));
  [0.35, 0.9, 1.45].forEach((dy, k) =>
    box(`dock_slat_${i}_${k}`, 1.5, 0.05, 0.14, x, dy, BD / 2 + 0.07, M.charcoal));
});
box('dock_canopy', BW - 0.4, 0.16, 1.1, 0, 2.42, BD / 2 + 0.4, M.charcoal);
box('dock_canopy_edge', BW - 0.4, 0.12, 0.12, 0, 2.32, BD / 2 + 0.9, M.orange);
box('dock_apron', BW - 1.6, 0.1, 0.6, 0, 0.3, BD / 2 + 0.75, M.charcoal);
/* staff entrance on the west end */
box('entry_reveal', 0.16, 2.0, 2.0, -BW / 2 - 0.04, 1.2, -2.4, M.charcoal);
box('entry_glass', 0.08, 1.7, 1.7, -BW / 2 - 0.1, 1.15, -2.4, M.glass);
box('entry_canopy', 0.8, 0.12, 2.4, -5.55, 2.3, -2.4, M.orange);
/* clerestory strip windows */
[-1, 1].forEach((s, i) => {
  box(`clerestory_${i}`, BW - 1.2, 0.5, 0.08, 0, 2.75, s * (BD / 2 + 0.02), M.glass);
});

/* ---- Slim tower rising from the centre ---- */
box('tower_shaft', TW, FLOORS * FH, TD, 0, BH + (FLOORS * FH) / 2, 0, M.black);
for (let i = 0; i < FLOORS; i++) {
  const y = BH + i * FH;
  box(`tower_slab_${i}`, TW + 0.16, 0.14, TD + 0.16, 0, y + 0.07, 0, M.charcoal);
  [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(([sx, sz], k) => {
    box(`tower_glass_${i}_${k}`, sz ? TW - 0.5 : 0.08, FH - 0.42, sz ? 0.08 : TD - 0.5,
        sx * (TW / 2 + 0.02), y + FH / 2 + 0.06, sz * (TD / 2 + 0.02), M.glass);
  });
}
/* vertical accent fin running the full shaft */
box('accent_fin', 0.14, FLOORS * FH - 0.4, 0.3, TW / 2 + 0.1, BH + (FLOORS * FH) / 2, TD / 2 - 0.6, M.orange);
box('tower_corner_trim', 0.12, FLOORS * FH, 0.12, -TW / 2 - 0.04, BH + (FLOORS * FH) / 2, TD / 2 + 0.04, M.charcoal);

/* ---- Crown: sign band, glowing curved light arc, cap ---- */
box('crown_band', TW + 0.5, 1.5, TD + 0.5, 0, tTop + 0.75, 0, M.charcoal);
box('crown_sign_face', TW + 0.1, 0.9, 0.1, 0, tTop + 1.05, TD / 2 + 0.28, M.orange);
box('crown_sign_face_back', TW + 0.1, 0.9, 0.1, 0, tTop + 1.05, -TD / 2 - 0.28, M.orange);
[1, -1].forEach((s, i) => {
  const arcGeo = new THREE.TorusGeometry(1.25, 0.09, 8, 24, Math.PI * 0.72);
  const arcMesh = add(new THREE.Mesh(arcGeo, M.glow), `smile_arc_${i}`,
    0, tTop + 0.72, s * (TD / 2 + 0.3), [0, s > 0 ? 0 : Math.PI, Math.PI + Math.PI * 0.14]);
  arcMesh.castShadow = false;
  cyl(`smile_tip_${i}`, 0.1, 0.1, 0.16, 8, -1.1, tTop + 0.36, s * (TD / 2 + 0.3), M.glow, [Math.PI / 2, 0, 0]);
  cyl(`smile_tip2_${i}`, 0.1, 0.1, 0.16, 8, 1.1, tTop + 0.36, s * (TD / 2 + 0.3), M.glow, [Math.PI / 2, 0, 0]);
});
box('crown_cap', TW + 0.8, 0.26, TD + 0.8, 0, tTop + 1.63, 0, M.charcoal);
[[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([sx, sz], i) =>
  box(`crown_cap_reveal_${i}`, sz ? TW + 0.86 : 0.1, 0.07, sz ? 0.1 : TD + 0.86,
      sx * (TW / 2 + 0.4), tTop + 1.79, sz * (TD / 2 + 0.4), M.orange));
cyl('mast', 0.07, 0.09, 2.2, 8, 1.0, tTop + 2.85, -1.0, M.white);
cyl('mast_beacon', 0.11, 0.11, 0.16, 8, 1.0, tTop + 3.9, -1.0, M.glow);

/* ---- Biosphere crown detail: geodesic domes on the warehouse roof ---- */
[[-3.4, 2.6, 1.5], [-1.5, 3.0, 1.15], [-3.0, -0.4, 0.95]].forEach(([x, z, r], i) => {
  const dome = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 2), M.dome);
  add(dome, `biosphere_${i}`, x, BH + 0.04 + r * 0.62, z);
  dome.castShadow = false;
  const struts = new THREE.Mesh(new THREE.IcosahedronGeometry(r * 1.005, 2), M.strut);
  add(struts, `biosphere_struts_${i}`, x, BH + 0.04 + r * 0.62, z);
  struts.castShadow = false;
  cyl(`biosphere_base_${i}`, r * 0.86, r * 0.92, 0.16, 16, x, BH + 0.12, z, M.white);
});

/* ---- Roof plant on the warehouse deck ---- */
[[2.6, -2.6], [4.4, -2.6], [2.6, 2.9], [4.4, 2.9]].forEach(([x, z], i) => {
  box(`hvac_${i}`, 1.4, 0.66, 1.0, x, BH + 0.37, z, M.white);
  box(`hvac_base_${i}`, 1.55, 0.1, 1.15, x, BH + 0.08, z, M.charcoal);
  cyl(`hvac_fan_${i}`, 0.26, 0.26, 0.07, 12, x, BH + 0.72, z, M.charcoal);
});
[[-1.4, -3.2], [0.4, -3.4]].forEach(([x, z], i) => {
  cyl(`vent_${i}`, 0.2, 0.2, 0.5, 10, x, BH + 0.29, z, M.charcoal);
  cyl(`vent_cap_${i}`, 0.28, 0.28, 0.08, 10, x, BH + 0.58, z, M.white);
});
[[-4.9, -3.9], [4.9, -3.9], [4.9, 3.9]].forEach(([x, z], i) =>
  box(`roof_light_${i}`, 0.22, 0.22, 0.22, x, BH + 0.45, z, M.glow));
[-2.2, 0, 2.2].forEach((x, i) =>
  box(`skylight_${i}`, 1.6, 0.1, 1.0, x, BH + 0.1, 3.6, M.glass));

return g;

};

/* ---- xom ---- */
LM.xom = function(THREE){




/* Palette: industrial grey + pale steel dominant, red accent, warm glass */
const mat = (name, color, o = {}) => {
  const m = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color), roughness: 0.85, metalness: 0, flatShading: true, ...o
  });
  m.name = name; return m;
};
const M = {
  grey:  mat('industrial_grey', 0x6d7378, { roughness: 0.86 }),
  dark:  mat('dark_grey',       0x43484d, { roughness: 0.8 }),
  steel: mat('pale_steel',      0xb4b9bd, { roughness: 0.62, metalness: 0.18 }),
  red:   mat('accent_red',      0xc0392b, { roughness: 0.58 }),
  glass: mat('warm_glass',      0x6f8896, { roughness: 0.26, metalness: 0.3 }),
  glow:  mat('flare_glow',      0xffb257, {
    roughness: 0.4, emissive: new THREE.Color(0xff8a1e), emissiveIntensity: 2.0 }),
};

const g = new THREE.Group();
g.name = 'refinery_campus_stage3';
const add = (mesh, name, x, y, z, rot) => {
  mesh.name = name; mesh.position.set(x, y, z);
  if (rot) mesh.rotation.set(rot[0] || 0, rot[1] || 0, rot[2] || 0);
  g.add(mesh); return mesh;
};
const box = (name, w, h, d, x, y, z, m, rot) =>
  add(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m), name, x, y, z, rot);
const cyl = (name, rt, rb, h, seg, x, y, z, m, rot) =>
  add(new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m), name, x, y, z, rot);

/* Fixed grid plot 12 x 12 m, footprint identical across all 5 stages; growth is height only */
const WW = 3.6, WD = 9.6;             // side wings
const WX = 3.85;                       // wing centre offset
const FLOORS = 4, FH = 1.5;            // stage 3 of 5, floors added upward only
const wingTop = 0.5 + FLOORS * FH;

box('site_pad', 11.9, 0.18, 11.9, 0, 0.09, 0, M.dark);
box('plaza', 3.6, 0.06, 10.6, 0, 0.21, 0, M.grey);

/* ---- Low-rise grid campus: two wings flanking a central gateway ---- */
[1, -1].forEach((sx, w) => {
  const X = sx * WX, tag = sx > 0 ? 'e' : 'w';
  box(`wing_plinth_${tag}`, WW + 0.4, 0.5, WD + 0.3, X, 0.34, 0, M.dark);
  box(`wing_mass_${tag}`, WW, FLOORS * FH, WD, X, 0.5 + (FLOORS * FH) / 2, 0, M.grey);
  for (let i = 0; i < FLOORS; i++) {
    const y = 0.5 + i * FH;
    box(`wing_slab_${tag}_${i}`, WW + 0.22, 0.2, WD + 0.22, X, y + 0.1, 0, M.steel);
    box(`wing_glass_out_${tag}_${i}`, 0.1, FH - 0.42, WD - 0.5, X + sx * (WW / 2 + 0.02), y + FH / 2 + 0.1, 0, M.glass);
    box(`wing_glass_in_${tag}_${i}`, 0.1, FH - 0.42, WD - 0.5, X - sx * (WW / 2 + 0.02), y + FH / 2 + 0.1, 0, M.glass);
    [1, -1].forEach((sz, k) =>
      box(`wing_glass_end_${tag}_${i}_${k}`, WW - 0.6, FH - 0.42, 0.1, X, y + FH / 2 + 0.1, sz * (WD / 2 + 0.02), M.glass));
  }
  for (let j = -4; j <= 4; j++) {
    box(`wing_mullion_out_${tag}_${j + 4}`, 0.14, FLOORS * FH, 0.1, X + sx * (WW / 2 + 0.05), 0.5 + (FLOORS * FH) / 2, j * 1.05, M.steel);
    box(`wing_mullion_in_${tag}_${j + 4}`, 0.14, FLOORS * FH, 0.1, X - sx * (WW / 2 + 0.05), 0.5 + (FLOORS * FH) / 2, j * 1.05, M.steel);
  }
  box(`wing_parapet_${tag}`, WW + 0.34, 0.42, WD + 0.34, X, wingTop + 0.15, 0, M.steel);
  box(`wing_cap_${tag}`, WW + 0.4, 0.12, WD + 0.4, X, wingTop + 0.42, 0, M.dark);
  box(`wing_redline_${tag}`, WW + 0.38, 0.09, WD + 0.38, X, wingTop - 0.1, 0, M.red);
  box(`wing_roof_${tag}`, WW - 0.1, 0.1, WD - 0.1, X, wingTop + 0.05, 0, M.dark);
  /* louvred plant on each wing roof */
  [-3.2, -1.4, 1.6].forEach((z, i) => {
    box(`wing_hvac_${tag}_${i}`, 1.7, 0.5, 1.2, X, wingTop + 0.35, z, M.steel);
    box(`wing_hvac_vent_${tag}_${i}`, 1.3, 0.22, 0.07, X, wingTop + 0.35, z + 0.64, M.dark);
  });
});

/* ---- Gateway: cantilevered bridge block spanning the wings, exposed truss ---- */
const BY = wingTop + 1.55;
box('truss_deck', 2 * WX + WW - 0.2, 0.24, 6.4, 0, BY - 0.9, 0, M.steel);
box('bridge_mass', 2 * WX + WW + 0.6, 2.6, 5.8, 0, BY + 0.5, 0, M.dark);
[1, -1].forEach((sz, k) => {
  box(`bridge_glass_${k}`, 2 * WX + WW - 0.2, 1.9, 0.12, 0, BY + 0.5, sz * (5.8 / 2 + 0.02), M.glass);
  for (let j = -5; j <= 5; j++)
    box(`bridge_mullion_${k}_${j + 5}`, 0.12, 2.4, 0.1, j * 1.02, BY + 0.5, sz * (5.8 / 2 + 0.06), M.steel);
});
[1, -1].forEach((sx, k) =>
  box(`bridge_end_${k}`, 0.14, 2.0, 5.2, sx * (WX + WW / 2 + 0.23), BY + 0.5, 0, M.glass));
box('bridge_cap', 2 * WX + WW + 0.6, 0.3, 6.1, 0, BY + 1.95, 0, M.steel);
box('bridge_redline', 2 * WX + WW + 0.6, 0.1, 6.14, 0, BY + 1.74, 0, M.red);
box('bridge_underbelly', 2 * WX + WW + 0.4, 0.2, 5.4, 0, BY - 0.85, 0, M.dark);
/* diagonal truss members under the span */
const tLen = Math.hypot(1.5, 1.9), tA = Math.atan2(1.5, 1.9);
[-3, -1.5, 0, 1.5, 3].forEach((x, i) => [1, -1].forEach((sz, k) =>
  [1, -1].forEach((sx, d) =>
    box(`truss_${i}_${k}_${d}`, 0.14, tLen, 0.14, x + sx * 0.75, BY - 1.85, sz * 3.1, M.steel, [0, 0, sx * tA]))));
[-3.75, -1.25, 1.25, 3.75].forEach((x, i) => [1, -1].forEach((sz, k) =>
  box(`truss_post_${i}_${k}`, 0.16, 1.9, 0.16, x, BY - 1.85, sz * 3.1, M.steel)));
box('truss_chord_lower', 2 * WX + WW - 0.6, 0.16, 6.3, 0, BY - 2.85, 0, M.steel);
/* gateway portal beneath */
box('portal_beam', 2 * WX - WW, 0.36, 3.2, 0, 2.4, 0, M.red);
[1, -1].forEach((sx, k) =>
  box(`portal_pier_${k}`, 0.5, 2.2, 1.2, sx * 1.6, 1.25, 0, M.dark));
box('lobby_pod', 3.2, 2.0, 3.0, 0, 1.24, -2.6, M.glass);
box('lobby_pod_frame', 3.34, 0.16, 3.14, 0, 2.28, -2.6, M.steel);
box('lobby_pod_base', 3.4, 0.2, 3.2, 0, 0.34, -2.6, M.dark);

/* ---- Refinery plant on the plaza: tanks, columns, piping ---- */
[[-0.05, 3.9, 0.95, 2.3], [1.35, 4.6, 0.62, 1.6]].forEach(([x, z, r, hh], i) => {
  cyl(`tank_${i}`, r, r, hh, 14, x, 0.24 + hh / 2, z, M.steel);
  cyl(`tank_top_${i}`, r * 1.06, r * 1.06, 0.14, 14, x, 0.24 + hh, z, M.dark);
  cyl(`tank_band_${i}`, r * 1.03, r * 1.03, 0.1, 14, x, 0.24 + hh * 0.55, z, M.red);
  cyl(`tank_base_${i}`, r * 1.12, r * 1.12, 0.16, 14, x, 0.3, z, M.dark);
});
cyl('frac_column', 0.42, 0.46, 4.6, 12, -1.45, 2.54, 4.3, M.steel);
[1.4, 2.6, 3.8].forEach((y, i) =>
  cyl(`frac_ring_${i}`, 0.5, 0.5, 0.12, 12, -1.45, y, 4.3, M.red));
cyl('frac_cap', 0.34, 0.44, 0.5, 12, -1.45, 5.05, 4.3, M.dark);
/* pipe runs linking tanks to the wings */
[[-2.6, 4.3, 2.4], [-2.6, 3.5, 1.1]].forEach(([x, z, y], i) => {
  cyl(`pipe_run_${i}`, 0.13, 0.13, 3.4, 10, x - 0.9, y, z, M.steel, [0, 0, Math.PI / 2]);
  cyl(`pipe_elbow_${i}`, 0.15, 0.15, 0.9, 10, x - 2.6, y - 0.45, z, M.steel);
});
[[2.4, 4.5], [2.4, 2.6]].forEach(([x, z], i) =>
  cyl(`pipe_riser_${i}`, 0.12, 0.12, 2.6, 10, x, 1.54, z, M.steel));
cyl('pipe_bridge', 0.12, 0.12, 2.2, 10, 2.4, 2.8, 3.55, M.steel, [Math.PI / 2, 0, 0]);
[[-1.3, -3.2], [1.3, -3.2]].forEach(([x, z], i) => {
  cyl(`drum_${i}`, 0.34, 0.34, 1.5, 10, x, 0.99, z, M.steel, [Math.PI / 2, 0, 0]);
  box(`drum_saddle_${i}`, 0.5, 0.5, 0.3, x, 0.49, z, M.dark);
});

/* ---- Hook: flare stack rising past the crown, glowing tip ---- */
const FX = 0, FZ = -4.75, FTOP = 15.0;
box('flare_base', 1.5, 0.44, 1.5, FX, 0.4, FZ, M.dark);
box('flare_base_red', 1.6, 0.1, 1.6, FX, 0.64, FZ, M.red);
[0, 1, 2, 3].forEach((i) => {
  const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
  box(`flare_leg_${i}`, 0.13, 2.4, 0.13, FX + Math.cos(a) * 0.5, 1.6, FZ + Math.sin(a) * 0.5,
      M.steel, [Math.sin(a) * 0.2, 0, -Math.cos(a) * 0.2]);
});
cyl('flare_stack', 0.24, 0.34, FTOP - 0.6, 12, FX, (FTOP - 0.6) / 2 + 0.4, FZ, M.steel);
for (let i = 0; i < 7; i++)
  cyl(`flare_band_${i}`, 0.32, 0.32, 0.16, 12, FX, 1.9 + i * 1.9, FZ, M.red);
for (let i = 0; i < 6; i++) {
  const y = 2.6 + i * 2.1;
  cyl(`flare_ring_${i}`, 0.46, 0.46, 0.1, 12, FX, y, FZ, M.steel);
  [0, 1, 2, 3].forEach((k) => {
    const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
    box(`flare_rung_${i}_${k}`, 0.08, 2.1, 0.08, FX + Math.cos(a) * 0.42, y + 1.05, FZ + Math.sin(a) * 0.42, M.steel);
  });
}
cyl('flare_collar', 0.44, 0.44, 0.4, 12, FX, FTOP - 0.1, FZ, M.dark);
cyl('flare_tip', 0.36, 0.44, 0.7, 12, FX, FTOP + 0.45, FZ, M.steel);
cyl('flare_flame', 0.3, 0.1, 1.2, 10, FX, FTOP + 1.3, FZ, M.glow);
cyl('flare_flame_core', 0.16, 0.04, 1.7, 8, FX, FTOP + 1.6, FZ, M.glow);
[0, 1, 2].forEach((i) => {
  const a = (i / 3) * Math.PI * 2;
  cyl(`flare_pilot_${i}`, 0.06, 0.06, 0.4, 6, FX + Math.cos(a) * 0.42, FTOP + 0.5, FZ + Math.sin(a) * 0.42, M.glow);
});

/* ---- Crown-level beacons on the bridge roof ---- */
[[-3.4, 2.2], [3.4, 2.2], [-3.4, -2.2]].forEach(([x, z], i) =>
  box(`beacon_${i}`, 0.22, 0.22, 0.22, x, BY + 2.2, z, M.glow));
box('bridge_plant', 3.0, 0.7, 2.0, 0.4, BY + 2.45, -1.4, M.steel);
box('bridge_plant_vent', 2.4, 0.28, 0.08, 0.4, BY + 2.45, -0.36, M.dark);
cyl('bridge_mast', 0.05, 0.07, 1.8, 8, -2.6, BY + 3.0, 1.6, M.steel);
cyl('bridge_mast_tip', 0.08, 0.08, 0.16, 8, -2.6, BY + 3.98, 1.6, M.glow);

return g;

};

/* ---- intc ---- */
LM.intc = function(THREE){




/* Palette: deep blue glass + silver dominant, bright blue accent, pale trim */
const mat = (name, color, o = {}) => {
  const m = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color), roughness: 0.84, metalness: 0, flatShading: true, ...o
  });
  m.name = name; return m;
};
const M = {
  glass:  mat('blue_glass',   0x2c4f78, { roughness: 0.24, metalness: 0.32 }),
  glass2: mat('glass_dark',   0x203a5a, { roughness: 0.26, metalness: 0.3 }),
  silver: mat('silver_frame', 0xbfc5cb, { roughness: 0.58, metalness: 0.22 }),
  grey:   mat('grey_core',    0x5b6167, { roughness: 0.82 }),
  blue:   mat('intel_blue',   0x0f6fd1, { roughness: 0.55 }),
  glow:   mat('trace_glow',   0x59c7ff, {
    roughness: 0.4, emissive: new THREE.Color(0x2aa8f5), emissiveIntensity: 1.8 }),
  white:  mat('white_trim',   0xe6e9ec, { roughness: 0.7 }),
};

const g = new THREE.Group();
g.name = 'grid_tower_stage3';
const add = (mesh, name, x, y, z, rot) => {
  mesh.name = name; mesh.position.set(x, y, z);
  if (rot) mesh.rotation.set(rot[0] || 0, rot[1] || 0, rot[2] || 0);
  g.add(mesh); return mesh;
};
const box = (name, w, h, d, x, y, z, m, rot) =>
  add(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m), name, x, y, z, rot);
const cyl = (name, rt, rb, h, seg, x, y, z, m, rot) =>
  add(new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m), name, x, y, z, rot);

/* Fixed grid plot 12 x 12 m, footprint identical across all 5 stages; growth is height only */
const PW = 8.0, PD = 6.8;             // tower plan
const BH = 1.2;                        // podium
const FLOORS = 9, FH = 1.5;            // stage 3 of 5, floors added upward only
const top = BH + FLOORS * FH;

box('site_pad', 11.9, 0.16, 11.9, 0, 0.08, 0, M.grey);

/* ---- Podium: broad silver plinth, recessed glazed ground floor ---- */
box('podium_mass', 10.8, BH - 0.16, 8.8, 0, 0.16 + (BH - 0.16) / 2, 0, M.grey);
box('podium_cap', 11.1, 0.24, 9.1, 0, BH + 0.02, 0, M.silver);
box('podium_reveal', 10.9, 0.1, 8.9, 0, 0.36, 0, M.blue);
[1, -1].forEach((sz, k) =>
  box(`podium_glass_n${k}`, 9.4, BH - 0.6, 0.1, 0, 0.62, sz * 4.3, M.glass2));
[1, -1].forEach((sx, k) =>
  box(`podium_glass_e${k}`, 0.1, BH - 0.6, 7.4, sx * 5.3, 0.62, 0, M.glass2));
box('entry_portal', 3.4, BH - 0.2, 0.4, 1.6, 0.6, 4.2, M.grey);
box('entry_glass', 3.0, BH - 0.44, 0.1, 1.6, 0.58, 4.44, M.glass);
box('entry_canopy', 4.4, 0.16, 1.4, 1.6, BH + 0.1, 4.9, M.silver);
box('entry_canopy_edge', 4.4, 0.1, 0.12, 1.6, BH + 0.02, 5.54, M.blue);
box('entry_step', 5.2, 0.12, 0.9, 1.6, 0.22, 5.4, M.grey);
/* blue cube sign on the plaza */
box('sign_cube', 2.0, 1.7, 2.0, -3.7, 0.99, 4.6, M.blue);
box('sign_cube_cap', 2.1, 0.12, 2.1, -3.7, 1.9, 4.6, M.white);
box('sign_cube_face', 1.3, 0.55, 0.06, -3.7, 1.0, 5.63, M.white);
box('sign_cube_face_e', 0.06, 0.55, 1.3, -2.73, 1.0, 4.6, M.white);
box('sign_cube_base', 2.2, 0.18, 2.2, -3.7, 0.23, 4.6, M.grey);

/* ---- Tower: boxy mass, dense silver grid curtain wall ---- */
box('tower_core', PW - 0.6, FLOORS * FH, PD - 0.6, 0, BH + (FLOORS * FH) / 2, 0, M.grey);
for (let i = 0; i < FLOORS; i++) {
  const y = BH + i * FH;
  [1, -1].forEach((sz, k) => {
    box(`glass_n${k}_${i}`, PW, FH - 0.26, 0.14, 0, y + FH / 2 + 0.07, sz * (PD / 2), M.glass);
    box(`spandrel_n${k}_${i}`, PW + 0.06, 0.26, 0.19, 0, y + 0.13, sz * (PD / 2), M.silver);
  });
  [1, -1].forEach((sx, k) => {
    box(`glass_e${k}_${i}`, 0.14, FH - 0.26, PD, sx * (PW / 2), y + FH / 2 + 0.07, 0, M.glass);
    box(`spandrel_e${k}_${i}`, 0.19, 0.26, PD + 0.06, sx * (PW / 2), y + 0.13, 0, M.silver);
  });
}
/* dense vertical mullion grid */
for (let i = -8; i <= 8; i++) {
  [1, -1].forEach((sz, k) =>
    box(`mullion_n${k}_${i + 8}`, 0.07, FLOORS * FH, 0.16, i * 0.47, BH + (FLOORS * FH) / 2, sz * (PD / 2 + 0.01), M.silver));
}
for (let i = -7; i <= 7; i++) {
  [1, -1].forEach((sx, k) =>
    box(`mullion_e${k}_${i + 7}`, 0.16, FLOORS * FH, 0.07, sx * (PW / 2 + 0.01), BH + (FLOORS * FH) / 2, i * 0.45, M.silver));
}
/* corner columns, slightly proud */
[[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([sx, sz], i) =>
  box(`corner_col_${i}`, 0.34, FLOORS * FH + 0.2, 0.34,
      sx * (PW / 2 + 0.06), BH + (FLOORS * FH) / 2, sz * (PD / 2 + 0.06), M.silver));

/* ---- Hook: glowing circuit traces, denser toward the crown ---- */
function trace(id, x1, y1, x2, y2, z, sz) {
  /* orthogonal run: horizontal leg then vertical leg, with a node at the corner */
  box(`trace_${id}_h`, Math.abs(x2 - x1) + 0.08, 0.08, 0.1, (x1 + x2) / 2, y1, z, M.glow);
  box(`trace_${id}_v`, 0.08, Math.abs(y2 - y1) + 0.08, 0.1, x2, (y1 + y2) / 2, z, M.glow);
  box(`trace_${id}_node`, 0.2, 0.2, 0.12, x2, y1, z, M.glow);
  box(`trace_${id}_pad`, 0.26, 0.26, 0.12, x1, y1, z, M.blue);
}
const runs = [
  /* [x1, y1, x2, y2] in tower-local coords, y measured from podium top */
  [-3.3, 1.1, -1.9, 3.0], [2.9, 1.9, 1.4, 3.6],
  [-3.3, 4.6, -0.7, 6.2], [3.3, 5.0, 0.9, 6.6],
  [-2.5, 7.4, -0.3, 8.6], [2.9, 7.7, 0.5, 9.0], [-3.3, 8.2, -2.2, 9.6],
  [-1.7, 9.8, 0.6, 10.7], [3.1, 9.9, 1.5, 11.0], [-3.3, 10.4, -2.4, 11.4],
  [-2.9, 11.6, -0.9, 12.3], [2.7, 11.5, 0.7, 12.4], [1.9, 12.6, 3.2, 13.0],
  [-3.2, 12.8, -1.4, 13.2], [-0.4, 12.9, 1.0, 13.3],
];
runs.forEach(([x1, y1, x2, y2], i) => {
  trace(`n${i}`, x1, BH + y1, x2, BH + y2, PD / 2 + 0.13, 1);
  trace(`s${i}`, -x1, BH + y1, -x2, BH + y2, -PD / 2 - 0.13, -1);
});
/* side-face traces, vertical runs with tap nodes */
[[-2.4, 2.0, 6.4], [0.4, 4.4, 9.2], [2.3, 7.0, 12.4], [-1.2, 9.4, 13.0]].forEach(([z, y1, y2], i) => {
  [1, -1].forEach((sx, k) => {
    box(`side_trace_${i}_${k}`, 0.1, y2 - y1, 0.08, sx * (PW / 2 + 0.13), BH + (y1 + y2) / 2, z, M.glow);
    box(`side_node_${i}_${k}`, 0.12, 0.2, 0.2, sx * (PW / 2 + 0.13), BH + y2, z, M.glow);
    box(`side_pad_${i}_${k}`, 0.12, 0.26, 0.26, sx * (PW / 2 + 0.13), BH + y1, z, M.blue);
  });
});
/* die-pad cluster just under the crown, the densest zone */
for (let r = 0; r < 3; r++) {
  for (let c = -3; c <= 3; c++) {
    [1, -1].forEach((sz, k) =>
      box(`die_pad_${r}_${c + 3}_${k}`, 0.28, 0.1, 0.11, c * 0.92, top - 0.5 - r * 0.42, sz * (PD / 2 + 0.13), M.glow));
  }
}

/* ---- Crown: silver collar, blue band, mechanical cap ---- */
box('crown_collar', PW + 0.5, 0.6, PD + 0.5, 0, top + 0.3, 0, M.silver);
box('crown_band', PW + 0.56, 0.14, PD + 0.56, 0, top + 0.66, 0, M.blue);
box('crown_glowline', PW + 0.54, 0.07, PD + 0.54, 0, top + 0.02, 0, M.glow);
box('crown_cap', PW + 0.2, 0.16, PD + 0.2, 0, top + 0.82, 0, M.grey);
box('mech_house', 4.0, 1.2, 3.2, -0.6, top + 1.45, -0.4, M.silver);
box('mech_louvre', 3.2, 0.5, 0.08, -0.6, top + 1.45, 1.24, M.grey);
box('mech_cap', 4.2, 0.14, 3.4, -0.6, top + 2.12, -0.4, M.grey);
box('mech_glowline', 4.24, 0.07, 0.09, -0.6, top + 2.06, 1.32, M.glow);
box('stair_head', 1.6, 0.9, 1.4, 2.7, top + 1.3, 1.6, M.silver);
[[2.9, -1.9], [1.4, -2.4]].forEach(([x, z], i) => {
  box(`roof_unit_${i}`, 0.9, 0.45, 0.8, x, top + 1.12, z, M.white);
  cyl(`roof_vent_${i}`, 0.14, 0.14, 0.34, 8, x + 0.62, top + 1.06, z, M.grey);
});
cyl('mast', 0.05, 0.07, 2.0, 8, -3.0, top + 1.9, 2.4, M.silver);
cyl('mast_light', 0.09, 0.09, 0.16, 8, -3.0, top + 2.98, 2.4, M.glow);

return g;

};

/* ---- abbv ---- */
LM.abbv = function(THREE){




/* Palette: white + pale stone dominant, deep purple accent, clear glass */
const mat = (name, color, o = {}) => {
  const m = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color), roughness: 0.85, metalness: 0, flatShading: true, ...o
  });
  m.name = name; return m;
};
const M = {
  white:  mat('clinical_white', 0xf0f1f2, { roughness: 0.78 }),
  offwh:  mat('warm_white',     0xdcdedf, { roughness: 0.82 }),
  grey:   mat('grey_trim',      0x9aa0a6, { roughness: 0.76 }),
  glass:  mat('clear_glass',    0x6f93a8, { roughness: 0.22, metalness: 0.3 }),
  glass2: mat('glass_deep',     0x4d6d84, { roughness: 0.26, metalness: 0.28 }),
  purple: mat('deep_purple',    0x4a1d6e, { roughness: 0.55 }),
  glow:   mat('purple_glow',    0x9a5cd6, {
    roughness: 0.4, emissive: new THREE.Color(0x7b3fc4), emissiveIntensity: 1.5 }),
  glowHi: mat('purple_glow_hi', 0xc79bf0, {
    roughness: 0.38, emissive: new THREE.Color(0xa96ee8), emissiveIntensity: 2.1 }),
};

const g = new THREE.Group();
g.name = 'clinical_tower_stage3';
const add = (mesh, name, x, y, z, rot) => {
  mesh.name = name; mesh.position.set(x, y, z);
  if (rot) mesh.rotation.set(rot[0] || 0, rot[1] || 0, rot[2] || 0);
  g.add(mesh); return mesh;
};
const box = (name, w, h, d, x, y, z, m, rot) =>
  add(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m), name, x, y, z, rot);
const cyl = (name, rt, rb, h, seg, x, y, z, m, rot) =>
  add(new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m), name, x, y, z, rot);

/* Fixed grid plot 12 x 12 m, footprint identical across all 5 stages; growth is height only */
const PW = 10.4, PD = 6.4;            // tower plan (wide clinical slab)
const WD = 3.2, WX = 3.6, WZ = -4.2;              // side wings
const BH = 0.7;                        // plinth
const FLOORS = 7, FH = 1.5;            // stage 3 of 5, floors added upward only
const top = BH + FLOORS * FH;
const wTop = BH + 4 * FH;              // wings stop lower than the main slab

box('site_pad', 11.9, 0.16, 11.9, 0, 0.08, 0, M.grey);
box('lawn', 11.3, 0.06, 3.0, 0, 0.19, 4.2, M.offwh);

/* ---- Plinth ---- */
box('plinth', 11.0, BH - 0.16, 9.6, 0, 0.16 + (BH - 0.16) / 2, -0.7, M.offwh);
box('plinth_cap', 11.2, 0.14, 9.8, 0, BH + 0.02, -0.7, M.grey);

/* ---- Main slab: white spandrel bands with continuous ribbon glazing ---- */
box('slab_core', PW - 0.6, FLOORS * FH, PD - 0.6, 0, BH + (FLOORS * FH) / 2, 0, M.offwh);
for (let i = 0; i < FLOORS; i++) {
  const y = BH + i * FH;
  [1, -1].forEach((sz, k) => {
    box(`ribbon_n${k}_${i}`, PW - 0.3, FH - 0.56, 0.12, 0, y + FH / 2 + 0.14, sz * (PD / 2), M.glass);
    box(`band_n${k}_${i}`, PW, 0.56, 0.2, 0, y + 0.28, sz * (PD / 2), M.white);
  });
  [1, -1].forEach((sx, k) => {
    box(`ribbon_e${k}_${i}`, 0.12, FH - 0.56, PD - 0.3, sx * (PW / 2), y + FH / 2 + 0.14, 0, M.glass);
    box(`band_e${k}_${i}`, 0.2, 0.56, PD, sx * (PW / 2), y + 0.28, 0, M.white);
  });
}
for (let i = -7; i <= 7; i++) {
  [1, -1].forEach((sz, k) =>
    box(`mullion_n${k}_${i + 7}`, 0.07, FLOORS * FH, 0.15, i * 0.68, BH + (FLOORS * FH) / 2, sz * (PD / 2 + 0.01), M.grey));
}
[[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([sx, sz], i) =>
  box(`corner_pier_${i}`, 0.4, FLOORS * FH + 0.2, 0.4,
      sx * (PW / 2 + 0.05), BH + (FLOORS * FH) / 2, sz * (PD / 2 + 0.05), M.white));

/* ---- Side wings: lower, same white banding, stepped silhouette ---- */
[1, -1].forEach((sx, w) => {
  const X = sx * WX, tag = sx > 0 ? 'e' : 'w';
  box(`wing_mass_${tag}`, 3.0, 4 * FH, WD, X, BH + (4 * FH) / 2, WZ, M.offwh);
  for (let i = 0; i < 4; i++) {
    const y = BH + i * FH;
    box(`wing_band_${tag}_${i}`, 3.1, 0.5, WD + 0.1, X, y + 0.25, WZ, M.white);
    box(`wing_glass_${tag}_${i}`, 2.6, FH - 0.6, 0.1, X, y + FH / 2 + 0.14, WZ - WD / 2 - 0.06, M.glass);
    box(`wing_glass_side_${tag}_${i}`, 0.1, FH - 0.6, WD - 0.5, X + sx * 1.56, y + FH / 2 + 0.14, WZ, M.glass);
  }
  box(`wing_parapet_${tag}`, 3.24, 0.34, WD + 0.24, X, wTop + 0.12, WZ, M.white);
  box(`wing_cap_${tag}`, 3.3, 0.1, WD + 0.3, X, wTop + 0.33, WZ, M.grey);
  box(`wing_roof_${tag}`, 2.9, 0.1, WD - 0.1, X, wTop + 0.02, WZ, M.grey);
  [-0.8, 0.8].forEach((dz, i) =>
    box(`wing_hvac_${tag}_${i}`, 1.3, 0.42, 0.9, X, wTop + 0.28, WZ + dz, M.grey));
});

/* ---- Glazed entrance rotunda, as on the real HQ ---- */
const RZ = 3.9;
cyl('rotunda_glass', 1.85, 1.85, BH + 3 * FH - 0.5, 20, 0, (BH + 3 * FH - 0.5) / 2, RZ, M.glass2);
for (let i = 0; i < 12; i++) {
  const a = (i / 12) * Math.PI * 2;
  box(`rotunda_mullion_${i}`, 0.1, BH + 3 * FH - 0.5, 0.1,
      Math.cos(a) * 1.9, (BH + 3 * FH - 0.5) / 2, RZ + Math.sin(a) * 1.9, M.white, [0, -a, 0]);
}
[1, 2].forEach((i) =>
  cyl(`rotunda_ring_${i}`, 1.95, 1.95, 0.16, 20, 0, BH + i * FH, RZ, M.white));
cyl('rotunda_cap', 2.05, 1.95, 0.3, 20, 0, BH + 3 * FH - 0.35, RZ, M.white);
cyl('rotunda_crown', 1.7, 2.0, 0.4, 20, 0, BH + 3 * FH - 0.02, RZ, M.offwh);
cyl('rotunda_glowring', 2.0, 2.0, 0.08, 20, 0, BH + 3 * FH - 0.52, RZ, M.glow);
box('entry_doors', 2.0, 1.5, 0.14, 0, 0.75, RZ + 1.82, M.glass);
box('entry_mullion', 0.1, 1.5, 0.16, 0, 0.75, RZ + 1.88, M.white);
box('entry_step', 3.4, 0.12, 0.8, 0, 0.22, 5.5, M.offwh);
/* plaza sign */
box('sign_plinth', 2.4, 0.5, 0.4, -3.9, 0.44, 5.2, M.white);
box('sign_face', 1.9, 0.3, 0.07, -3.9, 0.5, 5.42, M.purple);
box('sign_base', 2.6, 0.16, 0.6, -3.9, 0.24, 5.2, M.grey);

/* ---- Hook: purple accent stripe climbing the facade, brightening upward ---- */
const stripeX = 2.55;
for (let i = 0; i < FLOORS; i++) {
  const y = BH + i * FH + FH / 2;
  const m = i < 2 ? M.purple : i < 5 ? M.glow : M.glowHi;
  box(`stripe_n_${i}`, 0.85, FH, 0.11, stripeX, y, PD / 2 + 0.11, m);
  box(`stripe_s_${i}`, 0.85, FH, 0.11, -stripeX, y, -PD / 2 - 0.11, m);
  box(`stripe_e_${i}`, 0.11, FH, 0.85, PW / 2 + 0.11, y, -1.2, m);
  box(`stripe_w_${i}`, 0.11, FH, 0.85, -PW / 2 - 0.11, y, 1.2, m);
}
/* the stripe wraps the parapet and turns onto the roof edge */
box('stripe_wrap_n', 0.95, 0.6, 0.13, stripeX, top + 0.3, PD / 2 + 0.12, M.glowHi);
box('stripe_wrap_s', 0.95, 0.6, 0.13, -stripeX, top + 0.3, -PD / 2 - 0.12, M.glowHi);
box('stripe_wrap_e', 0.13, 0.6, 0.95, PW / 2 + 0.12, top + 0.3, -1.2, M.glowHi);
box('stripe_wrap_w', 0.13, 0.6, 0.95, -PW / 2 - 0.12, top + 0.3, 1.2, M.glowHi);
/* narrow companion pinstripes reading as a gradient beside the main stripe */
[[0.62, 0.22], [-0.62, 0.22]].forEach(([dx, wdt], k) => {
  for (let i = 2; i < FLOORS; i++) {
    const y = BH + i * FH + FH / 2;
    const m = i < 5 ? M.glow : M.glowHi;
    box(`pinstripe_n_${k}_${i}`, wdt, FH, 0.1, stripeX + dx, y, PD / 2 + 0.1, m);
    box(`pinstripe_s_${k}_${i}`, wdt, FH, 0.1, -stripeX - dx, y, -PD / 2 - 0.1, m);
  }
});

/* ---- Crown: deep white parapet, mechanical penthouse ---- */
box('parapet', PW + 0.5, 0.9, PD + 0.5, 0, top + 0.45, 0, M.white);
box('parapet_cap', PW + 0.6, 0.14, PD + 0.6, 0, top + 0.97, 0, M.grey);
box('parapet_shadow', PW + 0.4, 0.1, PD + 0.4, 0, top + 0.02, 0, M.grey);
box('roof_deck', PW - 0.4, 0.12, PD - 0.4, 0, top + 0.06, 0, M.grey);
box('penthouse', 4.4, 1.1, 3.4, -1.2, top + 0.65, -0.3, M.white);
box('penthouse_cap', 4.6, 0.14, 3.6, -1.2, top + 1.27, -0.3, M.grey);
box('penthouse_louvre', 3.6, 0.44, 0.08, -1.2, top + 0.65, 1.44, M.grey);
box('penthouse_stripe', 0.5, 1.1, 0.09, 0.6, top + 0.65, 1.44, M.glowHi);
box('stair_head', 1.8, 0.85, 1.6, 3.2, top + 0.52, 1.2, M.white);
[[3.4, -1.6], [1.6, -2.0]].forEach(([x, z], i) => {
  box(`roof_unit_${i}`, 1.0, 0.42, 0.85, x, top + 0.31, z, M.grey);
  cyl(`roof_vent_${i}`, 0.14, 0.14, 0.32, 8, x + 0.68, top + 0.26, z, M.grey);
});
cyl('mast', 0.05, 0.07, 1.9, 8, -4.4, top + 1.05, 1.9, M.white);
cyl('mast_light', 0.09, 0.09, 0.16, 8, -4.4, top + 2.08, 1.9, M.glowHi);

return g;

};

/* ---- aapl ---- */
LM.aapl = function(THREE){




/* Palette: white + silver glass dominant, space grey structure, green courtyard accent */
const mat = (name, color, o = {}) => {
  const m = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color), roughness: 0.8, metalness: 0, flatShading: true, ...o
  });
  m.name = name; return m;
};
const M = {
  white:  mat('white_shell',  0xf4f6f7, { roughness: 0.65 }),
  silver: mat('silver_trim',  0xbfc6cc, { roughness: 0.5, metalness: 0.3 }),
  grey:   mat('space_grey',   0x4e555d, { roughness: 0.6, metalness: 0.25 }),
  glass:  mat('glass_cool',   0x7493a4, { roughness: 0.2, metalness: 0.35 }),
  green:  mat('lawn_green',   0x6aa84f, { roughness: 0.95 }),
  water:  mat('water_teal',   0x3f92a8, { roughness: 0.25, metalness: 0.2 }),
  trunk:  mat('trunk_brown',  0x6d5240, { roughness: 0.95 }),
  neon:   mat('neon_white', 0xffffff, {
    roughness: 0.35, emissive: new THREE.Color(0xffffff), emissiveIntensity: 2.4, flatShading: false }),
  halo:   mat('neon_halo', 0xffffff, {
    roughness: 0.5, emissive: new THREE.Color(0xeaf6ff), emissiveIntensity: 1.2,
    transparent: true, opacity: 0.16, depthWrite: false, flatShading: false }),
  glow:   mat('ticker_glow',  0xdff6ff, {
    roughness: 0.4, emissive: new THREE.Color(0xbfeeff), emissiveIntensity: 1.1 }),
  up:     mat('ticker_up',    0x7ef0a4, {
    roughness: 0.4, emissive: new THREE.Color(0x4fdc86), emissiveIntensity: 1.0 }),
};

const campus = new THREE.Group();
campus.name = 'ring_campus_stage3';
const add = (mesh, name, x, y, z, rot) => {
  mesh.name = name; mesh.position.set(x, y, z);
  if (rot) mesh.rotation.set(rot[0] || 0, rot[1] || 0, rot[2] || 0);
  campus.add(mesh); return mesh;
};
const box = (name, w, h, d, x, y, z, m, rot) =>
  add(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m), name, x, y, z, rot);
const cyl = (name, rt, rb, h, seg, x, y, z, m, rot, open) =>
  add(new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg, 1, !!open), m), name, x, y, z, rot);
/* faceted annular slab, the ring's floor plates, plinth and roof canopy */
function ring(name, rOut, rIn, thick, seg, y, m) {
  const s = new THREE.Shape();
  s.absarc(0, 0, rOut, 0, Math.PI * 2, false);
  const hole = new THREE.Path();
  hole.absarc(0, 0, rIn, 0, Math.PI * 2, true);
  s.holes.push(hole);
  const g = new THREE.ExtrudeGeometry(s, { depth: thick, bevelEnabled: false, curveSegments: seg });
  g.rotateX(-Math.PI / 2);
  return add(new THREE.Mesh(g, m), name, 0, y, 0);
}

/* Fixed grid plot 12 x 12 m, footprint identical across all 5 stages; growth adds height only */
const SEG = 32, RO = 5.75, RI = 4.5;
const FLOORS = 4, FH = 0.52;
const top = 0.3 + FLOORS * FH;

ring('plinth', RO + 0.15, RI - 0.15, 0.3, SEG, 0, M.grey);
ring('plinth_reveal', RO + 0.02, RI - 0.02, 0.08, SEG, 0.3, M.white);

for (let i = 0; i < FLOORS; i++) {
  const y0 = 0.3 + i * FH;
  ring(`floor_slab_${i}`, RO + 0.07, RI - 0.07, 0.1, SEG, y0, M.white);
  cyl(`curtain_outer_${i}`, RO - 0.03, RO - 0.03, FH - 0.1, SEG,
      0, y0 + 0.1 + (FH - 0.1) / 2, 0, M.glass, null, true);
  cyl(`curtain_inner_${i}`, RI + 0.03, RI + 0.03, FH - 0.1, SEG,
      0, y0 + 0.1 + (FH - 0.1) / 2, 0, M.glass, null, true);
  for (let j = 0; j < SEG; j += 2) {
    const a = (j / SEG) * Math.PI * 2;
    box(`mullion_out_${i}_${j}`, 0.06, FH - 0.12, 0.08,
        Math.sin(a) * RO, y0 + 0.1 + (FH - 0.1) / 2, Math.cos(a) * RO, M.silver, [0, a, 0]);
    box(`mullion_in_${i}_${j}`, 0.05, FH - 0.12, 0.07,
        Math.sin(a) * RI, y0 + 0.1 + (FH - 0.1) / 2, Math.cos(a) * RI, M.silver, [0, a, 0]);
  }
}

/* Roof: deep white canopy overhang + inset grey solar deck */
ring('roof_canopy', RO + 0.18, RI - 0.3, 0.16, SEG, top, M.white);
ring('canopy_fascia', RO + 0.2, RO + 0.1, 0.26, SEG, top - 0.07, M.white);
ring('solar_deck', RO + 0.06, RI - 0.14, 0.05, SEG, top + 0.16, M.grey);
for (let j = 0; j < SEG; j += 1) {
  const a = ((j + 0.5) / SEG) * Math.PI * 2;
  box(`solar_seam_${j}`, 0.05, 0.03, RO - RI + 0.28,
      Math.sin(a) * (RO + RI) / 2, top + 0.2, Math.cos(a) * (RO + RI) / 2, M.silver, [0, a, 0]);
}
/* sparse rooftop service, tucked on the inner edge */
for (let j = 0; j < 4; j++) {
  const a = (j / 4) * Math.PI * 2 + 0.4, r = RI + 0.35;
  box(`service_pod_${j}`, 0.6, 0.24, 0.4, Math.sin(a) * r, top + 0.32, Math.cos(a) * r, M.white, [0, a, 0]);
  cyl(`vent_${j}`, 0.09, 0.09, 0.2, 8, Math.sin(a + 0.2) * r, top + 0.3, Math.cos(a + 0.2) * r, M.grey);
}

/* Ground-floor colonnade under the ring, reading as a lifted glass band */
for (let j = 0; j < SEG; j += 4) {
  const a = (j / SEG) * Math.PI * 2, r = (RO + RI) / 2;
  cyl(`colonnade_${j}`, 0.08, 0.08, 0.3, 8, Math.sin(a) * r, 0.45, Math.cos(a) * r, M.silver);
}
/* Main entrance portal: white frame recessed into the outer glass */
box('entry_reveal', 1.6, 0.46, 0.24, 0, 0.56, RO - 0.14, M.grey);
box('entry_frame', 1.44, 0.4, 0.1, 0, 0.55, RO - 0.02, M.white);
box('entry_glass', 1.2, 0.32, 0.06, 0, 0.54, RO - 0.07, M.glass);
box('entry_canopy', 2.0, 0.09, 0.6, 0, 0.86, RO - 0.1, M.white);
box('entry_walk', 1.6, 0.06, 0.5, 0, 0.33, RO - 0.05, M.white);

/* Courtyard: lawn, pond, low-poly trees */
cyl('courtyard_lawn', RI - 0.04, RI - 0.04, 0.22, SEG, 0, 0.11, 0, M.green);
ring('courtyard_path', RI - 0.55, RI - 0.8, 0.06, SEG, 0.22, M.white);
cyl('courtyard_pond', 1.15, 1.15, 0.12, 16, -0.9, 0.24, 0.7, M.water);
add(new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.09, 6, 20), M.white),
    'pond_rim', -0.9, 0.28, 0.7, [Math.PI / 2, 0, 0]);
cyl('plaza_disc', 0.8, 0.8, 0.06, 12, 1.9, 0.24, -1.3, M.white);
const trees = [[3.1, 0.9], [2.0, 2.7], [-2.4, 2.5], [-3.3, -0.9], [-1.4, -3.0], [1.5, -2.9], [3.4, -1.9], [0.3, 3.5], [-3.6, 1.2], [2.9, 2.1], [-0.6, -1.6], [0.9, 1.4], [-2.0, -2.0], [3.7, -0.4], [-1.0, 3.2], [2.3, -1.0]];
trees.forEach(([x, z], i) => {
  const h = 0.9 + (i % 3) * 0.22;
  cyl(`tree_trunk_${i}`, 0.07, 0.09, h * 0.5, 6, x, 0.22 + h * 0.25, z, M.trunk);
  const c = new THREE.Mesh(new THREE.IcosahedronGeometry(0.42 + (i % 2) * 0.08, 0), M.green);
  add(c, `tree_canopy_${i}`, x, 0.22 + h * 0.5 + 0.3, z, [0, i * 0.7, 0]);
});

/* Floating neon "AAPL" sign above the park, white tube glyphs */
const TY = top + 2.9;
const ticker = new THREE.Group(); ticker.name = 'aapl_neon';
ticker.rotation.y = Math.atan2(1, 1.15);
const TUBE = 0.075, HALO = 0.16;
const straight = (name, x1, y1, x2, y2) => {
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
  [[TUBE, M.neon, ''], [HALO, M.halo, '_halo']].forEach(([r, m, sfx]) => {
    const g = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 10), m);
    g.name = name + sfx;
    g.position.set((x1 + x2) / 2, TY + (y1 + y2) / 2, 0);
    g.rotation.z = Math.atan2(dy, dx) - Math.PI / 2;
    if (sfx) { g.castShadow = false; g.receiveShadow = false; }
    ticker.add(g);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 6), m);
    cap.name = name + sfx + '_cap';
    cap.position.set(x2, TY + y2, 0);
    ticker.add(cap);
  });
};
const arc = (name, cx, cy, rad, rot, sweep) => {
  [[TUBE, M.neon, ''], [HALO, M.halo, '_halo']].forEach(([r, m, sfx]) => {
    const g = new THREE.Mesh(new THREE.TorusGeometry(rad, r, 8, 20, sweep), m);
    g.name = name + sfx;
    g.position.set(cx, TY + cy, 0);
    g.rotation.z = rot;
    ticker.add(g);
  });
};

const letter = (ch, ox) => {
  if (ch === 'A') {
    straight(`neon_A${ox}_l`, ox - 0.42, -0.65, ox - 0.13, 0.62);
    straight(`neon_A${ox}_r`, ox + 0.42, -0.65, ox + 0.13, 0.62);
    straight(`neon_A${ox}_top`, ox - 0.13, 0.62, ox + 0.13, 0.62);
    straight(`neon_A${ox}_bar`, ox - 0.29, -0.06, ox + 0.29, -0.06);
  } else if (ch === 'P') {
    straight(`neon_P${ox}_stem`, ox - 0.33, -0.65, ox - 0.33, 0.65);
    arc(`neon_P${ox}_bowl`, ox - 0.33, 0.31, 0.34, -Math.PI / 2, Math.PI);
  } else if (ch === 'L') {
    straight(`neon_L${ox}_stem`, ox - 0.3, 0.65, ox - 0.3, -0.65);
    straight(`neon_L${ox}_base`, ox - 0.3, -0.65, ox + 0.34, -0.65);
  }
};
[['A', -1.36], ['A', -0.22], ['P', 0.82], ['L', 1.4]].forEach(([ch, ox]) => letter(ch, ox));

campus.add(ticker);

return campus;

};

/* ---- brkb ---- */
LM.brkb = function(THREE){




/* Palette: brick red + limestone dominant, muted brass accent, plain glass */
const mat = (name, color, o = {}) => {
  const m = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color), roughness: 0.88, metalness: 0, flatShading: true, ...o
  });
  m.name = name; return m;
};
const M = {
  brick: mat('brick_red',    0xa4503c, { roughness: 0.94 }),
  stone: mat('limestone',    0xd8d2c4, { roughness: 0.9 }),
  brass: mat('muted_brass',  0xb08d4f, { roughness: 0.5, metalness: 0.35 }),
  glass: mat('window_glass', 0x5c7482, { roughness: 0.3, metalness: 0.25 }),
  grey:  mat('grey_trim',    0x5a5c5e, { roughness: 0.8 }),
};

const g = new THREE.Group();
g.name = 'plain_tower_stage3';
const add = (mesh, name, x, y, z, rot) => {
  mesh.name = name; mesh.position.set(x, y, z);
  if (rot) mesh.rotation.set(rot[0] || 0, rot[1] || 0, rot[2] || 0);
  g.add(mesh); return mesh;
};
const box = (name, w, h, d, x, y, z, m, rot) =>
  add(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m), name, x, y, z, rot);
const cyl = (name, rt, rb, h, seg, x, y, z, m, rot) =>
  add(new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m), name, x, y, z, rot);

/* Fixed grid plot 12 x 12 m, footprint identical across all 5 stages; growth is height only */
const LIM = 5.95;
const PW = 7.6, PD = 6.4;          // tower plan
const BH = 3.0;                     // stone base / lobby storey
const FLOORS = 9, FH = 1.45;        // stage 3 of 5, floors added upward only
const top = BH + FLOORS * FH;

box('site_pad', 11.9, 0.14, 11.9, 0, 0.07, 0, M.grey);

/* ---- Stone base: plain, squared-off, no flourish ---- */
box('base_mass', PW + 1.0, BH - 0.14, PD + 1.0, 0, 0.14 + (BH - 0.14) / 2, 0, M.stone);
box('base_plinth', PW + 1.3, 0.3, PD + 1.3, 0, 0.29, 0, M.grey);
box('base_cornice', PW + 1.25, 0.24, PD + 1.25, 0, BH + 0.02, 0, M.stone);
/* lobby glazing: simple punched bays */
[-2.9, -1.45, 1.45, 2.9].forEach((x, i) => {
  box(`lobby_glass_${i}`, 1.15, 1.7, 0.1, x, 1.55, (PD + 1.0) / 2 + 0.02, M.glass);
  box(`lobby_mullion_${i}`, 0.08, 1.7, 0.12, x, 1.55, (PD + 1.0) / 2 + 0.05, M.stone);
});
[-1.9, 0, 1.9].forEach((z, i) => {
  box(`lobby_glass_e_${i}`, 0.1, 1.7, 1.3, (PW + 1.0) / 2 + 0.02, 1.55, z, M.glass);
  box(`lobby_glass_w_${i}`, 0.1, 1.7, 1.3, -(PW + 1.0) / 2 - 0.02, 1.55, z, M.glass);
});
/* entrance: recessed doors, flat canopy, brass plaque beside it */
box('entry_recess', 2.4, 2.2, 0.3, 0, 1.25, (PD + 1.0) / 2 - 0.1, M.grey);
box('entry_doors', 2.0, 1.9, 0.1, 0, 1.1, (PD + 1.0) / 2 + 0.04, M.glass);
box('entry_transom', 2.1, 0.3, 0.1, 0, 2.2, (PD + 1.0) / 2 + 0.04, M.glass);
box('entry_canopy', 3.0, 0.14, 0.9, 0, 2.55, (PD + 1.0) / 2 + 0.35, M.stone);
box('entry_canopy_edge', 3.0, 0.07, 0.1, 0, 2.46, (PD + 1.0) / 2 + 0.78, M.brass);
box('door_mullion', 0.1, 1.9, 0.14, 0, 1.1, (PD + 1.0) / 2 + 0.07, M.brass);
box('plaque', 0.9, 0.5, 0.06, 1.75, 1.5, (PD + 1.0) / 2 + 0.06, M.brass);
box('plaque_frame', 1.02, 0.62, 0.03, 1.75, 1.5, (PD + 1.0) / 2 + 0.04, M.grey);
[-1.9, 1.9].forEach((x, i) =>
  cyl(`entry_bollard_${i}`, 0.09, 0.11, 0.5, 8, x, 0.55, (PD + 1.0) / 2 + 0.7, M.brass));

/* ---- Tower shaft: brick piers, regular punched windows, no gestures ---- */
box('tower_mass', PW, FLOORS * FH, PD, 0, BH + (FLOORS * FH) / 2, 0, M.brick);
box('tower_spandrel_base', PW + 0.08, 0.2, PD + 0.08, 0, BH + 0.1, 0, M.stone);

const winF = new THREE.BoxGeometry(0.78, 0.92, 0.1);
const winG = new THREE.BoxGeometry(0.62, 0.78, 0.06);
function punched(id, x, y, z, ry) {
  const w = new THREE.Group(); w.name = `window_${id}`;
  const f = new THREE.Mesh(winF, M.stone); f.name = `window_frame_${id}`;
  const p = new THREE.Mesh(winG, M.glass); p.name = `window_glass_${id}`; p.position.z = 0.03;
  const s = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.08, 0.16), M.stone);
  s.name = `window_sill_${id}`; s.position.set(0, -0.5, 0.03);
  w.add(f, p, s); w.position.set(x, y, z); w.rotation.y = ry; g.add(w);
}
const colsX = [-2.85, -1.71, -0.57, 0.57, 1.71, 2.85];
const colsZ = [-2.28, -1.14, 0, 1.14, 2.28];
for (let i = 0; i < FLOORS; i++) {
  const y = BH + i * FH + FH / 2 + 0.05;
  colsX.forEach((x, j) => {
    punched(`f${i}n${j}`, x, y, PD / 2 - 0.02, 0);
    punched(`f${i}s${j}`, x, y, -PD / 2 + 0.02, Math.PI);
  });
  colsZ.forEach((z, j) => {
    punched(`f${i}e${j}`, PW / 2 - 0.02, y, z, Math.PI / 2);
    punched(`f${i}w${j}`, -PW / 2 + 0.02, y, z, -Math.PI / 2);
  });
  if (i % 3 === 2) box(`brick_course_${i}`, PW + 0.06, 0.1, PD + 0.06, 0, BH + (i + 1) * FH, 0, M.stone);
}
/* corner piers, slightly proud of the brick */
[[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([sx, sz], i) =>
  box(`corner_pier_${i}`, 0.5, FLOORS * FH, 0.5,
      sx * (PW / 2 - 0.16), BH + (FLOORS * FH) / 2, sz * (PD / 2 - 0.16), M.brick));

/* ---- Crown: flat parapet, mechanical penthouse, nothing more ---- */
box('parapet_band', PW + 0.24, 0.5, PD + 0.24, 0, top + 0.25, 0, M.stone);
box('parapet_cap', PW + 0.3, 0.1, PD + 0.3, 0, top + 0.53, 0, M.grey);
box('roof_deck', PW - 0.2, 0.1, PD - 0.2, 0, top + 0.05, 0, M.grey);
box('penthouse', 3.2, 1.1, 2.6, -0.6, top + 0.6, -0.4, M.stone);
box('penthouse_cap', 3.34, 0.12, 2.74, -0.6, top + 1.2, -0.4, M.grey);
box('penthouse_louvre', 2.4, 0.5, 0.08, -0.6, top + 0.62, 0.92, M.grey);
box('stair_head', 1.3, 0.8, 1.2, 2.3, top + 0.45, 1.4, M.stone);
[[2.9, -1.7], [1.4, -2.0]].forEach(([x, z], i) => {
  box(`roof_unit_${i}`, 0.9, 0.4, 0.7, x, top + 0.3, z, M.grey);
  cyl(`roof_vent_${i}`, 0.12, 0.12, 0.3, 8, x + 0.6, top + 0.25, z, M.grey);
});
cyl('flagpole', 0.05, 0.06, 3.0, 8, 3.9, 1.55, 3.4, M.stone);
box('flag', 0.06, 0.5, 0.9, 3.9, 2.7, 3.9, M.brick);

return g;

};

/* ---- cost ---- */
LM.cost = function(THREE){




/* Palette: warm concrete + navy dominant, red accent, pale trim */
const mat = (name, color, o = {}) => {
  const m = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color), roughness: 0.88, metalness: 0, flatShading: true, ...o
  });
  m.name = name; return m;
};
const M = {
  concrete: mat('warm_concrete', 0xbdb6ad, { roughness: 0.94 }),
  tan:      mat('tan_panel',     0x8f857a, { roughness: 0.92 }),
  navy:     mat('costco_navy',   0x1b3a68, { roughness: 0.7 }),
  red:      mat('costco_red',    0xd0202f, { roughness: 0.58 }),
  glow:     mat('sign_glow',     0xff4a4a, {
    roughness: 0.42, emissive: new THREE.Color(0xd41f2c), emissiveIntensity: 1.3 }),
  grey:     mat('grey_trim',     0x6b7076, { roughness: 0.8 }),
  white:    mat('white_trim',    0xe8e9ea, { roughness: 0.74 }),
  glass:    mat('glass',         0x53707f, { roughness: 0.26, metalness: 0.28 }),
};

const g = new THREE.Group();
g.name = 'warehouse_club_stage3';
const add = (mesh, name, x, y, z, rot) => {
  mesh.name = name; mesh.position.set(x, y, z);
  if (rot) mesh.rotation.set(rot[0] || 0, rot[1] || 0, rot[2] || 0);
  g.add(mesh); return mesh;
};
const box = (name, w, h, d, x, y, z, m, rot) =>
  add(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m), name, x, y, z, rot);
const cyl = (name, rt, rb, h, seg, x, y, z, m, rot) =>
  add(new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m), name, x, y, z, rot);

/* Fixed grid plot 12 x 12 m, footprint identical across all 5 stages; growth is height only */
const BW = 11.5, BD = 9.6, BH = 3.4;   // warehouse-club box
const TW = 5.6, TD = 4.4;               // modest office tower


box('site_pad', 11.9, 0.16, 11.9, 0, 0.08, 0, M.grey);
box('lot_stripe_pad', 11.5, 0.05, 1.0, 0, 0.19, 5.4, M.grey);

/* ---- Warehouse-club box: flat, wide, utilitarian ---- */
box('club_mass', BW, BH - 0.16, BD, 0, 0.16 + (BH - 0.16) / 2, -1.0, M.concrete);
box('club_base_course', BW + 0.1, 0.55, BD + 0.1, 0, 0.44, -1.0, M.tan);
box('club_parapet', BW + 0.3, 0.75, BD + 0.3, 0, BH + 0.2, -1.0, M.concrete);
box('club_parapet_cap', BW + 0.4, 0.14, BD + 0.4, 0, BH + 0.64, -1.0, M.grey);
box('club_navy_band', BW + 0.34, 0.34, BD + 0.34, 0, BH + 0.02, -1.0, M.navy);
box('club_roof', BW - 0.2, 0.12, BD - 0.2, 0, BH - 0.02, -1.0, M.grey);
/* tilt-up panel joints */
for (let i = -5; i <= 5; i++) {
  box(`joint_n_${i + 5}`, 0.07, BH - 0.3, 0.1, i * 1.05, 1.45, BD / 2 - 1.0 + 0.02, M.tan);
  box(`joint_s_${i + 5}`, 0.07, BH - 0.3, 0.1, i * 1.05, 1.45, -BD / 2 - 1.0 - 0.02, M.tan);
}
for (let i = -4; i <= 4; i++) {
  box(`joint_e_${i + 4}`, 0.1, BH - 0.3, 0.07, BW / 2 + 0.02, 1.7, -1.0 + i * 1.05, M.tan);
  box(`joint_w_${i + 4}`, 0.1, BH - 0.3, 0.07, -BW / 2 - 0.02, 1.7, -1.0 + i * 1.05, M.tan);
}

/* ---- Storefront: raised entry parapet, glazed vestibule, red bollards ---- */
const FZ = BD / 2 - 1.0;
box('entry_parapet', 6.4, 1.5, 0.5, 0, BH + 0.5, FZ + 0.1, M.concrete);
box('entry_parapet_cap', 6.6, 0.16, 0.6, BW * 0, BH + 1.32, FZ + 0.1, M.grey);
box('entry_parapet_navy', 6.5, 0.4, 0.56, 0, BH - 0.02, FZ + 0.1, M.navy);
box('vestibule', 5.6, 2.1, 0.5, 0, 1.25, FZ + 0.12, M.navy);
box('vestibule_glass', 5.1, 1.7, 0.12, 0, 1.15, FZ + 0.4, M.glass);
[-1.8, -0.6, 0.6, 1.8].forEach((x, i) =>
  box(`vestibule_mullion_${i}`, 0.1, 1.7, 0.14, x, 1.15, FZ + 0.44, M.white));
box('vestibule_head', 5.7, 0.18, 0.6, 0, 2.24, FZ + 0.2, M.white);
box('canopy', 8.4, 0.16, 1.5, 0, 2.5, FZ + 0.9, M.concrete);
box('canopy_edge', 8.4, 0.24, 0.14, 0, 2.42, FZ + 1.6, M.navy);
box('canopy_redline', 8.4, 0.08, 0.16, 0, 2.24, FZ + 1.61, M.red);
[-3.4, -2.4, 2.4, 3.4].forEach((x, i) =>
  box(`canopy_post_${i}`, 0.16, 2.3, 0.16, x, 1.25, FZ + 1.5, M.grey));
[-4.6, -4.0, 4.0, 4.6].forEach((x, i) =>
  cyl(`bollard_${i}`, 0.11, 0.13, 0.72, 8, x, 0.55, FZ + 0.9, M.red));
/* cart bays and trolley rows flanking the entry */
[-1, 1].forEach((sx, i) => {
  box(`cart_bay_${i}`, 2.0, 0.14, 1.2, sx * 4.4, 0.24, 5.3, M.grey);
  box(`cart_rail_${i}`, 2.0, 0.5, 0.08, sx * 4.4, 0.5, 5.86, M.grey);
  [0, 1, 2].forEach((k) =>
    box(`cart_${i}_${k}`, 0.42, 0.5, 0.9, sx * 4.4 + (k - 1) * 0.5, 0.52, 5.3, M.white));
});
/* tyre-bay roll doors on the west return */
[-2.6, -1.2].forEach((z, i) => {
  box(`roll_door_${i}`, 0.12, 1.9, 1.2, -BW / 2 - 0.04, 1.15, z, M.grey);
  box(`roll_door_frame_${i}`, 0.08, 2.1, 1.4, -BW / 2 - 0.09, 1.2, z, M.navy);
});
/* loading dock at the rear */
[-3.2, -1.6, 0].forEach((x, i) => {
  box(`dock_door_${i}`, 1.3, 1.7, 0.12, x, 1.05, -BD / 2 - 1.0 - 0.06, M.grey);
  [-0.55, 0.55].forEach((dx, k) =>
    box(`dock_bumper_${i}_${k}`, 0.14, 0.24, 0.14, x + dx, 0.38, -BD / 2 - 1.0 - 0.12, M.navy));
});
box('dock_apron', 6.2, 0.1, 0.6, -1.6, 0.22, -5.6, M.grey);

/* ---- Low mechanical penthouse instead of a tower: the mass stays flat ---- */
const tTop = BH + 1.5;
box('mech_block', 5.6, 1.4, 4.2, -2.2, BH + 0.72, -2.0, M.concrete);
box('mech_band', 5.72, 0.34, 4.32, -2.2, BH + 0.22, -2.0, M.tan);
box('mech_cap', 5.8, 0.14, 4.4, -2.2, BH + 1.48, -2.0, M.grey);
box('mech_louvre_n', 4.4, 0.5, 0.08, -2.2, BH + 0.78, -2.0 + 2.14, M.grey);
box('mech_louvre_e', 0.08, 0.5, 3.2, -2.2 + 2.84, BH + 0.78, -2.0, M.grey);
[[1.9, 1.4], [3.6, 1.4], [3.6, -1.6]].forEach(([x, z], i) => {
  box(`roof_hvac_${i}`, 1.5, 0.5, 1.1, x, BH + 0.27, z, M.white);
  box(`roof_hvac_vent_${i}`, 1.2, 0.2, 0.06, x, BH + 0.27, z + 0.58, M.grey);
});
[[-4.6, 2.4], [-4.6, -3.2], [1.2, -4.0]].forEach(([x, z], i) =>
  cyl(`roof_vent_${i}`, 0.2, 0.2, 0.44, 10, x, BH + 0.24, z, M.grey));
[-3.0, 0.4].forEach((x, i) =>
  box(`skylight_${i}`, 2.6, 0.1, 1.2, x, BH + 0.06, 2.4, M.glass));
box('stair_head', 1.6, 0.8, 1.4, 4.4, BH + 0.42, -3.6, M.concrete);
cyl('roof_mast', 0.05, 0.06, 1.5, 8, -5.0, BH + 0.78, -1.0, M.white);

/* ---- Red awning bay at the west end, as on the reference ---- */
box('awning_deck', 3.4, 0.14, 2.6, -4.0, 2.6, 3.0, M.red);
box('awning_edge', 3.5, 0.3, 0.16, -4.0, 2.5, 4.22, M.red);
[-5.3, -2.7].forEach((x, i) =>
  box(`awning_post_${i}`, 0.16, 2.5, 0.16, x, 1.3, 4.1, M.grey));
box('awning_wall', 3.4, 2.2, 0.14, -4.0, 1.3, 1.78, M.tan);

/* ---- Hook: bold rooftop wordmark, plain and utilitarian ---- */
const SY = BH + 1.35, SZ = FZ + 0.16;
box('sign_backer', 7.0, 1.5, 0.16, 0, SY + 0.1, SZ, M.white);
box('sign_backer_frame', 7.2, 1.7, 0.1, 0, SY + 0.1, SZ - 0.06, M.grey);
/* wordmark: six red letter blocks over a navy sub-band */
[-1.63, -0.54, 0.54, 1.63].forEach((x, i) => {
  box(`wordmark_${i}`, 0.86, 0.8, 0.12, x, SY + 0.32, SZ + 0.1, M.glow);
  box(`wordmark_shadow_${i}`, 0.94, 0.88, 0.06, x, SY + 0.29, SZ + 0.05, M.navy);
});
box('subband', 4.4, 0.34, 0.11, 0, SY - 0.38, SZ + 0.1, M.navy);
[-1.7, -0.85, 0, 0.85, 1.7].forEach((x, i) =>
  box(`subband_glyph_${i}`, 0.6, 0.2, 0.07, x, SY - 0.38, SZ + 0.16, M.white));
/* matching sign on the west return, facing the side street */
box('sign_side_backer', 0.14, 1.2, 4.6, -5.88, BH + 0.7, -2.0, M.white);
[-1.2, -0.2, 0.8, 1.8].forEach((z, i) =>
  box(`sign_side_glyph_${i}`, 0.08, 0.62, 0.72, -5.91, BH + 0.82, -1.6 + z, M.glow));
box('sign_side_subband', 0.08, 0.24, 3.0, -5.91, BH + 0.32, -2.0, M.navy);
/* pylon sign on the lot */
box('pylon_post', 0.34, 3.2, 0.34, 4.9, 1.7, 4.9, M.grey);
box('pylon_panel', 1.9, 1.5, 0.24, 4.9, 3.5, 4.9, M.white);
box('pylon_panel_frame', 2.1, 1.7, 0.16, 4.9, 3.5, 4.9, M.navy);
[-0.5, 0.1, 0.7].forEach((dx, i) =>
  box(`pylon_glyph_${i}`, 0.42, 0.5, 0.1, 4.9 + dx, 3.72, 5.06, M.glow));
box('pylon_sub', 1.4, 0.26, 0.1, 4.9, 3.1, 5.06, M.navy);
box('pylon_base', 0.8, 0.22, 0.8, 4.9, 0.24, 4.9, M.grey);

return g;

};

/* ---- unh ---- */
LM.unh = function(THREE){




/* Palette: warm limestone + blue-tinted glass dominant, royal blue accent */
const mat = (name, color, o = {}) => {
  const m = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color), roughness: 0.86, metalness: 0, flatShading: true, ...o
  });
  m.name = name; return m;
};
const M = {
  stone: mat('warm_limestone', 0xcbbca4, { roughness: 0.9 }),
  stoneL:mat('limestone_light', 0xded3bf, { roughness: 0.88 }),
  grey:  mat('grey_trim',      0x7d8288, { roughness: 0.8 }),
  glass: mat('blue_glass',     0x3d6f9c, { roughness: 0.22, metalness: 0.3 }),
  glassD:mat('blue_glass_deep',0x2a5279, { roughness: 0.24, metalness: 0.3 }),
  blue:  mat('royal_blue',     0x1a4fa0, { roughness: 0.58 }),
  white: mat('white_trim',     0xeceef0, { roughness: 0.7 }),
  glow:  mat('shield_glow',    0x6fa8ff, {
    roughness: 0.4, emissive: new THREE.Color(0x2f6fe0), emissiveIntensity: 1.8 }),
};

const g = new THREE.Group();
g.name = 'campus_tower_stage3';
const add = (mesh, name, x, y, z, rot) => {
  mesh.name = name; mesh.position.set(x, y, z);
  if (rot) mesh.rotation.set(rot[0] || 0, rot[1] || 0, rot[2] || 0);
  g.add(mesh); return mesh;
};
const box = (name, w, h, d, x, y, z, m, rot) =>
  add(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m), name, x, y, z, rot);
const cyl = (name, rt, rb, h, seg, x, y, z, m, rot) =>
  add(new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m), name, x, y, z, rot);

/* Fixed grid plot 12 x 12 m, footprint identical across all 5 stages; growth is height only */
const PW = 9.6, PD = 6.4, PZ = -1.6;     // main slab
const BH = 2.4;                           // stone base storey
const FLOORS = 8, FH = 1.5;               // stage 3 of 5, floors added upward only
const top = BH + FLOORS * FH;

box('site_pad', 11.9, 0.14, 11.9, 0, 0.07, 0, M.grey);
box('plaza', 11.4, 0.06, 4.0, 0, 0.17, 3.7, M.stoneL);

/* ---- Stone base storey with recessed blue-glass shopfront ---- */
box('base_mass', PW + 0.8, BH - 0.14, PD + 0.8, 0, 0.14 + (BH - 0.14) / 2, PZ, M.stone);
box('base_plinth', PW + 1.1, 0.28, PD + 1.1, 0, 0.28, PZ, M.grey);
box('base_cornice', PW + 1.05, 0.22, PD + 1.05, 0, BH + 0.02, PZ, M.stoneL);
[-3.6, -2.2, 2.2, 3.6].forEach((x, i) => {
  box(`base_glass_${i}`, 1.15, 1.5, 0.1, x, 1.3, PZ + (PD + 0.8) / 2 + 0.02, M.glass);
  box(`base_mullion_${i}`, 0.09, 1.5, 0.13, x, 1.3, PZ + (PD + 0.8) / 2 + 0.05, M.stoneL);
});
/* entry: glazed portal, flat canopy, monument sign and flagpoles on the plaza */
box('entry_recess', 3.2, 2.0, 0.32, 0, 1.15, PZ + (PD + 0.8) / 2 - 0.1, M.grey);
box('entry_glass', 2.8, 1.7, 0.1, 0, 1.1, PZ + (PD + 0.8) / 2 + 0.06, M.glass);
box('entry_mullion', 0.1, 1.7, 0.14, 0, 1.1, PZ + (PD + 0.8) / 2 + 0.1, M.white);
box('entry_canopy', 4.2, 0.16, 1.2, 0, 2.32, PZ + (PD + 0.8) / 2 + 0.5, M.stoneL);
box('entry_canopy_edge', 4.2, 0.09, 0.12, 0, 2.22, PZ + (PD + 0.8) / 2 + 1.04, M.blue);
[-1.9, 1.9].forEach((x, i) =>
  cyl(`bollard_${i}`, 0.09, 0.11, 0.56, 8, x, 0.5, 2.6, M.stoneL));
box('monument_base', 3.0, 0.5, 0.44, -3.2, 0.45, 4.2, M.stoneL);
box('monument_face', 2.4, 0.32, 0.08, -3.2, 0.52, 4.44, M.blue);
box('monument_cap', 3.14, 0.09, 0.56, -3.2, 0.74, 4.2, M.grey);
[3.0, 4.0, 5.0].forEach((x, i) => {
  cyl(`flagpole_${i}`, 0.045, 0.055, 4.2, 8, x, 2.2, 4.3, M.white);
  box(`flag_${i}`, 0.05, 0.42, 0.72, x, 3.9, 4.68, i === 1 ? M.white : M.blue);
  cyl(`flagpole_base_${i}`, 0.16, 0.2, 0.2, 10, x, 0.3, 4.3, M.grey);
});

/* ---- Tower: stone piers framing bands of blue-tinted glass ---- */
box('tower_mass', PW, FLOORS * FH, PD, 0, BH + (FLOORS * FH) / 2, PZ, M.stone);
for (let i = 0; i < FLOORS; i++) {
  const y = BH + i * FH + FH / 2;
  box(`glass_band_n_${i}`, PW - 1.5, FH - 0.4, 0.1, 0, y, PZ + PD / 2 + 0.02, M.glass);
  box(`glass_band_s_${i}`, PW - 1.5, FH - 0.4, 0.1, 0, y, PZ - PD / 2 - 0.02, M.glassD);
  box(`glass_band_e_${i}`, 0.1, FH - 0.4, PD - 1.5, PW / 2 + 0.02, y, PZ, M.glass);
  box(`glass_band_w_${i}`, 0.1, FH - 0.4, PD - 1.5, -PW / 2 - 0.02, y, PZ, M.glassD);
  box(`spandrel_${i}`, PW + 0.1, 0.22, PD + 0.1, 0, BH + i * FH + 0.11, PZ, M.stoneL);
  /* window mullion grid on the front elevation */
  [-3.1, -1.55, 0, 1.55, 3.1].forEach((x, k) =>
    box(`mullion_n_${i}_${k}`, 0.09, FH - 0.4, 0.13, x, y, PZ + PD / 2 + 0.05, M.stoneL));
  [-1.6, 0, 1.6].forEach((z, k) =>
    box(`mullion_e_${i}_${k}`, 0.13, FH - 0.4, 0.09, PW / 2 + 0.05, y, PZ + z, M.stoneL));
}
/* stone corner piers, proud of the glass */
[[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([sx, sz], i) =>
  box(`corner_pier_${i}`, 0.9, FLOORS * FH, 0.9,
      sx * (PW / 2 - 0.2), BH + (FLOORS * FH) / 2, PZ + sz * (PD / 2 - 0.2), M.stone));
/* projecting stair core on the west end, stepped one bay lower */
box('stair_core', 1.5, FLOORS * FH - 1.5, 2.6, -5.12, BH + (FLOORS * FH - 1.5) / 2, PZ - 0.4, M.stoneL);
box('stair_core_cap', 1.66, 0.2, 2.76, -5.12, BH + FLOORS * FH - 1.4, PZ - 0.4, M.grey);
for (let i = 0; i < FLOORS - 1; i++)
  box(`stair_slot_${i}`, 0.1, FH - 0.6, 1.5, -5.9, BH + i * FH + FH / 2, PZ - 0.4, M.glassD);

/* ---- Crown: parapet, mechanical penthouse, glowing shield ---- */
box('parapet', PW + 0.3, 0.6, PD + 0.3, 0, top + 0.3, PZ, M.stoneL);
box('parapet_cap', PW + 0.36, 0.1, PD + 0.36, 0, top + 0.63, PZ, M.grey);
box('parapet_reveal', PW + 0.34, 0.08, PD + 0.34, 0, top + 0.08, PZ, M.blue);
box('roof_deck', PW - 0.3, 0.1, PD - 0.3, 0, top + 0.05, PZ, M.grey);
box('penthouse', 3.6, 1.2, 2.8, -1.6, top + 0.65, PZ - 0.3, M.stoneL);
box('penthouse_cap', 3.76, 0.14, 2.96, -1.6, top + 1.32, PZ - 0.3, M.grey);
box('penthouse_louvre', 2.8, 0.5, 0.08, -1.6, top + 0.66, PZ + 1.06, M.grey);
[[2.6, -1.9], [3.6, 0.4]].forEach(([x, z], i) => {
  box(`hvac_${i}`, 1.1, 0.44, 0.9, x, top + 0.32, PZ + z, M.white);
  box(`hvac_vent_${i}`, 0.85, 0.14, 0.06, x, top + 0.32, PZ + z + 0.48, M.grey);
});
cyl('roof_mast', 0.045, 0.06, 1.6, 8, 4.0, top + 0.9, PZ - 2.2, M.white);
cyl('roof_mast_light', 0.08, 0.08, 0.14, 8, 4.0, top + 1.77, PZ - 2.2, M.glow);

/* Hook: rooftop shield, faceted plate on a low frame, glowing edge */
const SY = top + 1.6, SZ = PZ + 1.6;
box('shield_frame_l', 0.14, 1.5, 0.16, -1.5, SY - 0.2, SZ, M.grey);
box('shield_frame_r', 0.14, 1.5, 0.16, 1.5, SY - 0.2, SZ, M.grey);
box('shield_frame_top', 3.1, 0.14, 0.16, 0, SY + 0.5, SZ, M.grey);
const shieldShape = new THREE.Shape();
shieldShape.moveTo(-1.05, 1.0);
shieldShape.lineTo(1.05, 1.0);
shieldShape.lineTo(1.05, -0.05);
shieldShape.quadraticCurveTo(1.0, -0.95, 0, -1.4);
shieldShape.quadraticCurveTo(-1.0, -0.95, -1.05, -0.05);
shieldShape.closePath();
const shield = new THREE.Mesh(
  new THREE.ExtrudeGeometry(shieldShape, { depth: 0.22, bevelEnabled: true, bevelSize: 0.07, bevelThickness: 0.07, bevelSegments: 1, curveSegments: 4 }),
  M.blue);
add(shield, 'shield_plate', 0, SY + 0.55, SZ - 0.11);
const shieldGlow = new THREE.Mesh(
  new THREE.ExtrudeGeometry(shieldShape, { depth: 0.1, bevelEnabled: false, curveSegments: 4 }),
  M.glow);
shieldGlow.scale.set(0.8, 0.8, 1);
add(shieldGlow, 'shield_glow_inner', 0, SY + 0.55, SZ + 0.14);
shieldGlow.castShadow = false;
box('shield_bar_v', 0.2, 1.3, 0.1, 0, SY + 0.6, SZ + 0.22, M.white);
box('shield_bar_h', 1.1, 0.2, 0.1, 0, SY + 0.75, SZ + 0.22, M.white);
box('shield_base', 3.4, 0.2, 0.6, 0, SY - 1.0, SZ, M.grey);

return g;

};

/* ---- ge ---- */
LM.ge = function(THREE){




/* Palette: silver + pale steel dominant, GE blue accent, cool glass */
const mat = (name, color, o = {}) => {
  const m = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color), roughness: 0.84, metalness: 0, flatShading: true, ...o
  });
  m.name = name; return m;
};
const M = {
  silver: mat('silver_panel', 0xb6bbc0, { roughness: 0.66, metalness: 0.2 }),
  pale:   mat('pale_steel',   0xd6d9dc, { roughness: 0.72 }),
  grey:   mat('grey_trim',    0x676d73, { roughness: 0.8 }),
  dark:   mat('dark_grey',    0x3d4247, { roughness: 0.82 }),
  blue:   mat('ge_blue',      0x1668b3, { roughness: 0.56 }),
  navy:   mat('ge_navy',      0x0d3f70, { roughness: 0.62 }),
  glow:   mat('turbine_glow', 0x63c8ff, {
    roughness: 0.4, emissive: new THREE.Color(0x2aa2ef), emissiveIntensity: 1.8 }),
  glass:  mat('glass',        0x4f7c99, { roughness: 0.24, metalness: 0.3 }),
};

const g = new THREE.Group();
g.name = 'turbine_hall_stage3';
const add = (mesh, name, x, y, z, rot) => {
  mesh.name = name; mesh.position.set(x, y, z);
  if (rot) mesh.rotation.set(rot[0] || 0, rot[1] || 0, rot[2] || 0);
  g.add(mesh); return mesh;
};
const box = (name, w, h, d, x, y, z, m, rot) =>
  add(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m), name, x, y, z, rot);
const cyl = (name, rt, rb, h, seg, x, y, z, m, rot, open) =>
  add(new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg, 1, !!open), m), name, x, y, z, rot);

/* Fixed grid plot 12 x 12 m, footprint identical across all 5 stages; growth is height only */
const HW = 11.2, HD = 6.2, HH = 3.6;   // hangar hall
const HZ = -2.5;                        // hall pushed to the back of the plot
const R = 3.05;                         // drum radius
const FLOORS = 6, FH = 1.5;             // stage 3 of 5, floors added upward only
const dTop = 0.6 + FLOORS * FH;

box('site_pad', 11.9, 0.16, 11.9, 0, 0.08, 0, M.grey);
box('apron', 11.5, 0.05, 3.4, 0, 0.19, 4.1, M.dark);

/* ---- Hangar hall: long low shed with a barrel roof ---- */
box('hall_plinth', HW + 0.3, 0.6, HD + 0.3, 0, 0.3, HZ, M.dark);
box('hall_mass', HW, HH, HD, 0, 0.6 + HH / 2, HZ, M.silver);
cyl('hall_barrel', HD / 2, HD / 2, HW, 24, 0, 0.6 + HH, HZ, M.pale, [0, 0, Math.PI / 2]);
box('hall_barrel_trim', HW + 0.12, 0.16, HD + 0.12, 0, 0.6 + HH, HZ, M.grey);
box('hall_datum', HW + 0.1, 0.22, HD + 0.1, 0, 1.7, HZ, M.blue);
for (let i = -5; i <= 5; i++) {
  if (Math.abs(i * 1.02) > 2.9) box(`hall_rib_n_${i + 5}`, 0.12, HH - 0.4, 0.14, i * 1.02, 0.8 + HH / 2, HZ + HD / 2 + 0.02, M.grey);
  box(`hall_rib_s_${i + 5}`, 0.12, HH - 0.4, 0.14, i * 1.02, 0.8 + HH / 2, HZ - HD / 2 - 0.02, M.grey);
}
/* round porthole windows, the Evendale motif */
[-5.0, -4.2, -3.4, 3.4, 4.2, 5.0].forEach((x, i) => {
  cyl(`porthole_${i}`, 0.44, 0.44, 0.14, 16, x, 2.9, HZ + HD / 2 + 0.04, M.glass, [Math.PI / 2, 0, 0]);
  cyl(`porthole_ring_${i}`, 0.56, 0.56, 0.1, 16, x, 2.9, HZ + HD / 2 + 0.02, M.pale, [Math.PI / 2, 0, 0]);
});
/* clerestory band + hangar doors */
[-1, 1].forEach((sx, i) =>
  box(`hall_clerestory_${i}`, 3.4, 0.6, 0.1, sx * 3.9, 4.0, HZ + HD / 2 + 0.02, M.glass));
[-4.4, 4.0].forEach((x, i) => {
  box(`hangar_door_${i}`, 2.2, 2.0, 0.12, x, 1.6, HZ + HD / 2 + 0.06, M.pale);
  box(`hangar_door_frame_${i}`, 2.4, 2.2, 0.06, x, 1.62, HZ + HD / 2 + 0.02, M.grey);
  [0.4, 1.0, 1.6].forEach((dy, k) =>
    box(`hangar_door_slat_${i}_${k}`, 2.2, 0.05, 0.14, x, dy, HZ + HD / 2 + 0.08, M.grey));
});
/* rear stacks and plant */
[-3.6, -2.6].forEach((x, i) => {
  cyl(`stack_${i}`, 0.28, 0.32, 7.4, 12, x, 4.3, -5.5, M.pale);
  cyl(`stack_band_${i}`, 0.36, 0.36, 0.2, 12, x, 7.6, -5.5, M.blue);
});
[[2.4, 0], [4.0, 0], [-0.6, 0]].forEach(([x], i) => {
  box(`hall_hvac_${i}`, 1.3, 0.5, 1.0, x, 0.6 + HH + HD / 2 + 0.2, HZ, M.pale);
  box(`hall_hvac_vent_${i}`, 1.0, 0.2, 0.06, x, 0.6 + HH + HD / 2 + 0.2, HZ + 0.53, M.grey);
});
box('hall_ridge_walk', HW - 1.4, 0.08, 0.9, 0, 0.6 + HH + HD / 2 - 0.02, HZ, M.grey);

/* ---- Glazed drum: the tower element, turbine-shaped in plan ---- */
cyl('drum_plinth', R + 0.45, R + 0.5, 0.6, 24, 0, 0.3, 2.1, M.dark);
cyl('drum_shaft', R, R, FLOORS * FH, 24, 0, 0.6 + (FLOORS * FH) / 2, 2.1, M.glass);
cyl('drum_core', R - 0.7, R - 0.7, FLOORS * FH, 20, 0, 0.6 + (FLOORS * FH) / 2, 2.1, M.silver);
for (let i = 0; i <= FLOORS; i++)
  cyl(`drum_ring_${i}`, R + 0.1, R + 0.1, 0.18, 24, 0, 0.6 + i * FH, 2.1, M.pale);
for (let i = 0; i < 20; i++) {
  const a = (i / 20) * Math.PI * 2;
  box(`drum_mullion_${i}`, 0.1, FLOORS * FH, 0.12,
      Math.cos(a) * (R + 0.05), 0.6 + (FLOORS * FH) / 2, 2.1 + Math.sin(a) * (R + 0.05), M.pale, [0, -a, 0]);
}
/* blue spandrel accent every other floor */
[1, 3, 5].forEach((i) =>
  cyl(`drum_accent_${i}`, R + 0.06, R + 0.06, 0.34, 24, 0, 0.6 + i * FH + 0.2, 2.1, M.blue));
/* entrance at the drum foot */
box('entry_portal', 3.0, 2.0, 0.5, 0, 1.15, 4.9, M.navy);
box('entry_glass', 2.6, 1.7, 0.12, 0, 1.1, 5.2, M.glass);
box('entry_mullion', 0.1, 1.7, 0.16, 0, 1.1, 5.26, M.pale);
box('entry_canopy', 4.0, 0.16, 0.9, 0, 2.24, 5.4, M.pale);
box('entry_canopy_edge', 4.0, 0.1, 0.12, 0, 2.14, 5.8, M.blue);
[-2.4, 2.4].forEach((x, i) =>
  cyl(`bollard_${i}`, 0.1, 0.12, 0.66, 8, x, 0.52, 5.2, M.pale));
box('sign_plinth', 2.6, 0.5, 0.36, -4.2, 0.44, 5.4, M.pale);
box('sign_face', 2.0, 0.3, 0.07, -4.2, 0.5, 5.6, M.blue);

/* ---- Hook: jet-engine turbine ring crowning the drum ---- */
const CY = dTop + 0.1;
cyl('crown_collar', R + 0.35, R + 0.2, 0.5, 24, 0, CY + 0.25, 2.1, M.grey);
/* nacelle: outer cowl ring */
cyl('nacelle_outer', R + 0.55, R + 0.55, 1.5, 28, 0, CY + 1.15, 2.1, M.silver, null, true);
const torus = (name, rad, tube, seg, y, m) => {
  const t = new THREE.Mesh(new THREE.TorusGeometry(rad, tube, 8, seg), m);
  t.name = name; t.position.set(0, y, 2.1); t.rotation.x = Math.PI / 2; t.castShadow = false; g.add(t);
};
torus('nacelle_lip', R + 0.5, 0.22, 28, CY + 1.92, M.pale);
torus('nacelle_lip_glow', R + 0.5, 0.1, 28, CY + 2.06, M.glow);
cyl('nacelle_inner', R - 0.15, R - 0.15, 1.5, 24, 0, CY + 1.15, 2.1, M.dark, null, true);
cyl('nacelle_base_ring', R + 0.6, R + 0.6, 0.2, 28, 0, CY + 0.5, 2.1, M.blue);
for (let i = 0; i < 18; i++) {
  const a = (i / 18) * Math.PI * 2;
  const b = box(`fan_blade_${i}`, 0.2, 0.5, R - 0.15, 0, CY + 1.3, 2.1, M.pale);
  b.position.set(Math.cos(a) * (R * 0.5), CY + 1.3, 2.1 + Math.sin(a) * (R * 0.5));
  b.rotation.set(0, -a, 0.32);
}
cyl('fan_hub', 0.78, 0.88, 0.7, 16, 0, CY + 1.35, 2.1, M.blue);
cyl('fan_spinner', 0.06, 0.74, 0.8, 16, 0, CY + 2.0, 2.1, M.pale);
/* glowing ring segments inside the cowl */
for (let i = 0; i < 12; i++) {
  const a = (i / 12) * Math.PI * 2 + Math.PI / 24;
  box(`ring_segment_${i}`, 0.5, 0.16, 0.16,
      Math.cos(a) * (R + 0.3), CY + 0.9, 2.1 + Math.sin(a) * (R + 0.3), M.glow, [0, -a, 0]);
}
cyl('exhaust_ring', R + 0.4, R + 0.55, 0.3, 28, 0, CY + 0.15, 2.1, M.navy);
/* crown deck plant behind the ring */
box('crown_house', 2.2, 0.9, 1.6, -0.4, CY + 0.75, -0.9, M.pale);
box('crown_house_cap', 2.34, 0.12, 1.74, -0.4, CY + 1.26, -0.9, M.grey);
cyl('crown_mast', 0.05, 0.07, 1.8, 8, 2.6, CY + 1.3, -0.4, M.pale);
cyl('crown_mast_light', 0.09, 0.09, 0.16, 8, 2.6, CY + 2.28, -0.4, M.glow);

return g;

};

/* ---- amd ---- */
LM.amd = function(THREE){




/* Palette: black + graphite dominant, red accent, cool blue glass */
const mat = (name, color, o = {}) => {
  const m = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color), roughness: 0.84, metalness: 0, flatShading: true, ...o
  });
  m.name = name; return m;
};
const M = {
  black:    mat('amd_black',   0x17181b, { roughness: 0.86 }),
  graphite: mat('graphite',    0x2b2e33, { roughness: 0.78 }),
  red:      mat('amd_red',     0xc4262e, { roughness: 0.58 }),
  glow:     mat('red_glow',    0xf05a3a, {
    roughness: 0.4, emissive: new THREE.Color(0xd83a1e), emissiveIntensity: 1.7 }),
  glass:    mat('blue_glass',  0x4b6f8c, { roughness: 0.24, metalness: 0.34 }),
  silver:   mat('silver_trim', 0xb9bec4, { roughness: 0.6, metalness: 0.2 }),
};

const g = new THREE.Group();
g.name = 'faceted_tower_stage3';
const add = (mesh, name, x, y, z, rot) => {
  mesh.name = name; mesh.position.set(x, y, z);
  if (rot) mesh.rotation.set(rot[0] || 0, rot[1] || 0, rot[2] || 0);
  g.add(mesh); return mesh;
};
const box = (name, w, h, d, x, y, z, m, rot) =>
  add(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m), name, x, y, z, rot);
const cyl = (name, rt, rb, h, seg, x, y, z, m, rot) =>
  add(new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m), name, x, y, z, rot);

/* Fixed grid plot 12 x 12 m, footprint identical across all 5 stages; growth is height only */
const BW = 11.0, BD = 8.6;            // curtain-wall block
const GH = 0.9;                        // ground plinth
const FLOORS = 6, FH = 1.55;           // stage 3 of 5, floors added upward only
const top = GH + FLOORS * FH;

box('site_pad', 11.9, 0.16, 11.9, 0, 0.08, 0, M.graphite);

/* ---- Ground plinth: dark base the glass sits on ---- */
box('plinth', BW + 0.4, GH - 0.16, BD + 0.4, 0, 0.16 + (GH - 0.16) / 2, 0, M.black);
box('plinth_reveal', BW + 0.5, 0.1, BD + 0.5, 0, GH - 0.06, 0, M.graphite);

/* ---- Curtain-wall block: continuous blue glass, silver spandrel bands ---- */
box('core_mass', BW - 0.5, FLOORS * FH, BD - 0.5, 0, GH + (FLOORS * FH) / 2, 0, M.graphite);
for (let i = 0; i < FLOORS; i++) {
  const y = GH + i * FH;
  [1, -1].forEach((sz, k) => {
    box(`glass_n${k}_${i}`, BW, FH - 0.34, 0.14, 0, y + FH / 2 + 0.09, sz * (BD / 2), M.glass);
    box(`spandrel_n${k}_${i}`, BW + 0.06, 0.34, 0.2, 0, y + 0.17, sz * (BD / 2), M.silver);
  });
  [1, -1].forEach((sx, k) => {
    box(`glass_e${k}_${i}`, 0.14, FH - 0.34, BD, sx * (BW / 2), y + FH / 2 + 0.09, 0, M.glass);
    box(`spandrel_e${k}_${i}`, 0.2, 0.34, BD + 0.06, sx * (BW / 2), y + 0.17, 0, M.silver);
  });
}
/* vertical mullion rhythm */
for (let i = -5; i <= 5; i++) {
  [1, -1].forEach((sz, k) =>
    box(`mullion_n${k}_${i + 5}`, 0.08, FLOORS * FH, 0.17, i * 1.0, GH + (FLOORS * FH) / 2, sz * (BD / 2 + 0.02), M.silver));
}
for (let i = -4; i <= 4; i++) {
  [1, -1].forEach((sx, k) =>
    box(`mullion_e${k}_${i + 4}`, 0.17, FLOORS * FH, 0.08, sx * (BW / 2 + 0.02), GH + (FLOORS * FH) / 2, i * 0.95, M.silver));
}

/* ---- Ground floor: recessed glazed lobby under the overhang ---- */
box('lobby_glass_n', BW - 1.2, GH - 0.3, 0.1, 0, 0.52, BD / 2 - 0.3, M.glass);
box('entry_portal', 3.2, GH - 0.2, 0.3, 1.4, 0.52, BD / 2 - 0.16, M.black);
box('entry_glass', 2.8, GH - 0.36, 0.1, 1.4, 0.5, BD / 2 - 0.02, M.glass);
box('entry_canopy', 4.2, 0.14, 1.5, 1.4, GH + 0.06, BD / 2 + 0.5, M.silver);
box('entry_canopy_edge', 4.2, 0.1, 0.12, 1.4, GH - 0.02, BD / 2 + 1.2, M.red);
box('entry_step', 5.0, 0.12, 1.0, 1.4, 0.22, 5.45, M.graphite);

/* ---- Parapet: deep white cap band carrying the sign, as on the real HQ ---- */
box('parapet_band', BW + 0.7, 1.15, BD + 0.7, 0, top + 0.58, 0, M.silver);
box('parapet_shadow', BW + 0.6, 0.12, BD + 0.6, 0, top + 0.02, 0, M.graphite);
box('parapet_cap', BW + 0.8, 0.16, BD + 0.8, 0, top + 1.22, 0, M.graphite);
box('parapet_glowline', BW + 0.76, 0.07, BD + 0.76, 0, top + 0.12, 0, M.glow);
/* signage plate on the front band */
box('sign_plate', 3.6, 0.62, 0.1, -2.4, top + 0.62, (BD + 0.7) / 2 + 0.03, M.black);
[-3.6, -2.75, -1.9, -1.05].forEach((x, i) =>
  box(`sign_glyph_${i}`, 0.46, 0.4, 0.06, x, top + 0.62, (BD + 0.7) / 2 + 0.09, M.silver));
box('sign_accent', 0.16, 0.4, 0.07, -0.72, top + 0.62, (BD + 0.7) / 2 + 0.09, M.red);

/* ---- Roof deck: low plant, kept flat like the reference ---- */
box('roof_deck', BW - 0.4, 0.14, BD - 0.4, 0, top + 0.07, 0, M.graphite);
[[-3.6, 1.8], [-1.9, 1.8], [3.2, 1.9]].forEach(([x, z], i) => {
  box(`hvac_${i}`, 1.5, 0.6, 1.2, x, top + 0.44, z, M.silver);
  box(`hvac_vent_${i}`, 1.2, 0.2, 0.07, x, top + 0.44, z + 0.64, M.graphite);
});
[[0.6, -2.2], [2.3, -2.2]].forEach(([x, z], i) =>
  cyl(`vent_${i}`, 0.18, 0.18, 0.5, 10, x, top + 0.39, z, M.graphite));
box('stair_head', 2.0, 0.8, 1.6, -4.0, top + 0.54, -1.9, M.silver);
cyl('mast', 0.05, 0.07, 1.9, 8, 4.4, top + 1.1, -2.6, M.silver);
cyl('mast_light', 0.09, 0.09, 0.16, 8, 4.4, top + 2.13, -2.6, M.glow);

/* ---- Plaza monolith sign, red-topped ---- */
box('monolith', 0.42, 1.5, 2.0, -4.9, 0.85, 4.8, M.silver);
box('monolith_top', 0.5, 0.18, 2.1, -4.9, 1.69, 4.8, M.red);
box('monolith_face', 0.06, 0.8, 1.5, -4.66, 0.95, 4.8, M.graphite);
box('monolith_base', 0.7, 0.18, 2.3, -4.9, 0.19, 4.8, M.graphite);

return g;

};

export const LANDMARKS = LM;
