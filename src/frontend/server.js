import { createRequestHandler } from "@remix-run/express";
import express from "express";

const devBackendPort = process.env.DEV_BACKEND_PORT;

const viteDevServer =
  process.env.NODE_ENV === "production"
    ? null
    : await import("vite").then((vite) =>
        vite.createServer({
          server: { middlewareMode: true },
        })
      );

const app = express();
app.use(
  viteDevServer
    ? viteDevServer.middlewares
    : express.static("build/client")
);

app.get('/data/*', async (req, res) => {
  const result = await fetch(
    `http://127.0.0.1:${devBackendPort}${req.url}`,
    {headers: req.headers}
  )
  res.setHeaders(result.headers);
  res.json(await result.json());
});

const build = viteDevServer
  ? () =>
      viteDevServer.ssrLoadModule(
        "virtual:remix/server-build"
      )
  : await import("./build/server/index.js");

app.all("*", createRequestHandler({ build }));

app.listen(3000, () => {
  console.log("App listening on http://localhost:3000");
});