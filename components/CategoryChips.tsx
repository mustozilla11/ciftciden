import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { CATEGORIES } from '../constants/mockData';
import { ProductCategory } from '../types/database';

interface CategoryChipsProps {
  selectedCategory: ProductCategory | 'Tümü';
  onSelectCategory: (category: ProductCategory | 'Tümü') => void;
}

export const CategoryChips = React.memo(({
  selectedCategory,
  onSelectCategory,
}: CategoryChipsProps) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {CATEGORIES.map(category => {
        const isSelected = selectedCategory === category;
        return (
          <TouchableOpacity
            key={category}
            activeOpacity={0.75}
            onPress={() => onSelectCategory(category as ProductCategory | 'Tümü')}
            style={[styles.chip, isSelected && styles.activeChip]}
          >
            <Text style={[styles.chipText, isSelected && styles.activeChipText]}>
              {category}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  activeChip: {
    backgroundColor: '#15803d', // Zümrüt Yeşili
    borderColor: '#166534',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  activeChipText: {
    color: '#ffffff',
  },
});
