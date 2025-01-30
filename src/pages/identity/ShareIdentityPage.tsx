import { eventBus } from '@adorsys-gis/event-bus';
import {
  DIDIdentityService,
  DidEventChannel,
  SecurityService,
} from '@adorsys-gis/multiple-did-identities';
import { ServiceResponseStatus } from '@adorsys-gis/status-service';
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
    const handleDIDResponse = (eventData: {
      status: ServiceResponseStatus;
      payload: { did: string }[];
    }) => {
      const { status, payload } = eventData;

      if (status === ServiceResponseStatus.Success) {
        const didList: Identity[] = payload.map((record) => ({
          did: record.did,
        }));
        setDids(didList);
        setErrorMessage(null);
      } else {
        const errorMessage =
          payload.length > 0
            ? 'An error occurred while fetching DIDs'
            : 'Unknown error';
        setErrorMessage(`Error: ${errorMessage}`);
      }
    };

    const fetchDID = () => {
      didIdentityService.findAllDidIdentities(); // Trigger the service to fetch DIDs
    };

    // Register event listener
    eventBus.on(DidEventChannel.GetAllDidIdentities, handleDIDResponse);

    fetchDID(); // Fetch DIDs when the component mounts

    // Cleanup listener on component unmount
    return () => {
      eventBus.off(DidEventChannel.GetAllDidIdentities, handleDIDResponse);
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
