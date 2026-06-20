import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = 'https://yepfawzjjhbwmrikgaqo.supabase.co';
const supabaseKey = 'sb_publishable_gqanAQkLlkjXIV6Q-XF7ag_DMy9lNuV';

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('Starting Database Seeding with correct schema and constraints...');
  
  try {
    // 0. Clear Existing Products Data to allow a clean re-run
    console.log('Clearing old product images and products...');
    await supabase.from('product_images').delete().gt('id', 0);
    await supabase.from('products').delete().gt('id', 0);

    // 1. Seed Admin
    const adminUsername = 'Admin';
    const rawPassword = 'Nova@2026@#';
    
    // Hash password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(rawPassword, salt);
    
    // Check if admin exists
    const { data: existingAdmins, error: adminQueryErr } = await supabase
      .from('admin')
      .select('*')
      .eq('admin', adminUsername);
      
    if (adminQueryErr) {
      console.error('Error querying admin:', adminQueryErr);
      return;
    }
    
    if (existingAdmins.length === 0) {
      const { data: insertedAdmin, error: adminInsertErr } = await supabase
        .from('admin')
        .insert([{ admin: adminUsername, password: hashedPassword }])
        .select();
        
      if (adminInsertErr) {
        console.error('Error inserting admin:', adminInsertErr);
      } else {
        console.log('Admin user seeded:', insertedAdmin);
      }
    } else {
      console.log('Admin user already exists.');
    }

    // 2. Seed Categories
    const categoriesToSeed = [
      {
        name: 'الافضل مبيعا',
        image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBaL1jgFF90YkV5OS01b1ziWqpUG_obypmZurdK45Wplpb9cjJ7LvtxxhLYDPCp3dIPvfCSrp-oJRagT1sygrFSb1EJL45ADjA1mSZvbBDqBF5x5v5AIXMjSpKJqoQfcavFq6ZjDZQuIM1Xxx-U_xS87mCUiDi_ISHVyKc47bx2_TyvPDAtHLTliDFHJiSXqaSIq4HJePm8C7PSOYOw0eU-vN-WIWP2BTQN0Fi6_2WBUTSs1Pcy4lcLvj-ehE5ZpQIvtA9ZPZOW2g7X',
        code_seed: 'BEST'
      },
      {
        name: 'الصالونات',
        image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAzIZRL02KqwNX4iMWtmQAA6e8yEq69022IizBP8NPREytOCIRbEbrUd8sVKaq_1a8dIgtF0MExaZtcpfim3ErVC4vThgVf3r5OTL_P6ZqgO_RZuJqZDLv4hnPbyl-HSBaP0cSAGsILfAvKF8nKxcapBijDvG3eaDWzhTaquRD82bivWgTHEKN2KZhmt1zOTvldzMSEhkpOcSF0MorXnWqC9SvJQz-fqRGd5YD8kbXM3ZTCmtclX-B29wiHq9Gt86BL38kyg9nDuukh',
        code_seed: 'SLN'
      },
      {
        name: 'غرف النوم',
        image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnZeItf0p4FSSnB2dnOgL1_BZoswDUgQSlnNEnhbry6GdAjWZbapOstyzdBjILU0VQ24EoxEBV60poamr7WPOayawIGvtcPrvaKxRv5JAqi3VYenTPwfi9dI3s5uUG_jQJdglYFyMa86vOHXXZ8V-sLKOjbAzEgL3Cmw28oSzqktK-ZUp77MDu0FzpENNK9i_7XFfg7LEFvkAqK_0n69JrnXlOsm9GajOUO10V8d54k0HbNM_Ld0Pv_BGWiihicvMQE7ep87QyzoAy',
        code_seed: 'BD'
      },
      {
        name: 'السفرة',
        image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBaL1jgFF90YkV5OS01b1ziWqpUG_obypmZurdK45Wplpb9cjJ7LvtxxhLYDPCp3dIPvfCSrp-oJRagT1sygrFSb1EJL45ADjA1mSZvbBDqBF5x5v5AIXMjSpKJqoQfcavFq6ZjDZQuIM1Xxx-U_xS87mCUiDi_ISHVyKc47bx2_TyvPDAtHLTliDFHJiSXqaSIq4HJePm8C7PSOYOw0eU-vN-WIWP2BTQN0Fi6_2WBUTSs1Pcy4lcLvj-ehE5ZpQIvtA9ZPZOW2g7X',
        code_seed: 'SF'
      }
    ];

    let categoriesMap = {};

    for (const cat of categoriesToSeed) {
      const { data: existingCat, error: catQueryErr } = await supabase
        .from('categories')
        .select('*')
        .eq('name', cat.name);
        
      if (catQueryErr) {
        console.error('Error querying category:', catQueryErr);
        continue;
      }
      
      if (existingCat.length === 0) {
        const { data: insertedCat, error: catInsertErr } = await supabase
          .from('categories')
          .insert([cat])
          .select();
          
        if (catInsertErr) {
          console.error(`Error inserting category ${cat.name}:`, catInsertErr);
        } else {
          console.log(`Category seeded: ${cat.name}`);
          categoriesMap[cat.name] = insertedCat[0].id;
        }
      } else {
        console.log(`Category already exists: ${cat.name}`);
        categoriesMap[cat.name] = existingCat[0].id;
      }
    }

    // 3. Seed Products
    const productsToSeed = [
      // Best Sellers Category Products
      {
        name: 'كرسي طعام "لويس"',
        description: 'كرسي طعام فرنسي من خشب البلوط الفاخر وتصميم كلاسيكي مريح ومميز.',
        product_code: 'L-001',
        main_image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBaL1jgFF90YkV5OS01b1ziWqpUG_obypmZurdK45Wplpb9cjJ7LvtxxhLYDPCp3dIPvfCSrp-oJRagT1sygrFSb1EJL45ADjA1mSZvbBDqBF5x5v5AIXMjSpKJqoQfcavFq6ZjDZQuIM1Xxx-U_xS87mCUiDi_ISHVyKc47bx2_TyvPDAtHLTliDFHJiSXqaSIq4HJePm8C7PSOYOw0eU-vN-WIWP2BTQN0Fi6_2WBUTSs1Pcy4lcLvj-ehE5ZpQIvtA9ZPZOW2g7X',
        categoryName: 'الافضل مبيعا'
      },
      {
        name: 'صوفا باريسية فاخرة',
        description: 'صوفا باريسية فاخرة مكسوة بالمخمل الناعم المريح ومصممة بأدق تفاصيل الأناقة الفرنسية.',
        product_code: 'S-001',
        main_image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCup4g8XJoPOLfpFsyI67F-TjYiLNQ1l-xhHxUd8ofNtaSzwpiBCy6CapXUQV2GGnVf9QQ5cQTixvdQcT0Fz5dmX4hP9NOkv_B2eCsXjNoQEB_Jgv_ILyTaqXxTlDM13OznT4eEi_yMgvjlkDTZaTc7sju6kpeROIJmpjW4C8ZphyMru8ZXbEuqQJBqhli-xt4iP4G66_VZgwwHr-XFXS8lKH0zdTLd02LPAIRo0gDlKOLyBsMnPgX4uI8_NPnHcDQBjrKirg77OIaI',
        categoryName: 'الافضل مبيعا'
      },
      {
        name: 'كونسول "ماري" الرخامي',
        description: 'طاولة كونسول رخامية فرنسية كلاسيكية مع رخام طبيعي فاخر لتضفي فخامة على بهو منزلك.',
        product_code: 'C-001',
        main_image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYAAbDLyui9INLotLhqdJlfMEa7F__XYCYo74h-_yW0I0eHu7u5reICsY5b8MKRP5wwdxVR5ejI-APWIzU-6rCWO_3tLXb9HW8pLg_S3LH5zRcxtcJXul9laJDm4v66TNsShzRCDUO7mec0j2OMqIbxMXT_i7X8-owT-pO_yEWj2Sg12gII6dln9myEbUMECNv58sGjL-n9XZjj2imzPfR9dcLAG_Gn10Dmn8BijMeuJHjVn7E_OO4ozZcAf32wfl-Q0Kt7xUTW2FW',
        categoryName: 'الافضل مبيعا'
      },
      // Salons Category Products
      {
        name: 'صالون لويس السادس عشر الفاخر',
        description: 'يجسد صالون لويس السادس عشر الفخامة والأصالة في أبهى صورها. تم تصميمه وتنفيذه على أيدي أمهر الحرفيين ليحاكي القطع الأثرية في القصور الفرنسية العريقة. يتميز بالحفر اليدوي الدقيق على خشب الزان الروماني المتين، مع لمسات التذهيب الفاخرة والقماش الحريري الفخم بلونه الكريمي الهادئ الذي يعكس الضوء بشكل رائع في صالتك، ليضفي عليها شعوراً بالاتساع والرفاهية المطلقة.',
        product_code: 'SL-016',
        main_image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGj2YAL5GU2XxvY-4hkEzMR-uwFXScspjmG1IUfw_sV6mlDPSup-Jhwzyzb5yEWDCx2xGEyBg9C79qxWy2yivXdh6GlqO5jKDZ_WvXhavJpV6HU2g2nuZnPoQ3qQniRdlj6rKfix--cVQ4s1T7gxHKjCWBPe58X-YSLIDCEcbLn5aHo2mmM8DFhPvaM1oCMRICie23zApFUyiGjlXwSuXXuci3w4eG1Y3ufWztbhbqEUr9AfYa8OshEORJreOHjX5UZgD3QjbKO2kO',
        categoryName: 'الصالونات',
        additional_images: [
          'https://lh3.googleusercontent.com/aida-public/AB6AXuAGj2YAL5GU2XxvY-4hkEzMR-uwFXScspjmG1IUfw_sV6mlDPSup-Jhwzyzb5yEWDCx2xGEyBg9C79qxWy2yivXdh6GlqO5jKDZ_WvXhavJpV6HU2g2nuZnPoQ3qQniRdlj6rKfix--cVQ4s1T7gxHKjCWBPe58X-YSLIDCEcbLn5aHo2mmM8DFhPvaM1oCMRICie23zApFUyiGjlXwSuXXuci3w4eG1Y3ufWztbhbqEUr9AfYa8OshEORJreOHjX5UZgD3QjbKO2kO',
          'https://lh3.googleusercontent.com/aida-public/AB6AXuAzIZRL02KqwNX4iMWtmQAA6e8yEq69022IizBP8NPREytOCIRbEbrUd8sVKaq_1a8dIgtF0MExaZtcpfim3ErVC4vThgVf3r5OTL_P6ZqgO_RZuJqZDLv4hnPbyl-HSBaP0cSAGsILfAvKF8nKxcapBijDvG3eaDWzhTaquRD82bivWgTHEKN2KZhmt1zOTvldzMSEhkpOcSF0MorXnWqC9SvJQz-fqRGd5YD8kbXM3ZTCmtclX-B29wiHq9Gt86BL38kyg9nDuukh',
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDAqVZFIJARbVAr1DWxoqPQ_rW1mWF-q4vnXF--SgPgSTHF6gK3DAKRr76TFLektrgqgsjdBzvMJVcOmdrBi00FYajnLJdCqMyqeKAjPwDTuYMJHDsp2QTw6QZbdAzIInNGvY3jAH8MeUlY4jm7yFsKtf_nnjVb_pHYwkZql8tZPfRktEzMIvAwZOnx-tA4UqgrX66-x7x5T7_o0ilz9vwRL4DfUQ8WXYFm_OawUGHou_Uw-EcTdnOXAadOQxM7fZ5svF2Aaz-kBums'
        ]
      },
      {
        name: 'كرسي ماريا أنطوانيت',
        description: 'كرسي ماريا أنطوانيت مفرد كلاسيكي مصنوع من الخشب الطبيعي المحفور والمنقوش يدوياً.',
        product_code: 'CH-002',
        main_image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDAqVZFIJARbVAr1DWxoqPQ_rW1mWF-q4vnXF--SgPgSTHF6gK3DAKRr76TFLektrgqgsjdBzvMJVcOmdrBi00FYajnLJdCqMyqeKAjPwDTuYMJHDsp2QTw6QZbdAzIInNGvY3jAH8MeUlY4jm7yFsKtf_nnjVb_pHYwkZql8tZPfRktEzMIvAwZOnx-tA4UqgrX66-x7x5T7_o0ilz9vwRL4DfUQ8WXYFm_OawUGHou_Uw-EcTdnOXAadOQxM7fZ5svF2Aaz-kBums',
        categoryName: 'الصالونات'
      },
      {
        name: 'أريكة شاتو',
        description: 'أريكة نيو كلاسيك بتصميم شاتو الأنيق ومريحة جداً لغرف الاستقبال والمجالس الفخمة.',
        product_code: 'SF-003',
        main_image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuALDF0mZcfv5DmZXpRvie2q4HSWEvMPz5jtnm2anbR4d4ICmI-odqn9-3rX12Ato23Rc2qNYQOaWz_TwSyQYb1lOEiS5770OExVLp-NsWCPt2WnS5Yw9twdrOfDOyI_sGAqA7MOT8TVIY6qzavQ0y3kU49NirYSVIZvmzdPYG1CkmAEtmshBJvXTOwtXk_jtICiWD3qWlKfOfHKGzQ2E6zms79aykxzKNOCWxGNgdGkOn0eHP1AQxFSlYvq9DBRmsrMIZxNy5w_auGD',
        categoryName: 'الصالونات'
      },
      {
        name: 'طاولة قهوة فرساي',
        description: 'طاولة قهوة وسطية فرساي كلاسيكية مع نقوش ذهبية بارزة وقاعدة خشبية متينة.',
        product_code: 'T-004',
        main_image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHH6z9lAGiETwmwqjN7-mdF0dKLEk1Aow_59pvE3OIqUHzCfX14HIfbfbMiCJc9xwDcBdKM_GKsndFKRTz_7QT-FGPWp4Fpsik_E6S85LfyvE8Cbo8MpQDjCmuKsxhZdItByfZVB4huzYU-WyIyQ_aU2tmbnN4Yl_0mP_pOf30neGbE7EmV82beC9xS0aYL3K0bcmSuliES3ZmM4pO0zIQ33M2TX_XS_H4EQP7I7_NaCLr-MhNHYC-599830VdV1riZMVLvZSuNfbj',
        categoryName: 'الصالونات'
      },
      {
        name: 'صالون بوردو المخملي',
        description: 'صالون فرنسي عصري بنمط آرت ديكو مغطى بالمخمل الفخم بلون Soft Blush المتناسق.',
        product_code: 'SL-005',
        main_image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDqWeAdIIN97VvkIqzxAxOueTMg6pTGTINrFJBe0122btcyiy_HZrBy0n2a4b_FcNF78o8MienDmWRJYeNAZMdhfwpZg82NwhXm4OSo2XNSqyhUYtS6PsujaKpY-RA3ceEYwyWoo3ZmwRbMyLIpgf2TzCsCTM2nvmBWpkC2x1mCLOyEaTRUOAetfXrZ8HpY0SyZkSjT0OEK808MMcaHCaJfH46P0Gi-r9uDQ28Ib8PwUxfZyGC2qbYbQ4wK_xr1gwxjypaUiZeOVd9H',
        categoryName: 'الصالونات'
      }
    ];

    for (const prod of productsToSeed) {
      const catId = categoriesMap[prod.categoryName];
      if (!catId) {
        console.error(`Category ID not found for ${prod.categoryName}`);
        continue;
      }
      
      const { data: insertedProd, error: prodInsertErr } = await supabase
        .from('products')
        .insert([{
          category_id: catId,
          name: prod.name,
          description: prod.description,
          product_code: prod.product_code,
          main_image_url: prod.main_image_url
        }])
        .select();
        
      if (prodInsertErr) {
        console.error(`Error inserting product ${prod.name}:`, prodInsertErr);
      } else {
        console.log(`Product seeded: ${prod.name}`);
        
        // Seed additional images if any
        if (prod.additional_images && prod.additional_images.length > 0) {
          const prodId = insertedProd[0].id;
          const imagesToInsert = prod.additional_images.map((imgUrl, index) => ({
            product_id: prodId,
            image_url: imgUrl,
            display_order: index + 1
          }));
          
          const { error: imgInsertErr } = await supabase
            .from('product_images')
            .insert(imagesToInsert);
            
          if (imgInsertErr) {
            console.error(`Error inserting additional images for product ${prod.name}:`, imgInsertErr);
          } else {
            console.log(`Additional images seeded for: ${prod.name}`);
          }
        }
      }
    }
    
    console.log('Database Seeding Completed Successfully!');
  } catch (err) {
    console.error('Unexpected error during seeding:', err);
  }
}

seed();
