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
        if (team6 && team6.members.length >= 3) setConfirmed(true);
      });
  };

  useEffect(() => { load(); }, []);

  const team6 = teams.find((t) => t.isFlexible);
  const regularTeams = teams.filter((t) => !t.isFlexible);

  const lonePlayer = team6?.members.length === 1 ? team6.members[0].participant : null;

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

  if (confirmed && team6.members.length >= 3) {
    // Find the 2 shared players (those also in a regular team)
    const sharedPlayers = team6.members.filter((m) =>
      regularTeams.some((t) => t.members.some((rm) => rm.participant.id === m.participant.id))
    );
    const loneMember = team6.members.find((m) => !sharedPlayers.includes(m));

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
        <div className="space-y-1 text-sm text-slate-300">
          {loneMember && (
            <div className="flex items-center gap-2">
              <span className="text-indigo-400 font-medium">{loneMember.participant.name}</span>
              <span className="text-slate-500 text-xs">— joueur fixe</span>
            </div>
          )}
          {sharedPlayers.map((m) => {
            const origTeam = regularTeams.find((t) =>
              t.members.some((rm) => rm.participant.id === m.participant.id)
            );
            return (
              <div key={m.participant.id} className="flex items-center gap-2">
                <span className="text-indigo-400 font-medium">{m.participant.name}</span>
                <span className="text-slate-500 text-xs">— aussi dans {origTeam?.name}</span>
              </div>
            );
          })}
        </div>
        <p className="text-slate-500 text-xs">
          À chaque tournoi, tu choisiras lequel des 2 joueurs partagés joue avec l&apos;équipe 6.
        </p>
      </section>
    );
  }

  return (
    <section className="bg-slate-800 rounded-xl p-6 space-y-5">
      <h2 className="text-lg font-semibold text-white">👥 Formation de l&apos;Équipe 6</h2>

      {lonePlayer && (
        <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-4">
          <p className="text-indigo-300 text-xs font-semibold uppercase tracking-wide mb-1">
            Joueur seul après le tirage
          </p>
          <p className="text-white text-xl font-bold">{lonePlayer.name}</p>
          <p className="text-slate-400 text-sm mt-1">
            Choisis 2 joueurs de 2 équipes différentes. Ils restent dans leurs équipes et jouent aussi avec l&apos;équipe 6 en alternance.
          </p>
        </div>
      )}

      <div>
        <p className="text-slate-300 text-sm font-medium mb-2">1er joueur partagé :</p>
        <select
          value={pick1}
          onChange={(e) => { setPick1(e.target.value); setPick2(""); }}
          className="bg-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">— Choisir —</option>
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

      {pick1 && (
        <div>
          <p className="text-slate-300 text-sm font-medium mb-1">2e joueur partagé :</p>
          <p className="text-slate-500 text-xs mb-2">
            Doit venir d&apos;une équipe différente de{" "}
            {regularPlayers.find((p) => p.id === pick1)?.name}.
          </p>
          <select
            value={pick2}
            onChange={(e) => setPick2(e.target.value)}
            className="bg-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">— Choisir —</option>
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

      {canSave && lonePlayer && (
        <div className="bg-slate-700/50 rounded-lg p-3 text-sm">
          <p className="text-white font-medium mb-1">Équipe 6 :</p>
          <p className="text-slate-300">
            {lonePlayer.name} (fixe) + {regularPlayers.find((p) => p.id === pick1)?.name} ou{" "}
            {regularPlayers.find((p) => p.id === pick2)?.name} selon le tournoi
          </p>
          <p className="text-slate-500 text-xs mt-1">
            Les 2 joueurs partagés restent aussi dans leurs équipes d&apos;origine.
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
