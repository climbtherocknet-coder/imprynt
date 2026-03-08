'use client';

import { useState } from 'react';
import StatusTagPicker from './StatusTagPicker';

interface Props {
  initialTags: string[];
  initialColor?: string | null;
  isPaid: boolean;
}

export default function DashboardStatusButton({ initialTags, initialColor, isPaid }: Props) {
  const [showModal, setShowModal] = useState(false);

  const dotColor = initialTags.length > 0 && initialColor ? initialColor : 'var(--text-muted, #5d6370)';

  return (
    <>
      <button className="dash-top-btn dash-top-btn--filled" onClick={() => setShowModal(true)}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: dotColor, display: 'inline-block' }} />
        Status
      </button>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Status</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>{'\u2715'}</button>
            </div>
            <StatusTagPicker initialTags={initialTags} initialColor={initialColor} isPaid={isPaid} />
          </div>
        </div>
      )}
    </>
  );
}
