import { Link } from 'react-router-dom';

export default function Footer() {
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-surface-container-low dark:bg-inverse-surface w-full border-t border-outline-variant/30 mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center px-6 md:px-margin-desktop py-12 md:py-20 gap-8 w-full max-w-container-max mx-auto">
        <div className="mb-6 md:mb-0 text-center md:text-right">
          <Link to="/" onClick={handleScrollToTop} className="font-bold text-2xl text-on-surface dark:text-surface block mb-3 hover:opacity-85 transition-opacity">
            جاليري مارينا
          </Link>
          <p className="font-body-md text-sm text-secondary dark:text-secondary-fixed">
            © ٢٠٢٦ جاليري مارينا للاثاث الفرنسي. جميع الحقوق محفوظة.
          </p>
          <p className="font-body-md text-sm text-secondary dark:text-secondary-fixed mt-2">
            تم التصميم بواسطة{' '}
            <a 
              href="https://nova-4solutions.vercel.app" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-error hover:text-error/80 underline font-semibold transition-colors"
            >
              Nova Solutions
            </a>
          </p>
        </div>

        <nav className="flex flex-wrap justify-center gap-6 text-sm font-semibold">
          <Link to="/" onClick={handleScrollToTop} className="text-secondary dark:text-secondary-fixed-dim hover:text-error transition-colors">
            الرئيسية
          </Link>
          <a href="#about" className="text-secondary dark:text-secondary-fixed-dim hover:text-error transition-colors">
            الفروع واتصل بنا
          </a>
          <a href="#" className="text-secondary dark:text-secondary-fixed-dim hover:text-error transition-colors">
            سياسة الخصوصية
          </a>
          <a href="#" className="text-secondary dark:text-secondary-fixed-dim hover:text-error transition-colors">
            الشروط والأحكام
          </a>
        </nav>
      </div>
    </footer>
  );
}
