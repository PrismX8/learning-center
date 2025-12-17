const msg = document.getElementById("m");
const frame = document.getElementById("ifr");
let loadTimer;

// Console error filter for proxied sites
// Suppresses known non-critical errors (analytics, tracking, etc.)
(function() {
	const filterEnabled = localStorage.getItem("nebulo||errorFilter") !== "false"; // Enabled by default
	
	if (!filterEnabled) return;
	
	// Patterns to filter out (non-critical errors from proxied sites)
	const errorPatterns = [
		/500 \(Internal Server Error\)/i,
		/500 \(\)/i, // 500 errors without description
		/404 \(Not Found\)/i,
		/401 \(Unauthorized\)/i,
		/403 \(Forbidden\)/i,
		/\b500\b.*Internal Server Error/i, // 500 errors in various formats
		/POST.*\b500\b/i, // Any POST with 500
		/XMLHttpRequest.*\b500\b/i, // XHR 500
		/fetch.*\b500\b/i, // Fetch 500
		/ChunkLoadError/i,
		/analytics/i,
		/tracking/i,
		/beacon/i,
		/google-analytics/i,
		/gtag/i,
		/ga\(/i,
		/sentry/i,
		/error reporting/i,
		/telemetry/i,
		/ERR_ABORTED/i,
		/net::ERR/i,
		/Invalid user consent/i,
		/localStorage disabled/i,
		/nebulo-uv.*500/i,
		/nebulo-uv.*404/i,
		/nebulo-uv.*401/i,
		/nebulo-uv.*403/i,
		/\/gvgnv/i, // Common analytics endpoint
		/\/analytics/i,
		/\/track/i,
		/\/collect/i,
		/\/beacon/i,
		/pnavfmro/i, // Common analytics/tracking path pattern
		/mrahgsvrctg/i, // Analytics/tracking pattern
		/dlmw-ot1/i, // Analytics endpoint pattern
		/rcilbgt.*cmm/i, // Analytics domain pattern
		/cei-cjanlgnee/i, // Analytics path pattern
		/nebulo-uv.*pnavfmro/i, // Analytics requests through proxy
		/nebulo-uv.*dlmw-ot1/i, // Analytics endpoint through proxy
		/nebulo-uv.*rcilbgt/i, // Analytics domain through proxy
		/cxa.*cpaxyeaoeq/i, // Analytics endpoints
		/cxa0.*arcz.*gcmgs/i, // Analytics endpoints
		/Refused to set unsafe header/i, // Browser security restriction (expected)
		/User-Agent.*unsafe/i, // User-Agent header restriction
		/\/rrgbkd/i, // Analytics endpoint pattern
		/\/ppe`if/i, // Analytics endpoint pattern
		/\/cpqtcg/i, // Analytics endpoint pattern
		/\/fcfteptkzkne/i, // Analytics endpoint pattern
		/\/padvgrvixilg/i, // Analytics endpoint pattern
		/\/almuffpolt/i, // Analytics endpoint pattern
		/\/d3jlaj57ghr1f0/i, // Analytics endpoint pattern
		/\/bvlp\.qhcrgtjrmueh/i, // Analytics endpoint pattern
		/\/rvb.*alitigw/i, // Analytics endpoint pattern
		/\/dkrgcv/i, // Analytics endpoint pattern
		/\/hvl`\.aaqaneoefic/i, // Analytics endpoint pattern
		/\/h`orelbkd/i, // Analytics endpoint pattern
		/\/i`\.cdlxq/i, // Analytics endpoint pattern
		/\/ppe`if\.oefic/i, // Analytics endpoint pattern
		/\/fcsv\.lezx162/i, // Analytics endpoint pattern
		/\/rvb.*orelrvb/i, // Analytics endpoint pattern
		/ChunkLoadError/i, // Module loading errors
		/ERROR in messagingWithoutDetection.*ChunkLoadError/i, // Analytics ChunkLoadError
		/messagingWithoutDetection/i, // Analytics messaging errors
		/ERROR in messagingWithoutDetection/i, // Analytics messaging errors
		/Cannot read properties of undefined.*reading.*run/i, // Game kernel loader errors (common in proxied games)
		/TypeError.*Cannot read properties.*run/i, // Game kernel loader errors (alternative format)
		/Uncaught TypeError.*Cannot read properties.*run/i, // Game kernel loader errors (uncaught format)
		/kernel_loader/i, // Game kernel loader errors
		/loader_js_executable/i, // Game loader errors
		/m=kernel_loader/i, // Game kernel loader pattern
		/m=kernel_loader.*loader_js_executable/i, // Game kernel loader with executable
		/Uncaught TypeError.*Cannot read properties/i, // Common game loading errors
		/at m=kernel_loader/i, // Kernel loader stack trace
		/at.*kernel_loader/i, // Kernel loader in stack
		/Failed to load resource.*500/i, // Network 500 errors (analytics/tracking)
		/500 \(Internal Server Error\)/i, // 500 errors
		/the server responded with a status of 500/i, // 500 status errors
		/POST.*500/i, // POST 500 errors
		/GET.*500/i, // GET 500 errors
		/navigator\.js.*500/i, // Navigator beacon 500 errors
		/sendBeacon.*500/i, // SendBeacon 500 errors
		/\/cxa.*cpaxyeaoeq.*500/i, // Google Analytics 500 errors
		/\/cxa0.*arcz.*gcmgs.*500/i, // Google Analytics 500 errors
		/\/gvgnv.*500/i, // Analytics endpoint 500 errors
		/\/alanyvias.*gmoelg.*500/i, // Analytics endpoint 500 errors
		/\/o385864.*ilggsv.*500/i, // Analytics endpoint 500 errors
		/\/uqeppmrvan.*500/i, // Analytics endpoint 500 errors
		/\/acx.*aoaxol.*500/i, // Analytics endpoint 500 errors
		/\/if5.*s\{na.*500/i, // Analytics endpoint 500 errors
		/\/fcsv\.lezx162.*500/i, // Analytics endpoint 500 errors
		/\/bvlp\.qhcrgtjrmueh.*500/i, // Analytics endpoint 500 errors
		/\/dkrgcv.*500/i, // Analytics endpoint 500 errors
		/\/rvb.*alitigw.*500/i, // Analytics endpoint 500 errors
		/\/ppe`if.*500/i, // Analytics endpoint 500 errors
		/\/hvl`\.aaqaneoefic.*500/i, // Analytics endpoint 500 errors
		/\/h`orelbkd.*500/i, // Analytics endpoint 500 errors
		/\/i`\.cdlxq.*500/i, // Analytics endpoint 500 errors
		/\/ppe`if\.oefic.*500/i, // Analytics endpoint 500 errors
		/\/noaanhmsv.*500/i, // Analytics endpoint 500 errors
		/iframe.*sandbox.*escape/i, // Sandbox warning (expected for proxy functionality)
		/allow-scripts.*allow-same-origin/i, // Sandbox security warning
		/MIME type.*text\/html/i, // MIME type errors from proxied sites
		/Failed to load module script/i, // Module script loading errors
		/Failed to fetch dynamically imported module/i, // Dynamic import errors
		/preload.*credentials mode/i, // Preload credentials warnings
		/was preloaded using link preload but not used/i, // Preload not used warnings
		/preload.*not used within a few seconds/i, // Preload timeout warnings
		/Please make sure it has an appropriate.*as.*value/i, // Preload attribute warnings
		/Verification is taking longer/i, // Cloudflare verification messages
		/Check your Internet connection/i, // Cloudflare verification messages
		/Just a moment/i, // Cloudflare challenge messages
		/Checking your browser/i, // Cloudflare challenge messages
		/The resource.*was preloaded/i // Preload resource warnings
	];
	
	const originalError = console.error;
	const originalWarn = console.warn;
	
	// Cache for error filtering (performance optimization)
	const errorCache = new Map();
	const CACHE_SIZE = 100;
	
	function shouldFilter(args) {
		if (!args || args.length === 0) return false;
		
		// Quick check: if first arg is a string, use it directly (most common case)
		let message = '';
		if (typeof args[0] === 'string') {
			message = args[0];
			// Check cache first for performance
			if (errorCache.has(message)) {
				return errorCache.get(message);
			}
		} else {
			// Only do expensive conversion if needed
			message = args.map(arg => {
				if (typeof arg === 'string') return arg;
				if (arg instanceof Error) return arg.message;
				return String(arg);
			}).join(' ');
		}
		
		// Quick early returns for common patterns (no regex needed)
		if (message.includes('500') || message.includes('404') || message.includes('403') || 
		    message.includes('401') || message.includes('analytics') || message.includes('tracking') ||
		    message.includes('beacon') || message.includes('Refused to set unsafe header')) {
			const result = errorPatterns.some(pattern => pattern.test(message));
			// Cache result (limit cache size)
			if (errorCache.size >= CACHE_SIZE) {
				const firstKey = errorCache.keys().next().value;
				errorCache.delete(firstKey);
			}
			errorCache.set(message, result);
			return result;
		}
		
		// Full pattern matching only if quick check didn't match
		const result = errorPatterns.some(pattern => pattern.test(message));
		if (errorCache.size >= CACHE_SIZE) {
			const firstKey = errorCache.keys().next().value;
			errorCache.delete(firstKey);
		}
		errorCache.set(message, result);
		return result;
	}
	
	// Throttle console.error for performance (only process every 10ms)
	let lastErrorTime = 0;
	const ERROR_THROTTLE = 10;
	
	console.error = function(...args) {
		const now = Date.now();
		if (now - lastErrorTime < ERROR_THROTTLE) {
			// Skip if called too frequently (throttle)
			return;
		}
		lastErrorTime = now;
		
		// Filter errors before processing (check first)
		if (shouldFilter(args)) {
			return; // Suppress filtered errors
		}
		
		// Check if this is an error from a proxied site's analytics script
		const errorString = args.map(arg => {
			if (typeof arg === 'string') return arg;
			if (arg instanceof Error) return (arg.message || '') + ' ' + (arg.stack || '');
			return String(arg);
		}).join(' ');
		
		// Aggressively filter analytics/tracking errors and game loading errors
		if (errorString.includes('POST') && errorString.includes('500') && 
		    (errorString.includes('pnavfmro') || errorString.includes('dlmw-ot1') || 
		     errorString.includes('rcilbgt') || errorString.includes('mrahgsvrctg'))) {
			return; // Suppress analytics POST 500 errors
		}
		
		// Filter ChunkLoadError and kernel loader errors (common in proxied games)
		if (errorString.includes('ChunkLoadError') || 
		    errorString.includes('kernel_loader') ||
		    errorString.includes('m=kernel_loader') ||
		    (errorString.includes('Cannot read properties') && errorString.includes('run'))) {
			return; // Suppress game loading errors
		}
		
		// Only log if not filtered
		if (!shouldFilter(args)) {
			originalError.apply(console, args);
		}
	};
	
	console.warn = function(...args) {
		if (!shouldFilter(args)) {
			originalWarn.apply(console, args);
		}
	};
	
	// Also filter network errors shown in console
	const originalLog = console.log;
	console.log = function(...args) {
		if (!shouldFilter(args)) {
			originalLog.apply(console, args);
		}
	};
})();

if (!frame) {
	console.error("Frame element 'ifr' not found at script load time");
}

if (!msg) {
	console.error("Message element 'm' not found at script load time");
}

if (frame) {
frame.addEventListener("load", () => {
	try {
		msg.innerText = frame.contentDocument.title;
	} catch {
		msg.innerText = "";
	}
	if (loadTimer) {
		clearTimeout(loadTimer);
		loadTimer = null;
	}
});
}

function searchurl(url) {
	switch (localStorage.getItem("nebulo||search")) {
		case "ddg":
			proxy(`https://duckduckgo.com/?q=${url}`)
			break;
		case "google":
			proxy(`https://www.google.com/search?q=${url}`)
			break;
		default:
		case "brave":
			proxy(`https://search.brave.com/search?q=${url}`)
			break;
	}
}

function go(url) {
	if (!url || url.trim() === "") {
		return;
	}
	
	if (!isUrl(url)) {
		searchurl(url);
	} else {
		if (!(url.startsWith("https://") || url.startsWith("http://"))) {
			url = "http://" + url;
		}
		proxy(url);
	}
}

// Make go available globally
window.go = go;

function isUrl(val = "") {
	if (/^http(s?):\/\//.test(val) || val.includes(".") && val.substr(0, 1) !== " ") return true;
	return false;
}

function resolveURL(url) {
	if (!window.__uv$config) {
		console.error("__uv$config is not loaded. Make sure uv.config.js is loaded.");
		return null;
	}
	
	const proxyType = localStorage.getItem("nebulo||proxy") || "uv";
	
	switch(proxyType) {
		case "dy": 
			if (!window.Ultraviolet || !window.Ultraviolet.codec) {
				console.error("Ultraviolet is not loaded. Falling back to UV proxy.");
				return window.__uv$config.prefix + window.__uv$config.encodeUrl(url);
			}
			return "/nebulo-dn/" + Ultraviolet.codec.xor.encode(url);
		default:
		case "uv":
			return window.__uv$config.prefix + window.__uv$config.encodeUrl(url);
	}
}

function proxy(url) {
    if (!url || url.trim() === "") {
        return;
    }
    
    const align = document.getElementById("align");
    if (!align) {
        console.error("align element not found");
        return;
    }
    
    if (!msg) {
        console.error("msg element not found");
        return;
    }
    
    msg.innerText = "Loading…";
    document.getElementById("align").style.display = "flex";
    const sidebar = document.querySelector(".sidebar");
    if (sidebar) {
        sidebar.style.display = "none";
    }
    
    const proxiedUrl = resolveURL(url);

    if (!proxiedUrl) {
        console.error("Failed to resolve URL:", url);
        msg.innerText = "Error: Failed to resolve URL";
        return;
    }

        // Set iframe with proper game permissions
        if (frame) {
            // Inject lightweight stealth script into iframe (after load, non-blocking)
            // Don't inject immediately - wait for game to fully initialize
            frame.onload = function() {
                // Wait longer for games to initialize before injecting stealth
                // Games need time to load their kernel and dependencies
                setTimeout(() => {
                    if (window.requestIdleCallback) {
                        requestIdleCallback(() => {
                            injectStealthScript();
                        }, { timeout: 5000 }); // Longer timeout for games
                    } else {
                        setTimeout(injectStealthScript, 2000); // 2 second delay for games
                    }
                }, 3000); // Give games 3 seconds to initialize before stealth injection
            };
        
        function injectStealthScript() {
            try {
                const iframeWindow = frame.contentWindow;
                const iframeDoc = frame.contentDocument || iframeWindow.document;
                
                if (iframeDoc && iframeDoc.head) {
                    // Inject lightweight stealth script (minimal for performance)
                    const stealthScript = iframeDoc.createElement('script');
                    stealthScript.textContent = `
                        (function() {
                            'use strict';
                            const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
                            
                            // Remove webdriver
                            Object.defineProperty(navigator, 'webdriver', { get: () => undefined, configurable: true });
                            
                            // User agent
                            Object.defineProperty(navigator, 'userAgent', { get: () => USER_AGENT, configurable: true });
                            
                            // Languages
                            Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'], configurable: true });
                            Object.defineProperty(navigator, 'language', { get: () => 'en-US', configurable: true });
                            
                            // Plugins
                            Object.defineProperty(navigator, 'plugins', {
                                get: () => [
                                    { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer', description: 'Portable Document Format' },
                                    { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai', description: '' },
                                    { name: 'Native Client', filename: 'internal-nacl-plugin', description: '' }
                                ],
                                configurable: true
                            });
                            
                            // Platform
                            Object.defineProperty(navigator, 'platform', { get: () => 'Win32', configurable: true });
                            
                            // Hardware
                            Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8, configurable: true });
                            if (!navigator.deviceMemory) {
                                Object.defineProperty(navigator, 'deviceMemory', { get: () => 8, configurable: true });
                            }
                            
                            // Remove automation indicators
                            delete window.cdc_adoQpoasnfa76pfcZLmcfl_Array;
                            delete window.cdc_adoQpoasnfa76pfcZLmcfl_Promise;
                            delete window.cdc_adoQpoasnfa76pfcZLmcfl_Symbol;
                            
                            // Ensure storage APIs work for games (don't block them)
                            // Games need localStorage/sessionStorage access
                            
                            // Cookie handling for Cloudflare (simplified for performance)
                            let cookieHandlerInstalled = false;
                            const origCookieDesc = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie') || 
                                                  Object.getOwnPropertyDescriptor(HTMLDocument.prototype, 'cookie');
                            if (origCookieDesc && origCookieDesc.set && !cookieHandlerInstalled) {
                                cookieHandlerInstalled = true;
                                const origSetter = origCookieDesc.set;
                                Object.defineProperty(document, 'cookie', {
                                    get: origCookieDesc.get,
                                    set: function(value) {
                                        if ((value.includes('__cf') || value.includes('cf_clearance')) && !value.includes('path=')) {
                                            try {
                                                return origSetter.call(this, value.split(';')[0] + '; path=/');
                                            } catch(e) {}
                                        }
                                        return origSetter.call(this, value);
                                    },
                                    configurable: true
                                });
                            }
                            
                            // Better referrer
                            Object.defineProperty(document, 'referrer', {
                                get: () => location.href,
                                configurable: true
                            });
                            
                            // Viewport (lazy evaluation for performance)
                            if (!window.outerWidth) {
                                Object.defineProperty(window, 'outerWidth', { get: () => innerWidth || 1920, configurable: true });
                            }
                            if (!window.outerHeight) {
                                Object.defineProperty(window, 'outerHeight', { get: () => innerHeight || 1080, configurable: true });
                            }
                            
                            // Override fetch (minimal - don't interfere with game loading)
                            // Only override for non-game resources to avoid breaking game initialization
                            const origFetch = window.fetch;
                            window.fetch = function(...args) {
                                const [input, init = {}] = args;
                                const url = typeof input === 'string' ? input : input?.url || '';
                                
                                // Skip modification for game kernel/loader resources
                                if (url.includes('kernel_loader') || url.includes('loader_js_executable') || 
                                    url.includes('m=kernel_loader') || url.includes('gameframe') ||
                                    url.includes('crazygames') || url.includes('game')) {
                                    return origFetch.apply(this, args);
                                }
                                
                                // Only add headers if not already set (don't override game requests)
                                if (!init.headers) init.headers = {};
                                if (typeof init.headers === 'object' && !Array.isArray(init.headers)) {
                                    if (!init.headers['User-Agent'] && !init.headers['user-agent']) {
                                        init.headers['User-Agent'] = USER_AGENT;
                                    }
                                    if (!init.headers['Accept-Language']) {
                                        init.headers['Accept-Language'] = 'en-US,en;q=0.9';
                                    }
                                    // Don't override Accept header for game resources
                                    if (!init.headers['Accept']) {
                                        init.headers['Accept'] = '*/*';
                                    }
                                    // Only add Sec-Fetch headers if not present
                                    if (!init.headers['Sec-Fetch-Dest']) {
                                        init.headers['Sec-Fetch-Dest'] = 'empty';
                                    }
                                    if (!init.headers['Sec-Fetch-Mode']) {
                                        init.headers['Sec-Fetch-Mode'] = 'cors';
                                    }
                                    if (!init.headers['Sec-Fetch-Site']) {
                                        init.headers['Sec-Fetch-Site'] = 'cross-site';
                                    }
                                }
                                return origFetch.apply(this, args);
                            };
                            
                            // Override XHR (minimal - only safe headers for performance)
                            const origXHRSend = XMLHttpRequest.prototype.send;
                            XMLHttpRequest.prototype.send = function(...args) {
                                if (!this._headersSet) this._headersSet = {};
                                if (!this._headersSet['Accept-Language']) {
                                    try {
                                        this.setRequestHeader('Accept-Language', 'en-US,en;q=0.9');
                                        this._headersSet['Accept-Language'] = true;
                                    } catch(e) {}
                                }
                                return origXHRSend.apply(this, args);
                            };
                        })();
                    `;
                    iframeDoc.head.insertBefore(stealthScript, iframeDoc.head.firstChild);
                }
            } catch(e) {
                // Cross-origin restrictions may prevent this - ignore silently
            }
        }
        
        // Ensure iframe has proper permissions for games
        if (frame) {
            frame.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; microphone; camera; fullscreen; payment; geolocation; gamepad');
            // Add allow-modals for game dialogs, allow-same-origin for storage, allow-scripts for JS modules
            frame.setAttribute('sandbox', 'allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts allow-top-navigation allow-top-navigation-by-user-activation allow-downloads allow-storage-access-by-user-activation');
            frame.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
            // Remove allowfullscreen attribute to avoid warning (allow attribute handles it)
            frame.removeAttribute('allowfullscreen');
        }
        
        // Register service worker first (critical for proxy to work)
        if (typeof registerSW === 'function') {
            // Set a timeout to load iframe even if SW registration is slow
            const swTimeout = setTimeout(() => {
                if (frame && !frame.src) {
                    console.warn('[proxy] Service worker registration timeout, loading iframe anyway');
                    frame.src = proxiedUrl;
                }
            }, 3000); // 3 second timeout
            
            registerSW().then(async () => {
                clearTimeout(swTimeout);
                // Wait for service worker to be ready (with timeout)
                try {
                    await Promise.race([
                        navigator.serviceWorker.ready,
                        new Promise((_, reject) => setTimeout(() => reject(new Error('SW ready timeout')), 2000))
                    ]);
                } catch (e) {
                    // SW ready check failed or timed out, continue anyway
                    console.warn('[proxy] Service worker ready check failed, loading anyway');
                }
                // Set iframe src after service worker is ready
                if (frame && !frame.src) {
                    frame.src = proxiedUrl;
                }
            }).catch((err) => {
                clearTimeout(swTimeout);
                // If SW registration fails, still try to load (may work without SW)
                console.warn('[proxy] Service worker registration failed, loading anyway:', err);
                if (frame && !frame.src) {
                    frame.src = proxiedUrl;
                }
            });
        } else {
            // registerSW not available, load directly
            if (frame) {
                frame.src = proxiedUrl;
            }
        }
    } else {
        // Try to get it again
        const frameRetry = document.getElementById("ifr");
        if (frameRetry) {
            frameRetry.src = proxiedUrl;
        } else {
            console.error("Could not find iframe element");
            return;
        }
    }
    
    msg.innerText = "Loading site…";
    align.scrollIntoView({ behavior: "smooth" });
    loadTimer = setTimeout(() => {
        msg.innerText = "Still loading… if this stays, open DevTools > Network and check the first /nebulo-uv/ request status.";
    }, 5000);
}

function exit() {
	document.getElementById("align").style.display = "none";
	document.querySelector(".sidebar").style.display = "";
	frame.src = "";
}
