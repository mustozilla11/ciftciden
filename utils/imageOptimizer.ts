import * as ImageManipulator from 'expo-image-manipulator';
import { supabase } from '../lib/supabase';

export interface OptimizedImageResult {
  uri: string;
  width: number;
  height: number;
  format: 'webp';
  fileSizeApproxKb?: number;
}

/**
 * En-boy oranını (aspect ratio) bozmadan maksimum 1280px sınırlı boyutları hesaplar.
 */
export function calculateTargetDimensions(
  originalWidth: number,
  originalHeight: number,
  maxDimension: number = 1280
): { width?: number; height?: number } {
  if (originalWidth <= maxDimension && originalHeight <= maxDimension) {
    // Görsel zaten 1280px'den küçükse orijinal ebatlar korunabilir
    return originalWidth >= originalHeight 
      ? { width: originalWidth } 
      : { height: originalHeight };
  }

  if (originalWidth >= originalHeight) {
    // Yatay görsel: Genişliği 1280px yap, yükseklik orantılı küçülür
    return { width: maxDimension };
  } else {
    // Dikey görsel: Yüksekliği 1280px yap, genişlik orantılı küçülür
    return { height: maxDimension };
  }
}

/**
 * Zayıf kırsal şebekeler için zorunlu istemci tarafı görsel optimizasyonu.
 * - Maksimum 1280px çözünürlük
 * - WebP formatı
 * - 0.75 sıkıştırma kalitesi
 * - Çiftçilerin 10-20 MB'lık kamera fotoğraflarını 150-250 KB'a düşürür
 */
export async function optimizeFarmerImage(
  uri: string,
  width?: number,
  height?: number
): Promise<OptimizedImageResult> {
  const resizeAction = (width && height) 
    ? { resize: calculateTargetDimensions(width, height, 1280) }
    : { resize: { width: 1280 } };

  const manipulated = await ImageManipulator.manipulateAsync(
    uri,
    [resizeAction],
    {
      compress: 0.75,
      format: ImageManipulator.SaveFormat.WEBP,
    }
  );

  return {
    uri: manipulated.uri,
    width: manipulated.width,
    height: manipulated.height,
    format: 'webp',
  };
}

/**
 * Optimize edilmiş WebP görselini Supabase Storage ('listing-images' bucket) üzerine yükler
 * ve herkese açık erişilebilir public URL'ini döner.
 */
export async function uploadListingImageToSupabase(
  optimizedUri: string,
  userId: string = 'public'
): Promise<string> {
  const fileExt = 'webp';
  const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
  const filePath = `listings/${fileName}`;

  // React Native / Web ortamında dosya blob'una çevirme
  const response = await fetch(optimizedUri);
  const blob = await response.blob();

  const { data, error } = await supabase.storage
    .from('listing-images')
    .upload(filePath, blob, {
      contentType: 'image/webp',
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.log('Supabase storage yükleme notu (Demo modunda yerel uri kullanılacak):', error.message);
    // Gerçek Supabase hesabı bağlanana kadar yerel URI'yi veya placeholder'ı fallback olarak dönebiliriz
    return optimizedUri;
  }

  // Yüklenen görselin Public URL'ini al
  const { data: publicUrlData } = supabase.storage
    .from('listing-images')
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}
