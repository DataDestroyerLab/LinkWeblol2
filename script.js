// Background audio starts on tap + simple analytics counter
document.addEventListener('DOMContentLoaded', () => {
	const AUDIO_ID = 'musicAudio';
	const analyticsKey = 'lw_analytics_v1';

	const audio = document.getElementById(AUDIO_ID);

	if (audio) {
		// request inline playback and looping; do NOT autoplay — play only after user tap
		audio.playsInline = true;
		audio.loop = true;
		audio.setAttribute('playsinline', '');
	}
	const bgVideo = document.getElementById('bgVideo');


	function readAnalytics(){ return JSON.parse(localStorage.getItem(analyticsKey) || '{}'); }
	function saveAnalytics(obj){ localStorage.setItem(analyticsKey, JSON.stringify(obj)); }

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
				// reveal main UI
				document.querySelectorAll('.hidden-on-start').forEach(el=> el.classList.remove('hidden-on-start'));
				overlay.style.display = 'none';
				// Analytics
				const data = readAnalytics(); data['music_play'] = (data['music_play'] || 0) + 1; saveAnalytics(data);
			} catch (err) {
				console.warn('Playback failed on overlay click', err);
			}
		}, { once: true });
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

	// Note: volume slider and progress UI were removed — audio is only started once via the overlay tap.
});

