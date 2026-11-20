function drawpoint(argx, argy, argz, argcolor, argopacity, argsize = 2) {
    const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(argx * voxelsize, argy * voxelsize, argz * voxelsize)]);
    const mat = new THREE.PointsMaterial({ color: argcolor, size: argsize, sizeAttenuation: false, transparent: true, opacity: argopacity });
    const points = new THREE.Points(geo, mat);
    scene.add(points);
}

function drawscenecorners() {
    return;
    drawpoint(0, 0, 0, '#ffffff', 1);
    drawpoint(N, 0, 0, '#ffffff', 1);
    drawpoint(0, N, 0, '#ffffff', 1);
    drawpoint(0, 0, Nz, '#ffffff', 1);
    drawpoint(N, N, 0, '#ffffff', 1);
    drawpoint(N, 0, Nz, '#ffffff', 1);
    drawpoint(0, N, Nz, '#ffffff', 1);
    drawpoint(N, N, Nz, '#ffffff', 1);
}

function clearfields() {
    V1x.fill(0);
    V1y.fill(0);
    V1z.fill(0);
    V2x.fill(0);
    V2y.fill(0);
    V2z.fill(0);
}

let V1geometry, V2geometry, V1linemesh, V2linemesh;
function initvectormeshes() {
    // style1 colors
    //   Electric, E, yellow
    //   Magnetic, B, blue
    //   (color theme Ikea)
    //   (two diff colors, not same hue, each not white)
    // style2 colors
    //   Grid 1, lighter yellow near white
    //   Grid 2, lighter blue near white
    //   (colors more sophisticated yellow,blue)
    //       and more like white, together lightyellow and lightblue can look like white, white is particle, thing
    //       and photonpulse, eglobemspine (electro-magnetic) and will be lightyellow-lightblue ~ white thing
    // style3 colors
    //    try same color for V1 and V2. digital green.
    //    (classic screen display green, P1 phosphor)
    //      vectors feel digital, neon green
    //      feeling of speed, the grid, the computer
    //      and like pocket green laser
    //    the color of the sqrt(kilogram/m^3) ?
    //    but maybe white as thing is better.
    const V1material = new THREE.LineBasicMaterial({
        color: '#ffdd00',
        // color: '#f4d39a',
        // color: '#33FF33',
    });
    const V2material = new THREE.LineBasicMaterial({
        color: '#0080ff',
        // color: '#99d6f5',
        // color: '#33FF33',
    });

    V1geometry = new THREE.BufferGeometry();
    const V1posattr = new THREE.BufferAttribute(V1buffer, 3);
    V1posattr.setUsage(THREE.DynamicDrawUsage);
    V1geometry.setAttribute('position', V1posattr);
    V1geometry.setDrawRange(0, 0);

    V1linemesh = new THREE.LineSegments(V1geometry, V1material);
    V1linemesh.scale.setScalar(voxelsize); // more efficient than in the draw, multiplying every value *= voxelsize.
    scene.add(V1linemesh);

    V2geometry = new THREE.BufferGeometry();
    const V2posattr = new THREE.BufferAttribute(V2buffer, 3);
    V2posattr.setUsage(THREE.DynamicDrawUsage);
    V2geometry.setAttribute('position', V2posattr);
    V2geometry.setDrawRange(0, 0);

    V2linemesh = new THREE.LineSegments(V2geometry, V2material);
    V2linemesh.scale.setScalar(voxelsize);
    scene.add(V2linemesh);
}

const V1scale = 1e6; // todo change
const V1tiny = .01 * V1scale;
const V1tinysq = V1tiny * V1tiny;
function drawGrid1() {
    let ptr = 0;

    for (let x = 0; x < N; x += vis_stride) {
        // const xoffset = Nsq * x;
        const xoffset = N * Nz * x;
        for (let y = 0; y < N; y += vis_stride) {
            // const xyoffset = xoffset + N * y;
            const xyoffset = xoffset + Nz * y;
            for (let z = 0; z < Nz; z += vis_stride) {
                const i = xyoffset + z;

                const locV1x = V1x[i];
                const locV1y = V1y[i];
                const locV1z = V1z[i];

                // single Evec as sum of 3 components
                // note: avoid ** 2 in loops bc slower.
                //   GPT: direct multiplication compiles to faster instruction.
                if (locV1x * locV1x + locV1y * locV1y + locV1z * locV1z > V1tinysq) {
                    // point 1 (origin at voxel node)
                    V1buffer[ptr++] = x;
                    V1buffer[ptr++] = y;
                    V1buffer[ptr++] = z;
                    // point 2 (tip = origin + (V1x, V1y, V1z) / V1scale)
                    V1buffer[ptr++] = x + locV1x / V1scale;
                    V1buffer[ptr++] = y + locV1y / V1scale;
                    V1buffer[ptr++] = z + locV1z / V1scale;
                }
            }
        }
    }

    V1geometry.attributes.position.needsUpdate = true;
    V1geometry.setDrawRange(0, ptr / 3); // only draws the active lines this step
}

const V2scale = V1scale; // todo
const V2tiny = V1tiny;
const V2tinysq = V1tinysq;
function drawGrid2() {
    let ptr = 0;

    for (let x = 0; x < N; x += vis_stride) {
        // const xoffset = Nsq * x;
        const xoffset = N * Nz * x;
        for (let y = 0; y < N; y += vis_stride) {
            // const xyoffset = xoffset + N * y;
            const xyoffset = xoffset + Nz * y;
            for (let z = 0; z < Nz; z += vis_stride) {
                const i = xyoffset + z;

                const locV2x = V2x[i];
                const locV2y = V2y[i];
                const locV2z = V2z[i];

                // single Bvec as sum of 3 components
                if (locV2x * locV2x + locV2y * locV2y + locV2z * locV2z > V2tinysq) {
                    // note: shift points by + .5. accurate position for true curl.
                    //   (not as easy to see angle between Bvec and Evec)

                    // point 1 (origin at voxel node)
                    V2buffer[ptr++] = x + .5;
                    V2buffer[ptr++] = y + .5;
                    V2buffer[ptr++] = z + .5;
                    // point 2 (tip = origin + (V2x, V2y, V2z) / V2scale)
                    V2buffer[ptr++] = x + .5 + locV2x / V2scale;
                    V2buffer[ptr++] = y + .5 + locV2y / V2scale;
                    V2buffer[ptr++] = z + .5 + locV2z / V2scale;
                }
            }
        }
    }

    V2geometry.attributes.position.needsUpdate = true;
    V2geometry.setDrawRange(0, ptr / 3);
}
