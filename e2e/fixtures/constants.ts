// The one place the e2e database connection string is defined. Hard-coded
// (not read from a shared/ambient DATABASE_URL env var) so there is no way
// for this suite to accidentally inherit whatever DATABASE_URL happens to be
// set in the shell it runs in — it always targets this exact local database,
// nothing else. See e2e/README.md.
export const E2E_DATABASE_URL = "postgresql://priyanka@localhost:5432/azentisfieldos_e2e?schema=public";

export const WEB_PORT = 3100;
export const API_PORT = 3101;
export const WEB_BASE_URL = `http://localhost:${WEB_PORT}`;
export const API_BASE_URL = `http://localhost:${API_PORT}`;
