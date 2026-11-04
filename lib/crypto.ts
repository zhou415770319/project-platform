/**
 * 账号加密：仅对管理员密码做 SHA-256 哈希校验。
 * 项目数据不再加密（见 build-data：公开/私密均为明文 JSON）。
 * 注意：不在此文件或任何提交文件中出现明文密码。
 */
import CryptoJS from "crypto-js";

/** 对密码做 SHA-256 哈希，用于账号校验（不存明文密码） */
export function hashPassword(password: string): string {
  return CryptoJS.SHA256(password).toString();
}
