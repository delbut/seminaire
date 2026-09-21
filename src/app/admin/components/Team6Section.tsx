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

export default function Team6Section() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [saving, setSaving] = useState(false);
  const [pick1, setPick1] = useState<string>("");
  const [pick2, setPick2] = useState<string>("");
  const [confirmed, setConfirmed] = useState(false);

  const load = () => {
    fetch("/api/teams")
      .then((r) => r.json())
      .then(({ teams: t }) => {
        setTeams(t ?? []);
        const team6 = (t ?? []).find((tm: Team) => tm.isFlexible);
        if (team6 && team6.members.length >= 3) {
          setConfirmed(true);
        }
      });
  };

  useEffect(() => { load(); }, []);

  const team6 = teams.find((t) => t.isFlexible);
  const regularTeams = teams.filter((t) => !t.isFlexible);

  // The lone player is the only member of team 6 right after the draw
  const lonePlayer = team6?.members.length === 1 ? team6.members[0].participant : null;

  // All players in regular teams
  const regularPlayers = regularTeams.flatMap((t) =>
    t.members.map((m) => ({ ...m.participant, teamId: t.id, teamName: t.name }))
  );

  const pick1TeamId = regularPlayers.find((p) => p.id === pick1)?.teamId;
  const pick2Options = regularPlayers.filter(
    (p) => p.id !== pick1 && (pick1TeamId ? p.teamId !== pick1TeamId : true)
  );

  const canSave = pick1 && pick2;

  const save = async () => {
    if (!team6 || !canSave) return;
    setSaving(true);
    await fetch(`/api/teams/${team6.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pick1Id: pick1, pick2Id: pick2 }),
    });
    setSaving(false);
    setConfirmed(true);
    load();
  };

  if (!team6) return null;

  // Already configured
  if (confirmed && team6.members.length >= 3) {
    return (
      <section className="bg-slate-800 rounded-xl p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">👥 Équipe 6</h2>
          <button
            onClick={() => setConfirmed(false)}
            className="text-slate-400 hover:text-white text-sm transition-colors"
          >
            Modifier
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {team6.members.map((m) => (
            <span
              key={m.participant.id}
              className="px-3 py-1 rounded-full text-sm font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
            >
              {m.participant.name}
            </span>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="bg-slate-800 rounded-xl p-6 space-y-5">
      <h2 className="text-lg font-semibold text-white">👥 Formation de l&apos;Équipe 6</h2>

      {/* Lone player */}
      {lonePlayer && (
        <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-4">
          <p className="text-indigo-300 text-xs font-semibold uppercase tracking-wide mb-1">
            Joueur seul après le tirage
          </p>
          <p className="text-white text-xl font-bold">{lonePlayer.name}</p>
          <p className="text-slate-400 text-sm mt-1">
            Choisis 2 joueurs de 2 équipes différentes pour compléter l&apos;équipe 6.
          </p>
        </div>
      )}

      {/* Pick 1 */}
      <div>
        <p className="text-slate-300 text-sm font-medium mb-2">2e joueur :</p>
        <select
          value={pick1}
          onChange={(e) => { setPick1(e.target.value); setPick2(""); }}
          className="bg-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">— Choisir un joueur —</option>
          {regularTeams.map((team) => (
            <optgroup key={team.id} label={team.name}>
              {team.members.map((m) => (
                <option key={m.participant.id} value={m.participant.id}>
                  {m.participant.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Pick 2 */}
      {pick1 && (
        <div>
          <p className="text-slate-300 text-sm font-medium mb-1">3e joueur :</p>
          <p className="text-slate-500 text-xs mb-2">
            Doit venir d&apos;une équipe différente de{" "}
            {regularPlayers.find((p) => p.id === pick1)?.name}.
          </p>
          <select
            value={pick2}
            onChange={(e) => setPick2(e.target.value)}
            className="bg-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">— Choisir un joueur —</option>
            {regularTeams
              .filter((t) => t.id !== pick1TeamId)
              .map((team) => (
                <optgroup key={team.id} label={team.name}>
                  {pick2Options
                    .filter((p) => p.teamId === team.id)
                    .map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </optgroup>
              ))}
          </select>
        </div>
      )}

      {/* Summary */}
      {canSave && lonePlayer && (
        <div className="bg-slate-700/50 rounded-lg p-3 text-sm text-slate-300">
          <span className="font-medium text-white">Équipe 6 : </span>
          {lonePlayer.name} +{" "}
          {regularPlayers.find((p) => p.id === pick1)?.name} +{" "}
          {regularPlayers.find((p) => p.id === pick2)?.name}
          <p className="text-slate-500 text-xs mt-1">
            Les joueurs restants de leurs équipes d&apos;origine seront automatiquement regroupés.
          </p>
        </div>
      )}

      <button
        onClick={save}
        disabled={!canSave || saving}
        className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? "Enregistrement…" : "Confirmer l'équipe 6"}
      </button>
    </section>
  );
}
