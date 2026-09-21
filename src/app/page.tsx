"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface TeamStanding {
  id: string;
  name: string;
  isFlexible: boolean;
  members: string[];
  totalPoints: number;
  rank: number;
  results: { tournamentId: string; tournamentName: string; position: number; points: number }[];
}

interface Tournament {
  id: string;
  name: string;
  status: string;
  results: { teamId: string; position: number; points: number; team: { name: string } }[];
}

const MEDAL: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

export default function HomePage() {
  const [leaderboard, setLeaderboard] = useState<TeamStanding[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [drawDone, setDrawDone] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/leaderboard").then((r) => r.json()),
      fetch("/api/tournaments").then((r) => r.json()),
    ]).then(([lb, tv]) => {
      setLeaderboard(lb.leaderboard ?? []);
      setDrawDone(lb.settings?.drawCompleted ?? false);
      setTournaments(tv ?? []);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-400 text-lg">Chargement…</div>
      </div>
    );
  }

  if (!drawDone) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-8">
        <h1 className="text-4xl font-bold text-white">🏅 Olympiades</h1>
        <p className="text-slate-400 text-center max-w-sm">
          Le tirage au sort n&apos;a pas encore eu lieu. L&apos;administrateur doit démarrer le séminaire.
        </p>
        <Link
          href="/admin"
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          Accès admin
        </Link>
      </div>
    );
  }

  const completedTournaments = tournaments.filter((t) => t.status === "completed");

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">🏅 Olympiades</h1>
        <Link href="/admin" className="text-slate-400 hover:text-white text-sm transition-colors">
          Admin →
        </Link>
      </div>

      <section>
        <h2 className="text-xl font-semibold text-slate-300 mb-4">Classement général</h2>
        <div className="space-y-3">
          {leaderboard.map((team) => (
            <div
              key={team.id}
              className="bg-slate-800 rounded-xl p-4 flex items-center gap-4"
            >
              <span className="text-2xl w-10 text-center">
                {MEDAL[team.rank] ?? `#${team.rank}`}
              </span>
              <div className="flex-1">
                <div className="font-semibold text-white">{team.name}</div>
                <div className="text-slate-400 text-sm">{team.members.join(", ")}</div>
              </div>
              <div className="text-2xl font-bold text-indigo-400">{team.totalPoints} pts</div>
            </div>
          ))}
        </div>
      </section>

      {completedTournaments.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-slate-300 mb-4">Résultats par tournoi</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {completedTournaments.map((t) => (
              <div key={t.id} className="bg-slate-800 rounded-xl p-4">
                <h3 className="font-semibold text-white mb-3">{t.name}</h3>
                <div className="space-y-1">
                  {t.results.map((r) => (
                    <div key={r.teamId} className="flex items-center gap-2 text-sm">
                      <span className="text-base">{MEDAL[r.position] ?? `${r.position}.`}</span>
                      <span className="text-slate-300 flex-1">{r.team.name}</span>
                      <span className="text-indigo-400 font-medium">{r.points} pts</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {completedTournaments.length === 0 && (
        <p className="text-slate-500 text-center py-8">Aucun tournoi terminé pour l&apos;instant.</p>
      )}
    </div>
  );
}
