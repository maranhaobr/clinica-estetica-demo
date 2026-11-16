import path from 'node:path';
import type { NextConfig } from 'next';
const config: NextConfig = { poweredByHeader: false, outputFileTracingRoot: path.resolve(process.cwd()), async headers() { return [{ source: '/:path*', headers: [{key:'Cache-Control',value:'private, no-store'},{key:'X-Content-Type-Options',value:'nosniff'},{key:'X-Frame-Options',value:'DENY'},{key:'Referrer-Policy',value:'same-origin'}] }]; } };
export default config;
