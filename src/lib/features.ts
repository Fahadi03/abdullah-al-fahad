/**
 * Which third-party services are configured in this environment. Anything that
 * depends on one renders nothing (or a plain alternative) when it's missing, so
 * visitors never meet a form that can't work or a "not set up yet" notice.
 *
 * Server-side only: reads private env vars. Each is referenced as a literal
 * `import.meta.env.X` so Vite can replace it at build time.
 */
export const features = {
  /** Buttondown newsletter signup */
  newsletter: Boolean(import.meta.env.PUBLIC_BUTTONDOWN_USERNAME),
  /** Cusdis comments */
  comments: Boolean(import.meta.env.PUBLIC_CUSDIS_APP_ID),
  /** Resend — the contact form's outgoing email */
  contactForm: Boolean(
    import.meta.env.RESEND_API_KEY && import.meta.env.CONTACT_EMAIL && import.meta.env.CONTACT_FROM_EMAIL,
  ),
  /** Upstash Redis — guestbook, 👏 reactions and view counts */
  redis: Boolean(import.meta.env.UPSTASH_REDIS_REST_URL && import.meta.env.UPSTASH_REDIS_REST_TOKEN),
};
