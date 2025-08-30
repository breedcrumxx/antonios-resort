import { headers } from 'next/headers';

export function getLocalIPAddress() {
  return headers().get("host")
}

export const getBaseUrl = () => {
  return process.env.NODE_ENV == "production" ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : `https://${getLocalIPAddress() || process.env.LOCAL}`;
}