# GitHub Workflow 重构说明

基于 Toolbase 项目的 build-publish.yml 模板，我们对 LocalSqueeze 的 GitHub Actions 工作流进行了全面重构。

## 🔄 主要变更

### 1. **build.yml → Build and Publish**

#### 新增功能：
- **代码签名支持**：
  - macOS: Apple 开发者证书自动安装和签名
  - Windows: Azure Trusted Signing 服务集成
- **Dry Run 模式**：支持测试发布而不实际发布
- **简化的多平台构建**：统一的构建流程
- **更新的 Node.js 版本**：升级到 Node.js 22

#### 工作流程：
1. **构建阶段** (`build` job)：
   - 多平台并行构建 (Windows, macOS, Linux)
   - 自动安装 Apple 证书 (macOS)
   - 打包应用程序
   - Windows 代码签名 (第一次)
   - 构建安装包
   - Dry Run 发布测试
   - Windows 安装包签名 (第二次)
   - 上传构建产物

2. **发布阶段** (`publish` job)：
   - 仅在推送标签且非 Dry Run 时执行
   - 使用 Electron Forge 发布到 GitHub Releases

### 2. **ci.yml → Continuous Integration**

#### 优化改进：
- **合并安全检查**：将代码质量和安全审计合并到单个作业
- **集成 CodeQL**：自动化安全代码分析
- **简化构建测试**：专注于验证构建可行性
- **更新 Node.js 版本**：升级到 Node.js 22

#### 工作流程：
1. **代码质量与安全** (`quality` job)：
   - ESLint 代码检查
   - TypeScript 类型检查
   - npm audit 依赖安全审计
   - CodeQL 静态代码分析

2. **构建测试** (`test-build` job)：
   - 多平台构建验证
   - 快速包构建测试

## 🔐 必需的 Secrets 配置

### Apple 代码签名 (macOS)：
```
APPLE_BUILD_CERTIFICATE_BASE64  # P12 证书的 Base64 编码
APPLE_P12_PASSWORD             # P12 证书密码
APPLE_KEYCHAIN_PASSWORD        # 临时钥匙串密码
APPLE_IDENTITY                 # 开发者身份标识
APPLE_ID                       # Apple ID
APPLE_ID_PASSWORD              # Apple ID 应用专用密码
APPLE_TEAM_ID                  # Apple 团队 ID
```

### Azure 代码签名 (Windows)：
```
AZURE_TENANT_ID                # Azure 租户 ID
AZURE_CLIENT_ID                # Azure 客户端 ID
AZURE_CLIENT_SECRET            # Azure 客户端密钥
AZURE_ENDPOINT                 # Azure 端点
AZURE_CODE_SIGNING_NAME        # 代码签名账户名
AZURE_CERT_PROFILE_NAME        # 证书配置文件名
```

### GitHub 发布：
```
PUBLISH_GITHUB_TOKEN           # GitHub 发布令牌 (可选，默认使用 GITHUB_TOKEN)
```

## 🚀 使用方法

### 自动发布 (推荐)：
```bash
# 创建并推送版本标签
git tag v1.0.0
git push origin v1.0.0
```

### 手动发布：
1. 访问 GitHub Actions 页面
2. 选择 "Build and Publish" 工作流
3. 点击 "Run workflow"
4. 选择发布类型：
   - `draft`: 草稿发布
   - `prerelease`: 预发布
   - `release`: 正式发布
5. 可选择启用 "Dry Run" 进行测试

### 开发测试：
- 推送到 `main`/`master` 分支会触发 CI 检查
- Pull Request 会触发完整的 CI/CD 流程（包括 Dry Run）

## 📋 NPM Scripts 要求

确保 `package.json` 包含以下脚本：

```json
{
  "scripts": {
    "package": "electron-forge package",
    "make": "electron-forge make",
    "publish": "electron-forge publish",
    "lint": "eslint src --ext .ts,.tsx,.js,.jsx"
  }
}
```

## 🔧 Forge 配置要求

确保 `forge.config.ts` 包含 GitHub Publisher 配置：

```typescript
export default {
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'your-username',
          name: 'LocalSqueeze'
        },
        prerelease: process.env.NODE_ENV !== 'production'
      }
    }
  ]
};
```

## 🎯 优势

1. **专业级代码签名**：支持 Apple 和 Windows 官方签名
2. **安全性增强**：集成多层安全检查
3. **灵活发布**：支持草稿、预发布、正式发布
4. **测试友好**：Dry Run 模式避免意外发布
5. **现代化工具链**：使用最新的 Node.js 和 GitHub Actions
6. **简化维护**：减少重复代码，提高可维护性

## 📝 注意事项

- 首次使用需要配置所有必需的 Secrets
- Apple 代码签名需要有效的开发者账户
- Windows 代码签名需要 Azure Trusted Signing 服务
- 建议先使用 Dry Run 模式测试发布流程
- 确保 `forge.config.ts` 和 `package.json` 配置正确

这次重构显著提升了发布流程的专业性和可靠性，为项目的长期维护奠定了坚实基础。