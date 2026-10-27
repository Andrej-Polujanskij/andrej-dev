#version 300 es
precision mediump float;

// Halves the resolution by averaging four bilinear samples.
uniform sampler2D uSource;
uniform vec2 uTexel;
in vec2 vUv;
out vec4 color;

void main() {
  color = 0.25 * (texture(uSource, vUv + uTexel * vec2(-1.0, -1.0))
                + texture(uSource, vUv + uTexel * vec2(1.0, -1.0))
                + texture(uSource, vUv + uTexel * vec2(-1.0, 1.0))
                + texture(uSource, vUv + uTexel * vec2(1.0, 1.0)));
}
