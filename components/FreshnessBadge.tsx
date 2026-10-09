import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Clock, AlertTriangle, CheckCircle2 } from 'lucide-react-native';
import { calculateFreshness } from '../utils/freshness';

interface FreshnessBadgeProps {
  harvestEndDate: string;
  size?: 'sm' | 'md' | 'lg';
}

export const FreshnessBadge: React.FC<FreshnessBadgeProps> = ({
  harvestEndDate,
  size = 'md',
}) => {
  const freshness = calculateFreshness(harvestEndDate);

  const getBadgeStyles = () => {
    switch (freshness.badgeVariant) {
      case 'urgent':
        return {
          container: styles.urgentContainer,
          text: styles.urgentText,
          iconColor: '#c2410c', // Koyu turuncu/kırmızı
          Icon: AlertTriangle,
        };
      case 'expired':
        return {
          container: styles.expiredContainer,
          text: styles.expiredText,
          iconColor: '#64748b',
          Icon: Clock,
        };
      case 'fresh':
      default:
        return {
          container: styles.freshContainer,
          text: styles.freshText,
          iconColor: '#15803d', // Zümrüt yeşili
          Icon: CheckCircle2,
        };
    }
  };

  const { container, text, iconColor, Icon } = getBadgeStyles();
  const iconSize = size === 'sm' ? 12 : size === 'lg' ? 18 : 14;

  return (
    <View style={[styles.base, container, size === 'sm' && styles.sm, size === 'lg' && styles.lg]}>
      <Icon size={iconSize} color={iconColor} style={{ marginRight: 5 }} />
      <Text style={[styles.baseText, text, size === 'sm' && styles.smText, size === 'lg' && styles.lgText]}>
        {freshness.badgeText}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  baseText: {
    fontWeight: '700',
    fontSize: 12,
  },
  sm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  smText: {
    fontSize: 11,
  },
  lg: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  lgText: {
    fontSize: 14,
  },
  freshContainer: {
    backgroundColor: '#dcfce7', // Yeşil açık zemin
    borderWidth: 1,
    borderColor: '#86efac',
  },
  freshText: {
    color: '#14532d', // Yüksek kontrastlı koyu zümrüt
  },
  urgentContainer: {
    backgroundColor: '#ffedd5', // Turuncu/Kırmızı açık zemin
    borderWidth: 1.5,
    borderColor: '#f97316',
  },
  urgentText: {
    color: '#9a3412', // Koyu amber / kırmızı
  },
  expiredContainer: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  expiredText: {
    color: '#475569',
  },
});
