import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { SavedArticle } from './SavedArticle';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password_hash: string;

  @OneToMany(() => SavedArticle, savedArticle => savedArticle.user)
  savedArticles: SavedArticle[];
} 