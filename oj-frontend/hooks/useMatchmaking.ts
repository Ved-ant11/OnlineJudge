"use client";
import { useState, useEffect, useRef } from "react";
import { joinQueue, leaveQueue, getQueueStatus } from "@/lib/api";
import toast from "react-hot-toast";

export function useMatchmaking() {
    const [searching, setSearching] = useState(false);
    const [battleId, setBattleId] = useState<string | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const startSearching = async () => {
      try {
        await joinQueue();
        setSearching(true);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : String(error));
      }
    };

    const cancelSearching = async () => {
        await leaveQueue();
        setSearching(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
    };

    useEffect(() => {
        if (!searching) return;
        intervalRef.current = setInterval(async () => {
            const data = await getQueueStatus();
            if (data.matched) {
                setBattleId(data.battleId);
                setSearching(false);
                clearInterval(intervalRef.current!);
            }
        }, 2000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [searching]);

    return { searching, battleId, startSearching, cancelSearching };
}
