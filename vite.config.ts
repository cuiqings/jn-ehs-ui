import type { UserConfig, ConfigEnv } from 'vite';
import pkg from './package.json';
import dayjs from 'dayjs';
import { loadEnv } from 'vite';
import { resolve } from 'path';
import { generateModifyVars } from './build/generate/generateModifyVars';
import { createProxy } from './build/vite/proxy';
import { wrapperEnv } from './build/utils';
import { createVitePlugins } from './build/vite/plugin';
import { OUTPUT_DIR } from './build/constant';
// import { visualizer } from 'rollup-plugin-visualizer';
function pathResolve(dir: string) {
  return resolve(process.cwd(), '.', dir);
}
const { dependencies, devDependencies, name, version } = pkg;
const __APP_INFO__ = {
  pkg: { dependencies, devDependencies, name, version },
  lastBuildTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
};
export default ({ command, mode }: ConfigEnv): UserConfig => {
  const root = process.cwd();
  const env = loadEnv(mode, root);
  const viteEnv = wrapperEnv(env);
  const { VITE_PORT, VITE_PUBLIC_PATH, VITE_PROXY } = viteEnv;
  const isBuild = command === 'build';
  return {
    base: VITE_PUBLIC_PATH,
    root,
    resolve: {
      alias: [
        {
          find: 'vue-i18n',
          replacement: 'vue-i18n/dist/vue-i18n.cjs.js',
        },
        {
          find: /\/@\//,
          replacement: pathResolve('src') + '/',
        },
        {
          find: /\/#\//,
          replacement: pathResolve('types') + '/',
        },
      ],
      dedupe: ['vue'],
    },
    server: {
      // Listening on all local IPs
      host: true,
      https: false,
      port: VITE_PORT,
      // Load proxy configuration from .env
      proxy: createProxy(VITE_PROXY),
    },
    esbuild: {
      drop: mode === 'production' ? ['console', 'debugger'] : [],
      target: 'es2020',
    },
    build: {
      minify: 'esbuild',
      target: 'es2020',
      cssTarget: 'chrome80',
      assetsInlineLimit: 8192,
      outDir: OUTPUT_DIR,
      reportCompressedSize: false,
      chunkSizeWarningLimit: 2000,
    },
    define: {
      __INTLIFY_PROD_DEVTOOLS__: false,
      __APP_INFO__: JSON.stringify(__APP_INFO__),
    },
    css: {
      preprocessorOptions: {
        less: {
          modifyVars: generateModifyVars(),
          javascriptEnabled: true,
        },
      },
    },
    plugins: [
      createVitePlugins(viteEnv, isBuild),
      // visualizer({
      //   open: true, // 注意这里要设置为true，否则无效
      //   gzipSize: true, // 分析图生成的文件名
      //   brotliSize: true, // 收集 brotli 大小并将其显示
      //   filename: 'stats.html', // 分析图生成的文件名
      // }),
    ],
    optimizeDeps: {
      esbuildOptions: {
        target: 'es2020',
        supported: {
          // 对现代浏览器可启用更高级特性
          'top-level-await': true,
        },
      },
      include: [
        '@vue/runtime-core',
        '@vue/shared',
        '@iconify/iconify',
        'ant-design-vue/es/locale/zh_CN',
        'ant-design-vue/es/locale/en_US',
        '@ant-design/icons-vue',
      ],
      exclude: ['vue-demi'],
    },
  };
};
