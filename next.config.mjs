const isProd = process.env.NODE_ENV === 'production';
const repoName = 'ifiok-design-landing';
const basePath = isProd ? `/${repoName}` : '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  basePath,
  assetPrefix: isProd ? `/${repoName}/` : '',
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
