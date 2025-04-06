import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from 'src/_entities';
import { Repository } from 'typeorm';
import { InfoDoanhNghiepAdapter } from './adapters/infodoanhnghiep.adapter';

@Injectable()
export class CrawlerService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    private readonly infoDoanhNghiepAdapter: InfoDoanhNghiepAdapter,
  ) {}
}
