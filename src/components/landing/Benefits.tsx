import { MousePointer, Brain, Target, BarChart3, Smartphone, MessageCircle } from "lucide-react";

const benefits = [
  {
    icon: MousePointer,
    title: "Editor visual drag-and-drop",
    description: "Crie quizzes profissionais sem código, com interface intuitiva e componentes prontos."
  },
  {
    icon: Brain,
    title: "Lógica condicional inteligente",
    description: "Personalize a experiência com regras avançadas e resultados dinâmicos baseados nas respostas."
  },
  {
    icon: Target,
    title: "Captura de leads integrada",
    description: "Colete informações dos usuários de forma natural durante o quiz, com formulários otimizados."
  },
  {
    icon: BarChart3,
    title: "Analytics em tempo real",
    description: "Acompanhe métricas detalhadas, taxa de conversão e insights sobre o comportamento dos usuários."
  },
  {
    icon: Smartphone,
    title: "Responsividade total",
    description: "Seus quizzes funcionam perfeitamente em qualquer dispositivo, com preview em tempo real."
  },
  {
    icon: MessageCircle,
    title: "Conexão direta com WhatsApp/CRMs",
    description: "Integre automaticamente com WhatsApp, HubSpot, Pipedrive e outras ferramentas."
  }
];

export function Benefits() {
  return (
    <section className="py-24 bg-background-subtle">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Tudo que você precisa para{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              converter mais
            </span>
          </h2>
          <p className="text-xl text-foreground-muted max-w-3xl mx-auto">
            Uma plataforma completa com todas as ferramentas necessárias para criar, publicar e otimizar quizzes que realmente convertem.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div 
              key={index}
              className="feature-card group cursor-pointer animate-fade-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <benefit.icon className="w-6 h-6 text-primary" />
                </div>
              </div>
              
              <h3 className="text-xl font-semibold mb-3 text-foreground">
                {benefit.title}
              </h3>
              
              <p className="text-foreground-muted leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}