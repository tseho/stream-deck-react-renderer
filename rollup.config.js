import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import {dts} from 'rollup-plugin-dts';

export default [
    {
        input: 'src/index.ts',
        output: {
            dir: 'dist',
            format: 'cjs'
        },
        plugins: [commonjs(), typescript(), dts()],
        external: [
            'react-reconciler',
            'react-reconciler/constants',
            'sharp'
        ]
    }
];
