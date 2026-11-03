/** 项目进度状态枚举：立项 / 功能开发 / MVP版 / 完整版 */
export type ProjectStatus = "INIT" | "DEV" | "MVP" | "FULL_RELEASE";

export interface Project {
  id: string;
  /** 项目名称 */
  name: string;
  /** 封面图 URL（可选，放图床/COS） */
  cover?: string;
  /** 简短简介（首页卡片） */
  shortDesc: string;
  /** 详细描述（详情页） */
  description: string;
  /** 项目进度 */
  status: ProjectStatus;
  /** 后续计划 */
  nextPlan?: string;
  /** 项目访问链接 */
  projectUrl?: string;
  /** 源码 GitHub 链接 */
  sourceUrl?: string;
  /** 开发工具（如 workbuddy） */
  devTool?: string;
  /** 技术文档链接（如公众号开放平台） */
  docUrl?: string;
  /** 推广链接（如知乎） */
  zhihuPromoteUrl?: string;
  /** 获客账号（如小红书） */
  xiaohongshuAcc?: string;
  createdAt: string;
  updatedAt: string;
}

/** 进度的中文展示文案 */
export const STATUS_LABEL: Record<ProjectStatus, string> = {
  INIT: "立项",
  DEV: "功能开发",
  MVP: "MVP版",
  FULL_RELEASE: "完整版",
};

/** 卡片/列表上的进度徽章样式类 */
export const STATUS_BADGE: Record<ProjectStatus, string> = {
  INIT: "badge badge-init",
  DEV: "badge badge-dev",
  MVP: "badge badge-mvp",
  FULL_RELEASE: "badge badge-full",
};

/** 进度排序权重（越小越靠前） */
export const STATUS_ORDER: Record<ProjectStatus, number> = {
  FULL_RELEASE: 0,
  MVP: 1,
  DEV: 2,
  INIT: 3,
};

/**
 * 是否对未登录访客公开
 * 访客只能看到：MVP版 / 完整版
 */
export function isPublicStatus(status: ProjectStatus): boolean {
  return status === "MVP" || status === "FULL_RELEASE";
}
