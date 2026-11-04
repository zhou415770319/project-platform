"use client";

/**
 * 客户端登录态（仅存浏览器 localStorage）。
 * 账号密码校验通过后写入标记；登出即清除。
 */

const TOKEN_KEY = "pb_auth";

/** 登录成功后写入会话 */
export function saveSession(): void {
  try {
    localStorage.setItem(TOKEN_KEY, "1");
  } catch {
    /* ignore */
  }
}

/** 是否已登录 */
export function getSession(): boolean {
  try {
    return localStorage.getItem(TOKEN_KEY) === "1";
  } catch {
    return false;
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
