/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
    reactStrictMode: true,
    devIndicators: false,
    output: "export", // Enables static exports
    basePath: isProd ? "/usefull-things-200-mouse" : "", // Replace with your repository name
    assetPrefix: isProd ? "/usefull-things-200-mouse/" : "", // Replace with your repository name
    images: {
        unoptimized: true, // Optional: Disable default image optimization if not using a CDN
    },
};

export default nextConfig;
