/**
 * 管理员账号的 SHA-256 哈希（账号加密）。
 * 修改密码：用「密码 → sha256」算出新值，替换下面的 ADMIN_HASH，
 * 然后 npm run build-data && 提交即可。
 * 该值随仓库提交是允许的（它是哈希，不是明文密码）；
 * 但请务必使用足够强、不易被离线爆破的密码。
 */
export const ADMIN_HASH =
  "c6a5f107828ff6e4b646660ee865db6d300253485cddeaf527f8f4521f9e3637";
