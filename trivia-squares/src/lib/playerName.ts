/** Local identity is edited by the player, never silently replaced by an older remote profile. */
export function normalizedPlayerName(raw: string): string {
  return raw.trim().slice(0, 32);
}

export function validPlayerName(raw: string | null | undefined): boolean {
  if(typeof raw!=='string')return false;
  const value=normalizedPlayerName(raw);
  return value.length>=2 && value!=='שחקן';
}

export function selectPlayerName(local: string | null | undefined, remote: string | null | undefined): string | null {
  if(validPlayerName(local))return normalizedPlayerName(local!);
  if(validPlayerName(remote))return normalizedPlayerName(remote!);
  return null;
}
