import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './User.entity';

@Entity('Role')
export class Role {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'Id' })
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  users: User[];
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
}
