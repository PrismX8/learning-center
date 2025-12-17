const search = document.getElementById("search");
const searchInput = document.getElementById("search");
let debounceTimeout;
let isRequestPending = false;
var erudaScript; 

/*
const splash = [
	"nebulo is so hot",
	"Go ahead, browse your ex's social media profiles.",
	"We take your online privacy as seriously as your ex takes stalking your social media profiles.",
	"Check our our github.",
	"Shhh... we won't tell anyone you're here.",
	"Join our discord for more links.",
	"Imagine not using nebulo",
	"No website is out of your reach now.",
	"Your online freedom, our promise.",
	"Because a blocked internet, is no internet at all.",
	"Site blocked? Not on our watch!",
	"What site r u going on.",
	"Now 99% less skiddy... wait who put that there??? :<",
	"try shittle toilet services"
];

window.addEventListener("load", () => {
	document.querySelector("#splash").innerHTML = splash[Math.floor(Math.random() * (splash.length))];
});
*/

function initFormHandler() {
	const form = document.getElementById("form");
	const searchInput = document.getElementById("search");
	
	if (!searchInput) {
		console.error("Search input element not found");
		return false;
	}
	
	if (!form) {
		console.error("Form element not found");
		return false;
	}
	
	if (typeof go !== 'function') {
		return false;
	}
	
	form.addEventListener("submit", (event) => {
		event.preventDefault();
		const searchValue = searchInput.value.trim();
		if (!searchValue) {
			return;
		}
		go(searchValue);
	});
	
	return true;
}

window.addEventListener("DOMContentLoaded", () => {
	const link = atob(window.location.hash.slice(1));
	if (link && typeof go === 'function') go(link);
	
	// Try to initialize form handler, retry if go is not available yet
	if (!initFormHandler()) {
		// Retry after a short delay in case scripts are still loading
		setTimeout(() => {
			if (!initFormHandler()) {
				console.error("Failed to initialize form handler after retry. go function may not be loaded.");
			}
		}, 100);
	}
});

async function fetchResults(searchText) {
	try {
		const response = await bare.fetch(`https://duckduckgo.com/ac/?q=${encodeURIComponent(searchText)}`);
		const data = await response.json();
		isRequestPending = false;
		if (!Array.isArray(data)) {
			return;
		}
		const suggestions = document.getElementById("suggestions");
		suggestions.innerHTML = "";
		for(const result of (data.map(r => r.phrase))) {
			const suggestionItem = document.createElement("div");
			const suggestionLink = document.createElement("a");
			suggestionItem.classList = ["suggestions"];

			const boldText = result.includes(searchText) ? `<strong>${searchText}</strong>` : searchText;
			suggestionLink.innerHTML = result.replace(searchText, boldText);

			suggestionLink.addEventListener("click", (event) => {
				event.preventDefault();
				searchurl(result);
			});
			suggestionItem.appendChild(suggestionLink);
			suggestions.appendChild(suggestionItem);
		}
	} catch (e) {
		isRequestPending = false;
		console.error(e);
	}
}

searchInput.addEventListener("input", (event) => {
	clearTimeout(debounceTimeout);
	const searchText = event.target.value;

	debounceTimeout = setTimeout(() => {
		if (searchText.length >= 1) {
			fetchResults(searchText)
		}
		if (searchText.length < 1) {
		    document.getElementById("suggestions").style.display = "none";
		} else {
		    document.getElementById("suggestions").style.display = "block";
		}
		document.getElementById('preview').style.display = 'none';
}, 100);
});

const form = document.getElementById("form");

searchInput.addEventListener("input", (event) => {
	const searchText = event.target.value;

	if (searchText.trim().length > 0) {
		form.focus();
	}
});

function erudaToggle() {
	const elem = document.getElementById("ifr");
	const doc = elem?.contentDocument;

	// Only allow toggling once a page is actually loaded in the iframe
	if (!doc || !doc.body || !elem.src) {
		return;
	}

	if (erudaScript && erudaScript.parentNode === doc.body) {
		try {
			if (elem.contentWindow?.eruda) elem.contentWindow.eruda.destroy();
			doc.body.removeChild(erudaScript);
		} catch {}
		erudaScript = undefined;
		return;
	}

	erudaScript = doc.createElement("script");
	erudaScript.src = "https://cdn.jsdelivr.net/npm/eruda";
	erudaScript.onload = function() {
		try {
			if (elem.contentWindow?.eruda) {
				elem.contentWindow.eruda.init();
				elem.contentWindow.eruda.show();
			}
		} catch {}
	};
	erudaScript.onerror = function() {
		try { doc.body.removeChild(erudaScript); } catch {}
		erudaScript = undefined;
	};
	doc.body.appendChild(erudaScript);
}

function isUrl(val = "") {
    if (/^http(s?):\/\//.test(val) || val.includes(".") && val.substr(0, 1) !== " ") return true;
    return false;
}

searchInput.addEventListener('paste', (event) => {
    const pasted = (event.clipboardData || window.clipboardData).getData('text');
    if (isUrl(pasted)) {
        fetchMeta(pasted);
    }
});

function fetchMeta(url) {
    fetch(`/api/meta?url=${encodeURIComponent(url)}`)
        .then(response => response.json())
        .then(data => {
            const preview = document.getElementById('preview');
            if (data.title || data.description) {
                preview.innerHTML = `<div style="margin-top: 10px; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 5px;"><p style="color: #ccc; font-size: 14px;">${url}</p><h4>${data.title}</h4><p>${data.description}</p></div>`;
                preview.style.display = 'block';
            } else {
                preview.style.display = 'none';
            }
        })
        .catch(error => {
            console.error('Error fetching meta:', error);
            document.getElementById('preview').style.display = 'none';
        });
}
