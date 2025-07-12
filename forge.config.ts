import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';
import path from 'path';

export default {
  packagerConfig: {
    asar: true,
    appId: "com.lhr.imgs-compress",
    productName: "图片压缩工具",
    extraResource: [
      {
        from: "node_modules/sharp",
        to: "node_modules/sharp"
      }
    ],
    icon: path.resolve(__dirname, 'src/assets/icons/icon')
  },
  rebuildConfig: {},
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
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
      config: {
        options: {
          icon: path.resolve(__dirname, 'src/assets/icons/icon.icns'),
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
