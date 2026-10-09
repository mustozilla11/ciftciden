import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Sprout,
  CheckCircle2,
  Cloud,
  X,
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';

export default function WelcomeScreen() {
  const router = useRouter();
  const { signInWithGoogle, signInWithApple } = useAuth();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleGoogleLogin = async () => {
    setActionLoading('google');
    try {
      const res = await signInWithGoogle();
      if (res.success) {
        router.replace('/(tabs)');
      }
    } catch {
      Alert.alert('Giriş Yapılamadı', 'Google ile giriş sırasında bir sorun oluştu.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAppleLogin = async () => {
    setActionLoading('apple');
    try {
      const res = await signInWithApple();
      if (res.success) {
        router.replace('/(tabs)');
      }
    } catch {
      Alert.alert('Giriş Yapılamadı', 'iCloud ile giriş sırasında bir sorun oluştu.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* ÜST KAPATMA BUTONU */}
      <View style={styles.topBar}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleClose}
          style={styles.closeBtn}
          accessibilityLabel="Kapat"
        >
          <X size={22} color="#64748b" />
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        {/* ÜST LOGO VE KARŞILAMA BÖLÜMÜ */}
        <View style={styles.brandSection}>
          <View style={styles.logoBadge}>
            <Sprout size={40} color="#15803d" />
          </View>
          <Text style={styles.appTitle}>Çiftçiden</Text>
          <Text style={styles.appSubtitle}>Tarladan Sofraya Komisyonsuz</Text>

          {/* TEMEL GÜVENCE ROZETLERİ */}
          <View style={styles.featuresRow}>
            <View style={styles.featurePill}>
              <CheckCircle2 size={13} color="#15803d" />
              <Text style={styles.featurePillText}>Komisyonsuz</Text>
            </View>
            <View style={styles.featurePill}>
              <CheckCircle2 size={13} color="#15803d" />
              <Text style={styles.featurePillText}>Aracısız</Text>
            </View>
            <View style={styles.featurePill}>
              <CheckCircle2 size={13} color="#15803d" />
              <Text style={styles.featurePillText}>Doğrudan Üreticiden</Text>
            </View>
          </View>
        </View>

        {/* ORTA VİZYON KARTI */}
        <View style={styles.visionCard}>
          <Text style={styles.visionText}>
            Üretici çiftçilerimiz ile toptancı, manav, restoran ve tüketicileri doğrudan buluşturan modern tarım pazarı.
          </Text>
        </View>

        {/* GİRİŞ BUTONLARI (SADECE GOOGLE VE ICLOUD) */}
        <View style={styles.buttonsContainer}>
          {/* 1. GOOGLE İLE DEVAM ET */}
          <TouchableOpacity
            activeOpacity={0.88}
            style={styles.googleButton}
            onPress={handleGoogleLogin}
            disabled={!!actionLoading}
          >
            {actionLoading === 'google' ? (
              <ActivityIndicator color="#ea4335" />
            ) : (
              <>
                <View style={styles.googleIconBadge}>
                  <Text style={styles.googleIconText}>G</Text>
                </View>
                <Text style={styles.googleButtonText}>Google ile Devam Et</Text>
              </>
            )}
          </TouchableOpacity>

          {/* 2. ICLOUD İLE DEVAM ET */}
          <TouchableOpacity
            activeOpacity={0.88}
            style={styles.appleButton}
            onPress={handleAppleLogin}
            disabled={!!actionLoading}
          >
            {actionLoading === 'apple' ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Cloud size={20} color="#ffffff" style={styles.cloudIcon} />
                <Text style={styles.appleButtonText}>iCloud ile Devam Et</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* ALT GÜVENLİK VE GİZLİLİK BİLGİSİ */}
        <View style={styles.footerNote}>
          <Text style={styles.footerNoteText}>
            Giriş yaparak Kullanım Koşulları ve KVKK Aydınlatma Metni'ni kabul etmiş olursunuz.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingBottom: 24,
    paddingTop: 8,
  },
  brandSection: {
    alignItems: 'center',
    marginTop: 10,
  },
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#86efac',
    marginBottom: 14,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#15803d',
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
    marginTop: 4,
  },
  featuresRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  featurePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534',
  },
  visionCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginVertical: 12,
  },
  visionText: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500',
  },
  buttonsContainer: {
    gap: 14,
    marginVertical: 16,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderRadius: 14,
    gap: 10,
  },
  googleIconBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIconText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#ea4335',
  },
  googleButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
  },
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a',
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderRadius: 14,
    gap: 10,
  },
  cloudIcon: {
    marginRight: 2,
  },
  appleButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  footerNote: {
    alignItems: 'center',
    marginTop: 10,
  },
  footerNoteText: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 16,
  },
});
