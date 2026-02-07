import { useState, useCallback } from "react";
import type { Presentation, Slide, PresentationConfig, Resource, Project } from "@/lib/types";

const generateId = () => Math.random().toString(36).substr(2, 9);

export function usePresentation() {
  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const createPresentation = useCallback((title: string, config: PresentationConfig) => {
    const newPresentation: Presentation = {
      id: generateId(),
      title,
      createdAt: new Date(),
      updatedAt: new Date(),
      slides: [],
      config,
      status: "draft",
    };
    setPresentation(newPresentation);
    return newPresentation;
  }, []);

  const addSlide = useCallback((slide: Omit<Slide, "id" | "order">) => {
    setPresentation((prev) => {
      if (!prev) return prev;
      const newSlide: Slide = {
        ...slide,
        id: generateId(),
        order: prev.slides.length,
      };
      return {
        ...prev,
        slides: [...prev.slides, newSlide],
        updatedAt: new Date(),
      };
    });
  }, []);

  const updateSlide = useCallback((slideId: string, updates: Partial<Slide>) => {
    setPresentation((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        slides: prev.slides.map((s) =>
          s.id === slideId ? { ...s, ...updates } : s
        ),
        updatedAt: new Date(),
      };
    });
  }, []);

  const removeSlide = useCallback((slideId: string) => {
    setPresentation((prev) => {
      if (!prev) return prev;
      const filtered = prev.slides.filter((s) => s.id !== slideId);
      return {
        ...prev,
        slides: filtered.map((s, i) => ({ ...s, order: i })),
        updatedAt: new Date(),
      };
    });
  }, []);

  const reorderSlides = useCallback((startIndex: number, endIndex: number) => {
    setPresentation((prev) => {
      if (!prev) return prev;
      const slides = [...prev.slides];
      const [removed] = slides.splice(startIndex, 1);
      slides.splice(endIndex, 0, removed);
      return {
        ...prev,
        slides: slides.map((s, i) => ({ ...s, order: i })),
        updatedAt: new Date(),
      };
    });
  }, []);

  return {
    presentation,
    setPresentation,
    isGenerating,
    setIsGenerating,
    createPresentation,
    addSlide,
    updateSlide,
    removeSlide,
    reorderSlides,
  };
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: "1",
      title: "Q4 Business Review",
      description: "Quarterly performance analysis and future projections",
      createdAt: new Date(Date.now() - 86400000 * 2),
      updatedAt: new Date(Date.now() - 86400000),
      status: "ready",
      slideCount: 18,
    },
    {
      id: "2",
      title: "Machine Learning Basics",
      description: "Introduction to ML concepts for beginners",
      createdAt: new Date(Date.now() - 86400000 * 5),
      updatedAt: new Date(Date.now() - 86400000 * 3),
      status: "ready",
      slideCount: 24,
    },
    {
      id: "3",
      title: "Startup Pitch Deck",
      description: "Investor presentation for seed funding",
      createdAt: new Date(Date.now() - 86400000 * 7),
      updatedAt: new Date(Date.now() - 86400000 * 7),
      status: "draft",
      slideCount: 12,
    },
  ]);

  const addProject = useCallback((project: Omit<Project, "id" | "createdAt" | "updatedAt">) => {
    const newProject: Project = {
      ...project,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setProjects((prev) => [newProject, ...prev]);
    return newProject;
  }, []);

  const deleteProject = useCallback((projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
  }, []);

  return { projects, addProject, deleteProject };
}

export function useResources() {
  const [resources, setResources] = useState<Resource[]>([]);

  const addResource = useCallback((resource: Omit<Resource, "id">) => {
    const newResource: Resource = {
      ...resource,
      id: generateId(),
    };
    setResources((prev) => [...prev, newResource]);
    return newResource;
  }, []);

  const removeResource = useCallback((resourceId: string) => {
    setResources((prev) => prev.filter((r) => r.id !== resourceId));
  }, []);

  const clearResources = useCallback(() => {
    setResources([]);
  }, []);

  return { resources, addResource, removeResource, clearResources };
}
