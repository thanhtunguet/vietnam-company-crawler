import { Injectable, type OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs/promises';
import { companyStatusActive, companyStatusInactive } from 'src/_config/seeds';
import { CompanyStatus, District, Province, Ward } from 'src/_entities';
import { DataSource, In, type Repository } from 'typeorm';

@Injectable()
export class DebugService implements OnModuleInit {
  constructor(
    private readonly configService: ConfigService,

    private readonly dataSource: DataSource,

    @InjectRepository(CompanyStatus)
    private readonly companyStatusRepository: Repository<CompanyStatus>,

    @InjectRepository(Province)
    private readonly provinceRepository: Repository<Province>,

    @InjectRepository(District)
    private readonly districtRepository: Repository<District>,

    @InjectRepository(Ward)
    private readonly wardRepository: Repository<Ward>,
  ) {}

  onModuleInit() {
    if (process.env.NODE_ENV === 'development') {
      const metadata = this.dataSource.entityMetadatas;
      metadata.forEach((entity) => {
        entity.columns.forEach((col) => {
          if (col.onUpdate) {
            console.log(
              `❗ Column ${entity.name}.${col.propertyName} has onUpdate = ${col.onUpdate}`,
            );
          }
        });
      });
    }
    this.initDatabase();
  }

  async initDatabase() {
    if (this.configService.get<boolean>('DB_SYNCHRONIZE')) {
      await this.initCompanyStatus();
      await this.initProvinces();
      await this.initDistricts();
      await this.initWards();
    }
  }

  protected async initCompanyStatus() {
    try {
      const companyStatuses = [companyStatusActive, companyStatusInactive];
      const ids = companyStatuses.map((status) => status.id);
      const existingStatuses = await this.companyStatusRepository.find({
        where: { id: In(ids) },
      });
      const existingStatusMap = Object.fromEntries(
        existingStatuses.map((status) => [status.id, status]),
      );
      const statusesToSave = companyStatuses.filter(
        (status) => !existingStatusMap[status.id],
      );

      await this.companyStatusRepository.save(statusesToSave);
      console.log('Company status initialized successfully.');
    } catch (error) {
      console.error('Error initializing company status:', error);
    }
  }

  protected async initProvinces() {
    try {
      const filePath = './dvhc/provinces.csv';
      const content = (await fs.readFile(filePath, 'utf8')).trim();
      const rows = content.split('\n').filter(Boolean);

      if (rows.length <= 1) {
        console.log('No province data found or only header row exists.');
        return;
      }

      const dataRows = rows[0].toLowerCase().startsWith('id,name')
        ? rows.slice(1)
        : rows;

      const provinces = dataRows.map((row) => {
        const [id, name, englishName, type] = row.split(',');
        return {
          id: Number(id),
          code: id,
          name,
          englishName: englishName || null,
          type: type || null,
        };
      });

      const existingProvinces = await this.provinceRepository.find({
        where: { id: In(provinces.map((p) => p.id)) },
      });

      const existingProvinceMap = Object.fromEntries(
        existingProvinces.map((province) => [province.id, province]),
      );

      const provincesToSave = provinces.filter(
        (province) => !existingProvinceMap[province.id],
      );

      await this.provinceRepository.save(provincesToSave);
      console.log('Provinces initialized successfully.');
    } catch (error) {
      console.error('Error initializing provinces:', error);
    }
  }

  /**
   * Split array into chunks of specified size
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  protected async initDistricts() {
    try {
      const filePath = './dvhc/districts.csv';
      const content = (await fs.readFile(filePath, 'utf8')).trim();
      const rows = content.split('\n').filter(Boolean);

      if (rows.length <= 1) {
        console.log('No district data found or only header row exists.');
        return;
      }

      const dataRows = rows[0].toLowerCase().startsWith('id,name')
        ? rows.slice(1)
        : rows;

      const districts = dataRows.map((row) => {
        const [id, name, englishName, type, provinceId, provinceName] =
          row.split(',');
        return {
          id: Number(id),
          name,
          code: id,
          englishName: englishName || null,
          type: type || null,
          provinceId: Number(provinceId),
          provinceName: provinceName || null,
        };
      });

      const existingDistricts = await this.districtRepository.find({
        where: { id: In(districts.map((d) => d.id)) },
      });

      const existingDistrictMap = Object.fromEntries(
        existingDistricts.map((district) => [district.id, district]),
      );

      const districtsToSave = districts.filter(
        (district) => !existingDistrictMap[district.id],
      );

      // Process districts in chunks of 100
      const districtChunks = this.chunkArray(districtsToSave, 30);
      let savedCount = 0;

      for (const [index, chunk] of districtChunks.entries()) {
        await this.districtRepository.save(chunk);
        savedCount += chunk.length;
        console.log(
          `Districts chunk ${index + 1}/${
            districtChunks.length
          } saved (${savedCount}/${districtsToSave.length})`,
        );
      }

      console.log('Districts initialized successfully.');
    } catch (error) {
      console.error('Error initializing districts:', error);
    }
  }

  protected async initWards() {
    try {
      const filePath = './dvhc/wards.csv';
      const content = (await fs.readFile(filePath, 'utf8')).trim();
      const rows = content.split('\n').filter(Boolean);

      const dataRows = rows[0].toLowerCase().startsWith('id,name')
        ? rows.slice(1)
        : rows;

      const wards = dataRows
        .map((row) => {
          const columns = row.split(',');
          if (columns.length >= 8) {
            const [
              id,
              name,
              englishName,
              type,
              districtId,
              districtName,
              provinceId,
              provinceName,
            ] = columns;
            return {
              id: Number(id),
              name,
              code: id,
              englishName: englishName || null,
              type: type || null,
              districtId: Number(districtId),
              districtName: districtName || null,
              provinceId,
              provinceName: provinceName || null,
            };
          }
          return null;
        })
        .filter(Boolean);

      const chunkSize = 100;

      for (let i = 0; i < wards.length; i += chunkSize) {
        const chunk = wards.slice(i, i + chunkSize);

        const existingWards = await this.wardRepository.find({
          where: { id: In(chunk.map((w) => w.id)) },
        });

        const existingWardMap = Object.fromEntries(
          existingWards.map((ward) => [ward.id, ward]),
        );

        const wardsToSave = chunk.filter((ward) => !existingWardMap[ward.id]);

        try {
          await this.wardRepository.save(wardsToSave);
          console.log(
            `Wards chunk ${Math.floor(i / chunkSize) + 1}/${Math.ceil(
              wards.length / chunkSize,
            )} saved (${i + chunk.length}/${wards.length})`,
          );
        } catch (error) {
          console.error(`Error saving chunk of wards: ${error}`, error);
        }

        console.log('Wards initialized successfully.');
      }
    } catch (error) {
      console.error('Error initializing wards:', error);
    }
  }
}
