import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LightboxContextType {
  openLightbox: (image: string, images: string[]) => void;
  closeLightbox: () => void;
}

const LightboxContext = createContext<LightboxContextType | undefined>(undefined);

export const useLightbox = () => {
  const context = useContext(LightboxContext);
  if (!context) {
    throw new Error("useLightbox must be used within a LightboxProvider");
  }
  return context;
};

interface LightboxProviderProps {
  children: React.ReactNode;
}

export function LightboxProvider({ children }: LightboxProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openLightbox = useCallback((image: string, imageList: string[]) => {
    setCurrentImage(image);
    setImages(imageList);
    setCurrentIndex(imageList.indexOf(image));
    setIsOpen(true);
    document.body.style.overflow = "hidden";
  }, []);

  const closeLightbox = useCallback(() => {
    setIsOpen(false);
    document.body.style.overflow = "auto";
  }, []);

  const showNextImage = useCallback(() => {
    const nextIndex = (currentIndex + 1) % images.length;
    setCurrentIndex(nextIndex);
    setCurrentImage(images[nextIndex]);
  }, [currentIndex, images]);

  const showPrevImage = useCallback(() => {
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    setCurrentIndex(prevIndex);
    setCurrentImage(images[prevIndex]);
  }, [currentIndex, images]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "Escape":
          closeLightbox();
          break;
        case "ArrowRight":
          showNextImage();
          break;
        case "ArrowLeft":
          showPrevImage();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeLightbox, showNextImage, showPrevImage]);

  const contextValue = {
    openLightbox,
    closeLightbox,
  };

  return (
    <LightboxContext.Provider value={contextValue}>
      {children}
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/95">
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <Button
              onClick={closeLightbox}
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <X className="w-8 h-8" />
            </Button>
            
            {images.length > 1 && (
              <>
                <Button
                  onClick={showPrevImage}
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
                >
                  <ChevronLeft className="w-8 h-8" />
                </Button>
                <Button
                  onClick={showNextImage}
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
                >
                  <ChevronRight className="w-8 h-8" />
                </Button>
              </>
            )}
            
            <img
              src={currentImage}
              alt="Lightbox image"
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          
          <div
            className="absolute inset-0 z-0"
            onClick={closeLightbox}
          />
        </div>
      )}
    </LightboxContext.Provider>
  );
}

export default function Lightbox() {
  return null; // The lightbox is rendered by the provider
}
