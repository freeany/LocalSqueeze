# GitHub Actions 跨平台发布配置说明

## 问题描述

在使用 Electron Forge 的 GitHub Publisher 时遇到以下问题：
1. **权限错误**: `[FAILED: Resource not accessible by integration]`
2. **单平台发布**: 只能发布 Windows 包，缺少 macOS 支持
3. **Windows 构建错误**: `npm warn cleanup Failed to remove some directories` 和 `EPERM: operation not permitted`

### Windows构建错误
- npm清理目录时权限问题（EPERM: operation not permitted）
- 无法删除node_modules中的某些文件和目录
- npm安装过程中的权限冲突和文件锁定问题

## 问题原因

1. **权限不足**: GitHub Actions 默认的 `GITHUB_TOKEN` 权限不足以创建 release
2. **Release 不存在**: Publisher 尝试查找已存在的 release，但 tag 推送时 release 还未创建
3. **配置问题**: Forge 配置中的某些选项可能导致权限问题
4. **平台限制**: 工作流只配置了 Windows 平台构建
5. **Windows 文件权限**: Windows 系统上 npm 清理缓存时遇到文件占用或权限问题

## 解决方案

### 1. 修改 GitHub Actions 工作流 (`.github/workflows/build.yml`)

- **添加权限声明**: 确保 Actions 有足够权限创建 release
- **分离 Release 创建**: 将 release 创建和构建分为两个独立的 job
- **跨平台构建矩阵**: 添加 `[windows-latest, macos-latest]` 支持多平台
- **使用现代 Actions**: 替换已弃用的 `actions/create-release@v1`
- **Windows 特殊处理**: 配置专用的 npm 缓存路径和安装参数
  - **强制清理**: 构建前强制删除现有node_modules目录
  - **npm缓存路径**: 设置专用的Windows缓存目录
  - **安装参数**: `--no-optional --legacy-peer-deps --prefer-offline --no-fund --no-audit --ignore-scripts`
  - **重试机制**: npm ci失败时自动尝试npm install
  - **环境变量**: 禁用fund和audit检查，设置专用缓存路径
- **错误处理**: 添加超时设置和详细日志输出
  - **安装超时**: 15分钟npm安装超时
  - **构建超时**: 45分钟构建超时防止卡死
  - **详细日志**: `--verbose`参数输出详细构建信息
  - **缓存管理**: 强制清理npm缓存，设置Electron专用缓存
  - **退出码检查**: 构建失败时正确返回错误码

### 2. 优化 Forge 配置 (`forge.config.ts`)

- **关闭草稿模式**: 设置 `draft: false` 避免权限问题
- **添加重试配置**: 配置 `octokitOptions` 处理网络错误
- **启用自动发布说明**: 设置 `generateReleaseNotes: true`
- **添加 macOS 支持**: 配置 `MakerDMG` 创建 macOS 安装包

### 3. 添加依赖和配置

- **安装 DMG Maker**: 添加 `@electron-forge/maker-dmg` 依赖
- **配置 macOS 签名**: 设置 Apple 开发者证书环境变量（可选）

## 使用方法

1. **安装新依赖**:
   ```bash
   npm install
   ```

2. **创建新版本**:
   ```bash
   # 更新 package.json 中的版本号
   npm version patch  # 或 minor, major
   
   # 推送 tag 触发跨平台发布
   git push origin --tags
   ```

3. **手动发布**:
   ```bash
   # 本地发布（需要设置 GITHUB_TOKEN 环境变量）
   npm run publish
   ```

## 注意事项

- 确保 `package.json` 中的 `repository.url` 正确
- 确保 GitHub 仓库存在且有推送权限
- **macOS 签名**: 如需代码签名，需要在 GitHub Secrets 中设置 `APPLE_ID`、`APPLE_PASSWORD`、`APPLE_TEAM_ID`
- **构建时间**: 跨平台构建需要更长时间，Windows 和 macOS 会并行构建
- **发布产物**: 每个平台会生成对应的安装包（Windows: .exe, macOS: .dmg）

## 相关链接

- [GitHub Issue #3221](https://github.com/electron/forge/issues/3221)
- [Electron Forge Publisher GitHub 文档](https://www.electronforge.io/config/publishers/github)