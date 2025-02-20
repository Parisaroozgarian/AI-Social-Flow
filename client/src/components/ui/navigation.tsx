import { Link, useLocation } from "wouter";
import { Button } from "./button";
import { 
  Home, 
  Settings, 
  PenTool, 
  Calendar, 
  BarChart2, 
  History, 
  User,
  Menu,
  X,
  Mail
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";

export function Navigation() {
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logoutMutation } = useAuth();

  const publicMenuItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/contact", label: "Contact", icon: Mail },
  ];

  const dashboardMenuItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/generate", label: "Generate Content", icon: PenTool },
    { href: "/schedule", label: "Schedule Posts", icon: Calendar },
    { href: "/analyze", label: "Analyze Content", icon: BarChart2 },
    { href: "/history", label: "Analysis History", icon: History },
    { href: "/profile", label: "Profile", icon: User },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  const menuItems = user ? dashboardMenuItems : publicMenuItems;

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="border-b px-4 py-3 bg-background">
      <div className="container mx-auto">
        {/* Mobile Menu Button */}
        <div className="flex md:hidden justify-between items-center">
          <Button variant="ghost" size="icon" onClick={toggleMenu}>
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
          <span className="font-semibold">Content Assistant</span>
          {!user && (
            <Link href="/auth">
              <Button variant="default" size="sm">Login</Button>
            </Link>
          )}
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center justify-between">
          <div className="flex items-center space-x-1">
            {menuItems.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}>
                <Button 
                  variant={location === href ? "default" : "ghost"}
                  className="flex items-center space-x-2"
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Button>
              </Link>
            ))}
          </div>
          {user ? (
            <Button 
              variant="ghost" 
              onClick={() => logoutMutation.mutate()}
              className="ml-4"
            >
              Logout
            </Button>
          ) : (
            <Link href="/auth">
              <Button variant="default">Login</Button>
            </Link>
          )}
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="flex flex-col space-y-2 pt-4">
              {menuItems.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href}>
                  <Button 
                    variant={location === href ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {label}
                  </Button>
                </Link>
              ))}
              {user && (
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    logoutMutation.mutate();
                    setIsMenuOpen(false);
                  }}
                  className="w-full justify-start"
                >
                  Logout
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}