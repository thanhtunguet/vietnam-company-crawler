import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { ApiKeys } from './ApiKeys';

@Index('IX_ApiUsageTracking_ApiKeyId', ['apiKeyId'], {})
@Index('PK__ApiUsage__3214EC0753F6C0B6', ['id'], { unique: true })
@Entity('ApiUsageTracking', { schema: 'dbo' })
export class ApiUsageTracking {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'Id' })
  id: number;

  @Column('bigint', { name: 'ApiKeyId' })
  apiKeyId: number;

  @Column('nvarchar', { name: 'Endpoint', nullable: true, length: 255 })
  endpoint: string | null;

  @Column('int', { name: 'ResponseTime', nullable: true })
  responseTime: number | null;

  @Column('int', { name: 'StatusCode', nullable: true })
  statusCode: number | null;

  @Column('datetime2', {
    name: 'CalledAt',
    nullable: true,
    default: () => 'getdate()',
  })
  calledAt: Date | null;

  apiKey: ApiKeys;
}
