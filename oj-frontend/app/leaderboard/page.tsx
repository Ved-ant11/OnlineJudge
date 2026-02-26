import { fetchLeaderboard } from "@/lib/api";

export default async function Leaderboard() {
  const leaderboard = await fetchLeaderboard();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-semibold text-neutral-100">Leaderboard</h1>
      <p className="mt-1 text-sm text-neutral-500">Top solvers ranked by problems solved</p>

      <div className="mt-8 rounded-xl border border-neutral-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-800 bg-neutral-900/50">
              <th className="px-4 py-3 text-left font-medium text-neutral-400">Rank</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-400">Username</th>
              <th className="px-4 py-3 text-right font-medium text-neutral-400">Solved</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((user: { username: string; solvedCount: number }, index: number) => (
              <tr
                key={user.username}
                className="border-b border-neutral-800/50 last:border-0 hover:bg-neutral-800/30 transition-colors"
              >
                <td className="px-4 py-3 text-neutral-400">
                  {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                </td>
                <td className="px-4 py-3 text-neutral-200 font-medium">{user.username}</td>
                <td className="px-4 py-3 text-right text-emerald-400 font-mono">{user.solvedCount}</td>
              </tr>
            ))}
            {leaderboard.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-neutral-500">
                  No solved problems yet. Be the first!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
