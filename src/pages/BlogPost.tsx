import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { SEO } from "@/components/SEO";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Helmet } from "react-helmet-async";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image_url: string | null;
  published_at: string;
  meta_description: string | null;
  meta_keywords: string | null;
  blog_categories?: { name: string; slug: string } | null;
  blog_post_tags?: Array<{ blog_tags: { name: string; slug: string } }>;
}

export default function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const fetchPost = async () => {
    const { data, error } = await supabase
      .from("blog_posts")
      .select(`
        *,
        blog_categories(name, slug),
        blog_post_tags(blog_tags(name, slug))
      `)
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();

    if (error) {
      console.error("Error fetching blog post:", error);
      navigate("/blog");
    } else if (!data) {
      navigate("/blog");
    } else {
      setPost(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <Skeleton className="h-12 w-3/4 mb-4" />
            <Skeleton className="h-6 w-1/4 mb-8" />
            <Skeleton className="h-64 w-full mb-8" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </main>
      </>
    );
  }

  if (!post) return null;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.featured_image_url || "https://lovable.dev/opengraph-image-p98pqg.png",
    datePublished: post.published_at,
    author: {
      "@type": "Organization",
      name: "Knjigovođe BiH"
    },
    publisher: {
      "@type": "Organization",
      name: "Knjigovođe BiH",
      logo: {
        "@type": "ImageObject",
        url: "https://lovable.dev/opengraph-image-p98pqg.png"
      }
    }
  };

  return (
    <>
      <SEO
        title={post.title}
        description={post.meta_description || post.excerpt}
        keywords={post.meta_keywords || undefined}
        image={post.featured_image_url || undefined}
        url={`/blog/${post.slug}`}
        type="article"
      />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <article className="max-w-3xl mx-auto">
            <header className="mb-8">
              <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <time className="text-muted-foreground">
                  {format(new Date(post.published_at), "dd.MM.yyyy.")}
                </time>
                {post.blog_categories && (
                  <Link to={`/blog?category=${post.blog_categories.slug}`}>
                    <Badge variant="secondary">{post.blog_categories.name}</Badge>
                  </Link>
                )}
              </div>
              {post.blog_post_tags && post.blog_post_tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.blog_post_tags.map((pt, idx) => (
                    <Link key={idx} to={`/blog?tag=${pt.blog_tags.slug}`}>
                      <Badge variant="outline">{pt.blog_tags.name}</Badge>
                    </Link>
                  ))}
                </div>
              )}
            </header>

            {post.featured_image_url && (
              <div className="aspect-video w-full overflow-hidden rounded-lg mb-8">
                <img
                  src={post.featured_image_url}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div 
              className="prose prose-neutral dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </article>
        </main>
      </div>
    </>
  );
}
