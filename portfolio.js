(() => {
	const isInteractiveHome = Boolean(document.querySelector("#voice-toggle"));
	let voiceEnabled = true;
	let soundEnabled = true;
	let audioContext;

	function clickSound(pitch = 560) {
		if (!soundEnabled) return;
		if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
		const oscillator = audioContext.createOscillator();
		const gain = audioContext.createGain();
		oscillator.type = "square";
		oscillator.frequency.value = pitch;
		gain.gain.setValueAtTime(.045, audioContext.currentTime);
		gain.gain.exponentialRampToValueAtTime(.001, audioContext.currentTime + .08);
		oscillator.connect(gain).connect(audioContext.destination);
		oscillator.start();
		oscillator.stop(audioContext.currentTime + .08);
	}

	function say(message) {
		if (!voiceEnabled || !("speechSynthesis" in window)) return;
		window.speechSynthesis.cancel();
		const utterance = new SpeechSynthesisUtterance(message);
		utterance.rate = .95;
		utterance.pitch = 1.05;
		const status = document.querySelector("#shared-voice-status");
		if (status) status.classList.add("is-active");
		utterance.onend = () => status?.classList.remove("is-active");
		window.speechSynthesis.speak(utterance);
	}

	function addControls() {
		if (isInteractiveHome || document.querySelector(".page-tools")) return;
		const host = document.querySelector(".page-hero .shell, .section .shell");
		if (!host) return;
		const controls = document.createElement("div");
		controls.className = "page-tools";
		controls.innerHTML = '<button class="page-tool" id="shared-voice-toggle" type="button" aria-pressed="true">[ VOICE: ON ]</button><button class="page-tool" id="shared-sound-toggle" type="button" aria-pressed="true">[ SOUND: ON ]</button><button class="page-tool" id="shared-intro" type="button">[ READ PAGE ]</button><button class="page-tool" id="shared-crt-toggle" type="button" aria-pressed="false">[ CRT MODE ]</button>';
		host.append(controls);
		const voiceButton = controls.querySelector("#shared-voice-toggle");
		const soundButton = controls.querySelector("#shared-sound-toggle");
		voiceButton.addEventListener("click", () => {
			voiceEnabled = !voiceEnabled;
			voiceButton.textContent = voiceEnabled ? "[ VOICE: ON ]" : "[ VOICE: OFF ]";
			voiceButton.setAttribute("aria-pressed", String(voiceEnabled));
			clickSound(voiceEnabled ? 680 : 260);
			if (voiceEnabled) say("AI voice enabled."); else window.speechSynthesis.cancel();
		});
		soundButton.addEventListener("click", () => {
			soundEnabled = !soundEnabled;
			soundButton.textContent = soundEnabled ? "[ SOUND: ON ]" : "[ SOUND: OFF ]";
			soundButton.setAttribute("aria-pressed", String(soundEnabled));
			if (soundEnabled) clickSound(720);
		});
		controls.querySelector("#shared-intro").addEventListener("click", () => {
			clickSound(720);
			say(`${document.title.replace(" | Dhanush M", "")}. ${document.querySelector(".lede")?.textContent || "Explore this page."}`);
		});
		bindCrtToggle(controls.querySelector("#shared-crt-toggle"));
	}

	function bindCrtToggle(button) {
		if (!button || button.dataset.bound) return;
		button.dataset.bound = "true";
		button.addEventListener("click", () => {
			document.body.classList.toggle("crt-boost");
			const active = document.body.classList.contains("crt-boost");
			button.setAttribute("aria-pressed", String(active));
			button.classList.toggle("crt-active", active);
			button.textContent = active ? "[ CRT: ON ]" : "[ CRT MODE ]";
			clickSound(active ? 760 : 280);
		});
	}

	function addVoiceStatus() {
		if (document.querySelector("#voice-status") || document.querySelector("#shared-voice-status")) return;
		const status = document.createElement("div");
		status.id = "shared-voice-status";
		status.className = "voice-status";
		status.setAttribute("role", "status");
		status.textContent = "AI VOICE ACTIVE...";
		document.body.append(status);
	}

	function add3dMotion() {
		document.querySelectorAll(".card, .education-item, .cert-item, .milestones li, .focus-strip span").forEach(card => {
			card.addEventListener("pointermove", event => {
				const bounds = card.getBoundingClientRect();
				const x = (event.clientX - bounds.left) / bounds.width - .5;
				const y = (event.clientY - bounds.top) / bounds.height - .5;
				card.style.transform = `perspective(700px) rotateX(${y * -5}deg) rotateY(${x * 6}deg) translate(-3px, -3px)`;
			});
			card.addEventListener("pointerleave", () => { card.style.transform = ""; });
		});
	}

	function addSectionReveal() {
		const sections = document.querySelectorAll("main > .section");
		if (!sections.length) return;
		sections.forEach(section => section.classList.add("reveal-ready"));
		if (!("IntersectionObserver" in window)) {
			sections.forEach(section => section.classList.add("is-visible"));
			return;
		}
		const observer = new IntersectionObserver(entries => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					entry.target.classList.add("is-visible");
					observer.unobserve(entry.target);
				}
			});
		}, { threshold: .14 });
		sections.forEach(section => observer.observe(section));
	}

	function addCubeColorCycle() {
		const cube = document.querySelector("#console-3d");
		if (!cube) return;
		const palettes = [
			["#ff6b4a", "#ffd166", "#8de8d0", "#69c7ff", "#ff9fcf", "#304a70"],
			["#ff4d6d", "#ffb703", "#06d6a0", "#118ab2", "#c77dff", "#073b4c"],
			["#e63946", "#f1fa8c", "#a8dadc", "#457b9d", "#ffafcc", "#1d3557"],
			["#fb5607", "#ffbe0b", "#70e000", "#00b4d8", "#ff006e", "#3a0ca3"],
			["#ef476f", "#ffd166", "#06d6a0", "#118ab2", "#8338ec", "#073b4c"],
			["#f94144", "#f9c74f", "#90be6d", "#43aa8b", "#577590", "#2b2d42"]
		];
		let paletteIndex = 0;
		const applyPalette = () => {
			palettes[paletteIndex].forEach((color, index) => cube.style.setProperty(`--cube-${index + 1}`, color));
			paletteIndex = (paletteIndex + 1) % palettes.length;
		};
		applyPalette();
		window.setInterval(applyPalette, 1800);
	}

	function addBackgroundColorCycle() {
		const colors = [
			"#f7f0dc", "#fff1e6", "#fefae0", "#eaf4f4", "#f1f7ed", "#fff4d6", "#fcefe3", "#edf6ff",
			"#f8edeb", "#eef5db", "#f4effa", "#e9f5db", "#fff0f3", "#e8f1f2", "#fff8e7", "#eaf2ff",
			"#f6e8d7", "#e7f6f2", "#f9e4ec", "#e8ecf8", "#fff3bf", "#e8f5c8", "#f4e8ff", "#e3f2fd",
			"#fbe9d7", "#e0f7fa", "#fce4ec", "#e8eaf6", "#fffde7", "#f1f8e9", "#fff8e1", "#e0f2f1",
			"#ffeadb", "#dff7e3", "#f9e2f3", "#e4e9f7", "#fff1c1", "#e6f4ea", "#f5e6ff", "#e1f0ff",
			"#f7e6c4", "#dff3f0", "#f8dfe8", "#e1e6f2", "#fff5cc", "#e8f1cf", "#f0e5fa", "#dff0f8",
			"#ffe5d9", "#d8f3dc", "#f7d6e0", "#dfe7fd", "#fff3b0", "#e9f5db", "#eadcf8", "#d9f0ff"
		];
		const isDarkPage = Boolean(document.querySelector(".contact-grid"));
		const root = document.documentElement;
		let colorIndex = 0;
		const toDark = hex => {
			const red = parseInt(hex.slice(1, 3), 16);
			const green = parseInt(hex.slice(3, 5), 16);
			const blue = parseInt(hex.slice(5, 7), 16);
			return `rgb(${Math.round(red * .24)} ${Math.round(green * .24)} ${Math.round(blue * .24)})`;
		};
		const applyBackground = () => {
			const color = colors[colorIndex];
			const background = isDarkPage ? toDark(color) : color;
			root.style.setProperty(isDarkPage ? "--ink" : "--paper", background);
			document.body.style.backgroundColor = background;
			colorIndex = (colorIndex + 1) % colors.length;
		};
		document.body.style.transition = "background-color 1s ease";
		applyBackground();
		window.setInterval(applyBackground, 2200);
	}

	addControls();
	addVoiceStatus();
	add3dMotion();
	addSectionReveal();
	addCubeColorCycle();
	addBackgroundColorCycle();
	bindCrtToggle(document.querySelector("#crt-toggle"));

	document.addEventListener("click", event => {
		const target = event.target.closest("a, .card, .education-item, .cert-item, .milestones li, .focus-strip span");
		if (!target || target.closest(".page-tools")) return;
		if (isInteractiveHome && target.matches(".project")) return;
		if (target.matches("a")) {
			const href = target.getAttribute("href") || "";
			const isInternalPage = /^([^:#]+\.html)(#.*)?$/i.test(href);
			if (isInternalPage) {
				return;
			}
			if (!isInteractiveHome) {
				clickSound(620);
				if (target.textContent.trim()) say(`Opening ${target.textContent.trim()}.`);
			}
			return;
		}
		clickSound(440);
		const title = target.querySelector("h2, h3, strong")?.textContent || target.textContent.trim();
		if (title) say(`${title}. ${target.textContent.trim()}`);
	});
})();
