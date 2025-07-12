import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';
import path from 'path';

export default {
  packagerConfig: {
    asar: {
      // 不将Sharp打包到asar文件中
      unpack: "**/{node_modules/sharp,node_modules/@img/**/*}"
    },
    appId: "com.lhr.imgs-compress",
    productName: "图片压缩工具",
    icon: path.resolve(__dirname, 'src/assets/icons/icon'),
    // 确保不忽略.vite目录
    ignore: [
      /^\/(?!\.vite|dist|src|node_modules)/
    ]
  },
  rebuildConfig: {
    // 添加Sharp重建配置
    forceRebuild: true,
    onlyModules: ['sharp']
  },
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: "图片压缩工具",
        authors: "lhr",
        setupIcon: path.resolve(__dirname, 'src/assets/icons/icon.ico'),
        iconUrl: path.resolve(__dirname, 'src/assets/icons/icon.ico'),
        loadingGif: path.resolve(__dirname, 'src/assets/icons/installing.gif'),
      },
    },
    {
      name: '@electron-forge/maker-dmg',
      platforms: ['darwin'],
      config: {
        format: 'ULFO',
        icon: path.resolve(__dirname, 'src/assets/icons/icon.icns'),
        iconSize: 80,
        contents: (opts) => {
          return [
            { x: 448, y: 344, type: 'link', path: '/Applications' },
            { x: 192, y: 344, type: 'file', path: opts.appPath }
          ];
        },
        window: {
          size: {
            width: 640,
            height: 480
          }
        }
      }
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          icon: path.resolve(__dirname, 'src/assets/icons/icon.png'),
        }
      }
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {
        options: {
          icon: path.resolve(__dirname, 'src/assets/icons/icon.png'),
        }
      }
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    {
      name: '@electron-forge/plugin-vite',
      config: {
        // `build` can specify multiple entry builds, which can be
        // Main process, Preload scripts, Worker process, etc.
        build: [
          {
            // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
            entry: 'src/main.ts',
            config: 'vite.main.config.ts',
          },
          {
            entry: 'src/preload.ts',
            config: 'vite.preload.config.ts',
          },
        ],
        renderer: [
          {
            name: 'main_window',
            config: 'vite.renderer.config.ts',
          },
        ],
      },
    },
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};
