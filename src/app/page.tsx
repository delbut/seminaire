"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Logo from "./components/Logo";

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
        <div className="text-canal-muted text-lg">Chargement…</div>
      </div>
    );
  }

  if (!drawDone) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-8">
        <Logo />
        <h1 className="text-3xl font-extrabold uppercase tracking-wide text-white">Olympiades</h1>
        <p className="text-canal-muted text-center max-w-sm">
          Le tirage au sort n&apos;a pas encore eu lieu. L&apos;administrateur doit démarrer le séminaire.
        </p>
        <Link
          href="/admin"
          className="bg-canal-red hover:bg-canal-red-dark text-white px-6 py-3 rounded-full font-semibold transition-colors"
        >
          Accès admin
        </Link>
      </div>
    );
  }

  const completedTournaments = tournaments.filter((t) => t.status === "completed");

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-10">
      <div className="flex items-center justify-between">
        <Logo />
        <Link
          href="/admin"
          className="text-canal-muted hover:text-white text-sm font-medium uppercase tracking-wide transition-colors"
        >
          Admin →
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-extrabold uppercase tracking-wide text-white">Olympiades</h1>
      </div>

      <section>
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-canal-muted mb-4">
          Classement général
        </h2>
        <div className="space-y-3">
          {leaderboard.map((team) => (
            <div
              key={team.id}
              className="bg-canal-surface border border-canal-border rounded-2xl p-4 flex items-center gap-4"
            >
              <span
                className={`text-sm font-black w-9 h-9 rounded-full flex items-center justify-center ${
                  team.rank === 1
                    ? "bg-canal-red text-white"
                    : "bg-canal-surface-2 text-canal-muted"
                }`}
              >
                {MEDAL[team.rank] ?? `#${team.rank}`}
              </span>
              <div className="flex-1">
                <div className="font-semibold text-white">{team.name}</div>
                <div className="text-canal-muted text-sm">{team.members.join(", ")}</div>
              </div>
              <div className="text-2xl font-black text-canal-red">{team.totalPoints} pts</div>
            </div>
          ))}
        </div>
      </section>

      {completedTournaments.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-canal-muted mb-4">
            Résultats par tournoi
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {completedTournaments.map((t) => (
              <div key={t.id} className="bg-canal-surface border border-canal-border rounded-2xl p-4">
                <h3 className="font-semibold text-white mb-3">{t.name}</h3>
                <div className="space-y-1">
                  {t.results.map((r) => (
                    <div key={r.teamId} className="flex items-center gap-2 text-sm">
                      <span className="text-base">{MEDAL[r.position] ?? `${r.position}.`}</span>
                      <span className="text-canal-muted flex-1">{r.team.name}</span>
                      <span className="text-canal-red font-semibold">{r.points} pts</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {completedTournaments.length === 0 && (
        <p className="text-canal-muted text-center py-8">Aucun tournoi terminé pour l&apos;instant.</p>
      )}
    </div>
  );
}
