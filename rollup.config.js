import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';

export default [
  {
    // 入口文件
    input: 'packages/vue/src/index.ts',
    // 打包出口
    output: [
      // 导出iife格式的包，适合script标签引入
      {
        sourcemap: true,
        // 生成的包的路径
        file: './packages/vue/dist/vue.js',
        // 生成的包的格式
        format: 'iife',
        // 包的全局变量名
        name: 'Vue'
      }
    ],
    // 插件
    plugins: [
      // ts
      typescript({
        sourceMap: true,
      }),
      // 模块导入路径补全
      resolve(),
      // cjs模块转换esm
      commonjs()
    ]
  }
]