import { useApp } from '../store/appStore';
import TopBar from '../components/TopBar';

export default function Profiles() {
  const { profiles, selectProfile, navigate, setEditingProfile } = useApp();

  return (
    <div className="screen">
      <TopBar title="מי משחק היום?" back="splash" />
      <div className="grid grid-2">
        {profiles.map((p) => (
          <div
            key={p.id}
            className="card clickable center"
            role="button"
            tabIndex={0}
            onClick={() => {
              selectProfile(p);
              navigate('home');
            }}
            onKeyDown={(ev) => {
              if (ev.key === 'Enter') {
                selectProfile(p);
                navigate('home');
              }
            }}
          >
            <div className="avatar-big" style={{ margin: '0 auto', borderColor: p.color }}>
              {p.avatar}
            </div>
            <h3>{p.name}</h3>
            <p className="dim" style={{ margin: 0 }}>
              {p.wins} ניצחונות · {p.gamesPlayed} משחקים
            </p>
            <button
              className="btn-small btn-ghost"
              onClick={(ev) => {
                ev.stopPropagation();
                setEditingProfile(p.id ?? null);
                navigate('profile-edit');
              }}
            >
              ✏️ עריכה
            </button>
          </div>
        ))}
        <div
          className="card clickable center"
          role="button"
          tabIndex={0}
          onClick={() => {
            setEditingProfile(null);
            navigate('profile-edit');
          }}
        >
          <div className="avatar-big" style={{ margin: '0 auto' }}>
            ➕
          </div>
          <h3>שחקן חדש</h3>
          <p className="dim">בלי אימייל, בלי חשבון — הכול נשמר רק במכשיר</p>
        </div>
      </div>
    </div>
  );
}
