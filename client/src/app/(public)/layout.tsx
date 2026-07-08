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
      <Header />
      <main id="main-content">{children}</main>
      <StickyTikTokButton />
      <ExitIntentPopup />
      <Footer />
    </>
  );
}
