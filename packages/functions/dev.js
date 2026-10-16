// Runs the API on this machine: the same Express app the Lambda serves, on
// port 8080, where frontend-next's dev server proxies /api.
//
//   node --env-file=packages/functions/.env packages/functions/dev.js
//
// The .env file (gitignored) points DB_HOST/DB_NAME/DB_USER/DB_PASSWORD at a
// local MySQL. Run packages/core/src/migrate.js against it first.
//
// Sign-in uses real Google accounts; tokens are signed with JWT_SECRET, or the
// built-in default when it is unset, exactly as on Lambda.
const { S3Client } = require("@aws-sdk/client-s3");

// Roster imports copy the CSV to S3 before reading it. Locally there is no
// bucket, so skip that copy; the import itself reads the file from memory.
if (!process.env.UPLOAD_BUCKET) {
  S3Client.prototype.send = async () => ({});
}

const { app } = require("./src/api");

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Carousel API listening on http://localhost:${port}`);
});
