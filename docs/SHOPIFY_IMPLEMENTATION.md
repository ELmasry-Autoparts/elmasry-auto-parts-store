# خطة تنفيذ Shopify وقالب الواجهة

## القرار المعماري

يُنفّذ المتجر على Shopify Online Store 2.0 باستخدام Theme مخصص خفيف، مع فصل الوظائف إلى ثلاث طبقات. الطبقة الأولى هي Liquid وCSS لعرض المحتوى الأساسي والقابل للفهرسة. الطبقة الثانية هي Search & Discovery لفلترة المنتجات عبر خيارات وMetafields منظمة. الطبقة الثالثة هي تطبيق مخصص صغير وBackend آمن للمساعد الذكي، والمخزون، ورسائل الطلبات، وتكامل ERP.

هذا الفصل مهم لأن Shopify Theme لا يجب أن يحمل مفاتيح OpenAI أو Supabase أو ERP. أي طلب يحتاج سرًا أو تحقق توقيع أو كتابة في نظام خارجي يذهب إلى Backend.

## خريطة المكونات

| المكون | التنفيذ المقترح | الإصدار |
| --- | --- | --- |
| الهيدر والفوتر | Sections وsnippets في Theme | أولي |
| Hero والبحث | `main-elmasry-home.liquid` + Search & Discovery | أولي |
| محدد السيارة | Collection links أو query parameters | أولي |
| فلاتر OEM وVIN | Product filters وMetafields | أولي |
| زر واتساب | Liquid يبني رابط `wa.me` من بيانات المنتج | أولي |
| مساعد النص والكود | App block يستدعي Backend | مرحلة ثانية |
| بحث الصورة | رفع مباشر مؤقت أو signed upload إلى Backend | مرحلة ثانية |
| مخزون ستة مخازن | موقع Shopify تجميعي في البداية | أولي |
| ERP لحظي | Webhooks + GraphQL Admin API | مرحلة ثالثة |

## قواعد الكتالوج

يجب إنشاء Product metafield definitions قبل الاستيراد. يستحسن استخدام قيم canonical باللغة الإنجليزية أو رموز ثابتة للفلترة، ثم عرض التسميات العربية في القالب. مثال: قيمة `hyundai` تعرض «هيونداي»، وقيمة `front` تعرض «أمامي». يجب أن يكون `custom.oem_number` موحدًا بإزالة المسافات والشرطات الزائدة مع الاحتفاظ بصيغة العرض.

صيغة العنوان المقترحة هي:

`[الماركة] [الموديل] — [اسم القطعة بالعربي] ([المصدر]) — [رقم OEM]`

ويُحفظ `erp_sku` منفصلًا عن `oem_number` لأن الرقم التجاري الداخلي قد يختلف عن الرقم المطبوع على القطعة.

## بنية القالب

الملفات المرجعية داخل `shopify-theme/` هي نقطة بداية وليست Theme كاملًا. يتم نقلها إلى Theme 2.0 ثم ربطها بملفات Shopify القياسية:

```text
shopify-theme/
  sections/main-elmasry-home.liquid
  snippets/oem-search.liquid
  assets/elmasry-custom.css
  assets/elmasry-custom.js
```

يجب تحميل CSS وJavaScript عبر `{{ 'elmasry-custom.css' | asset_url | stylesheet_tag }}` و`{{ 'elmasry-custom.js' | asset_url | script_tag }}`. في الإنتاج يتم استخدام `defer` وتحميل السكربت في نهاية المستند أو عبر app embed عند الحاجة.

## البحث والفلترة

يجب أولًا تشغيل Shopify Search & Discovery وإضافة تعريفات الفلاتر التالية: Vehicle brand، Vehicle model، Generation، Model years، Engine، Part group، Supplier، Position، وOEM number. يتم اختبار نتائج البحث عبر أرقام حقيقية من ملف الكتالوج، مع التأكد من أن البحث لا يعرض قطعة لموديل غير متوافق.

إذا احتاج المتجر إلى بحث مركب يتجاوز قدرات Search & Discovery، يمكن إضافة endpoint بحث مخصص أو محرك فهرسة خارجي. لا يوصى ببناء فهرس موازٍ قبل استقرار تعريفات المنتجات، لأن ازدواجية البيانات ستنتج نتائج غير موثوقة.

## واتساب

كل بطاقة منتج تبني رسالة تحتوي اسم المنتج ورقم OEM والموديل وعبارة طلب تأكيد VIN. يجب ألا يحتوي الرابط على بيانات حساسة غير ضرورية. مثال الرسالة:

```text
مرحباً، أريد التأكد من قطعة:
المنتج: {{ product.title }}
OEM: {{ product.metafields.custom.oem_number.value }}
سأرسل رقم الشاسيه للتأكيد قبل الشحن.
```

## مساعد الذكاء الاصطناعي

في النسخة الإنتاجية، يستخدم الـ app block واجهة JSON ثابتة:

```json
{
  "query": "عايز تيل فرامل قدامي لتوسان 2019 تربو",
  "mode": "text",
  "locale": "ar-EG"
}
```

يعيد Backend:

```json
{
  "matches": [
    {
      "productHandle": "hyundai-tucson-front-brake-pad",
      "oem": "58101-D3A00",
      "confidence": 0.91,
      "requiresVinConfirmation": true
    }
  ],
  "needsHumanReview": false
}
```

لا يتم إرجاع نتيجة بدرجة ثقة منخفضة على أنها مطابقة نهائية. عند فشل الخدمة، يعرض الـ widget رسالة قصيرة ويحوّل العميل إلى واتساب.

## اختبارات التسليم

يجب اختبار: اتجاه RTL على Chrome وSafari، الهاتف بعرض 375px، إدخال رقم OEM كامل وجزئي، اختيار سيارة، تطبيق فلترين معًا، نتيجة صفر، رابط واتساب، منتج غير متوفر، نص بديل للصور، وتعطيل JavaScript. عند تعطيل JavaScript يجب أن تظل عناوين الأقسام وروابط المنتجات والبحث الأساسي قابلة للوصول قدر الإمكان.

## تشغيل القالب

1. إنشاء نسخة Theme تطويرية وعدم العمل مباشرة على Live Theme.
2. رفع ملفات القالب المرجعية ثم ربطها بملفات layout وsection المناسبة.
3. إنشاء Metafield definitions واستيراد بيانات اختبار صغيرة.
4. تفعيل Search & Discovery وإضافة الفلاتر.
5. اختبار صفحات الموديلات والمنتجات على الهاتف.
6. إضافة app block للمساعد بعد إنشاء Backend وسر آمن.
7. اعتماد سياسة المخزون قبل تشغيل أي mutation.
8. أخذ نسخة Theme ثم إطلاق المرحلة الأولى.

## References

[1]: https://shopify.dev/docs/themes "Shopify themes documentation"
[2]: https://shopify.dev/docs/storefronts/themes/architecture "Shopify theme architecture"
[3]: https://shopify.dev/docs/apps/build/online-store/theme-app-extensions "Shopify theme app extensions documentation"
[4]: https://help.shopify.com/en/manual/online-store/search-and-discovery "Shopify Search & Discovery documentation"
[5]: https://shopify.dev/docs/api/liquid/objects/metafield "Shopify Liquid metafield object"
