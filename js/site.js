(function () {
	var root = document.documentElement;
	var themes = ["dark", "light", "green", "gold", "dusk"];
	var cards = document.querySelectorAll("[data-theme-choice]");
	var motionButtons = document.querySelectorAll("[data-motion]");
	var menu = document.querySelector(".menu");
	var links = document.getElementById("site-links");

	function currentTheme() {
		var value = root.getAttribute("data-theme");
		return themes.indexOf(value) === -1 ? "dark" : value;
	}

	function paint() {
		var theme = currentTheme();
		cards.forEach(function (card) {
			var on = card.getAttribute("data-theme-choice") === theme;
			card.setAttribute("aria-pressed", on ? "true" : "false");
		});
		var motion = root.getAttribute("data-motion") === "off" ? "off" : "on";
		motionButtons.forEach(function (button) {
			var on = button.getAttribute("data-motion") === motion;
			button.setAttribute("aria-pressed", on ? "true" : "false");
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

	var scrollFrame = 0;

	function glideTo(id) {
		var start = window.scrollY;
		var end = 0;
		if (id && id !== "top") {
			var target = document.getElementById(id);
			if (!target) return;
			var bar = document.querySelector(".nav");
			var offset = (bar ? bar.offsetHeight : 0) + 22;
			end = target.getBoundingClientRect().top + start - offset;
		}
		var distance = end - start;
		if (Math.abs(distance) < 2) {
			history.replaceState(null, "", id ? "#" + id : location.pathname);
			return;
		}
		var duration = Math.max(720, Math.min(1300, Math.abs(distance) * 0.62));
		var began = performance.now();
		var previous = root.style.scrollBehavior;
		root.style.scrollBehavior = "auto";
		window.cancelAnimationFrame(scrollFrame);
		function step(now) {
			var t = Math.min(1, (now - began) / duration);
			var eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
			window.scrollTo({ left: 0, top: start + distance * eased, behavior: "instant" });
			if (t < 1) {
				scrollFrame = window.requestAnimationFrame(step);
			} else {
				root.style.scrollBehavior = previous;
			}
		}
		scrollFrame = window.requestAnimationFrame(step);
		history.replaceState(null, "", "#" + (id || "top"));
	}

	document.querySelectorAll('a[href^="#"]').forEach(function (link) {
		link.addEventListener("click", function (event) {
			var id = link.getAttribute("href").slice(1);
			if (!id) return;
			event.preventDefault();
			glideTo(id);
		});
	});

	if (menu && links) {
		menu.addEventListener("click", function () {
			var open = links.classList.toggle("open");
			menu.setAttribute("aria-expanded", open ? "true" : "false");
		});
		links.querySelectorAll("a").forEach(function (link) {
			link.addEventListener("click", function () {
				links.classList.remove("open");
				menu.setAttribute("aria-expanded", "false");
			});
		});
	}

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

	var headline = document.querySelector(".typed");
	if (headline) {
		var line = "Bots that mine, craft, and walk for you.";
		var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches && root.getAttribute("data-motion") !== "on";
		var still = root.getAttribute("data-motion") === "off";
		if (reduce || still) {
			headline.textContent = line;
		} else {
			var index = 0;
			headline.classList.add("typing");
			window.setTimeout(function tick() {
				index += 1;
				headline.textContent = line.slice(0, index);
				if (index >= line.length) {
					window.setTimeout(function () { headline.classList.remove("typing"); }, 900);
					return;
				}
				var pause = line.charAt(index - 1) === "," ? 220 : 48;
				window.setTimeout(tick, pause);
			}, 420);
		}
	}

	paint();
})();
