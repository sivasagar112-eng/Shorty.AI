import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  fetchYouTubeMetadata,
  fetchTranscript,
  generateTranscriptClips,
  generateSimulationClips,
  getYouTubeId,
  validateYouTubeUrl,
} from '../utils/nlpEngine';
import { checkServerStatus, saveProject, fetchProjects } from '../services/apiService';

const ProjectContext = createContext(null);

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState(() => {
    try {
      const saved = localStorage.getItem('shorty_projects');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'proj_demo_1',
        title: 'Building the Future of Autonomous Systems',
        type: 'youtube',
        videoId: 'sbjTmG6hsnw',
        sourceUrl: 'https://www.youtube.com/watch?v=sbjTmG6hsnw',
        thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
        duration: '11:24',
        createdAt: '2026-11-12T10:30:00Z',
        clipsCount: 5,
        clips: [
          {
            id: 'clip_demo_1',
            title: 'The Core Autonomous Loop Explained',
            start: '01:15',
            end: '01:58',
            startSec: 75,
            endSec: 118,
            durationSec: 43,
            score: 96,
            keywords: ['High Energy', 'Key Moment', 'Must Watch'],
            reason: 'Peak engagement density detected. The speaker drops key architectural frameworks with clear declarative cadence.',
            preview: 'When you eliminate latency between perception and decision, the entire paradigm shifts completely.',
            aspectRatio: '9:16',
            subtitles: [
              { id: 1, start: 0, end: 4, text: 'When you eliminate latency' },
              { id: 2, start: 4, end: 8, text: 'between perception and decision,' },
              { id: 3, start: 8, end: 12, text: 'the entire paradigm shifts completely.' },
            ],
          },
          {
            id: 'clip_demo_2',
            title: 'Why Most Implementations Fail',
            start: '03:40',
            end: '04:22',
            startSec: 220,
            endSec: 262,
            durationSec: 42,
            score: 92,
            keywords: ['Controversial', 'Reality Check'],
            reason: 'Contrarian statement supported by concrete operational data. High share rate among engineers.',
            preview: 'Everyone optimizes the model weights, but 90% of failures happen in the I/O pipeline.',
            aspectRatio: '9:16',
            subtitles: [
              { id: 1, start: 0, end: 3, text: 'Everyone optimizes the weights,' },
              { id: 2, start: 3, end: 7, text: 'but 90% of real failures' },
              { id: 3, start: 7, end: 11, text: 'happen in the I/O pipeline.' },
            ],
          },
        ],
      },
    ];
  });

  const [currentProject, setCurrentProject] = useState(projects[0] || null);
  const [activeClip, setActiveClip] = useState(projects[0]?.clips?.[0] || null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [serverStatus, setServerStatus] = useState({ online: false, checking: true });

  // Sync projects to localStorage
  useEffect(() => {
    localStorage.setItem('shorty_projects', JSON.stringify(projects));
  }, [projects]);

  // Periodic server health check
  useEffect(() => {
    const verifyServer = async () => {
      const status = await checkServerStatus();
      setServerStatus({ ...status, checking: false });
    };
    verifyServer();
    const interval = setInterval(verifyServer, 10000);
    return () => clearInterval(interval);
  }, []);

  const createProjectFromYouTube = async (url, options = {}) => {
    if (!validateYouTubeUrl(url)) {
      throw new Error('Please enter a valid YouTube video URL');
    }

    const videoId = getYouTubeId(url);
    if (!videoId) throw new Error('Could not parse YouTube video ID');

    setIsAnalyzing(true);
    setAnalysisStep(0); // 0: Metadata

    try {
      // Step 1: Fetch metadata
      const metadata = await fetchYouTubeMetadata(videoId);
      setAnalysisStep(1); // 1: Transcript

      // Step 2: Fetch transcript
      const transcriptData = await fetchTranscript(videoId);
      setAnalysisStep(2); // 2: AI analysis

      await new Promise(r => setTimeout(r, 600));

      let generatedClips = [];
      if (transcriptData && transcriptData.events?.length > 5) {
        generatedClips = generateTranscriptClips(transcriptData.events, transcriptData.totalSeconds, options);
      } else {
        generatedClips = generateSimulationClips(metadata.durationSeconds || 600, options);
      }

      setAnalysisStep(3); // 3: Reframing & Subtitles

      const newProj = {
        id: `proj_${Date.now()}`,
        title: metadata.title,
        type: 'youtube',
        videoId,
        sourceUrl: url,
        thumbnail: metadata.thumbnail,
        duration: metadata.duration || '10:00',
        createdAt: new Date().toISOString(),
        clipsCount: generatedClips.length,
        clips: generatedClips,
        settings: options,
      };

      setProjects(prev => [newProj, ...prev]);
      setCurrentProject(newProj);
      setActiveClip(generatedClips[0] || null);

      // Save to backend if available
      saveProject(newProj);

      return newProj;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const createProjectFromFile = async (file, options = {}) => {
    setIsAnalyzing(true);
    setAnalysisStep(0);

    try {
      // Create local object URL for preview
      const previewUrl = URL.createObjectURL(file);
      setAnalysisStep(1);
      await new Promise(r => setTimeout(r, 500));
      setAnalysisStep(2);

      const generatedClips = generateSimulationClips(300, options);
      setAnalysisStep(3);

      const newProj = {
        id: `proj_${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ""),
        type: 'upload',
        fileName: file.name,
        fileSize: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
        videoUrl: previewUrl,
        thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&auto=format&fit=crop&q=80',
        duration: '05:00',
        createdAt: new Date().toISOString(),
        clipsCount: generatedClips.length,
        clips: generatedClips,
        settings: options,
      };

      setProjects(prev => [newProj, ...prev]);
      setCurrentProject(newProj);
      setActiveClip(generatedClips[0] || null);

      return newProj;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const deleteProject = (projectId) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    if (currentProject?.id === projectId) {
      setCurrentProject(projects.find(p => p.id !== projectId) || null);
    }
  };

  const updateClipInProject = (clipId, updates) => {
    if (!currentProject) return;
    const updatedClips = currentProject.clips.map(c => c.id === clipId ? { ...c, ...updates } : c);
    const updatedProject = { ...currentProject, clips: updatedClips };

    setCurrentProject(updatedProject);
    setProjects(prev => prev.map(p => p.id === currentProject.id ? updatedProject : p));
    if (activeClip?.id === clipId) {
      setActiveClip(prev => ({ ...prev, ...updates }));
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        currentProject,
        setCurrentProject,
        activeClip,
        setActiveClip,
        isAnalyzing,
        analysisStep,
        serverStatus,
        createProjectFromYouTube,
        createProjectFromFile,
        deleteProject,
        updateClipInProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  return useContext(ProjectContext);
}

