import { getAllPosts, paginate, toCardData, BLOG_PER_PAGE, blogIndexTotalPages } from '@/lib/blog';
import { getBlogIndexMetadata } from '@/lib/seo';
import BlogHero from '@/components/blog/BlogHero';
import BlogSearch from '@/components/blog/BlogSearch';
import CategoryChips from '@/components/blog/CategoryChips';
import Pagination from '@/components/blog/Pagination';

export const metadata = getBlogIndexMetadata();

export default function BlogIndex() {
  const posts = getAllPosts();
  const hero = posts[0];
  const rest = posts.slice(1);
  const { items: pagePosts } = paginate(rest, 1, BLOG_PER_PAGE);
  const totalPages = blogIndexTotalPages(rest.length);

  return (
    <div className="bg-muted/20">
      <div className="border-b border-border/60 bg-background">
        <div className="container py-10">
          <h1 className="text-3xl font-semibold text-foreground text-balance sm:text-4xl">
            Guides &amp; How-Tos
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground text-pretty">
            Practical guides on PDFs, images, JSON, and everyday web tasks — using free,
            privacy-first browser tools.
          </p>
        </div>
      </div>

      <div className="container py-10">
        <div className="mx-auto max-w-4xl">
          <CategoryChips />
          {hero && (
            <div className="mt-6">
              <BlogHero post={hero} />
            </div>
          )}
          <div className="mt-8">
            <BlogSearch posts={pagePosts.map(toCardData)} />
          </div>
          <Pagination basePath="/blog" page={1} totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}
