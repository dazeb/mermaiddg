export interface DiagramNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  code: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  isGuest: boolean;
  color: string;
  cursor?: { x: number; y: number };
  lastSeen: string;
}

export interface Workspace {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface ViewportState {
  x: number;
  y: number;
  zoom: number;
}

export interface Tool {
  id: string;
  name: string;
  icon: string;
  shortcut?: string;
}