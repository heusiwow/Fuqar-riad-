import { jsPDF } from 'jspdf';
import { CoachProfileCode, GymSubscriptionRecord, Language } from '../types/ironlog';

export interface GymAccountsPdfSummary {
  totalMembers: number;
  activeCount: number;
  expiringSoonCount: number;
  expiredCount: number;
  totalRevenue: number;
  totalRemaining: number;
  currency: string;
}

function getEffectiveSubState(
  sub: GymSubscriptionRecord,
  todayStr: string,
  soonCutoffStr: string
): 'active' | 'expiring' | 'expired' | 'cancelled' {
  if (sub.status === 'cancelled') return 'cancelled';
  if (sub.endDate < todayStr || sub.status === 'expired') return 'expired';
  if (sub.endDate <= soonCutoffStr) return 'expiring';
  return 'active';
}

function formatMoney(val: number, currency: string): string {
  const rounded = Math.round(val * 100) / 100;
  return `${rounded.toLocaleString('en-US')} ${currency}`;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function truncateCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string {
  const clean = (text || '').trim();
  if (!clean) return '—';
  if (ctx.measureText(clean).width <= maxWidth) return clean;
  let out = clean;
  while (out.length > 1 && ctx.measureText(`${out}…`).width > maxWidth) {
    out = out.slice(0, -1);
  }
  return `${out}…`;
}

export async function exportGymAccountsPdf(params: {
  language: Language;
  coachName: string;
  gymName: string;
  coachCode?: string;
  filterLabel: string;
  summary: GymAccountsPdfSummary;
  records: GymSubscriptionRecord[];
}): Promise<void> {
  if (typeof document === 'undefined') return;
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  const isAr = params.language === 'ar';
  const fontFamily = isAr
    ? '"IBM Plex Sans Arabic", "Cairo", "Segoe UI", Tahoma, Arial, sans-serif'
    : '"Inter", "Segoe UI", Arial, sans-serif';

  // High-DPI A4 page canvas (1240 × 1754 px ≈ 150 DPI)
  const W = 1240;
  const H = 1754;
  const PAD = 64;
  const CONTENT_W = W - PAD * 2;

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const soonCutoffStr = new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const ROW_H = 66;
  const HEADER_BLOCK_H = 340;
  const FOOTER_H = 60;
  const TABLE_HEADER_H = 54;

  const firstPageMaxRows = Math.floor((H - PAD * 2 - HEADER_BLOCK_H - TABLE_HEADER_H - FOOTER_H) / ROW_H);
  const nextPageMaxRows = Math.floor((H - PAD * 2 - 120 - TABLE_HEADER_H - FOOTER_H) / ROW_H);

  const chunks: GymSubscriptionRecord[][] = [];
  if (params.records.length === 0) {
    chunks.push([]);
  } else {
    chunks.push(params.records.slice(0, firstPageMaxRows));
    let idx = firstPageMaxRows;
    while (idx < params.records.length) {
      chunks.push(params.records.slice(idx, idx + nextPageMaxRows));
      idx += nextPageMaxRows;
    }
  }

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const totalPages = chunks.length;

  chunks.forEach((rows, pageIndex) => {
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // White sheet background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, W, H);

    ctx.direction = isAr ? 'rtl' : 'ltr';
    ctx.textBaseline = 'middle';

    let y = PAD;

    if (pageIndex === 0) {
      // Top Header Banner
      ctx.fillStyle = '#0F172A';
      drawRoundedRect(ctx, PAD, y, CONTENT_W, 134, 20);
      ctx.fill();

      const primaryAnchorX = isAr ? W - PAD - 28 : PAD + 28;
      const secondaryAnchorX = isAr ? PAD + 28 : W - PAD - 28;

      ctx.textAlign = isAr ? 'right' : 'left';
      ctx.fillStyle = '#10B981';
      ctx.font = `700 18px ${fontFamily}`;
      ctx.fillText(
        isAr ? 'APEX · سجل حسابات واشتراكات القاعة الرياضية' : 'APEX · GYM ACCOUNTS & SUBSCRIPTIONS LEDGER',
        primaryAnchorX,
        y + 34
      );

      ctx.fillStyle = '#FFFFFF';
      ctx.font = `700 30px ${fontFamily}`;
      ctx.fillText(
        truncateCanvasText(ctx, params.gymName || (isAr ? 'القاعة الرياضية' : 'Gym Hall'), CONTENT_W * 0.62),
        primaryAnchorX,
        y + 74
      );

      ctx.fillStyle = '#CBD5E1';
      ctx.font = `500 18px ${fontFamily}`;
      ctx.fillText(
        isAr
          ? `الكابتن: ${params.coachName}${params.coachCode ? `  |  رمز القاعة: ${params.coachCode}` : ''}`
          : `Coach: ${params.coachName}${params.coachCode ? `  |  Code: ${params.coachCode}` : ''}`,
        primaryAnchorX,
        y + 108
      );

      ctx.textAlign = isAr ? 'left' : 'right';
      ctx.fillStyle = '#E2E8F0';
      ctx.font = `600 18px ${fontFamily}`;
      ctx.fillText(
        isAr ? `التاريخ: ${todayStr}` : `Date: ${todayStr}`,
        secondaryAnchorX,
        y + 48
      );
      ctx.fillStyle = '#94A3B8';
      ctx.font = `500 16px ${fontFamily}`;
      ctx.fillText(params.filterLabel, secondaryAnchorX, y + 84);

      y += 156;

      // 4 KPI Cards
      const gap = 16;
      const cardW = (CONTENT_W - gap * 3) / 4;
      const kpis = [
        {
          label: isAr ? 'إجمالي المشتركين' : 'Total Members',
          value: String(params.summary.totalMembers),
          sub: isAr
            ? `ساري: ${params.summary.activeCount} | منتهي: ${params.summary.expiredCount}`
            : `Active: ${params.summary.activeCount} | Expired: ${params.summary.expiredCount}`,
          accent: '#0F172A',
        },
        {
          label: isAr ? 'إجمالي الإيرادات المستلمة' : 'Collected Revenue',
          value: formatMoney(params.summary.totalRevenue, params.summary.currency),
          sub: isAr ? 'المبالغ المقبوضة' : 'Total paid',
          accent: '#059669',
        },
        {
          label: isAr ? 'تنتهي قريباً / منتهية' : 'Expiring / Expired',
          value: String(params.summary.expiringSoonCount + params.summary.expiredCount),
          sub: isAr
            ? `قريب الانتهاء: ${params.summary.expiringSoonCount}`
            : `Expiring <=5d: ${params.summary.expiringSoonCount}`,
          accent: '#D97706',
        },
        {
          label: isAr ? 'المبالغ المتبقية' : 'Pending Balance',
          value: formatMoney(params.summary.totalRemaining, params.summary.currency),
          sub: isAr ? 'ذمم غير مسددة' : 'Unpaid / partial',
          accent: '#DC2626',
        },
      ];

      kpis.forEach((k, idx) => {
        const cx = isAr
          ? W - PAD - cardW - idx * (cardW + gap)
          : PAD + idx * (cardW + gap);
        ctx.fillStyle = '#F8FAFC';
        drawRoundedRect(ctx, cx, y, cardW, 114, 14);
        ctx.fill();
        ctx.strokeStyle = '#E2E8F0';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.textAlign = isAr ? 'right' : 'left';
        const tx = isAr ? cx + cardW - 18 : cx + 18;
        ctx.fillStyle = '#64748B';
        ctx.font = `600 16px ${fontFamily}`;
        ctx.fillText(truncateCanvasText(ctx, k.label, cardW - 32), tx, y + 26);

        ctx.fillStyle = k.accent;
        ctx.font = `700 24px ${fontFamily}`;
        ctx.fillText(truncateCanvasText(ctx, k.value, cardW - 32), tx, y + 62);

        ctx.fillStyle = '#64748B';
        ctx.font = `500 14px ${fontFamily}`;
        ctx.fillText(truncateCanvasText(ctx, k.sub, cardW - 32), tx, y + 92);
      });

      y += 140;
    } else {
      // Continuation page compact header
      ctx.fillStyle = '#0F172A';
      ctx.font = `700 22px ${fontFamily}`;
      ctx.textAlign = isAr ? 'right' : 'left';
      ctx.fillText(
        `${params.gymName} — ${isAr ? 'تابع سجل الحسابات' : 'Accounts Ledger (cont.)'}`,
        isAr ? W - PAD : PAD,
        y + 24
      );
      y += 66;
    }

    // Table column layout (ordered RTL for Arabic, LTR for English)
    const cols = [
      { key: 'idx', label: '#', width: 52, align: 'center' as const },
      { key: 'name', label: isAr ? 'اسم المشترك' : 'Member Name', width: 250, align: isAr ? ('right' as const) : ('left' as const) },
      { key: 'tier', label: isAr ? 'الفئة' : 'Category', width: 230, align: isAr ? ('right' as const) : ('left' as const) },
      { key: 'dates', label: isAr ? 'البداية ← الانتهاء' : 'Start → Expiry', width: 230, align: 'center' as const },
      { key: 'amount', label: isAr ? 'المدفوع / السعر' : 'Paid / Price', width: 200, align: 'center' as const },
      { key: 'status', label: isAr ? 'الحالة' : 'Status', width: CONTENT_W - 962, align: 'center' as const },
    ];

    const colPositions: { x: number; w: number; align: 'left' | 'right' | 'center'; key: string; label: string }[] = [];
    if (isAr) {
      let cursor = W - PAD;
      for (const c of cols) {
        cursor -= c.width;
        colPositions.push({ x: cursor, w: c.width, align: c.align, key: c.key, label: c.label });
      }
    } else {
      let cursor = PAD;
      for (const c of cols) {
        colPositions.push({ x: cursor, w: c.width, align: c.align, key: c.key, label: c.label });
        cursor += c.width;
      }
    }

    // Table Header
    ctx.fillStyle = '#1E293B';
    drawRoundedRect(ctx, PAD, y, CONTENT_W, TABLE_HEADER_H, 10);
    ctx.fill();

    ctx.fillStyle = '#F8FAFC';
    ctx.font = `700 17px ${fontFamily}`;
    for (const c of colPositions) {
      ctx.textAlign = c.align;
      const textX =
        c.align === 'center'
          ? c.x + c.w / 2
          : c.align === 'right'
            ? c.x + c.w - 14
            : c.x + 14;
      ctx.fillText(c.label, textX, y + TABLE_HEADER_H / 2);
    }
    y += TABLE_HEADER_H + 8;

    if (rows.length === 0) {
      ctx.fillStyle = '#F8FAFC';
      drawRoundedRect(ctx, PAD, y, CONTENT_W, 90, 12);
      ctx.fill();
      ctx.fillStyle = '#64748B';
      ctx.font = `600 19px ${fontFamily}`;
      ctx.textAlign = 'center';
      ctx.fillText(
        isAr ? 'لا توجد سجلات اشتراكات مطابقة حالياً.' : 'No subscription records match the current filter.',
        W / 2,
        y + 45
      );
    } else {
      const startIndexOffset =
        pageIndex === 0 ? 0 : firstPageMaxRows + (pageIndex - 1) * nextPageMaxRows;

      rows.forEach((sub, rIdx) => {
        const globalIdx = startIndexOffset + rIdx + 1;
        const state = getEffectiveSubState(sub, todayStr, soonCutoffStr);

        ctx.fillStyle = rIdx % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
        drawRoundedRect(ctx, PAD, y, CONTENT_W, ROW_H - 6, 8);
        ctx.fill();
        ctx.strokeStyle = '#E2E8F0';
        ctx.lineWidth = 1;
        ctx.stroke();

        const midY = y + (ROW_H - 6) / 2;

        for (const c of colPositions) {
          ctx.textAlign = c.align;
          const textX =
            c.align === 'center'
              ? c.x + c.w / 2
              : c.align === 'right'
                ? c.x + c.w - 14
                : c.x + 14;

          if (c.key === 'idx') {
            ctx.fillStyle = '#64748B';
            ctx.font = `600 16px ${fontFamily}`;
            ctx.fillText(String(globalIdx), textX, midY);
          } else if (c.key === 'name') {
            ctx.fillStyle = '#0F172A';
            ctx.font = `700 17px ${fontFamily}`;
            ctx.fillText(
              truncateCanvasText(ctx, sub.memberName, c.w - 24),
              textX,
              sub.memberPhone ? midY - 10 : midY
            );
            if (sub.memberPhone) {
              ctx.fillStyle = '#64748B';
              ctx.font = `500 14px ${fontFamily}`;
              ctx.fillText(truncateCanvasText(ctx, sub.memberPhone, c.w - 24), textX, midY + 12);
            }
          } else if (c.key === 'tier') {
            ctx.fillStyle = '#1E293B';
            ctx.font = `600 16px ${fontFamily}`;
            ctx.fillText(truncateCanvasText(ctx, sub.tierName, c.w - 22), textX, midY);
          } else if (c.key === 'dates') {
            ctx.fillStyle = '#334155';
            ctx.font = `600 15px ${fontFamily}`;
            ctx.fillText(`${sub.startDate}  →  ${sub.endDate}`, textX, midY);
          } else if (c.key === 'amount') {
            ctx.fillStyle = '#0F172A';
            ctx.font = `700 16px ${fontFamily}`;
            ctx.fillText(
              `${sub.amountPaid.toLocaleString('en-US')} / ${sub.tierPrice.toLocaleString('en-US')} ${isAr ? 'د.ع' : 'IQD'}`,
              textX,
              midY
            );
          } else if (c.key === 'status') {
            const statusText =
              state === 'active'
                ? isAr
                  ? 'ساري'
                  : 'Active'
                : state === 'expiring'
                  ? isAr
                    ? 'ينتهي قريباً'
                    : 'Expiring'
                  : state === 'expired'
                    ? isAr
                      ? 'منتهي'
                      : 'Expired'
                    : isAr
                      ? 'ملغى'
                      : 'Cancelled';

            const badgeBg =
              state === 'active'
                ? '#DCFCE7'
                : state === 'expiring'
                  ? '#FEF3C7'
                  : state === 'expired'
                    ? '#FEE2E2'
                    : '#E2E8F0';
            const badgeFg =
              state === 'active'
                ? '#166534'
                : state === 'expiring'
                  ? '#92400E'
                  : state === 'expired'
                    ? '#991B1B'
                    : '#475569';

            const bw = Math.min(c.w - 18, 126);
            const bh = 32;
            ctx.fillStyle = badgeBg;
            drawRoundedRect(ctx, c.x + (c.w - bw) / 2, midY - bh / 2, bw, bh, 16);
            ctx.fill();

            ctx.fillStyle = badgeFg;
            ctx.font = `700 15px ${fontFamily}`;
            ctx.fillText(statusText, c.x + c.w / 2, midY);
          }
        }

        y += ROW_H;
      });
    }

    // Footer
    ctx.fillStyle = '#94A3B8';
    ctx.font = `500 15px ${fontFamily}`;
    ctx.textAlign = isAr ? 'right' : 'left';
    ctx.fillText(
      isAr ? 'تم إنشاء التقرير بواسطة نظام APEX لإدارة الكباتن والقاعات' : 'Generated by APEX Coach & Gym Ledger',
      isAr ? W - PAD : PAD,
      H - 36
    );
    ctx.textAlign = isAr ? 'left' : 'right';
    ctx.fillText(
      isAr ? `صفحة ${pageIndex + 1} من ${totalPages}` : `Page ${pageIndex + 1} of ${totalPages}`,
      isAr ? PAD : W - PAD,
      H - 36
    );

    if (pageIndex > 0) pdf.addPage();
    const imgData = canvas.toDataURL('image/jpeg', 0.94);
    pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
  });

  pdf.save(`APEX-Gym-Accounts-${todayStr}.pdf`);
}

export async function exportCoachQrPosterPdf(params: {
  coachDoc: CoachProfileCode;
  qrDataUrl: string;
  joinUrl: string;
  language: Language;
}): Promise<void> {
  if (typeof document === 'undefined' || !params.qrDataUrl) return;
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  const isAr = params.language === 'ar';
  const fontFamily = isAr
    ? '"IBM Plex Sans Arabic", "Cairo", "Segoe UI", Tahoma, Arial, sans-serif'
    : '"Inter", "Segoe UI", Arial, sans-serif';

  const W = 1240;
  const H = 1754;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, W, H);

  // Outer emerald card frame
  ctx.fillStyle = '#0F172A';
  drawRoundedRect(ctx, 72, 72, W - 144, H - 144, 36);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  drawRoundedRect(ctx, 96, 96, W - 192, H - 192, 28);
  ctx.fill();

  // Top dark header inside poster
  ctx.fillStyle = '#0F172A';
  drawRoundedRect(ctx, 132, 132, W - 264, 240, 24);
  ctx.fill();

  ctx.direction = isAr ? 'rtl' : 'ltr';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';

  ctx.fillStyle = '#10B981';
  ctx.font = `700 28px ${fontFamily}`;
  ctx.fillText('APEX FITNESS', W / 2, 195);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = `700 44px ${fontFamily}`;
  ctx.fillText(
    params.coachDoc.gymName || (isAr ? 'القاعة الرياضية' : 'Training Hall'),
    W / 2,
    258
  );

  ctx.fillStyle = '#CBD5E1';
  ctx.font = `600 28px ${fontFamily}`;
  ctx.fillText(
    isAr ? `الكابتن: ${params.coachDoc.coachName}` : `Coach: ${params.coachDoc.coachName}`,
    W / 2,
    318
  );

  // Load QR image
  const img = new Image();
  img.crossOrigin = 'anonymous';
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('QR image load failed'));
    img.src = params.qrDataUrl;
  });

  const qrSize = 640;
  const qrX = (W - qrSize) / 2;
  const qrY = 440;

  ctx.fillStyle = '#F8FAFC';
  drawRoundedRect(ctx, qrX - 36, qrY - 36, qrSize + 72, qrSize + 72, 28);
  ctx.fill();
  ctx.strokeStyle = '#10B981';
  ctx.lineWidth = 6;
  ctx.stroke();

  ctx.drawImage(img, qrX, qrY, qrSize, qrSize);

  // Coach Code Pill
  ctx.fillStyle = '#ECFDF5';
  drawRoundedRect(ctx, (W - 460) / 2, 1170, 460, 88, 20);
  ctx.fill();
  ctx.strokeStyle = '#10B981';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = '#065F46';
  ctx.font = `700 40px "JetBrains Mono", monospace`;
  ctx.fillText(params.coachDoc.coachCode, W / 2, 1214);

  // Instructions
  ctx.fillStyle = '#0F172A';
  ctx.font = `700 32px ${fontFamily}`;
  ctx.fillText(
    isAr
      ? 'امسح الباركود من داخل تطبيق APEX للتسجيل المباشر'
      : 'Scan this QR code inside APEX to register directly with your coach',
    W / 2,
    1335
  );

  ctx.fillStyle = '#475569';
  ctx.font = `500 24px ${fontFamily}`;
  ctx.fillText(
    isAr
      ? 'افتح حساب اللاعب ← اختر «مسح باركود الكابتن» ← ستظهر تمارينك وكورسك تلقائياً'
      : 'Open Athlete Dashboard → Tap "Scan Coach QR" → Receive your custom plan instantly',
    W / 2,
    1395
  );

  ctx.fillStyle = '#94A3B8';
  ctx.font = `500 18px ${fontFamily}`;
  ctx.fillText(truncateCanvasText(ctx, params.joinUrl, W - 280), W / 2, 1570);

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const posterData = canvas.toDataURL('image/jpeg', 0.95);
  pdf.addImage(posterData, 'JPEG', 0, 0, 210, 297);
  pdf.save(`APEX-Coach-QR-${params.coachDoc.coachCode}.pdf`);
}
