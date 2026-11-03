"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { tryDecryptProjects } from "@/lib/crypto";
import { clearSession, getSessionKey } from "@/lib/session";
import {
  STATUS_BADGE,
  STATUS_LABEL,
  type Project,
  type ProjectStatus,
} from "@/types/project";

const STATUSES: ProjectStatus[] = ["INIT", "DEV", "MVP", "FULL_RELEASE"];

function emptyForm(): Project {
  const now = new Date().toISOString();
  return {
    id: "",
    name: "",
    cover: "",
    shortDesc: "",
    description: "",
    status: "INIT",
    nextPlan: "",
    projectUrl: "",
    sourceUrl: "",
    devTool: "workbuddy",
    docUrl: "",
    zhihuPromoteUrl: "",
    xiaohongshuAcc: "",
    createdAt: now,
    updatedAt: now,
  };
}

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);

  // 弹框
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Project>(emptyForm());

  // 鉴权 + 加载全部数据
  useEffect(() => {
    (async () => {
      const key = getSessionKey();
      if (!key) {
        router.replace("/login");
        return;
      }
      setAuthed(true);

      const pubRes = await fetch("/projects.public.json", { cache: "no-store" });
      const pub = (await pubRes.json()) as Project[];
      const privRes = await fetch("/projects.private.bin", { cache: "no-store" });
      const cipher = await privRes.text();
      const priv = tryDecryptProjects(cipher, key) ?? [];

      setProjects(
        [...pub, ...priv].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      );
      setLoading(false);
    })();
  }, [router]);

  const set = (field: keyof Project, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  // —— 弹框操作 ——
  const openAdd = () => {
    setEditing(false);
    setForm(emptyForm());
    setModalOpen(true);
  };

  const openEdit = (p: Project) => {
    setEditing(true);
    setForm({ ...p });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();
    if (editing) {
      setProjects((list) =>
        list.map((p) => (p.id === form.id ? { ...form, updatedAt: now } : p))
      );
    } else {
      const id =
        form.id.trim() ||
        "proj-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      setProjects((list) => [
        { ...form, id, createdAt: form.createdAt, updatedAt: now },
        ...list,
      ]);
    }
    closeModal();
  };

  const remove = (id: string) => {
    if (confirm("确定删除该项目？删除仅影响本地数据，未导出提交不会影响线上。")) {
      setProjects((list) => list.filter((p) => p.id !== id));
    }
  };

  // 导出明文 JSON（数据源），供覆盖 data/projects.raw.json
  const exportRaw = () => {
    const blob = new Blob([JSON.stringify(projects, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "projects.raw.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const logout = () => {
    clearSession();
    router.push("/login");
  };

  if (loading)
    return <div className="container"><div className="loading">验证登录中…</div></div>;
  if (!authed) return null;

  return (
    <div className="container">
      <div className="admin-toolbar">
        <h1>项目管理后台</h1>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn-primary" onClick={openAdd}>
            ＋ 新增项目
          </button>
          <button className="btn-secondary" onClick={exportRaw}>
            导出数据 JSON
          </button>
          <button className="btn-danger" onClick={logout}>
            退出登录
          </button>
        </div>
      </div>

      {/* 项目列表 */}
      <div className="section-title">
        <span>项目列表</span>
        <span className="note">{projects.length} 个</span>
      </div>
      {projects.length === 0 ? (
        <div className="empty">暂无项目，点击右上角「新增项目」添加。</div>
      ) : (
        <div className="proj-list">
          {projects.map((p) => (
            <div className="proj-row" key={p.id}>
              <div className="proj-row-info">
                <div className="proj-row-name">
                  {p.name}
                  <span className={STATUS_BADGE[p.status]}>
                    {STATUS_LABEL[p.status]}
                  </span>
                </div>
                <div className="proj-row-desc">{p.shortDesc}</div>
              </div>
              <div className="proj-row-actions">
                <button className="btn-secondary" onClick={() => openEdit(p)}>
                  编辑
                </button>
                <button className="btn-danger" onClick={() => remove(p.id)}>
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 新增 / 编辑 弹框 */}
      {modalOpen && (
        <div className="modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="modal">
            <div className="modal-header">
              <h2>{editing ? "编辑项目" : "新增项目"}</h2>
              <button className="modal-close" onClick={closeModal} aria-label="关闭">
                ×
              </button>
            </div>
            <form onSubmit={submit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div>
                    <label>项目名称 *</label>
                    <input className="field" value={form.name} onChange={(e) => set("name", e.target.value)} required />
                  </div>
                  <div>
                    <label>项目 ID（留空自动生成）</label>
                    <input className="field" value={form.id} onChange={(e) => set("id", e.target.value)} disabled={editing} />
                  </div>
                  <div className="full">
                    <label>封面图 URL</label>
                    <input className="field" value={form.cover} onChange={(e) => set("cover", e.target.value)} placeholder="图床 / COS 链接，可留空" />
                  </div>
                  <div className="full">
                    <label>简短简介 *（首页卡片）</label>
                    <input className="field" value={form.shortDesc} onChange={(e) => set("shortDesc", e.target.value)} required />
                  </div>
                  <div className="full">
                    <label>详细描述 *</label>
                    <textarea className="field" rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} required />
                  </div>
                  <div>
                    <label>项目进度</label>
                    <select className="field" value={form.status} onChange={(e) => set("status", e.target.value as ProjectStatus)}>
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label>开发工具（默认 workbuddy）</label>
                    <input className="field" value={form.devTool} onChange={(e) => set("devTool", e.target.value)} />
                  </div>
                  <div className="full">
                    <label>后续计划</label>
                    <textarea className="field" rows={2} value={form.nextPlan} onChange={(e) => set("nextPlan", e.target.value)} />
                  </div>
                  <div className="full">
                    <label>项目访问链接</label>
                    <input className="field" value={form.projectUrl} onChange={(e) => set("projectUrl", e.target.value)} placeholder="https://…" />
                  </div>
                  <div className="full">
                    <label>源码 GitHub 链接</label>
                    <input className="field" value={form.sourceUrl} onChange={(e) => set("sourceUrl", e.target.value)} placeholder="https://github.com/…" />
                  </div>
                  <div className="full">
                    <label>技术文档链接（公众号开放平台）</label>
                    <input className="field" value={form.docUrl} onChange={(e) => set("docUrl", e.target.value)} placeholder="https://…" />
                  </div>
                  <div className="full">
                    <label>推广链接（知乎）</label>
                    <input className="field" value={form.zhihuPromoteUrl} onChange={(e) => set("zhihuPromoteUrl", e.target.value)} placeholder="https://…" />
                  </div>
                  <div className="full">
                    <label>获客账号（小红书）</label>
                    <input className="field" value={form.xiaohongshuAcc} onChange={(e) => set("xiaohongshuAcc", e.target.value)} placeholder="https://…" />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={closeModal}>
                  取消
                </button>
                <button type="submit" className="btn-primary">
                  {editing ? "保存修改" : "添加项目"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 上线步骤说明 */}
      <div className="export-box">
        <strong>上线步骤（新增/修改项目后）</strong>
        <ol>
          <li>点击 <b>导出数据 JSON</b>，把下载的 <code>projects.raw.json</code> 覆盖到项目根目录的 <code>data/projects.raw.json</code>。</li>
          <li>在项目根目录执行 <code>npm run encrypt</code>，重新生成公开 JSON 与加密私密数据。</li>
          <li>提交 <code>public/projects.public.json</code> 与 <code>public/projects.private.bin</code> 到 Git 并推送。</li>
          <li>EdgeOne 自动重新部署，线上即为最新内容。</li>
        </ol>
      </div>
    </div>
  );
}
