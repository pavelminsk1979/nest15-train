export class CreatePostDto {
  createdAt: string;

  constructor(
    public title: string,
    public content: string,
    public shortDescription: string,
    public blogName: string,
    public blogId: string,
  ) {
    this.createdAt = new Date().toISOString();
  }
}
