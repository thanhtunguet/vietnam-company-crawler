import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiKeys } from './ApiKeys';

@Index('api_key_id', ['apiKeyId'], {})
@Entity('api_usage_tracking', { schema: 'NEW_TTDN' })
export class ApiUsageTracking {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id: number;

  @Column('bigint', { name: 'api_key_id' })
  apiKeyId: number;

  @Column('varchar', { name: 'endpoint', nullable: true, length: 255 })
  endpoint: string | null;

  @Column('int', { name: 'response_time', nullable: true })
  responseTime: number | null;

  @Column('int', { name: 'status_code', nullable: true })
  statusCode: number | null;

  @Column('datetime', {
    name: 'called_at',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  calledAt: Date | null;

  apiKey: ApiKeys;
}
