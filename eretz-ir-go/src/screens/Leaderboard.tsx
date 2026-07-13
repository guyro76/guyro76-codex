import { useEffect, useState } from 'react';
import TopBar from '../components/TopBar';
import { db } from '../db/db';
import type { MatchRecord, Profile } from '../types';

type Range = 'today' | 'week' | 'month' | 'all';

export default function Leaderboard() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [range, setRange] = useState<Range>('all');

  useEffect(() => {
    void db.profiles.toArray().then(setProfiles);
    void db.matches.toArray().then(setMatches);
  }, []);

  const since = (() => {
    const now = new Date();
    if (range === 'today') now.setHours(0, 0, 0, 0);
    else if (range === 'week') now.setDate(now.getDate() - 7);
    else if (range === 'month') now.setMonth(now.getMonth() - 1);
    else return null;
    return now.toISOString();
  })();

  const inRange = matches.filter((m) => !since || m.playedAt >= since);

  const rows = profiles
    .map((p) => {
      const mine = inRange.filter((m) => m.playerIds.includes(p.id ?? -2));
      const score = mine.reduce((sum, m) => {
        const idx = m.playerIds.indexOf(p.id ?? -2);
        return sum + (m.scores[idx] ?? 0);
      }, 0);
      const wins = mine.filter((m) => m.winnerName === p.name && !m.coop).length;
      return {
        p,
        score: range === 'all' ? p.totalScore : score,
        wins: range === 'all' ? p.wins : wins,
        games: range === 'all' ? p.gamesPlayed : mine.length,
        accuracy: p.totalAnswers > 0 ? Math.round((p.correctAnswers / p.totalAnswers) * 100) : 0,
        originality: p.correctAnswers > 0 ? Math.round(p.originalitySum / p.correctAnswers) : 0
      };
    })
    .sort((a, b) => b.score - a.score);

  return (
    <div className="screen">
      <TopBar title="🏆 לוח השיאים המשפחתי" />
      <div className="row" style={{ marginBottom: 12 }}>
        {(
          [
            ['today', 'היום'],
            ['week', 'השבוע'],
            ['month', 'החודש'],
            ['all', 'כל הזמנים']
          ] as [Range, string][]
        ).map(([r, label]) => (
          <button key={r} className={`chip${range === r ? ' on' : ''}`} onClick={() => setRange(r)}>
            {label}
          </button>
        ))}
      </div>

      {rows.map((row, i) => (
        <div key={row.p.id} className="card" style={{ marginBottom: 10 }}>
          <div className="row spread">
            <span style={{ fontSize: '1.1rem' }}>
              {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`} {row.p.avatar} <strong>{row.p.name}</strong>
            </span>
            <strong className="gold" style={{ fontSize: '1.2rem' }}>
              {row.score} נק׳
            </strong>
          </div>
          <p className="dim" style={{ margin: '6px 0 0', fontSize: '0.88rem' }}>
            🏅 {row.wins} ניצחונות · 🎮 {row.games} משחקים · 🎯 {row.accuracy}% דיוק · ✨ {row.originality}% מקוריות · 🔥 רצף{' '}
            {row.p.dailyStreak}
          </p>
        </div>
      ))}

      <div className="card dim" style={{ fontSize: '0.88rem' }}>
        🌐 לוח תוצאות מקוון (אנונימי, באישור הורה) יופעל כאשר יוגדר שרת — ראו "משחק בשני מכשירים" בתפריט המצבים. הלוח
        המשפחתי עובד תמיד, גם בלי אינטרנט.
      </div>
    </div>
  );
}
