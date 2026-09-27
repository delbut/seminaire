"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DrawSection from "./components/DrawSection";
import TournamentsSection from "./components/TournamentsSection";
import Team6Section from "./components/Team6Section";
import Logo from "../components/Logo";

export default function AdminPage() {
  const [drawDone, setDrawDone] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((s) => {
        setDrawDone(s.drawCompleted ?? false);
        setLoading(false);
      });
  };

  useEffect(() => { refresh(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-canal-muted">Chargement…</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <Logo subtitle="Admin" />
        <Link
          href="/"
          className="text-canal-muted hover:text-white text-sm font-medium uppercase tracking-wide transition-colors"
        >
          ← Classement public
        </Link>
      </div>

      <DrawSection drawDone={drawDone} onDrawComplete={refresh} />

      {drawDone && (
        <>
          <Team6Section />
          <TournamentsSection />
        </>
      )}
    </div>
  );
}
