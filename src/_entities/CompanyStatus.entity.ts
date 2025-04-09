import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Company } from './Company.entity';

@Entity('CompanyStatus')
export class CompanyStatus {
  @PrimaryGeneratedColumn()
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
