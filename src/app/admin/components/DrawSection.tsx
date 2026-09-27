"use client";

import { useState } from "react";

interface Props {
  drawDone: boolean;
  onDrawComplete: () => void;
}

export default function DrawSection({ drawDone, onDrawComplete }: Props) {
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [resetText, setResetText] = useState("");
  const [resetting, setResetting] = useState(false);

  const handleDraw = async () => {
    if (!confirm) { setConfirm(true); return; }
    setLoading(true);
    await fetch("/api/draw", { method: "POST" });
    await fetch("/api/tournaments", { method: "PUT" });
    onDrawComplete();
    window.location.reload();
  };

  const handleReset = async () => {
    setResetting(true);
    await fetch("/api/reset", { method: "POST" });
    setResetting(false);
    onDrawComplete();
    window.location.reload();
  };

  return (
    <section className="bg-canal-surface border border-canal-border rounded-2xl p-6">
      <h2 className="text-lg font-semibold text-white mb-2">🎲 Tirage au sort</h2>
      {drawDone ? (
        <div className="flex items-center gap-3">
          <span className="text-green-400">✓ Tirage effectué</span>
          <button
            onClick={() => setConfirm(true)}
            className="text-canal-muted hover:text-canal-red text-sm transition-colors"
          >
            Relancer
          </button>
          {confirm && (
            <div className="flex gap-2">
              <button
                onClick={handleDraw}
                disabled={loading}
                className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-1 rounded-full text-sm transition-colors disabled:opacity-50"
              >
                {loading ? "…" : "Confirmer"}
              </button>
              <button
                onClick={() => setConfirm(false)}
                className="text-canal-muted hover:text-white px-3 py-1 rounded text-sm transition-colors"
              >
                Annuler
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-canal-muted text-sm">
            Répartit aléatoirement les 11 participants en 5 équipes de 2 + 1 équipe flexible.
          </p>
          {confirm ? (
            <div className="flex items-center gap-3">
              <span className="text-amber-400 text-sm">Confirmer le tirage au sort ?</span>
              <button
                onClick={handleDraw}
                disabled={loading}
                className="bg-canal-red hover:bg-canal-red-dark text-white px-4 py-2 rounded-full text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {loading ? "Tirage…" : "Oui, lancer"}
              </button>
              <button
                onClick={() => setConfirm(false)}
                className="text-canal-muted hover:text-white text-sm transition-colors"
              >
                Annuler
              </button>
            </div>
          ) : (
            <button
              onClick={handleDraw}
              className="bg-canal-red hover:bg-canal-red-dark text-white px-5 py-2 rounded-full font-semibold transition-colors"
            >
              Lancer le tirage
            </button>
          )}
        </div>
      )}

      <div className="mt-6 pt-5 border-t border-canal-border">
        <p className="text-canal-muted text-xs uppercase tracking-wide font-semibold mb-2">
          Zone dangereuse
        </p>
        {!resetConfirm ? (
          <button
            onClick={() => setResetConfirm(true)}
            className="text-canal-muted hover:text-canal-red text-sm transition-colors"
          >
            Réinitialiser tout le site
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-canal-red text-sm">
              Supprime définitivement participants, équipes, tournois et résultats — retour à zéro.
              Tape RESET pour confirmer :
            </p>
            <div className="flex items-center gap-2">
              <input
                value={resetText}
                onChange={(e) => setResetText(e.target.value)}
                placeholder="RESET"
                className="bg-canal-surface-2 text-white rounded-lg px-3 py-1.5 text-sm w-32 focus:outline-none focus:ring-2 focus:ring-canal-red"
              />
              <button
                onClick={handleReset}
                disabled={resetText !== "RESET" || resetting}
                className="bg-canal-red hover:bg-canal-red-dark text-white px-3 py-1.5 rounded-full text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {resetting ? "…" : "Confirmer la réinitialisation"}
              </button>
              <button
                onClick={() => { setResetConfirm(false); setResetText(""); }}
                className="text-canal-muted hover:text-white text-sm transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
