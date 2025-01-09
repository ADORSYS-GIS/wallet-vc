import ShareIdentity from '../components/identity/ShareIdentity';
import { identities } from '../mock/identities';

export default function ShareIdentityPage() {
  return (
    <div style={{ padding: '16px', display: 'flex', justifyContent: 'center' }}>
      <ShareIdentity identities={identities} />
    </div>
  );
}
