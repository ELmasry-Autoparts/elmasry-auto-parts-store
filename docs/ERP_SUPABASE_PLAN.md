# خطة تكامل Shopify مع ERP وSupabase

## الهدف

توحيد بيانات المنتجات والأسعار والمخزون بين Shopify ونظام ERP الداخلي المبني على React وNode.js وSupabase، مع إبقاء Shopify هو واجهة البيع وموقع «الحرفيين – المركز الرئيسي» كمخزون تجميعي مؤقت في المرحلة الأولى.

## خياران قابلان للتنفيذ

| النهج | المزايا والقيود | التكلفة التشغيلية | تعقيد الإعداد |
| --- | --- | --- | --- |
| مزامنة CSV أسبوعية | سريع ورخيص ومناسب لبدء الكتالوج. لا يعطي مخزونًا لحظيًا وقد يتأخر في إيقاف البيع. | منخفض | منخفض |
| خدمة مزامنة Node.js مع Webhooks وGraphQL | مخزون وأسعار أقرب للوقت الحقيقي مع سجل أخطاء وإعادة محاولة. تحتاج استضافة أسرار ومراقبة واختبارات أقوى. | متوسط | مرتفع |

يبدأ المشروع بخيار CSV مع سجل استيراد ومراجعة بشرية. يتم الانتقال إلى الخيار اللحظي بعد اعتماد SKU المشترك وتثبيت قواعد مصدر الحقيقة.

## مصدر الحقيقة

في المرحلة الأولى تكون بيانات المنتج الأساسية والسعر في ملف ERP المعتمد، بينما تكون حالة العرض والطلب في Shopify. المخزون المنشور هو مجموع المخازن الستة في موقع Shopify واحد. عند الانتقال للمرحلة الثالثة يصبح ERP مصدر الحقيقة للكميات، ويكتب Shopify الكميات المقفولة فقط بعد التحقق من عدم وجود بيع متزامن.

لا يجوز تعديل المخزون يدويًا في أكثر من نظام بعد تشغيل المزامنة اللحظية. أي تعديل طارئ يمر عبر سجل تدقيق ويحتوي المستخدم والسبب والوقت.

## نموذج الجداول في Supabase

### `erp_products`

يحتوي `id`, `erp_sku`, `oem_number`, `title_ar`, `brand`, `model`, `generation`, `part_group`, `supplier`, `price`, `active`, `updated_at`.

### `erp_stock_balances`

يحتوي `id`, `erp_sku`, `warehouse_code`, `available_qty`, `reserved_qty`, `counted_at`, `updated_at`. لكل مخزن من المخازن الستة سجل مستقل.

### `shopify_mappings`

يحتوي `erp_sku`, `shopify_product_gid`, `shopify_variant_gid`, `shopify_inventory_item_gid`, `shopify_location_gid`, `last_synced_qty`, `last_synced_at`, `sync_status`, و`last_error`.

### `sync_events`

يحتوي `id`, `event_type`, `direction`, `payload_hash`, `payload_redacted`, `status`, `attempt_count`, `created_at`, و`processed_at`. لا يخزن هذا الجدول VIN أو بيانات عميل كاملة.

## تدفق CSV

1. يصدّر ERP ملفًا يحتوي SKU، OEM، السعر، والكمية المتاحة لكل مخزن.
2. يرفعه مسؤول مخول إلى لوحة داخلية أو مساحة تخزين خاصة.
3. تتحقق الخدمة من الأعمدة وأنواع البيانات والقيم السالبة والتكرار.
4. تجمع الكميات حسب `erp_sku` وتطبق قاعدة الحجز.
5. تنشئ تقرير فروق قبل الكتابة.
6. يوافق المسؤول على التقرير عند الحاجة.
7. ترسل الخدمة تحديثات Shopify على دفعات صغيرة.
8. تسجل كل نتيجة مع وقت التنفيذ والخطأ وإمكانية إعادة المحاولة.

## التدفق اللحظي المقترح

عند إنشاء طلب Shopify، يستقبل Backend webhook موثق التوقيع، ثم يسجل الحدث بشكل idempotent. بعد ذلك يحجز ERP الكمية أو يرفضها. إذا تغيرت الكمية، يرسل ERP تحديثًا إلى Shopify عبر GraphQL Admin API. يجب استخدام compare-and-set عند تحديث الكميات حتى لا يكتب تحديث قديم فوق تحديث أحدث.

تستخدم الخدمة صفًا بسيطًا للأحداث. كل رسالة لها `event_id` و`payload_hash`. إذا تكرر الحدث، لا يعاد تطبيقه. عند فشل Shopify أو ERP، تستخدم إعادة محاولة متدرجة مع حد أقصى، ثم تنقل الحدث إلى dead-letter queue أو تقرير أخطاء للمراجعة.

## الأمان

يحفظ Admin API token في Secrets أو متغيرات بيئة خادم فقط. لا يوضع داخل Liquid أو Browser JavaScript. تستخدم Supabase Row Level Security للوحة الداخلية، ويُسمح لمسار المزامنة فقط بالكتابة في جداول الخرائط والأحداث. يجب التحقق من توقيع Shopify webhooks قبل قراءة payload. سجلات الأخطاء تحجب التوكنات وبيانات العميل وVIN.

## المراقبة والمصالحة

يجب عرض مؤشرات: آخر مزامنة ناجحة، عدد المنتجات غير المطابقة، فروق الكميات، أخطاء GraphQL، ومتوسط عمر الحدث. تُجرى مصالحة يومية بين Shopify وERP، ومصالحة أعمق أسبوعيًا لكل SKU. أي فرق يتجاوز حدًا يحدد مسبقًا يوقف المزامنة لهذا SKU فقط ويطلب مراجعة بدل نشر رقم مشكوك فيه.

## خريطة التنفيذ

**الأسبوع الأول:** تثبيت قاموس SKU وحقول Metafields وإعداد موقع المخزون التجميعي.

**الأسبوع الثاني:** استيراد عينة 50–100 منتج، اختبار الأسعار والكميات، وبناء تقرير الفروق.

**الأسبوع الثالث:** تشغيل CSV أسبوعي مع سجل عمليات وموافقة يدوية.

**الأسبوع الرابع:** بناء endpoint للـ webhooks، والتحقق من التوقيع، وجدول idempotency، وتجربة staging.

**المرحلة التالية:** تشغيل مزامنة كمية محدودة لمنتجات مختارة، ثم التوسع بعد أسبوعين من المصالحة الناجحة.

## حدود مسؤولية الواجهة

الواجهة التجريبية لا تقرأ Supabase ولا تنفذ Shopify Admin API. هذه الحدود مقصودة حتى لا يتم تسريب الأسرار أو خلط بيانات العرض ببيانات ERP. عند إضافة Backend، يبقى الـ storefront مسؤولًا عن تجربة البحث والعرض، بينما يتولى الخادم المطابقة، التخزين، التحقق، والمزامنة.

## References

[1]: https://shopify.dev/docs/api/admin-graphql/latest "Shopify GraphQL Admin API reference"
[2]: https://shopify.dev/docs/api/admin-graphql/latest/mutations/inventorySetQuantities "Shopify inventorySetQuantities mutation"
[3]: https://shopify.dev/docs/apps/build/webhooks "Shopify webhooks documentation"
[4]: https://supabase.com/docs/guides/database/postgres/row-level-security "Supabase Row Level Security documentation"
[5]: https://supabase.com/docs/guides/functions "Supabase Edge Functions documentation"
