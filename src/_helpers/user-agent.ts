import { faker } from '@faker-js/faker';

type OS =
  | 'Windows'
  | 'Ubuntu'
  | 'Linux Mint'
  | 'Fedora'
  | 'Redhat'
  | 'CentOS'
  | 'Debian'
  | 'Arch Linux'
  | 'Alpine Linux'
  | 'MacOS'
  | 'iPadOS'
  | 'iPhoneOS'
  | 'Android';

type Browser = 'Chrome' | 'Firefox' | 'Edge' | 'Safari' | 'Brave' | 'Opera';

const osVersions: Record<OS, string[]> = {
  Windows: ['7', '10', '11'],
  Ubuntu: ['20.04', '22.04', '23.10', '24.04', '24.10'],
  'Linux Mint': ['20', '21.1', '21.2'],
  Fedora: ['36', '37', '38'],
  Redhat: ['8', '9'],
  CentOS: ['7', '8'],
  Debian: ['10', '11', '12'],
  'Arch Linux': ['rolling'],
  'Alpine Linux': ['3.17', '3.18', '3.19'],
  MacOS: ['11.6', '12.7', '13.6', '14.2'],
  iPadOS: ['15.7', '16.6', '17.4'],
  iPhoneOS: ['14.8', '15.6', '16.5', '17.3'],
  Android: ['10', '11', '12', '13', '14', '15'],
};

const browsers: Browser[] = [
  'Chrome',
  'Firefox',
  'Edge',
  'Safari',
  'Brave',
  'Opera',
];

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateRandomUserAgent(): string {
  const os = getRandomItem(Object.keys(osVersions) as OS[]);
  const osVersion = getRandomItem(osVersions[os]);
  const browser = getRandomItem(browsers);
  const browserVersion = faker.system.semver();

  // Templates per browser
  switch (browser) {
    case 'Chrome':
    case 'Brave':
    case 'Opera':
      return `Mozilla/5.0 (${os} ${osVersion}) AppleWebKit/537.36 (KHTML, like Gecko) ${browser}/${browserVersion} Safari/537.36`;
    case 'Edge':
      return `Mozilla/5.0 (${os} ${osVersion}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${browserVersion} Safari/537.36 Edg/${browserVersion}`;
    case 'Firefox':
      return `Mozilla/5.0 (${os} ${osVersion}; rv:${browserVersion}) Gecko/20100101 Firefox/${browserVersion}`;
    case 'Safari':
      if (os === 'iPadOS' || os === 'iPhoneOS') {
        return `Mozilla/5.0 (iPhone; CPU iPhone OS ${osVersion.replace(
          /\./g,
          '_',
        )} like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/${browserVersion} Mobile/15E148 Safari/604.1`;
      } else {
        return `Mozilla/5.0 (Macintosh; Intel Mac OS X ${osVersion.replace(
          /\./g,
          '_',
        )}) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/${browserVersion} Safari/605.1.15`;
      }
    default:
      return `Mozilla/5.0 (${os} ${osVersion}) ${browser}/${browserVersion}`;
  }
}
