export interface SkillCategory {
  category: string;
  skills: string[];
}

export interface FileNode {
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
}

export interface DiagramNode {
  id: string;
  label: string;
  type: 'source' | 'process' | 'database' | 'output' | 'parallel_group';
  subnodes?: string[]; // for detail lists
}

export interface ProjectData {
  title: string;
  slug: string;
  tagline: string;
  description: string[];
  stack: string[];
  featured: boolean;
  githubUrl?: string;
  overview: string;
  features: string[];
  diagramNodes: DiagramNode[];
  gitRepo: FileNode;
}

export interface Certification {
  title: string;
  issuer: string;
  date: string;
  details?: string;
}

export interface Achievement {
  title: string;
  description: string;
  date: string;
}

export interface Education {
  degree: string;
  institution: string;
  period: string;
  score: string;
}
