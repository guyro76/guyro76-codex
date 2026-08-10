import { useEffect, useState } from 'react';
import { EMPTY_WALLET, getWallet, type Wallet } from '../lib/wallet';

/**
 * תצוגת הארנק. מתעדכנת גם כשמשהו אחר במסך שינה אותו — דרך אירוע
 * `wallet-changed` שנשלח על ידי `notifyWalletChanged`.
 */
export function notifyWalletChanged(): void {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('wallet-changed'));
}

export default function WalletChip({ profileId }: { profileId?: number }) {
  const [wallet, setWallet] = useState<Wallet>(EMPTY_WALLET);

  useEffect(() => {
    if (!profileId) return;
    let live = true;
    const load = () => {
      void getWallet(profileId).then((w) => {
        if (live) setWallet(w);
      });
    };
    load();
    window.addEventListener('wallet-changed', load);
    return () => {
      live = false;
      window.removeEventListener('wallet-changed', load);
    };
  }, [profileId]);

  if (!profileId) return null;

  return (
    <span className="wallet-chip" aria-label={`בארנק ${wallet.bills} שטרות ו-${wallet.gems} יהלומים`}>
      <span>💵 {wallet.bills}</span>
      <span>💎 {wallet.gems}</span>
    </span>
  );
}
