import { useState } from "react";
import { Button } from "@/components/ui/button";

interface PortfolioItem {
  image: string;
  fullImage: string;
  category: string;
  title?: string;
}

const portfolioItems: PortfolioItem[] = [
  {
    image: "/attached_assets/_MG_4787_1752354221927.jpg",
    fullImage: "/attached_assets/_MG_4787_1752354221927.jpg",
    category: "all",
    title: "Sesión Infantil Princesa"
  },
  {
    image: "/attached_assets/_MG_4899_1752354221928.jpg",
    fullImage: "/attached_assets/_MG_4899_1752354221928.jpg",
    category: "all",
    title: "Sesión Infantil en Kiosco"
  },
  {
    image: "/attached_assets/1 2_1752354232706.jpg",
    fullImage: "/attached_assets/1 2_1752354232706.jpg",
    category: "all",
    title: "Sesión Familiar de Cumpleaños"
  },
  {
    image: "/attached_assets/1_1752354232707.jpg",
    fullImage: "/attached_assets/1_1752354232707.jpg",
    category: "all",
    title: "Retrato Profesional Masculino"
  },
  {
    image: "/attached_assets/2 2_1752354232708.jpg",
    fullImage: "/attached_assets/2 2_1752354232708.jpg",
    category: "all",
    title: "Retrato Corporativo Elegante"
  },
  {
    image: "/attached_assets/2_1752354232709.jpg",
    fullImage: "/attached_assets/2_1752354232709.jpg",
    category: "all",
    title: "Sesión Familiar con Trajes Típicos"
  },
  {
    image: "/attached_assets/4_1752354232710.jpg",
    fullImage: "/attached_assets/4_1752354232710.jpg",
    category: "all",
    title: "Retrato Profesional Chef"
  },
  {
    image: "/attached_assets/6_1752354232710.jpg",
    fullImage: "/attached_assets/6_1752354232710.jpg",
    category: "all",
    title: "Sesión Chef con Cuchillo"
  },
  {
    image: "/attached_assets/7_1752354240688.jpg",
    fullImage: "/attached_assets/7_1752354240688.jpg",
    category: "all",
    title: "Chef con Utensilios"
  },
  {
    image: "/attached_assets/8_1752354240688.jpg",
    fullImage: "/attached_assets/8_1752354240688.jpg",
    category: "all",
    title: "Sesión Culinaria Profesional"
  },
  {
    image: "/attached_assets/10 2_1752354252787.jpg",
    fullImage: "/attached_assets/10 2_1752354252787.jpg",
    category: "all",
    title: "Sesión Vaquero con Pony"
  },
  {
    image: "/attached_assets/10_1752354252787.jpg",
    fullImage: "/attached_assets/10_1752354252787.jpg",
    category: "all",
    title: "Sesión Familiar Navideña"
  },
  {
    image: "/attached_assets/3_1749966340027.jpg",
    fullImage: "/attached_assets/3_1749966340027.jpg",
    category: "all",
    title: "Sesión Prenatal Natural"
  },
  {
    image: "/attached_assets/2_1749967322187.jpg",
    fullImage: "/attached_assets/2_1749967322187.jpg",
    category: "all",
    title: "Sesión Prenatal Casual"
  },

  {
    image: "/attached_assets/IMG_0415_1749964899395.JPG",
    fullImage: "/attached_assets/IMG_0415_1749964899395.JPG",
    category: "wedding",
    title: "Boda Civil"
  },
  {
    image: "/attached_assets/31_1749968657397.jpg",
    fullImage: "/attached_assets/31_1749968657397.jpg",
    category: "wedding",
    title: "Ceremonia con Familia"
  },
  {
    image: "/attached_assets/39_1749968671265.jpg",
    fullImage: "/attached_assets/39_1749968671265.jpg",
    category: "wedding",
    title: "Vista Interior Iglesia"
  },
  {
    image: "/attached_assets/48_1749968683511.jpg",
    fullImage: "/attached_assets/48_1749968683511.jpg",
    category: "wedding",
    title: "Novios en Ceremonia"
  },
  {
    image: "/attached_assets/49_1749968689509.jpg",
    fullImage: "/attached_assets/49_1749968689509.jpg",
    category: "wedding",
    title: "Momento de Felicidad"
  },
  {
    image: "/attached_assets/0153_1749968831633.JPG",
    fullImage: "/attached_assets/0153_1749968831633.JPG",
    category: "wedding",
    title: "Intercambio de Anillos"
  },
  {
    image: "/attached_assets/0299_1749968860418.JPG",
    fullImage: "/attached_assets/0299_1749968860418.JPG",
    category: "wedding",
    title: "Mesa de Honor"
  },
  {
    image: "/attached_assets/72_1749968935429.jpg",
    fullImage: "/attached_assets/72_1749968935429.jpg",
    category: "wedding",
    title: "Caja de Anillos"
  },
  {
    image: "/attached_assets/74_1749968942020.jpg",
    fullImage: "/attached_assets/74_1749968942020.jpg",
    category: "wedding",
    title: "Colocando el Anillo"
  },
  {
    image: "/attached_assets/79_1749968952606.jpg",
    fullImage: "/attached_assets/79_1749968952606.jpg",
    category: "wedding",
    title: "Entrega de Anillos"
  },
  {
    image: "/attached_assets/145_1749968986304.jpg",
    fullImage: "/attached_assets/145_1749968986304.jpg",
    category: "wedding",
    title: "Boda Mexicana Tradicional"
  },
  {
    image: "/attached_assets/0100_1749965177206.JPG",
    fullImage: "/attached_assets/0100_1749965177206.JPG",
    category: "baptism",
    title: "Ceremonia de Bautizo"
  },
  {
    image: "/attached_assets/3_1749965551926.jpg",
    fullImage: "/attached_assets/3_1749965551926.jpg",
    category: "baptism",
    title: "Pila Bautismal"
  },
  {
    image: "/attached_assets/27_1749965590912.jpg",
    fullImage: "/attached_assets/27_1749965590912.jpg",
    category: "baptism",
    title: "Momento del Bautizo"
  },
  {
    image: "/attached_assets/5X%207_1752357418208.jpg",
    fullImage: "/attached_assets/5X%207_1752357418208.jpg",
    category: "baptism",
    title: "Bautizo Familiar con Padrinos"
  },
  {
    image: "/attached_assets/11_1749965679522.jpg",
    fullImage: "/attached_assets/11_1749965679522.jpg",
    category: "quinceanos",
    title: "Celebración de XV Años"
  },
  {
    image: "/attached_assets/16x20_1749966448545.jpg",
    fullImage: "/attached_assets/16x20_1749966448545.jpg",
    category: "quinceanos",
    title: "XV Años con Caballo"
  },
  {
    image: "/attached_assets/8_1749966582624.jpg",
    fullImage: "/attached_assets/8_1749966582624.jpg",
    category: "quinceanos",
    title: "Quinceañera Vestido Rojo"
  },
  {
    image: "/attached_assets/38_1749966627897.jpg",
    fullImage: "/attached_assets/38_1749966627897.jpg",
    category: "quinceanos",
    title: "Quinceañera en Escaleras"
  },
  {
    image: "/attached_assets/3_1749966655222.jpg",
    fullImage: "/attached_assets/3_1749966655222.jpg",
    category: "quinceanos",
    title: "XV Años Ambiente Rústico"
  },
  {
    image: "/attached_assets/17_1749966713506.jpg",
    fullImage: "/attached_assets/17_1749966713506.jpg",
    category: "quinceanos",
    title: "Quinceañera en Bote"
  },
  {
    image: "/attached_assets/19_1749966716242.jpg",
    fullImage: "/attached_assets/19_1749966716242.jpg",
    category: "quinceanos",
    title: "XV Años Lago Natural"
  },
  {
    image: "/attached_assets/34_1749966727518.jpg",
    fullImage: "/attached_assets/34_1749966727518.jpg",
    category: "quinceanos",
    title: "Quinceañera Vestido Azul"
  },
  {
    image: "/attached_assets/_MG_0024_1749966749035.JPG",
    fullImage: "/attached_assets/_MG_0024_1749966749035.JPG",
    category: "quinceanos",
    title: "XV Años Vestido Dorado"
  },
  {
    image: "/attached_assets/_MG_0031_1749966759733.JPG",
    fullImage: "/attached_assets/_MG_0031_1749966759733.JPG",
    category: "quinceanos",
    title: "Quinceañera Elegante"
  },
  {
    image: "/attached_assets/IMG_9458_1749966840785.jpg",
    fullImage: "/attached_assets/IMG_9458_1749966840785.jpg",
    category: "quinceanos",
    title: "XV Años Vestido Rosa"
  },
  {
    image: "/attached_assets/4_1749966916249.jpg",
    fullImage: "/attached_assets/4_1749966916249.jpg",
    category: "quinceanos",
    title: "Quinceañera Centro Ciudad"
  },
  {
    image: "/attached_assets/3H_1749966920084.jpg",
    fullImage: "/attached_assets/3H_1749966920084.jpg",
    category: "quinceanos",
    title: "XV Años Estilo Vintage"
  },
  {
    image: "/attached_assets/8_1749967163670.jpg",
    fullImage: "/attached_assets/8_1749967163670.jpg",
    category: "quinceanos",
    title: "XV Años Vestido Azul con Tiara"
  },
  {
    image: "/attached_assets/37_1749967202905.jpg",
    fullImage: "/attached_assets/37_1749967202905.jpg",
    category: "quinceanos",
    title: "Quinceañera Azul Elegante"
  },
  {
    image: "/attached_assets/28_1749967210774.jpg",
    fullImage: "/attached_assets/28_1749967210774.jpg",
    category: "quinceanos",
    title: "XV Años Sesión Bosque"
  },
  {
    image: "/attached_assets/7_1749965793632.jpg",
    fullImage: "/attached_assets/7_1749965793632.jpg",
    category: "babies",
    title: "Sesión de Bebé"
  },
  {
    image: "/attached_assets/_MG_4177%20copia_1749966226990.jpg",
    fullImage: "/attached_assets/_MG_4177%20copia_1749966226990.jpg",
    category: "babies",
    title: "Recién Nacido"
  },
  {
    image: "/attached_assets/IMG_4225%20copia_1749966266360.jpg",
    fullImage: "/attached_assets/IMG_4225%20copia_1749966266360.jpg",
    category: "babies",
    title: "Sesión Newborn"
  },
  {
    image: "/attached_assets/IMG_4262%20copia_1749966266362.jpg",
    fullImage: "/attached_assets/IMG_4262%20copia_1749966266362.jpg",
    category: "babies",
    title: "Newborn con Diadema"
  },
  {
    image: "/attached_assets/27_1749966309093.jpg",
    fullImage: "/attached_assets/27_1749966309093.jpg",
    category: "babies",
    title: "Bebé con Tutú Rosa"
  },
  {
    image: "/attached_assets/1_1749969345926.jpg",
    fullImage: "/attached_assets/1_1749969345926.jpg",
    category: "babies",
    title: "Newborn Envuelto en Manta"
  },
  {
    image: "/attached_assets/9_1749969345926.jpg",
    fullImage: "/attached_assets/9_1749969345926.jpg",
    category: "babies",
    title: "Recién Nacido Natural"
  },
  {
    image: "/attached_assets/11_1749969345926.jpg",
    fullImage: "/attached_assets/11_1749969345926.jpg",
    category: "babies",
    title: "Bebé Aviador"
  },
  {
    image: "/attached_assets/C43_1749969039266.jpg",
    fullImage: "/attached_assets/C43_1749969039266.jpg",
    category: "all",
    title: "Sesión de Compromiso Estadio"
  },
  {
    image: "/attached_assets/9_1749969062567.jpg",
    fullImage: "/attached_assets/9_1749969062567.jpg",
    category: "all",
    title: "Pareja en Estadio"
  },
  {
    image: "/attached_assets/4_1749969080194.jpg",
    fullImage: "/attached_assets/4_1749969080194.jpg",
    category: "all",
    title: "Momento Íntimo Estadio"
  },
  {
    image: "/attached_assets/11xEma_1749967658315.jpg",
    fullImage: "/attached_assets/11xEma_1749967658315.jpg",
    category: "communion",
    title: "Primera Comunión con Libro"
  },
  {
    image: "/attached_assets/7_1749967717090.jpg",
    fullImage: "/attached_assets/7_1749967717090.jpg",
    category: "communion",
    title: "Comunión Durante Ceremonia"
  },
  {
    image: "/attached_assets/129_1749967808354.jpg",
    fullImage: "/attached_assets/129_1749967808354.jpg",
    category: "communion",
    title: "Comunión Niño Elegante"
  },
  {
    image: "/attached_assets/11x14C_1749968111869.jpg",
    fullImage: "/attached_assets/11x14C_1749968111869.jpg",
    category: "communion",
    title: "Comunión con Diadema"
  },

  {
    image: "/attached_assets/6x8_1749968512184.jpg",
    fullImage: "/attached_assets/6x8_1749968512184.jpg",
    category: "communion",
    title: "Comunión Niño con Rosario"
  },
  {
    image: "/attached_assets/3_1749968534675.jpg",
    fullImage: "/attached_assets/3_1749968534675.jpg",
    category: "communion",
    title: "Comunión Leyendo en Naturaleza"
  },
  {
    image: "/attached_assets/17_1749968552420.jpg",
    fullImage: "/attached_assets/17_1749968552420.jpg",
    category: "communion",
    title: "Comunión Sonrisa Natural"
  },

  // Fotografía Escolar
  {
    image: "/attached_assets/6º A_1752356557517.jpg",
    fullImage: "/attached_assets/6º A_1752356557517.jpg",
    category: "school",
    title: "Sexto Grado - Generación 2012-2018"
  },
  {
    image: "/attached_assets/6º Bel_1752356557518.jpg",
    fullImage: "/attached_assets/6º Bel_1752356557518.jpg",
    category: "school",
    title: "Graduación Colegio Tercer Milenio"
  },
  {
    image: "/attached_assets/8X%206T%20Aaron_1752357317052.jpg",
    fullImage: "/attached_assets/8X%206T%20Aaron_1752357317052.jpg",
    category: "school",
    title: "Retrato de Graduación - Aarón"
  },
  {
    image: "/attached_assets/8X%206TKarlita_1752356557518.jpg",
    fullImage: "/attached_assets/8X%206TKarlita_1752356557518.jpg",
    category: "school",
    title: "Retrato de Graduación - Karlita"
  },
  {
    image: "/attached_assets/8x%20BSalomon_1752356557519.jpg",
    fullImage: "/attached_assets/8x%20BSalomon_1752356557519.jpg",
    category: "school",
    title: "Graduación Preescolar - Salomon"
  },
  {
    image: "/attached_assets/Preesco Bel_1752356557519.jpg",
    fullImage: "/attached_assets/Preesco Bel_1752356557519.jpg",
    category: "school",
    title: "Graduación Preescolar - Generación 2018-2021"
  },
  {
    image: "/attached_assets/TSCamila 2_1752356557520.jpg",
    fullImage: "/attached_assets/TSCamila 2_1752356557520.jpg",
    category: "school",
    title: "Graduación Técnica Superior - Camila"
  },
  {
    image: "/attached_assets/TSMarco 3_1752356557520.jpg",
    fullImage: "/attached_assets/TSMarco 3_1752356557520.jpg",
    category: "school",
    title: "Graduación Técnica Superior - Marco"
  },
];

const filterOptions = [
  { value: "all", label: "Sesiones" },
  { value: "wedding", label: "Bodas" },
  { value: "baptism", label: "Bautizos" },
  { value: "communion", label: "Comuniones" },
  { value: "quinceanos", label: "XV Años" },
  { value: "babies", label: "Bebés" },
  { value: "prenatal", label: "Prenatal" },
  { value: "school", label: "Fotografía Escolar" },
];

interface PortfolioGalleryProps {
  onImageClick?: (image: string, images: string[]) => void;
}

export default function PortfolioGallery({ onImageClick }: PortfolioGalleryProps) {
  const [activeFilter, setActiveFilter] = useState("");

  const filteredItems = portfolioItems.filter(
    (item) => {
      if (activeFilter === "") return false;
      if (activeFilter === "all") return item.category === "all" || item.category === "session";
      return item.category === activeFilter;
    }
  );

  const handleImageClick = (item: PortfolioItem) => {
    if (onImageClick) {
      const categoryImages = portfolioItems
        .filter(i => i.category === item.category)
        .map(i => i.fullImage);
      onImageClick(item.fullImage, categoryImages);
    }
  };

  return (
    <section id="portfolio" className="py-16 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Portfolio
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Explora mi trabajo organizado por categorías
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {filterOptions.map((option) => (
            <Button
              key={option.value}
              variant={activeFilter === option.value ? "default" : "outline"}
              onClick={() => setActiveFilter(option.value)}
              data-filter-value={option.value}
              className="transition-all duration-300"
            >
              {option.label}
            </Button>
          ))}
        </div>

        {filteredItems.length === 0 && activeFilter === "" ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
              Selecciona una categoría para ver las imágenes
            </p>
            <p className="text-gray-500 dark:text-gray-400">
              Haz clic en cualquier botón de arriba para explorar mi trabajo
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item, index) => (
              <div
                key={index}
                className="portfolio-item group relative overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 aspect-[4/3] cursor-pointer"
                onClick={() => handleImageClick(item)}
              >
                <img
                  src={item.image}
                  alt={item.title || `Portfolio item ${index + 1}`}
                  className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${
                    item.image.includes('5X%207_1752357418208.jpg') ? 'object-top' : ''
                  } ${
                    item.image.includes('8_1749966582624.jpg') ? 'object-center' : ''
                  } ${
                    item.image.includes('16x20_1749966448545.jpg') || 
                    item.image.includes('8_1749966582624_old.jpg') ||
                    item.image.includes('38_1749966627897.jpg') ||
                    item.image.includes('17_1749966713506.jpg') ||
                    item.image.includes('_MG_0024_1749966749035.JPG') ||
                    item.image.includes('_MG_0031_1749966759733.JPG') ||
                    item.image.includes('IMG_9458_1749966840785.jpg') ||
                    item.image.includes('28_1749967210774.jpg') ? 'object-top' : ''
                  }`}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300">
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredItems.length === 0 && activeFilter !== "" && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No se encontraron imágenes para esta categoría.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}