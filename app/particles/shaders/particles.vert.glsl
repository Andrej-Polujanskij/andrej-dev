#version 300 es
precision highp float;

// Every particle has a position in each of the four formations. Each formation is one function
// below; uWeights blends them while the page scrolls from one scene to the next.
// Order of uWeights matches FORMATIONS in formations.ts.

in vec3 aSphere;     // unit direction on the sphere
in vec4 aHelix;      // xyz point, w brightness (strand, rung or dust)
in vec3 aHorizon;    // grid point (x, unused, z); the height is animated here
in vec4 aGalaxy;     // radius, angle, height, w kind (0 ring, 1 haze, 2 dust, 3 core)
in vec2 aSeed;       // x random 0..1, y is 1 for the few extra bright sparkles

uniform mat4 uViewProjection;
uniform vec3 uEye;
uniform float uTime;
uniform float uWeights[4];
uniform vec3 uSphereOffset;    // moves the shape beside the text
uniform float uPixelRatio;
uniform float uMinSize;
uniform float uGain;
uniform float uIntro;

out vec3 vLight;

// light: color already multiplied by brightness. size: blur radius in CSS pixels.
struct Particle {
  vec3 position;
  vec3 light;
  float size;
};

const vec3 RED = vec3(1.0, 0.30, 0.22);
const vec3 VIOLET = vec3(0.62, 0.38, 1.0);
const vec3 BLUE = vec3(0.24, 0.40, 1.0);

float smoothRange(float edge0, float edge1, float x) {
  float t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
  return t * t * (3.0 - 2.0 * t);
}

vec3 rotateY(vec3 p, float angle) {
  float c = cos(angle), s = sin(angle);
  return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z);
}

// Blue at 0, violet at 0.5, red at 1.
vec3 brandRamp(float t) {
  t = clamp(t, 0.0, 1.0);
  return t < 0.5 ? mix(BLUE, VIOLET, t * 2.0) : mix(VIOLET, RED, (t - 0.5) * 2.0);
}

float waves(vec3 p, float t) {
  return sin(p.x * 1.7 + t * 0.5 + sin(p.y * 2.3 - t * 0.35) * 1.5) * 0.5
       + sin(p.y * 3.1 + p.z * 2.2 - t * 0.6) * 0.3
       + sin(p.z * 2.6 + p.x * 1.9 + t * 0.4) * 0.2;
}

bool isSparkle() {
  return aSeed.y > 0.5;
}

// Meridian lines on a wobbling sphere, bright where they turn away from the camera.
Particle sphere() {
  float t = uTime * 1.3;
  vec3 normal = aSphere;
  float theta = atan(normal.z, normal.x);
  float phi = acos(clamp(normal.y, -1.0, 1.0));

  float ripple = 0.012 * sin(phi * 13.0 + sin(theta * 3.0 + 1.3) * 2.2 + t * 0.7)
               + 0.011 * sin(theta * 7.0 + phi * 9.0 + 2.0 + t * 0.55)
               + 0.007 * sin(phi * 23.0 - theta * 4.0 + t * 1.1)
               + 0.005 * sin(phi * 37.0 + theta * 2.0 - t * 1.3);
  vec3 p = normal * 3.15;
  p *= 1.0 + 0.06 * waves(p * 1.1, t) + ripple * 1.35;
  float twist = 0.02 * sin(p.y * 6.5 + 3.3 + t * 0.9 + theta * 2.0) + 0.008 * sin(p.y * 17.0 + theta * 9.0 - t);
  p += vec3(p.z, 0.0, -p.x) * twist;

  float spin = uTime * 0.085;
  p = rotateY(p, spin);
  normal = rotateY(normal, spin);
  p += uSphereOffset;

  float facing = dot(normal, normalize(uEye - p));
  float edge = abs(facing);
  float alpha = 0.08 + 3.4 * pow(smoothRange(0.85, 0.0, edge), 1.5);
  if (facing < 0.0) alpha *= 0.55;

  vec3 color = brandRamp(smoothRange(-2.7, 2.5, p.y * 0.95 + p.x * 0.3)) * (0.9 + 0.1 * aSeed.x);
  color = mix(color, vec3(0.78, 0.78, 0.95), smoothRange(0.55, 0.98, edge) * 0.55);
  float brightness = 0.289 * alpha;
  if (isSparkle()) return Particle(p, color * 1.2 * brightness * 1.7, 1.0);
  return Particle(p, color * brightness, 0.55);
}

// A turning double helix with rungs and a haze of dust.
Particle helix() {
  vec3 p = rotateY(aHelix.xyz, uTime * 0.35);
  float height = (p.y + 6.0) / 12.0;
  vec3 color = mix(BLUE, VIOLET, height * 0.3) * 0.85 + vec3(0.75, 0.8, 1.0) * 0.15;
  if (aSeed.x < 0.08) color = vec3(1.0, 0.55, 0.7);
  float brightness = 0.735 * aHelix.w * (0.5 + fract(aSeed.x * 7.31));
  if (isSparkle()) return Particle(p, (color * 1.3 + 0.2) * brightness * 2.6, 1.3);
  return Particle(p, color * brightness, 0.6);
}

// Rolling waves on a wide grid, glowing where they crest.
Particle horizon() {
  float x = aHorizon.x, z = aHorizon.z;
  float amplitude = 0.55 + 1.25 * smoothRange(0.0, -60.0, z);
  float y = (sin(x * 0.30 + z * 0.05 + uTime * 0.40)
           + sin(z * 0.23 - uTime * 0.30 + x * 0.10) * 0.85
           + sin(x * 0.62 + z * 0.36 + uTime * 0.50) * 0.6
           + sin(x * 0.95 - z * 0.52 + uTime * 0.70) * 0.35
           + sin(x * 0.14 - uTime * 0.2) * 0.9) * 0.55 * amplitude - 1.6;
  vec3 p = vec3(x, y, z);

  float crest = smoothRange(-2.2, 1.2, y);
  vec3 color = brandRamp(smoothRange(-26.0, 26.0, x)) * (0.55 + 0.9 * crest);
  float dist = length(p - uEye);
  float alpha = (0.2 + 0.7 * crest) * smoothRange(95.0, 40.0, dist) * (0.8 + 0.2 * smoothRange(4.0, 30.0, dist));
  return Particle(p, color * 0.7245 * alpha, 0.55);
}

// Thin rings around a hot core.
Particle galaxy() {
  float radius = aGalaxy.x;
  float angle = aGalaxy.y + uTime * 0.22 / (radius * 0.35 + 1.0);
  vec3 p = vec3(cos(angle) * radius, aGalaxy.z, sin(angle) * radius);
  float kind = aGalaxy.w;
  if (kind > 2.5) return Particle(p, vec3(1.0, 0.78, 0.72) * 0.04375, 2.0);

  vec3 color = mix(vec3(1.0, 0.45, 0.42), VIOLET, smoothRange(0.7, 2.6, radius));
  color = mix(color, BLUE, smoothRange(2.6, 5.5, radius)) * 0.85 + 0.15;
  float alpha = (kind < 0.5 ? 0.9 : (kind < 1.5 ? 0.3 : 0.12)) * (0.5 + aSeed.x) * (1.3 - 0.5 * smoothRange(1.0, 6.0, radius));
  return Particle(p, color * 0.315 * alpha, 0.55);
}

void add(inout Particle sum, Particle p, float weight) {
  sum.position += p.position * weight;
  sum.light += p.light * weight;
  sum.size += p.size * weight;
}

void main() {
  Particle sum = Particle(vec3(0.0), vec3(0.0), 0.0);
  if (uWeights[0] > 0.0) add(sum, sphere(), uWeights[0]);
  if (uWeights[1] > 0.0) add(sum, helix(), uWeights[1]);
  if (uWeights[2] > 0.0) add(sum, horizon(), uWeights[2]);
  if (uWeights[3] > 0.0) add(sum, galaxy(), uWeights[3]);

  gl_Position = uViewProjection * vec4(sum.position, 1.0);

  // Large particles (sparkles, galaxy core) grow when the camera comes close.
  float size = sum.size > 0.9 ? sum.size * clamp(10.0 / length(sum.position - uEye), 0.8, 2.2) : sum.size;
  float twinkle = 0.86 + 0.14 * sin(uTime * 2.4 + aSeed.x * 60.0);
  vLight = sum.light * uGain * twinkle * uIntro;
  gl_PointSize = min(max(size, uMinSize) * uPixelRatio * 6.0, 64.0);
}
