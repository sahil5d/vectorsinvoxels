function logic_step() {
    // console.log(steps);

    // Update Grid1V using Grid2V
    // V1 ijk.x += speed1 * (V2 ijk.z - V2 i j-1 k .z - V2 ijk.y + V2 i j k-1 .y)
    // V1 ijk.y += speed1 * (V2 ijk.x - V2 i j k-1 .x - V2 ijk.z + V2 i-1 j k .z)
    // V1 ijk.z += speed1 * (V2 ijk.y - V2 i-1 j k .y - V2 ijk.x + V2 i j-1 k .x)

    for (let x = 1; x < N; x++) {
        // const xoffset = Nsq * x;
        const xoffset = N * Nz * x;
        for (let y = 1; y < N; y++) {
            // const xyoffset = xoffset + N * y;
            const xyoffset = xoffset + Nz * y;
            for (let z = 0; z < Nz; z++) {
                const i = xyoffset + z;
                const i_minus1 = (z === 0) ? (xyoffset + Nz - 1) : (i - 1);

                let locspeed = getgridspeed(1, x, y, z);

                //     (V2z[i] - V2z[idx(x, y - 1, z)]) -
                //     (V2y[i] - V2y[idx(x, y, z - 1)])
                V1x[i] += COEFF * locspeed * (
                    (V2z[i] - V2z[i - Nz]) -
                    (V2y[i] - V2y[i_minus1]) // (V2y[i] - V2y[i - 1])
                );

                //     (V2x[i] - V2x[idx(x, y, z - 1)]) -
                //     (V2z[i] - V2z[idx(x - 1, y, z)])
                V1y[i] += COEFF * locspeed * (
                    (V2x[i] - V2x[i_minus1]) - // (V2x[i] - V2x[i - 1]) -
                    (V2z[i] - V2z[i - N * Nz])
                );

                //     (V2y[i] - V2y[idx(x - 1, y, z)]) -
                //     (V2x[i] - V2x[idx(x, y - 1, z)])
                V1z[i] += COEFF * locspeed * (
                    (V2y[i] - V2y[i - N * Nz]) -
                    (V2x[i] - V2x[i - Nz])
                );

            }
        }
    }

    // Update Grid2V using Grid1V
    // V2 ijk.x -= speed2 * (V1 i j+1 k .z - V1 ijk.z - V1 i j k+1 .y + V1 ijk.y)
    // V2 ijk.y -= speed2 * (V1 i j k+1 .x - V1 ijk.x - V1 i+1 j k .z + V1 ijk.z)
    // V2 ijk.z -= speed2 * (V1 i+1 j k .y - V1 ijk.y - V1 i j+1 k .x + V1 ijk.x)

    for (let x = 0; x < N - 1; x++) {
        // const xoffset = Nsq * x;
        const xoffset = N * Nz * x;
        for (let y = 0; y < N - 1; y++) {
            // const xyoffset = xoffset + N * y;
            const xyoffset = xoffset + Nz * y;
            for (let z = 0; z < Nz; z++) {
                const i = xyoffset + z;
                const i_plus1 = (z === Nz - 1) ? xyoffset + 0 : (i + 1);

                let locspeed = getgridspeed(2, x, y, z);

                //     (V1z[idx(x, y + 1, z)] - V1z[i]) -
                //     (V1y[idx(x, y, z + 1)] - V1y[i])
                V2x[i] -= COEFF * locspeed * (
                    (V1z[i + Nz] - V1z[i]) -
                    (V1y[i_plus1] - V1y[i]) // (V1y[i + 1] - V1y[i])
                );

                //     (V1x[idx(x, y, z + 1)] - V1x[i]) -
                //     (V1z[idx(x + 1, y, z)] - V1z[i])
                V2y[i] -= COEFF * locspeed * (
                    (V1x[i_plus1] - V1x[i]) - // (V1x[i + 1] - V1x[i]) -
                    (V1z[i + N * Nz] - V1z[i])
                );

                //     (V1y[idx(x + 1, y, z)] - V1y[i]) -
                //     (V1x[idx(x, y + 1, z)] - V1x[i])
                V2z[i] -= COEFF * locspeed * (
                    (V1y[i + N * Nz] - V1y[i]) -
                    (V1x[i + Nz] - V1x[i])
                );
                // note: tried +=, sim growsinsanely.

            }
        }
    }

    // await sleepp(10);

    if (steps % stepsuntilplot === 0) {
        drawGrid1();
        drawGrid2();
    }
}
