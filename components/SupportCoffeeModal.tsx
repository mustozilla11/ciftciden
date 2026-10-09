import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import {
  X,
  Coffee,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Sparkles,
} from 'lucide-react-native';

interface SupportTeaModalProps {
  visible: boolean;
  onClose: () => void;
}

interface TeaTier {
  id: string;
  title: string;
  description: string;
  netAmount: number; // Geliştiriciye kalan net tutar
  popular?: boolean;
}

const TEA_TIERS: TeaTier[] = [
  {
    id: 'cup',
    title: '1 Bardak İnce Belli Çay',
    description: 'Küçük ama çok değerli bir moral desteği',
    netAmount: 50,
  },
  {
    id: 'pot',
    title: '1 Demlik Semaver Çayı',
    description: 'Tarla sohbetlerinin vazgeçilmez demliği',
    netAmount: 100,
    popular: true,
  },
  {
    id: 'pack',
    title: '1 Paket Kuru Çay',
    description: 'Ofiste ve tarlada demleyip içmelik hakiki çay desteği',
    netAmount: 250,
  },
];

const STORE_COMMISSION_RATE = 0.15; // Aracı %15 kesintisi

export const SupportCoffeeModal: React.FC<SupportTeaModalProps> = ({ visible, onClose }) => {
  const [selectedTierId, setSelectedTierId] = useState<string>('pot');
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedTier = TEA_TIERS.find(t => t.id === selectedTierId) || TEA_TIERS[1];
  const commission = Math.round(selectedTier.netAmount * STORE_COMMISSION_RATE);
  const totalAmount = selectedTier.netAmount + commission;

  const handlePurchase = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      Alert.alert(
        'Çayınız İçin Çok Teşekkürler! ☕',
        `${totalAmount} ₺ (Net: ${selectedTier.netAmount} ₺ + %15 Aracı Komisyonu: ${commission} ₺) bağış simülasyonu başarıyla gerçekleşti. Afiyet olsun!`,
        [{ text: 'Afiyet Olsun', onPress: onClose }]
      );
    }, 700);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.sheetContainer}>
          {/* BAŞLIK */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={styles.teaIconCircle}>
                <Coffee size={22} color="#b45309" />
              </View>
              <Text style={styles.title}>Geliştiriciye Çay Ismarla ☕</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={22} color="#475569" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.subtitle}>
              Çiftçiden tamamen komisyonsuz bir platformdur. Yazılımcımıza demli bir çay ısmarlayarak sunucu masraflarına ve yeni özelliklere katkıda bulunabilirsiniz.
            </Text>

            {/* ÇAY SEÇENEKLERİ */}
            <View style={styles.tiersContainer}>
              {TEA_TIERS.map(tier => {
                const isSelected = selectedTierId === tier.id;
                const tierCommission = Math.round(tier.netAmount * STORE_COMMISSION_RATE);
                const tierTotal = tier.netAmount + tierCommission;

                return (
                  <TouchableOpacity
                    key={tier.id}
                    activeOpacity={0.88}
                    onPress={() => setSelectedTierId(tier.id)}
                    style={[
                      styles.tierCard,
                      isSelected && styles.tierCardActive,
                    ]}
                  >
                    <View style={styles.tierRadio}>
                      {isSelected ? (
                        <View style={styles.radioDotInner} />
                      ) : null}
                    </View>

                    <View style={styles.tierInfo}>
                      <View style={styles.tierTitleRow}>
                        <Text style={styles.tierTitle}>{tier.title}</Text>
                        {tier.popular && (
                          <View style={styles.popularBadge}>
                            <Text style={styles.popularBadgeText}>En Çok Ismarlanan</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.tierDesc}>{tier.description}</Text>
                      <Text style={styles.breakdownSmall}>
                        Geliştiriciye: {tier.netAmount} ₺ + Aracı Komisyonu: {tierCommission} ₺
                      </Text>
                    </View>

                    <View style={styles.priceContainer}>
                      <Text style={[styles.totalPriceText, isSelected && styles.totalPriceTextActive]}>
                        {tierTotal} ₺
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* SEÇİLEN TUTAR VE %15 ARACI KOMİSYON AYRINTISI */}
            <View style={styles.commissionBreakdownCard}>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Geliştiriciye Ulaşan Çay Bedeli:</Text>
                <Text style={styles.breakdownValue}>{selectedTier.netAmount} ₺</Text>
              </View>

              <View style={styles.breakdownRow}>
                <View style={styles.storeCommissionLabelRow}>
                  <Text style={styles.breakdownLabel}>Aracı Komisyonu (%15):</Text>
                </View>
                <Text style={styles.breakdownValueStore}>+{commission} ₺</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.breakdownRow}>
                <Text style={styles.totalLabel}>Toplam Ödenecek Tutar:</Text>
                <Text style={styles.totalValue}>{totalAmount} ₺</Text>
              </View>
            </View>

            {/* GÜVENLİK NOTU */}
            <View style={styles.securityNote}>
              <ShieldCheck size={18} color="#15803d" />
              <Text style={styles.securityNoteText}>
                Tüm işlemler resmi güvenli ödeme altyapısı üzerinden tahsil edilir.
              </Text>
            </View>

            {/* ÇAY ISMARLA BUTONU */}
            <TouchableOpacity
              activeOpacity={0.88}
              style={styles.purchaseButton}
              onPress={handlePurchase}
              disabled={isProcessing}
            >
              <Coffee size={20} color="#ffffff" />
              <Text style={styles.purchaseButtonText}>
                {totalAmount} ₺ ile Çay Ismarla ☕
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  teaIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    padding: 20,
    paddingBottom: 36,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 19,
    marginBottom: 16,
  },
  tiersContainer: {
    gap: 10,
    marginBottom: 16,
  },
  tierCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    gap: 12,
  },
  tierCardActive: {
    borderColor: '#b45309', // Çay tonu
    backgroundColor: '#fffbeb',
  },
  tierRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#b45309',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#b45309',
  },
  tierInfo: {
    flex: 1,
  },
  tierTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  tierTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  popularBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  popularBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#b45309',
  },
  tierDesc: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  breakdownSmall: {
    fontSize: 11,
    color: '#92400e',
    fontWeight: '600',
    marginTop: 4,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  totalPriceText: {
    fontSize: 17,
    fontWeight: '900',
    color: '#475569',
  },
  totalPriceTextActive: {
    color: '#b45309',
  },
  commissionBreakdownCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 14,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  breakdownLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  storeCommissionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  breakdownValueStore: {
    fontSize: 14,
    fontWeight: '800',
    color: '#c2410c',
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0f172a',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#b45309',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    marginBottom: 16,
    gap: 8,
  },
  securityNoteText: {
    flex: 1,
    fontSize: 11,
    color: '#166534',
    fontWeight: '600',
    lineHeight: 16,
  },
  purchaseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#b45309', // Çay amber rengi
    paddingVertical: 15,
    borderRadius: 12,
    gap: 8,
  },
  purchaseButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },
});
