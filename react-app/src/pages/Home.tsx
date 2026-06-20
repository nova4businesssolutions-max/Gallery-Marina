import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../utils/supabase';

interface Category {
  id: number;
  name: string;
  image_url: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  product_code: string;
  main_image_url: string;
  category_id: number;
}

const HERO_SLIDES = [
  {
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBk6HKl8pJgtW13Vx-XKP_FpF5qr0hXTuK8ueLhPKNzQX_vibPc-l8O9v6F_zZ-msFvajcoTT2kaV6vYEmwAi3kElLMnV0K4mrIqmLs2IxCUAiqIEcbxKuqZ8W60eeIKLzms-w_4AR_bxMhCNrIrzWDjBg8_9kq5FJFrsWU4i9jPo7nSwAsZgISVPo22zTYgzu1AkJ5FUdEezpTvn2u7dWJJ72PP5wXzyWjovbaF6KbKBhf8CILOp1MdKDPHQwRbDr2Rodi7qpCX29L',
    title: 'فخامة الأثاث الفرنسي في مساحتك',
    subtitle: 'نقدم لك مجموعة حصرية من أرقى قطع الأثاث التي تجمع بين التراث الفرنسي العريق واللمسات العصرية الراقية، لتضفي جوّاً من الفخامة والهدوء على منزلك.'
  },
  {
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnZeItf0p4FSSnB2dnOgL1_BZoswDUgQSlnNEnhbry6GdAjWZbapOstyzdBjILU0VQ24EoxEBV60poamr7WPOayawIGvtcPrvaKxRv5JAqi3VYenTPwfi9dI3s5uUG_jQJdglYFyMa86vOHXXZ8V-sLKOjbAzEgL3Cmw28oSzqktK-ZUp77MDu0FzpENNK9i_7XFfg7LEFvkAqK_0n69JrnXlOsm9GajOUO10V8d54k0HbNM_Ld0Pv_BGWiihicvMQE7ep87QyzoAy',
    title: 'غرف نوم كلاسيكية دافئة',
    subtitle: 'استمتع بالراحة الفائقة والأناقة الاستثنائية مع تصميمات غرف النوم المستوحاة من القصور الفرنسية العريقة.'
  },
  {
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAzIZRL02KqwNX4iMWtmQAA6e8yEq69022IizBP8NPREytOCIRbEbrUd8sVKaq_1a8dIgtF0MExaZtcpfim3ErVC4vThgVf3r5OTL_P6ZqgO_RZuJqZDLv4hnPbyl-HSBaP0cSAGsILfAvKF8nKxcapBijDvG3eaDWzhTaquRD82bivWgTHEKN2KZhmt1zOTvldzMSEhkpOcSF0MorXnWqC9SvJQz-fqRGd5YD8kbXM3ZTCmtclX-B29wiHq9Gt86BL38kyg9nDuukh',
    title: 'صالونات وصالات استقبال مذهلة',
    subtitle: 'قطع فنية فريدة محفورة يدوياً من خشب الزان الروماني الأصيل، لتجعل من صالتك لوحة فنية تبهر ضيوفك.'
  }
];

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [currentBestSlide, setCurrentBestSlide] = useState(0);
  
  const location = useLocation();

  useEffect(() => {
    // Fetch categories and best selling products
    async function fetchData() {
      const { data: catData } = await supabase
        .from('categories')
        .select('*')
        .order('id', { ascending: true });
      if (catData) {
        setCategories(catData);
        
        // Fetch first product of each category
        const { data: allProducts } = await supabase
          .from('products')
          .select('*')
          .order('id', { ascending: true });
        
        if (allProducts) {
          const firstProductsMap = new Map<number, Product>();
          allProducts.forEach(prod => {
            if (prod.category_id && !firstProductsMap.has(prod.category_id)) {
              firstProductsMap.set(prod.category_id, prod);
            }
          });
          setBestSellers(Array.from(firstProductsMap.values()));
        }
      }
    }
    fetchData();

    // Scroll to about if state flag exists
    if (location.state?.scrollToAbout) {
      setTimeout(() => {
        const aboutSec = document.getElementById('about');
        if (aboutSec) aboutSec.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  }, [location]);

  // Hero auto-slider timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Best sellers auto-slider timer
  useEffect(() => {
    if (bestSellers.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentBestSlide((prev) => (prev + 1) % bestSellers.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [bestSellers]);

  return (
    <div className="pt-[100px] w-full overflow-hidden">
      
      {/* Hero Carousel */}
      <section className="relative w-full h-[60vh] md:h-[80vh] bg-surface-container">
        {HERO_SLIDES.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out flex items-center ${
              idx === currentHeroSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {/* Background Image overlay */}
            <div className="absolute inset-0 bg-black/35 z-10" />
            <img
              alt={slide.title}
              className="w-full h-full object-cover absolute inset-0"
              src={slide.image}
            />
            {/* Slide Content */}
            <div className="relative z-20 max-w-container-max mx-auto px-6 md:px-margin-desktop w-full text-white flex flex-col gap-6 items-start">
              <h1 className="text-4xl md:text-6xl font-bold max-w-2xl leading-tight text-white drop-shadow-md">
                {slide.title}
              </h1>
              <p className="text-base md:text-lg max-w-xl text-white/90 leading-relaxed drop-shadow-sm">
                {slide.subtitle}
              </p>
              <div className="flex gap-4 mt-2">
                <Link
                  to="/category/2" // Assuming 2 is Salons or go to any category
                  className="bg-error hover:bg-error/95 text-white font-bold px-8 py-4 rounded-md shadow-lg transition-transform hover:-translate-y-0.5"
                >
                  تصفح المجموعات
                </Link>
              </div>
            </div>
          </div>
        ))}
        {/* Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-30">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentHeroSlide(idx)}
              className={`w-3 h-3 rounded-full transition-all ${
                idx === currentHeroSlide ? 'bg-error w-8' : 'bg-white/50 hover:bg-white'
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Auto-sliding Best Selling Products */}
      {bestSellers.length > 0 && (
        <section className="max-w-container-max mx-auto px-6 md:px-margin-desktop py-16 md:py-24">
          <div className="text-center mb-12">
            <span className="text-error font-bold text-sm uppercase tracking-widest block mb-2">القطع الأكثر طلباً</span>
            <h2 className="text-3xl md:text-4xl font-bold text-on-surface">أفضل المنتجات مبيعاً</h2>
            <div className="w-16 h-1 bg-error mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="relative w-full max-w-4xl mx-auto overflow-hidden rounded-2xl shadow-xl bg-white border border-outline-variant/30">
            {/* Sliding Container */}
            <div 
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(${currentBestSlide * 100}%)` }} // RTL support translates positive
            >
              {bestSellers.map((prod) => (
                <div key={prod.id} className="min-w-full flex flex-col md:flex-row items-stretch">
                  {/* Product Image */}
                  <div className="w-full md:w-1/2 aspect-[4/3] md:aspect-auto relative overflow-hidden bg-surface-container">
                    <img 
                      src={prod.main_image_url} 
                      alt={prod.name} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  {/* Product Info */}
                  <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center gap-4 text-right">
                    <span className="text-secondary font-bold text-xs uppercase tracking-wider">الرمز: {prod.product_code}</span>
                    <h3 className="text-2xl md:text-3xl font-bold text-on-surface">{prod.name}</h3>
                    <p className="text-on-surface-variant text-sm md:text-base leading-relaxed line-clamp-4">
                      {prod.description}
                    </p>
                    <div className="pt-4">
                      <Link 
                        to={`/product/${prod.id}`}
                        className="inline-flex items-center gap-2 bg-primary text-white hover:bg-primary/90 font-semibold px-6 py-3 rounded transition-colors"
                      >
                        <span>عرض التفاصيل</span>
                        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Dots */}
            <div className="absolute bottom-4 right-8 flex gap-2">
              {bestSellers.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentBestSlide(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    idx === currentBestSlide ? 'bg-primary w-6' : 'bg-secondary/40 hover:bg-secondary'
                  }`}
                  aria-label={`Product Slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Sliding/Interactive Categories Section */}
      <section className="bg-surface-container-low py-16 md:py-24">
        <div className="max-w-container-max mx-auto px-6 md:px-margin-desktop">
          <div className="flex justify-between items-end mb-12">
            <div className="text-right">
              <span className="text-error font-bold text-sm uppercase tracking-widest block mb-2">تصفح حسب الفئة</span>
              <h2 className="text-3xl md:text-4xl font-bold text-on-surface">الفئات الرئيسية</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.id}`}
                className="group relative h-[300px] overflow-hidden rounded-xl shadow-md block transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <img
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  src={cat.image_url}
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-1">
                    {cat.name}
                  </h3>
                  <span className="text-white/75 text-sm font-semibold flex items-center gap-1 group-hover:text-error transition-colors">
                    عرض المعروضات
                    <span className="material-symbols-outlined text-[16px] transition-transform group-hover:-translate-x-1">arrow_back</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* About & Contact Section */}
      <section id="about" className="max-w-container-max mx-auto px-6 md:px-margin-desktop py-16 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Contact info & Socials */}
        <div className="lg:col-span-5 flex flex-col gap-6 text-right">
          <div>
            <span className="text-error font-bold text-sm uppercase tracking-widest block mb-2">من نحن</span>
            <h2 className="text-3xl md:text-4xl font-bold text-on-surface mb-4">جاليري مارينا للأثاث</h2>
            <p className="text-on-surface-variant text-base leading-relaxed">
              نفخر بتقديم تشكيلة واسعة من الأثاث الفرنسي الكلاسيكي الفاخر، المصنوع بالكامل بأيدي أمهر الحرفيين من خشب الزان الأحمر الروماني عالي الجودة والدهانات واللمسات الفرنسية المعتقة. نخدم عملاءنا بتقديم تجربة تسوق راقية تلائم جميع الأذواق الفاخرة.
            </p>
          </div>

          <div className="flex flex-col gap-4 mt-2">
            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-error text-2xl mt-1">location_on</span>
              <div>
                <h4 className="font-bold text-on-surface">العنوان والفرع الرئيسي</h4>
                <a 
                  href="https://maps.app.goo.gl/9tX6fkebEz8h372w8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-on-surface-variant text-sm mt-1 hover:text-error underline transition-colors"
                >
                  أسيوط، تقسيم فريال، شارع محمود رشوان، مصر
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-error text-2xl mt-1">call</span>
              <div>
                <h4 className="font-bold text-on-surface">اتصل بنا</h4>
                <a 
                  href="tel:+201001921359" 
                  className="text-on-surface-variant text-sm mt-1 hover:text-error transition-colors"
                  dir="ltr"
                >
                  +20 100 192 1359
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-error text-2xl mt-1">mail</span>
              <div>
                <h4 className="font-bold text-on-surface">البريد الإلكتروني</h4>
                <a 
                  href="mailto:info@gallerymarina.com"
                  className="text-on-surface-variant text-sm mt-1 hover:text-error transition-colors"
                >
                  info@gallerymarina.com
                </a>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="pt-4 border-t border-outline-variant/30">
            <h4 className="font-bold text-on-surface mb-3">تابعنا على وسائل التواصل</h4>
            <div className="flex gap-4">
              <a 
                href="https://www.facebook.com/profile.php?id=100063781297288" 
                target="_blank" 
                rel="noreferrer" 
                className="w-10 h-10 rounded-full border border-outline bg-white flex items-center justify-center text-secondary hover:text-error hover:border-error transition-all"
                title="فيسبوك"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                </svg>
              </a>
              <a 
                href="https://www.tiktok.com/@gallerymarina33" 
                target="_blank" 
                rel="noreferrer" 
                className="w-10 h-10 rounded-full border border-outline bg-white flex items-center justify-center text-secondary hover:text-error hover:border-error transition-all"
                title="تيك توك"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.23.95.83 2.13 1.34 3.39 1.51V9.4c-1.63-.02-3.21-.61-4.48-1.65-.08 2.89-.02 5.78-.05 8.67-.04 1.25-.33 2.51-.95 3.61-.98 1.52-2.61 2.59-4.43 2.87-1.74.22-3.57-.15-5.01-1.18-1.57-1.13-2.53-2.98-2.52-4.93.02-2.12 1.15-4.14 2.97-5.17 1.25-.69 2.69-.93 4.09-.72v3.83c-1-.24-2.09-.07-2.94.52-.77.56-1.22 1.5-1.2 2.46.01.88.42 1.72 1.12 2.24.71.5 1.6.66 2.45.42 1.01-.26 1.77-1.16 1.83-2.2.04-3.32.01-6.64.02-9.96C12.54 2.44 12.52 1.23 12.525.02z"/>
                </svg>
              </a>
              <a 
                href="https://api.whatsapp.com/send?phone=201001921359" 
                target="_blank" 
                rel="noreferrer" 
                className="w-10 h-10 rounded-full border border-outline bg-white flex items-center justify-center text-secondary hover:text-error hover:border-error transition-all"
                title="واتساب"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.498 1.45 5.416 1.451 5.378 0 9.753-4.375 9.756-9.757.002-2.607-1.01-5.059-2.852-6.902C17.078 2.099 14.621 1.085 12 1.085c-5.385 0-9.763 4.377-9.767 9.76-.001 1.958.513 3.868 1.492 5.578L2.735 20.8l4.417-1.161c-.139-.074-.325-.131-.495-.213l-.01-.002zM15.421 12.92c-.29-.145-1.716-.848-1.982-.945-.266-.097-.459-.145-.653.145-.193.29-.748.945-.918 1.139-.17.194-.34.218-.63.073-.29-.145-1.226-.452-2.336-1.442-.864-.77-1.447-1.721-1.616-2.012-.17-.29-.018-.447.127-.591.13-.13.29-.339.435-.509.145-.17.193-.29.29-.485.097-.194.048-.364-.024-.509-.073-.145-.653-1.574-.895-2.156-.236-.569-.475-.491-.653-.5-.17-.008-.364-.01-.557-.01-.193 0-.509.072-.775.364-.266.29-1.017.993-1.017 2.42 0 1.428 1.04 2.809 1.186 3.003.145.194 2.046 3.125 4.957 4.38.693.3 1.233.479 1.655.613.696.22 1.33.19 1.83.115.558-.083 1.716-.702 1.958-1.38.242-.68.242-1.26.17-1.38-.072-.122-.266-.194-.557-.34z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Map Column */}
        <div className="lg:col-span-7 h-[350px] md:h-[450px] w-full rounded-2xl overflow-hidden shadow-lg border border-outline-variant">
          <iframe 
            title="خريطة الفرع الرئيسي لجاليري مارينا"
            src="https://maps.google.com/maps?q=27.1908594,31.1808302&z=17&output=embed" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen={true}
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>

    </div>
  );
}
