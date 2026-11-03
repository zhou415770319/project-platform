import CryptoJS from "crypto-js";
import type { Project } from "@/types/project";

/**
 * 加密方案说明
 * ------------
 * - 公开展示的项目（MVP / 完整版）：存为明文 JSON `public/projects.public.json`
 * - 私密项目（立项 / 功能开发）：用「管理员密码派生出的密钥」AES-256 加密，
 *   存为 `public/projects.private.bin`。密钥由登录密码当场派生，绝不写入前端代码，
 *   因此访客即使下载到密文也无法解密 —— 真正做到"开发中项目访客不可见"。
 * - 密钥派生：SHA-256(密码)。同一密码在加密脚本(构建时)与登录(运行时)使用，结果一致。
 */

/** 由密码派生 AES 密钥（SHA-256） */
export function deriveKey(password: string): string {
  return CryptoJS.SHA256(password).toString();
}

/** 将对象加密为 base64 密文字符串 */
export function encryptObject(obj: unknown, password: string): string {
  const key = deriveKey(password);
  return CryptoJS.AES.encrypt(JSON.stringify(obj), key).toString();
}

/**
 * 尝试用密码解密密文并解析为项目数组。
 * 成功返回项目数组；密码错误 / 数据损坏返回 null。
 * 登录校验即基于此：能解出来 = 密码正确。
 */
export function tryDecryptProjects(
  cipherText: string,
  password: string
): Project[] | null {
  try {
    const key = deriveKey(password);
    const bytes = CryptoJS.AES.decrypt(cipherText, key);
    const text = bytes.toString(CryptoJS.enc.Utf8);
    if (!text) return null;
    const data = JSON.parse(text);
    if (!Array.isArray(data)) return null;
    return data as Project[];
  } catch {
    return null;
  }
}
