import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import {
  Camera,
  Image as ImageIcon,
  CheckCircle,
  Truck,
  Calendar,
  ChevronRight,
  Phone,
  User,
  X,
  Maximize2,
} from 'lucide-react-native';
import { useListings } from '../../context/ListingContext';
import { optimizeFarmerImage } from '../../utils/imageOptimizer';
import {
  ProductCategory,
  UnitType,
  DeliveryType,
  CreateListingInput,
} from '../../types/database';
import { CATEGORIES } from '../../constants/mockData';
import { ImageViewerModal } from '../../components/ImageViewerModal';

const UNIT_OPTIONS: UnitType[] = ['kg', 'kasa', 'ton', 'çuval'];
const DELIVERY_OPTIONS: DeliveryType[] = [
  'Tarlada Teslim',
  'Kargo Uygun',
  'Nakliye Alıcıya Ait',
];
const DEADLINE_PRESETS = [
  { days: 3, label: '3 Gün (Acil)', urgent: true },
  { days: 7, label: '7 Gün', urgent: false },
  { days: 15, label: '15 Gün', urgent: false },
];

export default function CreateListingScreen() {
  const router = useRouter();
  const { addListing } = useListings();

  // Form State
  const [images, setImages] = useState<string[]>([]);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [compressProgressText, setCompressProgressText] = useState<string>('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [farmerName, setFarmerName] = useState('Hüseyin Tarım');
  const [phoneNumber, setPhoneNumber] = useState('05321234567');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Sebze');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState<UnitType>('kg');
  const [pricePerUnit, setPricePerUnit] = useState('');

  const [deliveryType, setDeliveryType] = useState<DeliveryType>('Tarlada Teslim');
  const [harvestDays, setHarvestDays] = useState<number>(7);
  const [customDaysInput, setCustomDaysInput] = useState<string>('');

  const [city, setCity] = useState('Antalya');
  const [district, setDistrict] = useState('Kumluca');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Görsel Seçme & WebP Otomatik Sıkıştırma
  const handlePickImage = async (useCamera: boolean = false) => {
    try {
      let result;
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('İzin Gerekli', 'Kamera kullanımı için izin verilmedi.');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          quality: 0.9,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsMultipleSelection: true,
          selectionLimit: 4,
          quality: 0.9,
        });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setIsCompressing(true);
        setCompressProgressText('Kırsal şebeke optimizasyonu: WebP 1280px sıkıştırılıyor...');

        const newCompressedUris: string[] = [];

        for (let i = 0; i < result.assets.length; i++) {
          const asset = result.assets[i];
          setCompressProgressText(`Görsel ${i + 1}/${result.assets.length} WebP'ye dönüştürülüyor...`);
          
          const optimized = await optimizeFarmerImage(asset.uri, asset.width, asset.height);
          newCompressedUris.push(optimized.uri);
        }

        setImages(prev => [...prev, ...newCompressedUris]);
        setCompressProgressText('✓ WebP Optimizasyonu Tamamlandı (<200KB)');
        setTimeout(() => setIsCompressing(false), 800);
      }
    } catch (err) {
      console.log('Görsel işleme notu:', err);
      setIsCompressing(false);
      Alert.alert('Hata', 'Fotoğraf işlenirken bir sorun oluştu.');
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Gün sayısı değişikliği
  const handlePresetDays = (days: number) => {
    setHarvestDays(days);
    setCustomDaysInput('');
  };

  const handleCustomDaysChange = (text: string) => {
    const num = parseInt(text.replace(/\D/g, ''), 10);
    setCustomDaysInput(text);
    if (!isNaN(num) && num > 0) {
      setHarvestDays(num);
    }
  };

  // 2. Form Gönderimi
  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen mahsul adını girin (Örn: Salkım Domates).');
      return;
    }
    if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) {
      Alert.alert('Eksik Bilgi', 'Lütfen geçerli bir mahsul miktarı girin.');
      return;
    }
    if (!pricePerUnit || isNaN(Number(pricePerUnit)) || Number(pricePerUnit) <= 0) {
      Alert.alert('Eksik Bilgi', 'Lütfen birim fiyatı girin.');
      return;
    }
    if (!phoneNumber.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen alıcıların WhatsApp ve arama için ulaşabileceği telefon numarasını girin.');
      return;
    }
    if (!city.trim() || !district.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen il ve ilçe bilgisini girin.');
      return;
    }

    setIsSubmitting(true);

    try {
      const finalDays = harvestDays > 0 ? harvestDays : 7;
      const harvestEndDate = new Date(Date.now() + finalDays * 24 * 60 * 60 * 1000).toISOString();

      const newListingData: CreateListingInput = {
        title: title.trim(),
        description: description.trim() || 'Tarladan taze hasat.',
        category,
        quantity: Number(quantity),
        unit,
        price_per_unit: Number(pricePerUnit),
        delivery_type: deliveryType,
        harvest_end_date: harvestEndDate,
        images,
        city: city.trim(),
        district: district.trim(),
        phone_number: phoneNumber.trim(),
        farmer_name: farmerName.trim(),
      };

      await addListing(newListingData);

      Alert.alert(
        'İlanınız Yayında! 🌱',
        `Mahsulünüz vitrinde ve ${phoneNumber} numarasıyla doğrudan alıcıların erişimine açıldı.`,
        [
          {
            text: 'Vitrini Gör',
            onPress: () => router.push('/'),
          },
        ]
      );
    } catch (err) {
      console.log('İlan kaydetme notu:', err);
      Alert.alert('Hata', 'İlan kaydedilirken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tarladan İlan Ver</Text>
        <Text style={styles.headerSubtitle}>
          Komisyonsuz doğrudan alıcıya ulaş • Tarladan sofraya
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* İLETİŞİM & ÜRETİCİ BİLGİSİ */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.stepBadge}>
              <User size={16} color="#ffffff" />
            </View>
            <View>
              <Text style={styles.sectionTitle}>İletişim & WhatsApp Numarası</Text>
              <Text style={styles.sectionSubtitle}>
                Alıcılar bu numarayla tek dokunuşla WhatsApp veya telefonla ulaşacak
              </Text>
            </View>
          </View>

          <View style={styles.twoColumnRow}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.inputLabel}>Ad Soyad / İşletme *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Örn: Ahmet Yılmaz"
                placeholderTextColor="#94a3b8"
                value={farmerName}
                onChangeText={setFarmerName}
              />
            </View>
            <View style={{ flex: 1.2, marginLeft: 8 }}>
              <Text style={styles.inputLabel}>Telefon (WhatsApp) *</Text>
              <View style={styles.phoneInputRow}>
                <Phone size={16} color="#15803d" style={{ marginRight: 6 }} />
                <TextInput
                  style={[styles.textInput, { flex: 1, borderWidth: 0, paddingHorizontal: 0 }]}
                  placeholder="05XX XXX XX XX"
                  placeholderTextColor="#94a3b8"
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                />
              </View>
            </View>
          </View>
        </View>

        {/* ADIM 1: FOTOĞRAFLAR & WEBP SIKIŞTIRMA */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>1</Text>
            </View>
            <View>
              <Text style={styles.sectionTitle}>Tarladan / Mahsulden Fotoğraflar</Text>
              <Text style={styles.sectionSubtitle}>
                Fotoğrafa dokunarak tam ekran açabilirsiniz
              </Text>
            </View>
          </View>

          {/* Fotoğraf Ekleme Butonları */}
          <View style={styles.photoActionsRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.photoActionBtn, styles.cameraBtn]}
              onPress={() => handlePickImage(true)}
            >
              <Camera size={20} color="#ffffff" />
              <Text style={styles.cameraBtnText}>Fotoğraf Çek</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.photoActionBtn, styles.galleryBtn]}
              onPress={() => handlePickImage(false)}
            >
              <ImageIcon size={20} color="#15803d" />
              <Text style={styles.galleryBtnText}>Galeriden Seç</Text>
            </TouchableOpacity>
          </View>

          {/* Sıkıştırma İlerleme Çubuğu */}
          {isCompressing && (
            <View style={styles.compressingBar}>
              <ActivityIndicator size="small" color="#15803d" />
              <Text style={styles.compressingText}>{compressProgressText}</Text>
            </View>
          )}

          {/* Yüklenen Fotoğrafların Önizlemesi */}
          {images.length > 0 && (
            <View style={styles.imagesPreviewGrid}>
              {images.map((uri, idx) => (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.85}
                  onPress={() => setPreviewImage(uri)}
                  style={styles.imageThumbContainer}
                >
                  <Image source={{ uri }} style={styles.imageThumb} />
                  <View style={styles.webpBadge}>
                    <Text style={styles.webpBadgeText}>WebP</Text>
                  </View>
                  <View style={styles.zoomIconBadge}>
                    <Maximize2 size={11} color="#ffffff" />
                  </View>
                  <TouchableOpacity
                    style={styles.removeImageBtn}
                    onPress={() => removeImage(idx)}
                  >
                    <X size={14} color="#ffffff" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* ADIM 2: ÜRÜN & MİKTAR / FİYAT */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>2</Text>
            </View>
            <View>
              <Text style={styles.sectionTitle}>Mahsul Bilgileri ve Fiyat</Text>
              <Text style={styles.sectionSubtitle}>Alıcıların ilk göreceği detaylar</Text>
            </View>
          </View>

          <Text style={styles.inputLabel}>Mahsul / Ürün Adı *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Örn: Salkım Sera Domatesi, Finike Portakalı..."
            placeholderTextColor="#94a3b8"
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.inputLabel}>Kategori</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
            {CATEGORIES.filter(c => c !== 'Tümü').map(cat => {
              const isSelected = category === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategory(cat as ProductCategory)}
                  style={[styles.formChip, isSelected && styles.formChipActive]}
                >
                  <Text style={[styles.formChipText, isSelected && styles.formChipTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.twoColumnRow}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.inputLabel}>Mevcut Miktar *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Örn: 2500"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
                value={quantity}
                onChangeText={setQuantity}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.inputLabel}>Birim</Text>
              <View style={styles.unitSelectorRow}>
                {UNIT_OPTIONS.map(u => (
                  <TouchableOpacity
                    key={u}
                    onPress={() => setUnit(u)}
                    style={[styles.unitBtn, unit === u && styles.unitBtnActive]}
                  >
                    <Text style={[styles.unitBtnText, unit === u && styles.unitBtnTextActive]}>
                      {u}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <Text style={styles.inputLabel}>Birim Fiyat (TL / {unit}) *</Text>
          <TextInput
            style={[styles.textInput, styles.priceInput]}
            placeholder="Örn: 22.50"
            placeholderTextColor="#94a3b8"
            keyboardType="decimal-pad"
            value={pricePerUnit}
            onChangeText={setPricePerUnit}
          />

          <Text style={styles.inputLabel}>Hasat ve Mahsul Notu</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Örn: İlaç kalıntısız, tarlada kasalama yapılmıştır..."
            placeholderTextColor="#94a3b8"
            multiline
            numberOfLines={3}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* ADIM 3: TESLİMAT & HASAT BİTİŞ GÜNÜ (GERİ SAYIM) */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>3</Text>
            </View>
            <View>
              <Text style={styles.sectionTitle}>Teslimat ve Hasat Süresi</Text>
              <Text style={styles.sectionSubtitle}>
                Tarladan çıkış geri sayım sayacını belirleyin
              </Text>
            </View>
          </View>

          <Text style={styles.inputLabel}>Teslimat Şekli</Text>
          <View style={styles.deliverySelector}>
            {DELIVERY_OPTIONS.map(opt => {
              const isSelected = deliveryType === opt;
              return (
                <TouchableOpacity
                  key={opt}
                  onPress={() => setDeliveryType(opt)}
                  style={[styles.deliveryBtn, isSelected && styles.deliveryBtnActive]}
                >
                  <Truck size={16} color={isSelected ? '#15803d' : '#64748b'} />
                  <Text style={[styles.deliveryBtnText, isSelected && styles.deliveryBtnTextActive]}>
                    {opt}
                  </Text>
                  {isSelected && <CheckCircle size={16} color="#15803d" />}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Hasat Bitiş Günü Seçici & Manuel Gün Girişi */}
          <View style={styles.deadlineSection}>
            <View style={styles.deadlineTitleRow}>
              <Calendar size={18} color="#ea580c" />
              <Text style={styles.inputLabelNoMargin}>
                Tarladan Çıkış / Hasat Süresi ({harvestDays} Gün):
              </Text>
            </View>
            <Text style={styles.deadlineHint}>
              Belirlenen süre bitince ilan otomatik pasife alınır ve alıcılara "Acil" uyarısı gösterilir.
            </Text>

            {/* 3 Hızlı Seçenek */}
            <View style={styles.daysGrid}>
              {DEADLINE_PRESETS.map(item => {
                const isSelected = harvestDays === item.days && !customDaysInput;
                return (
                  <TouchableOpacity
                    key={item.days}
                    onPress={() => handlePresetDays(item.days)}
                    style={[
                      styles.dayButton,
                      isSelected && (item.urgent ? styles.dayButtonUrgentActive : styles.dayButtonActive),
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayButtonText,
                        isSelected && styles.dayButtonTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Veya Elle Gün Gir */}
            <View style={styles.customDaysRow}>
              <Text style={styles.customDaysLabel}>Veya Elle Gün Gir:</Text>
              <TextInput
                style={styles.customDaysInput}
                placeholder="Örn: 10"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
                value={customDaysInput}
                onChangeText={handleCustomDaysChange}
              />
              <Text style={styles.customDaysSuffix}>Gün</Text>
            </View>
          </View>
        </View>

        {/* ADIM 4: KONUM (TARLA YERİ) */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>4</Text>
            </View>
            <View>
              <Text style={styles.sectionTitle}>Tarla / Üretim Bölgesi</Text>
              <Text style={styles.sectionSubtitle}>
                Alıcılar yakındaki mahsulleri bu konuma göre bulur
              </Text>
            </View>
          </View>

          <View style={styles.twoColumnRow}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.inputLabel}>İl *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Örn: Antalya"
                placeholderTextColor="#94a3b8"
                value={city}
                onChangeText={setCity}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.inputLabel}>İlçe *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Örn: Kumluca"
                placeholderTextColor="#94a3b8"
                value={district}
                onChangeText={setDistrict}
              />
            </View>
          </View>

          <View style={styles.privacyNoteBox}>
            <Text style={styles.privacyNoteText}>
              🛡️ Çiftçi Güvenliği: Tarla güvenliğiniz ve mahsul mahremiyeti için il/ilçe haricinde mahalle, köy veya tam koordinat ilanlarda asla yayınlanmaz. Alıcıyla tam konumu özel olarak WhatsApp'tan paylaşabilirsiniz.
            </Text>
          </View>
        </View>

        {/* BÜYÜK ONAY BUTONU */}
        <TouchableOpacity
          activeOpacity={0.88}
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Text style={styles.submitButtonText}>İlanı Tarladan Yayına Al</Text>
              <ChevronRight size={22} color="#ffffff" />
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* FOTOĞRAF TAM EKRAN GÖRÜNTÜLEYİCİ */}
      <ImageViewerModal
        visible={!!previewImage}
        imageUrl={previewImage}
        onClose={() => setPreviewImage(null)}
        title="Mahsul Fotoğrafı"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 2,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#15803d',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  stepBadgeText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748b',
  },
  photoActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  photoActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  cameraBtn: {
    backgroundColor: '#15803d',
  },
  cameraBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14,
  },
  galleryBtn: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1.5,
    borderColor: '#86efac',
  },
  galleryBtnText: {
    color: '#15803d',
    fontWeight: '800',
    fontSize: 14,
  },
  compressingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    padding: 10,
    borderRadius: 8,
    marginTop: 6,
    gap: 8,
  },
  compressingText: {
    fontSize: 12,
    color: '#065f46',
    fontWeight: '700',
  },
  imagesPreviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },
  imageThumbContainer: {
    position: 'relative',
    width: 76,
    height: 76,
    borderRadius: 8,
    overflow: 'hidden',
  },
  imageThumb: {
    width: '100%',
    height: '100%',
  },
  webpBadge: {
    position: 'absolute',
    bottom: 2,
    left: 2,
    backgroundColor: 'rgba(21, 128, 61, 0.85)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  webpBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
  },
  zoomIconBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    padding: 2,
    borderRadius: 4,
  },
  removeImageBtn: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    borderRadius: 10,
    padding: 3,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginTop: 10,
    marginBottom: 6,
  },
  inputLabelNoMargin: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  textInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#0f172a',
    fontWeight: '600',
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  priceInput: {
    fontSize: 18,
    fontWeight: '800',
    color: '#15803d',
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  chipsScroll: {
    marginVertical: 4,
  },
  formChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  formChipActive: {
    backgroundColor: '#15803d',
    borderColor: '#15803d',
  },
  formChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  formChipTextActive: {
    color: '#ffffff',
  },
  twoColumnRow: {
    flexDirection: 'row',
  },
  unitSelectorRow: {
    flexDirection: 'row',
    gap: 4,
  },
  unitBtn: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  unitBtnActive: {
    backgroundColor: '#15803d',
    borderColor: '#15803d',
  },
  unitBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
  },
  unitBtnTextActive: {
    color: '#ffffff',
  },
  deliverySelector: {
    gap: 8,
    marginTop: 4,
  },
  deliveryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 8,
  },
  deliveryBtnActive: {
    backgroundColor: '#f0fdf4',
    borderColor: '#86efac',
  },
  deliveryBtnText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  deliveryBtnTextActive: {
    color: '#15803d',
  },
  deadlineSection: {
    marginTop: 14,
    backgroundColor: '#fff7ed',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  deadlineTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  deadlineHint: {
    fontSize: 11,
    color: '#9a3412',
    marginTop: 4,
    marginBottom: 8,
  },
  daysGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  dayButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fdba74',
  },
  dayButtonActive: {
    backgroundColor: '#15803d',
    borderColor: '#15803d',
  },
  dayButtonUrgentActive: {
    backgroundColor: '#ea580c',
    borderColor: '#ea580c',
  },
  dayButtonText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#9a3412',
  },
  dayButtonTextActive: {
    color: '#ffffff',
  },
  customDaysRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fdba74',
  },
  customDaysLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#78350f',
    marginRight: 8,
  },
  customDaysInput: {
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#f59e0b',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 14,
    fontWeight: '800',
    color: '#78350f',
    width: 60,
    textAlign: 'center',
  },
  customDaysSuffix: {
    fontSize: 13,
    fontWeight: '700',
    color: '#78350f',
    marginLeft: 6,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#15803d',
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 10,
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#15803d',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  privacyNoteBox: {
    marginTop: 10,
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 10,
    padding: 10,
  },
  privacyNoteText: {
    fontSize: 12,
    lineHeight: 17,
    color: '#166534',
    fontWeight: '600',
  },
});
