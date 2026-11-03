"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { tryDecryptProjects } from "@/lib/crypto";
import { saveSession } from "@/lib/session";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      // 校验方式：用输入的密码解密私密数据文件。
      // 能成功解出合法项目数组 => 密码正确；否则拒绝登录。
      const res = await fetch("/projects.private.bin", { cache: "no-store" });
      if (!res.ok) {
        setError("系统初始化异常：缺少私密数据文件，请先运行 npm run encrypt。");
        setBusy(false);
        return;
      }
      const cipher = await res.text();
      const data = tryDecryptProjects(cipher, password);
      if (data) {
        saveSession(password);
        router.push("/admin");
        router.refresh();
      } else {
        setError("密码错误，请重试。");
        setBusy(false);
      }
    } catch {
      setError("登录失败，请稍后重试。");
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
          密码在部署时的 .env.local（ADMIN_PASSWORD）中配置，请在
          README.md 中查看如何修改。
        </p>
      </div>
    </div>
  );
}
