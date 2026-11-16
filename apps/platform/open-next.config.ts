import { defineCloudflareConfig } from '@opennextjs/cloudflare';

// Authenticated pages are dynamic and must not share a public incremental cache.
// No R2 bucket or paid cache binding is needed for the current dashboard.
export default defineCloudflareConfig({});
