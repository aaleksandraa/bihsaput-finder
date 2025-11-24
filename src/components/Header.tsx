import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, User, LogOut, Shield, Menu, X, Home, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  user?: any;
}

const Header = ({ user }: HeaderProps) => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      checkAdminStatus();
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();
    
    setIsAdmin(!!data);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Greška prilikom odjave");
    } else {
      toast.success("Uspješno ste se odjavili");
      navigate("/");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container px-4 md:px-6">
        <div className="flex h-16 md:h-20 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group transition-all">
            <div className="h-9 w-9 md:h-10 md:w-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-md group-hover:shadow-lg transition-all" />
            <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Knjigovođe BiH
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <Link to="/search">
              <Button variant="ghost" size="sm" className="gap-2">
                <Search className="h-4 w-4" />
                Pretraga
              </Button>
            </Link>

            {user ? (
              <>
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Shield className="h-4 w-4" />
                      Admin
                    </Button>
                  </Link>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <User className="h-4 w-4" />
                      Profil
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="flex items-center gap-2 cursor-pointer">
                        <User className="h-4 w-4" />
                        Moj profil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 cursor-pointer text-destructive">
                      <LogOut className="h-4 w-4" />
                      Odjava
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="ghost" size="sm">
                    Prijava
                  </Button>
                </Link>
                <Link to="/auth?mode=register">
                  <Button size="sm" className="bg-gradient-to-r from-primary to-primary/80 hover:opacity-90">
                    Registracija
                  </Button>
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="sm" className="p-2 text-white">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px] bg-transparent backdrop-blur-md border-white/20 text-white">
              <SheetHeader className="text-left mb-6">
                <SheetTitle className="text-xl font-bold text-white">Meni</SheetTitle>
              </SheetHeader>
              
              <div className="flex flex-col gap-3">
                <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start gap-2 text-white hover:bg-white/10" size="lg">
                    <Home className="h-5 w-5" />
                    Početna
                  </Button>
                </Link>
                
                <Link to="/search" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start gap-2 text-white hover:bg-white/10" size="lg">
                    <Search className="h-5 w-5" />
                    Pretraga
                  </Button>
                </Link>

                {user ? (
                  <>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start gap-2 text-white hover:bg-white/10" size="lg">
                          <Shield className="h-5 w-5" />
                          Admin Panel
                        </Button>
                      </Link>
                    )}
                    
                    <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start gap-2 text-white hover:bg-white/10" size="lg">
                        <User className="h-5 w-5" />
                        Moj profil
                      </Button>
                    </Link>
                    
                    <div className="my-2 border-t border-white/20" />
                    
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start gap-2 text-white hover:bg-white/10" 
                      size="lg"
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="h-5 w-5" />
                      Odjava
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="my-2 border-t border-white/20" />
                    <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10" size="lg">
                        Prijava
                      </Button>
                    </Link>
                    <Link to="/auth?mode=register" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm" size="lg">
                        Registracija
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
