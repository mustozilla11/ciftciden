import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, MapPin, AlertTriangle, RefreshCw, X, ChevronDown } from 'lucide-react-native';
import { useListings } from '../../context/ListingContext';
import { ListingCard } from '../../components/ListingCard';
import { CategoryChips } from '../../components/CategoryChips';
import { LocationPickerModal } from '../../components/LocationPickerModal';
import { calculateFreshness } from '../../utils/freshness';

export default function FeedScreen() {
  const {
    listings,
    isLoading,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedCity,
    setSelectedCity,
    refreshListings,
  } = useListings();

  const [isLocationModalVisible, setIsLocationModalVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshListings();
    setIsRefreshing(false);
  };

  // Optimize edilmiş memoized renderItem
  const renderListingItem = useCallback(
    ({ item }: { item: any }) => <ListingCard listing={item} />,
    []
  );

  // Acil tarladan çıkması gereken ilanlar (Kalan süre <= 48 saat)
  const urgentListings = useMemo(() => {
    return listings.filter(item => {
      if (item.status !== 'active') return false;
      const freshness = calculateFreshness(item.harvest_end_date);
      return freshness.isUrgent && !freshness.isExpired;
    });
  }, [listings]);

  // Filtrelenmiş ana liste
  const filteredListings = useMemo(() => {
    return listings.filter(item => {
      // Sadece aktif ilanlar
      if (item.status !== 'active') return false;

      // Kategori filtresi
      if (selectedCategory !== 'Tümü' && item.category !== selectedCategory) {
        return false;
      }

      // Şehir filtresi
      if (selectedCity !== 'Tüm Türkiye' && item.city !== selectedCity) {
        return false;
      }

      // Arama metni (Türkçe karakter duyarlı ve kapsamlı)
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.trim().toLocaleLowerCase('tr-TR');
        const titleMatch = item.title.toLocaleLowerCase('tr-TR').includes(query);
        const descMatch = (item.description || '').toLocaleLowerCase('tr-TR').includes(query);
        const cityMatch = item.city.toLocaleLowerCase('tr-TR').includes(query);
        const districtMatch = item.district.toLocaleLowerCase('tr-TR').includes(query);
        const categoryMatch = item.category.toLocaleLowerCase('tr-TR').includes(query);
        const farmerMatch = (item.profiles?.full_name || '').toLocaleLowerCase('tr-TR').includes(query);
        if (!titleMatch && !descMatch && !cityMatch && !districtMatch && !categoryMatch && !farmerMatch) {
          return false;
        }
      }

      return true;
    });
  }, [listings, selectedCategory, selectedCity, searchQuery]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* ÜST BAR: KONUM VE ÇİFTÇİDEN LOGO */}
      <View style={styles.topBar}>
        <View style={styles.brandContainer}>
          <View style={styles.appTitleBadge}>
            <Text style={styles.appTitleText}>Çiftçiden</Text>
          </View>
          <Text style={styles.appSubtitle}>Tarladan Sofraya Komisyonsuz</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.locationSelectorButton}
          onPress={() => setIsLocationModalVisible(true)}
        >
          <MapPin size={16} color="#15803d" />
          <Text style={styles.locationSelectorText} numberOfLines={1}>
            {selectedCity}
          </Text>
          <ChevronDown size={15} color="#15803d" />
        </TouchableOpacity>
      </View>

      {/* ARAMA ÇUBUĞU */}
      <View style={styles.searchBarContainer}>
        <View style={styles.searchBar}>
          <Search size={18} color="#64748b" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Mahsul adı, çeşit veya bölge ara..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
              <X size={16} color="#64748b" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* YATAY KATEGORİ ÇİPLERİ */}
      <View style={styles.categoriesContainer}>
        <CategoryChips
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </View>

      {/* ANA İLAN AKIŞI FLATLIST */}
      <FlatList
        data={filteredListings}
        keyExtractor={item => item.id}
        renderItem={renderListingItem}
        contentContainerStyle={styles.listContent}
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={5}
        removeClippedSubviews={Platform.OS === 'android'}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#15803d']}
          />
        }
        ListHeaderComponent={
          <>
            {/* ACİL TARLADAN ÇIKMALI VİTRİNİ (Varsa) */}
            {urgentListings.length > 0 && (
              <View style={styles.urgentSection}>
                <View style={styles.urgentHeader}>
                  <View style={styles.urgentTitleRow}>
                    <AlertTriangle size={18} color="#ea580c" />
                    <Text style={styles.urgentTitle}>Acil Tarladan Çıkmalı!</Text>
                  </View>
                  <Text style={styles.urgentSubtitle}>Son 48 saat kalan mahsuller</Text>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.urgentScrollContent}
                >
                  {urgentListings.map(item => (
                    <ListingCard key={item.id} listing={item} horizontal />
                  ))}
                </ScrollView>
              </View>
            )}

            <View style={styles.feedHeader}>
              <Text style={styles.feedTitle}>Tüm Taze Mahsuller</Text>
              <Text style={styles.feedCount}>{filteredListings.length} İlan</Text>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Aradığınız Kriterde İlan Bulunamadı</Text>
            <Text style={styles.emptySubtitle}>
              Filtreleri temizleyerek veya farklı bir il seçerek tekrar deneyebilirsiniz.
            </Text>
            <TouchableOpacity
              style={styles.resetFilterButton}
              onPress={() => {
                setSelectedCategory('Tümü');
                setSelectedCity('Tüm Türkiye');
                setSearchQuery('');
              }}
            >
              <RefreshCw size={16} color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={styles.resetFilterButtonText}>Filtreleri Sıfırla</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* KONUM SEÇİCİ MODAL */}
      <LocationPickerModal
        visible={isLocationModalVisible}
        selectedCity={selectedCity}
        onSelectCity={setSelectedCity}
        onClose={() => setIsLocationModalVisible(false)}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#ffffff',
  },
  brandContainer: {
    flex: 1,
    gap: 3,
  },
  appTitleBadge: {
    backgroundColor: '#15803d', // Zümrüt Yeşili Kutu
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  appTitleText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff', // Beyaz Yazı
    letterSpacing: -0.3,
  },
  appSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    marginLeft: 2,
  },
  locationSelectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#86efac',
    gap: 6,
    maxWidth: 180,
  },
  locationSelectorText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#15803d',
  },
  searchBarContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '500',
  },
  clearSearchBtn: {
    padding: 4,
  },
  categoriesContainer: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  listContent: {
    paddingBottom: 30,
  },
  urgentSection: {
    backgroundColor: '#fff7ed', // Açık turuncu tarla zemin
    paddingVertical: 14,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#fed7aa',
  },
  urgentHeader: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  urgentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  urgentTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#c2410c',
  },
  urgentSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9a3412',
    marginTop: 2,
  },
  urgentScrollContent: {
    paddingLeft: 16,
    paddingRight: 4,
  },
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: 12,
  },
  feedTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  feedCount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  resetFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#15803d',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  resetFilterButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
});
