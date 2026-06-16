import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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
  created_at: string;
}

export default function Category() {
  const { id } = useParams<{ id: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Sort States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSort, setSelectedSort] = useState<string>('latest');

  useEffect(() => {
    async function fetchCategoryData() {
      if (!id) return;
      setLoading(true);
      
      // Fetch category detail
      const { data: catData, error: catError } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();
        
      if (!catError && catData) {
        setCategory(catData);
      }

      // Fetch products in this category
      const { data: prodData, error: prodError } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', id);
        
      if (!prodError && prodData) {
        setProducts(prodData);
        setFilteredProducts(prodData);
      }
      setLoading(false);
    }
    
    fetchCategoryData();
    // Reset search query and sort on category change
    setSearchQuery('');
    setSelectedSort('latest');
  }, [id]);

  // Apply search query and sorting
  useEffect(() => {
    let result = [...products];

    // Filter by name, code, or description keyword
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.product_code.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }

    // Sort
    if (selectedSort === 'latest') {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (selectedSort === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
    } else if (selectedSort === 'name-desc') {
      result.sort((a, b) => b.name.localeCompare(a.name, 'ar'));
    }

    setFilteredProducts(result);
  }, [products, searchQuery, selectedSort]);

  if (loading) {
    return (
      <div className="pt-[140px] pb-24 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-error border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-on-surface-variant font-semibold">جاري تحميل المنتجات...</p>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="pt-[140px] pb-24 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <span className="material-symbols-outlined text-6xl text-outline mb-4">error</span>
        <h2 className="text-2xl font-bold text-on-surface">الفئة غير موجودة</h2>
        <Link to="/" className="text-error underline mt-4 inline-block">العودة للرئيسية</Link>
      </div>
    );
  }

  return (
    <main className="flex-grow pt-[130px] pb-24 px-6 md:px-margin-desktop max-w-container-max mx-auto w-full text-right">
      
      {/* Category Header */}
      <section className="text-center mb-12 md:mb-16">
        <h1 className="text-3xl md:text-5xl font-bold text-on-surface mb-4">
          {category.name}
        </h1>
        <div className="w-20 h-1 bg-error mx-auto mb-6 rounded-full"></div>
        <p className="font-body-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
          اكتشف مجموعتنا الفاخرة من {category.name} الفرنسية المصممة بعناية فائقة وتفاصيل يدوية راقية تضفي جمالاً لا يقاوم على منزلك.
        </p>
      </section>

      {/* Search Bar & Sort Dropdown Header */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center mb-8 gap-4 border-b border-outline-variant/30 pb-6">
        {/* Simple Search Input */}
        <div className="relative w-full max-w-md">
          <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-outline text-lg">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث عن منتج بالاسم أو كود المنتج..."
            className="w-full pl-4 pr-11 py-3 border border-outline-variant/50 rounded-xl focus:outline-none focus:border-error focus:ring-1 focus:ring-error transition-all text-right text-sm bg-white shadow-sm"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline hover:text-error transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-3 justify-end">
          <span className="text-sm text-on-surface-variant font-medium">ترتيب حسب:</span>
          <select 
            value={selectedSort}
            onChange={(e) => setSelectedSort(e.target.value)}
            className="bg-white border border-outline-variant/50 px-4 py-2.5 rounded-xl text-sm text-on-surface focus:outline-none focus:border-error cursor-pointer font-bold shadow-sm"
          >
            <option value="latest">الأحدث أولاً</option>
            <option value="name-asc">الاسم (أ - ي)</option>
            <option value="name-desc">الاسم (ي - أ)</option>
          </select>
        </div>
      </div>

      {/* Bento Grid Layout */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-surface-container-low rounded-2xl border border-dashed border-outline-variant/80 max-w-lg mx-auto">
          <span className="material-symbols-outlined text-5xl text-outline mb-3">search_off</span>
          <p className="text-on-surface-variant font-bold text-base">لم يتم العثور على منتجات تطابق بحثك.</p>
          <button 
            onClick={() => setSearchQuery('')}
            className="mt-4 text-error font-bold text-sm underline hover:text-error/85 transition-colors"
          >
            عرض جميع المنتجات
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((prod, index) => {
            // Every 5th item spans 2 columns in Bento layout for desktop/tablet
            const isLarge = index % 5 === 0;
            return (
              <article 
                key={prod.id} 
                className={`group flex flex-col justify-between bg-white rounded-2xl border border-outline-variant/20 overflow-hidden shadow-[0_4px_25px_rgba(5,4,4,0.02)] transition-all duration-300 hover:shadow-[0_12px_45px_rgba(5,4,4,0.07)] hover:-translate-y-1 ${
                  isLarge ? 'md:col-span-2' : 'col-span-1'
                }`}
              >
                <div className={`relative overflow-hidden bg-surface-container ${
                  isLarge ? 'aspect-[16/9]' : 'aspect-[3/4]'
                }`}>
                  <img 
                    alt={prod.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103" 
                    src={prod.main_image_url}
                  />
                  <div className="absolute top-4 left-4 z-10 bg-error text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                    {prod.product_code}
                  </div>
                </div>
                
                <div className="p-6 flex flex-col justify-between flex-grow gap-4">
                  <div>
                    <h3 className={`font-bold text-on-surface mb-2 group-hover:text-error transition-colors leading-tight ${
                      isLarge ? 'text-2xl' : 'text-lg'
                    }`}>
                      {prod.name}
                    </h3>
                    <p className="text-on-surface-variant text-sm line-clamp-2 leading-relaxed">
                      {prod.description}
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-outline-variant/30 mt-auto">
                    <span className="text-xs text-secondary font-bold">كود المنتج: {prod.product_code}</span>
                    <Link 
                      to={`/product/${prod.id}`}
                      className="bg-primary hover:bg-primary/95 text-white text-xs font-bold px-5 py-2.5 rounded-lg transition-colors shadow-sm"
                    >
                      عرض التفاصيل
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
