/**
 * Shorty.AI - Unified API Service
 * Connects frontend to local Flask companion server (yt-dlp, ffmpeg, downloads)
 */

const API_BASE = 'http://localhost:5000';

export async function checkServerStatus() {
  try {
    const res = await fetch(`${API_BASE}/api/health`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return { online: false };
    const data = await res.json();
    return {
      online: true,
      ffmpeg: data.ffmpeg,
      yt_dlp: data.yt_dlp,
      ffmpegPath: data.ffmpeg_path,
      message: data.message,
    };
  } catch {
    return { online: false };
  }
}

export async function openDownloadsFolder() {
  try {
    const res = await fetch(`${API_BASE}/api/open-downloads`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Failed to open downloads folder:', err);
    throw err;
  }
}

export function getDownloadUrl({ videoId, startSec, endSec, title, quality = '1080', aspectRatio = '9:16', fitMode = 'crop' }) {
  const cleanTitle = encodeURIComponent(title || 'Shorty_Clip');
  return `${API_BASE}/api/download?videoId=${videoId}&start=${startSec}&end=${endSec}&title=${cleanTitle}&quality=${quality}&aspectRatio=${aspectRatio}&fitMode=${fitMode}`;
}

export async function uploadVideoFile(file, onProgress) {
  const formData = new FormData();
  formData.append('video', file);

  const res = await fetch(`${API_BASE}/api/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(err.error || 'Upload failed');
  }

  return await res.json();
}

export async function fetchProjects() {
  try {
    const res = await fetch(`${API_BASE}/api/projects`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function saveProject(project) {
  try {
    const res = await fetch(`${API_BASE}/api/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project),
    });
    return await res.json();
  } catch (err) {
    console.warn('Backend project persistence offline, saving locally:', err);
    return project;
  }
}

export async function deleteProjectBackend(projectId) {
  try {
    await fetch(`${API_BASE}/api/projects/${projectId}`, { method: 'DELETE' });
  } catch (err) {
    console.warn('Backend delete offline:', err);
  }
}

