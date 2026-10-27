import type { Vec3 } from '~/utils/math';
import { clamp } from '~/utils/math';
import type { LayoutOffsets, ParticleData } from './formations';
import blurShader from './shaders/blur.frag.glsl?raw';
import compositeShader from './shaders/composite.frag.glsl?raw';
import downsampleShader from './shaders/downsample.frag.glsl?raw';
import fullscreenShader from './shaders/fullscreen.vert.glsl?raw';
import particlesFragmentShader from './shaders/particles.frag.glsl?raw';
import particlesVertexShader from './shaders/particles.vert.glsl?raw';

/** How the light of a scene is developed into the final image. */
export interface Look {
  /** Higher is brighter; bright areas saturate softly instead of clipping. */
  exposure: number;
  /** Strength of the glow around bright particles. */
  bloom: number;
  /** Size of the glow in CSS pixels. */
  bloomRadius: number;
  /** Horizontal lens streak through very bright spots. */
  streak?: number;
}

export interface Frame {
  viewProjection: Float32Array;
  eye: Vec3;
  /** One weight per formation, in FORMATIONS order. */
  weights: number[];
  look: Look;
  /** Seconds; drives all particle animation. */
  time: number;
  /** 0..1 fade-in when the page opens. */
  intro: number;
  offsets: LayoutOffsets;
}

export interface ParticleRenderer {
  resize: (cssWidth: number, cssHeight: number, pixelRatio: number) => void;
  render: (frame: Frame) => void;
  dispose: () => void;
}

// Brightness is tuned for this many particles on a 1440 x 900 screen.
const REFERENCE_COUNT = 166_920;
const REFERENCE_AREA = 1440 * 900;

interface Target {
  texture: WebGLTexture;
  framebuffer: WebGLFramebuffer;
  width: number;
  height: number;
}

const compile = (gl: WebGL2RenderingContext, type: number, source: string) => {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('Could not create a shader');
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
    throw new Error(gl.getShaderInfoLog(shader) ?? '');
  return shader;
};

const createProgram = (gl: WebGL2RenderingContext, vertex: string, fragment: string) => {
  const program = gl.createProgram();
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, vertex));
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, fragment));
  gl.bindAttribLocation(program, 0, 'aPosition');
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS))
    throw new Error(gl.getProgramInfoLog(program) ?? '');
  const locations = new Map<string, WebGLUniformLocation | null>();
  const uniform = (name: string) => {
    if (!locations.has(name)) locations.set(name, gl.getUniformLocation(program, name));
    return locations.get(name) ?? null;
  };
  return { program, uniform };
};

/** A floating point texture to render into, so bright light is not clipped before bloom. */
const createTarget = (gl: WebGL2RenderingContext, width: number, height: number): Target | null => {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, width, height, 0, gl.RGBA, gl.HALF_FLOAT, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  const complete = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  return complete ? { texture, framebuffer, width, height } : null;
};

const deleteTarget = (gl: WebGL2RenderingContext, target: Target | null) => {
  if (!target) return;
  gl.deleteTexture(target.texture);
  gl.deleteFramebuffer(target.framebuffer);
};

/**
 * Draws the particles into a floating point image, blurs a quarter-size copy of it for the glow
 * and combines both on screen. Without floating point support it draws straight to the screen.
 * Returns null when the browser has no WebGL2.
 */
export const createParticleRenderer = (
  canvas: HTMLCanvasElement,
  data: ParticleData,
): ParticleRenderer | null => {
  const gl = canvas.getContext('webgl2', {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: false,
    powerPreference: 'high-performance',
  });
  if (!gl) return null;

  let floatTargets =
    !!gl.getExtension('EXT_color_buffer_float') || !!gl.getExtension('EXT_color_buffer_half_float');
  const particles = createProgram(gl, particlesVertexShader, particlesFragmentShader);
  const downsample = createProgram(gl, fullscreenShader, downsampleShader);
  const blur = createProgram(gl, fullscreenShader, blurShader);
  const composite = createProgram(gl, fullscreenShader, compositeShader);

  const particleVao = gl.createVertexArray();
  gl.bindVertexArray(particleVao);
  for (const { name, size, data: values } of data.attributes) {
    const location = gl.getAttribLocation(particles.program, name);
    if (location < 0) continue;
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, values, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
  }

  const fullscreenVao = gl.createVertexArray();
  gl.bindVertexArray(fullscreenVao);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.bindVertexArray(null);
  gl.disable(gl.DEPTH_TEST);

  let width = 1;
  let height = 1;
  let cssArea = REFERENCE_AREA;
  let pixelRatio = 1;
  let scene: Target | null = null;
  let half: Target | null = null;
  let quarter: Target | null = null;
  let quarterBlurred: Target | null = null;

  // Slow devices draw fewer particles (and brighter, to keep the same look).
  let quality = 1;
  let frameTime = 16;
  let frames = 0;
  let lastFrameAt = performance.now();

  const adaptQuality = () => {
    const now = performance.now();
    frameTime = frameTime * 0.94 + Math.min(now - lastFrameAt, 100) * 0.06;
    lastFrameAt = now;
    if (++frames % 45 !== 0) return;
    if (frameTime > 26) quality = Math.max(0.4, quality * 0.86);
    else if (frameTime < 17) quality = Math.min(1, quality * 1.06);
  };

  const resize = (cssWidth: number, cssHeight: number, ratio: number) => {
    pixelRatio = ratio;
    cssArea = cssWidth * cssHeight;
    width = Math.max(1, Math.round(cssWidth * ratio));
    height = Math.max(1, Math.round(cssHeight * ratio));
    canvas.width = width;
    canvas.height = height;
    if (!floatTargets) return;

    for (const target of [scene, half, quarter, quarterBlurred]) deleteTarget(gl, target);
    const quarterWidth = Math.max(1, Math.round(width / 4));
    const quarterHeight = Math.max(1, Math.round(height / 4));
    scene = createTarget(gl, width, height);
    half = createTarget(
      gl,
      Math.max(1, Math.round(width / 2)),
      Math.max(1, Math.round(height / 2)),
    );
    quarter = createTarget(gl, quarterWidth, quarterHeight);
    quarterBlurred = createTarget(gl, quarterWidth, quarterHeight);
    if (!scene || !half || !quarter || !quarterBlurred) floatTargets = false;
  };

  const drawParticles = (frame: Frame) => {
    const density = (REFERENCE_COUNT / data.count) * (cssArea / REFERENCE_AREA);
    // Straight to screen there is no tone mapping, so the light is dimmed instead.
    const gain = (clamp(density, 0.3, 2.5) * (floatTargets ? 1 : 0.33)) / Math.max(quality, 0.35);

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    gl.useProgram(particles.program);
    gl.uniformMatrix4fv(particles.uniform('uViewProjection'), false, frame.viewProjection);
    gl.uniform3fv(particles.uniform('uEye'), frame.eye);
    gl.uniform1f(particles.uniform('uTime'), frame.time);
    gl.uniform1fv(particles.uniform('uWeights'), frame.weights);
    gl.uniform3fv(particles.uniform('uSphereOffset'), frame.offsets.sphere);
    gl.uniform1f(particles.uniform('uPixelRatio'), pixelRatio);
    gl.uniform1f(particles.uniform('uMinSize'), 0.8 / pixelRatio);
    gl.uniform1f(particles.uniform('uGain'), gain);
    gl.uniform1f(particles.uniform('uIntro'), frame.intro);
    gl.bindVertexArray(particleVao);
    gl.drawArrays(gl.POINTS, 0, Math.floor(data.count * quality));
    gl.disable(gl.BLEND);
  };

  const pass = (target: Target | null) => {
    gl.bindFramebuffer(gl.FRAMEBUFFER, target?.framebuffer ?? null);
    gl.viewport(0, 0, target?.width ?? width, target?.height ?? height);
  };

  const sample = (unit: number, target: Target) => {
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, target.texture);
  };

  const render = (frame: Frame) => {
    adaptQuality();
    if (!floatTargets || !scene || !half || !quarter || !quarterBlurred) {
      pass(null);
      drawParticles(frame);
      return;
    }

    pass(scene);
    drawParticles(frame);
    gl.bindVertexArray(fullscreenVao);

    // Shrink to a quarter for a wide, cheap glow
    gl.useProgram(downsample.program);
    gl.uniform1i(downsample.uniform('uSource'), 0);
    pass(half);
    sample(0, scene);
    gl.uniform2f(downsample.uniform('uTexel'), 0.5 / scene.width, 0.5 / scene.height);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    pass(quarter);
    sample(0, half);
    gl.uniform2f(downsample.uniform('uTexel'), 0.5 / half.width, 0.5 / half.height);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // Blur it horizontally, then vertically
    gl.useProgram(blur.program);
    gl.uniform1i(blur.uniform('uSource'), 0);
    gl.uniform1f(blur.uniform('uSigma'), Math.max(1, (frame.look.bloomRadius * pixelRatio) / 4));
    pass(quarterBlurred);
    sample(0, quarter);
    gl.uniform2f(blur.uniform('uDirection'), 1 / quarter.width, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    pass(quarter);
    sample(0, quarterBlurred);
    gl.uniform2f(blur.uniform('uDirection'), 0, 1 / quarter.height);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // Combine on screen
    gl.useProgram(composite.program);
    pass(null);
    sample(0, scene);
    sample(1, quarter);
    gl.uniform1i(composite.uniform('uScene'), 0);
    gl.uniform1i(composite.uniform('uBloom'), 1);
    gl.uniform1f(composite.uniform('uExposure'), frame.look.exposure);
    gl.uniform1f(composite.uniform('uBloomStrength'), frame.look.bloom);
    gl.uniform1f(composite.uniform('uStreak'), frame.look.streak ?? 0);
    gl.uniform1f(composite.uniform('uTime'), frame.time);
    gl.uniform2f(composite.uniform('uResolution'), width, height);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindVertexArray(null);
  };

  const dispose = () => gl.getExtension('WEBGL_lose_context')?.loseContext();

  return { resize, render, dispose };
};
