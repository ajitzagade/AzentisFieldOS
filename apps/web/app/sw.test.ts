import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Loads and evaluates the REAL public/sw.js source (not a re-implementation) in
// a mock ServiceWorkerGlobalScope, so these tests exercise the exact caching
// tiers that ship. Covers the two I/O-matrix rows that were otherwise
// untested — "Offline navigation" and "API via SW (NetworkOnly)" — plus
// the Fix-A regression guard that same-origin RSC route payloads are never
// cached.

// Vitest's root is apps/web (vitest.config.mts), so process.cwd() anchors here;
// jsdom rewrites import.meta.url to a non-file scheme, so resolve from cwd.
const SW_SOURCE = readFileSync(resolve(process.cwd(), "public/sw.js"), "utf8");

const ORIGIN = "https://app.example.test";

interface MockRequest {
  url: string;
  method: string;
  mode: string;
  headers: Headers;
}

function mockRequest(init: {
  url: string;
  method?: string;
  mode?: string;
  headers?: Record<string, string>;
}): MockRequest {
  return {
    url: init.url,
    method: init.method ?? "GET",
    mode: init.mode ?? "cors",
    headers: new Headers(init.headers ?? {}),
  };
}

interface SwEvent {
  request?: MockRequest;
  respondWith?: (p: Promise<Response>) => void;
  waitUntil?: (p: Promise<unknown>) => void;
}
type SwHandler = (event: SwEvent) => void;

interface MockCache {
  match(req: MockRequest | string): Promise<Response | undefined>;
  addAll(urls: string[]): Promise<void>;
  put(req: MockRequest | string, res: Response): Promise<void>;
}

function createMockCaches() {
  const stores = new Map<string, Map<string, Response>>();
  function store(name: string): Map<string, Response> {
    let s = stores.get(name);
    if (!s) {
      s = new Map();
      stores.set(name, s);
    }
    return s;
  }
  return {
    stores,
    open(name: string): Promise<MockCache> {
      const s = store(name);
      return Promise.resolve({
        match(req: MockRequest | string) {
          const key = typeof req === "string" ? req : req.url;
          return Promise.resolve(s.get(key));
        },
        addAll(urls: string[]) {
          for (const u of urls) s.set(u, new Response(`PRECACHED:${u}`));
          return Promise.resolve();
        },
        put(req: MockRequest | string, res: Response) {
          const key = typeof req === "string" ? req : req.url;
          s.set(key, res);
          return Promise.resolve();
        },
      });
    },
    keys() {
      return Promise.resolve([...stores.keys()]);
    },
    delete(name: string) {
      return Promise.resolve(stores.delete(name));
    },
  };
}

function loadSw(fetchImpl: (req: MockRequest) => Promise<Response>) {
  const handlers: Record<string, SwHandler> = {};
  const self = {
    addEventListener(type: string, handler: SwHandler) {
      handlers[type] = handler;
    },
    skipWaiting: () => Promise.resolve(),
    clients: { claim: () => Promise.resolve() },
    location: { origin: ORIGIN },
  };
  const caches = createMockCaches();
  const fetchMock = vi.fn(fetchImpl);
  // Deliberately evaluate the shipped public/sw.js (a plain-JS SW script, not an
  // importable module) inside an injected mock scope, so the test drives the
  // real handler rather than a re-implementation.
  const factory = new Function("self", "caches", "fetch", SW_SOURCE) as (
    self: unknown,
    caches: unknown,
    fetch: unknown,
  ) => void;
  factory(self, caches, fetchMock);
  return { handlers, caches, fetch: fetchMock };
}

type SwEnv = ReturnType<typeof loadSw>;

async function runInstall(env: SwEnv): Promise<void> {
  let pending: Promise<unknown> | undefined;
  env.handlers.install?.({ waitUntil: (p) => (pending = p) });
  await pending;
}

async function runFetch(
  env: SwEnv,
  request: MockRequest,
): Promise<{ respondCalled: boolean; response?: Response }> {
  let respondCalled = false;
  let responsePromise: Promise<Response> | undefined;
  env.handlers.fetch?.({
    request,
    respondWith: (p) => {
      respondCalled = true;
      responsePromise = p;
    },
  });
  const response = responsePromise ? await responsePromise : undefined;
  return { respondCalled, response };
}

function onlyStore(env: SwEnv): Map<string, Response> {
  const first = [...env.caches.stores.values()][0];
  if (!first) throw new Error("no cache store created");
  return first;
}

describe("service worker — offline navigation", () => {
  it("serves the cached /offline shell when a navigation's network fetch rejects", async () => {
    const env = loadSw(() => Promise.reject(new Error("offline")));
    await runInstall(env);
    const cachedOffline = onlyStore(env).get("/offline");

    const { respondCalled, response } = await runFetch(
      env,
      mockRequest({ url: `${ORIGIN}/sites`, mode: "navigate" }),
    );

    expect(respondCalled).toBe(true);
    expect(response).toBe(cachedOffline);
  });

  it("returns the network response for a navigation and never caches it", async () => {
    const networkResponse = new Response("PAGE HTML");
    const env = loadSw(() => Promise.resolve(networkResponse));
    await runInstall(env);
    const sizeBefore = onlyStore(env).size; // just the precached /offline

    const { respondCalled, response } = await runFetch(
      env,
      mockRequest({ url: `${ORIGIN}/sites`, mode: "navigate" }),
    );

    expect(respondCalled).toBe(true);
    expect(response).toBe(networkResponse);
    expect(onlyStore(env).size).toBe(sizeBefore);
  });
});

describe("service worker — NetworkOnly passthrough (never cached)", () => {
  it("passes through non-GET requests (DSR POSTs)", async () => {
    const env = loadSw(() => Promise.resolve(new Response("x")));
    await runInstall(env);

    const { respondCalled } = await runFetch(
      env,
      mockRequest({ url: `${ORIGIN}/dsr`, method: "POST" }),
    );

    expect(respondCalled).toBe(false);
    expect(env.fetch).not.toHaveBeenCalled();
    expect(onlyStore(env).size).toBe(1);
  });

  it("passes through same-origin GETs carrying an Authorization header", async () => {
    const env = loadSw(() => Promise.resolve(new Response("x")));
    await runInstall(env);

    const { respondCalled } = await runFetch(
      env,
      mockRequest({
        url: `${ORIGIN}/sites`,
        headers: { Authorization: "Bearer test-token" },
      }),
    );

    expect(respondCalled).toBe(false);
    expect(env.fetch).not.toHaveBeenCalled();
    expect(onlyStore(env).size).toBe(1);
  });

  it("passes through cross-origin GETs (apps/api)", async () => {
    const env = loadSw(() => Promise.resolve(new Response("x")));
    await runInstall(env);

    const { respondCalled } = await runFetch(
      env,
      mockRequest({ url: "https://api.example.test/dsr" }),
    );

    expect(respondCalled).toBe(false);
    expect(env.fetch).not.toHaveBeenCalled();
    expect(onlyStore(env).size).toBe(1);
  });

  it("never caches same-origin RSC route payloads (Fix-A regression guard)", async () => {
    const env = loadSw(() => Promise.resolve(new Response("RSC")));
    await runInstall(env);

    const { respondCalled } = await runFetch(
      env,
      mockRequest({
        url: `${ORIGIN}/sites?_rsc=abc123`,
        mode: "cors",
        headers: { RSC: "1" },
      }),
    );

    expect(respondCalled).toBe(false);
    expect(env.fetch).not.toHaveBeenCalled();
    expect(onlyStore(env).size).toBe(1); // only /offline, no RSC payload
  });
});

describe("service worker — static assets are cache-first", () => {
  it("caches /_next/static and serves it from cache on the next request", async () => {
    const networkResponse = new Response("chunk", { status: 200 });
    const env = loadSw(() => Promise.resolve(networkResponse));
    await runInstall(env);
    const request = mockRequest({ url: `${ORIGIN}/_next/static/chunk.abc.js` });

    const first = await runFetch(env, request);
    expect(first.respondCalled).toBe(true);
    expect(first.response).toBe(networkResponse);
    expect(env.fetch).toHaveBeenCalledTimes(1);

    const second = await runFetch(env, request);
    expect(second.respondCalled).toBe(true);
    expect(await second.response?.text()).toBe("chunk"); // served from cache
    expect(env.fetch).toHaveBeenCalledTimes(1); // no second network hit
  });
});

// Sanity: a fresh scope per test (loadSw re-evaluates the source), so no
// handler/cache state leaks between cases.
beforeEach(() => {
  vi.restoreAllMocks();
});
