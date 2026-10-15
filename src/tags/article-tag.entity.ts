import { Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { ArticleEntity } from '../articles/article.entity';
import { TagEntity } from './tag.entity';

@Entity({ name: 'article_tags' })
@Index('article_tags_tag_id_idx', { synchronize: false })
export class ArticleTagEntity {
  @PrimaryColumn({ name: 'article_id', type: 'uuid' })
  articleId!: string;

  @PrimaryColumn({ name: 'tag_id', type: 'uuid' })
  tagId!: string;

  @ManyToOne(() => ArticleEntity, (article) => article.articleTags, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'article_id' })
  article!: Relation<ArticleEntity>;

  @ManyToOne(() => TagEntity, (tag) => tag.articleTags, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tag_id' })
  tag!: Relation<TagEntity>;
}
