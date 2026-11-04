"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSession, clearSession } from "@/lib/session";

export default function Navbar() {
  const [authed, setAuthed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setAuthed(getSession());
  }, [pathname]);

  const logout = () => {
    clearSession();
    setAuthed(false);
    router.push("/");
    router.refresh();
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link href="/" className="brand">
          我的项目
        </Link>
        <nav className="nav-links">
          <Link href="/">首页</Link>
          {authed && <Link href="/admin">后台管理</Link>}
          {authed ? (
            <button type="button" className="btn-link" onClick={logout}>
              退出登录
            </button>
          ) : (
            <Link href="/login">登录</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
