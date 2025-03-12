import { eventBus } from '@adorsys-gis/event-bus';
import { ServiceResponseStatus } from '@adorsys-gis/status-service';
import {
  DIDIdentityService,
  DidEventChannel,
  SecurityService,
} from 'multiple-did-identities';
import { useEffect, useState } from 'react';
import ShareIdentity from '../../components/identity/ShareIdentity';
import { Identity } from '../../types/Identity';

export default function ShareIdentityPage() {
  const [dids, setDids] = useState<Identity[]>([]);
  const [selectedDid, setSelectedDid] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const securityService = new SecurityService();
  const didIdentityService = new DIDIdentityService(eventBus, securityService);

  useEffect(() => {
    const handleDIDResponse = ({
      status,
      payload,
    }: {
      status: ServiceResponseStatus;
      payload: { did: string }[];
    }) => {
      if (status === ServiceResponseStatus.Success) {
        setDids(payload.map((record) => ({ did: record.did })));
        setErrorMessage(null);
      } else {
        setErrorMessage('An error occurred while fetching DIDs');
      }
    };

    eventBus.on(DidEventChannel.GetPeerContactDidIdentities, handleDIDResponse);
    didIdentityService.findPeerContactDidIdentities();

    return () => {
      eventBus.off(
        DidEventChannel.GetPeerContactDidIdentities,
        handleDIDResponse,
      );
    };
  }, []);
  const handleDidSelect = (selectedDid: string) => {
    setSelectedDid(selectedDid);
  };

  return (
    <div
      style={{
        padding: '16px',
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <ShareIdentity
        identities={dids}
        onDidSelect={handleDidSelect}
        selectedDid={selectedDid}
      />
      {errorMessage && (
        <div style={{ color: 'red', fontWeight: 'bold' }}>{errorMessage}</div>
      )}
    </div>
  );
}
