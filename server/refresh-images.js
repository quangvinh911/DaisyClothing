const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function refreshAllProductImages() {
  console.log("Starting product image refresh...");
  const products = await prisma.product.findMany({
    where: {
      platform: 'TIKTOK',
      tiktokVideoUrl: { not: null },
    },
    select: {
      id: true,
      name: true,
      imageUrl: true,
      tiktokVideoUrl: true,
    },
  });

  console.log(`Found ${products.length} TikTok products to check.`);

  let updatedCount = 0;
  let failedCount = 0;

  for (const product of products) {
    if (!product.tiktokVideoUrl) continue;

    try {
      const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(product.tiktokVideoUrl)}`;
      const res = await fetch(oembedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.thumbnail_url) {
          await prisma.product.update({
            where: { id: product.id },
            data: { imageUrl: data.thumbnail_url },
          });
          updatedCount++;
          console.log(`[✓] Refreshed image for product ID: ${product.id}`);
        }
      } else {
        failedCount++;
        console.warn(`[!] Oembed returned ${res.status} for product ID: ${product.id}`);
      }
    } catch (e) {
      failedCount++;
      console.error(`[X] Error refreshing product ID ${product.id}:`, e.message);
    }
  }

  console.log(`\n========================================`);
  console.log(`IMAGE REFRESH COMPLETED!`);
  console.log(`Successfully updated: ${updatedCount}/${products.length}`);
  console.log(`Failed: ${failedCount}`);
  console.log(`========================================\n`);
}

refreshAllProductImages()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
