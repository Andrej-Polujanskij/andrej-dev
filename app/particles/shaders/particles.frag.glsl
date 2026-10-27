#version 300 es
precision mediump float;

in vec3 vLight;
out vec4 color;

// A soft round dot. Dots are added on top of each other (additive blending).
void main() {
  vec2 q = (gl_PointCoord - 0.5) * 6.0;
  color = vec4(vLight * exp(-0.5 * dot(q, q)), 1.0);
}
