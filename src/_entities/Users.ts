import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { ApiKeys } from './ApiKeys';

@Index('PK__Users__3214EC07B4EC9CC8', ['id'], { unique: true })
@Index('UQ__Users__A9D10534BC442831', ['email'], { unique: true })
@Entity('Users', { schema: 'dbo' })
export class Users {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'Id' })
  id: number;

  @Column('varchar', { name: 'Email', unique: true, length: 255 })
  email: string;

  @Column('varchar', { name: 'PasswordHash', length: 255 })
  passwordHash: string;

  @Column('varchar', { name: 'Name', nullable: true, length: 255 })
  name: string | null;

  @Column('bit', { name: 'IsActive', nullable: true, default: () => '(1)' })
  isActive: boolean | null;

  @Column('datetime2', {
    name: 'CreatedAt',
    nullable: true,
    default: () => 'getdate()',
  })
  createdAt: Date | null;

  @Column('datetime2', {
    name: 'UpdatedAt',
    nullable: true,
    default: () => 'getdate()',
  })
  updatedAt: Date | null;

  apiKeys: ApiKeys[];
}
