// Must be the very first import: installs the require hook that lets
// `require()` resolve raw-.ts workspace packages (@azentisfieldos/shared,
// @azentisfieldos/ui — consumed as source, no build step) at runtime.
// Locally this was applied via `node -r tsx/cjs`; a platform-managed
// Node.js launcher (e.g. Vercel Functions) invokes this file directly with
// no way to inject that CLI flag, so the hook has to install itself here.
import 'tsx/cjs';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // apps/web calls apps/api directly from client-side JS for several flows
  // (the mobile/desktop DSR forms' Site/Vendor pickers, story 3.2's offline
  // queue) — without this, every one of those browser-origin fetches fails
  // silently with a CORS error and the picker just never populates.
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') ?? true,
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3001);
}
void bootstrap();
