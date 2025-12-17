/**
 * Comprehensive Browser Stealth Script
 * Makes the proxy appear as a regular browser to Cloudflare and other detection systems
 */
(function() {
    'use strict';
    
    // Modern Chrome user agent
    const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    
    // Remove webdriver flag
    Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
        configurable: true
    });
    
    // Set proper user agent
    Object.defineProperty(navigator, 'userAgent', {
        get: () => USER_AGENT,
        configurable: true
    });
    
    // Set languages
    Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en'],
        configurable: true
    });
    
    Object.defineProperty(navigator, 'language', {
        get: () => 'en-US',
        configurable: true
    });
    
    // Add plugins (Chrome has plugins)
    const plugins = [
        { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer', description: 'Portable Document Format' },
        { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai', description: '' },
        { name: 'Native Client', filename: 'internal-nacl-plugin', description: '' }
    ];
    
    Object.defineProperty(navigator, 'plugins', {
        get: () => plugins,
        configurable: true
    });
    
    // Add mimeTypes
    Object.defineProperty(navigator, 'mimeTypes', {
        get: () => [
            { type: 'application/pdf', suffixes: 'pdf', description: 'Portable Document Format' },
            { type: 'application/x-google-chrome-pdf', suffixes: 'pdf', description: 'Portable Document Format' }
        ],
        configurable: true
    });
    
    // Platform
    Object.defineProperty(navigator, 'platform', {
        get: () => 'Win32',
        configurable: true
    });
    
    // Hardware concurrency (common CPU core count)
    Object.defineProperty(navigator, 'hardwareConcurrency', {
        get: () => 8,
        configurable: true
    });
    
    // Device memory
    if (navigator.deviceMemory === undefined) {
        Object.defineProperty(navigator, 'deviceMemory', {
            get: () => 8,
            configurable: true
        });
    }
    
    // Connection (make it look like a real connection)
    if (navigator.connection) {
        Object.defineProperty(navigator.connection, 'rtt', {
            get: () => 50,
            configurable: true
        });
        Object.defineProperty(navigator.connection, 'downlink', {
            get: () => 10,
            configurable: true
        });
        Object.defineProperty(navigator.connection, 'effectiveType', {
            get: () => '4g',
            configurable: true
        });
    }
    
    // Permissions API
    const originalQuery = window.navigator.permissions?.query;
    if (originalQuery) {
        window.navigator.permissions.query = function(parameters) {
            return originalQuery.apply(this, arguments).catch(() => {
                return { state: 'granted', onchange: null };
            });
        };
    }
    
    // Override fetch to add better headers
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        const [input, init = {}] = args;
        
        if (!init.headers) {
            init.headers = {};
        }
        
        if (typeof init.headers === 'object' && !Array.isArray(init.headers)) {
            if (!init.headers['User-Agent'] && !init.headers['user-agent']) {
                init.headers['User-Agent'] = USER_AGENT;
            }
            if (!init.headers['Accept-Language']) {
                init.headers['Accept-Language'] = 'en-US,en;q=0.9';
            }
            if (!init.headers['Accept']) {
                init.headers['Accept'] = '*/*';
            }
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
        
        return originalFetch.apply(this, args);
    };
    
    // Override XMLHttpRequest (Note: User-Agent cannot be set via XHR - browser restriction)
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;
    
    XMLHttpRequest.prototype.open = function(method, url, ...rest) {
        this._url = url;
        this._headersSet = this._headersSet || {};
        return originalXHROpen.apply(this, [method, url, ...rest]);
    };
    
    XMLHttpRequest.prototype.send = function(...args) {
        // Only set safe headers (User-Agent is blocked by browsers)
        if (this._url && !this._headersSet['Accept-Language']) {
            try {
                this.setRequestHeader('Accept-Language', 'en-US,en;q=0.9');
                this._headersSet['Accept-Language'] = true;
            } catch(e) {
                // Silently fail if header can't be set
            }
        }
        return originalXHRSend.apply(this, args);
    };
    
    // Chrome runtime (if available)
    if (window.chrome && window.chrome.runtime) {
        Object.defineProperty(window.chrome.runtime, 'onConnect', {
            get: () => undefined,
            configurable: true
        });
    }
    
    // Remove automation indicators
    delete window.cdc_adoQpoasnfa76pfcZLmcfl_Array;
    delete window.cdc_adoQpoasnfa76pfcZLmcfl_Promise;
    delete window.cdc_adoQpoasnfa76pfcZLmcfl_Symbol;
    
    // Canvas fingerprint protection (disabled for performance - can be re-enabled if needed)
    // Canvas operations are expensive and can cause lag on low-end devices
    // Uncomment below if fingerprinting protection is critical
    /*
    const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
    HTMLCanvasElement.prototype.toDataURL = function(...args) {
        if (this.width > 100 || this.height > 100) {
            return originalToDataURL.apply(this, args);
        }
        // Minimal noise for very small canvases only
        return originalToDataURL.apply(this, args);
    };
    */
    
    // WebGL fingerprint protection (disabled for games - they need real WebGL)
    // Games require proper WebGL context, so we don't modify it
    // This ensures games can access WebGL APIs properly
    
    // Optimize: Don't override setTimeout/Interval as it can cause performance issues
    // The browser's native timing is already realistic
    
    // Cookie handling - simplified for performance
    // Only handle Cloudflare cookies when needed (lazy evaluation)
    let cookieHandlerInstalled = false;
    function installCookieHandler() {
        if (cookieHandlerInstalled) return;
        cookieHandlerInstalled = true;
        
        const originalCookieDescriptor = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie') || 
                                        Object.getOwnPropertyDescriptor(HTMLDocument.prototype, 'cookie');
        
        if (originalCookieDescriptor && originalCookieDescriptor.set) {
            const originalCookieSetter = originalCookieDescriptor.set;
            Object.defineProperty(document, 'cookie', {
                get: originalCookieDescriptor.get,
                set: function(value) {
                    // Only process Cloudflare cookies
                    if (value.includes('__cf') || value.includes('cf_clearance')) {
                        try {
                            const parts = value.split(';');
                            let cookieString = parts[0];
                            if (!value.includes('path=')) cookieString += '; path=/';
                            if (!value.includes('domain=')) cookieString += '; domain=' + window.location.hostname;
                            return originalCookieSetter.call(this, cookieString);
                        } catch(e) {
                            return originalCookieSetter.call(this, value);
                        }
                    }
                    return originalCookieSetter.call(this, value);
                },
                configurable: true
            });
        }
    }
    
    // Install cookie handler lazily (only when first cookie is set)
    const originalCookieSet = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie')?.set;
    if (originalCookieSet) {
        Object.defineProperty(document, 'cookie', {
            get: Object.getOwnPropertyDescriptor(Document.prototype, 'cookie')?.get,
            set: function(value) {
                if (!cookieHandlerInstalled && (value.includes('__cf') || value.includes('cf_clearance'))) {
                    installCookieHandler();
                }
                return originalCookieSet.call(this, value);
            },
            configurable: true
        });
    }
    
    // Better referrer handling
    Object.defineProperty(document, 'referrer', {
        get: () => window.location.href,
        configurable: true
    });
    
    // Add viewport properties
    Object.defineProperty(window, 'outerWidth', {
        get: () => window.innerWidth || 1920,
        configurable: true
    });
    Object.defineProperty(window, 'outerHeight', {
        get: () => window.innerHeight || 1080,
        configurable: true
    });
    
    // Screen properties
    Object.defineProperty(screen, 'availWidth', {
        get: () => screen.width || 1920,
        configurable: true
    });
    Object.defineProperty(screen, 'availHeight', {
        get: () => screen.height || 1080,
        configurable: true
    });
    
    // Add Chrome-specific properties
    if (!window.chrome) {
        window.chrome = {};
    }
    if (!window.chrome.runtime) {
        window.chrome.runtime = {};
    }
    
    // Override Notification API (Cloudflare sometimes checks this)
    if (window.Notification) {
        const originalNotification = window.Notification;
        window.Notification = function(...args) {
            try {
                return new originalNotification(...args);
            } catch(e) {
                return null;
            }
        };
        window.Notification.prototype = originalNotification.prototype;
        window.Notification.permission = 'default';
        window.Notification.requestPermission = function() {
            return Promise.resolve('default');
        };
    }
    
    // Mouse movement simulation - disabled for performance
    // Real user interactions will naturally provide mouse movements
    
    // Silently enable stealth (no console log to avoid cluttering)
    // console.log('[Stealth] Advanced browser fingerprinting protection enabled');
})();

