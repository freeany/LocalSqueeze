# GitHub Actions 发布问题修复说明

## 问题描述

在使用 Electron Forge 的 GitHub Publisher 时遇到以下错误：
```
[FAILED] [publisher-github] Running the publish command [FAILED: Resource not accessible by integration]
HttpError: Resource not accessible by integration
```

## 问题原因

1. **权限不足**: GitHub Actions 默认的 `GITHUB_TOKEN` 权限不足以创建 release
2. **Release 不存在**: Publisher 尝试查找已存在的 release，但 tag 推送时 release 还未创建
3. **配置问题**: Forge 配置中的某些选项可能导致权限问题

## 解决方案

### 1. 修改 GitHub Actions 工作流 (`.github/workflows/build.yml`)

- **添加权限声明**: 确保 Actions 有足够权限创建 release
- **预先创建 Release**: 在发布前先创建 GitHub Release
- **使用现代 Actions**: 替换已弃用的 `actions/create-release@v1`

### 2. 优化 Forge 配置 (`forge.config.ts`)

- **关闭草稿模式**: 设置 `draft: false` 避免权限问题
- **添加重试配置**: 配置 `octokitOptions` 处理网络错误
- **启用自动发布说明**: 设置 `generateReleaseNotes: true`

## 使用方法

1. **创建新版本**:
   ```bash
   # 更新 package.json 中的版本号
   npm version patch  # 或 minor, major
   
   # 推送 tag 触发发布
   git push origin --tags
   ```

2. **手动发布**:
   ```bash
   # 本地发布（需要设置 GITHUB_TOKEN 环境变量）
   npm run publish
   ```

## 注意事项

- 确保 `package.json` 中的 `repository.url` 正确
- 确保 GitHub 仓库存在且有推送权限
- 如果仍有问题，检查 GitHub Token 的权限范围

## 相关链接

- [GitHub Issue #3221](https://github.com/electron/forge/issues/3221)
- [Electron Forge Publisher GitHub 文档](https://www.electronforge.io/config/publishers/github)