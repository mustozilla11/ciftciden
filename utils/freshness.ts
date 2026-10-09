import { FreshnessInfo } from '../types/database';

/**
 * Verilen hasat sonu / tarladan çıkış tarihine göre kalan süreyi ve tarımsal tazelik rozetini hesaplar.
 * - Kalan süre > 3 gün: Yeşil rozet ("Hasada X Gün Kaldı")
 * - Kalan süre <= 2 gün: Turuncu/Kırmızı uyarı rozeti ("Son XX Saat / Tarlada Kalmasın")
 * - Kalan süre <= 0: "Süresi Doldu"
 */
export function calculateFreshness(
  harvestEndDate: string | Date,
  referenceDate: Date = new Date()
): FreshnessInfo {
  const targetTime = typeof harvestEndDate === 'string' 
    ? new Date(harvestEndDate).getTime() 
    : harvestEndDate.getTime();
    
  const now = referenceDate.getTime();
  const diffMs = targetTime - now;

  if (diffMs <= 0) {
    return {
      daysRemaining: 0,
      hoursRemaining: 0,
      badgeText: 'Süresi Doldu',
      badgeVariant: 'expired',
      isExpired: true,
      isUrgent: false,
    };
  }

  const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
  const totalDays = Math.floor(totalHours / 24);
  const remainingHoursInDay = totalHours % 24;

  // 2 gün veya daha az süre kaldığında (<= 48 saat) acil durum rozeti
  if (totalHours <= 48) {
    let badgeText = '';
    if (totalHours < 1) {
      badgeText = 'Son 1 Saatten Az / Tarlada Kalmasın';
    } else if (totalHours <= 24) {
      badgeText = `Son ${totalHours} Saat / Tarlada Kalmasın`;
    } else {
      badgeText = `Son ${totalHours} Saat (2 Gün) / Acil`;
    }

    return {
      daysRemaining: totalDays,
      hoursRemaining: totalHours,
      badgeText,
      badgeVariant: 'urgent',
      isExpired: false,
      isUrgent: true,
    };
  }

  // 3 gün veya daha fazla
  const daysText = totalDays > 0 ? `${totalDays} Gün` : `${totalHours} Saat`;
  return {
    daysRemaining: totalDays,
    hoursRemaining: totalHours,
    badgeText: `Hasada ${daysText} Kaldı`,
    badgeVariant: 'fresh',
    isExpired: false,
    isUrgent: false,
  };
}

/**
 * Fiyat formatlayıcı (Örn: "₺45" veya "45,00 TL")
 */
export function formatPrice(price: number, unit?: string): string {
  const formatted = new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 2,
  }).format(price);

  return unit ? `${formatted} / ${unit}` : formatted;
}

/**
 * Miktar formatlayıcı (Örn: "5.000 kg", "250 kasa")
 */
export function formatQuantity(quantity: number, unit: string): string {
  const formattedQty = new Intl.NumberFormat('tr-TR').format(quantity);
  return `${formattedQty} ${unit}`;
}

/**
 * Tarih formatlayıcı (Örn: "14 Ekim 2026")
 */
export function formatHarvestDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}
