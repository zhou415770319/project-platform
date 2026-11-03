/**
 * 加密脚本：把 data/projects.raw.json 拆分为两部分并加密
 *  1. public/projects.public.json   → 公开展示项目（MVP / 完整版），明文 JSON
 *  2. public/projects.private.bin   → 私密项目（立项 / 功能开发），AES 加密
 * 密钥来自 .env.local 的 ADMIN_PASSWORD。
 *
 * 用法：npm run encrypt
 * 每次改完项目数据后都要重跑本脚本，再 git push 更新线上。
 */
import fs from "node:fs";
import path from "node:path";
import { encryptObject } from "../lib/crypto";
import { isPublicStatus, type Project } from "../types/project";

const root = process.cwd();
const rawPath = path.join(root, "data", "projects.raw.json");
const publicOut = path.join(root, "public", "projects.public.json");
const privateOut = path.join(root, "public", "projects.private.bin");

/** 读取 .env.local（避免额外依赖，仅解析 KEY=VALUE 行） */
function loadEnv(): Record<string, string> {
  const envPath = path.join(root, ".env.local");
  if (!fs.existsSync(envPath)) return {};
  const text = fs.readFileSync(envPath, "utf-8");
  const out: Record<string, string> = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return out;
}

const env = { ...process.env, ...loadEnv() };
const password = env.ADMIN_PASSWORD;

if (!password) {
  console.error("❌ 缺少 ADMIN_PASSWORD。请先在 .env.local 中配置管理员密码（参考 .env.local.example）。");
  process.exit(1);
}

if (!fs.existsSync(rawPath)) {
  console.error(`❌ 未找到明文数据源：${rawPath}\n   请先在后台编辑并导出，或手动创建该文件。`);
  process.exit(1);
}

const all = JSON.parse(fs.readFileSync(rawPath, "utf-8")) as Project[];
if (!Array.isArray(all)) {
  console.error("❌ data/projects.raw.json 必须是项目数组。");
  process.exit(1);
}

const pub = all.filter((p) => isPublicStatus(p.status));
const priv = all.filter((p) => !isPublicStatus(p.status));

fs.mkdirSync(path.join(root, "public"), { recursive: true });
fs.writeFileSync(publicOut, JSON.stringify(pub, null, 2), "utf-8");
fs.writeFileSync(privateOut, encryptObject(priv, password), "utf-8");

console.log(`✅ 加密完成`);
console.log(`   公开展示 ${pub.length} 个 → ${publicOut}`);
console.log(`   登录可见 ${priv.length} 个 → ${privateOut}`);
console.log(`   请提交这两个文件到 git 并推送，EdgeOne 会自动重新部署。`);
