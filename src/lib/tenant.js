// Tenant resolution for Kak ROS (multi-tenant SaaS).
//
//   restoran-a.kakros.id  -> tenant "restoran-a"
//   kakros.id / www.*     -> root mode (marketing + signup, no tenant)
//
// The resolved tenant id replaces what used to be the build-time
// VITE_BUSINESS_ID constant: services call getBusinessId() at call time,
// so one deployed build can serve every restaurant.

const ROOT_DOMAIN = (import.meta.env.VITE_ROOT_DOMAIN || 'kakros.id').toLowerCase();
// Fallback tenant for dev machines / preview hosts (e.g. localhost,
// *.pages.dev) that are not under ROOT_DOMAIN. Never used on the real
// root domain or its subdomains.
const DEV_DEFAULT_TENANT = (import.meta.env.VITE_BUSINESS_ID || '').toLowerCase();
const DEV_OVERRIDE_KEY = 'kakros-dev-tenant';

// Subdomains that are never tenants — they belong to the platform itself.
const RESERVED_SUBDOMAINS = new Set([
  'www', 'app', 'api', 'admin', 'platform', 'root', 'mail', 'static', 'assets',
  'dashboard', 'login', 'signup', 'daftar', 'help', 'docs', 'status', 'blog'
]);

// 3-40 chars, lowercase letters/digits/hyphens, no leading/trailing hyphen.
export const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/;

export function isValidSlug(slug) {
  return SLUG_PATTERN.test(slug) && !RESERVED_SUBDOMAINS.has(slug);
}

export function getRootDomain() {
  return ROOT_DOMAIN;
}

/**
 * Pure resolution from the current location.
 * Returns { mode: 'root' } or { mode: 'tenant', slug }.
 * A tenant slug is NOT guaranteed to exist or be valid here — the caller
 * (TenantContext) validates it and checks Firestore.
 */
export function resolveTenant() {
  const host = window.location.hostname.toLowerCase();

  // 1) Real platform domain: apex and subdomains.
  if (host === ROOT_DOMAIN) return { mode: 'root' };
  if (host.endsWith(`.${ROOT_DOMAIN}`)) {
    const sub = host.slice(0, -(ROOT_DOMAIN.length + 1));
    if (RESERVED_SUBDOMAINS.has(sub)) return { mode: 'root' };
    return { mode: 'tenant', slug: sub }; // a.b style hosts fail slug validation later
  }

  // 2) Local dev: restoran-a.localhost works natively in modern browsers.
  if (host.endsWith('.localhost')) {
    return { mode: 'tenant', slug: host.slice(0, -'.localhost'.length) };
  }

  // 3) Any other host (plain localhost, *.pages.dev previews, ...):
  //    ?tenant=slug override (remembered for the session so in-app
  //    navigation doesn't lose it), then the env default, else root mode.
  const params = new URLSearchParams(window.location.search);
  if (params.has('tenant')) {
    const value = params.get('tenant').trim().toLowerCase();
    if (value) sessionStorage.setItem(DEV_OVERRIDE_KEY, value);
    else sessionStorage.removeItem(DEV_OVERRIDE_KEY);
  }
  const override = sessionStorage.getItem(DEV_OVERRIDE_KEY);
  if (override) return override === 'root' ? { mode: 'root' } : { mode: 'tenant', slug: override };
  if (DEV_DEFAULT_TENANT) return { mode: 'tenant', slug: DEV_DEFAULT_TENANT };
  return { mode: 'root' };
}

/** URL of a tenant's site, used by the root page's "go to my restaurant". */
export function buildTenantUrl(slug) {
  const { protocol, hostname, port } = window.location;
  const onPlatformDomain = hostname === ROOT_DOMAIN || hostname.endsWith(`.${ROOT_DOMAIN}`);
  if (onPlatformDomain) {
    return `${protocol}//${slug}.${ROOT_DOMAIN}${port ? `:${port}` : ''}/`;
  }
  // dev / preview host: stay on the same host, switch tenant via query param
  return `${window.location.pathname}?tenant=${encodeURIComponent(slug)}`;
}

/** URL of the platform root (marketing/signup), if we are on the real domain. */
export function buildRootUrl() {
  const { protocol, hostname, port } = window.location;
  const onPlatformDomain = hostname === ROOT_DOMAIN || hostname.endsWith(`.${ROOT_DOMAIN}`);
  if (onPlatformDomain) return `${protocol}//${ROOT_DOMAIN}${port ? `:${port}` : ''}/`;
  return `${window.location.pathname}?tenant=root`;
}

// --- the active tenant id, set once at startup by TenantProvider ---------

let activeBusinessId = null;

export function setBusinessId(id) {
  activeBusinessId = id;
}

/**
 * Current tenant (businessId). Services call this at call time. Throws if
 * called before a tenant is resolved — better a loud error than silently
 * reading/writing the wrong tenant's data.
 */
export function getBusinessId() {
  if (!activeBusinessId) {
    throw new Error('Tenant belum ditentukan (getBusinessId dipanggil sebelum TenantProvider siap).');
  }
  return activeBusinessId;
}
