import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { ApiUsageTracking } from './ApiUsageTracking';
import { Users } from './Users';

@Index('apiKey', ['apiKey'], { unique: true })
@Index('user_id', ['userId'], {})
@Entity('api_keys', { schema: 'NEW_TTDN' })
export class ApiKeys {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id: number;

  @Column('bigint', { name: 'user_id' })
  userId: number;

  @Column('char', { name: 'apiKey', unique: true, length: 64 })
  apiKey: string;

  @Column('varchar', {
    name: 'plan',
    nullable: true,
    length: 50,
    default: () => "'free'",
  })
  plan: string | null;

  @Column('int', {
    name: 'request_limit',
    nullable: true,
    default: () => "'500'",
  })
  requestLimit: number | null;

  @Column('int', {
    name: 'requests_used',
    nullable: true,
    default: () => "'0'",
  })
  requestsUsed: number | null;

  @Column('tinyint', {
    name: 'is_active',
    nullable: true,
    width: 1,
    default: () => "'1'",
  })
  isActive: boolean | null;

  @Column('datetime', {
    name: 'created_at',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date | null;

  @Column('datetime', {
    name: 'updated_at',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date | null;

  apiUsageTrackings: ApiUsageTracking[];

  user: Users;
}
