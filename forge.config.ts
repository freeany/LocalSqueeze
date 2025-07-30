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
    icon: './src/assets/icons/icon' // 不需要扩展名，Electron Forge会根据平台自动选择
    // 不进行macOS应用签名和公证
  },
  rebuildConfig: {},
  makers: [
    // Windows
    new MakerSquirrel({
      name: "LocalSqueeze", // 确保这是驼峰式的，没有空格
      description: "Image Compression Tool", // 使用英文描述
      setupIcon: './src/assets/icons/win/icon.ico',
      setupExe: 'LocalSqueeze-Setup.exe',
      noMsi: false,
      // 添加以下配置以解决安装程序闪退问题
      // 移除setupExeTemplate配置，因为它不是MakerSquirrelConfig的有效属性
      // 设置安装程序的显示名称（使用英文避免编码问题）
      title: "LocalSqueeze",
      // 添加额外的安装程序选项
      noDelta: true,
      // 设置为true以在安装后自动启动应用
      // 移除 skipUpdateExe 配置项，因为它不是 MakerSquirrelConfig 的有效属性
      // 添加codepage配置解决中文编码问题
      // 移除 codepage 配置，因为它不是 MakerSquirrelConfig 的有效属性
    }),
    // 添加WiX安装程序，支持选择安装路径
    {
      name: '@electron-forge/maker-wix',
      config: {
        name: "LocalSqueeze",
        description: "Image Compression Tool",
        manufacturer: "freeany",
        icon: './src/assets/icons/win/icon.ico',
        ui: {
          chooseDirectory: true, // 允许用户选择安装路径
        },
        // 设置程序文件夹名称
        programFilesFolderName: "LocalSqueeze",
        // 设置快捷方式文件夹名称
        shortcutFolderName: "LocalSqueeze"
      }
    },
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
      draft: false, // 设置为false，直接发布而不是草稿
      authToken: process.env.GITHUB_TOKEN,
      tagPrefix: 'v', // 版本标签前缀
      generateReleaseNotes: true, // 自动生成发布说明
      octokitOptions: {
        retry: {
          doNotRetry: ['HttpError']
        }
      }
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
        }
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
