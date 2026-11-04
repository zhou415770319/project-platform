# 个人项目展示平台

一个部署在 **腾讯 EdgeOne** 上的个人项目作品集平台。源码托管在 GitHub，支持后台管理项目信息，通过「登录可见」控制开发中项目对访客的展示。

## 1 功能特性

- **项目展示**：首页卡片列表 + 详情页，展示项目简介、详细描述、进度、后续计划、项目链接、源码链接。
- **进度管理**：立项 / 功能开发 / MVP版 / 完整版 四档进度。
- **权限控制**：
  - 未登录访客：**只展示 MVP版 与 完整版** 项目。
  - 登录管理员：查看**全部项目**（含立项、功能开发），并进入后台管理。
- **账号加密**：管理员登录使用密码的 SHA-256 哈希校验，不存/不传明文密码（见 `lib/account.ts`）。
- **后台管理**：新增/修改项目用弹框，列表内可编辑、删除；支持**导入数据**（把别的项目导出的 JSON 合并进来）与**导出数据**（同步/备份）。
- **配套平台链路**（每个项目可配置）：开发工具(workbuddy)、技术文档(公众号开放平台)、源码(GitHub)、推广(知乎)、获客(小红书)。
- **纯静态输出**：Next.js `output: "export"`，无需 Node 服务，适配 EdgeOne / 任意静态托管。

---

## 2 目录结构

```
project-platform/
├── app/
│   ├── page.tsx              # 首页项目列表（权限过滤）
│   ├── login/page.tsx        # 登录页（账号哈希校验）
│   ├── admin/page.tsx        # 后台管理（弹框增改 + 删除 + 导入/导出）
│   └── project/page.tsx      # 项目详情页（读 ?id=）
├── components/
│   ├── Navbar.tsx            # 顶部导航（登录态）
│   └── ProjectCard.tsx       # 项目卡片
├── lib/
│   ├── crypto.ts             # 密码 SHA-256 哈希
│   ├── account.ts            # 管理员账号哈希（提交）
│   └── session.ts            # 浏览器登录态（localStorage）
├── types/project.ts          # 数据类型与权限判断
├── scripts/
│   └── build-data.ts         # 明文数据 → 公开JSON + 私密JSON
├── data/
│   └── projects.raw.json     # ⚠️ 明文数据源（gitignore，不提交）
├── public/
│   ├── projects.public.json  # ✅ 公开展示项目（MVP/完整版），提交
│   └── projects.private.json # ✅ 登录可见项目（立项/开发中），提交
└── README.md
```

---

## 3 本地运行

```bash
npm install          # 安装依赖
npm run dev          # 启动开发服务器 http://localhost:3000
```

首次使用（或每次修改项目数据后）：

```bash
npm run build-data   # 重新生成 public 下的公开JSON + 私密JSON
```

---

## 4 管理员登录与后台

1. 打开 `http://localhost:3000/login`，输入管理员密码（默认 `Zhou@123456`）。
2. 登录后进入 **后台管理**（`/admin`）：
   - 弹框新增 / 编辑项目；列表内可删除；
   - 配置：项目名称、封面、简介、详细描述、进度、后续计划、项目链接、源码 GitHub、开发工具、技术文档(公众号)、推广(知乎)、获客(小红书)；
   - **导入数据**：选择别的项目导出的 JSON（数组 或 `{projects:[...]}`），按 id 合并（同 id 覆盖、新 id 追加）；
   - **导出数据**：下载 `projects.raw.json` 用于本地数据源 / 备份 / 迁移。

### 4.1 后台的「在线修改」说明
平台是**纯静态部署**（无后端数据库），后台修改在浏览器内完成，需通过「导出 → 覆盖 `data/projects.raw.json` → `npm run build-data` → 推送 main」三步上线（后台有步骤提示）。

---

## 5 数据与账号安全说明

| 数据 | 存放位置 | 访客可见？ |
|---|---|---|
| MVP版 / 完整版 项目 | `public/projects.public.json` | ✅ 公开 |
| 立项 / 功能开发 项目 | `public/projects.private.json` | ⚠️ 页面上不展示；但文件随站点部署，懂技术的人抓包可拿到 |

- **账号加密**：登录仅校验密码的 SHA-256 哈希（`lib/account.ts` 的 `ADMIN_HASH`），不存/不传明文密码。
- ⚠️ **重要取舍**：本版**去掉了项目数据的 AES 加密**（按你的要求，只做账号加密）。因此开发中项目虽然页面上对访客隐藏，但底层数据是明文。若你仍要求开发中项目**完全不可见**（连抓包也拿不到），需要恢复加密方案——请告诉我，我可以加回 `public/projects.private.bin` 的 AES 加密（密钥由登录密码派生）。

---

## 6 部署到 GitHub + 腾讯 EdgeOne

### 6.1 上传源码到 GitHub

```bash
git init
git add .
git commit -m "init: 项目展示平台"
git branch -M main
git remote add origin https://github.com/<你的账号>/<仓库名>.git
git push -u origin main
```

> 提交前确认：`.env.local`、`data/projects.raw.json` 已被 `.gitignore` 忽略；`public/projects.public.json`、`public/projects.private.json` 会被提交（这是线上数据）。

### 6.2 腾讯 EdgeOne 部署

本平台纯静态（`output: "export"`），EdgeOne 仅需托管静态文件：

**方式 A：EdgeOne + GitHub 自动构建（推荐）**
1. 腾讯云 EdgeOne 控制台添加站点、绑定域名（完成 DNS 解析接入）。
2. 关联你的 GitHub 仓库，配置构建命令：`npm install && npm run build-data && npm run build`。
3. 开启「自动部署」。

**方式 B：手动上传 `out/`**
1. `npm run build` 生成 `out/`。
2. 在 EdgeOne 静态托管上传 `out/` 目录内容，绑定域名。

### 6.3 部署触发机制（回答你的问题）
- **是：只有推送到 `main` 分支才会触发重新部署。**
- 每次 push 到 `main` → EdgeOne 自动拉取代码、构建、发布；push 到其他分支不会触发线上部署。
- 建议在开发分支改代码，确认无误后合并/推送 `main` 再上线。

### 6.4 每次更新项目的完整流程

```
后台编辑/导入 → 导出 projects.raw.json → 覆盖 data/projects.raw.json
→ npm run build-data → git add/commit/push(推到 main) → EdgeOne 自动重新部署
```

---

## 7 修改管理员密码

1. 计算新密码的 SHA-256：本地执行
   ```bash
   node -e "const c=require('crypto');console.log(c.createHash('sha256').update('你的新密码').digest('hex'))"
   ```
2. 把 `lib/account.ts` 中的 `ADMIN_HASH` 替换为新值。
3. `npm run build-data && git add/commit/push` 到 main 即可。
4. 修改密码与项目数据无关（数据不加密），无需重新加密任何文件。

> 密码建议足够强，避免被离线爆破。

---

## 8 常见问题

- **登录提示密码错误**：确认 `lib/account.ts` 的 `ADMIN_HASH` 与当前密码一致。
- **新增项目线上看不到**：确认执行了 `npm run build-data` 且提交了两个 `public/*` 文件并推到 main。
- **导入数据报错**：需选择有效 JSON（数组，或 `{projects:[...]}`）。
- **README 中的平台链接**：`公众号开放平台 / 知乎 / 小红书 / workbuddy` 为示例字段，请替换为真实链接。
