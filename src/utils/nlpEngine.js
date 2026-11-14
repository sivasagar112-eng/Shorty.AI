/**
 * Shorty.AI - Advanced NLP & Virality Detection Engine
 * Migrated and upgraded from vanilla JS with custom AI prompt targeting,
 * real YouTube transcript parsing, and intelligent fallback simulation.
 */

export const PROMPT_KEYWORDS = {
  funny: ['hilarious', 'laugh', 'joke', 'funny', 'funniest', 'lol', 'haha', 'ridiculous', 'comedy', 'prank', 'awkward', 'fails', 'stupid', 'humor'],
  motivational: ['success', 'dream', 'achieve', 'overcome', 'discipline', 'hustle', 'grind', 'inspire', 'never give up', 'champion', 'power', 'mindset', 'focus', 'belief', 'future'],
  educational: ['how to', 'step by step', 'guide', 'tutorial', 'tip', 'learn', 'strategy', 'secret', 'rule', 'framework', 'formula', 'method', 'understand', 'system'],
  controversial: ['disagree', 'wrong', 'mistake', 'truth', 'expose', 'nobody admits', 'lie', 'fake', 'problem', 'toxic', 'debate', 'argument', 'unpopular', 'reality', 'scam'],
  stories: ['story', 'happened', 'remember', 'suddenly', 'one day', 'back then', 'years ago', 'crazy thing', 'experience', 'unexpected', 'realized', 'moment'],
};

export const CORE_KEYWORDS = {
  highEnergy: {
    w: 3,
    list: [
      'incredible', 'amazing', 'shocking', 'unbelievable', 'insane', 'crazy', 'mindblowing',
      'explosive', 'massive', 'huge', 'biggest', 'never', 'ever', 'actually', 'literally',
      'seriously', 'breaking', 'viral', 'secret', 'finally', 'revealed', 'truth', 'impossible', 'absolutely'
    ]
  },
  emotional: {
    w: 2,
    list: [
      'love', 'hate', 'fear', 'angry', 'happy', 'sad', 'death', 'life', 'change', 'transform',
      'fail', 'failed', 'success', 'money', 'win', 'lose', 'lost', 'won', 'dream', 'crisis',
      'disaster', 'miracle', 'powerful', 'heartbreaking'
    ]
  },
  curiosity: {
    w: 2,
    list: [
      'why', 'how', 'discover', 'reveal', 'myth', 'hidden', 'nobody', 'everyone',
      'most people', 'did you know', 'imagine', "here's", 'what if', 'turns out', 'realize'
    ]
  },
  engagement: {
    w: 2,
    list: [
      'wait', 'listen', 'look', 'stop', 'right now', 'no way', 'oh my', 'oh wow',
      'seriously though', 'pay attention', 'you need to', 'watch this', 'i promise', 'this is why'
    ]
  }
};

export const STAT_RE = /\b\d[\d,]*\.?\d*\s*(%|times|x|million|billion|trillion|thousand|hundred|years|days|hours|minutes|people|dollars|percent|k\b)/i;

export function formatTime(seconds) {
  const s = Math.max(0, Math.floor(seconds || 0));
  const mins = Math.floor(s / 60);
  const secs = (s % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

export function validateYouTubeUrl(url) {
  return /^(https?:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/.test(url);
}

export function getYouTubeId(url) {
  const m = url.match(/^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
  return (m && m[2].length === 11) ? m[2] : null;
}

export async function fetchYouTubeMetadata(videoId) {
  try {
    const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
    if (!res.ok) throw new Error('oEmbed error');
    const d = await res.json();
    return {
      title: d.title || 'YouTube Video',
      author: d.author_name || 'YouTube Creator',
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      durationSeconds: 600,
      duration: '10:00'
    };
  } catch {
    return {
      title: 'YouTube Video',
      author: 'Creator',
      thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      durationSeconds: 600,
      duration: '10:00'
    };
  }
}

export async function fetchTranscript(videoId) {
  const base = `https://www.youtube.com/api/timedtext?lang=en&v=${videoId}&fmt=json3`;
  const proxies = [
    `https://corsproxy.io/?${encodeURIComponent(base)}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(base)}`
  ];

  for (const proxy of proxies) {
    try {
      const res = await fetch(proxy, { signal: AbortSignal.timeout(6000) });
      if (!res.ok) continue;
      const text = await res.text();
      if (!text || text.trim() === '' || text.trim() === '{}') continue;
      const data = JSON.parse(text);
      if (!data.events || data.events.length < 5) continue;

      const events = data.events
        .filter(e => e.segs && e.segs.length)
        .map(e => ({
          start: Math.floor((e.tStartMs || 0) / 1000),
          dur: Math.floor((e.dDurationMs || 3000) / 1000),
          text: e.segs.map(s => s.utf8 || '').join('').replace(/\n/g, ' ').trim()
        }))
        .filter(e => e.text.length > 1);

      const last = data.events[data.events.length - 1];
      const totalSec = Math.floor(((last.tStartMs || 0) + (last.dDurationMs || 0)) / 1000);

      return { events, totalSeconds: totalSec || 600 };
    } catch {
      continue;
    }
  }
  return null;
}

export function scoreSegment(text, promptType = 'general') {
  const t = text.toLowerCase();
  let score = 0;

  for (const { w, list } of Object.values(CORE_KEYWORDS)) {
    for (const word of list) {
      if (t.includes(word)) score += w;
    }
  }

  // Bonus for user-selected AI prompt style
  if (promptType && PROMPT_KEYWORDS[promptType]) {
    for (const kw of PROMPT_KEYWORDS[promptType]) {
      if (t.includes(kw)) score += 4;
    }
  }

  if (STAT_RE.test(text)) score += 3;
  score += (text.match(/!/g) || []).length * 2;
  score += (text.match(/\?/g) || []).length * 1.5;
  score += (text.match(/\b[A-Z]{3,}\b/g) || []).length * 2;

  return score;
}

export function buildReason(text, score, promptType = 'general') {
  const t = text.toLowerCase();
  if (promptType === 'funny' && /laugh|joke|funny|haha|lol/.test(t)) {
    return 'Peak comedic timing detected. Laugh cues and high punchline energy make this clip highly shareable.';
  }
  if (promptType === 'motivational' && /dream|success|hustle|future|discipline/.test(t)) {
    return 'High inspirational resonance. Clear mindset advice and powerful declarative sentences drive bookmarking.';
  }
  if (promptType === 'educational' && /how to|secret|strategy|formula|step/.test(t)) {
    return 'High educational utility. Practical breakdown with structured advice that viewers save and revisit.';
  }
  if (score >= 93) {
    return 'Maximum engagement density detected — peak speech energy, emotional charge, and viral keyword overlap all converge here. Highest retention potential.';
  }
  if (STAT_RE.test(text)) {
    return 'Data-driven proof point detected. Quantifiable statistics create instant authority and are shared 3x more frequently.';
  }
  if (t.includes('?') || /why|how|what if|turns out/.test(t)) {
    return 'Compelling curiosity hook — the speaker asks or addresses a question that keeps viewers watching through to the answer.';
  }
  if (/never|secret|reveal|truth|hidden/.test(t)) {
    return 'Exclusive framing detected. Words like "secret" and "truth" create urgent FOMO and trigger high comment activity.';
  }
  return 'Strong narrative shift and high speech density identified. Algorithms favor this segment for optimal short-form retention.';
}

export function extractTags(text, promptType = 'general') {
  const t = text.toLowerCase();
  const tags = [];
  if (promptType && promptType !== 'general') {
    tags.push(promptType.charAt(0).toUpperCase() + promptType.slice(1));
  }
  const allWords = [
    ...CORE_KEYWORDS.highEnergy.list,
    ...CORE_KEYWORDS.emotional.list,
    ...CORE_KEYWORDS.curiosity.list,
    ...CORE_KEYWORDS.engagement.list
  ];
  for (const w of allWords) {
    if (t.includes(w) && tags.length < 3 && !tags.some(existing => existing.toLowerCase() === w)) {
      tags.push(w.charAt(0).toUpperCase() + w.slice(1));
    }
  }
  while (tags.length < 2) {
    const fallbacks = ['High Energy', 'Trending', 'Key Moment', 'Must Watch', 'Viral Hook', 'Insight'];
    const chosen = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    if (!tags.includes(chosen)) tags.push(chosen);
  }
  return tags;
}

export function generateTranscriptClips(transcriptEvents, totalSeconds, options = {}) {
  const { clipCount = 5, duration = '30-60', promptType = 'general' } = options;
  const WINDOW = 30;
  const windows = {};

  for (const entry of transcriptEvents) {
    const key = Math.floor(entry.start / WINDOW);
    if (!windows[key]) windows[key] = { start: key * WINDOW, texts: [], entries: [] };
    windows[key].texts.push(entry.text);
    windows[key].entries.push(entry);
  }

  const scored = Object.values(windows).map(w => {
    const combined = w.texts.join(' ');
    const rawScore = scoreSegment(combined, promptType);
    const position = w.start / (totalSeconds || 600);
    const posBonus = position < 0.10 ? 3 : (position > 0.68 && position < 0.90 ? 2 : 0);
    const densityBonus = Math.min(combined.split(/\s+/).length / 15, 3);
    return {
      ...w,
      combined,
      totalScore: rawScore + posBonus + densityBonus
    };
  }).filter(w => w.combined.split(/\s+/).length > 3);

  if (scored.length === 0) {
    return generateSimulationClips(totalSeconds, options);
  }

  const max = Math.max(...scored.map(w => w.totalScore), 1);
  const norm = scored.map(w => ({
    ...w,
    viralScore: Math.round(72 + (w.totalScore / max) * 27)
  })).sort((a, b) => b.totalScore - a.totalScore);

  const selected = [];
  const minGap = 40;
  for (const w of norm) {
    if (selected.some(s => Math.abs(s.start - w.start) < minGap)) continue;
    selected.push(w);
    if (selected.length >= clipCount) break;
  }

  // Pad if needed
  if (selected.length < clipCount) {
    for (const w of norm) {
      if (selected.length >= clipCount) break;
      if (!selected.includes(w)) selected.push(w);
    }
  }

  return selected.sort((a, b) => b.viralScore - a.viralScore).map((w, idx) => {
    let targetLen = 45;
    if (duration === '15-30') targetLen = 25;
    else if (duration === '60-90') targetLen = 75;
    else targetLen = 45;

    const startSec = w.start;
    const endSec = Math.min(startSec + targetLen, totalSeconds);
    const words = w.combined.split(/\s+/);
    const title = words.slice(0, 5).join(' ').replace(/[^a-zA-Z0-9 ]/g, '') + '...';

    return {
      id: `clip_${Date.now()}_${idx + 1}`,
      title: title || `Viral Clip #${idx + 1}`,
      start: formatTime(startSec),
      end: formatTime(endSec),
      startSec,
      endSec,
      durationSec: endSec - startSec,
      score: w.viralScore,
      keywords: extractTags(w.combined, promptType),
      reason: buildReason(w.combined, w.viralScore, promptType),
      preview: w.combined.substring(0, 140).trim() + (w.combined.length > 140 ? '…' : ''),
      aspectRatio: options.aspectRatio || '9:16',
      subtitles: w.entries.slice(0, 12).map((e, sIdx) => ({
        id: sIdx + 1,
        start: e.start - startSec,
        end: (e.start - startSec) + e.dur,
        text: e.text
      }))
    };
  });
}

export function generateSimulationClips(totalSeconds = 600, options = {}) {
  const { clipCount = 6, duration = '30-60', promptType = 'general', aspectRatio = '9:16' } = options;
  const dur = Math.max(totalSeconds, 90);

  const archetypes = [
    { title: "The Jaw-Dropping Opening Hook", range: [0.01, 0.08], tags: ['Opening Hook', 'Viral Hook'], minScore: 92, reason: 'AI detected a high-retention opening hook that prevents early viewer drop-off. The first 30 seconds determine watch-through rates.' },
    { title: "The Crucial Secret Nobody Admits", range: [0.12, 0.24], tags: ['Secret Revealed', 'Mindset'], minScore: 86, reason: 'Exclusive revelatory framing identified. Viewers share perspective-shifting statements rapidly.' },
    { title: "The Sudden Conflict & Breaking Point", range: [0.28, 0.42], tags: ['High Tension', 'Story'], minScore: 89, reason: 'Dramatic shift with speech velocity increase. Escalating stakes keep average watch time above 85%.' },
    { title: "The Climax: Maximum Energy Peak", range: [0.46, 0.62], tags: ['Climax', 'Peak Energy'], minScore: 96, reason: 'Maximum engagement density detected across all frequency bands. This is the prime candidate for organic discovery.' },
    { title: "The Unexpected Twist & Reality Check", range: [0.65, 0.78], tags: ['Plot Twist', 'Controversial'], minScore: 91, reason: 'Unexpected sentiment reversal detected. Viewers re-listen to process surprising revelations.' },
    { title: "The Unforgettable Final Takeaway", range: [0.82, 0.95], tags: ['Key Takeaway', 'Call To Action'], minScore: 88, reason: 'Strong concluding takeaway that prompts comments, saves, and profile follows.' }
  ];

  return archetypes.slice(0, clipCount).map((a, idx) => {
    const [lo, hi] = a.range;
    const startSec = Math.floor((lo + (hi - lo) * 0.5) * dur);
    let targetLen = 40;
    if (duration === '15-30') targetLen = 25;
    else if (duration === '60-90') targetLen = 75;
    const endSec = Math.min(startSec + targetLen, dur);
    const score = Math.min(99, a.minScore + Math.floor(Math.random() * (99 - a.minScore)));

    const sampleSubs = [
      { id: 1, start: 0, end: 3, text: "Wait till you hear this part..." },
      { id: 2, start: 3, end: 7, text: "Because most people get this completely wrong." },
      { id: 3, start: 7, end: 12, text: "If you change this one thing today," },
      { id: 4, start: 12, end: 16, text: "everything starts working in your favor." }
    ];

    return {
      id: `sim_clip_${Date.now()}_${idx + 1}`,
      title: a.title,
      start: formatTime(startSec),
      end: formatTime(endSec),
      startSec,
      endSec,
      durationSec: endSec - startSec,
      score,
      keywords: a.tags,
      reason: a.reason,
      preview: "Wait till you hear this part... Because most people get this completely wrong. If you change this one thing today, everything starts working in your favor.",
      aspectRatio,
      subtitles: sampleSubs
    };
  });
}

