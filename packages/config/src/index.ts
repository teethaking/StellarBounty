export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  backendUrl: process.env.BACKEND_URL || 'http://localhost:4000',
  stellarNetwork: process.env.STELLAR_NETWORK || 'testnet',
};
