(function () {
	var root = document.documentElement;
	var themes = ["dark", "light", "green", "gold", "dusk"];
	var cards = document.querySelectorAll("[data-theme-choice]");
	var motionButtons = document.querySelectorAll("[data-motion]");
	var countBase = "https://abacus.jasoncameron.dev";
	var countKey = "notjavindra.github.io/carpetplus-beta-downloads";
	var statusUrl = "https://raw.githubusercontent.com/notjavindra/StatusMod/refs/heads/main/Status";

	function currentTheme() {
		var value = root.getAttribute("data-theme");
		return themes.indexOf(value) === -1 ? "dark" : value;
	}

	function paint() {
		var theme = currentTheme();
		cards.forEach(function (card) {
			card.setAttribute("aria-pressed", card.getAttribute("data-theme-choice") === theme ? "true" : "false");
		});
		var motion = root.getAttribute("data-motion") === "off" ? "off" : "on";
		motionButtons.forEach(function (button) {
			button.setAttribute("aria-pressed", button.getAttribute("data-motion") === motion ? "true" : "false");
		});
	}

	cards.forEach(function (card) {
		card.addEventListener("click", function () {
			var theme = card.getAttribute("data-theme-choice");
			root.setAttribute("data-theme", theme);
			try { localStorage.setItem("carpetplus-theme", theme); } catch (e) {}
			paint();
		});
	});

	motionButtons.forEach(function (button) {
		button.addEventListener("click", function () {
			var mode = button.getAttribute("data-motion");
			if (mode === "off") root.setAttribute("data-motion", "off");
			else root.removeAttribute("data-motion");
			try { localStorage.setItem("carpetplus-motion", mode); } catch (e) {}
			paint();
		});
	});

	// Tabs. The hash picks the tab, so index.html#features opens Features.
	var tabs = document.querySelectorAll("[data-tab]");
	var panels = document.querySelectorAll("[data-panel]");

	function hasPanel(name) {
		return !!document.querySelector('[data-panel="' + name + '"]');
	}

	function show(name, focusTab) {
		if (!hasPanel(name)) name = "download";
		tabs.forEach(function (tab) {
			var on = tab.getAttribute("data-tab") === name;
			tab.setAttribute("aria-selected", on ? "true" : "false");
			tab.tabIndex = on ? 0 : -1;
			if (on && focusTab) tab.focus();
		});
		panels.forEach(function (panel) {
			panel.hidden = panel.getAttribute("data-panel") !== name;
		});
	}

	if (tabs.length) {
		tabs.forEach(function (tab, index) {
			tab.addEventListener("click", function () {
				var name = tab.getAttribute("data-tab");
				history.replaceState(null, "", "#" + name);
				show(name);
			});
			tab.addEventListener("keydown", function (event) {
				var step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
				if (!step) return;
				event.preventDefault();
				var next = tabs[(index + step + tabs.length) % tabs.length];
				var name = next.getAttribute("data-tab");
				history.replaceState(null, "", "#" + name);
				show(name, true);
			});
		});

		document.querySelectorAll('a[href^="#"]').forEach(function (link) {
			var name = link.getAttribute("href").slice(1);
			if (!hasPanel(name)) return;
			link.addEventListener("click", function (event) {
				event.preventDefault();
				history.replaceState(null, "", "#" + name);
				show(name);
				window.scrollTo({ top: 0, behavior: root.getAttribute("data-motion") === "off" ? "auto" : "smooth" });
			});
		});

		window.addEventListener("hashchange", function () {
			show(location.hash.slice(1));
		});

		show(location.hash.slice(1));
	}

	// Beta status from the same file the mod reads.
	var dot = document.getElementById("status-dot");
	var dotLabel = document.getElementById("status-dot-label");
	var statusText = document.getElementById("status-text");

	function setStatus(state, label) {
		if (dot) {
			dot.setAttribute("data-state", state);
			dot.title = label;
		}
		if (dotLabel) dotLabel.textContent = label;
		if (statusText) statusText.textContent = state === "online" ? "Online" : state === "maintenance" ? "Maintenance" : state === "off" ? "Off" : "Unknown";
	}

	if (dot || statusText) {
		fetch(statusUrl, { cache: "no-store" }).then(function (response) {
			if (!response.ok) throw new Error("status");
			return response.text();
		}).then(function (text) {
			var values = {};
			text.split(/\r?\n/).forEach(function (raw) {
				var line = raw.trim();
				if (!line || line.charAt(0) === "#") return;
				var split = line.indexOf("=");
				if (split < 0) split = line.indexOf(":");
				if (split <= 0) return;
				values[line.slice(0, split).trim().toLowerCase()] = line.slice(split + 1).trim().toLowerCase();
			});
			if (values.betastatus === "disable") setStatus("off", "The beta is turned off");
			else if (values.status === "disable") setStatus("maintenance", "The mod is in maintenance");
			else setStatus("online", "The beta is online");
		}).catch(function () {
			setStatus("unknown", "Could not check the beta status");
		});
	}

	// Lightbox for gallery shots.
	var lightbox = document.getElementById("lightbox");
	var lightboxImage = lightbox ? lightbox.querySelector("img") : null;
	document.querySelectorAll(".shot-open").forEach(function (button) {
		button.addEventListener("click", function () {
			var image = button.querySelector("img");
			if (!lightbox || !lightboxImage || !image) return;
			lightboxImage.src = image.src;
			lightboxImage.alt = image.alt;
			lightbox.showModal();
		});
	});
	if (lightbox) {
		lightbox.querySelector(".lightbox-close").addEventListener("click", function () {
			lightbox.close();
		});
		lightbox.addEventListener("click", function (event) {
			if (event.target === lightbox) lightbox.close();
		});
	}

	document.querySelectorAll("a[download]").forEach(function (link) {
		link.addEventListener("click", function () {
			fetch(countBase + "/hit/" + countKey, { cache: "no-store", keepalive: true }).catch(function () {});
		});
	});

	// Download count: the big number on clicks.html, the tile on the dashboard.
	var liveCount = document.getElementById("live-count");
	var countTile = document.getElementById("download-count");

	function paintCount(value) {
		if (typeof value !== "number" || value < 0) return;
		var next = String(value);
		try { localStorage.setItem("carpetplus-download-count", next); } catch (e) {}
		if (countTile) countTile.textContent = value.toLocaleString();
		if (!liveCount || liveCount.textContent === next) return;
		var first = liveCount.textContent === "";
		liveCount.textContent = next;
		if (first) return;
		liveCount.classList.remove("tick");
		void liveCount.offsetWidth;
		liveCount.classList.add("tick");
	}

	function readCount() {
		return fetch(countBase + "/get/" + countKey, { cache: "no-store" }).then(function (response) {
			if (!response.ok) throw new Error("count");
			return response.json();
		}).then(function (data) {
			if (!data || typeof data.value !== "number") throw new Error("count");
			paintCount(data.value);
		});
	}

	function loadCount(useShared) {
		var job = useShared && window.carpetplusCountReady
			? window.carpetplusCountReady.then(function (value) {
				if (typeof value !== "number") throw new Error("count");
				paintCount(value);
			})
			: readCount();
		job.catch(function () {
			window.setTimeout(function () { loadCount(false); }, 2000);
		});
	}

	if (liveCount || countTile) {
		try {
			var saved = localStorage.getItem("carpetplus-download-count");
			if (saved && countTile) countTile.textContent = Number(saved).toLocaleString();
		} catch (e) {}
		loadCount(true);
		var source = new EventSource(countBase + "/stream/" + countKey);
		source.onmessage = function (event) {
			try {
				var data = JSON.parse(event.data);
				if (data && typeof data.value === "number") paintCount(data.value);
			} catch (e) {}
		};
	}

	paint();
})();
