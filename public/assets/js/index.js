// Build a Bare client if UV is available; otherwise fall back to window.fetch so the app keeps working
if (window.Ultraviolet && window.__uv$config) {
	window.bare = new Ultraviolet.BareClient(new URL(__uv$config.bare, window.location));
	
	// Override fetch to add better headers for stealth
	const originalFetch = window.bare.fetch;
	window.bare.fetch = function(input, init = {}) {
		if (!init.headers) {
			init.headers = {};
		}
		
		// Ensure proper headers for better stealth
		if (typeof init.headers === 'object' && !Array.isArray(init.headers)) {
			// Add User-Agent if not present
			if (!init.headers['User-Agent'] && !init.headers['user-agent']) {
				init.headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
			}
			// Add Accept-Language
			if (!init.headers['Accept-Language']) {
				init.headers['Accept-Language'] = 'en-US,en;q=0.9';
			}
			// Add Accept
			if (!init.headers['Accept']) {
				init.headers['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7';
			}
			// Add Sec-Fetch headers
			if (!init.headers['Sec-Fetch-Dest']) {
				init.headers['Sec-Fetch-Dest'] = 'document';
			}
			if (!init.headers['Sec-Fetch-Mode']) {
				init.headers['Sec-Fetch-Mode'] = 'navigate';
			}
			if (!init.headers['Sec-Fetch-Site']) {
				init.headers['Sec-Fetch-Site'] = 'none';
			}
			if (!init.headers['Sec-Fetch-User']) {
				init.headers['Sec-Fetch-User'] = '?1';
			}
			// Add Upgrade-Insecure-Requests
			if (!init.headers['Upgrade-Insecure-Requests']) {
				init.headers['Upgrade-Insecure-Requests'] = '1';
			}
			// Add DNT
			if (!init.headers['DNT']) {
				init.headers['DNT'] = '1';
			}
		}
		
		return originalFetch.call(this, input, init);
	};
} else {
	console.error("[nebulo] Ultraviolet not loaded; falling back to direct fetch. Proxying will be limited.");
	window.bare = {
		fetch: (...args) => fetch(...args),
	};
}

function fullscreen() {
	var elem = document.getElementById("ifr")
	if (elem.requestFullscreen) {
		elem.requestFullscreen();
	} else if (elem.webkitRequestFullscreen) { /* Safari */
		elem.webkitRequestFullscreen();
	} else if (elem.msRequestFullscreen) { /* IE11 */
		elem.msRequestFullscreen();
	}
}


async function registerSW() {
	if (!("serviceWorker" in navigator)) return null;

	try {
		await navigator.serviceWorker.register("/dynamic.sw-handler.js", {
			scope: "/nebulo-dn/",
		});
	} catch (err) {
		// Dynamic SW registration failed (non-critical)
	}

	const workerURL = "/uv.sw-handler.js";
	let worker = await navigator.serviceWorker.getRegistration(__uv$config.prefix).catch(() => null);

	if (!worker) {
		try {
			worker = await navigator.serviceWorker.register(workerURL, { scope: __uv$config.prefix });
		} catch (err) {
			console.error("[nebulo] UV SW registration failed", err);
			return null;
		}
	}

	try {
		await navigator.serviceWorker.ready;
	} catch {}

	return worker;
}

function setFavicon(f) {
	var link = document.querySelector("link[rel~='icon']");
	if (!link) {
		link = document.createElement("link");
		link.rel = "icon";
		document.head.appendChild(link);
	}
	link.href = f;
}

function encodeUVUrlWithPath(url = "") {
	return __uv$config.prefix + __uv$config.encodeUrl(url);
}

function abc() {
	let inFrame;

	try {
		inFrame = window !== top;
	} catch (e) {
		inFrame = true;
	}

	if (inFrame) return;
	const popup = window.open();
	if (!popup || popup.closed) {
		alert("Auto tab mask failed to open a new tab, allow popups and reload");
		return;
	}

	popup.document.body.innerHTML = `<title>${localStorage.getItem("nebulo||name") || "Sign in to your account"}</title>
<link rel="icon" href="${localStorage.getItem("nebulo||icon") || "https://www.microsoft.com/favicon.ico"}">
<iframe style="height:100%; width: 100%; border: none; position: fixed; top: 0; right: 0; left: 0; bottom: 0; border: none" sandbox="allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts allow-top-navigation allow-top-navigation-by-user-activation" src="${window.location.href}"></iframe>`;

	window.location.replace("https://www.google.com/");
}

registerSW();

window.addEventListener("load", () => {
	if (localStorage.getItem("nebulo||title")) document.title = localStorage.getItem("nebulo||title");
	if (localStorage.getItem("nebulo||favicon")) setFavicon(localStorage.getItem("nebulo||favicon"));

	const savedTheme = localStorage.getItem("nebulo||themehex");
	if (savedTheme) {
		document.body.style.backgroundColor = savedTheme;
	}
	if (localStorage.getItem("nebulo||fortniteMode") === "activated") {
		document.body.style.backgroundImage = "url(\"https://i.ytimg.com/vi/6evDWowLMbE/maxresdefault.jpg\")";
	}
});

const checkbox = document.getElementById("checkbox");
const darkMode = localStorage.getItem("nebulo||darkMode");

function setActiveNav() {
	const currentPath = window.location.pathname.replace(/\/index\.html?$/, "/");
	document.querySelectorAll(".sidebar a[data-path]").forEach((link) => {
		const targetPath = link.getAttribute("data-path");
		if (targetPath === currentPath) {
			link.classList.remove("nav-btn");
			link.classList.add("nav-active");
		} else {
			link.classList.remove("nav-active");
			link.classList.add("nav-btn");
		}
	});
}

function setLightMode(enable = true) {
	enable ? document.body.classList.add("dark") : document.body.classList.remove("dark");
	checkbox.checked = enable;
}

function toggleDarkMode() {
	if (document.body.classList.contains("dark")) {
		setLightMode(false);
		localStorage.setItem("nebulo||darkMode", "false");
	} else {
		setLightMode(true);
		localStorage.setItem("nebulo||darkMode", "true");
	}
}

checkbox.addEventListener("change", toggleDarkMode);

setLightMode(darkMode == "true");
setActiveNav();

/**
 * Why is this a thing
 * @useless true
 */
function mostUselessFunction() {
	var currentTime = new Date();

	var year = currentTime.getFullYear();
	var month = currentTime.getMonth() + 1; // Months are zero-based
	var day = currentTime.getDate();

	var hours = currentTime.getHours();
	var minutes = currentTime.getMinutes();
	var seconds = currentTime.getSeconds();

	var ampm = hours >= 12 ? "PM" : "AM";

	hours = (hours % 12) || 12;

	month = (month < 10 ? "0" : "") + month;
	day = (day < 10 ? "0" : "") + day;
	hours = (hours < 10 ? "0" : "") + hours;
	minutes = (minutes < 10 ? "0" : "") + minutes;
	seconds = (seconds < 10 ? "0" : "") + seconds;

	document.getElementById("time").innerHTML = year + "/" + month + "/" + day + " " + hours + ":" + minutes + ":" + seconds + " " + ampm;
}

setInterval(mostUselessFunction, 1000);