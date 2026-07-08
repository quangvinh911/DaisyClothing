import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import StickyTikTokButton from "@/components/StickyTikTokButton";
import ExitIntentPopup from "@/components/ExitIntentPopup";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <a href="#main-content" className="skip-to-content">
        Bỏ qua đến nội dung chính
      </a>
      <Header />
      <main id="main-content" role="main">{children}</main>
      <StickyTikTokButton />
      <ExitIntentPopup />
      <Footer />
    </>
  );
}
