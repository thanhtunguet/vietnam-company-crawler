import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Role, UserRole } from './UserRole.entity';

@Entity('User')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  googleId: string;

  @Column({
    type: 'simple-array',
    default: UserRole.USER,
  })
  roles: UserRole[];

  roleObjects: Role[];

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'datetime2', default: () => 'GETDATE()' })
  createdAt: Date;

  @Column({ type: 'datetime2', default: () => 'GETDATE()' })
  updatedAt: Date;

  @Column({ type: 'datetime2', nullable: true })
  deletedAt?: Date;

  @Column({ type: 'datetime2', nullable: true })
  lastLogin: Date;
}
