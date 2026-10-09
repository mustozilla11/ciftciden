import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ImageViewerModal } from '../../components/ImageViewerModal';
import { CallConfirmModal } from '../../components/CallConfirmModal';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  MapPin,
  Truck,
  Phone,
  MessageCircle,
  Clock,
  ShieldCheck,
  User,
  Share2,
} from 'lucide-react-native';
import { useListings } from '../../context/ListingContext';
import { FreshnessBadge } from '../../components/FreshnessBadge';
import { calculateFreshness, formatPrice, formatQuantity, formatHarvestDate } from '../../utils/freshness';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ListingDetailScreen() {
  const insets = useSafeAreaInsets();
  const bottomBarPadding = insets.bottom > 0 ? insets.bottom + 8 : (Platform.OS === 'android' ? 24 : 14);

  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { listings } = useListings();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedImageModal, setSelectedImageModal] = useState<string | null>(null);
  const [isCallModalVisible, setIsCallModalVisible] = useState<boolean>(false);

  const listing = listings.find(l => l.id === id);

  if (!listing) {
    return (
      <SafeAreaView style={styles.notFoundContainer}>
        <Text style={styles.notFoundTitle}>İlan Bulunamadı</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Geri Dön</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const freshness = calculateFreshness(listing.harvest_end_date);
  const images = listing.images && listing.images.length > 0
    ? listing.images
    : ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=1280&q=80'];

  const farmerName = listing.profiles?.full_name || 'Örnek Çiftçi';
  const farmerPhone = listing.profiles?.phone_number || '05321234567';

  // Telefon arama onay bildirimini aç
  const handleCallFarmer = () => {
    setIsCallModalVisible(true);
  };

  // WhatsApp doğrudan mesaj aksiyonu
  const handleWhatsApp = () => {
    let cleanPhone = farmerPhone.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '90' + cleanPhone.substring(1);
    } else if (!cleanPhone.startsWith('90')) {
      cleanPhone = '90' + cleanPhone;
    }

    const message = encodeURIComponent(
      `Merhaba ${farmerName}, Çiftçiden uygulamasındaki "${listing.title}" ilanınız için yazıyorum. Detayları görüşebilir miyiz?`
    );

    const waNativeUrl = `whatsapp://send?phone=${cleanPhone}&text=${message}`;
    const waWebUrl = `https://wa.me/${cleanPhone}?text=${message}`;

    Linking.canOpenURL(waNativeUrl)
      .then(supported => {
        if (supported) {
          Linking.openURL(waNativeUrl);
        } else {
          Linking.openURL(waWebUrl);
        }
      })
      .catch(() => Linking.openURL(waWebUrl));
  };

  // WhatsApp üzerinden canlı tarla konumu isteme aksiyonu
  const handleRequestLocation = () => {
    let cleanPhone = farmerPhone.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '90' + cleanPhone.substring(1);
    } else if (!cleanPhone.startsWith('90')) {
      cleanPhone = '90' + cleanPhone;
    }

    const message = encodeURIComponent(
      `Merhaba ${farmerName}, Çiftçiden uygulamasındaki "${listing.title}" mahsulünüz için yazıyorum. Tarlanın / teslimat yerinin canlı konumunu WhatsApp üzerinden paylaşabilir misiniz?`
    );

    const waNativeUrl = `whatsapp://send?phone=${cleanPhone}&text=${message}`;
    const waWebUrl = `https://wa.me/${cleanPhone}?text=${message}`;

    Linking.canOpenURL(waNativeUrl)
      .then(supported => {
        if (supported) {
          Linking.openURL(waNativeUrl);
        } else {
          Linking.openURL(waWebUrl);
        }
      })
      .catch(() => Linking.openURL(waWebUrl));
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* ÜST GEZİNME BAR / GERİ DÖNÜŞ */}
      <View style={styles.floatingHeader}>
        <TouchableOpacity
          style={styles.headerIconButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <ArrowLeft size={22} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitleText} numberOfLines={1}>
          {listing.title}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* ÇOKLU GÖRSEL SLIDER / GALERİ */}
        <View style={styles.galleryContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={e => {
              const slide = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setActiveImageIndex(slide);
            }}
            scrollEventThrottle={16}
          >
            {images.map((imgUri, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.9}
                onPress={() => setSelectedImageModal(imgUri)}
              >
                <Image
                  source={{ uri: imgUri }}
                  style={styles.galleryImage}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Sayfalama Göstergesi */}
          {images.length > 1 && (
            <View style={styles.paginationRow}>
              {images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    index === activeImageIndex && styles.paginationDotActive,
                  ]}
                />
              ))}
            </View>
          )}

          {/* Tazelik Rozeti Görsel Üzeri */}
          <View style={styles.galleryBadgeOverlay}>
            <FreshnessBadge harvestEndDate={listing.harvest_end_date} size="lg" />
          </View>
        </View>

        {/* ANA DETAY BLOĞU */}
        <View style={styles.bodyContent}>
          <View style={styles.categoryAndDateRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{listing.category}</Text>
            </View>
            <Text style={styles.publishDateText}>
              İlan Tarihi: {formatHarvestDate(listing.created_at)}
            </Text>
          </View>

          <Text style={styles.mainTitle}>{listing.title}</Text>

          {/* FİYAT VE MİKTAR PANELİ */}
          <View style={styles.pricePanel}>
            <View>
              <Text style={styles.pricePanelLabel}>Birim Fiyat (Komisyonsuz)</Text>
              <Text style={styles.pricePanelValue}>
                {formatPrice(listing.price_per_unit, listing.unit)}
              </Text>
            </View>
            <View style={styles.quantityCol}>
              <Text style={styles.pricePanelLabel}>Mevcut Mahsul</Text>
              <Text style={styles.quantityValue}>
                {formatQuantity(listing.quantity, listing.unit)}
              </Text>
            </View>
          </View>

          {/* TARIMSAL GERİ SAYIM SAYACI & UYARI */}
          <View
            style={[
              styles.countdownCard,
              freshness.isUrgent && styles.countdownCardUrgent,
            ]}
          >
            <View style={styles.countdownHeaderRow}>
              <Clock
                size={20}
                color={freshness.isUrgent ? '#c2410c' : '#15803d'}
              />
              <Text
                style={[
                  styles.countdownTitle,
                  freshness.isUrgent && styles.countdownTitleUrgent,
                ]}
              >
                {freshness.badgeText}
              </Text>
            </View>
            <Text style={styles.countdownDescription}>
              Tahmini hasat ve tarladan çıkış son tarihi:{' '}
              <Text style={{ fontWeight: '700' }}>
                {formatHarvestDate(listing.harvest_end_date)}
              </Text>
              . Mahsul tazeliğini korumak için doğrudan üreticiyle iletişime geçiniz.
            </Text>
          </View>

          {/* MAHSUL ÖZELLİKLERİ TABLOSU */}
          <View style={styles.specsCard}>
            <Text style={styles.specsSectionTitle}>Mahsul & Teslimat Bilgileri</Text>

            <View style={styles.specRow}>
              <View style={styles.specLeft}>
                <Truck size={18} color="#64748b" />
                <Text style={styles.specLabel}>Teslimat Şekli</Text>
              </View>
              <Text style={styles.specValue}>{listing.delivery_type}</Text>
            </View>

            <View style={styles.specDivider} />

            <View style={styles.specRow}>
              <View style={styles.specLeft}>
                <MapPin size={18} color="#64748b" />
                <Text style={styles.specLabel}>Tarla Konumu</Text>
              </View>
              <Text style={styles.specValue}>
                {listing.city}, {listing.district}
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.requestLocationBtn}
              onPress={handleRequestLocation}
            >
              <MessageCircle size={15} color="#15803d" />
              <Text style={styles.requestLocationBtnText}>
                WhatsApp'tan Canlı Konum İste
              </Text>
            </TouchableOpacity>

            <View style={styles.specDivider} />

            <View style={styles.specRow}>
              <View style={styles.specLeft}>
                <ShieldCheck size={18} color="#15803d" />
                <Text style={styles.specLabel}>Aracı / Komisyon</Text>
              </View>
              <Text style={[styles.specValue, { color: '#15803d', fontWeight: '800' }]}>
                Komisyonsuz
              </Text>
            </View>
          </View>

          {/* MAHSUL AÇIKLAMASI */}
          <View style={styles.descCard}>
            <Text style={styles.specsSectionTitle}>Üreticinin Notu</Text>
            <Text style={styles.descBody}>
              {listing.description || 'Üretici ek bir açıklama belirtmedi.'}
            </Text>
          </View>

          {/* ÜRETİCİ PROFİL ÖZETİ */}
          <View style={styles.farmerCard}>
            <View style={styles.farmerAvatar}>
              <User size={28} color="#15803d" />
            </View>
            <View style={styles.farmerInfo}>
              <View style={styles.farmerNameRow}>
                <Text style={styles.farmerName}>{farmerName}</Text>
                <View style={styles.farmerVerifiedBadge}>
                  <Text style={styles.farmerVerifiedText}>Doğrulanmış Üretici</Text>
                </View>
              </View>
              <Text style={styles.farmerLocation}>
                {listing.city} / {listing.district} Üreticisi
              </Text>
              {listing.profiles?.bio && (
                <Text style={styles.farmerBio}>{listing.profiles.bio}</Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* SABİT ALT AKSİYON BARI (WHATSAPP & TELEFON ARAMA) */}
      <View style={[styles.bottomActionBar, { paddingBottom: bottomBarPadding }]}>
        <TouchableOpacity
          activeOpacity={0.88}
          style={styles.callButton}
          onPress={handleCallFarmer}
        >
          <Phone size={20} color="#0f172a" />
          <Text style={styles.callButtonText}>Üreticiyi Ara</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.88}
          style={styles.whatsappButton}
          onPress={handleWhatsApp}
        >
          <MessageCircle size={22} color="#ffffff" />
          <Text style={styles.whatsappButtonText}>WhatsApp ile Yaz</Text>
        </TouchableOpacity>
      </View>

      {/* TAM EKRAN FOTOĞRAF GÖRÜNTÜLEYİCİ */}
      <ImageViewerModal
        visible={!!selectedImageModal}
        imageUrl={selectedImageModal}
        onClose={() => setSelectedImageModal(null)}
        title={listing.title}
      />

      {/* ARAMA ONAY BİLDİRİMİ VE BİLGİ KARTI MODALI */}
      <CallConfirmModal
        visible={isCallModalVisible}
        onClose={() => setIsCallModalVisible(false)}
        farmerName={farmerName}
        listingTitle={listing.title}
        listingLocation={`${listing.city}, ${listing.district}`}
        phoneNumber={farmerPhone}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  notFoundTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#15803d',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  floatingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 12,
  },
  headerIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  scrollContent: {
    paddingBottom: 110,
  },
  galleryContainer: {
    position: 'relative',
    width: SCREEN_WIDTH,
    height: 280,
    backgroundColor: '#0f172a',
  },
  galleryImage: {
    width: SCREEN_WIDTH,
    height: 280,
    resizeMode: 'cover',
  },
  galleryBadgeOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
  },
  paginationRow: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  paginationDotActive: {
    backgroundColor: '#ffffff',
    width: 14,
  },
  bodyContent: {
    padding: 16,
  },
  categoryAndDateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  categoryBadgeText: {
    color: '#15803d',
    fontWeight: '800',
    fontSize: 12,
  },
  publishDateText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
    lineHeight: 28,
    marginBottom: 14,
  },
  pricePanel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  pricePanelLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  pricePanelValue: {
    fontSize: 26,
    fontWeight: '900',
    color: '#15803d',
  },
  quantityCol: {
    alignItems: 'flex-end',
  },
  quantityValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
  },
  countdownCard: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1.5,
    borderColor: '#86efac',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  countdownCardUrgent: {
    backgroundColor: '#fff7ed',
    borderColor: '#f97316',
  },
  countdownHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  countdownTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#15803d',
  },
  countdownTitleUrgent: {
    color: '#c2410c',
  },
  countdownDescription: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
  },
  specsCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  specsSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 14,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  specLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  specLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  specValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    flexShrink: 1,
    textAlign: 'right',
  },
  specDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 8,
  },
  descCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  descBody: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 22,
  },
  farmerCard: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    gap: 12,
  },
  farmerAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  farmerInfo: {
    flex: 1,
  },
  farmerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  farmerName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  farmerVerifiedBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  farmerVerifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803d',
  },
  farmerLocation: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  farmerBio: {
    fontSize: 12,
    color: '#475569',
    marginTop: 4,
  },
  bottomActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 10,
      },
      web: {
        boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.05)',
      },
    }),
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    gap: 8,
  },
  callButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  whatsappButton: {
    flex: 1.3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366', // WhatsApp Resmi Yeşili
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  whatsappButtonText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#ffffff',
  },
  requestLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdf4',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    marginTop: 6,
    gap: 6,
  },
  requestLocationBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803d',
  },
});
