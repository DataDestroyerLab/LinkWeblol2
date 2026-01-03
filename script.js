// Music player (YouTube embed toggle) + simple analytics counter
document.addEventListener('DOMContentLoaded', () => {
	const TOGGLE_ID = 'musicToggle';
	const EMBED_ID = 'musicEmbed';
	const AUDIO_ID = 'musicAudio';
	const analyticsKey = 'lw_analytics_v1';

	const btn = document.getElementById(TOGGLE_ID);
	const embed = document.getElementById(EMBED_ID);
	const audio = document.getElementById(AUDIO_ID);

	if (audio) {
		// request inline playback and looping; do NOT autoplay — play only after user tap
		audio.playsInline = true;
		audio.loop = true;
		audio.setAttribute('playsinline', '');
	}
	const hint = document.getElementById('musicHint');
	const bgVideo = document.getElementById('bgVideo');


	function readAnalytics(){ return JSON.parse(localStorage.getItem(analyticsKey) || '{}'); }
	function saveAnalytics(obj){ localStorage.setItem(analyticsKey, JSON.stringify(obj)); }

	btn?.addEventListener('click', async () => {
		if (!audio) return;
		const isPlaying = !audio.paused && !audio.ended;
		try {
			if (!isPlaying) {
				await audio.play();
				embed.setAttribute('aria-hidden', 'false');
				btn.textContent = 'Pause Music';
				// Analytics: increment music play counter
				const data = readAnalytics();
				data['music_play'] = (data['music_play'] || 0) + 1;
				saveAnalytics(data);
			} else {
				audio.pause();
				embed.setAttribute('aria-hidden', 'true');
				btn.textContent = 'Play Music';
			}
		} catch (err) {
			console.warn('Playback failed', err);
		}
	});

	// update button text when audio ends
	audio?.addEventListener('ended', () => { embed.setAttribute('aria-hidden','true'); btn.textContent = 'Play Music'; });

	// Autoplay logic removed — audio will begin only after the user taps the overlay.

	// If there's a tap overlay, use it to start audio and reveal UI
	const overlay = document.getElementById('tapOverlay');
	if (overlay) {
		overlay.addEventListener('click', async (e) => {
			e.preventDefault();
			if (!audio) return;
			try {
				// start background video first (was paused) then audio
				if (bgVideo) {
					try { await bgVideo.play(); } catch(e) { console.warn('bgVideo play failed', e); }
				}
				audio.volume = 0.8;
				audio.muted = false;
				audio.loop = true;
				await audio.play();
				if (embed) embed.setAttribute('aria-hidden','false');
				if (btn) btn.textContent = 'Pause Music';
				if (hint) hint.style.display = 'none';
				// reveal main UI
				document.querySelectorAll('.hidden-on-start').forEach(el=> el.classList.remove('hidden-on-start'));
				overlay.style.display = 'none';
				// Analytics
				const data = readAnalytics(); data['music_play'] = (data['music_play'] || 0) + 1; saveAnalytics(data);
			} catch (err) {
				console.warn('Playback failed on overlay click', err);
				if (hint) hint.style.display = '';
			}
		}, { once: true });
	}

	// Note: volume slider and progress UI were removed — audio is controlled via the overlay and toggle button.
});
