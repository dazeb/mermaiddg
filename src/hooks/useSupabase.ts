import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { DiagramNode, User } from '../types';
import { v4 as uuidv4 } from 'uuid';

export function useSupabase(workspaceId: string) {
  const [nodes, setNodes] = useState<DiagramNode[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  useEffect(() => {
    if (!workspaceId) return;

    // Check if we're using placeholder Supabase values
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
      setIsOfflineMode(true);
    }

    // Initialize current user
    const userId = localStorage.getItem('userId') || generateUserId();
    localStorage.setItem('userId', userId);
    
    const user: User = {
      id: userId,
      name: `User ${userId.slice(0, 8)}`,
      color: generateUserColor(),
      lastSeen: new Date().toISOString(),
    };
    
    setCurrentUser(user);
    setUsers([user]); // In offline mode, only show current user

    // Load nodes from localStorage in offline mode
    if (isOfflineMode) {
      const savedNodes = localStorage.getItem(`nodes_${workspaceId}`);
      if (savedNodes) {
        try {
          setNodes(JSON.parse(savedNodes));
        } catch (error) {
          console.error('Error loading saved nodes:', error);
        }
      }
    } else {
      // Subscribe to nodes changes only if not in offline mode
      const nodesChannel = supabase
        .channel(`nodes:${workspaceId}`)
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'diagram_nodes', filter: `workspace_id=eq.${workspaceId}` },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setNodes(prev => [...prev, payload.new as DiagramNode]);
            } else if (payload.eventType === 'UPDATE') {
              setNodes(prev => prev.map(node => 
                node.id === payload.new.id ? payload.new as DiagramNode : node
              ));
            } else if (payload.eventType === 'DELETE') {
              setNodes(prev => prev.filter(node => node.id !== payload.old.id));
            }
          }
        )
        .subscribe();

      // Subscribe to user presence
      const presenceChannel = supabase
        .channel(`presence:${workspaceId}`)
        .on('presence', { event: 'sync' }, () => {
          const state = presenceChannel.presenceState();
          const activeUsers = Object.values(state).flat() as User[];
          setUsers(activeUsers);
        })
        .subscribe();

      // Track user presence
      presenceChannel.track(user);

      return () => {
        supabase.removeChannel(nodesChannel);
        supabase.removeChannel(presenceChannel);
      };
    }
  }, [workspaceId]);

  // Save nodes to localStorage in offline mode
  useEffect(() => {
    if (isOfflineMode && nodes.length > 0) {
      localStorage.setItem(`nodes_${workspaceId}`, JSON.stringify(nodes));
    }
  }, [nodes, workspaceId, isOfflineMode]);

  const addNode = async (node: Omit<DiagramNode, 'id'>) => {
    if (!currentUser) return;
    
    const newNode = { ...node, id: uuidv4() };
    
    if (isOfflineMode) {
      // Add node locally
      setNodes(prev => [...prev, newNode]);
    } else {
      try {
        const { error } = await supabase
          .from('diagram_nodes')
          .insert([{ ...newNode, workspace_id: workspaceId }]);
        
        if (error) console.error('Error adding node:', error);
      } catch (error) {
        console.error('Error adding node:', error);
        // Fallback to local storage if Supabase fails
        setNodes(prev => [...prev, newNode]);
      }
    }
  };

  const updateNode = async (id: string, updates: Partial<DiagramNode>) => {
    if (isOfflineMode) {
      // Update node locally
      setNodes(prev => prev.map(node => 
        node.id === id ? { ...node, ...updates } : node
      ));
    } else {
      try {
        const { error } = await supabase
          .from('diagram_nodes')
          .update(updates)
          .eq('id', id);
        
        if (error) console.error('Error updating node:', error);
      } catch (error) {
        console.error('Error updating node:', error);
        // Fallback to local update if Supabase fails
        setNodes(prev => prev.map(node => 
          node.id === id ? { ...node, ...updates } : node
        ));
      }
    }
  };

  const deleteNode = async (id: string) => {
    if (isOfflineMode) {
      // Delete node locally
      setNodes(prev => prev.filter(node => node.id !== id));
    } else {
      try {
        const { error } = await supabase
          .from('diagram_nodes')
          .delete()
          .eq('id', id);
        
        if (error) console.error('Error deleting node:', error);
      } catch (error) {
        console.error('Error deleting node:', error);
        // Fallback to local deletion if Supabase fails
        setNodes(prev => prev.filter(node => node.id !== id));
      }
    }
  };

  return {
    nodes,
    users,
    currentUser,
    addNode,
    updateNode,
    deleteNode,
    isOfflineMode,
  };
}

function generateUserId(): string {
  return Math.random().toString(36).substr(2, 9);
}

function generateUserColor(): string {
  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}