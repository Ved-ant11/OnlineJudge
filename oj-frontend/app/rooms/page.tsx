"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createRoom, joinRoom } from "@/lib/api";
import toast from "react-hot-toast";

export default function RoomsPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const res = await createRoom();
      router.push(`/rooms/${res.code}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create room");
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setIsJoining(true);
    try {
      await joinRoom(code);
      router.push(`/rooms/${code}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to join room");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-3rem)] bg-[#0a0a0a]">
      <div className="max-w-screen-xl mx-auto px-8 py-14">
        <div className="flex gap-16 items-start">
          <div className="max-w-2xl">
            <div className="mb-12">
              <span className="font-mono-custom text-[9px] tracking-[0.28em] uppercase text-neutral-700 block mb-3">
                Play with peers
              </span>
              <h1 className="font-sans text-[32px] font-bold tracking-[-0.035em] text-white leading-none mb-2">
                Custom Rooms
              </h1>
              <p className="font-mono-custom text-[11px] text-neutral-700">
                Create or join a private room to solve problems with friends.
              </p>
            </div>
            <div className="space-y-6 max-w-sm">
              <div className="border border-neutral-800/60 rounded-lg bg-[#0d0d0d] p-6">
                <h2 className="font-mono-custom text-[10px] tracking-[0.2em] uppercase text-neutral-400 mb-4">
                  Create a Room
                </h2>
                <button
                  onClick={handleCreate}
                  disabled={isCreating}
                  className="w-full h-11 rounded-md bg-white font-mono-custom text-[11px] tracking-[0.14em] uppercase font-medium text-neutral-900 hover:bg-neutral-200 transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99]"
                >
                  {isCreating ? "Creating..." : "Create New Room"}
                </button>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-neutral-800/60" />
                <span className="font-mono-custom text-[9px] tracking-[0.2em] uppercase text-neutral-600">
                  OR
                </span>
                <div className="h-px flex-1 bg-neutral-800/60" />
              </div>
              <div className="border border-neutral-800/60 rounded-lg bg-[#0d0d0d] p-6">
                <h2 className="font-mono-custom text-[10px] tracking-[0.2em] uppercase text-neutral-400 mb-4">
                  Join a Room
                </h2>
                <form onSubmit={handleJoin} className="space-y-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Enter 6-character code"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      maxLength={6}
                      className="w-full px-4 py-3 bg-[#111111] border border-neutral-800 hover:border-neutral-700 focus:border-neutral-600 rounded-md font-mono-custom text-[12px] text-center tracking-[0.2em] text-neutral-300 placeholder:text-neutral-700 outline-none transition-colors duration-200 uppercase"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isJoining || code.length !== 6}
                    className="w-full h-11 rounded-md bg-neutral-800 font-mono-custom text-[11px] tracking-[0.14em] uppercase font-medium text-white hover:bg-neutral-700 transition-colors duration-200 disabled:opacity-50 active:scale-[0.99]"
                  >
                    {isJoining ? "Joining..." : "Join Room"}
                  </button>
                </form>
              </div>
            </div>
          </div>
          <div className="border border-neutral-800/60 rounded-xl bg-[#0d0d0d] p-8 flex-1 shrink-0 mt-[140px] ">
            <span className="font-mono-custom text-[9px] tracking-[0.28em] uppercase text-neutral-600 block mb-6">
              How it works
            </span>
            <div className="space-y-6">
              {[
                {
                  step: "01",
                  title: "Create a room",
                  desc: "Spin up a private room and get a unique 6-character code instantly.",
                },
                {
                  step: "02",
                  title: "Share the code",
                  desc: "Send the code to friends — anyone with it can join directly.",
                },
                {
                  step: "03",
                  title: "Pick a problem",
                  desc: "Choose a problem together and start a synchronized session.",
                },
                {
                  step: "04",
                  title: "Solve & compete",
                  desc: "Race to finish first or collaborate — everyone stays in sync.",
                },
              ].map(({ step, title, desc }) => (
                <div key={step} className="flex gap-4">
                  <span className="font-mono-custom text-[11px] tabular-nums text-neutral-700 mt-0.5 shrink-0">
                    {step}
                  </span>
                  <div>
                    <p className="font-sans text-[13px] font-medium text-neutral-300 mb-1">
                      {title}
                    </p>
                    <p className="font-mono-custom text-[11px] text-neutral-600 leading-relaxed">
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
