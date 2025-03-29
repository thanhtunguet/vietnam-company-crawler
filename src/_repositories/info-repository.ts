import { Injectable } from '@nestjs/common';
import { Axios, Repository } from 'react3l';
import { CRAWLER_LOCAL_IPS, SOURCE_URL } from 'src/_config/dotenv';
import { httpConfig } from '../_config/repository';
import { AxiosRequestConfig } from 'axios';
import * as http from 'http';
import * as https from 'https';
import { generateRandomUserAgent } from 'src/_helpers/user-agent';

@Injectable()
export class InfoRepository extends Repository {
  private agents = CRAWLER_LOCAL_IPS.map(
    (ip): AxiosRequestConfig => ({
      headers: {
        Referer: SOURCE_URL,
        Origin: SOURCE_URL,
        UserAgent: generateRandomUserAgent(),
      },
      baseURL: SOURCE_URL,
      httpAgent: new http.Agent({
        localAddress: ip,
      }),
      httpsAgent: new https.Agent({
        localAddress: ip,
      }),
    }),
  );

  private get axios() {
    const randomIndex = Math.floor(Math.random() * this.agents.length);
    return Axios.create(this.agents[randomIndex]);
  }

  constructor() {
    super(httpConfig);
    this.baseURL = SOURCE_URL;
  }

  public readonly company = (companyURL: string) => {
    return this.axios
      .get(`/thong-tin/${companyURL}.html`)
      .pipe(Repository.responseDataMapper<string>());
  };

  public readonly province = (province: string, page = 1) => {
    const url: string = page > 1 ? `/trang-${page}/` : '/';
    return this.axios
      .get(`/${province}${url}`)
      .pipe(Repository.responseDataMapper<string>());
  };

  public readonly district = (province: string, district: string, page = 1) => {
    const pagePath = page > 1 ? `/trang-${page}/` : '/';
    return this.axios
      .get(`/${province}/${district}${pagePath}`)
      .pipe(Repository.responseDataMapper<string>());
  };

  public readonly index = () => {
    return this.axios.get(`/`).pipe(Repository.responseDataMapper<string>());
  };

  public readonly favicon = () => {
    return this.axios
      .get(`/favicon.ico`)
      .pipe(Repository.responseDataMapper<string>());
  };

  public readonly crawlPage = (url: string) => {
    return this.axios.get(url).pipe(Repository.responseDataMapper<string>());
  };
}
