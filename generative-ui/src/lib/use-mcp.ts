/**
 * useMCP Hook
 * 
 * React hook for consuming MCP gateway SSE stream.
 * Handles OAuth handshake simulation, tool discovery, and real-time status updates.
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface MCPServer {
  id: string;
  name: string;
  status: 'connected' | 'disconnected' | 'connecting';
  toolCount?: number;
  tools?: MCPTool[];
}

export interface MCPTool {
  name: string;
  description: string;
  server?: string;
  inputSchema?: object;
}

export interface MCPGatewayState {
  connected: boolean;
  servers: MCPServer[];
  tools: MCPTool[];
  lastUpdate: string | null;
  error: string | null;
}

export interface UseMCPReturn {
  state: MCPGatewayState;
  connect: () => void;
  disconnect: () => void;
  executeTool: (server: string, tool: string, params?: Record<string, unknown>) => Promise<unknown>;
  refreshTools: () => Promise<void>;
  isConnecting: boolean;
}

export function useMCP(): UseMCPReturn {
  const [state, setState] = useState<MCPGatewayState>({
    connected: false,
    servers: [],
    tools: [],
    lastUpdate: null,
    error: null,
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      return; // Already connected
    }

    setIsConnecting(true);
    setState(prev => ({ ...prev, error: null }));

    try {
      const eventSource = new EventSource('/api/mcp/gateway');
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        setIsConnecting(false);
        setState(prev => ({ ...prev, connected: true, error: null }));
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'connection') {
            setState(prev => ({
              ...prev,
              connected: true,
              servers: data.servers || [],
              lastUpdate: data.timestamp,
            }));
          } else if (data.type === 'heartbeat') {
            setState(prev => ({ ...prev, lastUpdate: data.timestamp }));
          } else if (data.type === 'tool_result') {
            // Handle tool execution results if streamed
          }
        } catch (e) {
          console.error('Failed to parse MCP event:', e);
        }
      };

      eventSource.onerror = () => {
        setIsConnecting(false);
        setState(prev => ({
          ...prev,
          connected: false,
          error: 'Connection to MCP gateway lost. Retrying...',
        }));
        
        // Auto-reconnect after 5 seconds
        eventSourceRef.current?.close();
        eventSourceRef.current = null;
        setTimeout(connect, 5000);
      };
    } catch (error) {
      setIsConnecting(false);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to connect to MCP gateway',
      }));
    }
  }, []);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setState(prev => ({ ...prev, connected: false }));
  }, []);

  const refreshTools = useCallback(async () => {
    try {
      const response = await fetch('/api/mcp/gateway?action=tools');
      if (!response.ok) throw new Error('Failed to fetch tools');
      const data = await response.json();
      setState(prev => ({ ...prev, tools: data.tools || [] }));
    } catch (error) {
      console.error('Failed to refresh tools:', error);
    }
  }, []);

  const executeTool = useCallback(async (
    server: string,
    tool: string,
    params?: Record<string, unknown>
  ): Promise<unknown> => {
    const response = await fetch('/api/mcp/gateway', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ server, tool, params }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to execute tool');
    }

    const data = await response.json();
    return data.result;
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    connect();
    refreshTools();

    return () => {
      disconnect();
    };
  }, [connect, disconnect, refreshTools]);

  return {
    state,
    connect,
    disconnect,
    executeTool,
    refreshTools,
    isConnecting,
  };
}

/**
 * Hook for executing MCP tools with loading states
 */
export function useMCPTool<T = unknown>(
  server: string,
  tool: string
) {
  const { executeTool } = useMCP();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<T | null>(null);

  const execute = useCallback(async (params?: Record<string, unknown>) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await executeTool(server, tool, params);
      setResult(data as T);
      return data as T;
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Tool execution failed';
      setError(errorMessage);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [executeTool, server, tool]);

  return { execute, isLoading, error, result };
}
