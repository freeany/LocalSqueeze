# 发布指南

本文档描述了 LocalSqueeze 项目的发布流程和最佳实践。

## 发布流程概述

我们的发布流程基于 Electron Forge 和 GitHub Actions，支持多平台构建和自动化发布。

### 支持的平台和架构

- **Windows**: x64, arm64
- **macOS**: x64 (Intel), arm64 (Apple Silicon)
- **Linux**: x64

### 发布类型

1. **草稿发布 (Draft)**: 默认发布类型，需要手动确认后才能公开
2. **预发布 (Prerelease)**: 用于 alpha、beta、rc 版本
3. **正式发布 (Release)**: 稳定版本发布

## 自动化发布

### 通过标签触发发布

1. **创建版本标签**:
   ```bash
   # 补丁版本
   npm run release:patch
   
   # 次要版本
   npm run release:minor
   
   # 主要版本
   npm run release:major
   ```

2. **推送标签到远程仓库**:
   ```bash
   git push --follow-tags
   ```

3. **GitHub Actions 自动构建和发布**:
   - 自动检测版本类型（正式版本 vs 预发布版本）
   - 构建所有平台的安装包
   - 创建 GitHub Release（草稿状态）
   - 上传构建产物

### 手动触发发布

1. 在 GitHub 仓库页面，进入 "Actions" 标签
2. 选择 "Build and Release" 工作流
3. 点击 "Run workflow"
4. 选择发布类型：
   - `draft`: 草稿发布
   - `prerelease`: 预发布
   - `release`: 正式发布

## 本地发布

### 环境准备

1. **安装依赖**:
   ```bash
   npm ci
   ```

2. **设置环境变量**:
   ```bash
   # Windows (PowerShell)
   $env:GITHUB_TOKEN="your_github_token"
   
   # macOS/Linux
   export GITHUB_TOKEN="your_github_token"
   ```

### 构建和发布

1. **构建特定平台**:
   ```bash
   npm run make:win     # Windows
   npm run make:mac     # macOS
   npm run make:linux   # Linux
   npm run make:all     # 所有平台
   ```

2. **发布到 GitHub**:
   ```bash
   npm run publish:draft    # 草稿发布
   npm run publish          # 正式发布
   npm run publish:all      # 发布所有平台
   ```

## 版本管理

### 版本号规范

我们遵循 [语义化版本](https://semver.org/lang/zh-CN/) 规范：

- `MAJOR.MINOR.PATCH`
- 例如：`1.2.3`

### 预发布版本

预发布版本使用以下后缀：
- `alpha`: 内部测试版本（如 `1.2.3-alpha.1`）
- `beta`: 公开测试版本（如 `1.2.3-beta.1`）
- `rc`: 发布候选版本（如 `1.2.3-rc.1`）

## 发布检查清单

### 发布前检查

- [ ] 代码已合并到主分支
- [ ] 所有测试通过
- [ ] 代码质量检查通过
- [ ] 更新了版本号
- [ ] 更新了 CHANGELOG.md
- [ ] 检查了依赖安全性

### 发布后检查

- [ ] 验证所有平台的安装包
- [ ] 测试自动更新功能
- [ ] 确认发布说明准确
- [ ] 通知相关团队成员

## 故障排除

### 常见问题

1. **构建失败**:
   - 检查依赖是否正确安装
   - 确认 Node.js 版本兼容性
   - 查看构建日志中的错误信息

2. **发布失败**:
   - 确认 GITHUB_TOKEN 权限正确
   - 检查网络连接
   - 验证仓库权限设置

3. **签名问题**:
   - macOS: 确认开发者证书配置
   - Windows: 检查代码签名证书

### 获取帮助

如果遇到问题，请：
1. 查看 GitHub Actions 日志
2. 检查 [Electron Forge 文档](https://www.electronforge.io/)
3. 在项目仓库中创建 Issue

## 配置文件说明

### forge.config.ts

主要的 Electron Forge 配置文件，包含：
- 打包配置 (`packagerConfig`)
- 制作器配置 (`makers`)
- 发布器配置 (`publishers`)
- 插件配置 (`plugins`)

### .github/workflows/

- `build.yml`: 主要的构建和发布工作流
- `ci.yml`: 持续集成工作流（代码质量检查）

### package.json

包含所有的 npm 脚本和项目元数据。

## 最佳实践

1. **始终使用草稿发布**: 让团队有机会在正式发布前进行最终检查
2. **自动化测试**: 确保每次发布都经过充分测试
3. **渐进式发布**: 先发布预发布版本，收集反馈后再发布正式版本
4. **文档更新**: 每次发布都要更新相关文档
5. **备份策略**: 保留重要版本的构建产物

## 安全考虑

1. **代码签名**: 确保所有发布的应用都经过适当的代码签名
2. **依赖审计**: 定期检查和更新依赖包
3. **访问控制**: 限制发布权限给授权人员
4. **密钥管理**: 安全存储和管理签名证书和 API 密钥