#version 300 es
precision highp float;

// Adds the bloom glow to the particles, maps the bright light into screen colors
// and adds a little grain so dark gradients do not band.
uniform sampler2D uScene;
uniform sampler2D uBloom;
uniform float uExposure;
uniform float uBloomStrength;
uniform float uStreak;     // horizontal lens streak, used by the galaxy core
uniform float uTime;
uniform vec2 uResolution;
in vec2 vUv;
out vec4 color;

const vec3 BACKGROUND = vec3(3.0, 3.0, 10.0) / 255.0;
const vec3 RED = vec3(1.0, 0.35, 0.27);
const vec3 VIOLET = vec3(0.60, 0.42, 1.0);
const vec3 BLUE = vec3(0.31, 0.41, 1.0);

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

// A soft glow around a point, fading to nothing well before its neighbours.
float glow(vec2 p, vec2 center, float radius) {
  vec2 d = p - center;
  return exp(-dot(d, d) / (radius * radius));
}

// The background stays black, with a few small patches of the brand colors wandering
// around the screen and slowly breathing.
vec3 backdrop() {
  vec2 p = (vUv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);
  float t = uTime * 0.16;
  vec3 tint = RED * glow(p, vec2(0.55 + 0.3 * sin(t * 0.9), 0.3 + 0.18 * cos(t * 1.3)), 0.16)
                  * (0.7 + 0.3 * sin(t * 1.7))
            + VIOLET * glow(p, vec2(0.35 * sin(t * 0.6 + 2.0), -0.4 + 0.12 * sin(t * 1.1)), 0.18)
                  * (0.7 + 0.3 * sin(t * 1.3 + 1.0))
            + BLUE * glow(p, vec2(-0.6 + 0.25 * cos(t * 0.8), 0.25 + 0.2 * sin(t * 0.7 + 1.0)), 0.16)
                  * (0.7 + 0.3 * sin(t * 1.5 + 2.0))
            + RED * glow(p, vec2(-0.45 + 0.3 * sin(t * 0.5 + 4.0), -0.3 + 0.15 * cos(t * 0.9)), 0.1);
  return BACKGROUND + tint * 0.15;
}

void main() {
  vec3 light = texture(uScene, vUv).rgb + uBloomStrength * texture(uBloom, vUv).rgb;

  if (uStreak > 0.0) {
    vec3 streak = vec3(0.0);
    for (int i = 1; i <= 16; i++) {
      float x = float(i) * 0.02;
      float weight = exp(-float(i) * 0.22);
      streak += (max(texture(uBloom, vUv + vec2(x, 0.0)).rgb - 0.5, 0.0)
               + max(texture(uBloom, vUv - vec2(x, 0.0)).rgb - 0.5, 0.0)) * weight;
    }
    light += uStreak * streak;
  }

  vec3 image = 1.0 - exp(-light * uExposure);
  image += backdrop() * (1.0 - image);
  image = pow(image, vec3(1.0 / 1.08));
  image += (hash(vUv * uResolution + fract(uTime) * 91.7) - 0.5) * (2.2 / 255.0);
  color = vec4(image, 1.0);
}
