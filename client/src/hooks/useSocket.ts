"use client";

import { useEffect, useState } from "react";
import { socket } from "../../lib/socket";

type UseSocketOptions = {
  enabled?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onReconnect?: () => void;
};

export const useSocket = (options: UseSocketOptions = {}) => {
  const {
    enabled = true,
    onConnect,
    onDisconnect,
    onReconnect,
  } = options;
  const [isConnected, setIsConnected] = useState<boolean>(socket.connected);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleConnect = () => {
      setIsConnected(true);
      onConnect?.();
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      onDisconnect?.();
    };

    const handleReconnect = () => {
      setIsConnected(true);
      onReconnect?.();
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.io.on("reconnect", handleReconnect);

    if (!socket.connected) {
      socket.connect();
    } else {
      handleConnect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.io.off("reconnect", handleReconnect);
    };
  }, [enabled, onConnect, onDisconnect, onReconnect]);

  return {
    socket,
    isConnected,
  };
};
