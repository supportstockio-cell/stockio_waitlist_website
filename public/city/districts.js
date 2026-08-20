/* Shared district plan, consumed by the interactive city and the export massing view. */

export const PITCH = 240;   // plate-to-plate spacing
export const PLATE = 200;   // plate size

export const DISTRICTS = [
  {
    id: 'greenline', name: 'Greenline Block', tag: 'Agri-urban', accent: '#58A83A',
    cx: 0, cz: 0, builtin: true, cross: 'ns',
    blurb: 'The founding block. Vertical farms, a helical landmark and planted terraces around the central plaza.',
    stats: { jobs: '9,200', power: '18 MW', area: '4.0 ha' },
    buildings: []
  },
  {
    id: 'tech', name: 'Silicon Terrace', tag: 'Technology', accent: '#2E7BD6',
    cx: 0, cz: -PITCH, cross: 'ns',
    blurb: 'Low campus rings and glazed slabs around a shaded quad. Product floors face the quad, labs face the ring road.',
    stats: { jobs: '38,400', power: '62 MW', area: '4.0 ha' },
    buildings: [
      { ticker: 'AAPL', name: 'Orchard Ring',  model: 'aapl', type: 'campus', x: -42, z: -44, w: 64, d: 46, h: 24, program: 'Devices R&D',   desc: 'A closed ring over a planted courtyard; the whole roof is a single photovoltaic plane.' },
      { ticker: 'MSFT', name: 'Azure Slab',    model: 'msft', type: 'slab',   x:  48, z: -46, w: 44, d: 30, h: 58, program: 'Cloud offices',  desc: 'Two glazed bays split by a service spine, with a rooftop plant deck feeding the district loop.' },
      { ticker: 'ORCL', name: 'Data Drum',     model: 'orcl', type: 'tower',  x:  48, z:   0, w: 30, d: 30, h: 96, program: 'Enterprise HQ',  desc: 'A glazed drum on a square base, ringed by a lit band that reads as a data crown at night.' },
      { ticker: 'CSCO', name: 'Network Tower', model: 'csco', type: 'cube',   x: -46, z:  42, w: 42, d: 42, h: 44, program: 'Networking',    desc: 'Twin masts carry a catenary of lit cable lines across the roof, the district fibre landing.' },
      { ticker: 'INTC', name: 'Fab Works',     model: 'intc', type: 'slab',   x:  48, z:  46, w: 46, d: 34, h: 40, program: 'Silicon',       desc: 'A gridded curtain wall with lit circuit traces; process floors sit behind the blank west flank.' }
    ]
  },
  {
    id: 'ai', name: 'Cognition Yards', tag: 'AI / Compute', accent: '#9B5DE0',
    cx: -PITCH, cz: -PITCH,
    blurb: 'Compute halls, substations and cooling yards. Nothing here is taller than it needs to be except the model tower.',
    stats: { jobs: '11,800', power: '840 MW', area: '4.0 ha' },
    buildings: [
      { ticker: 'NVDA',  name: 'Tensor Halls',    model: 'nvda', type: 'dataHall', x: -40, z: -48, w: 62, d: 40, h: 18, program: 'GPU halls',      desc: 'Six training halls under one roof plane, chillers ranked along the spine.' },
      { ticker: 'AMD',   name: 'Fabric Yard',     model: 'amd', type: 'dataHall', x:  44, z: -46, w: 56, d: 40, h: 16, program: 'Inference',      desc: 'Inference racks with a dry-cooler yard on the north apron.' },
      { ticker: 'GOOGL', name: 'Model Campus',    model: 'googl', type: 'slab',     x: -56, z:  30, w: 52, d: 40, h: 34, program: 'Research',       desc: 'Research floors bridged over the fibre trench that feeds the whole yard.' },
      { ticker: 'META',  name: 'Twin Stacks',     model: 'meta', type: 'tower',    x:  22, z:  22, w: 26, d: 26, h: 84, program: 'Reality labs',   desc: 'Two shafts bridged at mid-height, the gap between them lit as one continuous strip.' },
      { ticker: 'AMZN',  name: 'Fulfilment Works', model: 'amzn', type: 'dataHall', x:  58, z:  58, w: 52, d: 34, h: 14, program: 'Cloud + logistics', desc: 'A warehouse base under a slim operations tower, loading straight onto the corridor.' }
    ]
  },
  {
    id: 'crypto', name: 'The Ledger', tag: 'Crypto / Web3', accent: '#F2C33D',
    cx: PITCH, cz: -PITCH,
    blurb: 'A vault, a treasury column and two hash sheds. The column carries the district price crawl.',
    stats: { jobs: '4,100', power: '310 MW', area: '4.0 ha' },
    buildings: [
      { ticker: 'COIN', name: 'Exchange Vault',   type: 'cube',  x: -46, z: -42, w: 48, d: 44, h: 40, program: 'Exchange',      desc: 'Custody floors behind a fritted glass skin; trading desks ring the atrium.' },
      { ticker: 'MSTR', name: 'Treasury Column',  type: 'tower', x:  26, z: -48, w: 22, d: 22, h: 108, program: 'Treasury',     desc: 'A single slender shaft. The LED band at the base runs the district crawl day and night.', crawl: true },
      { ticker: 'MARA', name: 'Hash Shed A',      type: 'mine',  x:  62, z:  -4, w: 40, d: 52, h: 12, program: 'Mining',        desc: 'Immersion racks in rows, with the heat rejected into the district hot loop.' },
      { ticker: 'RIOT', name: 'Hash Shed B',      type: 'mine',  x:  62, z:  52, w: 40, d: 40, h: 12, program: 'Mining',        desc: 'Second shed, air-cooled, fans on the long elevation.' },
      { ticker: 'HOOD', name: 'Retail Deck',      type: 'slab',  x: -44, z:  36, w: 58, d: 36, h: 30, program: 'Brokerage',     desc: 'Ground-floor onboarding hall under three floors of support desks.' }
    ]
  },
  {
    id: 'finance', name: 'Exchange Square', tag: 'Finance', accent: '#1D9BB0',
    cx: PITCH, cz: 0,
    blurb: 'The tallest ground in the city. Stepped towers around a hard square, with the clearing hall at its west edge.',
    stats: { jobs: '52,600', power: '74 MW', area: '4.0 ha' },
    buildings: [
      { ticker: 'JPM', name: 'Fortress Tower',   model: 'jpm', type: 'stack',  x: -44, z: -44, w: 40, d: 40, h: 132, program: 'Banking HQ',   desc: 'Three setbacks, each marking a shift from trading to advisory to executive floors.' },
      { ticker: 'MA',  name: 'Twin Circles',     model: 'ma', type: 'stack',  x:  30, z: -42, w: 34, d: 34, h: 108, program: 'Payments',     desc: 'Two overlapping drums; the lens where they meet is glazed the full height of the building.' },
      { ticker: 'BRK.B', name: 'Plain Tower',   model: 'brkb', type: 'slab',   x:  62, z:  18, w: 30, d: 54, h: 64,  program: 'Holdings',     desc: 'Brick and limestone, punched windows, no gestures. The cheapest good building on the square.' },
      { ticker: 'V',   name: 'Clearing Hall',    model: 'v', type: 'cube',   x: -52, z:  30, w: 44, d: 40, h: 34,  program: 'Payments',     desc: 'Settlement floors over a public hall; the north band carries the market crawl.', crawl: true },
      { ticker: 'BLK', name: 'Index Pavilion',   type: 'campus', x:   8, z:  48, w: 52, d: 34, h: 22,  program: 'Asset mgmt',   desc: 'A low pavilion facing the square, entirely glazed at ground level.' }
    ]
  },
  {
    id: 'healthcare', name: 'Vital Quarter', tag: 'Healthcare', accent: '#E85D8A',
    cx: -PITCH, cz: PITCH,
    blurb: 'A hospital campus with a rooftop helipad, ringed by labs, a care tower and a robotics wing.',
    stats: { jobs: '27,300', power: '96 MW', area: '4.0 ha' },
    buildings: [
      { ticker: 'UNH',  name: 'Central Hospital', model: 'unh', type: 'hospital', x: -40, z: -36, w: 70, d: 56, h: 44, program: 'Acute care',  desc: 'Cross-plan wards over a diagnostic podium. Helipad on the west wing, emergency apron to the south.' },
      { ticker: 'LLY',  name: 'Lilly Labs',       model: 'lly', type: 'slab',     x:  42, z: -46, w: 52, d: 34, h: 48, program: 'Pharma R&D',  desc: 'Wet labs on the lower half, offices above, plant deck on top.' },
      { ticker: 'ABBV', name: 'Immunology Works', model: 'abbv', type: 'shed',    x:  62, z:  16, w: 32, d: 48, h: 22, program: 'Biologics',   desc: 'Two lab wings flanking a taller core, with the process block held behind a blank elevation.' },
      { ticker: 'JNJ',  name: 'Care Tower',       model: 'jnj', type: 'tower',    x: -52, z:  34, w: 28, d: 28, h: 78, program: 'Clinics',     desc: 'Outpatient clinics stacked around a single core, with a sky garden at mid-height.' },
      { ticker: 'ISRG', name: 'Robotics Wing',    type: 'cube',     x:  10, z:  46, w: 48, d: 34, h: 26, program: 'Surgical',    desc: 'Training theatres and device assembly, glazed to the quarter walk.' }
    ]
  },
  {
    id: 'energy', name: 'Powerline Flats', tag: 'Energy', accent: '#E8862E',
    cx: 0, cz: PITCH, cross: 'ns',
    blurb: 'Generation and storage. Cooling towers at the north end, solar and turbines on the open flats to the south.',
    stats: { jobs: '6,400', power: '2.1 GW', area: '4.0 ha' },
    buildings: [
      { ticker: 'CVX',  name: 'Energy Tower',   model: 'cvx', type: 'plant',   x: -40, z: -40, w: 52, d: 44, h: 46, program: 'Generation', desc: 'Chevroned facade over the switchyard, with a flare stack on the north apron.' },
      { ticker: 'XOM',  name: 'Tank Farm',      model: 'xom', type: 'silo',    x:  48, z: -50, w: 44, d: 40, h: 30, program: 'Fuels',      desc: 'Storage drums and a flare stack, bunded and set back from the corridor.' },
      { ticker: 'TSLA', name: 'EV Works',       model: 'tsla', type: 'slab',   x:  52, z:   2, w: 30, d: 44, h: 20, program: 'Storage + EV', desc: 'Production hall and charging apron, matte black with a single red line along the eaves.' },
      { ticker: 'FSLR', name: 'Solar Field',    type: 'solar',   x: -44, z:  42, w: 52, d: 40, h: 6,  program: 'Solar',       desc: 'Tracking rows on a gravel bed, feeding the inverter hall directly.' },
      { ticker: 'GEV',  name: 'Turbine Row',    type: 'turbine', x:  50, z:  50, w: 20, d: 30, h: 44, program: 'Wind',        desc: 'Three test turbines on the flats, instrumented for the offshore programme.' }
    ]
  },
  {
    id: 'media', name: 'Broadcast Row', tag: 'Media', accent: '#D8453C',
    cx: -PITCH, cz: 0,
    blurb: 'Sound stages and a backlot behind the transmission mast, with the arena bowl on the south edge.',
    stats: { jobs: '19,700', power: '48 MW', area: '4.0 ha' },
    buildings: [
      { ticker: 'NFLX', name: 'Stage One',          type: 'shed',   x: -46, z: -42, w: 70, d: 50, h: 26, program: 'Sound stages', desc: 'Four column-free stages under one shell, with a scene dock onto the backlot.' },
      { ticker: 'DIS',  name: 'Backlot Halls',      type: 'shed',   x:  38, z: -46, w: 52, d: 40, h: 22, program: 'Production',   desc: 'Workshops and standing sets, opening onto the exterior street set.' },
      { ticker: 'SPOT', name: 'Audio Tower',        type: 'tower',  x:  62, z:  14, w: 26, d: 26, h: 72, program: 'Audio',        desc: 'Studios on floating slabs, isolated from the shaft to keep the rooms quiet.' },
      { ticker: 'WBD',  name: 'Transmission Mast',  type: 'dish',   x: -56, z:  34, w: 40, d: 40, h: 78, program: 'Broadcast',    desc: 'Uplink dishes on a lattice mast above the master control block.' },
      { ticker: 'LYV',  name: 'Arena Bowl',         type: 'campus', x:  14, z:  48, w: 58, d: 40, h: 24, program: 'Live events',  desc: 'A sunken bowl inside a planted ring, doubling as a rehearsal shell by day.' }
    ]
  },
  {
    id: 'manufacturing', name: 'Ironworks', tag: 'Manufacturing', accent: '#8C97AC',
    cx: PITCH, cz: PITCH,
    blurb: 'Sawtooth sheds, a hangar and the turbine foundry. Everything here is served off the corridor spur.',
    stats: { jobs: '31,500', power: '410 MW', area: '4.0 ha' },
    buildings: [
      { ticker: 'CAT', name: 'Assembly Shed',    model: 'cat', type: 'shed',  x: -46, z: -42, w: 76, d: 52, h: 24, program: 'Assembly',   desc: 'Sawtooth roof lights over two moving lines, gantry crane the full length.' },
      { ticker: 'COST', name: 'Depot Club',      model: 'cost', type: 'shed', x:  38, z: -44, w: 52, d: 40, h: 20, program: 'Distribution', desc: 'Warehouse-club box with a small office block above the entry pylon.' },
      { ticker: 'WMT', name: 'Retail Works',     model: 'wmt', type: 'shed',  x:  60, z:  18, w: 34, d: 54, h: 30, program: 'Distribution', desc: 'A long clear-span shed with the spark mast over the entry canopy.' },
      { ticker: 'KO',  name: 'Bottling Works',   model: 'ko', type: 'slab',   x: -52, z:  36, w: 48, d: 34, h: 36, program: 'Beverage',   desc: 'Filling lines below, offices above, and a red ribbon that runs the length of the facade.' },
      { ticker: 'GE',  name: 'Turbine Hall',     model: 'ge', type: 'silo',  x:  10, z:  46, w: 46, d: 34, h: 34, program: 'Foundry',    desc: 'Melt shop with two stacks; the silos hold sand and alloy feed.' }
    ]
  }
];

export const byId = id => DISTRICTS.find(d => d.id === id);
