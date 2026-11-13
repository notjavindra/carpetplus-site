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
			if (link.getAttribute("href").indexOf("Carpet") === -1) return;
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

	var helpLog = document.getElementById("help-log");
	var helpForm = document.getElementById("help-form");
	var helpInput = document.getElementById("help-input");
	var helpMode = "chat";
	var discordUrl = "https://discord.gg/jFDACu7ZBE";

	function helpBubble(role, text, link) {
		if (!helpLog) return;
		var item = document.createElement("p");
		item.className = "bubble " + role;
		item.textContent = text;
		if (link) {
			item.appendChild(document.createTextNode(" "));
			var anchor = document.createElement("a");
			anchor.href = link.href;
			anchor.target = "_blank";
			anchor.rel = "noopener noreferrer";
			anchor.textContent = link.label;
			item.appendChild(anchor);
		}
		helpLog.appendChild(item);
		helpLog.scrollTop = helpLog.scrollHeight;
	}

	function versionParts(value) {
		return String(value).split(/[^0-9]+/).filter(Boolean).map(function (part) { return Number(part); });
	}

	function versionAtLeast(value, floor) {
		var left = versionParts(value);
		var right = versionParts(floor);
		var length = Math.max(left.length, right.length);
		for (var i = 0; i < length; i++) {
			var diff = (left[i] || 0) - (right[i] || 0);
			if (diff !== 0) return diff > 0;
		}
		return true;
	}

	function looksLikeLog(text) {
		return text.length > 80 && /crash|exception|mixin|caused by|description:|at \S+\(/i.test(text);
	}

	function stillBroken(text) {
		return /^(no|nope|nah)\b|still (does|crash|not|won)|doesn'?t work|didn'?t work|not working|same (crash|error|problem)|keeps crashing/i.test(text);
	}

	function wantsHuman(text) {
		return /^(yes|yeah|yep|sure|human|person)\b|discord|ticket/i.test(text);
	}

	function reviewCrash(text) {
		var notes = [];
		var description = (text.match(/^Description:\s*(.+)$/m) || [])[1];
		var caused = (text.match(/^Caused by:\s*(.+)$/m) || [])[1];
		var minecraft = (text.match(/Minecraft Version:\s*([0-9][0-9.]*)/i) || [])[1];
		var loader = (text.match(/fabricloader:\s*(?:Fabric Loader\s*)?([0-9][0-9.]*)/i) || [])[1];
		var carpet = (text.match(/carpetmod-plus:\s*CarpetMod\+\s*Beta\s*([0-9][0-9.]*)/i) || [])[1];
		var hand = /ViewHandMixin|class_759|ItemInHandRenderer/i.test(text);
		var mixin = /MixinTransformerError|InjectionError|Failed to apply Mixins/i.test(text);

		if (hand) {
			notes.push("This crash is in the hand display. Another mod edits the same code, often one that changes the item-switch animation. Carpet+BetaV2.20 is built to keep loading when that happens. If this log is from an older jar, download V2.20 and replace the old one.");
		} else if (mixin) {
			notes.push("A mixin failed while the game was starting" + (caused ? ": " + caused : "") + ". Another mod is editing the same part of the game. Update to Carpet+BetaV2.20, then remove the other mods and add them back one at a time.");
		}
		if (loader) {
			var loaderOk = versionAtLeast(loader, "0.18.4") && versionAtLeast("0.20.1", loader);
			notes.push(loaderOk
				? "Fabric Loader " + loader + " is inside the supported range, 0.18.4 up to 0.20.1."
				: "Fabric Loader " + loader + " is outside 0.18.4 up to 0.20.1. Use 0.20.1.");
		}
		if (minecraft && minecraft !== "1.21.11") {
			notes.push("This log is from Minecraft " + minecraft + ". Carpet+BetaV2.20 is for 1.21.11.");
		}
		if (carpet && !versionAtLeast(carpet, "2.20")) {
			notes.push("The log shows CarpetMod+ " + carpet + ". The current download is V2.20.");
		}
		if (/OutOfMemoryError/i.test(text)) {
			notes.push("The game ran out of memory. Give Minecraft more RAM in the launcher, or remove a few heavy mods.");
		}
		if (/UnsupportedClassVersionError/i.test(text)) {
			notes.push("The Java version is too old. CarpetMod+ needs Java 21 or newer.");
		}
		if (!notes.length) {
			notes.push("The report" + (description ? " says: " + description + "." : " has an error.") + (caused ? " The cause is: " + caused + "." : "") + " When the cause is not one of the known CarpetMod+ crashes, another mod is the usual reason. Remove other mods, start the game, then add them back.");
		}
		notes.push("Tell me if that still doesn't work.");
		return notes.join("\n\n");
	}

	function humanOffer() {
		helpMode = "human";
		return "Do you want to speak to a human?";
	}

	function humanSteps() {
		helpMode = "chat";
		return {
			text: "Join the Discord server and open a ticket. Paste your crash log in the ticket so a person can read it.",
			link: { href: discordUrl, label: "Open Discord" }
		};
	}

	function answerTopic(topic) {
		if (topic === "crashes") {
			helpMode = "log";
			return "Paste the crash log here. It is the file named crash-....txt in the crash-reports folder, or the latest.log file.";
		}
		if (topic === "bots") {
			helpMode = "follow";
			return "On V2.20 a bot stays after it joins. Only /kick removes one. Timeouts and kicks from other mods are ignored. If a bot still leaves, paste the lines from logs/latest.log from just before it left.\n\nTell me if that still doesn't work.";
		}
		if (topic === "fabric") {
			helpMode = "follow";
			return "Carpet+BetaV2.20 needs Minecraft 1.21.11, Fabric Loader 0.18.4 up to 0.20.1, and Fabric API 0.135.1 up to 0.141.6. Loader 0.20.1 and Fabric API 0.141.6 are the newest. Both downloads are on the Download tab.\n\nTell me if that still doesn't work.";
		}
		if (topic === "install") {
			helpMode = "follow";
			return "Install Fabric for Minecraft 1.21.11 and pick Loader 0.20.1. Put Fabric API 0.141.6 and Carpet+BetaV2.20.jar in the mods folder. Carpet, the Crit Fix, the Mace Fix, and Modify Player Data are already inside that jar. Launch the Fabric profile.\n\nTell me if that still doesn't work.";
		}
		if (topic === "mining") {
			helpMode = "follow";
			return "On V2.20, /player mine uses normal survival speed. The tool, Efficiency, and Haste decide how long a block takes, and the block shows cracks. An empty hand is slow. A netherite pick with Efficiency V is still very fast, the same as vanilla.\n\nTell me if that still doesn't work.";
		}
		helpMode = "chat";
		return "I can help with crashes, bots leaving, Fabric versions, installing, and mining. Pick one of those, or tell me you want a person on Discord.";
	}

	function topicFrom(text) {
		if (/crash|mixin|won'?t (start|launch)|doesn'?t (start|launch)|game (won'?t|doesn'?t) (open|start)/i.test(text)) return "crashes";
		if (/\bbots?\b|fake player|leaves|leaving|join and leave/i.test(text)) return "bots";
		if (/fabric|loader|fabric api/i.test(text)) return "fabric";
		if (/install|download|\.minecraft/i.test(text)) return "install";
		if (/mine|mining|netherrack|breaks? instantly/i.test(text)) return "mining";
		return "";
	}

	function replyTo(text) {
		var trimmed = text.trim();
		if (!trimmed) return null;
		if (looksLikeLog(trimmed)) {
			helpMode = "follow";
			return reviewCrash(trimmed);
		}
		if (helpMode === "human") {
			if (wantsHuman(trimmed)) return humanSteps();
			if (/^(no|nope|nah)\b/i.test(trimmed)) {
				helpMode = "chat";
				return "Okay. Ask another question here whenever you want.";
			}
		}
		if (helpMode === "follow" && stillBroken(trimmed)) return humanOffer();
		if (helpMode === "log") {
			var named = topicFrom(trimmed);
			if (named && named !== "crashes") return answerTopic(named);
			return "That does not look like a crash log yet. Paste the full report, from the line that says Minecraft Crash Report.";
		}
		if (/human|person|discord|ticket/i.test(trimmed)) return humanSteps();
		return answerTopic(topicFrom(trimmed));
	}

	function helpAsk(text) {
		helpBubble("user", text);
		var reply = replyTo(text);
		if (!reply) return;
		if (typeof reply === "string") helpBubble("bot", reply);
		else helpBubble("bot", reply.text, reply.link);
	}

	if (helpLog && helpForm && helpInput) {
		helpBubble("bot", "What do you need help with the mod?");
		document.querySelectorAll("[data-help]").forEach(function (button) {
			button.addEventListener("click", function () {
				helpBubble("user", button.textContent);
				helpBubble("bot", answerTopic(button.getAttribute("data-help")));
			});
		});
		helpForm.addEventListener("submit", function (event) {
			event.preventDefault();
			var text = helpInput.value;
			if (!text.trim()) return;
			helpInput.value = "";
			helpAsk(text);
		});
	}

	paint();
})();
