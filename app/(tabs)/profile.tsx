import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  StatusBar,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  User,
  CalendarPlus,
  CheckCircle2,
  Trash2,
  PlusCircle,
  MapPin,
  Phone,
  ShieldCheck,
  AlertCircle,
  MessageSquarePlus,
  Coffee,
  Heart,
  LogIn,
  LogOut,
} from 'lucide-react-native';
import { useListings } from '../../context/ListingContext';
import { useAuth } from '../../context/AuthContext';
import { FreshnessBadge } from '../../components/FreshnessBadge';
import { formatPrice, formatQuantity, calculateFreshness } from '../../utils/freshness';
import { FeedbackModal } from '../../components/FeedbackModal';
import { SupportCoffeeModal } from '../../components/SupportCoffeeModal';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, profile, isAuthenticated, signOut } = useAuth();
  const { listings, extendListingDeadline, markListingAsSold, deleteListing } = useListings();

  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  const [isFeedbackModalVisible, setIsFeedbackModalVisible] = useState(false);
  const [isCoffeeModalVisible, setIsCoffeeModalVisible] = useState(false);

  // Kullanıcının ilanları (demo ortamında oluşturulan tüm ilanlar veya farmer-1)
  const userListings = useMemo(() => {
    return listings.filter(l => l.user_id === 'current-farmer' || l.user_id === 'farmer-1');
  }, [listings]);

  const activeUserListings = useMemo(() => {
    return userListings.filter(l => l.status === 'active');
  }, [userListings]);

  const archivedUserListings = useMemo(() => {
    return userListings.filter(l => l.status === 'sold' || l.status === 'expired');
  }, [userListings]);

  const displayList = activeTab === 'active' ? activeUserListings : archivedUserListings;

  const handleExtend = (id: string, title: string) => {
    Alert.alert(
      'Hasat Süresini Uzat',
      `"${title}" için hasat bitiş tarihini 3 gün uzatmak istiyor musunuz?`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: '+3 Gün Uzat',
          onPress: () => extendListingDeadline(id, 3),
        },
      ]
    );
  };

  const handleMarkSold = (id: string, title: string) => {
    Alert.alert(
      'Satıldı Olarak İşaretle',
      `"${title}" mahsulünüz tamamen satıldı mı? Vitrinden kaldırılıp arşive alınacaktır.`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Satıldı',
          style: 'default',
          onPress: () => markListingAsSold(id),
        },
      ]
    );
  };

  const handleDelete = (id: string, title: string) => {
    Alert.alert(
      'İlanı Sil',
      `"${title}" ilanını silmek istediğinize emin misiniz?`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => deleteListing(id),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* ÜST BAR VE ZARİF SARI DESTEK ÇIKINTISI */}
      {/* YUKARIDAN SABİTLENMİŞ SARI ASILI SEKME / DESTEK ÇIKINTISI */}
      <View style={styles.pinnedBarContainer}>
        <View style={styles.supportMiniBar}>
          <TouchableOpacity
            activeOpacity={0.75}
            style={styles.miniBarHalf}
            onPress={() => setIsCoffeeModalVisible(true)}
          >
            <Coffee size={13} color="#92400e" />
            <Text style={styles.miniBarText}>Geliştiriciyi Destekle ☕</Text>
          </TouchableOpacity>

          <View style={styles.miniBarDivider} />

          <TouchableOpacity
            activeOpacity={0.75}
            style={styles.miniBarHalf}
            onPress={() => setIsFeedbackModalVisible(true)}
          >
            <MessageSquarePlus size={13} color="#92400e" />
            <Text style={styles.miniBarText}>Geri Bildirim Yap</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ÜST BAŞLIK BARI */}
      <View style={styles.topBar}>
        <Text style={styles.screenTitle}>Profil & İlanlarım</Text>
      </View>

      {/* PROFİL BAŞLIK VE KART VEYA MİSAFİR ÇAĞRISI */}
      {!isAuthenticated ? (
        <View style={styles.guestCard}>
          <View style={styles.guestIconCircle}>
            <User size={26} color="#15803d" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.guestTitle}>Misafir Olarak Geziyorsunuz</Text>
            <Text style={styles.guestSubtitle}>
              İlanlarınızı yönetmek ve tarladan satış yapmak için hızlıca giriş yapın.
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.guestLoginBtn}
            onPress={() => router.push('/auth/welcome')}
          >
            <LogIn size={18} color="#ffffff" />
            <Text style={styles.guestLoginBtnText}>Giriş Yap</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.profileHeader}>
          <View style={styles.profileInfoRow}>
            <View style={styles.avatarContainer}>
              <User size={32} color="#15803d" />
            </View>
            <View style={styles.profileTexts}>
              <View style={styles.nameRow}>
                <Text style={styles.farmerName}>{profile?.full_name || 'Üretici'}</Text>
                <View style={styles.verifiedBadge}>
                  <ShieldCheck size={12} color="#15803d" />
                  <Text style={styles.verifiedBadgeText}>Doğrulanmış Üretici</Text>
                </View>
              </View>
              <View style={styles.detailsRow}>
                <MapPin size={13} color="#64748b" />
                <Text style={styles.detailText}>
                  {profile?.city || 'Antalya'}, {profile?.district || 'Kumluca'} (Sera Üretimi)
                </Text>
              </View>
              <View style={styles.detailsRow}>
                <Phone size={13} color="#64748b" />
                <Text style={styles.detailText}>{profile?.phone_number || '0532 123 45 67'}</Text>
              </View>
            </View>

            {/* ÇIKIŞ YAP BUTONU */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.logoutBtn}
              onPress={() => {
                Alert.alert(
                  'Çıkış Yap',
                  'Hesabınızdan çıkış yapmak istiyor musunuz?',
                  [
                    { text: 'Vazgeç', style: 'cancel' },
                    { text: 'Çıkış Yap', style: 'destructive', onPress: signOut },
                  ]
                );
              }}
            >
              <LogOut size={16} color="#ef4444" />
            </TouchableOpacity>
          </View>

          {/* İSTATİSTİK SAYACI */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{activeUserListings.length}</Text>
              <Text style={styles.statLabel}>Aktif İlan</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>
                {userListings.filter(l => l.status === 'sold').length}
              </Text>
              <Text style={styles.statLabel}>Satılan Mahsul</Text>
            </View>
          </View>
        </View>
      )}

      {/* SEKME SEÇİCİ */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'active' && styles.tabButtonActive]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'active' && styles.tabButtonTextActive]}>
            Aktif İlanlarım ({activeUserListings.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'archived' && styles.tabButtonActive]}
          onPress={() => setActiveTab('archived')}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'archived' && styles.tabButtonTextActive,
            ]}
          >
            Satılanlar & Bitenler ({archivedUserListings.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* İLAN LİSTESİ */}
      <FlatList
        data={displayList}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={5}
        removeClippedSubviews={Platform.OS === 'android'}
        renderItem={({ item }) => {
          const imageUrl = item.images && item.images.length > 0
            ? item.images[0]
            : 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=1280&q=80';

          return (
            <View style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <Image source={{ uri: imageUrl }} style={styles.itemThumb} />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={styles.itemPrice}>
                    {formatPrice(item.price_per_unit, item.unit)}
                  </Text>
                  <Text style={styles.itemQty}>
                    Miktar: {formatQuantity(item.quantity, item.unit)}
                  </Text>
                  <View style={{ marginTop: 4 }}>
                    <FreshnessBadge harvestEndDate={item.harvest_end_date} size="sm" />
                  </View>
                </View>
              </View>

              {/* HIZLI ÇİFTÇİ AKSİYONLARI */}
              <View style={styles.actionButtonsRow}>
                {item.status === 'active' ? (
                  <>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={[styles.actionBtn, styles.extendBtn]}
                      onPress={() => handleExtend(item.id, item.title)}
                    >
                      <CalendarPlus size={15} color="#15803d" />
                      <Text style={styles.extendBtnText}>Süre Uzat (+3G)</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={[styles.actionBtn, styles.soldBtn]}
                      onPress={() => handleMarkSold(item.id, item.title)}
                    >
                      <CheckCircle2 size={15} color="#ffffff" />
                      <Text style={styles.soldBtnText}>Satıldı Olarak İşaretle</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <View style={styles.archivedStatusRow}>
                    <Text style={styles.archivedStatusText}>
                      Durum: {item.status === 'sold' ? 'Satıldı ✓' : 'Süresi Doldu'}
                    </Text>
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => handleDelete(item.id, item.title)}
                    >
                      <Trash2 size={16} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <AlertCircle size={40} color="#94a3b8" />
            <Text style={styles.emptyTitle}>
              {activeTab === 'active' ? 'Henüz aktif ilanınız yok' : 'Arşivlenmiş ilan yok'}
            </Text>
            <Text style={styles.emptySubtitle}>
              Tarladaki mahsullerinizi komisyonsuz doğrudan alıcılarla buluşturmak için yeni ilan açın.
            </Text>
            <TouchableOpacity
              style={styles.newListingBtn}
              onPress={() => router.push('/(tabs)/create-listing')}
            >
              <PlusCircle size={18} color="#ffffff" />
              <Text style={styles.newListingBtnText}>Hemen İlan Ver</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* GERİ BİLDİRİM VE DESTEK MODALLARI */}
      <FeedbackModal
        visible={isFeedbackModalVisible}
        onClose={() => setIsFeedbackModalVisible(false)}
      />

      <SupportCoffeeModal
        visible={isCoffeeModalVisible}
        onClose={() => setIsCoffeeModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  guestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    gap: 12,
  },
  guestIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  guestSubtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
    lineHeight: 15,
  },
  guestLoginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#15803d',
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 12,
    gap: 6,
    ...Platform.select({
      ios: {
        shadowColor: '#15803d',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  guestLoginBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
  logoutBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
    alignSelf: 'flex-start',
  },
  profileHeader: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  profileInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileTexts: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  farmerName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  verifiedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803d',
  },
  noCommissionBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#86efac',
  },
  noCommissionBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803d',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  detailText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: '#15803d',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#cbd5e1',
  },
  noCommissionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginTop: 12,
  },
  noCommissionBannerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803d',
  },
  pinnedBarContainer: {
    backgroundColor: '#ffffff',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 0,
    zIndex: 10,
  },
  topBar: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
  },
  supportMiniBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7', // Bal sarısı / sıcak amber
    borderWidth: 1.5,
    borderColor: '#f59e0b',
    borderTopWidth: 0, // Tavandan asılı / yukarıdan sabitlenmiş
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    paddingVertical: 7,
    paddingHorizontal: 12,
    width: '100%',
    ...Platform.select({
      ios: {
        shadowColor: '#b45309',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.16,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  miniBarHalf: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  miniBarDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#fcd34d',
  },
  miniBarText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400e',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: '#15803d',
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },
  tabButtonTextActive: {
    color: '#15803d',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  itemCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  itemHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  itemThumb: {
    width: 76,
    height: 76,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '900',
    color: '#15803d',
  },
  itemQty: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 8,
    gap: 6,
  },
  extendBtn: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#86efac',
  },
  extendBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#15803d',
  },
  soldBtn: {
    backgroundColor: '#15803d',
  },
  soldBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
  },
  archivedStatusRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  archivedStatusText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },
  deleteBtn: {
    padding: 6,
  },
  emptyContainer: {
    padding: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
    marginTop: 12,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
  },
  newListingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#15803d',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  newListingBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14,
  },
});
