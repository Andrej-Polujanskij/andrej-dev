#version 300 es
precision mediump float;

// One direction of a gaussian blur. Run twice (horizontal, then vertical) for the bloom glow.
uniform sampler2D uSource;
uniform vec2 uDirection; // one texel along x or y
uniform float uSigma;    // blur radius in texels
in vec2 vUv;
out vec4 color;

void main() {
  vec3 sum = vec3(0.0);
  float weights = 0.0;
  float spacing = max(uSigma / 5.0, 0.5);
  for (int i = -14; i <= 14; i++) {
    float x = float(i) * spacing;
    float weight = exp(-0.5 * x * x / (uSigma * uSigma));
    sum += texture(uSource, vUv + uDirection * x).rgb * weight;
    weights += weight;
  }
  color = vec4(sum / weights, 1.0);
}
