import { Zap } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-background-subtle py-12 border-t border-card-border">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">QUIZZ Elevado</span>
          </div>
          
          <p className="text-foreground-muted text-center md:text-right">
            © 2024 QUIZZ Elevado. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}