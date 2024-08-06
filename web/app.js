function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.error(`Unable to initialize the shader program: ${gl.getProgramInfoLog(shaderProgram)}`);
    return null;
  }

  return shaderProgram;
}

function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(`An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`);
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function createTexture(gl, width, height, initialize) {

  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  const level = 0;
  const internalFormat = gl.RGBA;
  const border = 0;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;

  const data = new Uint8Array(width * height * 4);

  if (initialize) {
    const possibleColors = [
      0xBEEBE9FF,
      0xF4DADAFF,
      0xFFB6B9FF,
      0xF6EEC7FF,
      0x29C6CDFF,
      0xF6E4C4FF,
      0xFEA386FF,
      0xF19584FF,
    ];

    for (let i = 0; i < width * height * 4; i += 4) {
      let doFill = Math.random() < 0.5;
      let color = doFill ? possibleColors[Math.floor(Math.random() * possibleColors.length)] : 0x000000FF;
      const r = (color >> 24) & 0xFF;
      const g = (color >> 16) & 0xFF;
      const b = (color >> 8) & 0xFF;
      const a = color & 0xFF;
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = a;
    }
  }

  gl.texImage2D(gl.TEXTURE_2D,
    level, internalFormat,
    width, height,
    border, srcFormat,
    srcType, data);

  // Set texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  return texture;

}

function createTextureFromData(gl, width, height, data) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  const level = 0;
  const internalFormat = gl.RGBA;
  const border = 0;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;

  gl.texImage2D(gl.TEXTURE_2D,
    level, internalFormat,
    width, height,
    border, srcFormat,
    srcType, data);

  // Set texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  return texture;
}

function createFramebuffer(gl, texture) {
  const framebuffer = gl.createFramebuffer();

  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

  const level = 0;
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, level);

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  return framebuffer;
}

function checkGLError(gl) {
  const error = gl.getError();
  if (error !== gl.NO_ERROR) {
    console.error(`WebGL Error: ${error}`);
  }
}


// Helper function to resize canvas
function resize(canvas) {
  const displayWidth = canvas.clientWidth;
  const displayHeight = canvas.clientHeight;

  if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
    canvas.width = displayWidth;
    canvas.height = displayHeight;
  }

  // return true if the canvas was resized
  return canvas.width !== displayWidth || canvas.height !== displayHeight;

}

function main() {
  const canvas = document.getElementById('gof-canvas');
  const gl = canvas.getContext("webgl2");

  // Only continue if WebGL is available and working
  if (gl === null) {
    alert(
      "Unable to initialize WebGL. Your browser or machine may not support it.",
    );
    return;
  }

  // Resize canvas to match display size
  resize(gl.canvas);

  const shaderProgram = initShaderProgram(gl, vertexShaderSource, fragmentShaderSource);

  const quad = [
    -1.0, -1.0, // Position: (-1.0, -1.0)
    0.0, 0.0, // UV: (0.0, 0.0)

    -1.0, 1.0, // Position: (-1.0, 1.0)
    0.0, 1.0, // UV: (0.0, 1.0)

    1.0, 1.0, // Position: (1.0, 1.0)
    1.0, 1.0, // UV: (1.0, 1.0)

    1.0, -1.0, // Position: (1.0, -1.0)
    1.0, 0.0  // UV: (1.0, 0.0)
  ];

  const posBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(quad), gl.STATIC_DRAW);

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  const posAttribLoc = gl.getAttribLocation(shaderProgram, "a_position");
  const uvAttribLoc = gl.getAttribLocation(shaderProgram, "a_uv");

  if (posAttribLoc === -1 || uvAttribLoc === -1) {
    console.error("Failed to get attribute locations.");
    return;
  }

  gl.vertexAttribPointer(posAttribLoc, 2, gl.FLOAT, false, 16, 0);
  gl.enableVertexAttribArray(posAttribLoc);

  gl.vertexAttribPointer(uvAttribLoc, 2, gl.FLOAT, false, 16, 8);
  gl.enableVertexAttribArray(uvAttribLoc);

  const scaleFactor = 5;
  let bufferWidth = gl.canvas.width / scaleFactor;
  let bufferHeight = gl.canvas.height / scaleFactor;

  const texture1 = createTexture(gl, bufferWidth, bufferHeight, true);
  const texture2 = createTexture(gl, bufferWidth, bufferHeight, false);

  const framebuffer1 = createFramebuffer(gl, texture1);
  const framebuffer2 = createFramebuffer(gl, texture2);

  let textures = [texture1, texture2];
  // fbos = [framebuffer1, framebuffer2];
  let framebuffers = [framebuffer1, framebuffer2];

  // ------------------------------- RENDER LOOP -------------------------------

  let then = 0;
  let deltaTime = 0;
  let swp = 0;

  console.log(`gl.canvas.width: ${gl.canvas.width}, gl.canvas.height: ${gl.canvas.height}`);
  console.log(`bufferWidth: ${bufferWidth}, bufferHeight: ${bufferHeight}`);

  function render(now) {
    // Convert to seconds
    now *= 0.001;
    // Subtract the previous time from the current time
    deltaTime = now - then;
    // Remember the current time for the next frame.
    then = now;

    // Resize canvas to match display size
    if (resize(gl.canvas)) {
      console.log("Resizing canvas");
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

      bufferWidth = Math.ceil(gl.canvas.width / scaleFactor);
      bufferHeight = Math.ceil(gl.canvas.height / scaleFactor);

      for (let i = 0; i < 2; i++) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffers[i]);

        const newTex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, newTex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, bufferWidth, bufferHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, newTex, 0);

        gl.deleteTexture(textures[i]);
        textures[i] = newTex;
      }
    }

    // Set up source and destination textures and framebuffers
    const srcTexture = textures[swp];
    const destFramebuffer = framebuffers[(swp + 1) % 2];

    // Bind the destination framebuffer for rendering
    gl.bindFramebuffer(gl.FRAMEBUFFER, destFramebuffer);
    gl.viewport(0, 0, bufferWidth, bufferHeight);

    // Clear the framebuffer
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Use the shader program
    gl.useProgram(shaderProgram);

    // Bind the VAO
    gl.bindVertexArray(vao);

    // Set resolution uniform
    const resolutionLocation = gl.getUniformLocation(shaderProgram, "u_resolution");
    gl.uniform2f(resolutionLocation, bufferWidth, bufferHeight);

    // Bind the source texture
    const textureLocation = gl.getUniformLocation(shaderProgram, "u_tex");
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, srcTexture);
    gl.uniform1i(textureLocation, 0);

    // Draw to the destination framebuffer (updating the texture)
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    // Now bind the default framebuffer to render to the canvas
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Set the resolution uniform for rendering to the canvas
    gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);

    // Bind the updated texture (from the destination framebuffer)
    gl.bindTexture(gl.TEXTURE_2D, textures[(swp + 1) % 2]);

    // Draw the final result to the canvas
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    checkGLError(gl);

    // Unbind the VAO
    gl.bindVertexArray(null);

    // Swap the FBOs and textures for the next frame
    swp = (swp + 1) % 2;

    // Request the next frame
    requestAnimationFrame(render);

  }

  requestAnimationFrame(render);

}

main();
