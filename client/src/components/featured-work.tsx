import { useState } from "react";

interface GalleryItem {
  image: string;
  title: string;
  description: string;
  fullImage: string;
}

const featuredItems: GalleryItem[] = [
  {
    image: "/attached_assets/IMG_7482_1749967501414.JPG",
    fullImage: "/attached_assets/IMG_7482_1749967501414.JPG",
    title: "Día de los Muertos",
    description: "Arte cultural y tradición mexicana",
  },
  {
    image: "/attached_assets/IMG_7255_1749967554389.JPG",
    fullImage: "/attached_assets/IMG_7255_1749967554389.JPG",
    title: "Catrina Moderna",
    description: "Retrato conceptual del Día de los Muertos",
  },
  {
    image: "/attached_assets/11_1749965679522.jpg",
    fullImage: "/attached_assets/11_1749965679522.jpg",
    title: "XV Años",
    description: "Celebraciones memorables",
  },
];

interface FeaturedWorkProps {
  onImageClick?: (image: string, images: string[]) => void;
}

export default function FeaturedWork({ onImageClick }: FeaturedWorkProps) {
  const handleImageClick = (item: GalleryItem) => {
    if (onImageClick) {
      const images = featuredItems.map(item => item.fullImage);
      const index = featuredItems.indexOf(item);
      onImageClick(item.fullImage, images);
    }
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-black mb-4">
            Trabajo Destacado
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Una selección de mis fotografías más representativas
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredItems.map((item, index) => (
            <div
              key={index}
              className="gallery-item cursor-pointer transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl"
              onClick={() => handleImageClick(item)}
            >
              <img
                src={item.image}
                alt={item.title}
                className={`w-full h-80 object-cover rounded-lg ${
                  item.title === "Arte" && item.image.includes("IMG_6487") ? "butterfly-art" : ""
                }`}
              />
              <div className="mt-4">
                <h3 className="font-serif text-xl font-semibold">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
