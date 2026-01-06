// Background audio starts on tap + simple analytics counter
document.addEventListener('DOMContentLoaded', () => {
	const AUDIO_ID = 'musicAudio';
	const analyticsKey = 'lw_analytics_v1';
	// View endpoints (multiple providers) with fallbacks
	const viewEndpoints = [
		'https://api.counterapi.dev/v1/datadestroyerlab/info/up',
		'https://api.countapi.xyz/update/datadestroyerlab_info/visits/?amount=1',
		'https://api.countapi.xyz/hit/datadestroyerlab_info/visits',
		'https://api.countapi.xyz/hit/datadestroyerlab.info/visits'
	];

	const audio = document.getElementById(AUDIO_ID);
	const viewCountEl = document.getElementById('viewCount');

	if (audio) {
		// request inline playback and looping; do NOT autoplay - play only after user tap
		audio.playsInline = true;
		audio.loop = true;
		audio.setAttribute('playsinline', '');
	}
	const bgVideo = document.getElementById('bgVideo');

	// Visitor counter via CountAPI (works on GitHub Pages + custom domain)
	async function updateViewCount() {
		if (!viewCountEl) return;
		const localKey = 'lw_view_local_fallback';
		for (const endpoint of viewEndpoints) {
			try {
				const res = await fetch(endpoint, { cache: 'no-store', mode: 'cors', referrerPolicy: 'no-referrer' });
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				const data = await res.json();
				const val = typeof data.value === 'number'
					? data.value
					: typeof data.count === 'number'
						? data.count
						: typeof data.result === 'number'
							? data.result
							: undefined;
				if (typeof val === 'number' && !Number.isNaN(val)) {
					viewCountEl.textContent = val.toLocaleString();
					return;
				}
			} catch (err) {
				console.warn('View counter fetch failed', endpoint, err);
			}
		}
		// Local-only fallback so it never stays blank
		try {
			const current = parseInt(localStorage.getItem(localKey) || '0', 10) + 1;
			localStorage.setItem(localKey, String(current));
			viewCountEl.textContent = current.toLocaleString();
		} catch (err) {
			viewCountEl.textContent = '--';
		}
	}


	function readAnalytics(){ return JSON.parse(localStorage.getItem(analyticsKey) || '{}'); }
	function saveAnalytics(obj){ localStorage.setItem(analyticsKey, JSON.stringify(obj)); }

	// Autoplay logic removed — audio will begin only after the user taps the overlay.

	// If there's a tap overlay, use it to start audio and reveal UI
	const overlay = document.getElementById('tapOverlay');
	if (overlay) {
		function handleOverlayClick(e) {
			console.log('Overlay clicked!');
			e.preventDefault();
			e.stopPropagation();
			
			try {
				// start background video first
				if (bgVideo) {
					try { bgVideo.play().catch(e => console.warn('bgVideo play failed', e)); } 
					catch(e) { console.warn('bgVideo play failed', e); }
				}
				// try to play audio
				if (audio) {
					try {
						audio.volume = 0.8;
						audio.muted = false;
						audio.loop = true;
						audio.play().catch(e => console.warn('Audio play failed', e));
					} catch(e) {
						console.warn('Audio setup failed', e);
					}
				}
			} catch (err) {
				console.warn('Media playback error', err);
			}
			
			// Always reveal UI
			document.querySelectorAll('.hidden-on-start').forEach(el => el.classList.remove('hidden-on-start'));
			overlay.style.display = 'none';
			
			// Update view count
			updateViewCount();
			
			// Analytics
			const data = readAnalytics(); 
			data['music_play'] = (data['music_play'] || 0) + 1; 
			saveAnalytics(data);
			
			// Remove listener after first successful click
			overlay.removeEventListener('click', handleOverlayClick);
		}
		
		overlay.addEventListener('click', handleOverlayClick);
	}

	// Easter egg: Click avatar 5 times for secret effect
	let avatarClickCount = 0;
	const avatar = document.querySelector('.avatar');
	if (avatar) {
		avatar.style.cursor = 'pointer';
		avatar.addEventListener('click', (e) => {
			e.stopPropagation();
			avatarClickCount++;
			if (avatarClickCount === 5) {
				const centerCard = document.querySelector('.center-card');
				if (centerCard) {
					centerCard.classList.add('easter-egg-active');
					setTimeout(() => {
						centerCard.classList.remove('easter-egg-active');
						avatarClickCount = 0;
					}, 2000);
				}
			}
		});
	}

	// Easy way to update your current project - just call this function or edit below:
	// updateCurrentProject("🎮", "Discord Bot", "Building Features", 50);
	function updateCurrentProject(emoji, name, status, percentage) {
		const emojiEl = document.getElementById('projectEmoji');
		const nameEl = document.getElementById('projectName');
		const statusEl = document.getElementById('projectStatus');
		const fillEl = document.getElementById('progressFill');
		const textEl = document.getElementById('progressText');
		
		if (emojiEl) emojiEl.textContent = emoji;
		if (nameEl) nameEl.textContent = name;
		if (statusEl) statusEl.textContent = status;
		if (fillEl && percentage !== undefined) {
			fillEl.style.width = percentage + '%';
		}
		if (textEl && percentage !== undefined) {
			textEl.textContent = percentage + '%';
		}
	}

	// Fetch project config from config.json
	async function loadProjectConfig() {
		try {
			const res = await fetch('config.json', { cache: 'no-cache' });
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const config = await res.json();
			if (config.project && config.project.emoji && config.project.name) {
				updateCurrentProject(
					config.project.emoji,
					config.project.name,
					config.project.status || 'Active',
					config.project.percentage || 0
				);
			}
		} catch (err) {
			console.warn('Config load failed - using defaults', err);
		}
	}

	// Load project config on page load
	loadProjectConfig();

	// Reset button focus states when returning to page
	document.querySelectorAll('.link-icon-btn').forEach(btn => {
		btn.addEventListener('click', function() {
			setTimeout(() => this.blur(), 100);
		});
	});
});
