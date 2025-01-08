import QRCodeGenerator from '../components/qrcodegenerator/QRCodeGenerator';
import { identities } from '../mock/identities';

export default function QRCodeGeneratorPage() {
  return (
    <div style={{ padding: '16px', display: 'flex', justifyContent: 'center' }}>
      <QRCodeGenerator identities={identities} />
    </div>
  );
}
