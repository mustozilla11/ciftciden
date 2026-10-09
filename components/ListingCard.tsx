import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, Truck, Check } from 'lucide-react-native';
import { Listing } from '../types/database';
import { FreshnessBadge } from './FreshnessBadge';
import { formatPrice, formatQuantity } from '../utils/freshness';

interface ListingCardProps {
  listing: Listing;
  horizontal?: boolean;
}

export const ListingCard = React.memo(({ listing, horizontal = false }: ListingCardProps) => {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/listing/${listing.id}`);
  };

  const imageUrl = listing.images && listing.images.length > 0
    ? listing.images[0]
    : 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=1280&q=80';

  if (horizontal) {
    return (
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={handlePress}
        style={styles.horizontalCard}
      >
        <Image source={{ uri: imageUrl }} style={styles.horizontalImage} />
        <View style={styles.horizontalBadgeOverlay}>
          <FreshnessBadge harvestEndDate={listing.harvest_end_date} size="sm" />
        </View>
        <View style={styles.horizontalContent}>
          <Text style={styles.horizontalTitle} numberOfLines={1}>
            {listing.title}
          </Text>
          <Text style={styles.horizontalPrice}>
            {formatPrice(listing.price_per_unit, listing.unit)}
          </Text>
          <View style={styles.locationRow}>
            <MapPin size={13} color="#4b5563" />
            <Text style={styles.locationText} numberOfLines={1}>
              {listing.city}, {listing.district}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={handlePress}
      style={styles.card}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUrl }} style={styles.cardImage} />
        <View style={styles.badgeOverlay}>
          <FreshnessBadge harvestEndDate={listing.harvest_end_date} />
        </View>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>{listing.category}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={2}>
            {listing.title}
          </Text>
        </View>

        <View style={styles.priceRow}>
          <View>
            <Text style={styles.priceLabel}>Birim Fiyat</Text>
            <Text style={styles.priceValue}>
              {formatPrice(listing.price_per_unit, listing.unit)}
            </Text>
          </View>
          <View style={styles.quantityBox}>
            <Text style={styles.quantityLabel}>Mevcut Mahsul</Text>
            <Text style={styles.quantityValue}>
              {formatQuantity(listing.quantity, listing.unit)}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.footerRow}>
          <View style={styles.locationRow}>
            <MapPin size={15} color="#15803d" />
            <Text style={styles.locationText}>
              {listing.city}, {listing.district}
            </Text>
          </View>

          <View style={styles.deliveryBadge}>
            <Truck size={13} color="#78350f" style={{ marginRight: 4 }} />
            <Text style={styles.deliveryBadgeText}>{listing.delivery_type}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)',
      },
    }),
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 190,
    backgroundColor: '#f1f5f9',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  badgeOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  titleRow: {
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    lineHeight: 24,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  priceValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#15803d', // Zümrüt Yeşili
  },
  quantityBox: {
    alignItems: 'flex-end',
  },
  quantityLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  quantityValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#334155',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginBottom: 12,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginLeft: 4,
  },
  deliveryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  deliveryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#78350f',
  },
  // Horizontal mini card ("Acil Tarladan Çıkmalı" vitrini için)
  horizontalCard: {
    width: 220,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#fed7aa', // Turuncu/Acil hat
    overflow: 'hidden',
  },
  horizontalImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  horizontalBadgeOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
  },
  horizontalContent: {
    padding: 10,
  },
  horizontalTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  horizontalPrice: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ea580c',
    marginBottom: 6,
  },
});
