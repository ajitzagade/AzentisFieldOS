// Must be the very first import: installs the require hook that lets
// `require()` resolve raw-.ts workspace packages (@azentisfieldos/shared,
// @azentisfieldos/ui — consumed as source, no build step) at runtime.
// Locally this was applied via `node -r tsx/cjs`; a platform-managed
// Node.js launcher (e.g. Vercel Functions) invokes this file directly with
// no way to inject that CLI flag, so the hook has to install itself here.
import 'tsx/cjs';
import 'dotenv/config';
import helmet from 'helmet';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  // apps/web calls apps/api directly from client-side JS for several flows
  // (the mobile/desktop DSR forms' Site/Vendor pickers, story 3.2's offline
  // queue) — without this, every one of those browser-origin fetches fails
  // silently with a CORS error and the picker just never populates.
  //
  // CORS_ORIGIN is required in production: `origin: true` (the old
  // unconditional fallback) reflects whatever Origin header the caller sends
  // back as the allowed origin, which combined with `credentials: true`
  // means ANY website can make authenticated cross-origin requests on a
  // visitor's behalf. Fail loud instead of silently allowing that — the
  // fallback stays permissive only outside production, for local dev.
  const corsOrigin = process.env.CORS_ORIGIN?.split(',');
  if (!corsOrigin && process.env.NODE_ENV === 'production') {
    throw new Error(
      'CORS_ORIGIN must be set in production (comma-separated allowed origins) — refusing to start with an allow-any-origin fallback.',
    );
  }
  app.enableCors({
    origin: corsOrigin ?? true,
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3001);
}
void bootstrap();
