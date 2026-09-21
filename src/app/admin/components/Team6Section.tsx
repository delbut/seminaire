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

interface Settings {
  team6Mode: string;
  mercenaryId: string | null;
}

export default function Team6Section() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [mercenary, setMercenary] = useState<Participant | null>(null);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<"mercenary" | "trio">("mercenary");
  const [pick1, setPick1] = useState<string>("");
  const [pick2, setPick2] = useState<string>("");
  const [confirmed, setConfirmed] = useState(false);

  const load = () => {
    fetch("/api/teams")
      .then((r) => r.json())
      .then(({ teams: t, settings: s, mercenary: m }) => {
        setTeams(t ?? []);
        setSettings(s);
        setMercenary(m ?? null);
        setMode(s?.team6Mode ?? "mercenary");

        const team6 = (t ?? []).find((tm: Team) => tm.isFlexible);
        if (team6 && team6.members.length >= 2) {
          setConfirmed(true);
          const nonMercenary = team6.members.filter(
            (mb: { participant: Participant }) => mb.participant.id !== s?.mercenaryId
          );
          if (nonMercenary[0]) setPick1(nonMercenary[0].participant.id);
          if (nonMercenary[1]) setPick2(nonMercenary[1].participant.id);
        }
      });
  };

  useEffect(() => { load(); }, []);

  const team6 = teams.find((t) => t.isFlexible);
  const regularTeams = teams.filter((t) => !t.isFlexible);

  // All players in regular teams
  const regularPlayers = regularTeams.flatMap((t) =>
    t.members.map((m) => ({ ...m.participant, teamId: t.id, teamName: t.name }))
  );

  // Team of pick1
  const pick1Team = regularPlayers.find((p) => p.id === pick1)?.teamId;

  // For pick2: exclude players from the same team as pick1
  const pick2Options = regularPlayers.filter(
    (p) => p.id !== pick1 && (pick1Team ? p.teamId !== pick1Team : true)
  );

  const canSave = pick1 && pick2 && pick1 !== pick2;

  const save = async () => {
    if (!team6 || !canSave) return;
    setSaving(true);
    await fetch(`/api/teams/${team6.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode, pick1Id: pick1, pick2Id: pick2 }),
    });
    setSaving(false);
    setConfirmed(true);
    load();
  };

  if (!team6) return null;

  // Already configured
  if (confirmed && team6.members.length >= 2) {
    return (
      <section className="bg-slate-800 rounded-xl p-6 space-y-4">
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
          {team6.members.map((m) => {
            const isMerc = m.participant.id === settings?.mercenaryId;
            return (
              <span
                key={m.participant.id}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isMerc
                    ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40"
                    : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                }`}
              >
                {m.participant.name}
                {isMerc && " ★"}
              </span>
            );
          })}
        </div>

        <div className="flex gap-3 mt-2">
          {(["mercenary", "trio"] as const).map((m) => (
            <button
              key={m}
              onClick={async () => {
                setMode(m);
                await fetch(`/api/teams/${team6.id}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ mode: m }),
                });
                load();
              }}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                mode === m
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-700 text-slate-400 hover:bg-slate-600"
              }`}
            >
              {m === "mercenary" ? "Mercenaire rotatif" : "Équipe de 3 fixe"}
            </button>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="bg-slate-800 rounded-xl p-6 space-y-5">
      <h2 className="text-lg font-semibold text-white">👥 Formation de l&apos;Équipe 6</h2>

      {/* Lone player */}
      {mercenary && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <p className="text-yellow-400 text-xs font-semibold uppercase tracking-wide mb-1">
            Joueur seul après le tirage
          </p>
          <p className="text-white text-xl font-bold">{mercenary.name}</p>
          <p className="text-slate-400 text-sm mt-1">
            Ce joueur sera automatiquement dans l&apos;équipe 6.
          </p>
        </div>
      )}

      {/* Mode selection */}
      <div>
        <p className="text-slate-400 text-sm mb-2">Mode de l&apos;équipe 6 :</p>
        <div className="flex gap-3">
          {(["mercenary", "trio"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === m
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              {m === "mercenary" ? "Mercenaire rotatif" : "Équipe de 3 fixe"}
            </button>
          ))}
        </div>
        <p className="text-slate-500 text-xs mt-2">
          {mode === "mercenary"
            ? `${mercenary?.name ?? "Le joueur seul"} rejoint une équipe différente à chaque tournoi. Les 2 joueurs ci-dessous forment l'équipe 6 permanente.`
            : `Les 3 joueurs forment une équipe fixe pour tout le séminaire.`}
        </p>
      </div>

      {/* Pick 1 */}
      <div>
        <p className="text-slate-300 text-sm font-medium mb-2">
          Joueur 2 de l&apos;équipe 6 :
        </p>
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

      {/* Pick 2 — only shown after pick 1 */}
      {pick1 && (
        <div>
          <p className="text-slate-300 text-sm font-medium mb-1">
            Joueur 3 de l&apos;équipe 6 :
          </p>
          <p className="text-slate-500 text-xs mb-2">
            Doit venir d&apos;une équipe différente de {regularPlayers.find((p) => p.id === pick1)?.name}.
          </p>
          <select
            value={pick2}
            onChange={(e) => setPick2(e.target.value)}
            className="bg-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">— Choisir un joueur —</option>
            {regularTeams
              .filter((t) => t.id !== pick1Team)
              .map((team) => (
                <optgroup key={team.id} label={team.name}>
                  {team.members
                    .filter((m) => m.participant.id !== pick1)
                    .map((m) => (
                      <option key={m.participant.id} value={m.participant.id}>
                        {m.participant.name}
                      </option>
                    ))}
                </optgroup>
              ))}
          </select>
        </div>
      )}

      {/* Summary */}
      {canSave && mercenary && (
        <div className="bg-slate-700/50 rounded-lg p-3 text-sm text-slate-300">
          <span className="font-medium text-white">Équipe 6 : </span>
          {mercenary.name} (★) +{" "}
          {regularPlayers.find((p) => p.id === pick1)?.name} +{" "}
          {regularPlayers.find((p) => p.id === pick2)?.name}
          <p className="text-slate-500 text-xs mt-1">
            Les équipes d&apos;origine des 2 joueurs choisis fusionneront automatiquement leurs joueurs restants.
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
