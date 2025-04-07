import axios, { AxiosInstance } from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { SocksProxyAgent } from 'socks-proxy-agent';
import { axiosBaseConfig } from 'src/_config/axios';
import { retryRequest } from 'src/_helpers/retry';

export class CrawlerHttpClient {
  protected proxyIndex = 0;

  constructor(
    private readonly baseUrl: string,
    private readonly proxyList: string[],
    private readonly maxRetries = 3,
  ) {}

  private createAxiosWithProxy(): AxiosInstance {
    let agent;

    const proxyUrl = this.rotateProxy();

    if (proxyUrl.startsWith('socks')) {
      agent = new SocksProxyAgent(proxyUrl);
    } else {
      agent = new HttpsProxyAgent(proxyUrl);
    }

    return axios.create({
      ...axiosBaseConfig,
      baseURL: this.baseUrl,
      httpsAgent: agent,
      httpAgent: agent,
      timeout: 10000,
    });
  }

  private rotateProxy(): string {
    const proxy = this.proxyList[this.proxyIndex];
    this.proxyIndex = (this.proxyIndex + 1) % this.proxyList.length;
    return proxy;
  }

  public async get(url: string): Promise<string> {
    return retryRequest(
      () =>
        this.createAxiosWithProxy()
          .get(url)
          .then((response) => response.data),
      this.maxRetries,
    );
  }
}
