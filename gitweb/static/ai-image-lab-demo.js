(() => {
	const form = document.getElementById('generator-form');
	const apiKeyInput = document.getElementById('hf-api-key');
	const promptInput = document.getElementById('prompt-input');
	const strengthRange = document.getElementById('strength-range');
	const strengthOutput = document.getElementById('strength-output');
	const resultTitle = document.getElementById('result-title');
	const resultDescription = document.getElementById('result-description');
	const resultStyleBadge = document.getElementById('result-style-badge');
	const statusStyle = document.getElementById('status-style');
	const statusOutput = document.getElementById('status-output');
	const generateBtn = document.getElementById('generate-btn');
	const resetButton = document.getElementById('reset-demo');
	const quickPrompts = document.querySelectorAll('[data-prompt]');
	const stylePills = document.querySelectorAll('.style-pill');
	const resultPlaceholder = document.getElementById('result-placeholder');
	const resultLoading = document.getElementById('result-loading');
	const resultError = document.getElementById('result-error');
	const resultImage = document.getElementById('result-image');

	const HF_MODEL = 'black-forest-labs/FLUX.1-schnell';
	const HF_API_URL = `https://api-inference.huggingface.co/models/${HF_MODEL}`;

	const defaults = {
		prompt: promptInput.value,
		strength: strengthRange.value,
		style: 'Editorial',
		theme: 'editorial'
	};

	const stylePromptSuffixes = {
		editorial: ', editorial photography, soft diffused light, premium',
		neon: ', neon lighting, high contrast, chromatic glow, night atmosphere',
		sketch: ', digital illustration, soft lines, conceptual art style'
	};

	let selectedStyle = defaults.style;
	let selectedTheme = defaults.theme;
	let isGenerating = false;
	let lastObjectUrl = null;

	function updateSummary() {
		const strength = `${strengthRange.value}%`;
		resultTitle.textContent = `${selectedStyle} · ${strength} intensidad`;
		resultDescription.textContent = promptInput.value.trim() || defaults.prompt;
		resultStyleBadge.textContent = selectedStyle;
		statusStyle.textContent = selectedStyle;
		strengthOutput.value = strength;
	}

	function setStyle(button) {
		stylePills.forEach((pill) => pill.classList.remove('is-active'));
		button.classList.add('is-active');
		selectedStyle = button.dataset.style;
		selectedTheme = button.dataset.theme;
		updateSummary();
	}

	function showPlaceholder() {
		resultPlaceholder.hidden = false;
		resultLoading.hidden = true;
		resultError.hidden = true;
		resultImage.hidden = true;
	}

	function showLoading() {
		resultPlaceholder.hidden = true;
		resultLoading.hidden = false;
		resultError.hidden = true;
		resultImage.hidden = true;
	}

	function showError(message) {
		resultPlaceholder.hidden = true;
		resultLoading.hidden = true;
		resultError.hidden = false;
		resultError.textContent = message;
		resultImage.hidden = true;
	}

	function showImage(url) {
		resultPlaceholder.hidden = true;
		resultLoading.hidden = true;
		resultError.hidden = true;
		resultImage.src = url;
		resultImage.hidden = false;
	}

	function buildFullPrompt() {
		const base = promptInput.value.trim() || defaults.prompt;
		const suffix = stylePromptSuffixes[selectedTheme] || '';
		return base + suffix;
	}

	async function generateImage() {
		const apiKey = apiKeyInput.value.trim();
		if (!apiKey) {
			showError('Introduce tu clave de API de Hugging Face antes de generar.');
			return;
		}

		if (isGenerating) {
			return;
		}

		isGenerating = true;
		generateBtn.disabled = true;
		generateBtn.textContent = 'Generando…';
		showLoading();
		statusOutput.textContent = 'En proceso…';

		const prompt = buildFullPrompt();
		const numSteps = Math.round(4 + (Number(strengthRange.value) / 100) * 4);

		try {
			const response = await fetch(HF_API_URL, {
				method: 'POST',
				headers: {
					'Authorization': 'Bearer ' + apiKey,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					inputs: prompt,
					parameters: {
						num_inference_steps: numSteps
					}
				})
			});

			if (!response.ok) {
				let errorMessage = `Error ${response.status}`;
				try {
					const errorData = await response.json();
					if (errorData.error) {
						errorMessage = errorData.error;
					}
					if (response.status === 503 && errorData.estimated_time) {
						errorMessage = `El modelo está cargando. Inténtalo de nuevo en ${Math.ceil(errorData.estimated_time)}s.`;
					}
				} catch (_) {
					/* use default errorMessage */
				}
				if (response.status === 401) {
					errorMessage = 'Clave de API no válida. Comprueba tu token de Hugging Face.';
				}
				showError(errorMessage);
				statusOutput.textContent = 'Error';
				return;
			}

			const blob = await response.blob();
			if (lastObjectUrl) {
				URL.revokeObjectURL(lastObjectUrl);
			}
			lastObjectUrl = URL.createObjectURL(blob);
			showImage(lastObjectUrl);
			statusOutput.textContent = 'Completado';
			updateSummary();
		} catch (error) {
			showError(`Error de red: ${error.message}`);
			statusOutput.textContent = 'Error';
		} finally {
			isGenerating = false;
			generateBtn.disabled = false;
			generateBtn.textContent = 'Generar imagen';
		}
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

	strengthRange.addEventListener('input', updateSummary);
	promptInput.addEventListener('input', updateSummary);

	form.addEventListener('submit', (event) => {
		event.preventDefault();
		generateImage();
	});

	resetButton.addEventListener('click', () => {
		if (isGenerating) {
			return;
		}
		form.reset();
		promptInput.value = defaults.prompt;
		strengthRange.value = defaults.strength;
		setStyle(document.querySelector('[data-theme="editorial"]'));
		showPlaceholder();
		statusOutput.textContent = '—';
		if (lastObjectUrl) {
			URL.revokeObjectURL(lastObjectUrl);
			lastObjectUrl = null;
		}
		updateSummary();
	});

	updateSummary();
})();
