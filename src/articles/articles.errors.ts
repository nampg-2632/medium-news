export class ArticleSlugTakenError extends Error {
  constructor(public readonly slug: string) {
    super(`slug ${slug} has already been taken`);
    this.name = ArticleSlugTakenError.name;
  }
}
