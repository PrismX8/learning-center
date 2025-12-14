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
	if (st) document.querySelector("#colorPicker").value = savedTheme;
	if(localStorage.getItem("nebulo||search")) findSel(searchSelector, localStorage.getItem("nebulo||search")).selected = true;
	if(localStorage.getItem("nebulo||proxy")) findSel(proxySelector, localStorage.getItem("nebulo||proxy")).selected = true;
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
	if (localStorage.getItem("nebulo||fortniteMode") === "activated") {
		// If Fortnite Mode is already activated, deactivate it
		document.body.style.backgroundImage = "";
		localStorage.removeItem("nebulo||fortniteMode")
	} else {
		// Otherwise, activate it
		document.body.style.backgroundImage = "url(\"https://i.ytimg.com/vi/6evDWowLMbE/maxresdefault.jpg\")";
		localStorage.setItem("nebulo||fortniteMode", "activated");
	}
}