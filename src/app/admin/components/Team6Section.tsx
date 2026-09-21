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
  const [allParticipants, setAllParticipants] = useState<Participant[]>([]);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<"mercenary" | "trio">("mercenary");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [mercenaryId, setMercenaryId] = useState<string>("");

  const load = () => {
    fetch("/api/teams")
      .then((r) => r.json())
      .then(({ teams: t, settings: s }) => {
        setTeams(t ?? []);
        setSettings(s);
        setMode(s?.team6Mode ?? "mercenary");
        setMercenaryId(s?.mercenaryId ?? "");

        const team6 = (t ?? []).find((tm: Team) => tm.isFlexible);
        if (team6) {
          setSelectedIds(team6.members.map((m: { participant: Participant }) => m.participant.id));
        }

        const all: Participant[] = [];
        for (const tm of t ?? []) {
          for (const m of tm.members) {
            all.push(m.participant);
          }
        }
        // Add mercenary if not in any team
        if (s?.mercenaryId) {
          const inTeam = all.find((p) => p.id === s.mercenaryId);
          if (!inTeam) {
            // Fetch participant list from teams
          }
        }
        setAllParticipants(all);
      });
  };

  useEffect(() => { load(); }, []);

  const team6 = teams.find((t) => t.isFlexible);
  const otherParticipants = allParticipants.filter(
    (p) => !teams.find((t) => !t.isFlexible && t.members.some((m) => m.participant.id === p.id)) === false
      ? true
      : true
  );

  const save = async () => {
    if (!team6) return;
    setSaving(true);
    await fetch(`/api/teams/${team6.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode,
        memberIds: mode === "trio" ? selectedIds : selectedIds.filter((id) => id !== mercenaryId),
        mercenaryId: mode === "mercenary" ? mercenaryId : null,
      }),
    });
    setSaving(false);
    load();
  };

  if (!team6) return null;

  return (
    <section className="bg-slate-800 rounded-xl p-6 space-y-4">
      <h2 className="text-lg font-semibold text-white">👥 Équipe 6 (flexible)</h2>

      <div>
        <p className="text-slate-400 text-sm mb-2">Mode :</p>
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
      </div>

      <div>
        <p className="text-slate-400 text-sm mb-2">
          {mode === "mercenary"
            ? "2 membres permanents de l'équipe 6 :"
            : "3 membres de l'équipe 6 :"}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {allParticipants.map((p) => {
            const isSelected = selectedIds.includes(p.id);
            const isMercenary = mode === "mercenary" && mercenaryId === p.id;
            return (
              <label
                key={p.id}
                className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-indigo-600/30 border border-indigo-500"
                    : "bg-slate-700 border border-transparent hover:bg-slate-600"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => {
                    setSelectedIds(
                      e.target.checked
                        ? [...selectedIds, p.id]
                        : selectedIds.filter((id) => id !== p.id)
                    );
                  }}
                  className="hidden"
                />
                <span className="text-sm text-slate-200">{p.name}</span>
                {isMercenary && <span className="text-xs text-yellow-400 ml-auto">mercenaire</span>}
              </label>
            );
          })}
        </div>
      </div>

      {mode === "mercenary" && (
        <div>
          <p className="text-slate-400 text-sm mb-2">Joueur mercenaire (rotatif) :</p>
          <select
            value={mercenaryId}
            onChange={(e) => setMercenaryId(e.target.value)}
            className="bg-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm w-full max-w-xs"
          >
            <option value="">— Sélectionner —</option>
            {allParticipants.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      )}

      <button
        onClick={save}
        disabled={saving}
        className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
      >
        {saving ? "Sauvegarde…" : "Enregistrer"}
      </button>
    </section>
  );
}
