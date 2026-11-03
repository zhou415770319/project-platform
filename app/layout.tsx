import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "我的项目展示平台",
  description: "个人项目作品集展示平台：展示项目进度、技术方案、配套平台链路与后续计划。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <Navbar />
        {children}
        <footer className="footer">
          © {new Date().getFullYear()} 我的项目展示平台 · 由 Doubao Work 构建
        </footer>
      </body>
    </html>
  );
}
