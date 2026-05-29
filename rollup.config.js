import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import {dts} from 'rollup-plugin-dts';

const external = [
    'react',
    'react-reconciler',
    'react-reconciler/constants',
    'sharp'
];

export default [
    {
        input: 'src/index.ts',
        output: {
            dir: 'dist',
            format: 'cjs'
        },
        plugins: [commonjs(), typescript({ compilerOptions: { module: 'ESNext', moduleResolution: 'bundler' } })],
        external,
    },
    {
        input: 'src/index.ts',
        output: {
            file: 'dist/index.d.ts',
            format: 'es'
        },
        plugins: [dts()],
        external,
    },
];
