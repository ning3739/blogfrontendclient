# Frontend Client

<div align="center">

<p>
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-16.0.1-black?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" /></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" /></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge" alt="License: MIT" /></a>
</p>

一个现代化的全栈博客系统前端应用，支持博客创作、项目展示、社交互动、多语言切换等丰富功能。

[在线演示](https://heyxiaoli.com) · [报告问题](https://github.com/NING3739/blogfrontendclient/issues) · [功能建议](https://github.com/NING3739/blogfrontendclient/issues)

</div>

---

## 📋 目录

- [功能特性](#-功能特性)
- [技术栈](#-技术栈)
- [快速开始](#-快速开始)
- [项目结构](#-项目结构)
- [核心功能](#-核心功能)
- [环境变量](#-环境变量)
- [开发指南](#-开发指南)
- [部署](#-部署)
- [贡献指南](#-贡献指南)
- [许可证](#-许可证)

---

## ✨ 功能特性

### 🎯 核心功能

- ✅ **博客系统** - 富文本编辑、Markdown 支持、代码高亮
- ✅ **项目展示** - 项目管理、详情展示、标签分类
- ✅ **用户系统** - 注册登录、个人主页、权限管理
- ✅ **社交互动** - 评论系统、点赞收藏、友链管理
- ✅ **支付集成** - Stripe 支付、订单管理、支付记录
- ✅ **媒体管理** - 图片/音频/视频上传、裁剪、管理
- ✅ **SEO 优化** - 动态 sitemap、元标签管理、搜索引擎友好

### 🌟 特色功能

- 🌍 **国际化** - 完整的中英文双语支持
- 🎨 **主题切换** - 浅色/深色模式无缝切换
- 📱 **响应式设计** - 完美适配移动端、平板、桌面
- 🔐 **安全认证** - HttpOnly Cookie、OAuth 登录、Token 自动刷新
- ⚡ **性能优化** - SWR 数据缓存、图片懒加载、代码分割
- 📊 **数据可视化** - ECharts 图表、Recharts 统计、词云展示
- 🗺️ **地图功能** - Mapbox 集成、地理位置展示
- 🎬 **动画效果** - Motion 动画、流畅交互体验

---

## 🛠 技术栈

### 核心框架

- **[Next.js 16](https://nextjs.org/)** - React 全栈框架，App Router 架构
- **[React 19](https://react.dev/)** - 用户界面构建库
- **[TypeScript 5](https://www.typescriptlang.org/)** - 类型安全的 JavaScript 超集

### UI & 样式

- **[Tailwind CSS 4](https://tailwindcss.com/)** - 原子化 CSS 框架
- **[Motion](https://motion.dev/)** - 强大的动画库(Framer Motion)
- **[Lucide React](https://lucide.dev/)** - 精美的图标库
- **[next-themes](https://github.com/pacocoursey/next-themes)** - 主题切换解决方案

### 数据管理

- **[SWR](https://swr.vercel.app/)** - React 数据获取与缓存
- **[Axios](https://axios-http.com/)** - HTTP 客户端

### 富文本编辑

- **[TipTap](https://tiptap.dev/)** - 现代化富文本编辑器
- **[Lowlight](https://github.com/wooorm/lowlight)** - 代码高亮支持

### 国际化

- **[next-intl](https://next-intl-docs.vercel.app/)** - Next.js 国际化解决方案

### 其他工具

- **[Stripe](https://stripe.com/)** - 在线支付集成
- **[Mapbox GL](https://www.mapbox.com/)** - 地图可视化
- **[ECharts](https://echarts.apache.org/)** - 数据可视化图表
- **[QRCode](https://github.com/soldair/node-qrcode)** - 二维码生成
- **[React Hot Toast](https://react-hot-toast.com/)** - 优雅的通知提示

---

## 🚀 快速开始

### 环境要求

- **Node.js** >= 18.x
- **npm** >= 9.x 或 **pnpm** >= 8.x

### 安装步骤

1. **克隆项目**

```bash
git clone https://github.com/NING3739/blogfrontendclient.git
cd blogfrontendclient
```

2. **安装依赖**

```bash
npm install
# 或
pnpm install
```

3. **配置环境变量**

在项目根目录创建 `.env.local` 文件：

```env
# API 基础地址
NEXT_PUBLIC_API_BASE_URL=https://api.heyxiaoli.com/api/v1

# 网站地址
NEXT_PUBLIC_SITE_URL=https://heyxiaoli.com

# Stripe 公钥
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx

# Mapbox Token
NEXT_PUBLIC_MAPBOX_TOKEN=pk.xxxxxxxxxxxxx
```

4. **启动开发服务器**

```bash
npm run dev
```

访问 [https://127.0.0.1:3000](https://127.0.0.1:3000) 查看应用

> 💡 开发环境默认启用 HTTPS 和 Turbopack 以提升开发体验

---

## 📁 项目结构

```
frontend-client/
├── app/                          # Next.js App Router
│   ├── (pages)/                  # 页面路由组
│   │   ├── (auth)/              # 认证相关页面（登录/注册/重置密码）
│   │   ├── (site)/              # 公开站点页面（博客/项目详情）
│   │   └── dashboard/           # 仪表板页面（管理员/用户）
│   ├── components/               # React 组件
│   │   ├── (feature)/           # 功能组件（博客/评论/论坛等）
│   │   ├── layout/              # 布局组件（Header/Footer/SideBar）
│   │   ├── providers/           # Context Provider
│   │   └── ui/                  # 基础 UI 组件
│   ├── contexts/                 # React Context
│   │   ├── authContext.tsx      # 认证上下文
│   │   └── hooks/               # 自定义 Hooks
│   ├── lib/                      # 工具库
│   │   ├── extensions/          # TipTap 扩展
│   │   ├── http/                # HTTP 客户端
│   │   ├── services/            # API 服务层
│   │   └── utils/               # 工具函数
│   ├── types/                    # TypeScript 类型定义
│   ├── globals.css              # 全局样式
│   ├── layout.tsx               # 根布局
│   └── page.tsx                 # 首页
├── i18n/                         # 国际化配置
│   ├── messages/                # 翻译文件
│   │   ├── en.json              # 英文翻译
│   │   └── zh.json              # 中文翻译
│   └── request.ts               # i18n 配置
├── public/                       # 静态资源
├── certificates/                 # SSL 证书（开发用）
├── next.config.ts               # Next.js 配置
├── tailwind.config.ts           # Tailwind CSS 配置
├── tsconfig.json                # TypeScript 配置
└── package.json                 # 项目依赖
```

---

## 🎯 核心功能

### 1. 认证系统

#### 支持的登录方式

- 📧 **邮箱密码登录** - 传统账号密码方式
- 🔐 **OAuth 登录** - GitHub、Google 第三方登录
- ✉️ **邮箱验证** - 注册时邮箱验证码验证
- 🔄 **密码重置** - 忘记密码通过邮箱重置

#### 安全特性

```typescript
// HttpOnly Cookie 存储 Token
// 自动 Token 刷新机制
// 401 错误自动处理
// 请求队列管理
```

### 2. 内容管理

#### 博客管理（管理员）

- ✍️ 富文本编辑器（TipTap）
- 🖼️ 图片上传与裁剪
- 🏷️ 标签分类管理
- 📝 Markdown 支持
- 💾 自动保存草稿
- 👁️ 实时预览

#### 项目管理

- 📁 项目创建与编辑
- 🎨 项目封面管理
- 🔗 外链关联
- 📊 项目统计分析

### 3. 用户仪表板

#### 管理员功能

- 📊 数据统计面板
- 👥 用户管理
- 💳 支付记录管理
- 🖼️ 媒体库管理
- 🔍 SEO 优化工具
- 🤝 友链管理

#### 普通用户功能

- 👤 个人资料编辑
- 🔖 收藏文章管理
- 💰 我的支付记录
- 🔔 消息通知

### 4. HTTP 客户端

#### 核心特性

```typescript
// ✅ 自动 Token 刷新
// ✅ 请求队列管理
// ✅ 国际化请求头
// ✅ 错误统一处理
// ✅ 上传进度监听
```

#### 使用示例

```typescript
import httpClient from "@/app/lib/http/client";

// GET 请求
const response = await httpClient.get("/api/blogs");

// POST 请求
const response = await httpClient.post("/api/blogs", {
  title: "Hello World",
  content: "...",
});

// 文件上传
const response = await httpClient.upload("/api/media", file, {
  uploadProgress: (progress) => {
    console.log(`上传进度: ${progress}%`);
  },
});
```

### 5. 国际化

#### 语言切换

```typescript
import { useTranslations } from "next-intl";

function Component() {
  const t = useTranslations("namespace");
  return <div>{t("key")}</div>;
}
```

#### 支持的语言

- 🇨🇳 简体中文 (zh)
- 🇺🇸 English (en)

---

## 🔧 环境变量

创建 `.env.local` 文件并配置以下变量：

| 变量名                          | 说明          | 必填 | 示例                               |
| ------------------------------- | ------------- | ---- | ---------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL`      | 后端 API 地址 | ✅   | `https://api.heyxiaoli.com/api/v1` |
| `NEXT_PUBLIC_SITE_URL`          | 网站地址      | ✅   | `https://heyxiaoli.com`            |
| `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` | Stripe 公钥   | ⚠️   | `pk_test_xxxxx`                    |
| `NEXT_PUBLIC_MAPBOX_TOKEN`      | Mapbox Token  | ⚠️   | `pk.xxxxx`                         |

> ⚠️ 标记为非必填的变量表示该功能可选（如支付、地图等）

---

## 👨‍💻 开发指南

### 可用命令

```bash
# 开发模式（HTTPS + Turbopack）
npm run dev

# 生产构建
npm run build

# 启动生产服务器
npm run start

# 代码检查
npm run lint
```

### 代码规范

项目使用 ESLint 进行代码检查：

```bash
npm run lint
```

### 开发建议

1. **使用 TypeScript** - 充分利用类型系统
2. **遵循组件化** - 保持组件职责单一
3. **使用 Hooks** - 优先使用函数组件和 Hooks
4. **国际化优先** - 所有文本使用 i18n
5. **响应式设计** - 移动端优先
6. **性能优化** - 使用 SWR 缓存、懒加载等

### 新增功能开发流程

1. 在 `app/lib/services/` 创建服务类
2. 在 `app/types/` 定义 TypeScript 类型
3. 在 `app/components/` 创建组件
4. 在 `app/(pages)/` 创建页面
5. 在 `i18n/messages/` 添加翻译

---

## 🚢 部署

### Vercel 部署（推荐）

1. 将代码推送到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 配置环境变量
4. 点击部署

### 自托管部署

```bash
# 构建项目
npm run build

# 启动服务器
npm run start
```

### Docker 部署

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

---

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. **Fork** 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交改动 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 **Pull Request**

### 提交规范

```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建/工具链相关
```

---

## 📄 许可证

本项目采用 **MIT** 许可证 - 详见 [LICENSE](LICENSE) 文件

---

## 🙏 致谢

感谢以下开源项目：

- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TipTap](https://tiptap.dev/)
- [SWR](https://swr.vercel.app/)

---

## 📧 联系方式

- **作者**: [NINGLI3739](https://heyxiaoli.com)
- **仓库**: [https://github.com/NING3739/blogfrontendclient](https://github.com/NING3739/blogfrontendclient)
- **问题反馈**: [GitHub Issuess](https://github.com/NING3739/blogfrontendclient/issues/new)

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给一个 Star！⭐**

Made with ❤️ by [NINGLI3739](https://heyxiaoli.com)

</div>
