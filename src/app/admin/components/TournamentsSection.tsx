"use client";

import { useEffect, useState } from "react";

interface Participant {
  id: string;
  name: string;
}

interface Team {
  id: string;
  name: string;
  isFlexible: boolean;
  members: { participant: Participant }[];
}

interface TournamentResult {
  teamId: string;
  position: number;
  points: number;
  team: { name: string };
}

interface Tournament {
  id: string;
  name: string;
  status: string;
  activePlayerId: string | null;
  results: TournamentResult[];
}

interface Match {
  id: string;
  teamAId: string;
  teamBId: string;
  teamA: Team;
  teamB: Team;
  scoreA: number | null;
  scoreB: number | null;
}

export default function TournamentsSection() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [activePlayerId, setActivePlayerId] = useState<string>("");
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newName, setNewName] = useState("");
  const [addingTournament, setAddingTournament] = useState(false);

  const load = () => {
    Promise.all([
      fetch("/api/tournaments").then((r) => r.json()),
      fetch("/api/teams").then((r) => r.json()),
    ]).then(([tv, { teams: t }]) => {
      setTournaments(tv ?? []);
      setTeams(t ?? []);
    });
  };

  useEffect(() => { load(); }, []);

  const team6 = teams.find((t) => t.isFlexible);
  const regularTeams = teams.filter((t) => !t.isFlexible);

  // The 2 shared players: in team 6 AND in a regular team
  const sharedPlayers: Participant[] = team6
    ? team6.members
        .filter((m) =>
          regularTeams.some((t) => t.members.some((rm) => rm.participant.id === m.participant.id))
        )
        .map((m) => m.participant)
    : [];

  const teamLabel = (team: Team) =>
    `${team.name} (${team.members.map((m) => m.participant.name).join(", ")})`;

  const startEdit = async (t: Tournament) => {
    setEditing(t.id);
    setActivePlayerId(t.activePlayerId ?? "");
    setLoadingMatches(true);
    const res = await fetch(`/api/tournaments/${t.id}/matches`);
    const m = await res.json();
    setMatches(m ?? []);
    setLoadingMatches(false);
  };

  const setScore = (matchId: string, side: "scoreA" | "scoreB", value: string) => {
    const parsed = value === "" ? null : Math.max(0, Number(value));
    setMatches((prev) => prev.map((m) => (m.id === matchId ? { ...m, [side]: parsed } : m)));
  };

  const save = async (tournamentId: string) => {
    setSaving(true);
    await fetch(`/api/tournaments/${tournamentId}/matches`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        matches: matches.map((m) => ({ id: m.id, scoreA: m.scoreA, scoreB: m.scoreB })),
        activePlayerId: activePlayerId || null,
      }),
    });
    setSaving(false);
    setEditing(null);
    load();
  };

  const addTournament = async () => {
    if (!newName.trim()) return;
    setAddingTournament(true);
    await fetch("/api/tournaments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    setNewName("");
    setAddingTournament(false);
    load();
  };

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-white">🏆 Tournois</h2>

      <div className="space-y-3">
        {tournaments.map((t) => (
          <div key={t.id} className="bg-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-white">{t.name}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    t.status === "completed"
                      ? "bg-green-900 text-green-400"
                      : "bg-slate-700 text-slate-400"
                  }`}
                >
                  {t.status === "completed" ? "Terminé" : "En attente"}
                </span>
              </div>
              {editing !== t.id ? (
                <button
                  onClick={() => startEdit(t)}
                  className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
                >
                  Saisir les rencontres
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => save(t.id)}
                    disabled={saving || loadingMatches}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded text-sm transition-colors disabled:opacity-50"
                  >
                    {saving ? "…" : "Enregistrer"}
                  </button>
                  <button
                    onClick={() => setEditing(null)}
                    className="text-slate-400 hover:text-white px-3 py-1 rounded text-sm transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              )}
            </div>

            {editing === t.id ? (
              <div className="space-y-3">
                <p className="text-slate-400 text-xs">Score de chaque rencontre :</p>
                {loadingMatches ? (
                  <p className="text-slate-500 text-sm">Chargement…</p>
                ) : (
                  <div className="space-y-2">
                    {matches.map((m) => (
                      <div key={m.id} className="flex items-center gap-2">
                        <span className="text-slate-300 text-sm flex-1 text-right">
                          {teamLabel(m.teamA)}
                        </span>
                        <input
                          type="number"
                          min={0}
                          value={m.scoreA ?? ""}
                          onChange={(e) => setScore(m.id, "scoreA", e.target.value)}
                          className="bg-slate-700 text-slate-200 rounded px-2 py-1 text-sm w-16 text-center"
                        />
                        <span className="text-slate-500">–</span>
                        <input
                          type="number"
                          min={0}
                          value={m.scoreB ?? ""}
                          onChange={(e) => setScore(m.id, "scoreB", e.target.value)}
                          className="bg-slate-700 text-slate-200 rounded px-2 py-1 text-sm w-16 text-center"
                        />
                        <span className="text-slate-300 text-sm flex-1">
                          {teamLabel(m.teamB)}
                        </span>
                      </div>
                    ))}
                    <p className="text-slate-500 text-xs">
                      Le classement final (et les points) sera calculé automatiquement une fois
                      toutes les rencontres renseignées.
                    </p>
                  </div>
                )}

                {sharedPlayers.length > 0 && (
                  <div className="pt-3 border-t border-slate-700">
                    <p className="text-slate-400 text-xs mb-2">
                      Joueur partagé actif pour l&apos;Équipe 6 ce tournoi :
                    </p>
                    <div className="flex gap-2">
                      {sharedPlayers.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setActivePlayerId(activePlayerId === p.id ? "" : p.id)}
                          className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                            activePlayerId === p.id
                              ? "bg-indigo-600 text-white"
                              : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                          }`}
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                {t.results.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                    {t.results.map((r) => (
                      <div key={r.teamId} className="text-sm text-slate-400">
                        <span className="text-slate-300">{r.position}.</span> {r.team.name}{" "}
                        <span className="text-indigo-400">{r.points}pts</span>
                      </div>
                    ))}
                  </div>
                )}
                {t.activePlayerId && (
                  <p className="text-slate-500 text-xs mt-1">
                    Équipe 6 jouée avec{" "}
                    {sharedPlayers.find((p) => p.id === t.activePlayerId)?.name ?? "—"}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-slate-800 rounded-xl p-4">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Ajouter un tournoi</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTournament()}
            placeholder="Nom du tournoi…"
            className="flex-1 bg-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={addTournament}
            disabled={addingTournament || !newName.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {addingTournament ? "…" : "Ajouter"}
          </button>
        </div>
      </div>
    </section>
  );
}
