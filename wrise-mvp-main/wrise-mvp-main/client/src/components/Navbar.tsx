
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  // Add scroll event listener
  useState(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  });

  return (
    <>
    <header className="fixed top-0 w-full bg-card/90 backdrop-blur-md border-b border-border/50 z-50">
      <div className="container mx-auto flex items-center justify-between py-4 px-6">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 bg-gradient-to-br from-primary via-secondary to-accent rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 animate-pulse"></div>
            <img 
              src="/lovable-uploads/2878a6ab-b998-45c6-ad2d-8d7be6f88feb.png" 
              alt="Clonark Logo" 
              className="w-6 h-6 object-contain filter invert transition-all duration-300 group-hover:scale-110 group-hover:rotate-12"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-foreground">
            Clonark
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          {user?.isCreator && (
          <Link to="/" className="text-sm font-medium hover:text-primary transition-colors text-foreground">
            Home
          </Link>
          )}
          
          <Link to="/pricing" className="text-sm font-medium hover:text-primary transition-colors text-foreground">
            Pricing
          </Link>

          {user?.isCreator && (
            <Link to="/creator-dashboard" className="text-sm font-medium hover:text-primary transition-colors text-foreground">
              Dashboard
            </Link>
          )}
          {user?.isCreator && (
            <Link to="/connect" className="text-sm font-medium hover:text-primary transition-colors text-foreground">
              Connect Channels
            </Link>
          )}

        </nav>
        
        <div className="flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground">{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-card border-border" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-foreground">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem asChild>
                  <Link to="/creator-dashboard" className="text-foreground">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={`/hub/${user.id}`} className="text-foreground">My Fan Hub</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-foreground">
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" className="hover:bg-accent/50 transition-colors">Sign In</Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground rounded-full px-6 py-2 h-auto shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
    </>
  );
};

export default Navbar;
