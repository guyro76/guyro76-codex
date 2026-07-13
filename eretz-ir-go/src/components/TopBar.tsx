import { useApp, type Screen } from '../store/appStore';

export default function TopBar({ title, back = 'home' }: { title: string; back?: Screen | null }) {
  const navigate = useApp((s) => s.navigate);
  return (
    <div className="topbar">
      {back && (
        <button className="btn-ghost btn-small" aria-label="חזרה" onClick={() => navigate(back)}>
          → חזרה
        </button>
      )}
      <h2>{title}</h2>
    </div>
  );
}
