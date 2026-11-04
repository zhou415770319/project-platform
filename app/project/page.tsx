"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSession } from "@/lib/session";
import {
  STATUS_BADGE,
  STATUS_LABEL,
  type Project,
} from "@/types/project";

export default function ProjectDetailPage() {
  const [project, setProject] = useState<Project | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "private" | "notfound">(
    "loading"
  );
  const [viewSrc, setViewSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const id = new URLSearchParams(window.location.search).get("id");
      if (!id) {
        setState("notfound");
        return;
      }
      const key = getSession();
      const isAuthed = !!key;

      const pubRes = await fetch("/projects.public.json", { cache: "no-store" });
      const pub = (await pubRes.json()) as Project[];
      let found = pub.find((p) => p.id === id);

      // 公开数据里没有，说明是私密项目，仅登录用户加载
      if (!found && isAuthed) {
        const privRes = await fetch("/projects.private.json", { cache: "no-store" });
        if (privRes.ok) {
          const priv = (await privRes.json()) as Project[];
          found = priv.find((p) => p.id === id);
        }
      }

      if (cancelled) return;
      if (found) {
        setProject(found);
        setState("ready");
      } else if (!isAuthed) {
        setState("private"); // 存在但需要登录，或确实不存在——统一提示登录
      } else {
        setState("notfound");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (state === "loading")
    return <div className="container"><div className="loading">加载中…</div></div>;

  if (state === "private") {
    return (
      <div className="container">
        <div className="guard">
          <h2>该项目尚未公开</h2>
          <p>
            该项目处于立项或功能开发阶段，暂不对访客开放。请登录管理员账号后查看。
          </p>
          <Link href="/login" className="btn-primary">
            去登录
          </Link>
        </div>
      </div>
    );
  }

  if (state === "notfound" || !project) {
    return (
      <div className="container">
        <div className="empty">
          项目不存在，<Link href="/" style={{ color: "var(--accent)" }}>返回首页</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <Link href="/" className="back">
        ← 返回首页
      </Link>
      <article className="detail">
        <div className="detail-head">
          <div className="detail-title-row">
            <h1>{project.name}</h1>
            <span className={STATUS_BADGE[project.status]}>
              {STATUS_LABEL[project.status]}
            </span>
            {typeof project.completion === "number" && (
              <span className="badge badge-completion">
                完成度 {project.completion}%
              </span>
            )}
          </div>
          <p style={{ color: "var(--text-dim)", margin: 0, fontSize: 14 }}>
            更新于 {new Date(project.updatedAt).toLocaleDateString("zh-CN")}
          </p>
        </div>

        {project.cover && (
          <button
            type="button"
            className="detail-cover"
            style={{ backgroundImage: `url(${project.cover})`, cursor: "zoom-in" }}
            onClick={() => setViewSrc(project.cover!)}
            aria-label="预览封面图"
          />
        )}

        <div className="detail-desc">{project.description}</div>

        {project.devTool && (
          <p style={{ marginTop: 18, fontSize: 14, color: "var(--text-dim)" }}>
            🔧 开发工具：{project.devTool}
          </p>
        )}

        {project.screenshots && project.screenshots.length > 0 && (
          <div className="link-block">
            <h3>项目截图</h3>
            <div className="shot-grid">
              {project.screenshots.map((s, i) => (
                <button
                  className="shot"
                  key={i}
                  type="button"
                  onClick={() => setViewSrc(s.src)}
                >
                  <img src={s.src} alt={s.name ?? project.name} loading="lazy" />
                  {s.name && <span className="shot-name">{s.name}</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="link-block">
          <h3>配套平台链路</h3>
          {project.links && project.links.length > 0 ? (
            <div className="links">
              {project.links.map((l, i) => (
                <div className="link-item" key={i}>
                  <span className="label">{l.platform}</span>
                  <a href={l.url} target="_blank" rel="noopener noreferrer">
                    {l.title || l.url}
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p className="hint">该平台链路将在后台配置后展示。</p>
          )}
        </div>

        {project.nextPlan && (
          <div className="link-block">
            <h3>后续计划</h3>
            <p style={{ fontSize: 15, color: "#cdd4df" }}>{project.nextPlan}</p>
          </div>
        )}
      </article>

      {/* 截图灯箱 */}
      {viewSrc && (
        <div className="lightbox" onClick={() => setViewSrc(null)}>
          <img src={viewSrc} alt="截图预览" />
          <span className="lb-caption">点击任意处关闭</span>
        </div>
      )}
    </div>
  );
}
