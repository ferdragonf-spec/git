(() => {
	const form = document.getElementById('generator-form');
	const fileInput = document.getElementById('source-image');
	const promptInput = document.getElementById('prompt-input');
	const strengthRange = document.getElementById('strength-range');
	const strengthOutput = document.getElementById('strength-output');
	const resultTitle = document.getElementById('result-title');
	const resultDescription = document.getElementById('result-description');
	const resultStyleBadge = document.getElementById('result-style-badge');
	const statusStyle = document.getElementById('status-style');
	const statusSeed = document.getElementById('status-seed');
	const resetButton = document.getElementById('reset-demo');
	const quickPrompts = document.querySelectorAll('[data-prompt]');
	const stylePills = document.querySelectorAll('.style-pill');
	const miniCards = document.querySelectorAll('.mini-card');
	const previews = document.querySelectorAll('[data-preview]');
	const uploadZone = document.querySelector('.upload-zone');

	const defaults = {
		prompt: promptInput.value,
		strength: strengthRange.value,
		style: 'Editorial',
		theme: 'editorial'
	};

	let selectedStyle = defaults.style;
	let selectedTheme = defaults.theme;

	const themeGradients = {
		editorial:
			'radial-gradient(circle at top left, rgba(122, 162, 255, 0.72), transparent 35%), radial-gradient(circle at bottom right, rgba(169, 89, 255, 0.65), transparent 30%), linear-gradient(135deg, #11193a 0%, #090d18 100%)',
		neon:
			'radial-gradient(circle at top left, rgba(16, 255, 220, 0.75), transparent 32%), radial-gradient(circle at bottom right, rgba(255, 0, 150, 0.72), transparent 34%), linear-gradient(135deg, #0f1232 0%, #080811 100%)',
		sketch:
			'radial-gradient(circle at top left, rgba(255, 255, 255, 0.55), transparent 36%), radial-gradient(circle at bottom right, rgba(154, 174, 202, 0.5), transparent 34%), linear-gradient(135deg, #242c3d 0%, #10151d 100%)'
	};

	function updateSummary() {
		const strength = `${strengthRange.value}%`;
		resultTitle.textContent = `${selectedStyle} · ${strength} intensidad`;
		resultDescription.textContent = promptInput.value.trim() || defaults.prompt;
		resultStyleBadge.textContent = selectedStyle;
		statusStyle.textContent = selectedStyle;
		statusSeed.textContent = `Seed ${1000 + Number(strengthRange.value) * 17}`;
		strengthOutput.value = strength;
		document.documentElement.style.setProperty('--preview-gradient', themeGradients[selectedTheme]);
	}

	function setStyle(button) {
		stylePills.forEach((pill) => pill.classList.remove('is-active'));
		button.classList.add('is-active');
		selectedStyle = button.dataset.style;
		selectedTheme = button.dataset.theme;
		updateSummary();
	}

	function selectVariant(card) {
		miniCards.forEach((item) => item.classList.remove('is-selected'));
		card.classList.add('is-selected');
	}

	function setImage(source) {
		previews.forEach((preview) => {
			preview.style.setProperty('--preview-image', `url("${source}")`);
			preview.classList.add('has-image');
		});
	}

	function clearImage() {
		previews.forEach((preview) => {
			preview.style.removeProperty('--preview-image');
			preview.classList.remove('has-image');
		});
	}

	function handleFile(file) {
		if (!file || !file.type.startsWith('image/')) {
			return;
		}

		const reader = new FileReader();
		reader.onload = ({ target }) => {
			setImage(target.result);
		};
		reader.readAsDataURL(file);
	}

	quickPrompts.forEach((button) => {
		button.addEventListener('click', () => {
			promptInput.value = button.dataset.prompt;
			updateSummary();
		});
	});

	stylePills.forEach((button) => {
		button.addEventListener('click', () => setStyle(button));
	});

	miniCards.forEach((card) => {
		card.addEventListener('click', () => selectVariant(card));
	});

	strengthRange.addEventListener('input', updateSummary);
	promptInput.addEventListener('input', updateSummary);

	fileInput.addEventListener('change', (event) => {
		handleFile(event.target.files[0]);
	});

	uploadZone.addEventListener('dragover', (event) => {
		event.preventDefault();
		uploadZone.classList.add('is-dragover');
	});

	uploadZone.addEventListener('dragleave', () => {
		uploadZone.classList.remove('is-dragover');
	});

	uploadZone.addEventListener('drop', (event) => {
		event.preventDefault();
		uploadZone.classList.remove('is-dragover');
		handleFile(event.dataTransfer.files[0]);
	});

	form.addEventListener('submit', (event) => {
		event.preventDefault();
		updateSummary();
		selectVariant(document.querySelector('.mini-card'));
	});

	resetButton.addEventListener('click', () => {
		form.reset();
		promptInput.value = defaults.prompt;
		strengthRange.value = defaults.strength;
		setStyle(document.querySelector('[data-theme="editorial"]'));
		selectVariant(document.querySelector('.mini-card'));
		clearImage();
		updateSummary();
	});

	updateSummary();
})();
