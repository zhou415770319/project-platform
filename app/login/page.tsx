"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ADMIN_HASH } from "@/lib/account";
import { hashPassword } from "@/lib/crypto";
import { saveSession } from "@/lib/session";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    // 账号加密校验：比对 sha256(输入) 与预存哈希，不传输/不存储明文密码
    if (hashPassword(password) === ADMIN_HASH) {
      saveSession();
      router.push("/admin");
      router.refresh();
    } else {
      setError("密码错误，请重试。");
      setBusy(false);
    }
  };

  return (
    <div className="container">
      <div className="auth-wrap">
        <h2>管理员登录</h2>
        <p className="sub">登录后可查看全部项目（含开发中）并进入后台管理。</p>
        <form onSubmit={submit}>
          <input
            className="field"
            type="password"
            placeholder="请输入管理员密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          <button className="btn-primary form-btn" type="submit" disabled={busy}>
            {busy ? "验证中…" : "登录"}
          </button>
        </form>
        {error && <p className="error">{error}</p>}
        <p className="hint">
          账号密码哈希配置在 lib/account.ts 的 ADMIN_HASH（修改密码见 README）。
        </p>
      </div>
    </div>
  );
}
