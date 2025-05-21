import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { SavedArticle } from './SavedArticle';
import { UserSource } from './UserSource';
import { ScheduledSummary } from './ScheduledSummary';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password_hash: string;

  @OneToMany(() => SavedArticle, savedArticle => savedArticle.user)
  saved_articles: SavedArticle[];

  @OneToMany(() => UserSource, source => source.user)
  sources: UserSource[];

  @OneToMany(() => ScheduledSummary, summary => summary.user)
  scheduled_summaries: ScheduledSummary[];
} 