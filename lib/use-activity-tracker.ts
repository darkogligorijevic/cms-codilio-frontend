// hooks/useActivityTracker.ts
'use client';

import { useEffect, useCallback } from 'react';

export interface RecentActivity {
  id: string;
  type: 'post' | 'page' | 'media' | 'user' | 'category' | 'settings' | 'gallery' | 'service' | 'organization' | 'system';
  title: string;
  action: 'created' | 'updated' | 'deleted' | 'uploaded' | 'published';
  timestamp: string;
  status?: string;
  author?: string;
  url?: string;
}

interface ActivityUpdateData {
  id: string;
  type: string;
  title: string;
  action: string;
  timestamp: string;
  status?: string;
  author?: string;
  url?: string;
}

interface UseActivityTrackerProps {
  onActivityUpdate: (activity: RecentActivity) => void;
  enabled?: boolean;
}

export function useActivityTracker({ onActivityUpdate, enabled = true }: UseActivityTrackerProps) {
  const mapUpdateTypeToActivityType = useCallback((updateType: string): RecentActivity['type'] => {
    if (updateType.includes('post')) return 'post';
    if (updateType.includes('page')) return 'page';
    if (updateType.includes('media') || updateType.includes('document')) return 'media';
    if (updateType.includes('user')) return 'user';
    if (updateType.includes('gallery')) return 'gallery';
    if (updateType.includes('service')) return 'service';
    if (updateType.includes('director') || updateType.includes('org_unit')) return 'organization';
    if (updateType.includes('settings')) return 'settings';
    return 'system';
  }, []);

  const mapUpdateTypeToAction = useCallback((updateType: string): RecentActivity['action'] => {
    if (updateType.includes('created')) return 'created';
    if (updateType.includes('updated')) return 'updated';
    if (updateType.includes('deleted')) return 'deleted';
    if (updateType.includes('uploaded')) return 'uploaded';
    if (updateType.includes('published')) return 'published';
    return 'updated';
  }, []);

  const handleRealTimeActivity = useCallback((data: ActivityUpdateData) => {
    const newActivity: RecentActivity = {
      id: data.id || `realtime-${Date.now()}`,
      type: mapUpdateTypeToActivityType(data.type),
      title: data.title || 'Unknown',
      action: mapUpdateTypeToAction(data.action || data.type),
      timestamp: data.timestamp || new Date().toISOString(),
      status: data.status,
      author: data.author,
      url: data.url
    };

    onActivityUpdate(newActivity);
  }, [onActivityUpdate, mapUpdateTypeToActivityType, mapUpdateTypeToAction]);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    let socket: any = null;

    // Import socket.io-client dynamically
    import('socket.io-client').then(({ io }) => {
      // Connect to Relof Index WebSocket namespace for real-time updates
      socket = io('http://localhost:3001/relof-index', {
        transports: ['websocket', 'polling']
      });
      
      socket.on('connect', () => {
        console.log('Connected to activity feed WebSocket');
        // Subscribe to updates
        socket.emit('subscribe-to-updates', {});
      });

      // Listen for activity updates
      socket.on('activity-updated', (data: { type: string; data: ActivityUpdateData }) => {
        console.log('Activity update received:', data);
        if (data.type === 'activity-update') {
          handleRealTimeActivity(data.data);
        }
      });

      // Listen for dashboard activity
      socket.on('dashboard-activity', (data: { type: string; data: ActivityUpdateData }) => {
        console.log('Dashboard activity received:', data);
        if (data.type === 'activity-update') {
          handleRealTimeActivity(data.data);
        }
      });

      socket.on('disconnect', () => {
        console.log('Activity feed WebSocket disconnected');
      });

    }).catch(error => {
      console.error('Failed to load socket.io-client:', error);
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [enabled, handleRealTimeActivity]);

  return {
    // Could return connection status, etc. if needed
    isConnected: true // placeholder
  };
}