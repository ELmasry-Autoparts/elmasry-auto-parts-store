# متجر عبدالرحمن المصري — حزمة Shopify التجريبية

هذه الحزمة تجمع واجهة متجر عربية RTL تجريبية، وقالبًا مرجعيًا لـ Shopify، ووثائق تسليم للمطور.

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

## حدود النسخة الحالية

المعاينة لا تقرأ متجر Shopify الفعلي ولا تنفذ Shopify Admin API أو Supabase أو ERP. نتائج المنتجات والمخزون تجريبية. يجب إدخال بيانات الكتالوج الحقيقية وإنشاء Metafield definitions قبل التشغيل التجاري. كما يجب عدم نشر عبارات الاعتماد أو الأصالة إلا بعد مراجعة مستندات المورد.
