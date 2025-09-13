import { Button } from "@/components/ui/button";
import { Menu, X, Zap } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-card-border">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">QUIZZ Elevado</span>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#recursos" className="text-foreground-muted hover:text-foreground transition-colors">
              Recursos
            </a>
            <a href="#como-funciona" className="text-foreground-muted hover:text-foreground transition-colors">
              Como funciona
            </a>
            <a href="#precos" className="text-foreground-muted hover:text-foreground transition-colors">
              Preços
            </a>
          </nav>
          
          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Button 
              variant="ghost" 
              className="text-foreground-muted hover:text-foreground"
              onClick={() => navigate('/auth')}
            >
              Entrar
            </Button>
            <Button 
              className="bg-primary hover:bg-primary-dark text-primary-foreground"
              onClick={() => navigate('/auth')}
            >
              Começar grátis
            </Button>
          </div>
          
          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-card-border bg-background">
            <nav className="flex flex-col gap-4">
              <a href="#recursos" className="text-foreground-muted hover:text-foreground transition-colors">
                Recursos
              </a>
              <a href="#como-funciona" className="text-foreground-muted hover:text-foreground transition-colors">
                Como funciona
              </a>
              <a href="#precos" className="text-foreground-muted hover:text-foreground transition-colors">
                Preços
              </a>
              <div className="flex flex-col gap-2 pt-4 border-t border-card-border">
                <Button 
                  variant="ghost" 
                  className="justify-start"
                  onClick={() => navigate('/auth')}
                >
                  Entrar
                </Button>
                <Button 
                  className="bg-primary hover:bg-primary-dark text-primary-foreground"
                  onClick={() => navigate('/auth')}
                >
                  Começar grátis
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}