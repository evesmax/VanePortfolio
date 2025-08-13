import { Heart, User, Camera, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const services = [
  {
    icon: Heart,
    title: "Paquetes para eventos",
    description: "Captura cada momento especial de tu día más importante con un estilo natural y elegante.",
    features: [
      "Invitaciones digitales con confirmación de asistencia",
      "Sesión previa al evento",
      "5 horas de cobertura del evento",
      "Book de tu evento",
      "Video de tu evento en USB",
      "Servicio de caballete",
    ],
  },
  {
    icon: User,
    title: "Sesiones de Retratos",
    description: "Retratos profesionales que capturan tu personalidad única, ideales para perfiles y portfolios.",
    features: [
      "Sesión express desde 30 minutos",
      "Sesión de 1-2 horas",
      "Fotografías editadas",
      "Diferentes outfits y poses",
      "Entrega digital rápida",
    ],
  },
  {
    icon: Camera,
    title: "Sesiones a productos",
    description: "Fotografía profesional de productos para destacar tu marca o negocio con imágenes de alta calidad.",
    features: [
      "Concepto creativo único",
      "Edición profesional avanzada",
      "Licencia para uso comercial",
    ],
  },
];

export default function ServicesSection() {
  const handleContact = () => {
    const element = document.querySelector("#contacto");
    if (element) {
      const offsetTop = element.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
    }
  };

  return (
    <section id="servicios" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-black mb-4">
            Servicios
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Ofrezco una amplia gama de servicios fotográficos adaptados a tus necesidades
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card key={index} className="bg-gray-50 hover:shadow-lg transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                  <service.icon className="text-white w-8 h-8" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-black mb-4">
                  {service.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {service.description}
                </p>
                <ul className="text-left text-gray-600 space-y-2 mb-8">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="text-green-600 w-4 h-4 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  onClick={handleContact}
                  className="w-full bg-black text-white hover:bg-gray-800"
                >
                  Consultar
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
