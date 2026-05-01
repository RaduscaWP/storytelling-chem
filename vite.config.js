import { defineConfig } from 'vite'
import glsl from 'vite-plugin-glsl'

export default defineConfig({
  plugins: [
    glsl({
      include: ['**/*.glsl', '**/*.wgsl', '**/*.vert', '**/*.frag', '**/*.vs', '**/*.fs'],
    }),
  ],
  assetsInclude: ['**/*.glb', '**/*.gltf'],
  server: {
    host: true,
    open: true,
  },
})
