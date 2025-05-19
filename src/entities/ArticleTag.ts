import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Article } from './Article';
import { Tag } from './Tag';

@Entity()
export class ArticleTag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Article, article => article.articleTags)
  @JoinColumn({ name: 'article_id' })
  article: Article;

  @ManyToOne(() => Tag, tag => tag.articleTags)
  @JoinColumn({ name: 'tag_id' })
  tag: Tag;
} 