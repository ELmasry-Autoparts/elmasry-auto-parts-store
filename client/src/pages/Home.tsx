import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowUpLeft,
  BadgeCheck,
  CarFront,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Cpu,
  Facebook,
  FileSearch,
  ImageUp,
  MapPin,
  Menu,
  MessageCircle,
  PackageCheck,
  Phone,
  Search,
  Send,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Truck,
  Wrench,
  X,
  Zap,
} from "lucide-react";

type Car = {
  model: string;
  name: string;
  generation: string;
  image: string;
  brand: "هيونداي" | "كيا";
  count: string;
  accent: string;
};

type Product = {
  id: number;
  title: string;
  oem: string;
  model: string;
  category: string;
  price: string;
  stock: string;
  image: string;
  source: string;
};

const WHATSAPP = "201142900066";
const PHONE = "01142900066";

const cars: Car[] = [
  {
    model: "توسان",
    name: "Hyundai Tucson",
    generation: "NX4 / TL",
    image: "/manus-storage/tucson_0380ba3b.jpg",
    brand: "هيونداي",
    count: "1,280 قطعة",
    accent: "cyan",
  },
  {
    model: "سبورتاج",
    name: "Kia Sportage",
    generation: "NQ5 / QL",
    image: "/manus-storage/sportage_a48428ed.jpg",
    brand: "كيا",
    count: "980 قطعة",
    accent: "lime",
  },
  {
    model: "إيلانترا",
    name: "Elantra",
    generation: "HD / AD / CN7",
    image: "/manus-storage/elantra-cerato_4969652e.jpg",
    brand: "هيونداي",
    count: "1,145 قطعة",
    accent: "blue",
  },
  {
    model: "سيراتو",
    name: "Kia Cerato",
    generation: "K3 / Grand Cerato",
    image: "/manus-storage/elantra-cerato_4969652e.jpg",
    brand: "كيا",
    count: "860 قطعة",
    accent: "violet",
  },
];

const products: Product[] = [
  {
    id: 1,
    title: "تيل فرامل أمامي — توسان NX4",
    oem: "58101-D3A00",
    model: "توسان",
    category: "فرامل وعفشة",
    price: "2,450 ج.م",
    stock: "متوفر · 6 قطع",
    image: "/manus-storage/tucson_0380ba3b.jpg",
    source: "موبيس أصلي",
  },
  {
    id: 2,
    title: "فلتر زيت أصلي — إيلانترا CN7",
    oem: "26300-2M000",
    model: "إيلانترا",
    category: "محرك",
    price: "580 ج.م",
    stock: "متوفر · 18 قطعة",
    image: "/manus-storage/elantra-cerato_4969652e.jpg",
    source: "غبور مصر OEM",
  },
  {
    id: 3,
    title: "سير مجموعة — سبورتاج NQ5",
    oem: "25212-2U000",
    model: "سبورتاج",
    category: "محرك",
    price: "1,180 ج.م",
    stock: "متوفر · 4 قطع",
    image: "/manus-storage/sportage_a48428ed.jpg",
    source: "موبيس أوروبا",
  },
  {
    id: 4,
    title: "حساس كرنك — كيا سيراتو K3",
    oem: "39180-2B000",
    model: "سيراتو",
    category: "كهرباء وحساسات",
    price: "1,350 ج.م",
    stock: "متوفر · 3 قطع",
    image: "/manus-storage/elantra-cerato_4969652e.jpg",
    source: "موبيس أصلي",
  },
];

const categories = ["الكل", "محرك", "فرامل وعفشة", "كهرباء وحساسات", "تكييف وتبريد", "بودي وصاج"];

function waLink(message: string) {
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`;
}

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [activeModel, setActiveModel] = useState("الكل");
  const [activeCategory, setActiveCategory] = useState("الكل");
  const [matcherText, setMatcherText] = useState("");
  const [matcherResult, setMatcherResult] = useState<Product | null>(null);
  const [matcherMode, setMatcherMode] = useState<"text" | "code" | "image">("text");
  const [menuOpen, setMenuOpen] = useState(false);

  const visibleProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return products.filter((product) => {
      const matchesQuery = !normalized || [product.title, product.oem, product.model, product.category].join(" ").toLowerCase().includes(normalized);
      const matchesModel = activeModel === "الكل" || product.model === activeModel;
      const matchesCategory = activeCategory === "الكل" || product.category === activeCategory;
      return matchesQuery && matchesModel && matchesCategory;
    });
  }, [activeCategory, activeModel, query]);

  const runMatcher = () => {
    const input = matcherText.trim().toLowerCase();
    const found = products.find((product) => input && [product.oem, product.title, product.model].join(" ").toLowerCase().includes(input));
    if (found) {
      setMatcherResult(found);
      setQuery(found.oem);
      setActiveModel(found.model);
    } else if (input.includes("تيل") || input.includes("فرامل") || input.includes("brake")) {
      setMatcherResult(products[0]);
      setQuery(products[0].oem);
      setActiveModel(products[0].model);
    } else {
      setMatcherResult(products[0]);
    }
    scrollToId("parts");
  };

  return (
    <div className="site-shell" dir="rtl">
      <div className="top-strip">
        <div className="container strip-inner">
          <span><span className="status-dot" /> الطلبات متاحة الآن عبر واتساب</span>
          <span className="strip-desktop">الشحن لجميع المحافظات · تأكيد المطابقة برقم الشاسيه</span>
          <a href={`tel:${PHONE}`}>اتصل بنا: {PHONE}</a>
        </div>
      </div>

      <header className="site-header">
        <div className="container nav-inner">
          <a className="brand-lockup" href="#top" aria-label="عبدالرحمن المصري">
            <span className="brand-mark"><Wrench size={21} strokeWidth={2.4} /></span>
            <span>
              <strong>عبدالرحمن المصري</strong>
              <small>KOREAN OEM PARTS</small>
            </span>
          </a>
          <nav className={menuOpen ? "main-nav open" : "main-nav"}>
            <a href="#vehicles" onClick={() => setMenuOpen(false)}>السيارات</a>
            <a href="#parts" onClick={() => setMenuOpen(false)}>قطع الغيار</a>
            <a href="#matcher" onClick={() => setMenuOpen(false)}>المساعد الذكي</a>
            <a href="#why-us" onClick={() => setMenuOpen(false)}>لماذا نحن؟</a>
          </nav>
          <div className="nav-actions">
            <a className="nav-phone" href={`tel:${PHONE}`}><Phone size={16} /> <span>{PHONE}</span></a>
            <a className="icon-button" href={waLink("مرحباً، أريد الاستفسار عن قطعة غيار أصلية") } target="_blank" rel="noreferrer" aria-label="واتساب"><MessageCircle size={20} /></a>
            <button className="menu-button" onClick={() => setMenuOpen((value) => !value)} aria-label="فتح القائمة">{menuOpen ? <X size={22} /> : <Menu size={22} />}</button>
          </div>
        </div>
      </header>

      <main id="top">
        <section className="hero-section">
          <div className="hero-grid" />
          <div className="hero-glow hero-glow-one" />
          <div className="hero-glow hero-glow-two" />
          <div className="container hero-layout">
            <div className="hero-copy">
              <div className="eyebrow"><span className="eyebrow-line" /> قطع غيار كورية أصلية <span className="eyebrow-line" /></div>
              <h1>القطعة الصح،<br /><em>من أول مرة.</em></h1>
              <p className="hero-lead">قطع غيار هيونداي وكيا الأصلية مع تأكيد المطابقة برقم الشاسيه، من قلب الحرفيين إلى باب بيتك.</p>
              <div className="hero-ctas">
                <button className="button button-primary" onClick={() => scrollToId("parts")}>ابدأ البحث <ArrowLeft size={18} /></button>
                <a className="button button-ghost" href={waLink("مرحباً، أريد مساعدة في اختيار قطعة غيار") } target="_blank" rel="noreferrer"><MessageCircle size={18} /> اسأل على واتساب</a>
              </div>
              <div className="hero-metrics">
                <div><strong>+6</strong><span>مخازن بالحرفيين</span></div>
                <div><strong>100%</strong><span>قطع أصلية</span></div>
                <div><strong>24/7</strong><span>استشارة فنية</span></div>
              </div>
            </div>
            <div className="hero-search-card glass-card">
              <div className="card-kicker"><Sparkles size={16} /> مساعد البحث السريع</div>
              <h2>بتدور على قطعة؟<br /><span>اكتب رقمها أو وصفها.</span></h2>
              <p>ابحث برقم OEM أو اكتب وصفك بالعامية المصرية وسنساعدك في الوصول للمطابقة الأقرب.</p>
              <div className="hero-search-input">
                <Search size={20} />
                <input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => event.key === "Enter" && scrollToId("parts")} placeholder="مثال: تيل فرامل توسان 2019" aria-label="البحث عن قطعة غيار" />
                <button onClick={() => scrollToId("parts")} aria-label="تنفيذ البحث"><ArrowUpLeft size={20} /></button>
              </div>
              <div className="search-hints"><span>الأكثر بحثاً</span><button onClick={() => setQuery("58101-D3A00")}>58101-D3A00</button><button onClick={() => setQuery("توسان")}>توسان</button><button onClick={() => setQuery("فلتر زيت")}>فلتر زيت</button></div>
              <div className="confidence-note"><ShieldCheck size={18} /><span>نؤكد المطابقة برقم الشاسيه قبل الشحن</span></div>
            </div>
          </div>
          <div className="container trust-row">
            <div><BadgeCheck size={18} /> أصلي 100% من غبور وموبيس</div>
            <div><ShieldCheck size={18} /> ضمان مطابقة الشاسيه</div>
            <div><PackageCheck size={18} /> مخزون مجمع من 6 مخازن</div>
            <div><Truck size={18} /> شحن سريع لكل المحافظات</div>
          </div>
        </section>

        <section className="section vehicles-section" id="vehicles">
          <div className="container">
            <div className="section-heading">
              <div><span className="section-label">01 / اختار عربيتك</span><h2>قطعك تبدأ من <span>موديلك.</span></h2></div>
              <p>حدد عربيتك وشوف القطع المتاحة لها، مرتبة حسب الجيل ونوع القطعة عشان توصل للي محتاجه في 3 ضغطات.</p>
            </div>
            <div className="vehicle-grid">
              {cars.map((car, index) => (
                <button className={`vehicle-card ${car.accent}`} key={car.model} onClick={() => { setActiveModel(car.model); scrollToId("parts"); }}>
                  <img src={car.image} alt={`${car.name} - ${car.generation}`} />
                  <div className="vehicle-overlay" />
                  <div className="vehicle-index">0{index + 1}</div>
                  <div className="vehicle-info"><span>{car.brand} · {car.generation}</span><strong>{car.model}</strong><small>{car.count} <ArrowLeft size={13} /></small></div>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="section matcher-section" id="matcher">
          <div className="container matcher-layout">
            <div className="matcher-intro">
              <span className="section-label">02 / مساعد المصري الذكي</span>
              <h2>مش لازم تبقى عارف<br /><span>اسم القطعة.</span></h2>
              <p>قول لنا اللي عندك، والمساعد يرشح لك رقم الـ OEM والقطعة الأقرب. الخدمة في المعاينة تعمل ببيانات تجريبية، وسيتم ربطها بواجهة الذكاء الاصطناعي عند التنفيذ.</p>
              <div className="matcher-points"><div><CheckCircle2 size={17} /> يفهم وصفك بالعامية المصرية</div><div><CheckCircle2 size={17} /> يبحث برقم القطعة أو الكود المطبوع</div><div><CheckCircle2 size={17} /> يجهز رسالة واتساب بالنتيجة</div></div>
            </div>
            <div className="matcher-widget glass-card">
              <div className="widget-topline"><div className="ai-orb"><Cpu size={21} /></div><div><strong>مساعد المصري الذكي</strong><span>متصل بكتالوج القطع</span></div><span className="live-pill"><i /> مباشر</span></div>
              <div className="matcher-tabs"><button className={matcherMode === "text" ? "active" : ""} onClick={() => setMatcherMode("text")}><FileSearch size={16} /> وصف القطعة</button><button className={matcherMode === "code" ? "active" : ""} onClick={() => setMatcherMode("code")}><Zap size={16} /> رقم OEM</button><button className={matcherMode === "image" ? "active" : ""} onClick={() => setMatcherMode("image")}><ImageUp size={16} /> صورة</button></div>
              {matcherMode === "image" ? <button className="upload-zone" onClick={() => setMatcherMode("text")}><ImageUp size={26} /><strong>ارفع صورة القطعة</strong><span>PNG أو JPG · اضغط للمعاينة فقط</span></button> : <div className="matcher-input"><textarea value={matcherText} onChange={(event) => setMatcherText(event.target.value)} placeholder={matcherMode === "code" ? "مثال: 58101-D3A00" : "مثال: عايز تيل فرامل قدامي لتوسان 2019 تربو"} /><button onClick={runMatcher}><Send size={18} /> حلّل الطلب</button></div>}
              {matcherResult && <div className="matcher-result"><div className="result-check"><CheckCircle2 size={18} /></div><div><span>الترشيح الأقرب</span><strong>{matcherResult.title}</strong><small>OEM: {matcherResult.oem} · {matcherResult.source}</small></div><a href={waLink(`أريد التأكد من قطعة: ${matcherResult.title} - OEM ${matcherResult.oem}`)} target="_blank" rel="noreferrer"><MessageCircle size={16} /></a></div>}
              <div className="widget-disclaimer"><CircleHelp size={14} /> المطابقة النهائية تتم بعد استلام رقم الشاسيه</div>
            </div>
          </div>
        </section>

        <section className="section parts-section" id="parts">
          <div className="container">
            <div className="section-heading parts-heading"><div><span className="section-label">03 / كتالوج القطع</span><h2>القطعة الأصلية، <span>مضمونة.</span></h2></div><a className="text-link" href={waLink("مرحباً، أريد الاستفسار عن قطعة غير موجودة في الكتالوج") } target="_blank" rel="noreferrer">مش لاقي قطعتك؟ اسألنا <ArrowLeft size={16} /></a></div>
            <div className="filter-toolbar"><div className="filter-scroll"><button className={activeModel === "الكل" ? "filter-chip active" : "filter-chip"} onClick={() => setActiveModel("الكل")}>كل السيارات</button>{cars.map((car) => <button className={activeModel === car.model ? "filter-chip active" : "filter-chip"} key={car.model} onClick={() => setActiveModel(car.model)}>{car.model}</button>)}</div><div className="filter-meta"><SlidersHorizontal size={17} /><span>{visibleProducts.length} منتجات تجريبية</span></div></div>
            <div className="category-row"><span>فلترة حسب نوع القطعة:</span>{categories.map((category) => <button key={category} className={activeCategory === category ? "category-chip active" : "category-chip"} onClick={() => setActiveCategory(category)}>{category}</button>)}</div>
            <div className="products-grid">{visibleProducts.map((product) => <article className="product-card" key={product.id}><div className="product-image"><img src={product.image} alt={product.title} /><span className="stock-badge"><i /> متوفر</span><button aria-label="إضافة إلى المفضلة"><ShoppingBag size={17} /></button></div><div className="product-body"><div className="product-source"><span>{product.source}</span><span>{product.model}</span></div><h3>{product.title}</h3><div className="oem-line"><span>OEM</span><strong>{product.oem}</strong></div><div className="product-bottom"><div><strong>{product.price}</strong><small>{product.stock}</small></div><a href={waLink(`مرحباً، أريد طلب ${product.title} - رقم OEM ${product.oem}`)} target="_blank" rel="noreferrer" aria-label="اطلب عبر واتساب"><MessageCircle size={19} /></a></div></div></article>)}</div>
            {visibleProducts.length === 0 && <div className="empty-state"><Search size={22} /><strong>مفيش نتيجة بالمواصفات دي لسه.</strong><span>ابعت لنا رقم الشاسيه أو اسأل فريق المبيعات على واتساب.</span><a className="button button-primary" href={waLink("مرحباً، أبحث عن قطعة غير ظاهرة في الكتالوج") } target="_blank" rel="noreferrer">اسأل على واتساب <MessageCircle size={17} /></a></div>}
          </div>
        </section>

        <section className="section proof-section" id="why-us">
          <div className="container proof-layout"><div><span className="section-label">04 / ليه المصري؟</span><h2>خبرة المخزن،<br /><span>في خدمتك أونلاين.</span></h2><p>من بلوك 11 الحرفيين في السلام، فريقنا بيجمع لك خبرة الست مخازن في تجربة بحث واحدة. لا تخمين في القطع، ولا طلب من غير تأكيد.</p><a className="button button-primary" href={waLink("مرحباً، أريد التواصل مع فريق عبدالرحمن المصري") } target="_blank" rel="noreferrer">كلم خبير قطع الغيار <ArrowLeft size={18} /></a></div><div className="proof-cards"><div className="proof-card"><div className="proof-icon cyan-bg"><ShieldCheck size={22} /></div><strong>أصلي مش بديل</strong><span>توريد من غبور مصر وموبيس الشرق الأوسط وأوروبا.</span></div><div className="proof-card"><div className="proof-icon lime-bg"><CarFront size={22} /></div><strong>مطابقة الشاسيه</strong><span>نراجع الـ VIN قبل تأكيد القطعة والشحن.</span></div><div className="proof-card"><div className="proof-icon violet-bg"><Truck size={22} /></div><strong>من المخزن لبابك</strong><span>شحن سريع لكل المحافظات مع متابعة الطلب.</span></div><div className="proof-card"><div className="proof-icon orange-bg"><MessageCircle size={22} /></div><strong>رد سريع</strong><span>فريق مبيعات فاهم عربيتك، مش مجرد كتالوج.</span></div></div></div>
        </section>

        <section className="location-banner"><div className="container location-inner"><div className="location-pin"><MapPin size={22} /></div><div><span>زورنا أو ابعت لنا على واتساب</span><strong>بلوك 11 الحرفيين — السلام، القاهرة</strong></div><a href={waLink("مرحباً، أريد معرفة موقع المخزن ومواعيد العمل") } target="_blank" rel="noreferrer">احصل على الاتجاهات <ArrowLeft size={16} /></a></div></section>
      </main>

      <footer className="site-footer"><div className="container footer-grid"><div className="footer-brand"><a className="brand-lockup" href="#top"><span className="brand-mark"><Wrench size={21} /></span><span><strong>عبدالرحمن المصري</strong><small>KOREAN OEM PARTS</small></span></a><p>قطع غيار هيونداي وكيا الأصلية من الحرفيين إلى كل محافظات مصر.</p><div className="social-links"><a href="https://www.facebook.com/AbdelrahmanElMasryParts" target="_blank" rel="noreferrer" aria-label="فيسبوك"><Facebook size={17} /></a><a href={waLink("مرحباً") } target="_blank" rel="noreferrer" aria-label="واتساب"><MessageCircle size={17} /></a><a href={`tel:${PHONE}`} aria-label="هاتف"><Phone size={17} /></a></div></div><div className="footer-col"><strong>تصفح</strong><a href="#vehicles">اختار عربيتك</a><a href="#parts">كتالوج القطع</a><a href="#matcher">المساعد الذكي</a></div><div className="footer-col"><strong>خدمة العملاء</strong><a href={waLink("مرحباً، أريد تتبع طلبي") } target="_blank" rel="noreferrer">تتبع طلبك</a><a href={waLink("مرحباً، أريد معرفة مواعيد العمل") } target="_blank" rel="noreferrer">مواعيد العمل</a><a href={waLink("مرحباً، أريد الاستفسار عن سياسة الاستبدال") } target="_blank" rel="noreferrer">الاستبدال والاسترجاع</a></div><div className="footer-col"><strong>تواصل معنا</strong><a href={`tel:${PHONE}`}><Phone size={15} /> {PHONE}</a><a href={waLink("مرحباً") } target="_blank" rel="noreferrer"><MessageCircle size={15} /> واتساب مباشر</a><span><MapPin size={15} /> الحرفيين، السلام، القاهرة</span></div></div><div className="container footer-bottom"><span>© 2026 عبدالرحمن المصري. جميع الحقوق محفوظة.</span><span>واجهة تجريبية قبل الربط بمتجر Shopify الفعلي</span></div></footer>
      <a className="floating-wa" href={waLink("مرحباً، أريد مساعدة في اختيار قطعة غيار") } target="_blank" rel="noreferrer" aria-label="تواصل عبر واتساب"><MessageCircle size={23} /><span>اسأل خبير</span></a>
    </div>
  );
}
