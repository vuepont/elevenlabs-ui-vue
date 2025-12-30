<!-- eslint-disable style/max-statements-per-line -->
<script setup lang="ts">
import type { AgentState } from './Orb.vue'
import { useTexture } from '@tresjs/cientos'
import { useLoop } from '@tresjs/core'
// import { RepeatWrapping, TextureLoader } from 'three'
import * as THREE from 'three'
import { onMounted, onUnmounted, ref } from 'vue'

const props = defineProps<{
  colors: [string, string]
  colorsRef?: { value: [string, string] }
  seed?: number
  agentState: AgentState
  volumeMode: 'auto' | 'manual'
  manualInput?: number
  manualOutput?: number
  inputVolumeRef?: { value: number }
  outputVolumeRef?: { value: number }
  getInputVolume?: () => number
  getOutputVolume?: () => number
}>()

const circleRef = ref()
const curIn = ref(0)
const curOut = ref(0)
const animSpeed = ref(0.1)

const targetColor1 = ref(new THREE.Color(props.colors[0]))
const targetColor2 = ref(new THREE.Color(props.colors[1]))

// Load texture using TresJS composable
const perlinTexture = await useTexture('https://storage.googleapis.com/eleven-public-cdn/images/perlin-noise.png')

if (perlinTexture instanceof THREE.Texture) {
  perlinTexture.wrapS = THREE.RepeatWrapping
  perlinTexture.wrapT = THREE.RepeatWrapping
  // perlinTexture.needsUpdate = true // Ensure Three.js notices the change
}

const random = splitmix32(props.seed ?? Math.floor(Math.random() * 2 ** 32))
const offsets = new Float32Array(Array.from({ length: 7 }, () => random() * Math.PI * 2))

// const dummyTexture = new THREE.Texture()

const uniforms = {
  uColor1: { value: new THREE.Color(props.colors[0]) },
  uColor2: { value: new THREE.Color(props.colors[1]) },
  uOffsets: { value: offsets },
  uPerlinTexture: { value: perlinTexture },
  // uPerlinTexture: { value: dummyTexture },
  uTime: { value: 0 },
  uAnimation: { value: 0.1 },
  uInverted: { value: 0 },
  uInputVolume: { value: 0 },
  uOutputVolume: { value: 0 },
  uOpacity: { value: 0 },
}

const perlin = ref<THREE.Texture | null>(null)

// onMounted(() => {
//   const loader = new TextureLoader()
//   loader.load(
//     'https://storage.googleapis.com/eleven-public-cdn/images/perlin-noise.png',
//     (texture) => {
//       texture.wrapS = RepeatWrapping
//       texture.wrapT = RepeatWrapping
//       perlin.value = texture
//       uniforms.uPerlinTexture.value = texture

//       const mesh = circleRef.value
//       if (mesh?.material) {
//         mesh.material.needsUpdate = true
//       }
//     },
//   )
// })

// Dark mode observer
onMounted(() => {
  const apply = () => {
    const isDark = document.documentElement.classList.contains('dark')
    uniforms.uInverted.value = isDark ? 1 : 0
  }
  apply()
  const observer = new MutationObserver(apply)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  onUnmounted(() => observer.disconnect())
})

// Animation Loop
const { onBeforeRender } = useLoop()

onBeforeRender(({ delta }) => {
  if (!circleRef.value)
    return

  // Update live colors
  if (props.colorsRef?.value) {
    targetColor1.value.set(props.colorsRef.value[0])
    targetColor2.value.set(props.colorsRef.value[1])
  }
  else {
    targetColor1.value.set(props.colors[0])
    targetColor2.value.set(props.colors[1])
  }

  uniforms.uTime.value += delta * 0.5
  if (uniforms.uOpacity.value < 1) {
    uniforms.uOpacity.value = Math.min(1, uniforms.uOpacity.value + delta * 2)
  }

  let targetIn = 0
  let targetOut = 0.3

  if (props.volumeMode === 'manual') {
    targetIn = clamp01(props.manualInput ?? props.inputVolumeRef?.value ?? props.getInputVolume?.() ?? 0)
    targetOut = clamp01(props.manualOutput ?? props.outputVolumeRef?.value ?? props.getOutputVolume?.() ?? 0)
  }
  else {
    const t = uniforms.uTime.value * 2
    if (props.agentState === null) {
      targetIn = 0; targetOut = 0.3
    }
    else if (props.agentState === 'listening') {
      targetIn = clamp01(0.55 + Math.sin(t * 3.2) * 0.35)
      targetOut = 0.45
    }
    else if (props.agentState === 'talking') {
      targetIn = clamp01(0.65 + Math.sin(t * 4.8) * 0.22)
      targetOut = clamp01(0.75 + Math.sin(t * 3.6) * 0.22)
    }
    else {
      const base = 0.38 + 0.07 * Math.sin(t * 0.7)
      const wander = 0.05 * Math.sin(t * 2.1) * Math.sin(t * 0.37 + 1.2)
      targetIn = clamp01(base + wander)
      targetOut = clamp01(0.48 + 0.12 * Math.sin(t * 1.05 + 0.6))
    }
  }

  curIn.value += (targetIn - curIn.value) * 0.2
  curOut.value += (targetOut - curOut.value) * 0.2

  // Speed calculation logic
  const targetSpeed = 0.1 + (1 - (curOut.value - 1) ** 2) * 0.9
  animSpeed.value += (targetSpeed - animSpeed.value) * 0.12

  // Update uniforms
  uniforms.uAnimation.value += delta * animSpeed.value
  uniforms.uInputVolume.value = curIn.value
  uniforms.uOutputVolume.value = curOut.value
  uniforms.uColor1.value.lerp(targetColor1.value, 0.08)
  uniforms.uColor2.value.lerp(targetColor2.value, 0.08)

  // curIn.value += (targetIn - curIn.value) * 0.2
  // curOut.value += (targetOut - curOut.value) * 0.2

  // const targetSpeed = 0.1 + (1 - (curOut.value - 1) ** 2) * 0.9
  // animSpeed.value += (targetSpeed - animSpeed.value) * 0.12

  // uniforms.uAnimation.value += delta * animSpeed.value
  // uniforms.uInputVolume.value = curIn.value
  // uniforms.uOutputVolume.value = curOut.value
  // uniforms.uColor1.value.lerp(targetColor1.value, 0.08)
  // uniforms.uColor2.value.lerp(targetColor2.value, 0.08)
})

function splitmix32(a: number) {
  return function () {
    a |= 0
    a = (a + 0x9E3779B9) | 0
    let t = a ^ (a >>> 16)
    t = Math.imul(t, 0x21F0AAAD)
    t ^= t >>> 15
    t = Math.imul(t, 0x735A2D97)
    return ((t ^= t >>> 15) >>> 0) / 4294967296
  }
}

function clamp01(n: number) {
  if (!Number.isFinite(n))
    return 0
  return Math.min(1, Math.max(0, n))
}

const vertexShader = /* glsl */ `
uniform float uTime;
uniform sampler2D uPerlinTexture;
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const fragmentShader = /* glsl */ `
uniform float uTime;
uniform float uAnimation;
uniform float uInverted;
uniform float uOffsets[7];
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform float uInputVolume;
uniform float uOutputVolume;
uniform float uOpacity;
uniform sampler2D uPerlinTexture;
varying vec2 vUv;

const float PI = 3.14159265358979323846;

// Draw a single oval with soft edges and calculate its gradient color
bool drawOval(vec2 polarUv, vec2 polarCenter, float a, float b, bool reverseGradient, float softness, out vec4 color) {
    vec2 p = polarUv - polarCenter;
    float oval = (p.x * p.x) / (a * a) + (p.y * p.y) / (b * b);

    float edge = smoothstep(1.0, 1.0 - softness, oval);

    if (edge > 0.0) {
        float gradient = reverseGradient ? (1.0 - (p.x / a + 1.0) / 2.0) : ((p.x / a + 1.0) / 2.0);
        // Flatten gradient toward middle value for more uniform appearance
        gradient = mix(0.5, gradient, 0.1);
        color = vec4(vec3(gradient), 0.85 * edge);
        return true;
    }
    return false;
}

// Map grayscale value to a 4-color ramp (color1, color2, color3, color4)
vec3 colorRamp(float grayscale, vec3 color1, vec3 color2, vec3 color3, vec3 color4) {
    if (grayscale < 0.33) {
        return mix(color1, color2, grayscale * 3.0);
    } else if (grayscale < 0.66) {
        return mix(color2, color3, (grayscale - 0.33) * 3.0);
    } else {
        return mix(color3, color4, (grayscale - 0.66) * 3.0);
    }
}

vec2 hash2(vec2 p) {
    return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453);
}

// 2D noise for the ring
float noise2D(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    
    vec2 u = f * f * (3.0 - 2.0 * f);
    float n = mix(
        mix(dot(hash2(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
            dot(hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
        mix(dot(hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
            dot(hash2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x),
        u.y
    );

    return 0.5 + 0.5 * n;
}

float sharpRing(vec3 decomposed, float time) {
    float ringStart = 1.0;
    float ringWidth = 0.3;
    float noiseScale = 5.0;

    float noise = mix(
        noise2D(vec2(decomposed.x, time) * noiseScale),
        noise2D(vec2(decomposed.y, time) * noiseScale),
        decomposed.z
    );

    noise = (noise - 0.5) * 2.5;

    return ringStart + noise * ringWidth * 1.5;
}

float smoothRing(vec3 decomposed, float time) {
    float ringStart = 0.9;
    float ringWidth = 0.2;
    float noiseScale = 6.0;

    float noise = mix(
        noise2D(vec2(decomposed.x, time) * noiseScale),
        noise2D(vec2(decomposed.y, time) * noiseScale),
        decomposed.z
    );

    noise = (noise - 0.5) * 5.0;

    return ringStart + noise * ringWidth;
}

float flow(vec3 decomposed, float time) {
    return mix(
        texture(uPerlinTexture, vec2(time, decomposed.x / 2.0)).r,
        texture(uPerlinTexture, vec2(time, decomposed.y / 2.0)).r,
        decomposed.z
    );
}

void main() {
    // Normalize vUv to be centered around (0.0, 0.0)
    vec2 uv = vUv * 2.0 - 1.0;

    // Convert uv to polar coordinates
    float radius = length(uv);
    float theta = atan(uv.y, uv.x);
    if (theta < 0.0) theta += 2.0 * PI; // Normalize theta to [0, 2*PI]

    // Decomposed angle is used for sampling noise textures without seams:
    // float noise = mix(sample(decomposed.x), sample(decomposed.y), decomposed.z);
    vec3 decomposed = vec3(
        // angle in the range [0, 1]
        theta / (2.0 * PI),
        // angle offset by 180 degrees in the range [1, 2]
        mod(theta / (2.0 * PI) + 0.5, 1.0) + 1.0,
        // mixing factor between two noises
        abs(theta / PI - 1.0)
    );

    // Add noise to the angle for a flow-like distortion (reduced for flatter look)
    float noise = flow(decomposed, radius * 0.03 - uAnimation * 0.2) - 0.5;
    theta += noise * mix(0.08, 0.25, uOutputVolume);

    // Initialize the base color to white
    vec4 color = vec4(1.0, 1.0, 1.0, 1.0);

    // Original parameters for the ovals in polar coordinates
    float originalCenters[7] = float[7](0.0, 0.5 * PI, 1.0 * PI, 1.5 * PI, 2.0 * PI, 2.5 * PI, 3.0 * PI);

    // Parameters for the animated centers in polar coordinates
    float centers[7];
    for (int i = 0; i < 7; i++) {
        centers[i] = originalCenters[i] + 0.5 * sin(uTime / 20.0 + uOffsets[i]);
    }

    float a, b;
    vec4 ovalColor;

    // Check if the pixel is inside any of the ovals
    for (int i = 0; i < 7; i++) {
        float noise = texture(uPerlinTexture, vec2(mod(centers[i] + uTime * 0.05, 1.0), 0.5)).r;
        a = 0.5 + noise * 0.3; // Increased for more coverage
        b = noise * mix(3.5, 2.5, uInputVolume); // Increased height for fuller appearance
        bool reverseGradient = (i % 2 == 1); // Reverse gradient for every second oval

        // Calculate the distance in polar coordinates
        float distTheta = min(
            abs(theta - centers[i]),
            min(
                abs(theta + 2.0 * PI - centers[i]),
                abs(theta - 2.0 * PI - centers[i])
            )
        );
        float distRadius = radius;

        float softness = 0.6; // Increased softness for flatter, less pronounced edges

        // Check if the pixel is inside the oval in polar coordinates
        if (drawOval(vec2(distTheta, distRadius), vec2(0.0, 0.0), a, b, reverseGradient, softness, ovalColor)) {
            // Blend the oval color with the existing color
            color.rgb = mix(color.rgb, ovalColor.rgb, ovalColor.a);
            color.a = max(color.a, ovalColor.a); // Max alpha
        }
    }
    
    // Calculate both noisy rings
    float ringRadius1 = sharpRing(decomposed, uTime * 0.1);
    float ringRadius2 = smoothRing(decomposed, uTime * 0.1);
    
    // Adjust rings based on input volume (reduced for flatter appearance)
    float inputRadius1 = radius + uInputVolume * 0.2;
    float inputRadius2 = radius + uInputVolume * 0.15;
    float opacity1 = mix(0.2, 0.6, uInputVolume);
    float opacity2 = mix(0.15, 0.45, uInputVolume);

    // Blend both rings
    float ringAlpha1 = (inputRadius2 >= ringRadius1) ? opacity1 : 0.0;
    float ringAlpha2 = smoothstep(ringRadius2 - 0.05, ringRadius2 + 0.05, inputRadius1) * opacity2;
    
    float totalRingAlpha = max(ringAlpha1, ringAlpha2);
    
    // Apply screen blend mode for combined rings
    vec3 ringColor = vec3(1.0); // White ring color
    color.rgb = 1.0 - (1.0 - color.rgb) * (1.0 - ringColor * totalRingAlpha);

    // Define colours to ramp against greyscale (could increase the amount of colours in the ramp)
    vec3 color1 = vec3(0.0, 0.0, 0.0); // Black
    vec3 color2 = uColor1; // Darker Color
    vec3 color3 = uColor2; // Lighter Color
    vec3 color4 = vec3(1.0, 1.0, 1.0); // White

    // Convert grayscale color to the color ramp
    float luminance = mix(color.r, 1.0 - color.r, uInverted);
    color.rgb = colorRamp(luminance, color1, color2, color3, color4); // Apply the color ramp

    // Apply fade-in opacity
    color.a *= uOpacity;

    gl_FragColor = color;
}
`
</script>

<template>
  <TresMesh ref="circleRef">
    <CircleGeometry :args="[3.5, 64]" />
    <ShaderMaterial
      :vertex-shader="vertexShader"
      :fragment-shader="fragmentShader"
      :uniforms="uniforms"
      :transparent="true"
    />
  </TresMesh>
</template>
