'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { LiveEvent } from './types';

/**
 * WebSocket hook for live event streaming from the AOMC control plane.
 * Connects via the server-side proxy to reach the Docker-internal WebSocket.
 */
export function useEventStream(onEvent: (event: LiveEvent) => void) {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const connect = useCallback(() => {
    // Build WebSocket URL from current page location
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // The WebSocket connects to the control plane directly via exposed port
    // In docker-compose, we expose the control plane WS on port 8000
    const wsUrl = `${protocol}//${window.location.hostname}:8000/api/events/ws`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data: LiveEvent = JSON.parse(event.data);
          onEvent(data);
        } catch {
          // Ignore malformed messages
        }
      };

      ws.onclose = () => {
        setConnected(false);
        // Reconnect after 2 seconds
        reconnectTimer.current = setTimeout(connect, 2000);
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch {
      // Retry after 2 seconds
      reconnectTimer.current = setTimeout(connect, 2000);
    }
  }, [onEvent]);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  // Send keepalive pings
  useEffect(() => {
    const interval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send('ping');
      }
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return { connected };
}
