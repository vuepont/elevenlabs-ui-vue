import { templateCompilerOptions } from '@tresjs/core'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    vue({
      // TresJS requires this for custom elements
      ...templateCompilerOptions,
    }),
  ],
  // resolve: {
  //   alias: {
  //     // This solves the "Directory import" error by pointing to the specific file
  //     'three-custom-shader-material/vanilla': 'three-custom-shader-material/vanilla/dist/three-custom-shader-material-vanilla.cjs.js',
  //   },
  // },
  // optimizeDeps: {
  //   include: [
  //     'three',
  //     'three-custom-shader-material/vanilla',
  //     '@tresjs/cientos',
  //     '@tresjs/core',
  //   ],
  // },
})
