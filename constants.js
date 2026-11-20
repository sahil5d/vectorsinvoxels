const voxelsize = 5e-9; // meters // dx
const voxelvol = voxelsize ** 3;

// const N = 7;
const N = 40;
const Nz = 150; // try long scene
// const Nz = 80; // can go shorter w wrapround
// const Nz = 20;


// const vis_stride = 4;
const vis_stride = 1;

//////////////////////////////////

const CSPEED = 2.9979 * 10 ** 8; // m/s. 'v0'.

const timestep = .99 * voxelsize / CSPEED / Math.sqrt(3); // dt

const COEFF = .99 / Math.sqrt(3) / CSPEED;

// Flat 3D array index helper (faster than 3D nested array)
// index = N^2 x + N y + z
// const Nsq = N * N;
// const Ncub = N * N * N;
const Ntotal = N * N * Nz;

const V1x = new Float32Array(Ntotal); // new Float32Array(Ncub);
const V1y = new Float32Array(Ntotal); // new Float32Array(Ncub);
const V1z = new Float32Array(Ntotal); // new Float32Array(Ncub);

const V2x = new Float32Array(Ntotal); // new Float32Array(Ncub);
const V2y = new Float32Array(Ntotal); // new Float32Array(Ncub);
const V2z = new Float32Array(Ntotal); // new Float32Array(Ncub);

// note: don't need scene boundary sponge.
//   purpose is to design a travelingpulsephoton and stationarypulseelectron 
//     travelingpulsephoton should go straight (and not hit boundary), 
//     stationarypulseelectron should be stationary.
// const sponge_n = 3;
// const sponge = new Float32Array(Ncub);

// const vis_N = Math.ceil(N / vis_stride);
// const vis_Ncub = vis_N * vis_N * vis_N;
const vis_Ntotal = Math.ceil(N / vis_stride) ** 2 * Math.ceil(Nz / vis_stride);
// const maxlines = vis_Ncub * 3; // N^3 and each V1x V1y V1z
// const maxlines = vis_Ntotal * 3; // N^3 and each V1x V1y V1z
const maxlines = vis_Ntotal; // N^3 and each net Vvec
const maxpoints = maxlines * 2; // 2 points per linesegment
const V1buffer = new Float32Array(maxpoints * 3); // x y z per point
const V2buffer = new Float32Array(maxpoints * 3); // x y z per point