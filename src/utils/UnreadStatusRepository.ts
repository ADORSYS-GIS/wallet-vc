export class UnreadStatusRepository {
  private dbName = 'UnreadStatusDB';
  private storeName = 'unreadStatus';
  private db: IDBDatabase | null = null;

  constructor() {
    this.initDB();
  }

  private initDB() {
    const request = indexedDB.open(this.dbName, 1);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(this.storeName)) {
        db.createObjectStore(this.storeName, { keyPath: 'contactDid' });
      }
    };

    request.onsuccess = (event) => {
      this.db = (event.target as IDBOpenDBRequest).result;
    };

    request.onerror = (event) => {
      console.error('Error opening IndexedDB:', event);
    };
  }

  private waitForDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeoutDuration = 5000;
      const timeoutId = setTimeout(() => {
        reject(new Error('Database wait timed out after 5 seconds'));
      }, timeoutDuration);

      if (this.db) {
        clearTimeout(timeoutId);
        resolve();
      } else {
        const checkDB = () => {
          if (this.db) {
            clearTimeout(timeoutId);
            resolve();
          } else {
            setTimeout(checkDB, 100);
          }
        };
        checkDB();
      }
    });
  }

  async getUnreadCount(contactDid: string): Promise<number> {
    await this.waitForDB();
    const transaction = this.db!.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);
    const request = store.get(contactDid);

    return new Promise((resolve) => {
      request.onsuccess = () => resolve(request.result?.unreadCount ?? 0);
      request.onerror = () => resolve(0);
    });
  }

  async getLastResetTimestamp(contactDid: string): Promise<number> {
    await this.waitForDB();
    const transaction = this.db!.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);
    const request = store.get(contactDid);

    return new Promise((resolve) => {
      request.onsuccess = () =>
        resolve(request.result?.lastResetTimestamp ?? 0);
      request.onerror = () => resolve(0);
    });
  }

  async setUnreadCount(
    contactDid: string,
    count: number,
    lastResetTimestamp?: number,
  ): Promise<void> {
    await this.waitForDB();
    const transaction = this.db!.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);

    // Fetch lastResetTimestamp if not provided, within the same transaction
    let finalTimestamp = lastResetTimestamp;
    if (finalTimestamp === undefined) {
      const getRequest = store.get(contactDid);
      finalTimestamp = await new Promise<number>((resolve) => {
        getRequest.onsuccess = () =>
          resolve(getRequest.result?.lastResetTimestamp ?? 0);
        getRequest.onerror = () => resolve(0);
      });
    }

    const putRequest = store.put({
      contactDid,
      unreadCount: count,
      lastResetTimestamp: finalTimestamp,
    });

    return new Promise((resolve, reject) => {
      putRequest.onsuccess = () => {
        resolve();
      };
      putRequest.onerror = () => {
        console.error(`Failed to set unread count for ${contactDid}`);
        reject(new Error('Failed to set unread count'));
      };
    });
  }

  async incrementUnreadCount(contactDid: string): Promise<void> {
    await this.waitForDB();
    const transaction = this.db!.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);

    const getRequest = store.get(contactDid);
    const currentCount = await new Promise<number>((resolve) => {
      getRequest.onsuccess = () => resolve(getRequest.result?.unreadCount ?? 0);
      getRequest.onerror = () => resolve(0);
    });

    const putRequest = store.put({
      contactDid,
      unreadCount: currentCount + 1,
      lastResetTimestamp: getRequest.result?.lastResetTimestamp ?? 0,
    });

    return new Promise((resolve, reject) => {
      putRequest.onsuccess = () => resolve();
      putRequest.onerror = () =>
        reject(new Error('Failed to increment unread count'));
    });
  }

  async resetUnreadCount(contactDid: string): Promise<void> {
    await this.setUnreadCount(contactDid, 0, Date.now());
  }
}
