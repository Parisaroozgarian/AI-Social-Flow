import { useState, useEffect, useCallback } from 'react';

type WebSocketMessage = {
  type: string;
  content?: any;
  status?: string;
  message?: string;
};

export function useWebSocket() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    const connect = () => {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setError(null);
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected', event.code, event.reason);
        setIsConnected(false);
        setSocket(null);

        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000) {
          setTimeout(connect, 3000);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
        setError('Failed to connect to the server');
      };

      setSocket(ws);
    };

    connect();

    return () => {
      if (socket) {
        socket.close(1000, 'Component unmounted');
      }
    };
  }, []);

  const sendMessage = useCallback((type: string, data: any) => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type, ...data }));
    } else {
      console.error('WebSocket is not connected');
      setError('Connection lost. Please try again.');
    }
  }, [socket]);

  const generateContent = useCallback((prompt: string, platform: string) => {
    return new Promise<any>((resolve, reject) => {
      if (!socket || socket.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket is not connected'));
        return;
      }

      let timeoutId = setTimeout(() => {
        socket.removeEventListener('message', handleMessage);
        reject(new Error('Request timed out'));
      }, 30000);

      const handleMessage = (event: MessageEvent) => {
        const data: WebSocketMessage = JSON.parse(event.data);
        if (data.type === 'content_generated') {
          clearTimeout(timeoutId);
          socket.removeEventListener('message', handleMessage);
          resolve(data.content);
        } else if (data.type === 'error') {
          clearTimeout(timeoutId);
          socket.removeEventListener('message', handleMessage);
          reject(new Error(data.message));
        }
      };

      socket.addEventListener('message', handleMessage);
      sendMessage('generate_content', { prompt, platform });
    });
  }, [socket, sendMessage]);

  return {
    isConnected,
    generateContent,
    error
  };
}