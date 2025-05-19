import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany } from 'typeorm';
import { ArticleTag } from './ArticleTag';
import { Article } from './Article';

@Entity()
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @OneToMany(() => ArticleTag, articleTag => articleTag.tag)
  articleTags: ArticleTag[];

  @ManyToMany(() => Article, article => article.tags)
  articles: Article[];
} 