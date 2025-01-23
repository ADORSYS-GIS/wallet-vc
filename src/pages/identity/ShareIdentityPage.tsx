import React, { useState } from 'react';
import ShareIdentity from '../../components/identity/ShareIdentity';
import DisplayDID from './DisplayDiD';

export default function ShareIdentityPage() {
  const [did, setDid] = useState<string | null>(null);

  return (
    <div style={{ padding: '16px', display: 'flex', justifyContent: 'center' }}>
      <DisplayDID
        onDidRetrieved={(newDid) => setDid(newDid)}
      />
      {did && <ShareIdentity identities={[{ did }]} />}
    </div>
  );
}
