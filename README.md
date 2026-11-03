# 个人项目展示平台

一个部署在 **腾讯 EdgeOne** 上的个人项目作品集平台。源码托管在 GitHub，支持后台管理项目信息，并通过「登录可见」控制开发中项目对访客隐藏。

## 功能特性

- **项目展示**：首页卡片列表 + 详情页，展示项目简介、详细描述、进度、后续计划、项目链接、源码链接。
- **进度管理**：立项 / 功能开发 / MVP版 / 完整版 四档进度。
- **权限控制（核心）**：
  - 未登录访客：**只能看到 MVP版 与 完整版** 项目。
  - 登录管理员：查看**全部项目**（含立项、功能开发），并进入后台管理。
  - 私密项目（立项/开发中）用**管理员密码派生的密钥 AES-256 加密**，密钥不写入前端代码 —— 访客下载到密文也无法解密，真正实现"开发中项目不可见"。
- **配套平台链路**（每个项目可配置）：开发工具(workbuddy)、技术文档(公众号开放平台)、源码(GitHub)、推广(知乎)、获客(小红书)。
- **纯静态输出**：Next.js `output: "export"`，无需 Node 服务，适配 EdgeOne / 任意静态托管。

---

## 目录结构

```
project-platform/
├── app/
│   ├── page.tsx              # 首页项目列表（权限过滤）
│   ├── login/page.tsx        # 登录页（密码解密校验）
│   ├── admin/page.tsx        # 后台管理（增删改 + 导出）
│   └── project/page.tsx      # 项目详情页（读 ?id=）
├── components/
│   ├── Navbar.tsx            # 顶部导航（登录态）
│   └── ProjectCard.tsx       # 项目卡片
├── lib/
│   ├── crypto.ts             # AES 加密/解密 + 密钥派生
│   └── session.ts            # 浏览器登录态（localStorage）
├── types/project.ts          # 数据类型与权限判断
├── scripts/
│   ├── encrypt-data.ts       # 明文 → 公开JSON + 加密私密数据
│   └── decrypt-data.ts       # 解密私密数据（本地调试）
├── data/
│   └── projects.raw.json     # ⚠️ 明文数据源（gitignore，不提交）
├── public/
│   ├── projects.public.json  # ✅ 公开展示项目（MVP/完整版），提交
│   └── projects.private.bin  # ✅ 私密项目（AES加密），提交
├── .env.local                # ⚠️ 管理员密码（gitignore，不提交）
└── README.md
```

---

## 本地运行

```bash
npm install          # 安装依赖
npm run dev          # 启动开发服务器 http://localhost:3000
```

首次使用（或每次修改项目数据后）：

```bash
npm run encrypt      # 重新生成 public 下的公开JSON + 加密私密数据
```

本地调试解密私密数据：

```bash
npm run decrypt
```

---

## 管理员登录与后台

1. 打开 `http://localhost:3000/login`，输入 `.env.local` 中的 `ADMIN_PASSWORD`。
2. 登录后进入 **后台管理**（`/admin`）：
   - 新增 / 编辑 / 删除项目；
   - 配置：项目名称、封面、简介、详细描述、进度、后续计划、项目链接、源码 GitHub、开发工具、技术文档(公众号)、推广(知乎)、获客(小红书)；
   - 点击「导出数据 JSON」得到 `projects.raw.json`。

### 后台的「在线修改」说明
因为本平台是**纯静态部署**（无后端数据库），后台表单是在浏览器里增删改，修改结果需通过「导出 JSON → 覆盖 `data/projects.raw.json` → `npm run encrypt` → git push」三步上到线上（后台页面有步骤提示）。

---

## 数据安全模型（务必理解）

| 数据 | 存放位置 | 访客可见？ |
|---|---|---|
| MVP版 / 完整版 项目 | `public/projects.public.json`（明文） | ✅ 公开 |
| 立项 / 功能开发 项目 | `public/projects.private.bin`（AES-256 加密，密钥=密码派生） | ❌ 不可见，即使下载密文也无法解密 |

- 加密密钥由管理员密码 `SHA-256` 派生，**只在你输入密码的那一刻存在**，不写进前端代码。
- 登录校验 = 用密码尝试解密私密文件，成功即通过。
- ⚠️ 若项目的机密性要求极高，仍建议换用「后端接口 + 在线数据库」方案（见方案切换），前端加密主要解决"访客无法直接读取"问题。

---

## 部署到 GitHub + 腾讯 EdgeOne

### 1. 上传源码到 GitHub

```bash
git init
git add .
git commit -m "init: 项目展示平台"
git branch -M main
git remote add origin https://github.com/<你的账号>/<仓库名>.git
git push -u origin main
```

> 提交前请确认：
> - `.env.local`、`data/projects.raw.json` 已被 `.gitignore` 忽略，**不会**被提交；
> - `public/projects.public.json`、`public/projects.private.bin` 会被提交（这是线上数据）。

### 2. 本地构建产物（可选，先验证可打包）

```bash
npm run build        # 产物输出到 out/
```

### 3. 腾讯 EdgeOne 部署

EdgeOne 支持「边缘函数 / 静态托管」，本项目纯静态，最简单方式：

**方式 A：EdgeOne + GitHub 自动构建（推荐）**
1. 登录腾讯云 EdgeOne 控制台，添加你的站点并绑定域名（需要先完成 DNS 解析接入）。
2. 在「站点加速 → 静态资源」或「边缘函数 → 静态网站托管」中，选择关联你的 GitHub 仓库。
3. 配置构建命令：`npm install && npm run encrypt && npm run build`（或直接使用已构建的 `out/` 产物）。
4. 开启「自动部署」：每次 push 到 main 分支，EdgeOne 自动拉取代码、构建、发布。

**方式 B：手动上传 `out/` 产物**
1. `npm run build` 生成 `out/`。
2. 在 EdgeOne 静态托管中上传 `out/` 目录内容，绑定域名即可。

> 关键：本项目是纯静态（`output: "export"`），EdgeOne 仅需托管静态文件，无需配置函数运行环境。登录与解密全部在浏览器端完成。

### 4. 每次更新项目的完整流程

```
后台编辑项目 → 导出 projects.raw.json → 覆盖 data/projects.raw.json
→ npm run encrypt → git add/commit/push → EdgeOne 自动重新部署
```

---

## 环境变量

| 变量 | 说明 | 位置 |
|---|---|---|
| `ADMIN_PASSWORD` | 管理员登录密码，也是私密数据加密密钥 | `.env.local`（勿提交） |

修改密码后务必重跑 `npm run encrypt`。

---

## 常见问题

- **登录提示"缺少私密数据文件"**：先运行 `npm run encrypt`。
- **改了密码登录不上**：同步重跑 `npm run encrypt`，用新密码重新加密。
- **新增项目线上看不到**：确认执行了 `npm run encrypt` 且提交了两个 `public/*` 文件。
- **README 中的平台链接**：`公众号开放平台 / 知乎 / 小红书 / workbuddy` 为示例字段，请替换为你自己的真实链接。
