/** @type {import('next').NextConfig} */
const nextConfig = {
  // 纯静态导出：适配腾讯 EdgeOne / 任意静态托管，无需 Node 服务
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
