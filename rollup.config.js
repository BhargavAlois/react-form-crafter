import { defineConfig } from "rollup";
import babel from '@rollup/plugin-babel';
import postcss from 'rollup-plugin-postcss';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default defineConfig({
    input: "./src/index.js", 
    output: [
        {
            dir: "dist",
            format: "es", 
            name: "react-form-crafter",
            exports: "default"
        }
    ],
    external: [
      'react',
      'react-dom',
      'bootstrap/dist/css/bootstrap.min.css',
      'bootstrap/dist/js/bootstrap.js',
      'bootstrap',
      'date-fns',
      'react-datepicker',
      'react-datetime-picker',
      'react-icons',
    ],
    plugins: [
        babel({
            exclude: 'node_modules/**',
            presets: ['@babel/preset-env', '@babel/preset-react'],
            babelHelpers: 'bundled',
            extensions: ['.js', '.jsx'],
        }),
        nodeResolve({
            extensions: ['.js', '.jsx'],
        }),
        commonjs(),
        postcss({extract: false})
    ],
});