// Placeholder so Vercel's pre-build `functions` pattern validation
// (checked against source files, before any build command runs — see
// esbuild.vercel.mjs) finds a real file under api/. The actual build
// overwrites this with the fully bundled NestJS app.
module.exports = (_req, res) => {
  res.statusCode = 503;
  res.end("build did not run");
};
