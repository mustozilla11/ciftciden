import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import { Phone, X, User, MapPin, ShieldCheck, MessageCircle } from 'lucide-react-native';

interface CallConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  farmerName: string;
  listingTitle: string;
  listingLocation: string;
  phoneNumber: string;
}

export const CallConfirmModal: React.FC<CallConfirmModalProps> = ({
  visible,
  onClose,
  farmerName,
  listingTitle,
  listingLocation,
  phoneNumber,
}) => {
  const cleanPhone = phoneNumber.replace(/\D/g, '');

  const handleExecuteCall = () => {
    onClose();
    const phoneUrl = `tel:${cleanPhone}`;
    // canOpenURL Android 11+ üzerinde izin sebebiyle false dönebildiğinden doğrudan openURL çağrılır
    Linking.openURL(phoneUrl).catch(err => {
      console.warn('Arama açılamadı:', err);
      Alert.alert(
        'Arama Başlatılamadı',
        `Lütfen numarayı manuel olarak arayınız:\n${phoneNumber}`
      );
    });
  };

  const handleWhatsApp = () => {
    onClose();
    let waNumber = cleanPhone;
    if (waNumber.startsWith('0')) {
      waNumber = '9' + waNumber;
    } else if (!waNumber.startsWith('90')) {
      waNumber = '90' + waNumber;
    }
    const message = encodeURIComponent(
      `Merhaba ${farmerName}, Çiftçiden uygulamasındaki "${listingTitle}" ilanınız için yazıyorum.`
    );
    Linking.openURL(`whatsapp://send?phone=${waNumber}&text=${message}`).catch(() => {
      Alert.alert('Hata', 'WhatsApp uygulaması açılamadı.');
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.cardContainer}>
          {/* ÜST BAŞLIK */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.phoneIconCircle}>
                <Phone size={20} color="#15803d" />
              </View>
              <Text style={styles.modalTitle}>Arama Yapılsın mı?</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* KULLANICININ İSTEDİĞİ BİLGİ KARTI */}
          <View style={styles.infoCard}>
            {/* 1. ÜSTTE KİŞİ İSMİ */}
            <View style={styles.personRow}>
              <View style={styles.avatarCircle}>
                <User size={18} color="#15803d" />
              </View>
              <View style={styles.personTexts}>
                <Text style={styles.farmerName}>{farmerName}</Text>
                <View style={styles.badgeRow}>
                  <ShieldCheck size={12} color="#15803d" />
                  <Text style={styles.badgeText}>Üretici / İlan Sahibi</Text>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            {/* 2. ALTA İLAN BİLGİSİ */}
            <View style={styles.listingSection}>
              <Text style={styles.listingLabel}>İlan Bilgisi</Text>
              <Text style={styles.listingTitle} numberOfLines={2}>
                {listingTitle}
              </Text>
              <View style={styles.locationRow}>
                <MapPin size={13} color="#64748b" />
                <Text style={styles.locationText} numberOfLines={1}>
                  {listingLocation}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* 3. EN ALTTA DAHA KÜÇÜK OLARAK KİŞİNİN NUMARASI */}
            <View style={styles.phoneSection}>
              <Text style={styles.phoneLabel}>Telefon Numarası</Text>
              <Text style={styles.phoneNumberSmall}>{phoneNumber}</Text>
            </View>
          </View>

          {/* AKSİYON BUTONLARI */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              activeOpacity={0.88}
              style={styles.callNowButton}
              onPress={handleExecuteCall}
            >
              <Phone size={18} color="#ffffff" />
              <Text style={styles.callNowButtonText}>Hemen Ara</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.88}
              style={styles.whatsappAltButton}
              onPress={handleWhatsApp}
            >
              <MessageCircle size={18} color="#15803d" />
              <Text style={styles.whatsappAltButtonText}>WhatsApp'tan Yaz</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Vazgeç</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  phoneIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
  },
  closeBtn: {
    padding: 6,
  },
  infoCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    marginBottom: 18,
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  personTexts: {
    flex: 1,
  },
  farmerName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803d',
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 10,
  },
  listingSection: {
    gap: 3,
  },
  listingLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  listingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  locationText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  phoneSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  phoneLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  phoneNumberSmall: {
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
    letterSpacing: 0.3,
  },
  actionsContainer: {
    gap: 8,
  },
  callNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#15803d',
    paddingVertical: 13,
    borderRadius: 12,
    gap: 8,
  },
  callNowButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },
  whatsappAltButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    paddingVertical: 11,
    borderRadius: 12,
    gap: 8,
  },
  whatsappAltButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#15803d',
  },
  cancelButton: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
});
