import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { DiagramNode, User } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export function useSupabase(workspaceId: string) {
  const [nodes, setNodes] = useState<DiagramNode[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: false,
    error: null
  });

  useEffect(() => {
    if (!workspaceId) return;

    // Check if we're using placeholder Supabase values or if Supabase is not properly configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || 
        !supabaseKey || 
        supabaseUrl.includes('placeholder') || 
        supabaseKey.includes('placeholder') ||
        supabaseUrl === 'your_supabase_url' ||
        supabaseKey === 'your_supabase_anon_key') {
      setIsOfflineMode(true);
    }

    // Initialize user (check for existing auth or create guest)
    initializeUser();

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
      if (currentUser) {
        presenceChannel.track(currentUser);
      }

      return () => {
        supabase.removeChannel(nodesChannel);
        supabase.removeChannel(presenceChannel);
      };
    }
  }, [workspaceId, currentUser, isOfflineMode]);

  const initializeUser = async () => {
    if (!isOfflineMode) {
      // Check for existing Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Get or generate a stable color for this user
        const userColor = getUserColor(session.user.id);
        const registeredUser: User = {
          id: session.user.id,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email,
          isGuest: false,
          color: userColor,
          lastSeen: new Date().toISOString(),
        };
        setCurrentUser(registeredUser);
        setUsers([registeredUser]);
        return;
      }
    }

    // Create or load guest user
    const userId = localStorage.getItem('userId') || generateUserId();
    const userName = localStorage.getItem('userName') || `Guest ${userId.slice(0, 8)}`;
    // Get or generate a stable color for this user
    const userColor = getUserColor(userId);
    localStorage.setItem('userId', userId);
    localStorage.setItem('userName', userName);
    
    const guestUser: User = {
      id: userId,
      name: userName,
      isGuest: true,
      color: userColor,
      lastSeen: new Date().toISOString(),
    };
    
    setCurrentUser(guestUser);
    setUsers([guestUser]);
  };

  const signUp = async (email: string, password: string, name: string) => {
    setAuthState({ user: null, isLoading: true, error: null });
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });

      if (error) throw error;

      if (data.user) {
        // Transfer guest data to new account
        await transferGuestData(data.user.id);
        
        const newUser: User = {
          id: data.user.id,
          name,
          email,
          isGuest: false,
          color: currentUser?.color || generateUserColor(),
          lastSeen: new Date().toISOString(),
        };
        
        setCurrentUser(newUser);
        setUsers([newUser]);
        setAuthState({ user: newUser, isLoading: false, error: null });
      }
    } catch (error) {
      setAuthState({ 
        user: null, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Sign up failed' 
      });
    }
  };

  const signIn = async (email: string, password: string) => {
    setAuthState({ user: null, isLoading: true, error: null });
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.user) {
        const user: User = {
          id: data.user.id,
          name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
          email: data.user.email,
          isGuest: false,
          color: getUserColor(data.user.id),
          lastSeen: new Date().toISOString(),
        };
        
        setCurrentUser(user);
        setUsers([user]);
        setAuthState({ user, isLoading: false, error: null });
      }
    } catch (error) {
      setAuthState({ 
        user: null, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Sign in failed' 
      });
    }
  };

  const signOut = async () => {
    if (!isOfflineMode) {
      await supabase.auth.signOut();
    }
    
    // Clear local storage and reinitialize as guest
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    initializeUser();
  };

  const updateUserName = (name: string) => {
    if (!currentUser) return;
    
    localStorage.setItem('userName', name);
    const updatedUser = { ...currentUser, name };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
  };

  const transferGuestData = async (newUserId: string) => {
    // Update all guest nodes to belong to the new user
    const updatedNodes = nodes.map(node => ({
      ...node,
      userId: newUserId,
      updatedAt: new Date().toISOString()
    }));
    
    setNodes(updatedNodes);
    
    // Save to localStorage for offline mode
    if (isOfflineMode) {
      localStorage.setItem(`nodes_${workspaceId}`, JSON.stringify(updatedNodes));
    }
  };

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
        
        if (error) {
          // If we get a table not found error, switch to offline mode
          if (error.message?.includes('relation "public.diagram_nodes" does not exist') || 
              error.code === 'PGRST116') {
            console.log('Switching to offline mode due to missing table');
            setIsOfflineMode(true);
            setNodes(prev => [...prev, newNode]);
          } else {
            console.log('Supabase error, switching to offline mode:', error.message);
            setIsOfflineMode(true);
            setNodes(prev => [...prev, newNode]);
          }
        }
      } catch (error) {
        console.log('Supabase request failed, switching to offline mode');
        // If we get a 404 or network error, switch to offline mode
        setIsOfflineMode(true);
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
        
        if (error) {
          // If table doesn't exist, switch to offline mode
          if (error.message?.includes('relation "public.diagram_nodes" does not exist') || 
              error.code === 'PGRST116') {
            setIsOfflineMode(true);
            setNodes(prev => prev.map(node => 
              node.id === id ? { ...node, ...updates } : node
            ));
          } else {
            console.error('Error updating node:', error);
          }
        }
      } catch (error) {
        console.error('Supabase request failed:', error);
        setIsOfflineMode(true);
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
        
        if (error) {
          // If table doesn't exist, switch to offline mode
          if (error.message?.includes('relation "public.diagram_nodes" does not exist') || 
              error.code === 'PGRST116') {
            setIsOfflineMode(true);
            setNodes(prev => prev.filter(node => node.id !== id));
          } else {
            console.error('Error deleting node:', error);
          }
        }
      } catch (error) {
        console.error('Supabase request failed:', error);
        setIsOfflineMode(true);
        setNodes(prev => prev.filter(node => node.id !== id));
      }
    }
  };

  return {
    nodes,
    users,
    currentUser,
    authState,
    addNode,
    updateNode,
    deleteNode,
    signUp,
    signIn,
    signOut,
    updateUserName,
    isOfflineMode,
  };
}

function generateUserId(): string {
  return Math.random().toString(36).substr(2, 9);
}

function getUserColor(userId: string): string {
  // Check if we already have a color stored for this user
  const storedColor = localStorage.getItem(`userColor_${userId}`);
  if (storedColor) {
    return storedColor;
  }
  
  // Generate a consistent color based on user ID
  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
  ];
  
  // Use a simple hash of the user ID to pick a consistent color
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash + userId.charCodeAt(i)) & 0xffffffff;
  }
  const colorIndex = Math.abs(hash) % colors.length;
  const selectedColor = colors[colorIndex];
  
  // Store the color for future use
  localStorage.setItem(`userColor_${userId}`, selectedColor);
  
  return selectedColor;
}