"use client";
import { useEffect, useRef, useState, useCallback } from "react";

export type RoomPlayer = {
  userId: string;
  username: string;
  isReady: boolean;
  isConnected: boolean;
  verdict?: string | null;
  hasFinished?: boolean;
};

type RoomState = {
  status: "connecting" | "WAITING" | "ACTIVE" | "COMPLETED";
  players: RoomPlayer[];
  ownerId: string | null;
  questionId: string | null;
  startTime: number;
  events: string[];
  leaderboard: { username: string; time: number }[];
};

export function useRoomSocket(roomId: string, userId: string) {
  const [state, setState] = useState<RoomState>({
    status: "connecting",
    players: [],
    ownerId: null,
    questionId: null,
    startTime: 0,
    events: [],
    leaderboard: [],
  });

  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!roomId || !userId) return;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:5000";
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "room:join", roomId, userId }));
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      switch (msg.type) {
        case "room:state":
          setState((prev) => ({
            ...prev,
            status: msg.status,
            ownerId: msg.ownerId,
            players: msg.players.map((p: RoomPlayer) => {
              const existing = prev.players.find(
                (ep) => ep.userId === p.userId,
              );
              return {
                ...p,
                verdict: existing?.verdict || null,
                hasFinished: existing?.hasFinished || false,
              };
            }),
          }));
          break;

        case "room:started":
          setState((prev) => ({
            ...prev,
            status: "ACTIVE",
            questionId: msg.questionId,
            startTime: msg.startTime,
            events: [...prev.events, "Room started!"],
          }));
          break;

        case "room:submission":
          setState((prev) => ({
            ...prev,
            players: prev.players.map((p) =>
              p.userId === msg.userId ? { ...p, verdict: msg.verdict } : p,
            ),
            events: [
              ...prev.events,
              `${msg.username} submitted: ${msg.verdict}`,
            ],
          }));
          break;

        case "room:finished":
          setState((prev) => ({
            ...prev,
            players: prev.players.map((p) =>
              p.userId === msg.userId ? { ...p, hasFinished: true } : p,
            ),
            events: [...prev.events, `${msg.username} solved the problem!`],
          }));
          break;

        case "room:ended":
          setState((prev) => ({
            ...prev,
            status: "COMPLETED",
            leaderboard: msg.leaderboard,
          }));
          break;

        case "error":
          console.error("[room ws] Server error:", msg.message);
          break;
      }
    };

    return () => {
      ws.close();
    };
  }, [roomId, userId]);

  const sendReady = useCallback(
    (isReady: boolean) => {
      wsRef.current?.send(
        JSON.stringify({
          type: "room:ready",
          roomId,
          userId,
          isReady,
        }),
      );
    },
    [roomId, userId],
  );

  const sendStart = useCallback(() => {
    wsRef.current?.send(
      JSON.stringify({
        type: "room:start",
        roomId,
        userId,
      }),
    );
  }, [roomId, userId]);

  const sendSubmit = useCallback(
    (code: string, language: string) => {
      wsRef.current?.send(
        JSON.stringify({
          type: "room:submit",
          roomId,
          userId,
          code,
          language,
        }),
      );
    },
    [roomId, userId],
  );

  const sendEnd = useCallback(() => {
    wsRef.current?.send(
      JSON.stringify({
        type: "room:end",
        roomId,
        userId,
      }),
    );
  }, [roomId, userId]);

  return { ...state, sendReady, sendStart, sendSubmit, sendEnd };
}
