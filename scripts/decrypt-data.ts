/**
 * 解密脚本：用 .env.local 中的 ADMIN_PASSWORD 解密 public/projects.private.bin，
 * 打印私密项目内容，供本地调试 / 核对。
 *
 * 用法：npm run decrypt
 */
import fs from "node:fs";
import path from "node:path";
import { tryDecryptProjects } from "../lib/crypto";

const root = process.cwd();
const privateOut = path.join(root, "public", "projects.private.bin");

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
  console.error("❌ 缺少 ADMIN_PASSWORD。请先配置 .env.local。");
  process.exit(1);
}
if (!fs.existsSync(privateOut)) {
  console.error("❌ 未找到 public/projects.private.bin，请先运行 npm run encrypt。");
  process.exit(1);
}

const cipher = fs.readFileSync(privateOut, "utf-8");
const data = tryDecryptProjects(cipher, password);
if (!data) {
  console.error("❌ 解密失败：密码错误或数据损坏。");
  process.exit(1);
}
console.log(JSON.stringify(data, null, 2));
