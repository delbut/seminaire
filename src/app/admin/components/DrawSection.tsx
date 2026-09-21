"use client";

import { useState } from "react";

interface Props {
  drawDone: boolean;
  onDrawComplete: () => void;
}

export default function DrawSection({ drawDone, onDrawComplete }: Props) {
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const handleDraw = async () => {
    if (!confirm) { setConfirm(true); return; }
    setLoading(true);
    await fetch("/api/draw", { method: "POST" });
    await fetch("/api/tournaments", { method: "PUT" });
    setLoading(false);
    setConfirm(false);
    onDrawComplete();
  };

  return (
    <section className="bg-slate-800 rounded-xl p-6">
      <h2 className="text-lg font-semibold text-white mb-2">🎲 Tirage au sort</h2>
      {drawDone ? (
        <div className="flex items-center gap-3">
          <span className="text-green-400">✓ Tirage effectué</span>
          <button
            onClick={() => setConfirm(true)}
            className="text-slate-400 hover:text-red-400 text-sm transition-colors"
          >
            Relancer
          </button>
          {confirm && (
            <div className="flex gap-2">
              <button
                onClick={handleDraw}
                disabled={loading}
                className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm transition-colors disabled:opacity-50"
              >
                {loading ? "…" : "Confirmer"}
              </button>
              <button
                onClick={() => setConfirm(false)}
                className="text-slate-400 hover:text-white px-3 py-1 rounded text-sm transition-colors"
              >
                Annuler
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-slate-400 text-sm">
            Répartit aléatoirement les 11 participants en 5 équipes de 2 + 1 équipe flexible.
          </p>
          {confirm ? (
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 text-sm">Confirmer le tirage au sort ?</span>
              <button
                onClick={handleDraw}
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                {loading ? "Tirage…" : "Oui, lancer"}
              </button>
              <button
                onClick={() => setConfirm(false)}
                className="text-slate-400 hover:text-white text-sm transition-colors"
              >
                Annuler
              </button>
            </div>
          ) : (
            <button
              onClick={handleDraw}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg font-semibold transition-colors"
            >
              Lancer le tirage
            </button>
          )}
        </div>
      )}
    </section>
  );
}
