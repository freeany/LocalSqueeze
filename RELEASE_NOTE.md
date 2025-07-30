# 🚀 LocalSqueeze v1.0.3 发布公告

![LocalSqueeze](https://img.shields.io/badge/LocalSqueeze-v1.0.3-blue?style=for-the-badge&logo=electron&logoColor=white)
![Platform](https://img.shields.io/badge/平台-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey?style=for-the-badge&logo=windows&logoColor=white)
![License](https://img.shields.io/badge/许可证-MIT-green?style=for-the-badge&logo=license&logoColor=white)

## 🔍 版本亮点

```bash
$ git status
> 准备就绪：LocalSqueeze v1.0.3 现已发布！
```

### 🚀 发布流程优化

- ⚙️ **修改发布流程**：优化 GitHub Actions 构建和发布流程，提升发布效率
- 🔧 **修复发布权限问题**：解决 GitHub Actions 发布权限相关问题
- 📦 **分离发布脚本**：分离 publish 和 publish:local 脚本，支持不同发布环境

### 🛠️ 构建系统增强

- 🏗️ **多平台构建支持**：更新构建流程以支持 Windows、macOS 和 Linux 多平台
- 🍎 **macOS DMG 打包**：添加 macOS DMG 打包支持，提供更好的 macOS 用户体验
- 📋 **GitHub Actions 版本更新**：更新 GitHub Actions 使用的 actions 版本至 v4
- ⚡ **构建配置优化**：优化整体构建配置，提升构建速度和稳定性

### 🐛 问题修复

- 🔧 **隐藏快速操作区域**：优化用户界面，提供更清爽的操作体验
- 🔍 **修复 FAQ 搜索功能**：提升帮助页面的使用体验
- 🎨 **优化页面样式**：改进整体视觉效果和用户交互

### ✨ 新增功能

- 📚 **帮助页面**：全新的帮助文档，让您快速上手
- 📦 **Windows 安装程序支持**：提供更便捷的安装体验
- 🔄 **应用显示问题修复**：解决在不同分辨率下的显示异常

## 💻 核心功能回顾

```typescript
const features = {
  compression: "高质量压缩算法，保持图片质量的同时减小文件大小",
  batchProcessing: "同时处理多张图片，提高工作效率",
  formatConversion: "支持多种图片格式之间的转换",
  comparison: "直观对比压缩前后的效果，确保图片质量",
  resize: "根据需要调整图片尺寸，适应不同场景",
  privacy: "所有处理在本地完成，保护您的隐私"
};
```

## 🔮 技术栈

- ⚡ **Electron**：跨平台桌面应用框架
- ⚛️ **React**：用户界面构建
- 📘 **TypeScript**：类型安全的 JavaScript 超集
- 🎨 **Tailwind CSS**：实用优先的 CSS 框架
- 🔨 **Electron Forge**：应用打包与发布工具

## 📥 安装方式

```bash
# 克隆仓库
git clone https://github.com/freeany/LocalSqueeze.git

# 安装依赖
npm install

# 启动应用
npm start
```

或直接下载最新的安装包：

- 💾 [Windows 安装包](https://github.com/freeany/LocalSqueeze/releases/download/v1.0.3/LocalSqueeze-Setup.exe)
- 🍎 [macOS 安装包](https://github.com/freeany/LocalSqueeze/releases/download/v1.0.3/LocalSqueeze.dmg)
- 🐧 [Linux 安装包](https://github.com/freeany/LocalSqueeze/releases/download/v1.0.3/localsqueeze_1.0.3_amd64.deb)

## 🔜 未来计划

```json
{
  "roadmap": [
    "增强批量处理能力",
    "添加更多图像优化算法",
    "支持更多图像格式",
    "优化用户界面和用户体验",
    "添加更多自定义选项"
  ]
}
```

## 🙏 感谢

感谢所有为 LocalSqueeze 做出贡献的开发者和用户！您的反馈和支持是我们前进的动力。

---

<div align="center">
  <code>$ echo "Happy Compressing!" | LocalSqueeze</code>
</div>