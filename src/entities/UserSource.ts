import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User';

@Entity()
export class UserSource {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  source_url: string;

  @Column({ default: true })
  enabled: boolean;

  @Column({ nullable: true })
  source_name: string;

  @Column({ nullable: true })
  source_type: string; // 'rss' | 'scraping'

  @ManyToOne(() => User, user => user.sources)
  user: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
} 