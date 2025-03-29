import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { ApiUsageTracking } from './ApiUsageTracking';
import { Users } from './Users';

@Index('IX_ApiKeys_UserId', ['userId'], {})
@Index('PK__ApiKeys__3214EC0729A82B89', ['id'], { unique: true })
@Index('UQ__ApiKeys__A4E6E186EFCF8AD2', ['apiKey'], { unique: true })
@Entity('ApiKeys', { schema: 'dbo' })
export class ApiKeys {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'Id' })
  id: number;

  @Column('bigint', { name: 'UserId' })
  userId: number;

  @Column('nvarchar', { name: 'ApiKey', unique: true, length: 64 })
  apiKey: string;

  @Column('nvarchar', {
    name: 'Plan',
    nullable: true,
    length: 50,
    default: () => "'free'",
  })
  plan: string | null;

  @Column('int', {
    name: 'RequestLimit',
    nullable: true,
    default: () => '(500)',
  })
  requestLimit: number | null;

  @Column('int', { name: 'RequestsUsed', nullable: true, default: () => '(0)' })
  requestsUsed: number | null;

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

  user: Users;

  apiUsageTrackings: ApiUsageTracking[];
}
