import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import Header from "@/components/Header";
import { z } from "zod";

// Input validation schemas
const emailSchema = z.string().email("Email adresa nije validna").max(255, "Email mora biti kraći od 255 karaktera");
const passwordSchema = z.string().min(6, "Lozinka mora imati najmanje 6 karaktera").max(128, "Lozinka je preduga");
const nameSchema = z.string().trim().min(2, "Ime mora imati najmanje 2 karaktera").max(100, "Ime je predugo");

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>(
    searchParams.get('mode') === 'register' ? 'register' : 'login'
  );
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const validateLogin = () => {
    const newErrors: Record<string, string> = {};
    
    try {
      emailSchema.parse(email);
    } catch (error) {
      if (error instanceof z.ZodError) {
        newErrors.email = error.errors[0].message;
      }
    }
    
    try {
      passwordSchema.parse(password);
    } catch (error) {
      if (error instanceof z.ZodError) {
        newErrors.password = error.errors[0].message;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRegister = () => {
    const newErrors: Record<string, string> = {};
    
    try {
      nameSchema.parse(firstName);
    } catch (error) {
      if (error instanceof z.ZodError) {
        newErrors.firstName = error.errors[0].message;
      }
    }
    
    try {
      nameSchema.parse(lastName);
    } catch (error) {
      if (error instanceof z.ZodError) {
        newErrors.lastName = error.errors[0].message;
      }
    }
    
    try {
      emailSchema.parse(email);
    } catch (error) {
      if (error instanceof z.ZodError) {
        newErrors.email = error.errors[0].message;
      }
    }
    
    try {
      passwordSchema.parse(password);
    } catch (error) {
      if (error instanceof z.ZodError) {
        newErrors.password = error.errors[0].message;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateLogin()) {
      toast.error("Molimo popravite greške u formi");
      return;
    }
    
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (error) {
      toast.error("Greška pri prijavi: " + error.message);
    } else {
      toast.success("Uspješno ste se prijavili!");
      navigate("/dashboard");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateRegister()) {
      toast.error("Molimo popravite greške u formi");
      return;
    }
    
    setIsLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          first_name: firstName,
          last_name: lastName,
        }
      }
    });

    if (authError) {
      setIsLoading(false);
      toast.error("Greška pri registraciji: " + authError.message);
      return;
    }

    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            email,
            first_name: firstName,
            last_name: lastName,
          }
        ]);

      if (profileError) {
        console.error("Profile creation error:", profileError);
      }
    }

    setIsLoading(false);
    toast.success("Uspješno ste se registrovali! Možete se prijaviti.");
    setMode('login');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container flex items-center justify-center py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{mode === 'login' ? 'Prijava' : 'Registracija'}</CardTitle>
            <CardDescription>
              {mode === 'login' 
                ? 'Prijavite se na vaš račun' 
                : 'Kreirajte novi račun da biste počeli'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-4">
              {mode === 'register' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Ime</Label>
                    <Input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => {
                        setFirstName(e.target.value);
                        setErrors({ ...errors, firstName: '' });
                      }}
                      required
                      maxLength={100}
                      className={errors.firstName ? "border-destructive" : ""}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-destructive">{errors.firstName}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Prezime</Label>
                    <Input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => {
                        setLastName(e.target.value);
                        setErrors({ ...errors, lastName: '' });
                      }}
                      required
                      maxLength={100}
                      className={errors.lastName ? "border-destructive" : ""}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-destructive">{errors.lastName}</p>
                    )}
                  </div>
                </>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors({ ...errors, email: '' });
                  }}
                  required
                  maxLength={255}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Lozinka</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors({ ...errors, password: '' });
                  }}
                  required
                  maxLength={128}
                  className={errors.password ? "border-destructive" : ""}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              <Button type="submit" className="w-full bg-hero-gradient" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === 'login' ? 'Prijavi se' : 'Registruj se'}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm">
              {mode === 'login' ? (
                <p>
                  Nemate račun?{' '}
                  <button
                    onClick={() => setMode('register')}
                    className="text-primary hover:underline"
                  >
                    Registrujte se
                  </button>
                </p>
              ) : (
                <p>
                  Već imate račun?{' '}
                  <button
                    onClick={() => setMode('login')}
                    className="text-primary hover:underline"
                  >
                    Prijavite se
                  </button>
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
