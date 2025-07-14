import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: 'es',
    sourcemap: true,
    preserveModules: true,
    preserveModulesRoot: 'src'
  },
  external: [/^lit/],
  plugins: [
    nodeResolve(),
    typescript({
      tsconfig: './tsconfig.json'
    })
  ]
};