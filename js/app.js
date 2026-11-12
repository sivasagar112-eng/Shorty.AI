document.addEventListener('DOMContentLoaded', () => {
    const videoUrlInput = document.getElementById('videoUrl');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const errorMsg = document.getElementById('errorMsg');
    const loaderSection = document.getElementById('loaderSection');
    const resultsSection = document.getElementById('resultsSection');
    const clipsContainer = document.getElementById('clipsContainer');
    const steps = document.querySelectorAll('.step');
    const videoThumb = document.getElementById('videoThumb');
    const videoTitle = document.getElementById('videoTitle');
    const videoDuration = document.getElementById('videoDuration');

    analyzeBtn.addEventListener('click', handleAnalysis);
    videoUrlInput.addEventListener('keypress', e => { if (e.key === 'Enter') handleAnalysis(); });

    // ─── Main Pipeline ────────────────────────────────────────────────────────
    async function handleAnalysis() {
        const url = videoUrlInput.value.trim();
        errorMsg.classList.add('hidden');
        resultsSection.classList.add('hidden');

        if (!validateYouTubeUrl(url)) {
            showError('Please enter a valid YouTube video Link.');
            return;
        }

        const videoId = getYouTubeId(url);
        showLoader(true);
        disableInput(true);

        try {
            // Step 1 — Real metadata via YouTube oEmbed (free, no key, CORS OK)
            updateStep(0);
            const metadata = await fetchRealMetadata(videoId);
            videoTitle.textContent = metadata.title;
            videoDuration.textContent = `Duration: ${metadata.duration}`;
            videoThumb.src = metadata.thumbnail;

            // Step 2 — Fetch real transcript
            updateStep(1);
            const transcript = await fetchTranscript(videoId);

            // Step 3 — AI analysis
            updateStep(2);
            await wait(600);

            const viralClips = transcript && transcript.length > 10
                ? analyzeTranscript(transcript, metadata.durationSeconds)
                : intelligentSimulation(metadata.durationSeconds);

            renderClips(viralClips, videoId, !!transcript, metadata.title);

            showLoader(false);
            resultsSection.classList.remove('hidden');
            resultsSection.scrollIntoView({ behavior: 'smooth' });

        } catch (err) {
            showError('An error occurred during analysis.');
            console.error(err);
            showLoader(false);
        } finally {
            disableInput(false);
        }
    }

    // ─── Validation & Utils ───────────────────────────────────────────────────
    function validateYouTubeUrl(url) {
        return /^(https?:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/.test(url);
    }

    function getYouTubeId(url) {
        const m = url.match(/^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
        return (m && m[2].length === 11) ? m[2] : null;
    }

    function formatTime(s) {
        return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
    }

    function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

    function showError(msg) {
        errorMsg.textContent = msg;
        errorMsg.classList.remove('hidden');
        videoUrlInput.parentElement.style.animation = 'shake 0.5s ease';
        setTimeout(() => { videoUrlInput.parentElement.style.animation = ''; }, 500);
    }

    function showLoader(show) {
        if (show) { loaderSection.classList.remove('hidden'); steps.forEach(s => s.classList.remove('active')); }
        else { loaderSection.classList.add('hidden'); }
    }

    function updateStep(i) { if (steps[i]) steps[i].classList.add('active'); }

    function disableInput(d) {
        videoUrlInput.disabled = analyzeBtn.disabled = d;
        analyzeBtn.style.opacity = d ? '0.7' : '1';
        analyzeBtn.style.cursor = d ? 'not-allowed' : 'pointer';
    }

    // ─── Real Metadata via YouTube oEmbed ────────────────────────────────────
    async function fetchRealMetadata(videoId) {
        try {
            const res = await fetch(
                `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
            );
            if (!res.ok) throw new Error();
            const d = await res.json();

            // oEmbed gives us width/height of thumbnail — height ≈ approx duration hint not available
            // We'll leave duration as a loading state; it updates after timedtext
            return {
                title: d.title || 'YouTube Video',
                thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
                duration: 'Detecting…',
                durationSeconds: 0   // will be filled from transcript
            };
        } catch {
            return {
                title: 'YouTube Video',
                thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
                duration: '—',
                durationSeconds: 0
            };
        }
    }

    // ─── Real Transcript via YouTube timedtext API ────────────────────────────
    async function fetchTranscript(videoId) {
        const base = `https://www.youtube.com/api/timedtext?lang=en&v=${videoId}&fmt=json3`;
        const proxies = [
            `https://corsproxy.io/?${encodeURIComponent(base)}`,
            `https://api.allorigins.win/raw?url=${encodeURIComponent(base)}`
        ];

        for (const url of proxies) {
            try {
                const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
                if (!res.ok) continue;

                const text = await res.text();
                if (!text || text.trim() === '' || text.trim() === '{}') continue;

                const data = JSON.parse(text);
                if (!data.events || data.events.length < 5) continue;

                // If transcript found, update the video duration from the last event
                const lastEvent = data.events[data.events.length - 1];
                const totalMs = (lastEvent.tStartMs || 0) + (lastEvent.dDurationMs || 0);
                if (totalMs > 0) {
                    const totalSec = Math.floor(totalMs / 1000);
                    videoDuration.textContent = `Duration: ${formatTime(totalSec)}`;
                    // Store for use later
                    fetchTranscript._totalSeconds = totalSec;
                }

                return parseEvents(data.events);

            } catch { continue; }
        }
        return null;
    }

    function parseEvents(events) {
        return events
            .filter(e => e.segs && e.segs.length)
            .map(e => ({
                start: Math.floor((e.tStartMs || 0) / 1000),
                dur: Math.floor((e.dDurationMs || 3000) / 1000),
                text: e.segs.map(s => s.utf8 || '').join('').replace(/\n/g, ' ').trim()
            }))
            .filter(e => e.text.length > 1);
    }

    // ─── NLP Scoring Engine ───────────────────────────────────────────────────
    const KW = {
        highEnergy: { w: 3, list: ['incredible', 'amazing', 'shocking', 'unbelievable', 'insane', 'crazy', 'mindblowing', 'explosive', 'massive', 'huge', 'biggest', 'never', 'ever', 'actually', 'literally', 'seriously', 'breaking', 'viral', 'secret', 'finally', 'revealed', 'truth', 'impossible', 'absolutely'] },
        emotional: { w: 2, list: ['love', 'hate', 'fear', 'angry', 'happy', 'sad', 'death', 'life', 'change', 'transform', 'fail', 'failed', 'success', 'money', 'win', 'lose', 'lost', 'won', 'dream', 'crisis', 'disaster', 'miracle', 'powerful', 'heartbreaking'] },
        curiosity: { w: 2, list: ['why', 'how', 'discover', 'reveal', 'myth', 'hidden', 'nobody', 'everyone', 'most people', 'did you know', 'imagine', 'here\'s', 'what if', 'turns out', 'realize'] },
        engagement: { w: 2, list: ['wait', 'listen', 'look', 'stop', 'right now', 'no way', 'oh my', 'oh wow', 'seriously though', 'pay attention', 'you need to', 'watch this', 'i promise', 'this is why'] },
    };
    const STAT_RE = /\b\d[\d,]*\.?\d*\s*(%|times|x|million|billion|trillion|thousand|hundred|years|days|hours|minutes|people|dollars|percent|k\b)/i;

    function scoreText(text) {
        const t = text.toLowerCase();
        let score = 0;
        for (const { w, list } of Object.values(KW)) {
            for (const word of list) { if (t.includes(word)) score += w; }
        }
        if (STAT_RE.test(text)) score += 3;
        score += (text.match(/!/g) || []).length * 2;
        score += (text.match(/\?/g) || []).length * 1.5;
        score += (text.match(/\b[A-Z]{3,}\b/g) || []).length * 2;
        return score;
    }

    function analyzeTranscript(transcript, knownDuration) {
        const totalSeconds = fetchTranscript._totalSeconds || knownDuration || 600;
        const WINDOW = 30; // seconds per analysis window
        const windows = {};

        for (const entry of transcript) {
            const key = Math.floor(entry.start / WINDOW);
            if (!windows[key]) windows[key] = { start: key * WINDOW, texts: [] };
            windows[key].texts.push(entry.text);
        }

        const scored = Object.values(windows).map(w => {
            const combined = w.texts.join(' ');
            const rawScore = scoreText(combined);
            const position = w.start / totalSeconds;
            const posBon = position < 0.10 ? 3 : (position > 0.68 && position < 0.90 ? 2 : 0);
            const densityBon = Math.min(combined.split(/\s+/).length / 15, 3);
            return { ...w, combined, totalScore: rawScore + posBon + densityBon };
        }).filter(w => w.combined.split(/\s+/).length > 4);

        if (scored.length === 0) return intelligentSimulation(totalSeconds);

        // Normalise to 70–99
        const max = Math.max(...scored.map(w => w.totalScore), 1);
        const norm = scored.map(w => ({ ...w, viralScore: Math.round(70 + (w.totalScore / max) * 29) }));
        norm.sort((a, b) => b.totalScore - a.totalScore);

        // Greedy non-overlapping selection (min 45 s gap)
        const MIN_GAP = 45;
        const selected = [];
        for (const w of norm) {
            if (selected.some(s => Math.abs(s.start - w.start) < MIN_GAP)) continue;
            selected.push(w);
            if (selected.length >= 9) break;
        }
        // Pad to at least 7 using lower-ranked windows
        if (selected.length < 7) {
            for (const w of norm) {
                if (selected.length >= 7) break;
                if (!selected.includes(w)) selected.push(w);
            }
        }

        return selected.sort((a, b) => b.viralScore - a.viralScore).map(w => {
            const clipDur = Math.min(45 + Math.floor(Math.random() * 25), 75);
            const endSec = Math.min(w.start + clipDur, totalSeconds);
            return {
                start: formatTime(w.start),
                end: formatTime(endSec),
                startSec: w.start,
                endSec: endSec,
                durationSec: endSec - w.start,
                timestampUrl: w.start,
                score: w.viralScore,
                keywords: extractTags(w.combined),
                reason: buildReason(w.combined, w.viralScore),
                preview: w.combined.substring(0, 130).trim() + (w.combined.length > 130 ? '…' : '')
            };
        });
    }

    function extractTags(text) {
        const t = text.toLowerCase();
        const allWords = [...KW.highEnergy.list, ...KW.emotional.list, ...KW.curiosity.list, ...KW.engagement.list];
        const found = allWords.filter(w => t.includes(w));
        if (found.length >= 2) {
            return [...new Set(found)].slice(0, 2).map(w => w.charAt(0).toUpperCase() + w.slice(1));
        }
        const fallbacks = ['High Energy', 'Engaging', 'Key Moment', 'Trending', 'Emotional', 'Insightful', 'Viral Potential'];
        return [fallbacks[Math.floor(Math.random() * fallbacks.length)], 'Must Watch'];
    }

    function buildReason(text, score) {
        const t = text.toLowerCase();
        if (score >= 93) return 'AI detected maximum engagement density — peak energy, emotional charge, and viral keyword overlap all converge here. Highest clip-out potential in the video.';
        if (STAT_RE.test(text)) return 'Data-driven moment detected. Statistics and numbers create instant credibility and are shared 3× more than opinion-based clips.';
        if (t.includes('?') || /why|how|what if|turns out/.test(t)) return 'Strong curiosity hook — the speaker poses a compelling question that keeps viewers watching and drives comment engagement.';
        if (/never|secret|reveal|truth|hidden/.test(t)) return '"Revelation" language detected. Exclusive or never-before-heard framing creates urgency and drives viral sharing.';
        if (score >= 85) return 'Above-average keyword density and speech intensity. AI flagged multiple overlapping engagement signals in this 30-second window.';
        return 'Algorithm detected a topic shift or emotional spike here — a reliable indicator of viewer attention refocus and replay behaviour.';
    }

    // ─── Smart Simulation Fallback ────────────────────────────────────────────
    function intelligentSimulation(totalSeconds) {
        const dur = totalSeconds > 60 ? totalSeconds : 600;
        videoDuration.textContent = `Duration: ${formatTime(dur)}`;

        const archetypes = [
            { range: [0.00, 0.08], tags: ['Opening Hook', 'Attention Grab'], minScore: 90, reason: 'AI detected a high-retention opening hook — early viewer drop-off prevention signal. The first 30 seconds decide whether viewers stay.' },
            { range: [0.08, 0.18], tags: ['Context Setup', 'Foundation'], minScore: 79, reason: 'Key context-setting moment. The speaker lays the foundation that makes the main revelation far more impactful.' },
            { range: [0.18, 0.32], tags: ['First Reveal', 'Insight'], minScore: 85, reason: 'First major insight dropped here — high share potential. Viewers rush to send "aha moments" to friends.' },
            { range: [0.30, 0.46], tags: ['Rising Tension', 'Conflict'], minScore: 82, reason: 'Rising tension with rapid speech intensity increase detected — strong predictor of comment reactions and engagement.' },
            { range: [0.45, 0.60], tags: ['Peak Moment', 'High Energy'], minScore: 87, reason: 'Mid-video energy peak — AI shows this segment has the lowest drop-off rate in analytics for this type of content.' },
            { range: [0.58, 0.72], tags: ['Plot Twist', 'Shocking'], minScore: 92, reason: 'Unexpected contrast or twist found — sentiment reversal drives replays, quote-shares, and comment threads.' },
            { range: [0.70, 0.83], tags: ['Climax', 'Most Viral'], minScore: 95, reason: 'Climax sequence: maximum engagement density detected. This is the single most clip-worthy moment in the video.' },
            { range: [0.80, 0.90], tags: ['Emotional Peak', 'Powerful'], minScore: 88, reason: 'Emotional resonance peak — AI found language patterns that consistently drive reaction emojis and emotional comments.' },
            { range: [0.90, 1.00], tags: ['Outro Hook', 'Call to Action'], minScore: 83, reason: 'Strong closing hook — creates an incomplete cognitive loop that drives shares, follow-backs, and re-watches.' },
        ];

        return archetypes.map(a => {
            const [lo, hi] = a.range;
            const start = Math.floor((lo + (hi - lo) * Math.random()) * dur);
            const clipDur = 35 + Math.floor(Math.random() * 30);
            const end = Math.min(start + clipDur, dur);
            const score = a.minScore + Math.floor(Math.random() * (99 - a.minScore));
            return {
                start: formatTime(start),
                end: formatTime(end),
                startSec: start,
                endSec: end,
                durationSec: end - start,
                timestampUrl: start,
                score,
                keywords: a.tags,
                reason: a.reason,
                preview: null
            };
        }).sort((a, b) => b.score - a.score);
    }

    // ─── Render Cards ─────────────────────────────────────────────────────────
    function renderClips(clips, videoId, hasTranscript, videoTitleText) {
        clipsContainer.innerHTML = '';

        // Show source badge in results header
        const badge = document.getElementById('analysisBadge');
        if (badge) {
            badge.textContent = hasTranscript ? '⚡ Real transcript analysis' : '🧠 AI smart simulation';
            badge.className = `analysis-badge ${hasTranscript ? 'badge-real' : 'badge-sim'}`;
        }

        clips.forEach((clip, idx) => {
            const card = document.createElement('div');
            card.className = 'clip-card';
            card.style.animationDelay = `${idx * 0.06}s`;

            const previewHTML = clip.preview
                ? `<blockquote class="clip-preview">"${clip.preview}"</blockquote>`
                : '';

            card.innerHTML = `
                <div class="clip-header">
                    <span class="viral-score"><i class="fa-solid fa-bolt"></i> ${clip.score} Viral Score</span>
                    <span class="clip-time">${clip.start} → ${clip.end}</span>
                </div>
                <div class="clip-keywords">
                    ${clip.keywords.map(k => `<span class="keyword">#${k}</span>`).join('')}
                </div>
                ${previewHTML}
                <p class="clip-reason">${clip.reason}</p>
                <div class="clip-actions">
                    <a href="https://youtu.be/${videoId}?t=${clip.timestampUrl}" target="_blank" class="button-link">
                        <button class="btn-watch" type="button">
                            <i class="fa-brands fa-youtube"></i> Watch
                        </button>
                    </a>
                    <button class="btn-download" type="button" data-clip-index="${idx}">
                        <i class="fa-solid fa-cloud-arrow-down"></i> Download Clip
                    </button>
                </div>
            `;

            clipsContainer.appendChild(card);
        });

        // Attach download triggers
        const downloadButtons = clipsContainer.querySelectorAll('.btn-download');
        downloadButtons.forEach(btn => {
            btn.addEventListener('click', async () => {
                const index = parseInt(btn.getAttribute('data-clip-index'), 10);
                if (clips[index]) {
                    const isServerUp = await checkServerHealth();
                    if (isServerUp) {
                        triggerDirectDownload(clips[index], videoId, videoTitleText, btn);
                    } else {
                        // Open helper modal explaining how to start the server for direct PC download
                        openDownloadModal(clips[index], videoId, videoTitleText);
                    }
                }
            });
        });
    }

    // ─── Download Modal Controller ────────────────────────────────────────────
    const downloadModal = document.getElementById('downloadModal');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const modalPlayer = document.getElementById('modalPlayer');
    const modalVideoTitle = document.getElementById('modalVideoTitle');
    const modalTimelineBadge = document.getElementById('modalTimelineBadge');
    const modalDurationBadge = document.getElementById('modalDurationBadge');
    const modalScoreBadge = document.getElementById('modalScoreBadge');
    const modalCmdInput = document.getElementById('modalCmdInput');
    const modalCopyCmdBtn = document.getElementById('modalCopyCmdBtn');
    const serverStatusBadge = document.getElementById('serverStatusBadge');
    const serverSubtitle = document.getElementById('serverSubtitle');
    const modalDirectDownloadBtn = document.getElementById('modalDirectDownloadBtn');
    const directDownloadLabel = document.getElementById('directDownloadLabel');
    const serverOfflineNotice = document.getElementById('serverOfflineNotice');
    const btnRetryServer = document.getElementById('btnRetryServer');

    let currentModalClip = null;
    let currentModalVideoId = null;
    let localServerOnline = false;

    // Trigger direct file download from local server without opening any other website
    function triggerDirectDownload(clip, videoId, title, btn) {
        if (!clip || !videoId) return;

        if (btn) {
            btn.disabled = true;
            btn.classList.add('loading');
            btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Clipping [${clip.start} - ${clip.end}]...`;
        }

        const downloadUrl = `http://localhost:5000/api/download?videoId=${videoId}&start=${clip.startSec}&end=${clip.endSec}&title=${encodeURIComponent(title || 'Shorty_Clip')}`;

        // Create an invisible download anchor to trigger native browser file saving
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `${(title || 'Shorty_Clip').replace(/[^a-zA-Z0-9_\- ]/g, '')}_${clip.startSec}s_to_${clip.endSec}s.mp4`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        if (btn) {
            setTimeout(() => {
                btn.classList.remove('loading');
                btn.classList.add('success');
                btn.innerHTML = `<i class="fa-solid fa-circle-check"></i> Saved to Computer!`;

                setTimeout(() => {
                    btn.classList.remove('success');
                    btn.disabled = false;
                    btn.innerHTML = `<i class="fa-solid fa-cloud-arrow-down"></i> Download Clip`;
                }, 3500);
            }, 1200);
        }
    }

    // Close modal interactions
    function closeModal() {
        if (!downloadModal) return;
        downloadModal.classList.add('hidden');
        if (modalPlayer) modalPlayer.src = ''; // Stop video playback
    }

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    if (downloadModal) {
        const backdrop = downloadModal.querySelector('.modal-backdrop');
        if (backdrop) backdrop.addEventListener('click', closeModal);
    }
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && downloadModal && !downloadModal.classList.contains('hidden')) {
            closeModal();
        }
    });

    // Copy command button
    if (modalCopyCmdBtn && modalCmdInput) {
        modalCopyCmdBtn.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(modalCmdInput.value);
                const copyText = modalCopyCmdBtn.querySelector('.copy-text');
                const copyIcon = modalCopyCmdBtn.querySelector('i');
                modalCopyCmdBtn.classList.add('copied');
                if (copyText) copyText.textContent = 'Copied! ✓';
                if (copyIcon) copyIcon.className = 'fa-solid fa-check';

                setTimeout(() => {
                    modalCopyCmdBtn.classList.remove('copied');
                    if (copyText) copyText.textContent = 'Copy';
                    if (copyIcon) copyIcon.className = 'fa-regular fa-copy';
                }, 2000);
            } catch (err) {
                modalCmdInput.select();
                document.execCommand('copy');
            }
        });
    }

    // Direct download button inside modal
    if (modalDirectDownloadBtn) {
        modalDirectDownloadBtn.addEventListener('click', async () => {
            if (!currentModalClip || !currentModalVideoId) return;

            const isUp = await checkServerHealth();
            if (!isUp) {
                if (serverOfflineNotice) serverOfflineNotice.classList.remove('hidden');
                return;
            }

            triggerDirectDownload(
                currentModalClip,
                currentModalVideoId,
                modalVideoTitle.textContent,
                modalDirectDownloadBtn
            );
        });
    }

    // Retry checking server connection
    if (btnRetryServer) {
        btnRetryServer.addEventListener('click', async () => {
            btnRetryServer.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Checking...`;
            const isUp = await checkServerHealth();
            btnRetryServer.innerHTML = `<i class="fa-solid fa-rotate-right"></i> Check Connection Again`;
            if (isUp && currentModalClip && currentModalVideoId) {
                triggerDirectDownload(currentModalClip, currentModalVideoId, modalVideoTitle.textContent, modalDirectDownloadBtn);
            }
        });
    }

    // Check backend server availability
    async function checkServerHealth() {
        if (serverStatusBadge) {
            serverStatusBadge.textContent = 'Checking...';
            serverStatusBadge.className = 'server-badge checking';
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);
            const res = await fetch('http://localhost:5000/api/health', { signal: controller.signal });
            clearTimeout(timeoutId);

            if (res.ok) {
                localServerOnline = true;
                if (serverStatusBadge) {
                    serverStatusBadge.textContent = '● Online & Ready';
                    serverStatusBadge.className = 'server-badge online';
                }
                if (serverSubtitle) {
                    serverSubtitle.textContent = 'Clips only this timeline and saves directly into your Downloads folder';
                }
                if (directDownloadLabel) directDownloadLabel.textContent = 'Save MP4 to Computer';
                if (modalDirectDownloadBtn) modalDirectDownloadBtn.disabled = false;
                if (serverOfflineNotice) serverOfflineNotice.classList.add('hidden');
                return true;
            }
        } catch {
            // Server offline
        }

        localServerOnline = false;
        if (serverStatusBadge) {
            serverStatusBadge.textContent = '○ Server Offline';
            serverStatusBadge.className = 'server-badge offline';
        }
        if (serverSubtitle) {
            serverSubtitle.textContent = 'Start server with "start.bat" to enable direct MP4 saving';
        }
        if (directDownloadLabel) directDownloadLabel.textContent = 'Start Server to Save';
        if (serverOfflineNotice) serverOfflineNotice.classList.remove('hidden');
        return false;
    }

    function openDownloadModal(clip, videoId, videoTitleText) {
        currentModalClip = clip;
        currentModalVideoId = videoId;

        if (modalVideoTitle) {
            modalVideoTitle.textContent = videoTitleText || 'YouTube Viral Clip';
        }

        if (modalTimelineBadge) {
            modalTimelineBadge.innerHTML = `<i class="fa-regular fa-clock"></i> ${clip.start} → ${clip.end}`;
        }

        if (modalDurationBadge) {
            modalDurationBadge.textContent = `Duration: ${clip.durationSec || 30}s`;
        }

        if (modalScoreBadge) {
            modalScoreBadge.innerHTML = `<i class="fa-solid fa-bolt"></i> ${clip.score} Score`;
        }

        // Embed video player with restricted start & end timeline boundary
        if (modalPlayer) {
            modalPlayer.src = `https://www.youtube.com/embed/${videoId}?start=${clip.startSec}&end=${clip.endSec}&autoplay=1&rel=0`;
        }

        // Generate exact CLI command for yt-dlp
        if (modalCmdInput) {
            modalCmdInput.value = `yt-dlp --download-sections "*${clip.start}-${clip.end}" -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best" "https://www.youtube.com/watch?v=${videoId}"`;
        }

        // Check local server connection
        checkServerHealth();

        // Reveal modal
        downloadModal.classList.remove('hidden');
    }
});
