import { Column, Entity, PrimaryColumn } from 'typeorm';
import { Company } from './Company.entity';

@Entity('CompanyStatus')
export class CompanyStatus {
  @PrimaryColumn({ type: 'bigint', name: 'Id' })
  id: number;

  @Column('nvarchar', { name: 'Name', length: 100 })
  name: string;

  @Column('nvarchar', { name: 'Code', length: 100 })
  code: string;

  @Column('nvarchar', { name: 'EnglishName', length: 100, nullable: true })
  englishName: string;

  // Relationships (defined in index.ts)
  companies?: Company[];
}
