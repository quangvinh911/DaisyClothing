import { PrismaClient, PostStatus, Platform } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Admin User ──────────────────────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@daisydaily.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'changeme123';
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
    },
    create: {
      email: adminEmail,
      passwordHash,
      displayName: 'DaisyDaily Admin',
    },
  });

  console.log(`✅ Admin user: ${admin.email}`);

  // ─── Categories ──────────────────────────────────────────
  const categories = [
    { name: 'Outfits', slug: 'outfits', description: 'Gợi ý phối đồ hàng ngày', sortOrder: 1, imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600' },
    { name: 'Đầm & Váy', slug: 'dam-vay', description: 'Đầm công sở, đầm dạo phố', sortOrder: 2, imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600' },
    { name: 'Áo', slug: 'ao', description: 'Áo sơ mi, áo thun, áo khoác', sortOrder: 3, imageUrl: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600' },
    { name: 'Quần', slug: 'quan', description: 'Quần jeans, quần tây, quần short', sortOrder: 4, imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600' },
    { name: 'Phụ kiện', slug: 'phu-kien', description: 'Túi xách, giày dép, trang sức', sortOrder: 5, imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600' },
    { name: 'Tips & Tricks', slug: 'tips-tricks', description: 'Mẹo thời trang, cách phối đồ', sortOrder: 6, imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600' },
    { name: 'Lifestyle', slug: 'lifestyle', description: 'Cuộc sống, du lịch, beauty', sortOrder: 7, imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        imageUrl: cat.imageUrl,
        description: cat.description,
      },
      create: cat,
    });
  }

  console.log(`✅ ${categories.length} categories created`);

  // ─── Tags ────────────────────────────────────────────────
  const tags = [
    { name: 'Mùa hè', slug: 'mua-he' },
    { name: 'Mùa đông', slug: 'mua-dong' },
    { name: 'Công sở', slug: 'cong-so' },
    { name: 'Dạo phố', slug: 'dao-pho' },
    { name: 'Hẹn hò', slug: 'hen-ho' },
    { name: 'Minimalist', slug: 'minimalist' },
    { name: 'Trendy', slug: 'trendy' },
    { name: 'Budget-friendly', slug: 'budget-friendly' },
  ];

  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: tag,
    });
  }

  console.log(`✅ ${tags.length} tags created`);

  // ─── Social Links ───────────────────────────────────────
  const socialLinks = [
    { platform: 'TikTok', url: 'https://www.tiktok.com/@em.xinh0905', icon: 'tiktok', sortOrder: 1 },
    { platform: 'Shopee', url: 'https://shopee.vn/', icon: 'shopee', sortOrder: 2 },
    { platform: 'Instagram', url: 'https://instagram.com/', icon: 'instagram', sortOrder: 3 },
    { platform: 'Facebook', url: 'https://facebook.com/', icon: 'facebook', sortOrder: 4 },
  ];

  for (const link of socialLinks) {
    const existing = await prisma.socialLink.findFirst({
      where: { platform: link.platform },
    });
    if (!existing) {
      await prisma.socialLink.create({ data: link });
    }
  }

  console.log(`✅ Social links created`);

  // ─── Sample Products ─────────────────────────────────────
  const outfitsCategory = await prisma.category.findUnique({ where: { slug: 'outfits' } });
  const damVayCategory = await prisma.category.findUnique({ where: { slug: 'dam-vay' } });
  const aoCategory = await prisma.category.findUnique({ where: { slug: 'ao' } });
  const phuKienCategory = await prisma.category.findUnique({ where: { slug: 'phu-kien' } });

  const sampleProducts = [
    {
      name: 'Áo sơ mi trắng basic',
      slug: 'ao-so-mi-trang-basic',
      description: 'Áo sơ mi trắng chất liệu cotton lụa mát mẻ, form đứng cực kỳ tôn dáng và dễ phối đồ.',
      brand: 'Uniqlo',
      price: 399000,
      currency: 'VND',
      platform: Platform.SHOPEE,
      affiliateUrl: 'https://shopee.vn/',
      imageUrl: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=500',
      tiktokVideoUrl: 'https://www.tiktok.com/@em.xinh0905/video/7342674918731517190',
      categoryId: aoCategory?.id,
    },
    {
      name: 'Quần jeans ống rộng basic',
      slug: 'quan-jeans-ong-rong',
      description: 'Quần jeans denim xanh sáng, ống rộng cạp cao hack dáng cực đỉnh.',
      brand: 'Zara',
      price: 599000,
      currency: 'VND',
      platform: Platform.TIKTOK,
      affiliateUrl: 'https://www.tiktok.com/',
      imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500',
      tiktokVideoUrl: 'https://www.tiktok.com/@em.xinh0905/video/7325243171345681670',
      categoryId: outfitsCategory?.id,
    },
    {
      name: 'Túi xách da mini đeo chéo',
      slug: 'tui-xach-mini-da',
      description: 'Túi xách mini da thật vân cá sấu, quai đeo xích sang trọng, nhỏ gọn đi chơi rất tiện.',
      brand: 'Charles & Keith',
      price: 1290000,
      currency: 'VND',
      platform: Platform.SHOPEE,
      affiliateUrl: 'https://shopee.vn/',
      imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500',
      categoryId: phuKienCategory?.id,
    },
    {
      name: 'Đầm midi hoa nhí tay bồng',
      slug: 'dam-midi-hoa-nhi-tay-bong',
      description: 'Đầm midi voan hàn mát lịm, hoạ tiết hoa nhí vintage ngọt ngào, phù hợp đi biển hay cafe cuối tuần.',
      brand: 'DaisyDaily Store',
      price: 450000,
      currency: 'VND',
      platform: Platform.SHOPEE,
      affiliateUrl: 'https://shopee.vn/',
      imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500',
      tiktokVideoUrl: 'https://www.tiktok.com/@em.xinh0905/video/7311149721054776582',
      categoryId: damVayCategory?.id,
    },
    {
      name: 'Áo khoác blazer màu beige thanh lịch',
      slug: 'ao-khoac-blazer-beige',
      description: 'Áo khoác blazer 2 lớp đứng form, tone màu beige trung tính dễ mặc đi làm hay đi chơi đều đẹp.',
      brand: 'H&M',
      price: 850000,
      currency: 'VND',
      platform: Platform.SHOPEE,
      affiliateUrl: 'https://shopee.vn/',
      imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500',
      categoryId: aoCategory?.id,
    },
    {
      name: 'Sandal quai mảnh cao gót 5cm',
      slug: 'sandal-quai-manh-5cm',
      description: 'Sandal cao gót quai mảnh thanh mảnh sang chân, đế vuông vững vàng dễ đi lại.',
      brand: 'Aldo',
      price: 950000,
      currency: 'VND',
      platform: Platform.SHOPEE,
      affiliateUrl: 'https://shopee.vn/',
      imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500',
      categoryId: phuKienCategory?.id,
    },
    {
      name: 'Kính mát mắt mèo Cat-Eye vintage',
      slug: 'kinh-mat-cat-eye-vintage',
      description: 'Kính râm gọng mắt mèo cổ điển, chống tia UV bảo vệ mắt và tạo điểm nhấn cực ngầu cho outfit.',
      brand: 'Gentle Monster',
      price: 3200000,
      currency: 'VND',
      platform: Platform.TIKTOK,
      affiliateUrl: 'https://www.tiktok.com/',
      imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500',
      categoryId: phuKienCategory?.id,
    }
  ];

  for (const product of sampleProducts) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        imageUrl: product.imageUrl,
        tiktokVideoUrl: product.tiktokVideoUrl,
        description: product.description,
        price: product.price,
        categoryId: product.categoryId,
      },
      create: product,
    });
  }

  console.log(`✅ ${sampleProducts.length} sample products created`);

  // Fetch created products to associate with posts
  const dbProducts = await prisma.product.findMany();
  const prodIds = dbProducts.map((p) => p.id);

  // ─── Sample Posts ──────────────────────────────────────────
  const quanCategory = await prisma.category.findUnique({ where: { slug: 'quan' } });
  const tipsTricksCategory = await prisma.category.findUnique({ where: { slug: 'tips-tricks' } });
  const lifestyleCategory = await prisma.category.findUnique({ where: { slug: 'lifestyle' } });

  const postsToSeed = [
    {
      title: '5 Cách Phối Đồ Mùa Hè 2025 Cực Xinh',
      slug: '5-cach-phoi-do-mua-he-2025',
      content: `
        <h2>1. Áo sơ mi trắng + Quần jeans ống rộng</h2>
        <p>Combo kinh điển nhưng không bao giờ lỗi mốt! Chọn áo sơ mi oversize kết hợp quần jeans ống rộng để tạo vibe chill mà vẫn thanh lịch.</p>
        <img src="https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600" alt="White shirt style" />
        
        <h2>2. Đầm midi hoa nhí tay bồng</h2>
        <p>Mùa hè mà không có đầm hoa nhí thì thiếu vắng lắm! Chọn tông pastel nhẹ nhàng, phối thêm sandal quai mảnh là ra ngay set đồ đi biển hoàn hảo.</p>
        
        <h2>3. Áo crop top + Chân váy dài</h2>
        <p>Set đồ này vừa tôn eo, vừa hack chiều cao cực kỳ hiệu quả. Thêm một chiếc túi xách mini da là chuẩn phong cách.</p>
      `.trim(),
      excerpt: '5 gợi ý phối đồ mùa hè 2025 giúp bạn luôn xinh đẹp và trendy mỗi ngày. Từ áo sơ mi basic đến đầm hoa nhí.',
      featuredImageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800',
      status: PostStatus.PUBLISHED,
      categoryId: outfitsCategory?.id,
    },
    {
      title: 'Mẹo Chọn Đầm Midi Tôn Dáng Cho Nàng Nấm Lùn',
      slug: 'meo-chon-dam-midi-ton-dang',
      content: `
        <h2>1. Chú ý chiều dài đầm</h2>
        <p>Để hack dáng tốt nhất, nàng hãy chọn đầm midi có độ dài ngang bắp chân. Tránh đầm quá dài đến mắt cá chân vì sẽ làm dìm chiều cao.</p>
        
        <h2>2. Chọn thiết kế cổ chữ V</h2>
        <p>Thiết kế cổ chữ V giúp phần cổ trông thanh thoát và tạo hiệu ứng phần thân trên dài hơn.</p>
        <img src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600" alt="V-neck dress style" />
        
        <h2>3. Nhấn eo cao</h2>
        <p>Luôn ưu tiên những chiếc đầm midi có chun eo hoặc đường thắt eo cao sát chân ngực để tạo tỷ lệ cơ thể chân dài lưng ngắn.</p>
      `.trim(),
      excerpt: 'Bí quyết lựa chọn đầm midi chuẩn hack dáng giúp các nàng nấm lùn ăn gian chiều cao cực kỳ hiệu quả.',
      featuredImageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800',
      status: PostStatus.PUBLISHED,
      categoryId: damVayCategory?.id,
    },
    {
      title: 'Xây Dựng Tủ Đồ Công Sở Theo Phong Cách Toàn Diện',
      slug: 'tu-do-cong-so-toan-dien',
      content: `
        <h2>1. Áo khoác Blazer beige basic</h2>
        <p>Một chiếc blazer đứng form màu trung tính là cứu cánh cho mọi outfit đi làm. Khoác ngoài áo thun hay áo sơ mi đều nâng tầm set đồ lập tức.</p>
        
        <h2>2. Áo sơ mi lụa tơ tằm</h2>
        <p>Sơ mi lụa mang lại cảm giác mềm mại, nữ tính và cực kỳ sang trọng cho các nàng văn phòng.</p>
        <img src="https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600" alt="Blazer workplace fashion" />
        
        <h2>3. Quần tây ống đứng hoặc ống loe nhẹ</h2>
        <p>Những mẫu quần tây tôn dáng này giúp nàng thoải mái hoạt động cả ngày dài mà vẫn lịch sự chuyên nghiệp.</p>
      `.trim(),
      excerpt: 'Những item công sở cơ bản nhưng cực kỳ thanh lịch giúp nàng biến hóa đa dạng phong cách mỗi ngày đi làm.',
      featuredImageUrl: 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=800',
      status: PostStatus.PUBLISHED,
      categoryId: outfitsCategory?.id,
    },
    {
      title: 'Bí Quyết Phối Đồ Theo Phong Cách Tối Giản (Minimalist Style)',
      slug: 'bi-quyet-phoi-do-phong-cach-toi-gian',
      content: `
        <h2>1. Hạn chế màu sắc sặc sỡ</h2>
        <p>Phong cách tối giản tập trung vào các gam màu trung tính như trắng, đen, beige, xám và ghi. Bạn nên giới hạn mỗi outfit chỉ có tối đa 3 màu.</p>
        <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600" alt="Minimalist fashion look" />
        
        <h2>2. Đầu tư vào chất liệu chất lượng</h2>
        <p>Vì kiểu dáng của phong cách tối giản rất đơn giản, chất liệu vải (như cotton, linen, lụa, len tơ tằm) sẽ là yếu tố quyết định sự sang trọng của outfit.</p>
        
        <h2>3. Lựa chọn phom dáng cơ bản, tinh tế</h2>
        <p>Tập trung vào những đường cắt may thẳng thớm, vừa vặn cơ thể, không cầu kỳ bèo nhún để tạo phom dáng thanh thoát nhất.</p>
      `.trim(),
      excerpt: 'Làm thế nào để mặc đẹp với phong cách tối giản mà không bị nhàm chán? Những bí quyết phối đồ không bao giờ lỗi mốt.',
      featuredImageUrl: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=800',
      status: PostStatus.PUBLISHED,
      categoryId: lifestyleCategory?.id,
    },
    {
      title: 'Top 7 Phụ Kiện Không Thể Thiếu Cho Outfit Mùa Thu',
      slug: 'top-7-phu-kien-mua-thu',
      content: `
        <h2>1. Túi xách da mini tông màu đất</h2>
        <p>Túi xách màu nâu da bò, beige hay cam đất cực kỳ thích hợp để tạo điểm nhấn ấm áp cho những ngày trời thu dịu mát.</p>
        
        <h2>2. Kính râm mắt mèo Cat-Eye cổ điển</h2>
        <p>Kính râm gọng mắt mèo vừa giúp bảo vệ mắt vừa mang lại vẻ ngoài sành điệu, có chút cổ điển đầy cuốn hút.</p>
        <img src="https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600" alt="Autumn accessories look" />
        
        <h2>3. Giày Sandal quai mảnh cao gót vừa phải</h2>
        <p>Một đôi sandal 3-5 phân giúp tôn dáng thanh mảnh, dễ dàng kết hợp cùng chân váy midi hay quần jeans ống rộng.</p>
      `.trim(),
      excerpt: 'Danh sách 7 món phụ kiện thời thượng giúp nâng tầm mọi set đồ mùa thu của bạn một cách dễ dàng nhất.',
      featuredImageUrl: 'https://images.unsplash.com/photo-1509319117193-57bab727e09d?w=800',
      status: PostStatus.PUBLISHED,
      categoryId: phuKienCategory?.id,
    },
    {
      title: 'Hướng Dẫn Mặc Đẹp Với Quần Jeans Ống Rộng Trendy',
      slug: 'huong-dan-mac-dep-voi-quan-jeans-ong-rong',
      content: `
        <h2>1. Chọn quần jeans cạp cao để hack chiều cao</h2>
        <p>Thiết kế cạp cao luôn là nguyên tắc vàng khi mặc quần jeans ống rộng để kéo dài đôi chân một cách tự nhiên nhất.</p>
        <img src="https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600" alt="Wide-leg jeans style" />
        
        <h2>2. Phối cùng áo ôm sát cơ thể hoặc sơ vin gọn gàng</h2>
        <p>Vì quần dưới đã rộng, hãy chọn phần áo trên gọn gàng (như áo thun ôm, crop top, sơ mi sơ vin) để tạo tỷ lệ cơ thể cân đối, không lùng bùng.</p>
        
        <h2>3. Mang cùng giày cao gót hoặc sneaker đế bánh mì</h2>
        <p>Một chút chiều cao từ giày dép sẽ giúp ống quần rủ xuống thẳng thớm, sang chân hơn.</p>
      `.trim(),
      excerpt: 'Bí quyết diện quần jeans ống rộng cực kỳ tôn dáng và phong cách dành cho mọi vóc dáng từ nấm lùn đến mảnh mai.',
      featuredImageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800',
      status: PostStatus.PUBLISHED,
      categoryId: quanCategory?.id,
    },
    {
      title: 'Phối Đồ Tôn Dáng Cho Buổi Hẹn Hò Đầu Tiên Thêm Ngọt Ngào',
      slug: 'phoi-do-hen-ho-dau-tien',
      content: `
        <h2>1. Đầm midi hoa nhí thướt tha</h2>
        <p>Sự lựa chọn an toàn và ngọt ngào nhất. Chiếc đầm midi hoa nhí mang lại vẻ nữ tính, nhẹ nhàng và vô cùng thanh lịch.</p>
        <img src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600" alt="First date look" />
        
        <h2>2. Combo áo sơ mi trễ vai và chân váy chữ A</h2>
        <p>Vừa đủ gợi cảm một cách tinh tế. Khoe xương quai xanh quyến rũ kết hợp cùng chân váy xếp ly điệu đà.</p>
        
        <h2>3. Phụ kiện đi kèm tinh tế</h2>
        <p>Đừng mang quá nhiều phụ kiện rườm rà. Một chiếc túi xách nhỏ xinh và khuyên tai ngọc trai là đủ tạo điểm nhấn hoàn hảo.</p>
      `.trim(),
      excerpt: 'Gợi ý những set đồ điệu đà, tinh tế giúp nàng ghi điểm tuyệt đối trong mắt đối phương vào buổi hẹn đầu tiên.',
      featuredImageUrl: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800',
      status: PostStatus.PUBLISHED,
      categoryId: outfitsCategory?.id,
    },
    {
      title: 'Các Bước Chăm Sóc Da Đơn Giản Mỗi Tối Cho Nàng Bận Rộn',
      slug: 'cac-buoc-cham-soc-da-buoi-toi',
      content: `
        <h2>1. Làm sạch sâu là chìa khóa vàng</h2>
        <p>Dù có bận rộn đến đâu, hãy thực hiện double-cleansing (tẩy trang + sữa rửa mặt) để loại bỏ hoàn toàn bụi bẩn và lớp trang điểm.</p>
        <img src="https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600" alt="Skincare routine" />
        
        <h2>2. Cân bằng độ ẩm và dưỡng chất serum</h2>
        <p>Vỗ toner nhẹ nhàng rồi thoa serum dưỡng ẩm sâu (chứa Hyaluronic Acid hoặc Niacinamide) để nuôi dưỡng làn da qua đêm.</p>
        
        <h2>3. Khóa ẩm bằng kem dưỡng nhẹ dịu</h2>
        <p>Một lớp kem dưỡng ẩm mỏng nhẹ giúp giữ chặt mọi dưỡng chất và cấp nước cho da căng mọng sau khi thức dậy.</p>
      `.trim(),
      excerpt: 'Quy trình skincare tối giản chỉ với 3 bước cơ bản nhưng mang lại hiệu quả phục hồi da căng bóng tuyệt vời.',
      featuredImageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800',
      status: PostStatus.PUBLISHED,
      categoryId: lifestyleCategory?.id,
    },
    {
      title: 'Làm Thế Nào Để "Re-wear" Một Chiếc Đầm Nhiều Lần Vẫn Mới?',
      slug: 'meo-mac-lai-dam-nhieu-lan',
      content: `
        <h2>1. Thay đổi layout áo khoác ngoài</h2>
        <p>Một chiếc đầm trơn có thể biến hóa từ năng động (khoác áo jeans) đến thanh lịch đi làm (khoác blazer beige).</p>
        <img src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600" alt="Styling a dress multiple ways" />
        
        <h2>2. Tận dụng thắt lưng để thay đổi phom dáng</h2>
        <p>Thêm chiếc thắt lưng bản nhỏ để tạo điểm nhấn eo thu hút, hoặc bỏ thắt lưng để mặc suông phóng khoáng.</p>
        
        <h2>3. Biến tấu phụ kiện đi kèm</h2>
        <p>Kết hợp giày sneaker và mũ lưỡi trai cho ngày đi chơi, thay bằng giày cao gót và hoa tai lấp lánh cho bữa tiệc tối.</p>
      `.trim(),
      excerpt: 'Mẹo mix-and-match thông minh giúp bạn mặc lại chiếc đầm yêu thích nhiều lần mà không lo bị trùng lặp phong cách.',
      featuredImageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
      status: PostStatus.PUBLISHED,
      categoryId: damVayCategory?.id,
    },
    {
      title: 'Cách Giữ Quần Áo Luon Bền Đẹp Như Mới Mua Tại Nhà',
      slug: 'cach-giu-quan-ao-luon-ben-dep',
      content: `
        <h2>1. Đọc kỹ nhãn hướng dẫn giặt ủi</h2>
        <p>Mỗi loại chất liệu (len, lụa, linen) đều có nhiệt độ giặt và chế độ vắt riêng biệt. Hãy tuân thủ hướng dẫn trên nhãn sườn áo.</p>
        <img src="https://images.unsplash.com/photo-1545048702-79362596cdc9?w=600" alt="Clothing care tips" />
        
        <h2>2. Lộn trái quần áo khi giặt và phơi</h2>
        <p>Cách đơn giản này giúp bảo vệ bề mặt vải không bị xước và giữ màu sắc của trang phục không bị phai nhạt dưới ánh nắng mặt trời.</p>
        
        <h2>3. Sử dụng túi giặt cho trang phục mỏng</h2>
        <p>Túi lưới bảo vệ giúp áo sơ mi lụa, đầm ren hay áo len không bị giãn phom khi giặt bằng máy giặt.</p>
      `.trim(),
      excerpt: 'Những thói quen giặt giũ và bảo quản quần áo đơn giản nhưng kéo dài tuổi thọ trang phục của bạn thêm nhiều năm.',
      featuredImageUrl: 'https://images.unsplash.com/photo-1545048702-79362596cdc9?w=800',
      status: PostStatus.PUBLISHED,
      categoryId: tipsTricksCategory?.id,
    }
  ];

  for (const post of postsToSeed) {
    const createdPost = await prisma.post.upsert({
      where: { slug: post.slug },
      update: {
        featuredImageUrl: post.featuredImageUrl,
        content: post.content,
        excerpt: post.excerpt,
        categoryId: post.categoryId,
      },
      create: {
        ...post,
        authorId: admin.id,
        metaTitle: `${post.title} | DaisyDaily`,
        metaDescription: post.excerpt,
        publishedAt: new Date(),
      },
    });

    // Link some random sample products to the post for "Shop My Look"
    await prisma.postProduct.deleteMany({ where: { postId: createdPost.id } });
    const links = prodIds.slice(0, 3).map((productId, index) => ({
      postId: createdPost.id,
      productId,
      displayOrder: index,
    }));
    await prisma.postProduct.createMany({ data: links });
  }

  console.log(`✅ ${postsToSeed.length} sample posts created and linked to products`);

  // ─── Site Settings ───────────────────────────────────────
  const settings = [
    { key: 'site_name', value: 'DaisyDaily', description: 'Tên website' },
    { key: 'site_tagline', value: 'Everyday Style, Everyday Beautiful', description: 'Tagline' },
    { key: 'site_description', value: 'Blog thời trang & lifestyle cá nhân. Tips phối đồ, review sản phẩm, và gợi ý mua sắm từ DaisyDaily.', description: 'Mô tả website' },
    { key: 'about_intro', value: 'Xin chào! Mình là DaisyDaily 🌸 Mình là một người yêu thời trang và muốn chia sẻ phong cách hàng ngày của mình với mọi người.', description: 'Giới thiệu ngắn' },
    { key: 'contact_email', value: 'hello@daisydaily.com', description: 'Email liên hệ' },
  ];

  for (const setting of settings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  console.log(`✅ ${settings.length} site settings created`);

  console.log('\n🌸 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
