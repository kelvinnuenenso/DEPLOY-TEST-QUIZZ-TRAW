import { Star, Quote } from "lucide-react";

export function Testimonial() {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent-purple/5" />
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <Quote className="w-16 h-16 text-primary/30 mx-auto mb-6" />
          </div>
          
          <blockquote className="text-3xl lg:text-4xl font-bold text-foreground mb-8 leading-relaxed">
            "Com o QUIZZ Elevado aumentamos{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              3x nossos leads
            </span>{" "}
            em 30 dias."
          </blockquote>
          
          <div className="space-y-4">
            <div className="flex justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-accent-orange text-accent-orange" />
              ))}
            </div>
            
            <p className="text-xl text-foreground-muted">
              <strong className="text-foreground">Maria Silva</strong>, Diretora de Marketing
            </p>
            <p className="text-lg text-foreground-subtle">
              E-commerce de Moda • +500% ROI
            </p>
          </div>
          
          <div className="mt-12 p-8 bg-background-subtle rounded-2xl border border-card-border">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-primary mb-2">+10k</div>
                <div className="text-foreground-muted">Usuários ativos</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-accent-green mb-2">4.9/5</div>
                <div className="text-foreground-muted">Avaliação média</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-accent-orange mb-2">+87%</div>
                <div className="text-foreground-muted">Mais conversões</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}