"use strict";

var shadedCube = function () {
  var canvas;
  var gl;

  var numPositions = 36;

  var positionsArray = [];
  var normalsArray = [];

  var vertices = [
    vec4(-0.5, -0.15, 0.5, 1.0),
    vec4(-0.1, 0.3, 0.24, 1.0),
    vec4(0.5, 0.5, 0.3, 1.0),
    vec4(0.25, -0.38, 0.1, 1.0),
    vec4(-0.5, -0.3, -0.18, 1.0),
    vec4(-0.3, 0.5, -0.45, 1.0),
    vec4(0.24, 0.15, -0.3, 1.0),
    vec4(0.3, -0.35, -0.5, 1.0),
  ];

  var lightPosition = vec4(1.0, 1.0, 1.0, 0.0);
  var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
  var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
  var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

  var materialAmbient = vec4(1.0, 0.0, 1.0, 1.0);
  var materialDiffuse = vec4(0.447, 0.067, 0.941, 1.0);
  var materialSpecular = vec4(0.247, 0.167, 0.641, 1.0);
  var materialShininess = 100.0;

  var ctm;
  var ambientColor, diffuseColor, specularColor;
  var modelViewMatrix, projectionMatrix;
  var viewerPos;
  var program;

  var xAxis = 0;
  var yAxis = 1;
  var zAxis = 2;
  var isNegative = false;
  var axis = 0;
  var theta = vec3(0, 0, 0);

  var thetaLoc;

  var flag = false;

  function quad(a, b, c, d) {
    var t1 = subtract(vertices[b], vertices[a]);
    var t2 = subtract(vertices[c], vertices[b]);
    var normal = cross(t1, t2);
    normal = vec3(normal);

    positionsArray.push(vertices[a]);
    normalsArray.push(normal);
    positionsArray.push(vertices[b]);
    normalsArray.push(normal);
    positionsArray.push(vertices[c]);
    normalsArray.push(normal);
    positionsArray.push(vertices[a]);
    normalsArray.push(normal);
    positionsArray.push(vertices[c]);
    normalsArray.push(normal);
    positionsArray.push(vertices[d]);
    normalsArray.push(normal);
  }

  function colorCube() {
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(6, 5, 1, 2);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);
  }

  window.onload = function init() {
    canvas = document.getElementById("gl-canvas");
    gl = canvas.getContext("webgl2");
    if (!gl) alert("WebGL 2.0 isn't available");

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    gl.enable(gl.DEPTH_TEST);

    //  Load shaders and initialize attribute buffers
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    colorCube();

    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

    var normalLoc = gl.getAttribLocation(program, "aNormal");
    gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(normalLoc);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positionsArray), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    thetaLoc = gl.getUniformLocation(program, "theta");

    viewerPos = vec3(0.0, 0.0, -20.0);

    projectionMatrix = ortho(-1, 1, -1, 1, -100, 100);

    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);

    window.addEventListener("keydown", function (event) {
      switch (event.key) {
        case "ArrowRight":
          axis = yAxis;
          isNegative = false;
          break;
        case "ArrowLeft":
          axis = yAxis;
          isNegative = true;
          break;
        case "ArrowUp":
          axis = xAxis;
          isNegative = true;
          break;
        case "ArrowDown":
          axis = xAxis;
          isNegative = false;
          break;
      }
      if(event.key == "ArrowRight" || event.key == "ArrowLeft" || event.key == "ArrowUp" || event.key == "ArrowDown"){
        flag = !flag;
      }
    });

    gl.uniform4fv(
      gl.getUniformLocation(program, "uAmbientProduct"),
      ambientProduct
    );
    gl.uniform4fv(
      gl.getUniformLocation(program, "uDiffuseProduct"),
      diffuseProduct
    );
    gl.uniform4fv(
      gl.getUniformLocation(program, "uSpecularProduct"),
      specularProduct
    );
    gl.uniform4fv(
      gl.getUniformLocation(program, "uLightPosition"),
      lightPosition
    );

    gl.uniform1f(
      gl.getUniformLocation(program, "uShininess"),
      materialShininess
    );

    gl.uniformMatrix4fv(
      gl.getUniformLocation(program, "uProjectionMatrix"),
      false,
      flatten(projectionMatrix)
    );
    render();
  };

  var render = function () {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
gl.clearColor(0.0, 0.0, 0.0, 1);
    if (flag) {
      if (isNegative) {
        theta[axis] -= 2.0;
      } else {
        theta[axis] += 2.0;
      }
    }
    modelViewMatrix = mat4();
    modelViewMatrix = mult(
      modelViewMatrix,
      rotate(theta[xAxis], vec3(1, 0, 0))
    );
    modelViewMatrix = mult(
      modelViewMatrix,
      rotate(theta[yAxis], vec3(0, 1, 0))
    );
    modelViewMatrix = mult(
      modelViewMatrix,
      rotate(theta[zAxis], vec3(0, 0, 1))
    );

    gl.uniformMatrix4fv(
      gl.getUniformLocation(program, "uModelViewMatrix"),
      false,
      flatten(modelViewMatrix)
    );

    gl.drawArrays(gl.TRIANGLES, 0, numPositions);

    requestAnimationFrame(render);
  };
};

shadedCube();
