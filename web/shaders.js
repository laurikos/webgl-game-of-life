// shaders.js

// Vertex shader program
const vertexShaderSource = `#version 300 es
#pragma vscode_glsllint_stage: vert

in vec4 a_position;
in vec2 a_uv;

out vec2 v_uv;

void main() {
    gl_Position = a_position;
    v_uv = a_uv;
}

`;

const fragmentShaderSource = `#version 300 es
#pragma vscode_glsllint_stage: frag

precision highp float;

uniform vec2 u_resolution;
uniform sampler2D u_tex;

in vec2 v_uv;

out vec4 outColor;

void main() {

    ivec2 texSize = textureSize(u_tex, 0);
    vec2 uv = v_uv * vec2(texSize);

    ivec2 coord = ivec2(uv);

    int aliveNeighbors = 0;
    vec4 birthColor = vec4(0.0);
    bool foundColor = false;

    ivec2 offsets[8] = ivec2[8](
        ivec2(-1, -1), ivec2(0, -1), ivec2(1, -1),
        ivec2(-1,  0),             ivec2(1,  0),
        ivec2(-1,  1), ivec2(0,  1), ivec2(1,  1)
    );

    for (int i = 0; i < 8; i++) {
        vec4 neighbor = texelFetch(u_tex, coord + offsets[i], 0);
        if (neighbor.r > 0.5) {
            aliveNeighbors++;
            if (!foundColor) {
                birthColor = neighbor; // Get color from one of the alive neighbors
                foundColor = true;
            }
        }
    }

    vec4 color = texelFetch(u_tex, coord, 0);
    bool isAlive = color.r > 0.5;

    if (isAlive) {
        if (aliveNeighbors < 2 || aliveNeighbors > 3) {
            outColor = vec4(0.0, 0.0, 0.0, 1.0); // Cell dies
        } else {
            outColor = color; // Cell stays alive
        }
    } else {
        if (aliveNeighbors == 3) {
            outColor = vec4(birthColor.rgb, 1.0); // Cell becomes alive with birth color
        } else {
            outColor = vec4(0.0, 0.0, 0.0, 1.0); // Cell stays dead
        }
    }
}
`;

