"use client";

import { useEffect, useState } from "react";
import ProjectCard from "@/components/ProjectCard";
import { tryDecryptProjects } from "@/lib/crypto";
import { getSessionKey } from "@/lib/session";
import { STATUS_ORDER, type Project } from "@/types/project";

export default function HomePage() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [authed, setAuthed] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const key = getSessionKey();
        const isAuthed = !!key;
        if (!cancelled) setAuthed(isAuthed);

        // 1) 公开数据（MVP / 完整版）——所有人都能读
        const pubRes = await fetch("/projects.public.json", { cache: "no-store" });
        if (!pubRes.ok) throw new Error("public data");
        const pub = (await pubRes.json()) as Project[];

        // 2) 已登录：再解密私密数据（立项 / 功能开发）
        let all = [...pub];
        if (isAuthed) {
          const privRes = await fetch("/projects.private.bin", { cache: "no-store" });
          const privCipher = await privRes.text();
          const priv = tryDecryptProjects(privCipher, key!) ?? [];
          all = [...pub, ...priv];
        }

        all.sort(
          (a, b) =>
            STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        if (!cancelled) setProjects(all);
      } catch {
        if (!cancelled) setError("数据加载失败，请稍后刷新重试。");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) return <div className="container"><div className="empty">{error}</div></div>;
  if (!projects) return <div className="container"><div className="loading">加载中…</div></div>;

  return (
    <div className="container">
      <section className="hero">
        <h1>我的项目作品集</h1>
        <p>这里展示我完成的项目：进度、技术方案、配套平台链路与后续计划。</p>
        {authed && <p style={{ color: "var(--accent)", fontSize: 13 }}>已登录：当前展示全部项目（含开发中）。</p>}
        {!authed && <p style={{ fontSize: 13 }}>未登录：仅展示已完成 MVP 及之后的项目。开发中的项目需要登录后查看。</p>}
      </section>

      <div className="section-title">
        <span>{authed ? "全部项目" : "公开项目"}</span>
        <span className="note">{projects.length} 个</span>
      </div>

      {projects.length === 0 ? (
        <div className="empty">暂无项目，请登录后在后台添加。</div>
      ) : (
        <div className="grid">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </div>
  );
}
