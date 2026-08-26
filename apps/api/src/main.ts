import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // rawBody: true keeps Nest's normal JSON body parsing AND additionally
  // buffers the raw bytes on req.rawBody — the Clerk webhook (Story 14.2)
  // needs the exact bytes to verify the Svix signature; every other route
  // still receives its parsed body unchanged.
  const app = await NestFactory.create(AppModule, { rawBody: true });
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
