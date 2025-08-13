import vaneProfileImage from "@assets/IMG-20170306-WA0023_1749064834537.jpg";

export default function AboutSection() {
  return (
    <section id="sobre-mi" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <img
              src={vaneProfileImage}
              alt="Vane Andrade - Fotógrafa Profesional"
              className="w-full h-96 lg:h-[500px] object-cover object-[center_20%] rounded-lg shadow-lg"
            />
          </div>
          <div>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-black mb-6">
              Sobre Mí
            </h2>
            <p className="text-gray-600 text-lg mb-6 leading-relaxed">
              Soy Vane Andrade, fotógrafa con una trayectoria de más de 15 años dedicada a inmortalizar historias.
            </p>
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              Con más de 15 años de experiencia capturando la esencia de momentos inolvidables, mi cámara ha sido testigo de la alegría de bodas, la ilusión de XV años, la pureza de comuniones y bautizos, y la magia de cada sesión fotográfica. Disfruto inmensamente trabajar con niños, encontrar esa chispa única en sus sonrisas y gestos. Además, hay algo en la majestuosidad de los paisajes, especialmente la luna, que me cautiva y me inspira a buscar la belleza en cada rincón del mundo. Cada foto que tomo es una pieza de mi corazón, un recuerdo congelado para siempre.
            </p>
            <div className="flex space-x-6">
              <div className="text-center">
                <div className="font-serif text-3xl font-bold text-black">200+</div>
                <div className="text-gray-600">Bodas Fotografiadas</div>
              </div>
              <div className="text-center">
                <div className="font-serif text-3xl font-bold text-black">15</div>
                <div className="text-gray-600">Años de Experiencia</div>
              </div>
              <div className="text-center">
                <div className="font-serif text-3xl font-bold text-black">800+</div>
                <div className="text-gray-600">Clientes Satisfechos</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
