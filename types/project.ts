/** 项目截图 */
export interface ProjectScreenshot {
  /** 图片 URL（存 public/ 下的路径 / 图床链接 / 上传后的 base64） */
  src: string;
  /** 截图说明（可选） */
  name?: string;
}

/** 平台链路（源码 / 文档 / 推广 / 获客等，可动态添加多条） */
export interface PlatformLink {
  /** 平台，如 GitHub / 微信公众号 / 知乎 / 小红书 / 网站 */
  platform: string;
  /** 链接标题，如：源码仓库 */
  title: string;
  /** 链接地址 */
  url: string;
}

/** 项目进度状态枚举：立项 / 功能开发 / MVP版 / 完整版 */
export type ProjectStatus = "INIT" | "DEV" | "MVP" | "FULL_RELEASE";

export interface Project {
  id: string;
  /** 项目名称 */
  name: string;
  /** 封面图 URL（可选，放图床/COS） */
  cover?: string;
  /** 项目截图列表 */
  screenshots?: ProjectScreenshot[];
  /** 平台链路列表（源码 / 文档 / 推广 / 获客等） */
  links?: PlatformLink[];
  /** 简短简介（首页卡片） */
  shortDesc: string;
  /** 详细描述（详情页） */
  description: string;
  /** 项目进度 */
  status: ProjectStatus;
  /** 完成度（百分比，0-100，可选） */
  completion?: number;
  /** 后续计划 */
  nextPlan?: string;
  /** 开发工具（如 workbuddy） */
  devTool?: string;
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
