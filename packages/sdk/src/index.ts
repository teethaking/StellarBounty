export interface WalletConnectResult {
  publicKey: string;
  signature: string;
}

export async function connectFreighter() {
  if (typeof window === 'undefined') {
    throw new Error('Freighter integration must run in the browser.');
  }

  const freighter = (window as any).freighter;
  if (!freighter) {
    throw new Error('Freighter wallet is not installed.');
  }

  return freighter.connect();
}
