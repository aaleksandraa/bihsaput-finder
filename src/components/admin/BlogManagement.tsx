import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Edit, Plus, X } from "lucide-react";
import { format } from "date-fns";
import { TipTapEditor } from "./TipTapEditor";
import { ImageUploadButton } from "./ImageUploadButton";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

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
  category_id: string | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
}

export const BlogManagement = () => {
  const { toast } = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [newTag, setNewTag] = useState("");

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
    category_id: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: postsData } = await supabase
      .from("blog_posts")
      .select("*, blog_categories(name)")
      .order("created_at", { ascending: false });

    const { data: categoriesData } = await supabase
      .from("blog_categories")
      .select("*")
      .order("name");

    const { data: tagsData } = await supabase
      .from("blog_tags")
      .select("*")
      .order("name");

    if (postsData) setPosts(postsData);
    if (categoriesData) setCategories(categoriesData);
    if (tagsData) setTags(tagsData);
  };

  const fetchPostTags = async (postId: string) => {
    const { data } = await supabase
      .from("blog_post_tags")
      .select("blog_tag_id")
      .eq("blog_post_id", postId);

    if (data) {
      setSelectedTags(data.map(pt => pt.blog_tag_id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const postData = {
      ...formData,
      category_id: formData.category_id || null,
      published_at: formData.is_published ? new Date().toISOString() : null,
    };

    try {
      if (editingPost) {
        const { error } = await supabase
          .from("blog_posts")
          .update(postData)
          .eq("id", editingPost.id);

        if (error) throw error;

        // Update tags
        await supabase
          .from("blog_post_tags")
          .delete()
          .eq("blog_post_id", editingPost.id);

        if (selectedTags.length > 0) {
          await supabase
            .from("blog_post_tags")
            .insert(selectedTags.map(tagId => ({
              blog_post_id: editingPost.id,
              blog_tag_id: tagId
            })));
        }

        toast({ title: "Uspjeh", description: "Post je uspješno ažuriran." });
      } else {
        const { data: newPost, error } = await supabase
          .from("blog_posts")
          .insert([postData])
          .select()
          .single();

        if (error) throw error;

        // Add tags
        if (newPost && selectedTags.length > 0) {
          await supabase
            .from("blog_post_tags")
            .insert(selectedTags.map(tagId => ({
              blog_post_id: newPost.id,
              blog_tag_id: tagId
            })));
        }

        toast({ title: "Uspjeh", description: "Post je uspješno kreiran." });
      }
      
      resetForm();
      fetchData();
    } catch (error) {
      toast({ title: "Greška", description: "Nije moguće sačuvati post.", variant: "destructive" });
    }
  };

  const handleEdit = async (post: BlogPost) => {
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
      category_id: post.category_id || "",
    });
    await fetchPostTags(post.id);
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
      fetchData();
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
      category_id: "",
    });
    setSelectedTags([]);
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

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;

    const slug = generateSlug(newCategory);
    const { error } = await supabase
      .from("blog_categories")
      .insert([{ name: newCategory, slug }]);

    if (error) {
      toast({ title: "Greška", description: "Nije moguće dodati kategoriju.", variant: "destructive" });
    } else {
      toast({ title: "Uspjeh", description: "Kategorija je dodana." });
      setNewCategory("");
      fetchData();
    }
  };

  const handleAddTag = async () => {
    if (!newTag.trim()) return;

    const slug = generateSlug(newTag);
    const { error } = await supabase
      .from("blog_tags")
      .insert([{ name: newTag, slug }]);

    if (error) {
      toast({ title: "Greška", description: "Nije moguće dodati tag.", variant: "destructive" });
    } else {
      toast({ title: "Uspjeh", description: "Tag je dodan." });
      setNewTag("");
      fetchData();
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Kategorije</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Nova kategorija"
              />
              <Button onClick={handleAddCategory}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {categories.map(cat => (
                <div key={cat.id} className="flex justify-between items-center p-2 border rounded">
                  <span>{cat.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tagovi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Novi tag"
              />
              <Button onClick={handleAddTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <Badge key={tag.id} variant="secondary">
                  {tag.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

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
                    const title = e.target.value;
                    setFormData({ ...formData, title, slug: generateSlug(title) });
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
                <Label htmlFor="category">Kategorija</Label>
                <select
                  id="category"
                  className="w-full p-2 border rounded"
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                >
                  <option value="">Bez kategorije</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Tagovi</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map(tag => (
                    <Badge
                      key={tag.id}
                      variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleTag(tag.id)}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
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
                <Label>Sadržaj *</Label>
                <TipTapEditor
                  content={formData.content}
                  onChange={(html) => setFormData({ ...formData, content: html })}
                />
              </div>

              <div>
                <Label>Featured slika</Label>
                <div className="flex gap-2 items-center">
                  <ImageUploadButton
                    onUpload={(url) => setFormData({ ...formData, featured_image_url: url })}
                  />
                  {formData.featured_image_url && (
                    <div className="relative">
                      <img
                        src={formData.featured_image_url}
                        alt="Preview"
                        className="h-20 w-20 object-cover rounded"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={() => setFormData({ ...formData, featured_image_url: "" })}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
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
        {posts.map((post: any) => (
          <Card key={post.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{post.title}</CardTitle>
                  <CardDescription>
                    {post.published_at && format(new Date(post.published_at), "dd.MM.yyyy. HH:mm")}
                    {post.blog_categories && ` • ${post.blog_categories.name}`}
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
