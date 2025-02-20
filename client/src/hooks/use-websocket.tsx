import { useState } from 'react';
import { useToast } from './use-toast';

export function useWebSocket() {
  const [isConnected] = useState(false);
  const { toast } = useToast();

  const sendMessage = () => {
    toast({
      title: "Connection Disabled",
      description: "WebSocket connection is temporarily disabled.",
    });
  };

  return {
    isConnected,
    sendMessage,
    socket: null,
  };
}