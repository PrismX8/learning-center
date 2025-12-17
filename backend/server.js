import { createBareServer } from "@tomphttp/bare-server-node";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { uvPath } from "@titaniumnetwork-dev/ultraviolet";
import { dynamicPath } from "@nebula-services/dynamic";
import express from "express";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const publicDir = path.join(rootDir, "public");

const routes = [
  ["/", "index.html"],
  ["/math", "games.html"],
  ["/physics", "apps.html"],
  ["/settings", "settings.html"],
];

const bare = createBareServer("/bare/");
const app = express();

// Add middleware to handle headers for better stealth
app.use((req, res, next) => {
	// Set proper headers for better stealth
	res.setHeader('X-Content-Type-Options', 'nosniff');
	res.setHeader('X-Frame-Options', 'SAMEORIGIN');
	next();
});

// Ensure our own configs override packaged defaults (so prefix stays /nebulo-uv/ etc.)
app.use("/uv/", express.static(path.join(publicDir, "uv")));
app.use("/dynamic/", express.static(path.join(publicDir, "dynamic")));
app.use("/uv/", express.static(uvPath));
app.use("/dynamic/", express.static(dynamicPath));

app.use("/api/meta", async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: "URL parameter required" });
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(400).json({ error: "Failed to fetch URL" });
    }

    const html = await response.text();
    const title =
      html.match(/<meta property="og:title" content="([^"]*)"/i)?.[1] ||
      html.match(/<title[^>]*>(.*?)<\/title>/i)?.[1] ||
      "";
    const description =
      html.match(/<meta property="og:description" content="([^"]*)"/i)?.[1] ||
      html.match(/<meta name="description" content="([^"]*)"/i)?.[1] ||
      "";

    res.json({ title, description });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use(express.static(publicDir));

for (const [route, file] of routes) {
  app.get(route, (_req, res) => {
    res.sendFile(path.join(publicDir, file));
  });
}

app.use((_, res) => res.status(404).sendFile(path.join(publicDir, "404.html")));

const httpServer = createServer();

httpServer.on("request", (req, res) => {
  if (bare.shouldRoute(req)) {
    bare.routeRequest(req, res);
  } else {
    app(req, res);
  }
});

httpServer.on("error", (err) => console.log(err));

httpServer.on("upgrade", (req, socket, head) => {
  if (bare.shouldRoute(req)) {
    bare.routeUpgrade(req, socket, head);
  } else {
    socket.end();
  }
});

httpServer.listen({ port: process.env.PORT || 8080 }, () => {
  const addr = httpServer.address();
  console.log(`\x1b[42m\x1b[1m nebulo\n Port: ${addr.port}\x1b[0m`);
});

