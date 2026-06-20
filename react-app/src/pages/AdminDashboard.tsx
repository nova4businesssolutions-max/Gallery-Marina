import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { convertToWebP } from '../utils/webp';

interface Category {
  id: number;
  name: string;
  image_url: string;
  code_seed: string;
}

interface Product {
  id: number;
  category_id: number;
  name: string;
  description: string;
  product_code: string;
  main_image_url: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'categories' | 'products'>('products');
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Form modals state
  const [showCatModal, setShowCatModal] = useState(false);
  const [catEditing, setCatEditing] = useState<Category | null>(null);
  const [catFormName, setCatFormName] = useState('');
  const [catFormImgUrl, setCatFormImgUrl] = useState('');
  const [catFormCodeSeed, setCatFormCodeSeed] = useState('');
  const [catFile, setCatFile] = useState<File | null>(null);

  const [showProdModal, setShowProdModal] = useState(false);
  const [prodEditing, setProdEditing] = useState<Product | null>(null);
  const [prodFormName, setProdFormName] = useState('');
  const [prodFormCode, setProdFormCode] = useState('');
  const [prodFormDesc, setProdFormDesc] = useState('');
  const [prodFormCatId, setProdFormCatId] = useState<number | ''>('');
  const [prodFormImgUrl, setProdFormImgUrl] = useState('');
  const [prodFileMain, setProdFileMain] = useState<File | null>(null);
  const [prodFilesAdditional, setProdFilesAdditional] = useState<File[]>([]);
  const [prodAdditionalUrls, setProdAdditionalUrls] = useState<string[]>(['', '', '']); // Fallback text URLs

  // Processing indicators
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [totalImagesCount, setTotalImagesCount] = useState(0);

  useEffect(() => {
    // 1. Verify admin session
    const sessionStr = localStorage.getItem('adminSession');
    if (!sessionStr) {
      navigate('/admin');
      return;
    }
    const session = JSON.parse(sessionStr);
    // Allow sessions up to 24 hours
    if (Date.now() - session.loginTime > 24 * 60 * 60 * 1000) {
      localStorage.removeItem('adminSession');
      navigate('/admin');
      return;
    }

    // 2. Fetch Dashboard Data
    fetchData();
  }, [navigate]);

  // Auto-generate product code based on category's code_seed
  useEffect(() => {
    if (prodFormCatId) {
      const selectedCat = categories.find(c => c.id === Number(prodFormCatId));
      if (selectedCat && selectedCat.code_seed) {
        // If editing and the selected category is the original category of the product, keep original code
        if (prodEditing && Number(prodFormCatId) === prodEditing.category_id) {
          setProdFormCode(prodEditing.product_code);
          return;
        }
        
        // Otherwise, auto-generate!
        const seed = selectedCat.code_seed;
        // Find products in this category (excluding the current editing product if applicable)
        const catProducts = products.filter(p => p.category_id === Number(prodFormCatId) && p.id !== prodEditing?.id);
        
        let maxNum = 0;
        catProducts.forEach(p => {
          if (p.product_code && p.product_code.startsWith(seed)) {
            const numPart = p.product_code.substring(seed.length);
            const num = parseInt(numPart, 10);
            if (!isNaN(num) && num > maxNum) {
              maxNum = num;
            }
          }
        });
        const nextNum = maxNum + 1;
        const newCode = `${seed}${String(nextNum).padStart(3, '0')}`;
        setProdFormCode(newCode);
      } else {
        // If the category has no seed code yet (e.g. older categories or empty), we clear it or generate a placeholder
        setProdFormCode('');
      }
    } else {
      setProdFormCode('');
    }
  }, [prodFormCatId, categories, products, prodEditing]);

  async function fetchData() {
    setLoading(true);
    const { data: catData } = await supabase
      .from('categories')
      .select('*')
      .order('id', { ascending: true });
      
    if (catData) setCategories(catData);

    const { data: prodData } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: false });
      
    if (prodData) setProducts(prodData);

    // Fetch count of additional images
    const { count: addImagesCount } = await supabase
      .from('product_images')
      .select('*', { count: 'exact', head: true });
      
    const mainImagesCount = prodData ? prodData.filter(p => p.main_image_url).length : 0;
    const catImagesCount = catData ? catData.filter(c => c.image_url).length : 0;
    setTotalImagesCount(mainImagesCount + catImagesCount + (addImagesCount || 0));

    setLoading(false);
  }

  const handleLogout = () => {
    localStorage.removeItem('adminSession');
    navigate('/admin');
  };

  const showStatus = (text: string, type = 'success') => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg({ type: '', text: '' }), 5000);
  };

  // Helper: Extract relative file path from a Supabase Storage URL
  const getStoragePathFromUrl = (url: string, bucketName: string = 'Gallery Marina Bucket'): string | null => {
    if (!url) return null;
    const decodedUrl = decodeURIComponent(url);
    const marker = `/${bucketName}/`;
    const idx = decodedUrl.indexOf(marker);
    if (idx !== -1) {
      return decodedUrl.substring(idx + marker.length);
    }
    return null;
  };

  // Helper: Converts & uploads file to Supabase Storage bucket "Gallery Marina Bucket"
  const uploadImage = async (file: File, folder: string): Promise<string> => {
    try {
      // Convert image to optimized webp client-side
      const webpBlob = await convertToWebP(file);
      
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.webp`;
      const filePath = `${folder}/${fileName}`;

      const { error } = await supabase.storage
        .from('Gallery Marina Bucket')
        .upload(filePath, webpBlob, {
          contentType: 'image/webp',
          upsert: true
        });

      if (error) {
        console.error('Storage Upload Error:', error);
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('Gallery Marina Bucket')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (err) {
      console.error('Failed to convert or upload image:', err);
      throw new Error('فشل رفع وصناعة الصورة WebP. يرجى استخدام رابط الصورة كبديل.');
    }
  };

  // --- CATEGORY CRUD ---
  const openCatAdd = () => {
    setCatEditing(null);
    setCatFormName('');
    setCatFormImgUrl('');
    setCatFormCodeSeed('');
    setCatFile(null);
    setShowCatModal(true);
  };

  const openCatEdit = (cat: Category) => {
    setCatEditing(cat);
    setCatFormName(cat.name);
    setCatFormImgUrl(cat.image_url);
    setCatFormCodeSeed(cat.code_seed || '');
    setCatFile(null);
    setShowCatModal(true);
  };

  const handleCatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    let imageUrl = catFormImgUrl;

    try {
      // 1. If file uploaded, convert to WebP and upload
      if (catFile) {
        showStatus('جاري معالجة ورفع الصورة الفئة كـ WebP...', 'info');
        imageUrl = await uploadImage(catFile, 'categories');
      }

      if (!imageUrl) {
        throw new Error('يرجى تحديد ملف صورة أو إدخال رابط صورة للفئة');
      }

      if (catEditing) {
        // Edit Category
        const { error } = await supabase
          .from('categories')
          .update({ name: catFormName, image_url: imageUrl, code_seed: catFormCodeSeed })
          .eq('id', catEditing.id);
        
        if (error) throw error;
        showStatus('تم تعديل الفئة بنجاح!');
      } else {
        // Add Category
        const { error } = await supabase
          .from('categories')
          .insert([{ name: catFormName, image_url: imageUrl, code_seed: catFormCodeSeed }]);
        
        if (error) throw error;
        showStatus('تم إضافة الفئة بنجاح!');
      }

      setShowCatModal(false);
      fetchData();
    } catch (err: any) {
      console.error(err);
      showStatus(err.message || 'فشل إتمام العملية', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCatDelete = async (catId: number) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الفئة؟ سيتم إزالة الفئة فقط (تأكد من عدم وجود منتجات تتبعها أولاً)')) return;
    
    try {
      // 1. Fetch category to get image_url
      const { data: cat } = await supabase
        .from('categories')
        .select('image_url')
        .eq('id', catId)
        .single();

      // 2. Delete image from Storage
      if (cat && cat.image_url) {
        const path = getStoragePathFromUrl(cat.image_url);
        if (path) {
          await supabase.storage.from('Gallery Marina Bucket').remove([path]);
        }
      }

      // 3. Delete category from database
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', catId);
      
      if (error) throw error;
      showStatus('تم حذف الفئة وصورتها بنجاح!');
      fetchData();
    } catch (err: any) {
      showStatus('فشل حذف الفئة. تأكد من إفراغ منتجاتها أولاً.', 'error');
    }
  };


  // --- PRODUCT CRUD ---
  const openProdAdd = () => {
    setProdEditing(null);
    setProdFormName('');
    setProdFormCode('');
    setProdFormDesc('');
    setProdFormCatId(categories[0]?.id || '');
    setProdFormImgUrl('');
    setProdFileMain(null);
    setProdFilesAdditional([]);
    setProdAdditionalUrls(['', '', '']);
    setShowProdModal(true);
  };

  const openProdEdit = async (prod: Product) => {
    setProdEditing(prod);
    setProdFormName(prod.name);
    setProdFormCode(prod.product_code);
    setProdFormDesc(prod.description);
    setProdFormCatId(prod.category_id);
    setProdFormImgUrl(prod.main_image_url);
    setProdFileMain(null);
    setProdFilesAdditional([]);
    
    // Fetch product images
    const { data: addImgs } = await supabase
      .from('product_images')
      .select('image_url')
      .eq('product_id', prod.id)
      .order('display_order', { ascending: true });

    const urls = ['', '', ''];
    if (addImgs) {
      addImgs.forEach((img, idx) => {
        if (idx < 3) urls[idx] = img.image_url;
      });
    }
    setProdAdditionalUrls(urls);
    setShowProdModal(true);
  };

  const handleProdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodFormCatId) {
      showStatus('يرجى تحديد فئة للمنتج', 'error');
      return;
    }
    setSubmitting(true);
    let mainImageUrl = prodFormImgUrl;

    try {
      // 1. Upload main image
      if (prodFileMain) {
        showStatus('جاري رفع ومعالجة الصورة الأساسية كـ WebP...', 'info');
        mainImageUrl = await uploadImage(prodFileMain, 'products');
      }

      if (!mainImageUrl) {
        throw new Error('يرجى اختيار ملف الصورة الرئيسية أو إدخال رابط الصورة');
      }

      let insertedId = prodEditing?.id;

      if (prodEditing) {
        // Edit Product
        const { error } = await supabase
          .from('products')
          .update({
            name: prodFormName,
            description: prodFormDesc,
            product_code: prodFormCode,
            category_id: prodFormCatId,
            main_image_url: mainImageUrl
          })
          .eq('id', prodEditing.id);
        
        if (error) throw error;
        showStatus('تم تعديل المنتج بنجاح!');
      } else {
        // Add Product
        const { data, error } = await supabase
          .from('products')
          .insert([{
            name: prodFormName,
            description: prodFormDesc,
            product_code: prodFormCode,
            category_id: prodFormCatId,
            main_image_url: mainImageUrl
          }])
          .select();
        
        if (error) throw error;
        insertedId = data[0].id;
        showStatus('تم إضافة المنتج بنجاح!');
      }

      // 2. Handle additional images (max 3)
      if (insertedId) {
        // Delete old additional images if editing
        if (prodEditing) {
          await supabase.from('product_images').delete().eq('product_id', insertedId);
        }

        const imagesToInsert: { product_id: number; image_url: string; display_order: number }[] = [];
        
        // Loop up to 3 slots
        for (let i = 0; i < 3; i++) {
          let additionalUrl = prodAdditionalUrls[i];
          
          // If a file is selected for this slot, upload it
          const file = prodFilesAdditional[i];
          if (file) {
            showStatus(`جاري رفع الصورة الفرعية ${i+1}...`, 'info');
            try {
              additionalUrl = await uploadImage(file, 'product_images');
            } catch (err) {
              console.warn(err);
            }
          }

          if (additionalUrl) {
            imagesToInsert.push({
              product_id: insertedId,
              image_url: additionalUrl,
              display_order: i + 1
            });
          }
        }

        if (imagesToInsert.length > 0) {
          const { error: imgErr } = await supabase
            .from('product_images')
            .insert(imagesToInsert);
          if (imgErr) console.error('Error seeding product additional images:', imgErr);
        }
      }

      setShowProdModal(false);
      fetchData();
    } catch (err: any) {
      console.error(err);
      showStatus(err.message || 'فشل إتمام العملية', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleProdDelete = async (prodId: number) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المنتج بالكامل؟')) return;

    try {
      // 1. Fetch product and its additional images to delete files from Storage
      const { data: prod } = await supabase
        .from('products')
        .select('main_image_url')
        .eq('id', prodId)
        .single();
      
      const { data: addImgs } = await supabase
        .from('product_images')
        .select('image_url')
        .eq('product_id', prodId);

      const pathsToDelete: string[] = [];
      if (prod && prod.main_image_url) {
        const path = getStoragePathFromUrl(prod.main_image_url);
        if (path) pathsToDelete.push(path);
      }
      if (addImgs) {
        addImgs.forEach(img => {
          const path = getStoragePathFromUrl(img.image_url);
          if (path) pathsToDelete.push(path);
        });
      }

      if (pathsToDelete.length > 0) {
        await supabase.storage.from('Gallery Marina Bucket').remove(pathsToDelete);
      }

      // 2. Delete database rows
      await supabase.from('product_images').delete().eq('product_id', prodId);
      
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', prodId);
      
      if (error) throw error;
      showStatus('تم حذف المنتج وصوره بنجاح!');
      fetchData();
    } catch (err: any) {
      showStatus('فشل حذف المنتج.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="pt-[140px] pb-24 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-error border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-on-surface-variant font-semibold">جاري تحميل لوحة التحكم...</p>
      </div>
    );
  }

  return (
    <div className="pt-[130px] pb-24 px-6 md:px-margin-desktop max-w-container-max mx-auto w-full text-right">
      
      {/* Top dashboard bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-outline-variant/30 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-on-surface">لوحة تحكم جاليري مارينا</h1>
          <p className="text-sm text-on-surface-variant mt-1">إضافة، تعديل، وحذف الفئات والمنتجات</p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 font-bold px-5 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm"
        >
          <span className="material-symbols-outlined text-lg">logout</span>
          <span>تسجيل الخروج</span>
        </button>
      </div>

      {/* Status Alert Notification */}
      {statusMsg.text && (
        <div className={`mb-6 text-sm p-4 rounded-lg flex items-center gap-2 border ${
          statusMsg.type === 'error' ? 'bg-red-50 border-red-200 text-red-600' :
          statusMsg.type === 'info' ? 'bg-blue-50 border-blue-200 text-blue-600' :
          'bg-green-50 border-green-200 text-green-700'
        }`}>
          <span className="material-symbols-outlined text-lg">
            {statusMsg.type === 'error' ? 'error' : statusMsg.type === 'info' ? 'info' : 'check_circle'}
          </span>
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Statistics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-outline-variant/30 rounded-xl p-5 shadow-sm flex items-center gap-4 text-right">
          <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center text-error">
            <span className="material-symbols-outlined text-2xl">category</span>
          </div>
          <div>
            <div className="text-2xl font-bold text-on-surface">{categories.length}</div>
            <div className="text-xs text-on-surface-variant font-medium">عدد الفئات الكلي</div>
          </div>
        </div>
        
        <div className="bg-white border border-outline-variant/30 rounded-xl p-5 shadow-sm flex items-center gap-4 text-right">
          <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-2xl">shopping_bag</span>
          </div>
          <div>
            <div className="text-2xl font-bold text-on-surface">{products.length}</div>
            <div className="text-xs text-on-surface-variant font-medium">عدد المنتجات الكلي</div>
          </div>
        </div>
        
        <div className="bg-white border border-outline-variant/30 rounded-xl p-5 shadow-sm flex items-center gap-4 text-right">
          <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center text-emerald-600">
            <span className="material-symbols-outlined text-2xl">image</span>
          </div>
          <div>
            <div className="text-2xl font-bold text-on-surface">{totalImagesCount}</div>
            <div className="text-xs text-on-surface-variant font-medium">إجمالي الصور المرفوعة</div>
          </div>
        </div>
      </div>

      {/* Tabs Selection */}
      <div className="flex border-b border-outline-variant/30 mb-8">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-6 py-3 font-bold text-sm md:text-base border-b-2 transition-all ${
            activeTab === 'products' ? 'border-error text-error' : 'border-transparent text-secondary hover:text-on-surface'
          }`}
        >
          المنتجات ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-6 py-3 font-bold text-sm md:text-base border-b-2 transition-all ${
            activeTab === 'categories' ? 'border-error text-error' : 'border-transparent text-secondary hover:text-on-surface'
          }`}
        >
          الفئات ({categories.length})
        </button>
      </div>

      {/* TAB CONTENTS */}
      {activeTab === 'categories' ? (
        <section>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-on-surface">إدارة فئات المنتجات</h3>
            <button
              onClick={openCatAdd}
              className="bg-error hover:bg-error/95 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              <span>إضافة فئة جديدة</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <div key={cat.id} className="bg-white border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm flex flex-col">
                <div className="h-40 bg-surface-container relative">
                  <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-4 flex-grow flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-on-surface text-lg mb-1">{cat.name}</h4>
                    <span className="text-xs text-secondary font-medium">رمز الفئة: {cat.code_seed || 'بدون رمز'}</span>
                  </div>
                  <div className="flex justify-end gap-2 border-t border-outline-variant/30 pt-3 mt-4">
                    <button
                      onClick={() => openCatEdit(cat)}
                      className="text-primary hover:text-error text-xs font-bold px-3 py-1.5 rounded hover:bg-surface-container transition-colors flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>
                      <span>تعديل</span>
                    </button>
                    <button
                      onClick={() => handleCatDelete(cat.id)}
                      className="text-red-600 hover:text-red-800 text-xs font-bold px-3 py-1.5 rounded hover:bg-red-50 transition-colors flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                      <span>حذف</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-on-surface">إدارة معروضات المنتجات</h3>
            <button
              onClick={openProdAdd}
              className="bg-error hover:bg-error/95 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              <span>إضافة منتج جديد</span>
            </button>
          </div>

          <div className="overflow-x-auto bg-white rounded-xl border border-outline-variant/30 shadow-sm">
            <table className="w-full border-collapse text-right">
              <thead>
                <tr className="bg-surface-container text-on-surface border-b border-outline-variant/30">
                  <th className="p-4 font-bold text-sm">المنتج</th>
                  <th className="p-4 font-bold text-sm">الكود</th>
                  <th className="p-4 font-bold text-sm">الفئة</th>
                  <th className="p-4 font-bold text-sm">الوصف</th>
                  <th className="p-4 font-bold text-sm text-left">التحكم</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {products.map((prod) => {
                  const catName = categories.find(c => c.id === prod.category_id)?.name || 'غير محدد';
                  return (
                    <tr key={prod.id} className="hover:bg-surface-container/20 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <img src={prod.main_image_url} alt={prod.name} className="w-12 h-12 rounded object-cover bg-surface-container" />
                        <span className="font-semibold text-on-surface">{prod.name}</span>
                      </td>
                      <td className="p-4 text-sm font-semibold text-secondary">{prod.product_code}</td>
                      <td className="p-4 text-sm text-on-surface-variant font-medium">{catName}</td>
                      <td className="p-4 text-xs text-on-surface-variant max-w-[200px] truncate">{prod.description}</td>
                      <td className="p-4 text-left">
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => openProdEdit(prod)}
                            className="text-primary hover:text-error text-xs font-bold px-3 py-1.5 rounded hover:bg-surface-container transition-colors flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-sm">edit</span>
                            <span>تعديل</span>
                          </button>
                          <button
                            onClick={() => handleProdDelete(prod.id)}
                            className="text-red-600 hover:text-red-800 text-xs font-bold px-3 py-1.5 rounded hover:bg-red-50 transition-colors flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                            <span>حذف</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* --- CATEGORY FORM MODAL --- */}
      {showCatModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h4 className="text-xl font-bold text-on-surface border-b border-outline-variant/30 pb-3 mb-6">
              {catEditing ? 'تعديل فئة' : 'إضافة فئة جديدة'}
            </h4>
            
            <form onSubmit={handleCatSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-on-surface-variant mb-2">اسم الفئة</label>
                <input
                  type="text"
                  value={catFormName}
                  onChange={(e) => setCatFormName(e.target.value)}
                  placeholder="مثال: الصالونات"
                  className="w-full px-4 py-2 border border-outline rounded-lg focus:outline-none focus:border-error"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-on-surface-variant mb-2">رمز كود المنتج (Seed Code)</label>
                <input
                  type="text"
                  value={catFormCodeSeed}
                  onChange={(e) => setCatFormCodeSeed(e.target.value.toUpperCase())}
                  placeholder="مثال: GMK"
                  className="w-full px-4 py-2 border border-outline rounded-lg focus:outline-none focus:border-error text-left"
                  required
                />
                <p className="text-xs text-on-surface-variant mt-1">يُسخدم لتوليد كود المنتج تلقائياً (مثال: GMK001، GMK002)</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-on-surface-variant mb-2">رفع صورة الفئة (WebP تلقائي)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCatFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-secondary file:ml-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-error/10 file:text-error hover:file:bg-error/20"
                />
              </div>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-outline-variant/50"></div>
                <span className="flex-shrink mx-4 text-secondary text-xs">أو أدخل الرابط مباشرة</span>
                <div className="flex-grow border-t border-outline-variant/50"></div>
              </div>

              <div>
                <label className="block text-sm font-bold text-on-surface-variant mb-2">رابط صورة الفئة</label>
                <input
                  type="text"
                  value={catFormImgUrl}
                  onChange={(e) => setCatFormImgUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-2 border border-outline rounded-lg focus:outline-none focus:border-error text-left"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-outline-variant/30 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCatModal(false)}
                  className="px-4 py-2 bg-surface-container hover:bg-surface-container-high rounded-lg text-sm font-semibold text-secondary"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-error hover:bg-error/95 disabled:bg-error/55 text-white font-semibold rounded-lg text-sm"
                >
                  {submitting ? 'جاري الحفظ...' : 'حفظ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- PRODUCT FORM MODAL --- */}
      {showProdModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h4 className="text-xl font-bold text-on-surface border-b border-outline-variant/30 pb-3 mb-6">
              {prodEditing ? 'تعديل منتج' : 'إضافة منتج جديد'}
            </h4>
            
            <form onSubmit={handleProdSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-on-surface-variant mb-2">اسم المنتج</label>
                  <input
                    type="text"
                    value={prodFormName}
                    onChange={(e) => setProdFormName(e.target.value)}
                    placeholder="مثال: صالون لويس السادس عشر"
                    className="w-full px-4 py-2 border border-outline rounded-lg focus:outline-none focus:border-error"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-on-surface-variant mb-2">كود المنتج (توليد تلقائي)</label>
                  <input
                    type="text"
                    value={prodFormCode}
                    readOnly
                    placeholder="سيتم توليده تلقائياً"
                    className="w-full px-4 py-2 border border-outline rounded-lg bg-surface-container-low text-secondary text-left font-semibold cursor-not-allowed focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-on-surface-variant mb-2">الفئة</label>
                <select
                  value={prodFormCatId}
                  onChange={(e) => setProdFormCatId(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-outline rounded-lg focus:outline-none focus:border-error font-semibold"
                  required
                >
                  <option value="">اختر الفئة</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-on-surface-variant mb-2">الوصف والخصائص</label>
                <textarea
                  value={prodFormDesc}
                  onChange={(e) => setProdFormDesc(e.target.value)}
                  placeholder="أدخل خصائص ومواصفات وتصميم قطعة الأثاث..."
                  rows={3}
                  className="w-full px-4 py-2 border border-outline rounded-lg focus:outline-none focus:border-error"
                  required
                />
              </div>

              {/* Main Image upload */}
              <div>
                <label className="block text-sm font-bold text-on-surface-variant mb-2">الصورة الرئيسية للمنتج</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProdFileMain(e.target.files?.[0] || null)}
                  className="w-full text-sm text-secondary file:ml-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-error/10 file:text-error hover:file:bg-error/20"
                />
                <input
                  type="text"
                  value={prodFormImgUrl}
                  onChange={(e) => setProdFormImgUrl(e.target.value)}
                  placeholder="أو ضع رابط الصورة الرئيسية هنا مباشرة..."
                  className="w-full px-4 py-2 border border-outline rounded-lg focus:outline-none focus:border-error mt-2 text-left"
                />
              </div>

              {/* Additional Images Upload (up to 3) */}
              <div className="border-t border-outline-variant/30 pt-4">
                <label className="block text-sm font-bold text-on-surface mb-3">صور فرعية للمنتج (3 صور إضافية كحد أقصى)</label>
                
                <div className="space-y-4">
                  {[0, 1, 2].map((idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row items-center gap-2 bg-surface-container/20 p-3 rounded-lg border border-outline-variant/20">
                      <span className="text-xs font-bold text-secondary min-w-[60px]">صورة {idx + 1}:</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const newFiles = [...prodFilesAdditional];
                          if (e.target.files?.[0]) {
                            newFiles[idx] = e.target.files[0];
                          }
                          setProdFilesAdditional(newFiles);
                        }}
                        className="text-xs text-secondary file:py-1 file:px-3 file:rounded-full file:border-0 file:bg-primary/10 file:text-primary"
                      />
                      <input
                        type="text"
                        value={prodAdditionalUrls[idx] || ''}
                        onChange={(e) => {
                          const newUrls = [...prodAdditionalUrls];
                          newUrls[idx] = e.target.value;
                          setProdAdditionalUrls(newUrls);
                        }}
                        placeholder="أو رابط الصورة..."
                        className="flex-grow px-3 py-1 border border-outline rounded text-xs focus:outline-none focus:border-error text-left w-full sm:w-auto"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-outline-variant/30 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowProdModal(false)}
                  className="px-4 py-2 bg-surface-container hover:bg-surface-container-high rounded-lg text-sm font-semibold text-secondary"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-error hover:bg-error/95 disabled:bg-error/55 text-white font-semibold rounded-lg text-sm"
                >
                  {submitting ? 'جاري الحفظ والرفع...' : 'حفظ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
