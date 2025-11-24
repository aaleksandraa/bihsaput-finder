import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Edit, Plus } from "lucide-react";
import { format } from "date-fns";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image_url: string | null;
  is_published: boolean;
  show_on_homepage: boolean;
  published_at: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
}

export const BlogManagement = () => {
  const { toast } = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    featured_image_url: "",
    is_published: false,
    show_on_homepage: false,
    meta_description: "",
    meta_keywords: "",
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Greška", description: "Nije moguće učitati blog postove.", variant: "destructive" });
    } else {
      setPosts(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const postData = {
      ...formData,
      published_at: formData.is_published ? new Date().toISOString() : null,
    };

    if (editingPost) {
      const { error } = await supabase
        .from("blog_posts")
        .update(postData)
        .eq("id", editingPost.id);

      if (error) {
        toast({ title: "Greška", description: "Nije moguće ažurirati post.", variant: "destructive" });
      } else {
        toast({ title: "Uspjeh", description: "Post je uspješno ažuriran." });
        resetForm();
        fetchPosts();
      }
    } else {
      const { error } = await supabase
        .from("blog_posts")
        .insert([postData]);

      if (error) {
        toast({ title: "Greška", description: "Nije moguće kreirati post.", variant: "destructive" });
      } else {
        toast({ title: "Uspjeh", description: "Post je uspješno kreiran." });
        resetForm();
        fetchPosts();
      }
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setIsCreating(true);
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      featured_image_url: post.featured_image_url || "",
      is_published: post.is_published,
      show_on_homepage: post.show_on_homepage,
      meta_description: post.meta_description || "",
      meta_keywords: post.meta_keywords || "",
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Da li ste sigurni da želite obrisati ovaj post?")) return;

    const { error } = await supabase
      .from("blog_posts")
      .delete()
      .eq("id", id);

    if (error) {
      toast({ title: "Greška", description: "Nije moguće obrisati post.", variant: "destructive" });
    } else {
      toast({ title: "Uspjeh", description: "Post je uspješno obrisan." });
      fetchPosts();
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      featured_image_url: "",
      is_published: false,
      show_on_homepage: false,
      meta_description: "",
      meta_keywords: "",
    });
    setEditingPost(null);
    setIsCreating(false);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/č/g, "c")
      .replace(/ć/g, "c")
      .replace(/đ/g, "d")
      .replace(/š/g, "s")
      .replace(/ž/g, "z")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Blog Postovi</h2>
        {!isCreating && (
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novi Post
          </Button>
        )}
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>{editingPost ? "Uredi Post" : "Kreiraj Novi Post"}</CardTitle>
            <CardDescription>
              Popunite formu za kreiranje ili uređivanje blog posta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Naslov *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ ...formData, title: e.target.value });
                    if (!editingPost) {
                      setFormData({ ...formData, title: e.target.value, slug: generateSlug(e.target.value) });
                    }
                  }}
                  required
                />
              </div>

              <div>
                <Label htmlFor="slug">Slug (URL) *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="excerpt">Kratki opis *</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  rows={2}
                  required
                />
              </div>

              <div>
                <Label htmlFor="content">Sadržaj (HTML) *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={10}
                  required
                />
              </div>

              <div>
                <Label htmlFor="featured_image">URL featured slike</Label>
                <Input
                  id="featured_image"
                  value={formData.featured_image_url}
                  onChange={(e) => setFormData({ ...formData, featured_image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <Label htmlFor="meta_description">Meta Description (SEO)</Label>
                <Textarea
                  id="meta_description"
                  value={formData.meta_description}
                  onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="meta_keywords">Meta Keywords (SEO)</Label>
                <Input
                  id="meta_keywords"
                  value={formData.meta_keywords}
                  onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
                  placeholder="ključna riječ 1, ključna riječ 2"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_published"
                  checked={formData.is_published}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                />
                <Label htmlFor="is_published">Objavi post</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="show_on_homepage"
                  checked={formData.show_on_homepage}
                  onCheckedChange={(checked) => setFormData({ ...formData, show_on_homepage: checked })}
                />
                <Label htmlFor="show_on_homepage">Prikaži na početnoj stranici</Label>
              </div>

              <div className="flex gap-2">
                <Button type="submit">{editingPost ? "Ažuriraj" : "Kreiraj"}</Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Otkaži
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{post.title}</CardTitle>
                  <CardDescription>
                    {post.published_at && format(new Date(post.published_at), "dd.MM.yyyy. HH:mm")}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="outline" onClick={() => handleEdit(post)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="destructive" onClick={() => handleDelete(post.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">{post.excerpt}</p>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>Status: {post.is_published ? "✅ Objavljen" : "❌ Draft"}</span>
                <span>Početna: {post.show_on_homepage ? "✅ Da" : "❌ Ne"}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
