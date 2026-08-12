// Lighthouse CI budgets (architecture spine AD-15): Performance,
// Accessibility, Best Practices, and SEO must each score >=95.
//
// Scope note: every route in this app except /sign-in requires an
// authenticated Clerk session (story 1.5's proxy.ts), and this repo has
// no e2e auth-seeding mechanism yet (see AGENTS.md's Playwright TODO) —
// so this run is deliberately scoped to the one realistically testable
// unauthenticated route. Expand to authenticated routes once an
// auth-seeding mechanism exists; don't build one as a side effect here.
module.exports = {
  ci: {
    collect: {
      url: ["http://localhost:3000/sign-in"],
      startServerCommand: "pnpm --filter @azentisfieldos/web start",
      startServerReadyPattern: "Ready in",
      startServerReadyTimeout: 30000,
      numberOfRuns: 1,
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.95 }],
        "categories:accessibility": ["error", { minScore: 0.95 }],
        "categories:best-practices": ["error", { minScore: 0.95 }],
        "categories:seo": ["error", { minScore: 0.95 }],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
