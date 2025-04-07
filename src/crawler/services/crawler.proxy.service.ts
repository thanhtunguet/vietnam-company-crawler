import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { SocksProxyAgent } from 'socks-proxy-agent';
import { generateRandomUserAgent } from 'src/_helpers/user-agent';

@Injectable()
export class CrawlerProxyService implements OnModuleInit {
  onModuleInit() {
    const proxies = this.configService.get<string[]>('CRAWLER_PROXIES');
    if (proxies.length === 0) {
      throw new Error('No proxies provided in configuration');
    }
    this.proxyList = proxies;
  }

  public proxyList: string[];

  private currentIndex = 0;

  constructor(private readonly configService: ConfigService) {}

  private getNextProxy(): string {
    const proxy = this.proxyList[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.proxyList.length;
    return proxy;
  }

  private createAxiosInstance(proxyUrl: string): AxiosInstance {
    const agent = proxyUrl.startsWith('socks')
      ? new SocksProxyAgent(proxyUrl)
      : new HttpsProxyAgent(proxyUrl);

    return axios.create({
      httpAgent: agent,
      httpsAgent: agent,
      timeout: 10000,
      headers: {
        'User-Agent': generateRandomUserAgent(),
      },
    });
  }

  public async get<T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const proxy = this.getNextProxy();
    const client = this.createAxiosInstance(proxy);
    try {
      const response = await client.get<T>(url, config);
      return response.data;
    } catch (err) {
      console.error(
        `Request failed with proxy ${proxy}:`,
        (err as Error).message,
      );
      throw err;
    }
  }

  public async post<T = any>(
    url: string,
    data: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const proxy = this.getNextProxy();
    const client = this.createAxiosInstance(proxy);
    try {
      const response = await client.post<T>(url, data, config);
      return response.data;
    } catch (err) {
      console.error(`POST failed with proxy ${proxy}:`, (err as Error).message);
      throw err;
    }
  }
}
