import React, { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, MapPin, Check, Search } from 'lucide-react-native';
import { TURKEY_CITIES } from '../constants/mockData';

interface LocationPickerModalProps {
  visible: boolean;
  selectedCity: string;
  onSelectCity: (city: string) => void;
  onClose: () => void;
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  visible,
  selectedCity,
  onSelectCity,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCities = useMemo(() => {
    if (!searchQuery.trim()) return TURKEY_CITIES;
    const q = searchQuery.trim().toLocaleLowerCase('tr-TR');
    return TURKEY_CITIES.filter(city =>
      city.toLocaleLowerCase('tr-TR').includes(q)
    );
  }, [searchQuery]);

  const handleClose = () => {
    setSearchQuery('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={handleClose}
        />
        <SafeAreaView style={styles.container} edges={['bottom']}>
          {/* BAŞLIK VE KAPAT BUTONU */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <MapPin size={22} color="#15803d" />
              <Text style={styles.title}>Bölge / İl Seçin (81 İl)</Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={22} color="#334155" />
            </TouchableOpacity>
          </View>

          {/* İL ARAMA ÇUBUĞU */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Search size={18} color="#64748b" />
              <TextInput
                style={styles.searchInput}
                placeholder="İl ara... (Örn: Sivas, Bursa, Trabzon)"
                placeholderTextColor="#94a3b8"
                value={searchQuery}
                onChangeText={setSearchQuery}
                clearButtonMode="while-editing"
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
                  <X size={16} color="#64748b" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* 81 İL LİSTESİ */}
          <FlatList
            data={filteredCities}
            keyExtractor={item => item}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const isSelected = selectedCity === item;
              const isAllTurkey = item === 'Tüm Türkiye';

              return (
                <TouchableOpacity
                  style={[
                    styles.cityItem,
                    isAllTurkey && styles.allTurkeyItem,
                    isSelected && styles.selectedCityItem,
                  ]}
                  onPress={() => {
                    onSelectCity(item);
                    handleClose();
                  }}
                >
                  <Text
                    style={[
                      styles.cityText,
                      isAllTurkey && styles.allTurkeyText,
                      isSelected && styles.selectedCityText,
                    ]}
                  >
                    {item}
                  </Text>
                  {isSelected && <Check size={20} color="#15803d" />}
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>"{searchQuery}" adında bir il bulunamadı.</Text>
              </View>
            }
          />
        </SafeAreaView>
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
  container: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '82%',
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
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  closeButton: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 4,
  },
  listContent: {
    paddingVertical: 4,
  },
  cityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  allTurkeyItem: {
    backgroundColor: '#f0fdf4',
    borderBottomColor: '#bbf7d0',
    borderBottomWidth: 1.5,
  },
  allTurkeyText: {
    fontWeight: '900',
    color: '#15803d',
  },
  selectedCityItem: {
    backgroundColor: '#ecfdf5',
  },
  cityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  selectedCityText: {
    color: '#15803d',
    fontWeight: '800',
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '600',
  },
});
