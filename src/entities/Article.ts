import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { SavedArticle } from './SavedArticle';
import { ArticleTag } from './ArticleTag';
import { Tag } from './Tag';

@Entity()
export class Article {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column('text')
  summary: string;

  @Column()
  sentiment: string;

  @OneToMany(() => SavedArticle, savedArticle => savedArticle.article)
  savedBy: SavedArticle[];

  @OneToMany(() => ArticleTag, articleTag => articleTag.article)
  articleTags: ArticleTag[];

  @ManyToMany(() => Tag)
  @JoinTable()
  tags: Tag[];
} 