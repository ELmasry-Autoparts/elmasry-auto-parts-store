import { useMemo, useState, type FormEvent } from "react";
import { Link } from "wouter";
import { ClipboardCheck, Download, ExternalLink, FileJson, KeyRound, LockKeyhole, RefreshCw, Search, ShieldCheck, TimerReset } from "lucide-react";
import { trpc } from "@/lib/trpc";

type QueryType = "OEM" | "VIN" | "VEHICLE" | "OEM_VEHICLE" | "BATCH_OEM";
const queryTypes: Array<{ value: QueryType; label: string; hint: string; placeholder: string }> = [
  { value: "OEM", label: "بحث OEM", hint: "رقم قطعة واحد", placeholder: "86511-N7000" },
  { value: "VIN", label: "بحث VIN", hint: "مطابقة سيارة محددة", placeholder: "U5YPV81B5RL152160" },
  { value: "VEHICLE", label: "بحث سيارة", hint: "موديل / جيل / سنة", placeholder: "Kia Sportage NQ5 2024 1.6T" },
  { value: "OEM_VEHICLE", label: "OEM + سيارة", hint: "تحقق مزدوج", placeholder: "86511-N7000 — Sportage NQ5" },
  { value: "BATCH_OEM", label: "دفعة OEM", hint: "قائمة نصية", placeholder: "ضع كل رقم في سطر مستقل" },
];
const WPC_URL = import.meta.env.VITE_WPC_URL as string | undefined;

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function AdminWpcPage() {
  const [queryType, setQueryType] = useState<QueryType>("OEM");
  const [originalQuery, setOriginalQuery] = useState("");
  const [vin, setVin] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [notes, setNotes] = useState("");
  const [previewRecords, setPreviewRecords] = useState<Array<{ researchId: string; queryType: QueryType; originalQuery: string; status: string; confidence: string; source: string; retrievedAt: string; vinRedacted: string | null }>>([]);
  const previewAdmin = import.meta.env.DEV && new URLSearchParams(window.location.search).get("preview") === "admin";
  const me = trpc.auth.me.useQuery();
  const history = trpc.admin.wpc.list.useQuery({ limit: 40 }, { enabled: me.data?.role === "admin" && !previewAdmin });
  const createResearch = trpc.admin.wpc.createResearch.useMutation({ onSuccess: () => { history.refetch(); setOriginalQuery(""); setVin(""); setVehicle(""); setNotes(""); } });
  const selected = useMemo(() => queryTypes.find((item) => item.value === queryType)!, [queryType]);
  const isAdmin = previewAdmin || me.data?.role === "admin";
  const isLoading = me.isLoading;

  function submitResearch(event: FormEvent) {
    event.preventDefault();
    if (!originalQuery.trim()) return;
    if (previewAdmin) {
      setPreviewRecords((current) => [{ researchId: `WPC-PREVIEW-${String(current.length + 1).padStart(4, "0")}`, queryType, originalQuery: originalQuery.trim(), status: "needs_manual_wpc", confidence: "UNVERIFIED", source: "Hyundai Mobis WPC", retrievedAt: new Date().toISOString(), vinRedacted: vin ? `${vin.trim().slice(0, Math.max(0, vin.trim().length - 6))}••••••` : null }, ...current]);
      setOriginalQuery(""); setVin(""); setVehicle(""); setNotes("");
      return;
    }
    createResearch.mutate({
      queryType,
      originalQuery: queryType === "OEM_VEHICLE" && vehicle ? `${originalQuery.trim()} — ${vehicle.trim()}` : originalQuery.trim(),
      vin: vin.trim() || undefined,
      vehicle: vehicle.trim() ? { model: vehicle.trim(), market: "Egypt" } : undefined,
      notes: notes.trim() || undefined,
    });
  }

  if (isLoading) return <div className="admin-loading">جاري التحقق من صلاحيات الإدارة…</div>;
  if (!isAdmin) return <div className="admin-gate"><LockKeyhole size={34} /><h1>لوحة الإدارة محمية</h1><p>يجب تسجيل الدخول بحساب مسؤول للوصول إلى أبحاث Hyundai Mobis WPC.</p><Link className="button button-primary" href="/login">تسجيل الدخول</Link><Link className="admin-back" href="/">العودة للمتجر</Link></div>;

  return <div className="admin-shell" dir="rtl">
    <header className="admin-topbar"><div><span className="admin-kicker">ELMASRY AUTOLINK / INTERNAL TOOLS</span><h1>لوحة أبحاث WPC</h1></div><div className="admin-top-actions"><span className="admin-user"><ShieldCheck size={15} /> {previewAdmin ? "وضع معاينة مسؤول" : "جلسة مسؤول"}</span><Link href="/">العودة للمتجر</Link></div></header>
    <main className="admin-main">
      <section className="admin-status-grid">
        <div className="admin-status-card status-manual"><div className="status-icon"><KeyRound size={19} /></div><div><span>جلسة WPC</span><strong>تسجيل يدوي مطلوب</strong><small>لا يتم حفظ كلمات المرور أو التوكنات</small></div><button type="button" disabled={!WPC_URL} onClick={() => WPC_URL && window.open(WPC_URL, "_blank", "noopener,noreferrer")}><ExternalLink size={15} /> {WPC_URL ? "فتح WPC" : "أضف رابط WPC"}</button></div>
        <div className="admin-status-card"><div className="status-icon cyan"><ClipboardCheck size={19} /></div><div><span>سجل الأبحاث</span><strong>{previewAdmin ? previewRecords.length : history.data?.length ?? 0} سجل</strong><small>نتائج قابلة للتتبع والمراجعة</small></div></div>
        <div className="admin-status-card"><div className="status-icon amber"><TimerReset size={19} /></div><div><span>سياسة الطلبات</span><strong>محافظ / يدوي</strong><small>لا يوجد crawling تلقائي</small></div></div>
      </section>

      <div className="admin-grid">
        <section className="admin-panel research-panel"><div className="panel-heading"><div><span className="admin-kicker">01 / RESEARCH REQUEST</span><h2>ابدأ بحثًا جديدًا</h2></div><Search size={22} /></div><div className="query-tabs">{queryTypes.map((item) => <button type="button" key={item.value} className={queryType === item.value ? "active" : ""} onClick={() => setQueryType(item.value)}><strong>{item.label}</strong><small>{item.hint}</small></button>)}</div><form onSubmit={submitResearch} className="research-form"><label>طلب البحث<textarea value={originalQuery} onChange={(event) => setOriginalQuery(event.target.value)} placeholder={selected.placeholder} rows={queryType === "BATCH_OEM" ? 5 : 3} required /></label>{queryType !== "OEM" && <label>VIN اختياري للمطابقة<input value={vin} onChange={(event) => setVin(event.target.value)} placeholder="لن يظهر VIN كاملًا في السجل العام" dir="ltr" /></label>}{(queryType === "VEHICLE" || queryType === "OEM_VEHICLE") && <label>سياق السيارة<input value={vehicle} onChange={(event) => setVehicle(event.target.value)} placeholder="Hyundai Tucson NX4 2022" /></label>}<label>ملاحظات داخلية<input value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="مثال: ركّز على السوق المصري" /></label><div className="research-actions"><button className="button button-primary" disabled={createResearch.isPending}><Search size={17} />{createResearch.isPending ? "جاري إنشاء السجل…" : "إنشاء سجل البحث"}</button><span><ShieldCheck size={15} /> النتيجة الأولية غير مؤكدة حتى مراجعة WPC يدويًا</span></div>{createResearch.error && <p className="form-error">تعذر إنشاء السجل: {createResearch.error.message}</p>}{createResearch.data && <p className="form-success">تم إنشاء السجل {createResearch.data.researchId}. افتح جلسة WPC يدويًا وأكمل التحقق.</p>}</form></section>

        <aside className="admin-panel protocol-panel"><div className="panel-heading"><div><span className="admin-kicker">02 / SAFE PROTOCOL</span><h2>بروتوكول الجلسة</h2></div><LockKeyhole size={22} /></div><ol><li><strong>افتح WPC</strong><span>اضغط فتح WPC وسجّل الدخول بنفسك.</span></li><li><strong>تحقق من الجلسة</strong><span>تأكد أن حسابك مصرح قبل بدء البحث.</span></li><li><strong>استخدم النتيجة الظاهرة</strong><span>لا يتم تجاوز CAPTCHA أو الحماية أو المعدلات.</span></li><li><strong>وثّق الدليل</strong><span>أضف الرابط واللقطة والمرجع عند توفرها.</span></li></ol><div className="protocol-warning"><LockKeyhole size={16} /><span>لا تحفظ كلمة المرور أو الكوكيز أو التوكنات هنا.</span></div></aside>
      </div>

      <section className="admin-panel history-panel"><div className="panel-heading"><div><span className="admin-kicker">03 / TRACEABLE HISTORY</span><h2>آخر الأبحاث</h2></div><div className="history-tools"><button type="button" onClick={() => !previewAdmin && history.refetch()}><RefreshCw size={15} /> تحديث</button><button type="button" onClick={() => downloadJson("elmasry-wpc-research.json", previewAdmin ? previewRecords : history.data ?? [])}><FileJson size={15} /> JSON</button><Download size={18} /></div></div>{!previewAdmin && history.isLoading ? <p className="empty-state">جاري تحميل السجل…</p> : (previewAdmin ? previewRecords : history.data)?.length ? <div className="research-table-wrap"><table className="research-table"><thead><tr><th>المعرف</th><th>النوع</th><th>الطلب</th><th>الحالة</th><th>الثقة</th><th>المصدر</th><th>التاريخ</th></tr></thead><tbody>{(previewAdmin ? previewRecords : history.data ?? []).map((record) => <tr key={record.researchId}><td dir="ltr"><code>{record.researchId}</code></td><td><span className="type-pill">{record.queryType}</span></td><td className="query-cell">{record.originalQuery}<small>{record.vinRedacted ? `VIN: ${record.vinRedacted}` : "بدون VIN"}</small></td><td><span className="status-pill">{record.status === "needs_manual_wpc" ? "مراجعة يدوية" : record.status}</span></td><td>{record.confidence}</td><td>{record.source}</td><td dir="ltr">{new Date(record.retrievedAt).toLocaleString("ar-EG")}</td></tr>)}</tbody></table></div> : <div className="empty-state"><ClipboardCheck size={28} /><strong>لا توجد أبحاث بعد</strong><span>ابدأ بطلب OEM أو VIN ليظهر هنا سجل قابل للتتبع.</span></div>}</section>
    </main>
  </div>;
}
