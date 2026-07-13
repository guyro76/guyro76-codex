import { useApp } from '../store/appStore';
import { useGame } from '../store/gameStore';
import { say } from '../lib/persona';

/** מסך מעבר תורות בדו-קרב על אותו מכשיר — מסתיר את תשובות השחקן הקודם */
export default function PassDevice() {
  const { navigate } = useApp();
  const players = useGame((s) => s.players);
  const currentPlayerIdx = useGame((s) => s.currentPlayerIdx);
  const continueToNextPlayer = useGame((s) => s.continueToNextPlayer);

  const next = players[currentPlayerIdx + 1];
  if (!next) {
    navigate('home');
    return null;
  }

  return (
    <div className="screen center" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ fontSize: '4rem' }} aria-hidden>
        🔄
      </div>
      <h1>עכשיו התור של {next.profile.name}!</h1>
      <p className="dim">מעבירים את המכשיר... בלי להציץ בתשובות! 🙈</p>
      <div className="avatar-big" style={{ margin: '16px auto', borderColor: next.profile.color }}>
        {next.profile.avatar}
      </div>
      <button
        className="btn-primary"
        style={{ fontSize: '1.2rem', padding: '14px 40px' }}
        onClick={() => {
          continueToNextPlayer();
          navigate('game');
        }}
      >
        {next.profile.name}, {say('ready', next.profile.gender)} 🚀
      </button>
    </div>
  );
}
