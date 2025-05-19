import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';
import { Article } from './Article';

@Entity()
export class SavedArticle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.savedArticles)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Article, article => article.savedBy)
  @JoinColumn({ name: 'article_id' })
  article: Article;
} 