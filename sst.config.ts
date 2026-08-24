/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "carousel",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
    };
  },
  async run() {
    // Secrets
    const databaseUrl = new sst.Secret("DatabaseUrl");
    const jwtSecret = new sst.Secret("JwtSecret");

    // S3 Bucket for file uploads
    const uploadBucket = new sst.aws.Bucket("UploadBucket");

    // API
    const api = new sst.aws.ApiGatewayV2("CarouselApi", {
      domain: "api.code4real.org",
    });

    const functionProps = {
      handler: "packages/functions/src/api.handler",
      runtime: "nodejs20.x",
      link: [databaseUrl, jwtSecret, uploadBucket],
      environment: {
        DATABASE_URL: databaseUrl.value,
        JWT_SECRET: jwtSecret.value,
        UPLOAD_BUCKET: uploadBucket.name,
      },
      nodejs: {
        format: "cjs",
        install: [
          "sequelize",
          "mysql2",
          "bcryptjs",
          "jsonwebtoken",
          "google-auth-library",
          "wikijs",
          "email-addresses",
          "multer",
          "@aws-sdk/client-s3",
          "@aws-sdk/s3-request-presigner",
        ],
      },
    };

    api.route("ANY /", functionProps);
    api.route("ANY /{proxy+}", functionProps);

    // Frontend Static Site
    // Serves frontend-next, the Vue 3 + Vite app. The previous Vue 2 app is
    // still in frontend/ but is no longer deployed.
    //
    // The fnm prefix stays: Vite 8 needs Node 20+, and the shell can be left
    // on Node 16 by frontend/.node-version. The openssl-legacy-provider flag
    // is gone — that was a webpack 4 workaround the old app needed.
    const site = new sst.aws.StaticSite("CarouselSite", {
      path: "frontend-next",
      build: {
        command: "eval $(fnm env) && fnm use 22 && npm run build",
        output: "dist",
      },
      domain: "carousel.code4real.org",
      dev: {
        command: "eval $(fnm env) && fnm use 22 && npm run dev",
        url: "http://localhost:8081",
      },
      environment: {
        // Read as import.meta.env.VITE_API_URL in services/http-common.js.
        // Under the old VUE_APP_ name it would silently fall back to "/api",
        // which has no proxy in production, so every request would 404.
        VITE_API_URL: $interpolate`${api.url}/api`,
      },
    });

    return {
      apiUrl: api.url,
      siteUrl: site.url,
    };
  },
});
