const p = THREE.Vector3;
const vec = THREE.Vector3;
const ZEROALL = new vec(0, 0, 0);

function trim(arg) {
    if (typeof arg === 'number') {
        return parseFloat(arg.toPrecision(3));
        // return parseFloat(arg.toPrecision(5));
    } else {
        return { x: trim(arg.x), y: trim(arg.y), z: trim(arg.z) };
    }
}

function plotpoint(point, arghex = '#ffffff', argr = .02) {
    var geometry = new THREE.SphereGeometry(argr);
    var material = new THREE.MeshBasicMaterial({
        color: arghex,
    });
    var sphere = new THREE.Mesh(geometry, material);
    sphere.position.x = point.x;
    sphere.position.y = point.y;
    sphere.position.z = point.z;
    scene.add(sphere);
}

function plotlinesegment(argvec, argorigin, arghex = '#ffffff') {
    const points = [argorigin, argorigin.clone().add(argvec)];

    const geometry = new THREE.BufferGeometry();
    geometry.setFromPoints(points);

    const material = new THREE.LineBasicMaterial({ color: arghex });
    const line = new THREE.Line(geometry, material);
    scene.add(line);
}

function getrandompointinsphere(R) {
    var x, y, z, r;
    do {
        x = Math.random() * 2 - 1;
        y = Math.random() * 2 - 1;
        z = Math.random() * 2 - 1;
        r = Math.sqrt(x * x + y * y + z * z);
    } while (r > 1);

    return new p(x * R, y * R, z * R);
}

// from https://stackoverflow.com/questions/9600801/evenly-distributing-n-points-on-a-sphere
function getapproxequidistantpointsonsphere(n, R) {
    var out = [];

    var phiradians = Math.PI * (Math.sqrt(5) - 1); // golden angle in radians
    var y;
    var flatradius;
    var theta;
    for (var i = 0; i < n; i++) {
        y = 1 - 2 * i / (n - 1); // y goes from 1 to -1
        flatradius = Math.sqrt(1 - y * y); // horizontal radius at y. the radius swinging around yaxis.
        theta = phiradians * i; // golden angle increment

        out.push(new p(Math.cos(theta) * flatradius * R, y * R, Math.sin(theta) * flatradius * R));
    }
    return out;
}

function getpointsoncircle(n, R = 1) {
    var arr = [];
    for (var i = 0; i < n; i++) {
        var angle = (i / n) * (2 * Math.PI);
        arr.push(new p(Math.cos(angle) * R, Math.sin(angle) * R, 0));
    }
    return arr;
}

//////////////////////////////////

// note: photonpulse has half ergy in V1vecs and half in V2vecs
// todo: check what it is for electronglobe
function calcTotalErgy() {
    let sumV1sq = 0;
    let sumV2sq = 0;

    for (let i = 0; i < Ntotal; i++) {
        const locV1x = V1x[i];
        const locV1y = V1y[i];
        const locV1z = V1z[i];
        const locV2x = V2x[i];
        const locV2y = V2y[i];
        const locV2z = V2z[i];

        sumV1sq += locV1x * locV1x + locV1y * locV1y + locV1z * locV1z;
        sumV2sq += locV2x * locV2x + locV2y * locV2y + locV2z * locV2z;
    }

    // todo. correct this expression. most likely use voxel's speed1 and speed2
    const ergyV1 = 0.5 * CSPEED * sumV1sq * voxelvol;
    const ergyV2 = 0.5 * CSPEED * sumV2sq * voxelvol;

    // console.log({
    //     total: ergyV1 + ergyV2,
    //     ergyV1: ergyV1,
    //     ergyV2: ergyV2,
    //     ratioV1V2: ergyV1 / ergyV2
    // });

    return ergyV1 + ergyV2;
}

// todo: check how electron stationary has 0 momentum, and electron in motion has momentum
function calcTotalMomentum() {
    let V1xV2_x = 0, V1xV2_y = 0, V1xV2_z = 0;

    for (let i = 0; i < Ntotal; i++) {
        const locV1x = V1x[i];
        const locV1y = V1y[i];
        const locV1z = V1z[i];
        const locV2x = V2x[i];
        const locV2y = V2y[i];
        const locV2z = V2z[i];

        V1xV2_x += locV1y * locV2z - locV1z * locV2y;
        V1xV2_y += locV1z * locV2x - locV1x * locV2z;
        V1xV2_z += locV1x * locV2y - locV1y * locV2x;
    }

    // todo. correct this expression. most likely use voxel's speed1 and speed2
    const factor = CSPEED * CSPEED * voxelvol;
    return new vec(V1xV2_x * factor, V1xV2_y * factor, V1xV2_z * factor);
}

// Step 3 Diagnostic Metric: Calculate pulse RMS radius Wr, z-center of mass, and peak intensity
function calcPulseMetrics() {
    const xCenter = Math.floor(N / 2);
    const yCenter = Math.floor(N / 2);

    let sumWeight = 0;
    let sumR2Weight = 0;
    let sumSinZ = 0;
    let sumCosZ = 0;
    let maxU = 0;

    // const cSq = CSPEED * CSPEED;

    for (let x = 0; x < N; x++) {
        const xoffset = N * Nz * x;
        const dx = x - xCenter;
        const dx2 = dx * dx;

        for (let y = 0; y < N; y++) {
            const xyoffset = xoffset + Nz * y;
            const dy = y - yCenter;
            const r2 = dx2 + dy * dy;

            for (let z = 0; z < Nz; z++) {
                const i = xyoffset + z;

                const locV1x = V1x[i];
                const locV1y = V1y[i];
                const locV1z = V1z[i];
                const locV2x = V2x[i];
                const locV2y = V2y[i];
                const locV2z = V2z[i];

                const w = (locV1x * locV1x + locV1y * locV1y + locV1z * locV1z) + (locV2x * locV2x + locV2y * locV2y + locV2z * locV2z);

                if (w > V1tinysq) {
                    sumWeight += w;
                    sumR2Weight += r2 * w;
                    const thetaZ = (2 * Math.PI * z) / Nz;
                    sumSinZ += w * Math.sin(thetaZ);
                    sumCosZ += w * Math.cos(thetaZ);
                    if (w > maxU) maxU = w;
                }
            }
        }
    }

    if (sumWeight === 0) {
        return { radius: 0, zCenter: 0, maxIntensity: 0 };
    }

    let avgTheta = Math.atan2(sumSinZ, sumCosZ);
    if (avgTheta < 0) avgTheta += 2 * Math.PI;
    const circZCenter = (avgTheta * Nz) / (2 * Math.PI);

    return {
        radius: Math.sqrt(sumR2Weight / sumWeight),
        zCenter: circZCenter,
        maxIntensity: Math.sqrt(maxU) / V1scale
    };
}

// todo
// try speed formula that is additive without denominator dependence.
//   if so, don't need to have exact derivation rn of CSPEED from cosmos mass distribution, distances.
function getgridspeed(arggrid, argx, argy, argz) {
    return CSPEED;
}

// const ex = Ex[i], ey = Ey[i], ez = Ez[i];
// const bx = Bx[i], by = By[i], bz = Bz[i];
// // Total electromagnetic energy density (E and B)
// const u = 0.5 * (
//     (ex * ex + ey * ey + ez * ez) / (Escale * Escale) +
//     (bx * bx + by * by + bz * bz) / (Bscale * Bscale)
// );

//  const bx = Bx[i], by = By[i], bz = Bz[i];
// const ex = Ex[i], ey = Ey[i], ez = Ez[i];
// const u = 0.5 * (
//     (ex * ex + ey * ey + ez * ez) / (Escale * Escale) +
//     (bx * bx + by * by + bz * bz) / (Bscale * Bscale)
// );
