/**
 * 生成数据文件：把 data/projects.raw.json 拆分为两部分（均为明文 JSON）
 *  1. public/projects.public.json   → 公开展示项目（MVP / 完整版）
 *  2. public/projects.private.json  → 私密项目（立项 / 功能开发），仅登录后加载
 *
 * 用法：npm run build-data
 * 每次改完项目数据后重跑本脚本，再提交两个 public 文件并推送。
 */
import fs from "node:fs";
import path from "node:path";
import { isPublicStatus, type Project } from "../types/project";

const root = process.cwd();
const rawPath = path.join(root, "data", "projects.raw.json");
const publicOut = path.join(root, "public", "projects.public.json");
const privateOut = path.join(root, "public", "projects.private.json");

if (!fs.existsSync(rawPath)) {
  console.error(`❌ 未找到明文数据源：${rawPath}\n   请在后台导入/编辑并导出，或手动创建该文件。`);
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
fs.writeFileSync(privateOut, JSON.stringify(priv, null, 2), "utf-8");

console.log(`✅ 已生成`);
console.log(`   公开展示 ${pub.length} 个 → ${publicOut}`);
console.log(`   登录可见 ${priv.length} 个 → ${privateOut}`);
console.log(`   提交这两个文件到 git 并推送，EdgeOne 会自动重新部署。`);
