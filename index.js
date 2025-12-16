import { createBareServer } from "@tomphttp/bare-server-node";
import { createServer } from "node:http";
import { uvPath } from "@titaniumnetwork-dev/ultraviolet";
import { dynamicPath } from "@nebula-services/dynamic";
import express from "express";
import * as cheerio from "cheerio";

const routes = [
	["/", "index"],
	["/math", "games"],
	["/physics", "apps"],
	["/settings", "settings"]
];

const navItems = [
	["/", "Home"],
	["/math", "Games"],
	["/physics", "Apps"],
	["/settings", "Settings"]
];

const bare = createBareServer("/bare/");
const app = express();

app.set("view engine", "ejs")

app.use(express.static("./public"));
app.use("/uv/", express.static(uvPath));
app.use("/dynamic/", express.static(dynamicPath))

app.get('/api/meta', async (req, res) => {
    const { url } = req.query;
    if (!url) {
        return res.status(400).json({ error: 'URL parameter required' });
    }
    try {
        const response = await fetch(url);
        if (!response.ok) {
            return res.status(400).json({ error: 'Failed to fetch URL' });
        }
        const html = await response.text();
        const $ = cheerio.load(html);
        const title = $('meta[property="og:title"]').attr('content') || $('title').text().trim();
        const description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '';
        res.json({ title, description });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

for (const [path, page] of routes) {
	app.get(path, (_, res) => res.render("layout", {
		path,
		navItems,
		page
	}));
}

app.use((_, res) => res.status(404).render("404"));

const httpServer = createServer();

httpServer.on("request", (req, res) => {
	if (bare.shouldRoute(req)) bare.routeRequest(req, res);
	else app(req, res);
});

httpServer.on("error", (err) => console.log(err));
httpServer.on("upgrade", (req, socket, head) => {
	if (bare.shouldRoute(req)) bare.routeUpgrade(req, socket, head);
	else socket.end();
});

httpServer.listen({ port: process.env.PORT || 8080 }, () => {
	const addr = httpServer.address();
	console.log(`\x1b[42m\x1b[1m nebulo\n Port: ${addr.port}\x1b[0m`);
});
