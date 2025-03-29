import * as os from 'os';

export function getAvailableLocalIPs(): string[] {
  const interfaces = os.networkInterfaces();
  const available: string[] = [];

  for (const iface of Object.values(interfaces)) {
    for (const entry of iface || []) {
      if (
        entry.family === 'IPv4' &&
        !entry.internal &&
        entry.address !== '127.0.0.1'
      ) {
        available.push(entry.address);
      }
    }
  }
  return available;
}
