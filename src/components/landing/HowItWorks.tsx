import { Edit, Rocket, Users } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Edit,
    title: "Crie",
    subtitle: "Editor visual com templates prontos",
    description: "Use nosso editor drag-and-drop intuitivo com templates profissionais. Adicione perguntas, customize o design e configure a lógica em minutos."
  },
  {
    number: "02",
    icon: Rocket,
    title: "Lance",
    subtitle: "Publique e compartilhe em 1 clique",
    description: "Publique seu quiz instantaneamente e compartilhe via link, QR code ou embed. Acompanhe performance em tempo real com analytics detalhados."
  },
  {
    number: "03",
    icon: Users,
    title: "Converta",
    subtitle: "Leads vão direto para WhatsApp/CRM",
    description: "Conecte automaticamente com WhatsApp, CRMs e ferramentas de marketing. Transforme respostas em leads qualificados instantaneamente."
  }
];

export function HowItWorks() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Como funciona o{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              QUIZZ Elevado
            </span>
          </h2>
          <p className="text-xl text-foreground-muted max-w-3xl mx-auto">
            Em apenas 3 passos simples, você cria quizzes profissionais que capturam leads e aumentam suas conversões.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <div 
              key={index}
              className="relative group animate-fade-in"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              {/* Step Number */}
              <div className="text-8xl lg:text-9xl font-bold text-primary/10 absolute -top-4 -left-2 select-none">
                {step.number}
              </div>
              
              {/* Content */}
              <div className="relative z-10 pt-8">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-colors mb-4">
                    <step.icon className="w-8 h-8 text-primary" />
                  </div>
                  
                  <h3 className="text-2xl lg:text-3xl font-bold mb-2 text-foreground">
                    {step.title}
                  </h3>
                  
                  <p className="text-lg font-medium text-primary mb-4">
                    {step.subtitle}
                  </p>
                </div>
                
                <p className="text-foreground-muted leading-relaxed">
                  {step.description}
                </p>
              </div>
              
              {/* Connector Line (except for last item) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-6 w-12 h-0.5 bg-gradient-to-r from-primary/30 to-transparent" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}