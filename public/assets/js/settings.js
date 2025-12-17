function findSel(sel, name) {
	return [...sel.querySelectorAll("option")].filter(e => e.value == name)[0];
}

function changeFavicon(value) {
	setFavicon(value);
	localStorage.setItem("nebulo||favicon", value);
}

function changeTitle(value) {
	document.title = value;
	localStorage.setItem("nebulo||title", value);
}


window.addEventListener("load", () => {
	const searchSelector = document.getElementById("se");
	const proxySelector = document.getElementById("proxy");
	try {
		const st = localStorage.getItem("nebulo||themehex");
		if (st) {
			document.querySelector("#colorPicker").value = st;
			document.body.style.backgroundColor = st;
		}
		if(!localStorage.getItem("nebulo||search")) localStorage.setItem("nebulo||search", "brave");
		findSel(searchSelector, localStorage.getItem("nebulo||search")).selected = true;
		if(localStorage.getItem("nebulo||proxy")) findSel(proxySelector, localStorage.getItem("nebulo||proxy")).selected = true;
		
		// Update button states
		if (localStorage.getItem("nebulo||fortniteMode") === "activated") {
			const mysteryBtn = document.querySelector("#mystery-button");
			if (mysteryBtn) {
				mysteryBtn.innerHTML = '<i class="fas fa-toggle-on"></i> Enabled';
			}
		}
		
		if (localStorage.getItem("nebulo||abc") === "enabled") {
			const abcBtn = document.querySelector("#abc");
			if (abcBtn) {
				abcBtn.innerHTML = '<i class="fas fa-shield-alt"></i> Cloaking Active';
			}
		}
	} catch {}
	
	searchSelector.addEventListener("change", e => localStorage.setItem("nebulo||search", e.target.value));
	proxySelector.addEventListener("change", e => localStorage.setItem("nebulo||proxy", e.target.value));
	document.querySelector("#reset-theme").addEventListener("click", resetTheme);
	document.querySelector("#abc").addEventListener("click", abc);
	document.querySelector("#mystery-button").addEventListener("click", setFortniteMode);
});

function changeTheme(value) {
	localStorage.setItem("nebulo||themehex", value);
	document.body.style.backgroundColor = value;
}

function resetTheme() {
	localStorage.removeItem("nebulo||themehex");
	document.body.style.backgroundColor = "#0b0b0b";
	document.querySelector("#colorPicker").value = "#0b0b0b";
}

function setFortniteMode() {
	const button = document.querySelector("#mystery-button");
	const icon = button.querySelector("i");
	
	if (localStorage.getItem("nebulo||fortniteMode") === "activated") {
		// If Fortnite Mode is already activated, deactivate it
		document.body.style.backgroundImage = "";
		localStorage.removeItem("nebulo||fortniteMode");
		icon.className = "fas fa-toggle-off";
		button.innerHTML = '<i class="fas fa-toggle-off"></i> Toggle';
	} else {
		// Otherwise, activate it
		document.body.style.backgroundImage = "url(\"https://i.ytimg.com/vi/6evDWowLMbE/maxresdefault.jpg\")";
		localStorage.setItem("nebulo||fortniteMode", "activated");
		icon.className = "fas fa-toggle-on";
		button.innerHTML = '<i class="fas fa-toggle-on"></i> Enabled';
	}
}

function abc() {
	const button = document.querySelector("#abc");
	const icon = button.querySelector("i");
	
	if (localStorage.getItem("nebulo||abc") === "enabled") {
		localStorage.removeItem("nebulo||abc");
		icon.className = "fas fa-shield";
		button.innerHTML = '<i class="fas fa-shield"></i> Enable Cloaking';
		// Add your ABC disable logic here
	} else {
		localStorage.setItem("nebulo||abc", "enabled");
		icon.className = "fas fa-shield-alt";
		button.innerHTML = '<i class="fas fa-shield-alt"></i> Cloaking Active';
		// Add your ABC enable logic here
		alert("About:Blank Cloaking enabled! This feature helps hide your browsing activity.");
	}
}