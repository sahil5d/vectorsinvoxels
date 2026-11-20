// initialize pulse in flight
// issue: leaves a deposit. todo
function initonepulse(argpulseZ = 20) {
    clearfields();

    // argpulseZ = Math.floor(Nz / 2);

    const xCenter = Math.floor(N / 2);
    const yCenter = Math.floor(N / 2);

    const sigma_r = 4.5; // pulse radius in voxels
    const sigma_z = 7.0; // pulse length in voxels

    const lambda = 8 * voxelsize;
    const k = 2 * Math.PI / lambda;

    // Shift for Grid 2: half a voxel forward in space, half a step backward in time
    // const shift_z = 0.5 - (0.5 * CSPEED * timestep / voxelsize); // avoids backward pulse
    const shift_z = .5 * (1 - 1 / Math.sqrt(3));

    for (let x = 0; x < N; x++) {
        const xoffset = N * Nz * x;
        for (let y = 0; y < N; y++) {
            const xyoffset = xoffset + Nz * y;

            const r2 = (x - xCenter) ** 2 + (y - yCenter) ** 2;
            const spatial_xy = Math.exp(-r2 / (2 * sigma_r * sigma_r));

            for (let z = 0; z < Nz; z++) {
                const i = xyoffset + z;

                // Circular polarization: Grid 1 rotates in xy plane as a helix along z
                const envelV1 = Math.exp(-Math.pow(z - argpulseZ, 2) / (2 * sigma_z * sigma_z)) * spatial_xy * V1scale;
                const phase1 = k * (z - argpulseZ) * voxelsize;
                V1x[i] = envelV1 * Math.cos(phase1);
                V1y[i] = envelV1 * Math.sin(phase1);

                // Circular polarization: Grid 2 perpendicular to Grid 1 so V1 x V2 points purely in +z
                const z_V2 = z + shift_z;
                const envelV2 = Math.exp(-Math.pow(z_V2 - argpulseZ, 2) / (2 * sigma_z * sigma_z)) * spatial_xy * V1scale;
                const phase2 = k * (z_V2 - argpulseZ) * voxelsize;
                V2x[i] = -envelV2 * Math.sin(phase2);
                V2y[i] = envelV2 * Math.cos(phase2);
            }
        }
    }
}


function initrandvecs() {
    clearfields();

    const zCenter = Math.floor(Nz / 2);
    const xCenter = Math.floor(N / 2);
    const yCenter = Math.floor(N / 2);
    const r = 3;

    for (let x = xCenter - r; x < xCenter + r; x++) {
        const xoffset = N * Nz * x;
        for (let y = yCenter - r; y < yCenter + r; y++) {
            const xyoffset = xoffset + Nz * y;
            for (let z = zCenter - r; z < zCenter + r; z++) {
                const i = xyoffset + z;

                V1x[i] = Math.random() * V1scale;
                // V1y[i] = Math.random() * V1scale;
                // V1z[i] = Math.random() * V1scale;

                // V2x[i] = Math.random() * V2scale;
                V2y[i] = Math.random() * V2scale;
                // V2z[i] = Math.random() * V2scale;
            }
        }
    }
}



function initoneblockpulse() {
    clearfields();

    const pulseZ = 2;

    const xCenter = Math.floor(N / 2);
    const yCenter = Math.floor(N / 2);

    const xoffset = N * Nz * xCenter;
    const xyoffset = xoffset + Nz * yCenter;
    const i = xyoffset + pulseZ;
    V1x[i] = V1scale;
    V2y[i] = V2scale;
}
