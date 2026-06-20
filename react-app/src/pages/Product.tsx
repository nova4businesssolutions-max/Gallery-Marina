import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../utils/supabase';

interface Product {
  id: number;
  name: string;
  description: string;
  product_code: string;
  main_image_url: string;
  category_id: number;
}

interface ProductImage {
  id: number;
  image_url: string;
  display_order: number;
}

interface Category {
  id: number;
  name: string;
}

export default function Product() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [activeImage, setActiveImage] = useState<string>('');
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProductDetails() {
      if (!id) return;
      setLoading(true);

      // 1. Fetch Product
      const { data: prodData, error: prodError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (prodError || !prodData) {
        console.error('Error fetching product:', prodError);
        setLoading(false);
        return;
      }
      setProduct(prodData);

      // 2. Fetch Category details
      if (prodData.category_id) {
        const { data: catData } = await supabase
          .from('categories')
          .select('id, name')
          .eq('id', prodData.category_id)
          .single();
        if (catData) setCategory(catData);
      }

      // 3. Fetch Additional Images
      const { data: imgData } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', id)
        .order('display_order', { ascending: true });

      const allImages = [prodData.main_image_url];
      if (imgData) {
        imgData.forEach((img: ProductImage) => {
          if (img.image_url !== prodData.main_image_url) {
            allImages.push(img.image_url);
          }
        });
      }
      setImages(allImages);
      setActiveImage(allImages[0]);

      // 4. Fetch Related Products (same category, excluding current product)
      const { data: relData } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', prodData.category_id)
        .neq('id', id)
        .limit(3);
      if (relData) setRelatedProducts(relData);

      setLoading(false);
      window.scrollTo(0, 0);
    }

    fetchProductDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="pt-[140px] pb-24 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-error border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-on-surface-variant font-semibold">جاري تحميل تفاصيل المنتج...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-[140px] pb-24 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <span className="material-symbols-outlined text-6xl text-outline mb-4">error</span>
        <h2 className="text-2xl font-bold text-on-surface">المنتج غير موجود</h2>
        <Link to="/" className="text-error underline mt-4 inline-block font-semibold">العودة للرئيسية</Link>
      </div>
    );
  }

  // Generate WhatsApp link
  const encodedText = encodeURIComponent(
    `مرحباً جاليري مارينا، أود الاستفسار عن منتج "${product.name}" (كود المنتج: ${product.product_code}) المعروض على موقعكم الإلكتروني.`
  );
  const whatsappUrl = `https://api.whatsapp.com/send?phone=201001921359&text=${encodedText}`;

  return (
    <main className="flex-grow pt-[130px] pb-24 px-6 md:px-margin-desktop max-w-container-max mx-auto w-full text-right">
      
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-secondary font-semibold text-xs md:text-sm mb-8">
        <Link className="hover:text-error transition-colors" to="/">الرئيسية</Link>
        <span className="material-symbols-outlined text-[16px] text-outline">chevron_left</span>
        {category && (
          <>
            <Link className="hover:text-error transition-colors" to={`/category/${category.id}`}>{category.name}</Link>
            <span className="material-symbols-outlined text-[16px] text-outline">chevron_left</span>
          </>
        )}
        <span className="text-on-surface font-bold truncate max-w-[200px]">{product.name}</span>
      </nav>
 
      {/* Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Right Column: Images (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main image container */}
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-surface-container shadow-[0_10px_40px_rgba(5,4,4,0.04)] border border-outline-variant/30">
            <img 
              alt={product.name} 
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-103" 
              src={activeImage}
            />
          </div>
          
          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {images.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(imgUrl)}
                  className={`relative aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all bg-surface-container ${
                    activeImage === imgUrl 
                      ? 'border-error opacity-100 scale-98 shadow-md' 
                      : 'border-outline-variant opacity-70 hover:opacity-100'
                  }`}
                >
                  <img alt={`${product.name} thumbnail ${idx + 1}`} className="w-full h-full object-cover" src={imgUrl} />
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Left Column: Details (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div>
            <span className="text-secondary text-xs md:text-sm font-bold uppercase tracking-widest block mb-2">
              {category ? category.name : 'الأثاث الفرنسي الفاخر'}
            </span>
            <h1 className="text-2xl md:text-4xl font-bold text-on-surface mb-3 leading-tight">
              {product.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 bg-surface-container text-on-surface text-xs font-bold rounded-full border border-outline-variant">
                رمز المنتج: {product.product_code}
              </span>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
                متوفر بالطلب
              </span>
            </div>
          </div>
          
          <hr className="border-outline-variant/30" />
          
          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-secondary uppercase tracking-wider">الوصف والملخص</h3>
            <p className="text-on-surface-variant text-sm md:text-base leading-relaxed">
              {product.description}
            </p>
          </div>
          
          <hr className="border-outline-variant/30" />
          
          {/* WhatsApp Button */}
          <div className="pt-2">
            <a 
              href={whatsappUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex w-full items-center justify-center gap-3 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-base md:text-lg px-6 py-4 rounded-xl transition-all shadow-[0_4px_20px_rgba(37,211,102,0.3)] hover:-translate-y-0.5 select-none"
            >
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M12.004 0C5.378 0 0 5.376 0 12.002c0 2.112.551 4.17 1.597 5.978l-1.698 6.2 6.335-1.662A11.956 11.956 0 0012.004 24c6.626 0 12.002-5.376 12.002-12.002S18.63 0 12.004 0zm6.852 16.924c-.26.733-1.503 1.4-2.07 1.488-.567.088-1.258.125-2.07-.125-.494-.153-1.123-.396-1.921-.741-3.385-1.464-5.572-4.9-5.742-5.13-.17-.23-1.396-1.857-1.396-3.541 0-1.684.878-2.513 1.19-2.856.312-.343.68-.429.907-.429.227 0 .454.004.652.013.21.01.493-.038.77.625.283.68.964 2.348 1.049 2.519.085.17.142.37.028.599-.113.228-.17.37-.34.57-.17.199-.356.446-.51.598-.17.17-.348.356-.15.696.198.34 1.763 2.9 3.774 4.693 2.592 2.311 4.773 3.031 5.454 3.316.68.285 1.078.238 1.482-.228.403-.466 1.731-2.016 2.192-2.709.46-.693.92-.578 1.544-.343.624.234 3.96 1.868 4.64 2.208.68.34.878.504.991.704.113.2.113 1.155-.147 1.888z"/>
              </svg>
              <span>طلب واستفسار مباشر عبر واتساب</span>
            </a>
          </div>

        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-20 border-t border-outline-variant/30 pt-12">
          <h2 className="text-2xl font-bold text-on-surface mb-8">قطع مميزة قد تعجبك</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedProducts.map((rel) => (
              <Link key={rel.id} to={`/product/${rel.id}`} className="group block bg-white rounded-lg border border-outline-variant/10 overflow-hidden shadow-sm hover:shadow-md transition-all">
                <div className="relative w-full aspect-[4/3] bg-surface-container overflow-hidden">
                  <img 
                    alt={rel.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    src={rel.main_image_url} 
                  />
                  <div className="absolute top-3 left-3 z-10 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {rel.product_code}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-on-surface mb-1 truncate group-hover:text-error transition-colors">{rel.name}</h3>
                  <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">{rel.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
      
    </main>
  );
}
