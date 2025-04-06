import { AxiosRequestConfig } from 'axios';
import { generateRandomUserAgent } from 'src/_helpers/user-agent';

export const axiosBaseConfig: AxiosRequestConfig = {
  headers: {
    'User-Agent': generateRandomUserAgent(),
  },
};
