import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './User';

@Entity()
export class ScheduledSummary {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  article_title: string;

  @Column()
  article_url: string;

  @Column('text')
  summary: string;

  @Column()
  sentiment: string;

  @Column({ nullable: true })
  source_name: string;

  @ManyToOne(() => User, user => user.scheduled_summaries)
  user: User;

  @CreateDateColumn()
  created_at: Date;
} 