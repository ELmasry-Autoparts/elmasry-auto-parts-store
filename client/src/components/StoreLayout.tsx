import { ReactNode, useEffect, useState } from "react";
import { Link } from "wouter";
import { Menu, MessageCircle, Phone, ShoppingCart, Wrench, X } from "lucide-react";

const WHATSAPP = "201142900066";
const PHONE = "01142900066";

export function whatsapp(message: string) {
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`;
}

export default function StoreLayout({ children, title, eyebrow }: { children: ReactNode; title?: string; eyebrow?: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cleanup: (() => void) | undefined;
    import("../lib/homeMotion").then(({ initHomeMotion }) => { cleanup = initHomeMotion(); });
    return () => cleanup?.();
  }, []);
  const nav = [
    ["الرئيسية", "/"], ["القطع", "/parts"], ["اختار عربيتك", "/vehicles"],
    ["بحث OEM", "/oem-search"], ["المساعد", "/matcher"], ["تتبع طلبك", "/tracking"],
  ];
  return (
    <div className="store-page" dir="rtl">
      <div className="top-strip"><div className="container strip-inner"><span><i className="status-dot" /> الطلبات متاحة الآن عبر واتساب</span><span className="strip-desktop">الشحن لجميع المحافظات · تأكيد المطابقة برقم الشاسيه</span><a href={`tel:${PHONE}`}>اتصل بنا: {PHONE}</a></div></div>
      <header className="site-header"><div className="container nav-inner">
        <Link className="brand-lockup" href="/"><span className="brand-mark"><Wrench size={21} /></span><span><strong>عبدالرحمن المصري</strong><small>KOREAN OEM PARTS</small></span></Link>
        <nav className={menuOpen ? "main-nav open" : "main-nav"}>{nav.map(([label, href]) => <Link key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</Link>)}</nav>
        <div className="nav-actions"><a className="nav-phone" href={`tel:${PHONE}`}><Phone size={16} /> <span>{PHONE}</span></a><Link className="icon-button" href="/cart" aria-label="السلة"><ShoppingCart size={19} /></Link><a className="icon-button" href={whatsapp("مرحباً، أريد الاستفسار عن قطعة غيار أصلية")} target="_blank" rel="noreferrer" aria-label="واتساب"><MessageCircle size={19} /></a><button className="menu-button" onClick={() => setMenuOpen((value) => !value)} aria-label="فتح القائمة">{menuOpen ? <X size={22} /> : <Menu size={22} />}</button></div>
      </div></header>
      {title && <section className="page-hero" data-reveal><div className="hero-grid" /><div className="container page-hero-content"><span className="section-label">{eyebrow ?? "عبدالرحمن المصري / متجر قطع الغيار"}</span><h1>{title}</h1></div></section>}
      <main>{children}</main>
      <footer className="site-footer"><div className="container footer-grid"><div className="footer-brand"><Link className="brand-lockup" href="/"><span className="brand-mark"><Wrench size={21} /></span><span><strong>عبدالرحمن المصري</strong><small>KOREAN OEM PARTS</small></span></Link><p>قطع غيار هيونداي وكيا الأصلية من الحرفيين إلى كل محافظات مصر.</p></div><div className="footer-col"><strong>تصفح</strong><Link href="/parts">كتالوج القطع</Link><Link href="/vehicles">اختار عربيتك</Link><Link href="/faq">الأسئلة الشائعة</Link></div><div className="footer-col"><strong>خدمة العملاء</strong><Link href="/tracking">تتبع طلبك</Link><Link href="/contact">تواصل معنا</Link><Link href="/returns-policy">الاستبدال والاسترجاع</Link></div><div className="footer-col"><strong>تواصل معنا</strong><a href={`tel:${PHONE}`}><Phone size={15} /> {PHONE}</a><a href={whatsapp("مرحباً")} target="_blank" rel="noreferrer"><MessageCircle size={15} /> واتساب مباشر</a><span>الحرفيين، السلام، القاهرة</span></div></div><div className="container footer-bottom"><span>© 2026 عبدالرحمن المصري. جميع الحقوق محفوظة.</span><span><Link href="/shipping-policy">الشحن</Link> · <Link href="/privacy-policy">الخصوصية</Link></span></div></footer>
      <a className="floating-wa" href={whatsapp("مرحباً، أريد مساعدة في اختيار قطعة غيار")} target="_blank" rel="noreferrer"><MessageCircle size={21} /> اسأل خبير</a>
    </div>
  );
}

export function PageSection({ children, className = "" }: { children: ReactNode; className?: string }) { return <section className={`store-section ${className}`}><div className="container">{children}</div></section>; }
export function SectionTitle({ eyebrow, title, copy }: { eyebrow: string; title: string; copy?: string }) { return <div className="store-section-title"><div><span className="section-label">{eyebrow}</span><h2>{title}</h2></div>{copy && <p>{copy}</p>}</div>; }
