import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // 브라우저가 Content-Type을 강제로 추측하지 못하도록 차단
          { key: "X-Content-Type-Options", value: "nosniff" },
          // iframe 삽입(클릭재킹) 차단
          { key: "X-Frame-Options", value: "DENY" },
          // 리퍼러 헤더 최소화
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // 불필요한 브라우저 기능 차단
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
          // HTTPS 강제 (배포 환경)
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          // XSS 필터 활성화 (구형 브라우저 대응)
          { key: "X-XSS-Protection", value: "1; mode=block" },
        ],
      },
      {
        // API 응답에 캐시 금지 헤더 추가
        source: "/api/(.*)",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate" },
          { key: "Pragma", value: "no-cache" },
        ],
      },
    ];
  },
};

export default nextConfig;
