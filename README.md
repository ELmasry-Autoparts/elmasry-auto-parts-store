# متجر عبدالرحمن المصري — حزمة Shopify والبيانات الدائمة

هذه الحزمة تجمع واجهة متجر عربية RTL، وقالبًا مرجعيًا لـ Shopify، وBackend tRPC مع قاعدة بيانات MySQL/TiDB دائمة.

## تشغيل المعاينة

```bash
pnpm dev
```

الواجهة الرئيسية موجودة في `client/src/pages/Home.tsx`. الصور التجريبية مرفوعة إلى WebDev Storage ويشار إليها من خلال مسارات `/manus-storage/...`.

## محتويات التسليم

- `docs/PRD.md`: وثيقة متطلبات المنتج ومعايير القبول.
- `docs/SHOPIFY_IMPLEMENTATION.md`: خريطة تحويل المعاينة إلى Shopify Online Store 2.0.
- `docs/ERP_SUPABASE_PLAN.md`: خطة CSV والمزامنة اللحظية والـ Supabase.
- `docs/SEO_CONTENT_AR.md`: عناوين SEO ووصف الصفحات والأسئلة الشائعة وLocalBusiness JSON-LD.
- `shopify-theme/sections/main-elmasry-home.liquid`: Section مرجعي قابل للنقل إلى Theme تطويري.
- `shopify-theme/snippets/oem-search.liquid`: نموذج بحث برقم OEM أو الوصف.
- `shopify-theme/assets/elmasry-custom.css`: أسلوب RTL الداكن والزجاجي.
- `shopify-theme/assets/elmasry-custom.js`: تفاعلات البحث والمساعد وأحداث التحليلات.
- `drizzle/schema.ts`: جداول المستخدمين والمنتجات والمخزون وطلبات العملاء.
- `server/db.ts`: استعلامات الكتالوج وحفظ طلبات المساعد.
- `server/routers.ts`: إجراءات tRPC العامة للكتالوج وحفظ leads وإجراءات الإدارة.
- `drizzle/0000_bizarre_lake.sql`: migration المطبق على قاعدة البيانات.

## البيانات الدائمة

تم إنشاء الجداول التالية وتطبيقها على قاعدة البيانات المتصلة بالمشروع:

- `users` للمصادقة وملفات المستخدمين.
- `products` لكتالوج قطع الغيار وحقول OEM والتوافق والسعر.
- `inventory` للكميات والموقع التجميعي «الحرفيين - المركز الرئيسي».
- `leads` لحفظ طلبات المساعد الذكي وطلبات المطابقة وبيانات التواصل الاختيارية.

واجهة المتجر تستعلم من `catalog.list`، وتستخدم بيانات المعاينة كـ fallback إلى أن يتم استيراد أول كتالوج حقيقي. تشغيل `leads.create` يحفظ طلبات المساعد في قاعدة البيانات دون كشف أسرار الخادم للمتصفح.

## حدود النسخة الحالية

المعاينة لا تقرأ متجر Shopify الفعلي ولا تنفذ Shopify Admin API أو Supabase أو ERP. يجب إدخال بيانات الكتالوج الحقيقية وإنشاء Metafield definitions قبل التشغيل التجاري. كما يجب عدم نشر عبارات الاعتماد أو الأصالة إلا بعد مراجعة مستندات المورد.
