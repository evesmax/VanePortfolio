import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [portfolioDropdownOpen, setPortfolioDropdownOpen] = useState(false);

  const navItems = [
    { href: "#inicio", label: "Inicio" },
    { href: "#portfolio", label: "Portfolio" },
    { href: "#sobre-mi", label: "Sobre Mí" },
    { href: "#servicios", label: "Servicios" },
    { href: "#contacto", label: "Contacto" },
  ];

  const portfolioCategories = [
    { filter: "all", label: "Sesiones", href: "#portfolio" },
    { filter: "wedding", label: "Bodas", href: "#portfolio" },
    { filter: "baptism", label: "Bautizos", href: "#portfolio" },
    { filter: "communion", label: "Comuniones", href: "#portfolio" },
    { filter: "quinceanos", label: "XV Años", href: "#portfolio" },
    { filter: "babies", label: "Bebés", href: "#portfolio" },
  ];

  const handleNavClick = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      const offsetTop = element.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
    }
    setMobileMenuOpen(false);
    setPortfolioDropdownOpen(false);
  };

  const handlePortfolioClick = (filter: string) => {
    // Scroll to portfolio section
    const element = document.querySelector("#portfolio");
    if (element) {
      const offsetTop = element.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
    }
    
    // Trigger the filter change after a short delay to ensure smooth scrolling
    setTimeout(() => {
      const filterButtons = document.querySelectorAll('[data-filter-value]');
      filterButtons.forEach(button => {
        if (button.getAttribute('data-filter-value') === filter) {
          (button as HTMLButtonElement).click();
        }
      });
    }, 500);
    
    setPortfolioDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <img 
              src="/attached_assets/LogoVaneAndrade_1749964267294.png" 
              alt="Vane Andrade Fotógrafa" 
              className="h-10"
            />
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navItems.map((item) => (
                item.label === "Portfolio" ? (
                  <div key={item.href} className="relative">
                    <button
                      onClick={() => setPortfolioDropdownOpen(!portfolioDropdownOpen)}
                      className="text-gray-800 hover:text-black transition-colors font-medium flex items-center"
                    >
                      {item.label}
                      <ChevronDown className="ml-1 h-4 w-4" />
                    </button>
                    {portfolioDropdownOpen && (
                      <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                        {portfolioCategories.map((category) => (
                          <button
                            key={category.filter}
                            onClick={() => handlePortfolioClick(category.filter)}
                            className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 transition-colors first:rounded-t-lg last:rounded-b-lg"
                          >
                            {category.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    key={item.href}
                    onClick={() => handleNavClick(item.href)}
                    className="text-gray-800 hover:text-black transition-colors font-medium"
                  >
                    {item.label}
                  </button>
                )
              ))}
            </div>
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-800 hover:text-black"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              item.label === "Portfolio" ? (
                <div key={item.href} className="space-y-1">
                  <button
                    onClick={() => handleNavClick(item.href)}
                    className="block w-full text-left px-3 py-2 text-gray-800 hover:text-black font-medium"
                  >
                    {item.label}
                  </button>
                  <div className="pl-6 space-y-1">
                    {portfolioCategories.map((category) => (
                      <button
                        key={category.filter}
                        onClick={() => handlePortfolioClick(category.filter)}
                        className="block w-full text-left px-3 py-2 text-gray-600 hover:text-gray-800 text-sm"
                      >
                        {category.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <button
                  key={item.href}
                  onClick={() => handleNavClick(item.href)}
                  className="block w-full text-left px-3 py-2 text-gray-800 hover:text-black"
                >
                  {item.label}
                </button>
              )
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
