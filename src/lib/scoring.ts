export const POINTS_BY_POSITION: Record<number, number> = {
  1: 6,
  2: 5,
  3: 4,
  4: 3,
  5: 2,
  6: 1,
};

export function pointsForPosition(position: number): number {
  return POINTS_BY_POSITION[position] ?? 0;
}

interface MatchResult {
  teamAId: string;
  teamBId: string;
  scoreA: number | null;
  scoreB: number | null;
}

interface TeamStanding {
  teamId: string;
  matchPoints: number;
  diff: number;
  scored: number;
}

/** Ranks teams from a set of round-robin matches (win=3, draw=1, loss=0),
 *  tie-broken by points difference, then by total points scored,
 *  then by original team order. Unplayed matches (null scores) are ignored. */
export function rankTeams(teamIds: string[], matches: MatchResult[]): string[] {
  const standings = new Map<string, TeamStanding>(
    teamIds.map((teamId) => [teamId, { teamId, matchPoints: 0, diff: 0, scored: 0 }])
  );

  for (const { teamAId, teamBId, scoreA, scoreB } of matches) {
    if (scoreA === null || scoreB === null) continue;
    const a = standings.get(teamAId);
    const b = standings.get(teamBId);
    if (!a || !b) continue;

    a.scored += scoreA;
    b.scored += scoreB;
    a.diff += scoreA - scoreB;
    b.diff += scoreB - scoreA;

    if (scoreA > scoreB) a.matchPoints += 3;
    else if (scoreB > scoreA) b.matchPoints += 3;
    else { a.matchPoints += 1; b.matchPoints += 1; }
  }

  return teamIds
    .map((teamId) => standings.get(teamId)!)
    .sort((x, y) => {
      const order = teamIds.indexOf(x.teamId) - teamIds.indexOf(y.teamId);
      return (
        y.matchPoints - x.matchPoints ||
        y.diff - x.diff ||
        y.scored - x.scored ||
        order
      );
    })
    .map((s) => s.teamId);
}
