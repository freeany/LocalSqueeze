# 发布流程重构改进

本文档总结了参考 [Toolbase 项目](https://github.com/Toolbase-AI/toolbase) 后对 LocalSqueeze 发布流程的重构改进。

## 主要改进

### 1. 多架构支持

**改进前**:
- 仅支持 Windows x64 和 macOS x64
- 构建矩阵简单

**改进后**:
- **Windows**: x64, arm64
- **macOS**: x64 (Intel), arm64 (Apple Silicon)
- **Linux**: x64
- 支持所有主流架构

### 2. 增强的 GitHub Actions 工作流

**改进前**:
- 基础的构建和发布流程
- 有限的错误处理

**改进后**:
- **多触发方式**: 标签推送、手动触发、PR 检查
- **智能缓存**: Electron 和依赖缓存，提升构建速度
- **并行构建**: 多平台并行构建，节省时间
- **灵活发布**: 支持草稿、预发布、正式发布
- **自动变更日志**: 基于 Git 提交自动生成
- **改进的错误处理**: 更好的重试机制和错误恢复

### 3. 优化的 Forge 配置

**改进前**:
```typescript
publishers: [
  new PublisherGithub({
    repository: { owner: 'freeany', name: 'LocalSqueeze' },
    prerelease: false,
    draft: true,
    authToken: process.env.GITHUB_TOKEN,
    // 基础配置
  })
]
```

**改进后**:
```typescript
publishers: [
  new PublisherGithub({
    repository: { owner: 'freeany', name: 'LocalSqueeze' },
    prerelease: process.env.NODE_ENV !== 'production', // 动态判断
    draft: true,
    authToken: process.env.GITHUB_TOKEN,
    // 增强的配置
    octokitOptions: {
      retry: { doNotRetry: ['HttpError'], retries: 3 },
      throttle: { /* 速率限制处理 */ }
    },
    publishTargets: [{
      name: 'default',
      publisherOptions: {
        assetNameTemplate: '${name}-${version}-${platform}-${arch}.${ext}'
      }
    }]
  })
]
```

### 4. 新增 CI/CD 流程

**新增功能**:
- **代码质量检查**: ESLint, TypeScript 检查
- **安全审计**: npm audit, CodeQL 分析
- **构建测试**: 多平台构建验证
- **自动化测试**: PR 和推送时自动运行

### 5. 改进的脚本管理

**新增脚本**:
```json
{
  "dev": "npm run start",
  "make:linux": "cross-env NODE_ENV=production electron-forge make --platform=linux",
  "publish:draft": "cross-env NODE_ENV=development electron-forge publish",
  "lint:fix": "eslint --ext .ts,.tsx . --fix",
  "type-check": "tsc --noEmit",
  "clean": "rimraf out dist .vite",
  "clean:cache": "rimraf node_modules/.cache",
  "clean:all": "npm run clean && npm run clean:cache && rimraf node_modules",
  "prerelease": "npm run lint && npm run type-check",
  "release:patch": "npm version patch && git push --follow-tags",
  "release:minor": "npm version minor && git push --follow-tags",
  "release:major": "npm version major && git push --follow-tags"
}
```

### 6. 环境配置标准化

**新增文件**:
- `.env.example`: 环境变量模板
- `RELEASE_GUIDE.md`: 详细发布指南
- 更新的 `.gitignore`: 完善的忽略规则

## 发布流程对比

### 改进前的流程

1. 手动构建
2. 手动上传到 GitHub
3. 有限的平台支持
4. 基础的错误处理

### 改进后的流程

1. **自动化发布**:
   ```bash
   npm run release:patch  # 自动版本号 + 标签 + 推送
   # GitHub Actions 自动触发构建和发布
   ```

2. **手动发布**:
   - GitHub Actions 手动触发
   - 选择发布类型（草稿/预发布/正式）

3. **本地发布**:
   ```bash
   npm run publish:draft  # 草稿发布
   npm run publish:all    # 全平台发布
   ```

## 性能改进

### 构建速度
- **缓存策略**: Electron 和依赖缓存，减少重复下载
- **并行构建**: 多平台同时构建
- **增量构建**: 只构建变更的部分

### 可靠性
- **重试机制**: 网络失败自动重试
- **错误恢复**: 更好的错误处理和日志
- **健康检查**: 构建前的环境检查

## 安全改进

### 代码安全
- **依赖审计**: 自动检查安全漏洞
- **代码分析**: CodeQL 静态分析
- **权限控制**: 最小权限原则

### 发布安全
- **草稿发布**: 默认草稿状态，手动确认
- **签名验证**: 代码签名配置
- **密钥管理**: 环境变量安全存储

## 使用指南

### 快速开始

1. **环境配置**:
   ```bash
   cp .env.example .env
   # 编辑 .env 文件，添加 GITHUB_TOKEN
   ```

2. **发布新版本**:
   ```bash
   npm run release:patch  # 补丁版本
   # 或
   npm run release:minor  # 次要版本
   # 或
   npm run release:major  # 主要版本
   ```

3. **手动构建**:
   ```bash
   npm run make:all       # 构建所有平台
   npm run publish:draft  # 发布草稿
   ```

### 最佳实践

1. **始终使用草稿发布**进行初始发布
2. **运行预发布检查**：`npm run prerelease`
3. **使用语义化版本**管理版本号
4. **定期更新依赖**和安全补丁
5. **测试多平台兼容性**

## 参考资源

- [Toolbase 项目](https://github.com/Toolbase-AI/toolbase) <mcreference link="https://github.com/toolbase-ai/toolbase" index="1">1</mcreference>
- [Electron Forge 文档](https://www.electronforge.io/) <mcreference link="https://www.electronforge.io/" index="4">4</mcreference>
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [语义化版本规范](https://semver.org/lang/zh-CN/)

## 总结

通过参考 Toolbase 项目的最佳实践，我们成功重构了 LocalSqueeze 的发布流程，实现了：

- ✅ **多平台多架构支持**
- ✅ **自动化 CI/CD 流程**
- ✅ **增强的错误处理和重试机制**
- ✅ **灵活的发布策略**
- ✅ **改进的开发者体验**
- ✅ **更好的安全性和可靠性**

这些改进将显著提升项目的发布效率和质量，为用户提供更稳定的应用体验。