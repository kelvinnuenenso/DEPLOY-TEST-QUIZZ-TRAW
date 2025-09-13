import { Button } from "@/components/ui/button";
import { ArrowRight, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
// import { Link } from "react-router-dom";

export function CTA() {
  const navigate = useNavigate();
  
  return (
    <section className="py-24 bg-gradient-to-br from-dark via-dark to-primary/90 text-dark-foreground relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent-purple/20" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-purple/20 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight text-white">
            Transforme seu conhecimento em{" "}
            <span className="bg-gradient-to-r from-white to-accent-purple bg-clip-text text-transparent">
              quizzes que vendem
            </span>
          </h2>
          
          <p className="text-xl lg:text-2xl text-white/80 mb-8 leading-relaxed">
            Com o QUIZZ Elevado, crie quizzes interativos em minutos — conecte direto ao WhatsApp e ao seu CRM.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="flex items-center justify-center gap-3 text-white/90">
              <div className="w-2 h-2 bg-accent-green rounded-full" />
              <span>Criação fácil drag-and-drop</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-white/90">
              <div className="w-2 h-2 bg-accent-green rounded-full" />
              <span>Captura de leads integrada</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-white/90">
              <div className="w-2 h-2 bg-accent-green rounded-full" />
              <span>Analytics avançado em tempo real</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-white/90">
              <div className="w-2 h-2 bg-accent-green rounded-full" />
              <span>Gamificação que engaja</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-white/90">
              <div className="w-2 h-2 bg-accent-green rounded-full" />
              <span>Integração com WhatsApp e CRMs</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-white/90">
              <div className="w-2 h-2 bg-accent-green rounded-full" />
              <span>Responsividade total</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button 
              size="lg" 
              className="bg-white text-dark hover:bg-white/90 px-8 py-4 text-lg font-semibold group"
              onClick={() => navigate('/auth')}
            >
              Começar grátis agora
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform ml-2" />
            </Button>
            
            <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg">
              <Clock className="w-5 h-5 mr-2" />
              Teste em 2 minutos
            </Button>
          </div>
          
          <p className="text-white/60 text-sm">
            Sem cartão de crédito • Cancele quando quiser
          </p>
        </div>
      </div>
    </section>
  );
}