import { Injectable, type OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { companyStatusActive, companyStatusInactive } from 'src/_config/seeds';
import { CompanyStatus } from 'src/_entities';
import { DataSource, type Repository } from 'typeorm';

@Injectable()
export class DebugService implements OnModuleInit {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(CompanyStatus)
    private readonly companyStatusRepository: Repository<CompanyStatus>,
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
    try {
      await this.companyStatusRepository.save([
        companyStatusActive,
        companyStatusInactive,
      ]);
    } catch (error) {
      console.error('Error initializing company status:', error);
    }
  }
}
