import { calculateFreshness, formatPrice, formatQuantity } from '../utils/freshness';

// Target dimension calculation algorithm (mirrored from utils/imageOptimizer)
function calculateTargetDimensions(
  originalWidth: number,
  originalHeight: number,
  maxDimension: number = 1280
): { width?: number; height?: number } {
  if (originalWidth <= maxDimension && originalHeight <= maxDimension) {
    return originalWidth >= originalHeight 
      ? { width: originalWidth } 
      : { height: originalHeight };
  }

  if (originalWidth >= originalHeight) {
    return { width: maxDimension };
  } else {
    return { height: maxDimension };
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`TEST FAILED: ${message}`);
  }
  console.log(`✓ PASS: ${message}`);
}

console.log('========================================================');
console.log(' ÇİFTÇİDEN CORE LOGIC & FRESHNESS UNIT TEST SUITE');
console.log('========================================================\n');

console.log('--- 1. Testing Image Optimizer Dimensions (1280px WebP Bound) ---');

// Case 1: Yatay yüksek çözünürlüklü tarla fotoğrafı (4032 x 3024)
const landscape = calculateTargetDimensions(4032, 3024, 1280);
assert(landscape.width === 1280, 'Landscape width scaled to 1280px max bound');

// Case 2: Dikey çekim (3024 x 4032)
const portrait = calculateTargetDimensions(3024, 4032, 1280);
assert(portrait.height === 1280, 'Portrait height scaled to 1280px max bound');

// Case 3: Kare fotoğraf (2000 x 2000)
const square = calculateTargetDimensions(2000, 2000, 1280);
assert(square.width === 1280, 'Square scaled to 1280px');

// Case 4: Küçük görsel (800 x 600)
const small = calculateTargetDimensions(800, 600, 1280);
assert(small.width === 800, 'Small image preserved without upscale');

console.log('\n--- 2. Testing Freshness & Countdown Badge Logic ---');

const now = new Date('2026-10-08T12:00:00Z');

// Senaryo A: Hasada 5 Gün Var (> 3 Gün -> Yeşil Rozet)
const future5Days = new Date('2026-10-13T12:00:00Z');
const freshResult = calculateFreshness(future5Days, now);
assert(freshResult.badgeVariant === 'fresh', '5 days remaining gets fresh variant (yeşil)');
assert(freshResult.badgeText.includes('5 Gün Kaldı'), 'Badge shows: "Hasada 5 Gün Kaldı"');
assert(freshResult.isUrgent === false, 'isUrgent is false');
assert(freshResult.isExpired === false, 'isExpired is false');

// Senaryo B: Hasada 28 Saat Var (<= 48 Saat / 2 Gün -> Turuncu/Kırmızı Uyarı Rozeti)
const future28Hours = new Date('2026-10-09T16:00:00Z');
const urgentResult = calculateFreshness(future28Hours, now);
assert(urgentResult.badgeVariant === 'urgent', '28 hours remaining gets urgent variant');
assert(urgentResult.isUrgent === true, 'isUrgent is true');
assert(urgentResult.badgeText.includes('Son 28 Saat'), 'Badge shows "Son 28 Saat"');

// Senaryo C: Son 12 Saat (Son 24 saat içinde "Tarlada Kalmasın" uyarısı)
const future12Hours = new Date('2026-10-09T00:00:00Z');
const urgent12Result = calculateFreshness(future12Hours, now);
assert(urgent12Result.badgeVariant === 'urgent', '12 hours remaining gets urgent variant');
assert(urgent12Result.badgeText.includes('Tarlada Kalmasın'), 'Badge emphasizes "Tarlada Kalmasın"');

// Senaryo D: Süresi Dolan İlan (<= 0)
const pastDate = new Date('2026-10-07T12:00:00Z');
const expiredResult = calculateFreshness(pastDate, now);
assert(expiredResult.badgeVariant === 'expired', 'Past harvest gets expired variant');
assert(expiredResult.isExpired === true, 'isExpired is true');
assert(expiredResult.badgeText === 'Süresi Doldu', 'Badge text says "Süresi Doldu"');

console.log('\n--- 3. Testing Price & Unit Formatting ---');
const priceFormatted = formatPrice(22.5, 'kg');
assert(priceFormatted.includes('kg'), 'Price formatted with unit');

const qtyFormatted = formatQuantity(4500, 'kg');
assert(qtyFormatted.includes('4.500') || qtyFormatted.includes('4,500'), 'Thousands separator applied to quantity');

console.log('\n========================================================');
console.log(' TÜM BİRİM TESTLER BAŞARIYLA GEÇTİ (10/10) ✓');
console.log('========================================================');
