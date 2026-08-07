/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly SITE_URL: string;
  // All optional: every dynamic feature fails open/silent (or shows a clear
  // error, for user-submitted forms) when its service isn't configured.
  readonly UPSTASH_REDIS_REST_URL?: string;
  readonly UPSTASH_REDIS_REST_TOKEN?: string;
  readonly RESEND_API_KEY?: string;
  readonly CONTACT_EMAIL?: string;
  readonly CONTACT_FROM_EMAIL?: string;
  readonly PUBLIC_CUSDIS_APP_ID?: string;
  readonly PUBLIC_CUSDIS_HOST?: string;
  readonly PUBLIC_BUTTONDOWN_USERNAME?: string;
  readonly GUESTBOOK_ADMIN_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
