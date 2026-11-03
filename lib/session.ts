"use client";

import { deriveKey } from "@/lib/crypto";

/**
 * 客户端登录态（仅存浏览器 localStorage）
 * - 登录成功：保存「派生密钥」作为会话凭证
 * - 之后刷新页面时，用该密钥解密私密项目数据
 * 注意：会话保存在本机浏览器，登出即清除。
 */

const TOKEN_KEY = "pb_auth_token";

/** 登录成功后写入会话 */
export function saveSession(password: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, deriveKey(password));
  } catch {
    /* 忽略存储失败 */
  }
}

/** 读取当前会话密钥（未登录返回 null） */
export function getSessionKey(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

/** 退出登录 */
export function clearSession(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}
