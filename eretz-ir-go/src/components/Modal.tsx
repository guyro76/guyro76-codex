import type { ReactNode } from 'react';

export default function Modal({ children, onClose }: { children: ReactNode; onClose?: () => void }) {
  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal" onClick={(ev) => ev.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
