import { Instagram, Facebook, Mail, Phone } from "lucide-react";

const socialLinks = [
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Mail, href: "#", label: "Pinterest" },
  { icon: Phone, href: "#", label: "Behance" },
];

export default function Footer() {
  return (
    <footer className="bg-black text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h3 className="font-serif text-3xl font-bold mb-4">Vane Andrade</h3>
          <p className="text-gray-400 mb-6">Fotógrafa Profesional</p>
          <div className="flex justify-center space-x-6 mb-8">
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.href}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label={social.label}
              >
                <social.icon className="w-6 h-6" />
              </a>
            ))}
          </div>
          <div className="border-t border-gray-800 pt-8">
            <p className="text-gray-400">
              &copy; 2024 Vane Andrade. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
