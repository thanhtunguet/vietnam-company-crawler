import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './User.entity';

@Entity('UserRole')
export class Role {
  @PrimaryGeneratedColumn()
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
