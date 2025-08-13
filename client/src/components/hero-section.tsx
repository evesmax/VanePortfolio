import { Button } from "@/components/ui/button";

export default function HeroSection() {
  const handleScrollTo = (id: string) => {
    const element = document.querySelector(id);
    if (element) {
      const offsetTop = element.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
    }
  };

  return (
    <section id="inicio" className="relative h-screen flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url('/attached_assets/Luna_1749964352172.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-black/20" />
      
      <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4" style={{ marginTop: '-45vh' }}>
        <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6">Vane Andrade</h1>
        <p className="text-xl md:text-2xl font-light mb-8 max-w-2xl mx-auto">
          Capturando momentos únicos con una visión artística excepcional
        </p>
        <div className="space-x-4">
          <Button
            onClick={() => handleScrollTo("#portfolio")}
            className="bg-white text-black hover:bg-gray-100 px-8 py-3 font-medium"
          >
            Ver Portfolio
          </Button>
          <Button
            onClick={() => handleScrollTo("#contacto")}
            variant="outline"
            className="border-2 border-white text-white bg-transparent hover:bg-white hover:text-black px-8 py-3 font-medium"
          >
            Contactar
          </Button>
        </div>
      </div>
    </section>
  );
}
