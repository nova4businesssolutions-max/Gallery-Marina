import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../utils/supabase';

interface Category {
  id: number;
  name: string;
  image_url: string;
}

export default function Navbar() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    async function fetchCategories() {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('id', { ascending: true });
      if (!error && data) {
        setCategories(data);
      }
    }
    fetchCategories();

    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAboutClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollToAbout: true } });
    } else {
      const aboutSection = document.getElementById('about');
      if (aboutSection) {
        aboutSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setMobileMenuOpen(false);
  };

  return (
    <header 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-[0_10px_30px_rgba(5,4,4,0.06)]' 
          : 'bg-white/80 backdrop-blur-sm shadow-sm'
      }`}
    >
      <div 
        className={`flex justify-between items-center px-6 md:px-margin-desktop max-w-container-max mx-auto transition-all duration-300 ${
          scrolled ? 'h-[75px]' : 'h-[95px]'
        }`}
      >
        {/* Mobile Menu Button (Right on RTL) */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
          className="md:hidden text-on-surface hover:text-error transition-colors p-2 focus:outline-none"
          aria-label="Toggle Menu"
        >
          <span className="material-symbols-outlined text-3xl">
            {mobileMenuOpen ? 'close' : 'menu'}
          </span>
        </button>

        {/* Brand/Logo */}
        <Link to="/" className="flex items-center gap-4 group">
          <img 
            alt="جاليري مارينا للاثاث الفرنسي Logo" 
            className={`w-auto object-contain rounded-lg transition-all duration-350 ease-out group-hover:scale-110 group-hover:-rotate-2 group-hover:shadow-[0_10px_25px_rgba(192,80,77,0.25)] ${
              scrolled ? 'h-14 md:h-16' : 'h-16 md:h-20'
            }`} 
            src="/Assets/logo.jpeg"
          />
          <span className="font-bold text-lg md:text-2xl text-on-surface tracking-tight group-hover:text-error transition-colors duration-300">
            جاليري مارينا
          </span>
        </Link>

        {/* Navigation Links (Desktop) */}
        <nav className="hidden md:flex gap-8 items-center">
          <Link 
            to="/" 
            className={`font-semibold text-sm hover:text-error transition-colors ${
              location.pathname === '/' ? 'text-error border-b-2 border-error pb-1' : 'text-on-surface-variant'
            }`}
          >
            الرئيسية
          </Link>
          
          {categories.map((cat) => {
            const catPath = `/category/${cat.id}`;
            const isActive = location.pathname === catPath;
            return (
              <Link 
                key={cat.id} 
                to={catPath}
                className={`font-semibold text-sm hover:text-error transition-colors ${
                  isActive ? 'text-error border-b-2 border-error pb-1' : 'text-on-surface-variant'
                }`}
              >
                {cat.name}
              </Link>
            );
          })}

          <a 
            href="#about" 
            onClick={handleAboutClick}
            className="font-semibold text-sm text-on-surface-variant hover:text-error transition-colors"
          >
            عن مارينا
          </a>
        </nav>

        {/* Trailing Admin link */}
        <div className="flex items-center gap-3">
          <Link 
            to="/admin" 
            className="text-on-surface-variant hover:text-error transition-colors flex items-center p-2 rounded-full hover:bg-surface-variant/30"
            title="لوحة التحكم"
          >
            <span className="material-symbols-outlined text-2xl">settings</span>
          </Link>
        </div>
      </div>

      {/* Mobile Drawer (Smooth slide-down overlay) */}
      <div 
        className={`md:hidden absolute left-0 w-full bg-white border-t border-outline-variant shadow-lg overflow-hidden transition-all duration-300 ease-in-out ${
          scrolled ? 'top-[75px]' : 'top-[95px]'
        } ${
          mobileMenuOpen ? 'max-h-[400px] opacity-100 py-4' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        <nav className="flex flex-col px-6 gap-4">
          <Link 
            to="/" 
            onClick={() => setMobileMenuOpen(false)}
            className={`font-semibold text-base py-2 hover:text-error transition-colors ${
              location.pathname === '/' ? 'text-error border-r-4 border-error pr-2' : 'text-on-surface'
            }`}
          >
            الرئيسية
          </Link>

          {categories.map((cat) => {
            const catPath = `/category/${cat.id}`;
            const isActive = location.pathname === catPath;
            return (
              <Link 
                key={cat.id} 
                to={catPath}
                onClick={() => setMobileMenuOpen(false)}
                className={`font-semibold text-base py-2 hover:text-error transition-colors ${
                  isActive ? 'text-error border-r-4 border-error pr-2' : 'text-on-surface'
                }`}
              >
                {cat.name}
              </Link>
            );
          })}

          <a 
            href="#about" 
            onClick={handleAboutClick}
            className="font-semibold text-base py-2 text-on-surface hover:text-error transition-colors"
          >
            عن مارينا
          </a>
        </nav>
      </div>
    </header>
  );
}
