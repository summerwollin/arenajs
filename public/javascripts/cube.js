cube = function(gl) {
  this.gl = gl;

  this.transforms = {
    model: [
      1.0, 0.0, 0.0, 0.0,
      0.0, 1.0, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      0.0, 0.0, 0.0, 1.0
    ]
  };

  this.locations = {};

  this.buffers = this.createBufferForCube(createCubeData())

  this.webglProgram = this.setupProgram();
}

function createCubeData() {
  var positions = [
    // Front face
    -1.0, -1.0,  1.0,
     1.0, -1.0,  1.0,
     1.0,  1.0,  1.0,
    -1.0,  1.0,  1.0,

    // Back face
    -1.0, -1.0, -1.0,
    -1.0,  1.0, -1.0,
     1.0,  1.0, -1.0,
     1.0, -1.0, -1.0,

    // Top face
    -1.0,  1.0, -1.0,
    -1.0,  1.0,  1.0,
     1.0,  1.0,  1.0,
     1.0,  1.0, -1.0,

    // Bottom face
    -1.0, -1.0, -1.0,
     1.0, -1.0, -1.0,
     1.0, -1.0,  1.0,
    -1.0, -1.0,  1.0,

    // Right face
     1.0, -1.0, -1.0,
     1.0,  1.0, -1.0,
     1.0,  1.0,  1.0,
     1.0, -1.0,  1.0,

    // Left face
    -1.0, -1.0, -1.0,
    -1.0, -1.0,  1.0,
    -1.0,  1.0,  1.0,
    -1.0,  1.0, -1.0
  ];

  var colorsOfFaces = [
    [0.3,  1.0,  1.0,  1.0],    // Front face: cyan
    [1.0,  0.3,  0.3,  1.0],    // Back face: red
    [0.3,  1.0,  0.3,  1.0],    // Top face: green
    [0.3,  0.3,  1.0,  1.0],    // Bottom face: blue
    [1.0,  1.0,  0.3,  1.0],    // Right face: yellow
    [1.0,  0.3,  1.0,  1.0]     // Left face: purple
  ];

  var colors = [];

  for (var j=0; j<6; j++) {
    var polygonColor = colorsOfFaces[j];

    for (var i=0; i<4; i++) {
      colors = colors.concat( polygonColor );
    }
  }

  var elements = [
    0,  1,  2,      0,  2,  3,    // front
    4,  5,  6,      4,  6,  7,    // back
    8,  9,  10,     8,  10, 11,   // top
    12, 13, 14,     12, 14, 15,   // bottom
    16, 17, 18,     16, 18, 19,   // right
    20, 21, 22,     20, 22, 23    // left
  ]

  return {
    positions: positions,
    elements: elements,
    colors: colors
  }
}

cube.prototype.createBufferForCube = function(cubeData) {
  var gl = this.gl;

  var positions = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positions);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeData.positions), gl.STATIC_DRAW);

  var colors = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colors);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeData.colors), gl.STATIC_DRAW);

  var elements = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elements);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeData.elements), gl.STATIC_DRAW);

  return {
    positions: positions,
    colors: colors,
    elements: elements
  }
}

cube.prototype.setupProgram = function() {
  var gl = this.gl;

  // Setup a WebGL program
  var webglProgram = createWebGLProgram(
    gl,

    "//Vertex Shader\n" +
    "attribute vec3 position;\n" +
    "attribute vec4 color;\n" +
    "\n" +
    "uniform mat4 modelViewMat;\n" +
    "uniform mat4 projectionMat;\n" +
    "\n" +
    "varying vec4 vColor;\n" +
    "\n" +
    "void main() {\n" +
    "  vColor = color;\n" +
    "  \n" +
    "  vec3 scaledPosition = position * 20.0;\n" +
    "  scaledPosition.z += 80.0;\n" +
    "  vec4 worldPosition = modelViewMat * vec4(scaledPosition, 1.0);\n" +
    "  gl_Position = projectionMat * worldPosition;\n" +
    "}\n",

    "//Fragment Shader\n" +
    "precision mediump float;\n" +
    "varying vec4 vColor;\n" +
    "\n" +
    "void main() {\n" +
    "  gl_FragColor = vColor;\n" +
    "}\n");

  // Save the attribute and uniform locations
  this.locations.modelView = gl.getUniformLocation(webglProgram, "modelViewMat");
  this.locations.projection = gl.getUniformLocation(webglProgram, "projectionMat");
  this.locations.position = gl.getAttribLocation(webglProgram, "position");
  this.locations.color = gl.getAttribLocation(webglProgram, "color");

  return webglProgram;
}

function createWebGLProgram(gl, vertexSource, fragmentSource) {
  var vertexShader = createShader(gl, vertexSource, gl.VERTEX_SHADER);
  var fragmentShader = createShader(gl, fragmentSource, gl.FRAGMENT_SHADER);

  return linkProgram(gl, vertexShader, fragmentShader);
}

function createShader(gl, source, type) {
  var shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    var info = gl.getShaderInfoLog(shader);
    console.log("Could not compile WebGL program\n\n", info);
  }

  return shader;
}

function linkProgram(gl, vertexShader, fragmentShader) {
  var program = gl.createProgram();

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);

  gl.linkProgram(program);

  if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    var info = gl.getProgramInfoLog(program);
    console.log("Could not link WebGL program\n\n", info);
  }

  return program;
}

cube.prototype.draw = function(viewMatrix, projMatrix) {
  var gl = this.gl;

  gl.useProgram(this.webglProgram);

  gl.uniformMatrix4fv(this.locations.modelView, false, viewMatrix);
  gl.uniformMatrix4fv(this.locations.projection, false, projMatrix);

  // Set the positions attribute
  gl.enableVertexAttribArray(this.locations.position);
  gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.positions);
  gl.vertexAttribPointer(this.locations.position, 3, gl.FLOAT, false, 0, 0);

  // Set the colors attribute
  gl.enableVertexAttribArray(this.locations.color);
  gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.colors);
  gl.vertexAttribPointer(this.locations.color, 4, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.elements );

  gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
}
