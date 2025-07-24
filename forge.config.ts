import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { VitePlugin } from '@electron-forge/plugin-vite';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';
import { PublisherGithub } from '@electron-forge/publisher-github';

const config: ForgeConfig = {
  packagerConfig: {
    "asar": {
      "unpack": "**/node_modules/{sharp,@img}/**/*"
    },
    icon: './src/assets/icons/icon', // 不需要扩展名，Electron Forge会根据平台自动选择
    osxSign: {}, // 用于macOS签名
    osxNotarize: {
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_PASSWORD,
      teamId: process.env.APPLE_TEAM_ID
    }
  },
  rebuildConfig: {},
  makers: [
    // Windows
    new MakerSquirrel({
      name: "LocalSqueeze",
      description: "图片压缩工具",
      setupIcon: './src/assets/icons/win/icon.ico',
      setupExe: 'LocalSqueeze-Setup.exe',
      noMsi: false,
      // 设置为Windows GUI应用程序（无控制台）
      loadingGif: './src/assets/icons/win/installer.svg'
    }),
    // macOS
    new MakerZIP({}, ['darwin']),
    // Linux
    new MakerDeb({
      options: {
        icon: './src/assets/icons/png/512x512.png',
        categories: ['Utility']
      }
    }),
    new MakerRpm({
      options: {
        icon: './src/assets/icons/png/512x512.png',
        categories: ['Utility']
      }
    }),
    // 为所有平台创建ZIP包
    new MakerZIP({}, ['win32', 'linux'])
  ],
  publishers: [
    new PublisherGithub({
      repository: {
        owner: 'freeany',
        name: 'LocalSqueeze'
      },
      prerelease: false,
      draft: true, // 设置为true可以先创建草稿，检查后再发布
      authToken: process.env.GITHUB_TOKEN,
      tagPrefix: 'v' // 版本标签前缀
    })
  ],
  plugins: [
    new VitePlugin({
      // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
      // If you are familiar with Vite configuration, it will look really familiar.
      build: [
        {
          // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
          entry: 'src/main.ts',
          config: 'vite.main.config.ts',
          target: 'main',
        },
        {
          entry: 'src/preload.ts',
          config: 'vite.preload.config.ts',
          target: 'preload',
        },
      ],
      renderer: [
        {
          name: 'main_window',
          config: 'vite.renderer.config.ts',
        },
      ],
    }),
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
    {
      name: "@timfish/forge-externals-plugin",
      config: {
        "externals": ["sharp"],
        "includeDeps": true
      }
    },
  ],
};

export default config;
