import { Column, Entity, Index } from 'typeorm';

@Index('Code', ['code'], { unique: true })
@Index('Province_pk2', ['code'], { unique: true })
@Index('Province_Id_Code_Name_index', ['id', 'code', 'name'], {})
@Entity('Province', { schema: 'TTDN' })
export class Province {
  @Column('bigint', { primary: true, name: 'Id' })
  id: number;

  @Column('varchar', {
    name: 'Code',
    nullable: true,
    unique: true,
    length: 100,
  })
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

  @Column('varchar', { name: 'EnglishName', nullable: true, length: 500 })
  englishName: string | null;

  @Column('varchar', { name: 'Slug', nullable: true, length: 255 })
  slug: string | null;
}
