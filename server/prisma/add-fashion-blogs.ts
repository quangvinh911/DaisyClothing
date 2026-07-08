import { PrismaClient, PostStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📖 Adding new fashion blog posts...');

  // 1. Find Admin User
  const admin = await prisma.adminUser.findFirst({
    where: { email: 'admin@daisydaily.com' },
  });

  if (!admin) {
    console.error('❌ Admin user admin@daisydaily.com not found. Please run seed script first.');
    process.exit(1);
  }

  // 2. Find Categories
  const outfitsCategory = await prisma.category.findUnique({ where: { slug: 'outfits' } });
  const tipsTricksCategory = await prisma.category.findUnique({ where: { slug: 'tips-tricks' } });

  if (!outfitsCategory || !tipsTricksCategory) {
    console.error('❌ Required categories not found.');
    process.exit(1);
  }

  const newPosts = [
    {
      title: '20+ Cách Phối Đồ Nữ Đẹp, Đơn Giản Và Hợp Xu Hướng 2025',
      slug: '20-cach-phoi-do-nu-dep-xu-huong-2025',
      excerpt: 'Khám phá 20+ cách phối đồ nữ đẹp, đơn giản và sang trọng đón đầu xu hướng thời trang 2025. Từ phong cách công sở thanh lịch đến thời trang dạo phố năng động.',
      featuredImageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800',
      categoryId: outfitsCategory.id,
      content: `
<p style="text-align: justify;"><em><strong>Nàng không có gì để mặc hay chưa biết sẽ mặc gì hôm nay? Đừng lo lắng, đây không phải là vấn đề của riêng nàng! Bài viết này sẽ giúp nàng khám phá các cách phối đồ nữ đẹp, đơn giản nhưng vẫn giữ được sự sang trọng và tinh tế, bắt cập những xu hướng thời trang mới nhất của năm 2025. Cùng DaisyDaily tìm hiểu các cách phối đồ nữ đẹp và đơn giản nhất nhé!</strong></em></p>

<hr />

<h2 style="text-align: justify;">1. Nguyên tắc phối đồ nữ đơn giản, trẻ trung, sang trọng</h2>
<p style="text-align: justify;">Để sở hữu một phong cách thời trang tinh tế và cuốn hút, nàng không cần phải chạy theo mọi xu hướng hay sở hữu tủ đồ khổng lồ. Điều quan trọng là nàng cần xây dựng một nền tảng vững chắc về phong cách cá nhân, bắt đầu từ những nguyên tắc cơ bản nhưng vô cùng hiệu quả trong cách phối đồ nữ đẹp.</p>
<p style="text-align: justify;">Đầu tiên và quan trọng nhất, hãy luôn tập trung vào sự cân bằng. Một outfit hài hòa không chỉ là sự kết hợp ăn ý về màu sắc mà còn về phom dáng và chất liệu. Nếu nàng chọn một chiếc áo phom rộng, hãy cân nhắc kết hợp với quần ống đứng hoặc chân váy ôm để tạo sự cân đối. Ngược lại, một chiếc áo kiểu ôm sát sẽ hoàn hảo khi đi cùng quần ống rộng hoặc chân váy xòe. Sự đối lập nhưng vẫn có sự đồng bộ sẽ giúp tổng thể trang phục của nàng trở nên thanh thoát và có điểm nhấn.</p>

<h2 style="text-align: justify;">2. Bảng màu phối đồ thống trị xu hướng 2025</h2>
<p style="text-align: justify;">Khi nói đến cách phối đồ nữ hiện đại và hợp xu hướng, việc nắm bắt bảng màu chủ đạo của năm là điều không thể bỏ qua. Năm 2025 là sự lên ngôi của những gam màu trung tính và tự nhiên, mang đến cảm giác dịu nhẹ, thanh lịch và dễ dàng ứng dụng vào mọi phong cách. Đây chính là cơ hội tuyệt vời để nàng F5 tủ đồ của mình, hướng tới sự tinh tế và sang trọng.</p>
<p style="text-align: justify;">Các gam màu trung tính như be, xám, trắng ngà, nâu đất tiếp tục giữ vững vị thế. Chúng không chỉ dễ dàng kết hợp với nhau mà còn là nền tảng hoàn hảo để làm nổi bật những gam màu khác. Một bộ trang phục đơn sắc với các sắc thái khác nhau của màu be, ví dụ như một chiếc áo sơ mi be sáng kết hợp với quần suông màu be đậm, sẽ mang lại vẻ ngoài cực kỳ thanh lịch và đẳng cấp.</p>

<h2 style="text-align: justify;">3. Tổng hợp cách phối đồ nữ đẹp theo dáng người</h2>
<h3 style="text-align: justify;">Cách phối đồ cho dáng người thanh mảnh</h3>
<p style="text-align: justify;">Với những nàng có vóc dáng thanh mảnh, mục tiêu là tạo cảm giác đầy đặn và có đường cong hơn. Nàng nên ưu tiên những trang phục có khả năng tạo độ phồng, thêm chi tiết hoặc lớp lang. Những chiếc đầm 2 dây lụa, satin có bèo nhún hoặc đầm xòe bồng bềnh là lựa chọn hoàn hảo.</p>

<h3 style="text-align: justify;">Cách phối đồ cho dáng người tròn đầy</h3>
<p style="text-align: justify;">Đối với những nàng có vóc dáng hơi tròn đầy, mục tiêu chung luôn là tạo cảm giác thon gọn, thanh thoát và kéo dài cơ thể. Những chiếc đầm nhún eo, thiết kế cổ chữ V hoặc chân váy chữ A sẫm màu sẽ là trợ thủ đắc lực che khuyết điểm.</p>

<h3 style="text-align: justify;">Cách phối đồ cho dáng người quả lê</h3>
<p style="text-align: justify;">Dáng người quả lê thường có phần hông và đùi lớn hơn vai và ngực. Hãy làm nổi bật phần thân trên bằng cách chọn áo sáng màu có bèo nhún hoặc tay bồng kết hợp chân váy dáng đứng hoặc quần suông tối màu.</p>

<h2 style="text-align: justify;">4. Công thức phối đồ theo từng dịp</h2>
<h3 style="text-align: justify;">Thời trang công sở chuyên nghiệp</h3>
<p style="text-align: justify;">Áo sơ mi lụa mềm mại kết hợp với quần tây ống rộng cạp cao và thắt lưng nhỏ là sự kết hợp kinh điển nhưng vô cùng tôn dáng. Khoác thêm một chiếc blazer beige bên ngoài để nâng tầm phong cách lập tức.</p>

<h3 style="text-align: justify;">Thời trang dạo phố năng động</h3>
<p style="text-align: justify;">Sự thoải mái và trẻ trung được đặt lên hàng đầu. Hãy chọn áo phông basic mix cùng chân váy jeans xẻ tà hoặc quần jeans ống rộng, mang kèm sneaker hoặc sandal đế bệt.</p>
      `.trim(),
    },
    {
      title: '11 Chất Liệu Vải May Đầm Đẹp Và Được Ưa Chuộng Nhất 2025',
      slug: '11-chat-lieu-vai-may-dam-dep-ua-chuong-2025',
      excerpt: 'Tìm hiểu 11 chất liệu vải may đầm cao cấp, đứng phom và mát mịn được yêu thích nhất xu hướng thời trang 2025 để may mặc tôn dáng.',
      featuredImageUrl: 'https://images.unsplash.com/photo-1545048702-79362596cdc9?w=800',
      categoryId: tipsTricksCategory.id,
      content: `
<p style="text-align: justify;"><em><strong>Một chiếc đầm đẹp không chỉ nằm ở phom dáng hay đường may, mà chất liệu vải chính là linh hồn quyết định sự sang trọng và thoải mái. Năm 2025 chứng kiến sự lên ngôi của các chất liệu vải tự nhiên, thân thiện môi trường và có độ bền cao. Hãy cùng DaisyDaily khám phá 11 chất liệu vải may đầm được ưa chuộng nhất năm nay nhé!</strong></em></p>

<hr />

<h2 style="text-align: justify;">1. Vải Linen (Vải lanh tự nhiên)</h2>
<p style="text-align: justify;">Linen là chất liệu đại diện cho mùa hè và những chuyến du lịch. Được dệt từ sợi cây lanh, vải linen cực kỳ thoáng khí, thấm hút mồ hôi tốt và mang lại nét mộc mạc, phóng khoáng rất đặc trưng. Dù có độ nhăn tự nhiên, đây lại được xem là điểm thu hút đầy chất nghệ thuật của chất liệu này.</p>

<h2 style="text-align: justify;">2. Vải Lụa (Silk)</h2>
<p style="text-align: justify;">Nhắc đến sự quý phái và quyến rũ, không thể bỏ qua vải lụa. Lụa tơ tằm mềm mại, mát mịn, có độ bóng tự nhiên bắt sáng rất tốt, cực kỳ thích hợp cho các mẫu đầm tiệc sang trọng hoặc đầm ngủ quyến rũ.</p>

<h2 style="text-align: justify;">3. Vải Tweed (Dạ dạ ấm áp)</h2>
<p style="text-align: justify;">Thích hợp cho các mùa thu đông, vải Tweed dày dặn, được dệt từ nhiều sợi màu sắc đan xen tạo nên bề mặt kết cấu độc đáo. Những chiếc đầm Tweed cổ tròn dáng suông hoặc chân váy Tweed phối áo blazer mang lại vibe tiểu thư vô cùng sang chảnh.</p>

<h2 style="text-align: justify;">4. Vải Voan (Chiffon)</h2>
<p style="text-align: justify;">Với đặc tính mỏng, nhẹ và có độ rủ cực tốt, voan là chất liệu lý tưởng cho những chiếc đầm maxi thướt tha hoặc đầm hoa nhí vintage bồng bềnh dạo phố.</p>

<h2 style="text-align: justify;">5. Vải Cotton cao cấp</h2>
<p style="text-align: justify;">Chất liệu quốc dân thân thiện với mọi làn da. Vải cotton mềm mịn, co giãn tốt và có khả năng thấm hút mồ hôi vượt trội, thích hợp cho các mẫu đầm thun ôm body năng động hoặc đầm thun dáng suông dạo phố hàng ngày.</p>

<h2 style="text-align: justify;">6. Vải Organza (Tơ sống)</h2>
<p style="text-align: justify;">Organza có độ cứng nhẹ và hơi phồng, giúp giữ phom dáng thiết kế xếp ly hoặc bèo nhún cực tốt. Đầm làm bằng vải organza thường mang lại vẻ ngoài thần tiên, bay bổng rất thích hợp cho tiệc cưới hoặc sự kiện lớn.</p>
      `.trim(),
    }
  ];

  for (const post of newPosts) {
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
        status: PostStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });

    console.log(`✅ Post added: "${createdPost.title}" (Slug: ${createdPost.slug})`);
  }

  console.log('🎉 Adding fashion posts complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error running script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
