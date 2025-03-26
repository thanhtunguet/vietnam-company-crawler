import { Column, Entity, Index } from 'typeorm';

@Index('Ward_Id_Code_Name_index', ['id', 'code', 'name'], {})
@Entity('Ward', { schema: 'TTDN' })
export class Ward {
  @Column('bigint', { primary: true, name: 'Id' })
  id: number;

  @Column('varchar', { name: 'Code', nullable: true, length: 100 })
  code: string | null;

  @Column('varchar', { name: 'Name', nullable: true, length: 500 })
  name: string | null;

  @Column('varchar', { name: 'Type', nullable: true, length: 500 })
  type: string | null;

  @Column('datetime', {
    name: 'CreatedAt',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date | null;

  @Column('datetime', {
    name: 'UpdatedAt',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date | null;

  @Column('datetime', { name: 'DeletedAt', nullable: true })
  deletedAt: Date | null;

  @Column('varchar', { name: 'DistrictName', nullable: true, length: 500 })
  districtName: string | null;

  @Column('varchar', { name: 'ProvinceName', nullable: true, length: 500 })
  provinceName: string | null;

  @Column('varchar', { name: 'EnglishName', nullable: true, length: 500 })
  englishName: string | null;

  @Column('bigint', { name: 'DistrictId', nullable: true })
  districtId: number | null;

  @Column('bigint', { name: 'ProvinceId', nullable: true })
  provinceId: number | null;

  @Column('varchar', { name: 'Slug', nullable: true, length: 255 })
  slug: string | null;
}
