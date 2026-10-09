import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Phone, ShieldCheck, CheckCircle2, RotateCw } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';

export default function VerifyPhoneScreen() {
  const router = useRouter();
  const { sendPhoneOtp, verifyPhoneOtp } = useAuth();

  // Akış Durumu: 'phone' (numara girme) veya 'otp' (kod girme)
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [isLoading, setIsLoading] = useState(false);

  const otpInputRef = useRef<TextInput>(null);

  // Geri sayım sayacı
  useEffect(() => {
    let timer: any;
    if (step === 'otp' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  // Telefon numarasını biçimlendirme: (5XX) XXX XX XX
  const formatPhoneNumber = (input: string) => {
    const cleaned = input.replace(/\D/g, '');
    let formatted = cleaned;
    if (cleaned.length > 0) {
      if (cleaned.startsWith('0')) {
        formatted = cleaned.substring(1);
      }
      if (formatted.length <= 3) {
        return formatted;
      } else if (formatted.length <= 6) {
        return `(${formatted.slice(0, 3)}) ${formatted.slice(3)}`;
      } else if (formatted.length <= 8) {
        return `(${formatted.slice(0, 3)}) ${formatted.slice(3, 6)} ${formatted.slice(6)}`;
      } else {
        return `(${formatted.slice(0, 3)}) ${formatted.slice(3, 6)} ${formatted.slice(6, 8)} ${formatted.slice(8, 10)}`;
      }
    }
    return '';
  };

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    setPhone(formatted);
  };

  // 1. Kod Gönder
  const handleSendCode = async () => {
    const clean = phone.replace(/\D/g, '');
    if (clean.length < 10) {
      Alert.alert('Geçersiz Numara', 'Lütfen 10 haneli cep telefonu numaranızı giriniz (örn: 532 123 45 67).');
      return;
    }

    setIsLoading(true);
    try {
      const res = await sendPhoneOtp(clean);
      if (res.success) {
        setStep('otp');
        setCountdown(60);
        setTimeout(() => {
          otpInputRef.current?.focus();
        }, 200);
      } else {
        Alert.alert('Hata', res.message || 'Kod gönderilemedi.');
      }
    } catch {
      Alert.alert('Hata', 'SMS gönderimi sırasında bir sorun oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Kodu Doğrula
  const handleVerifyCode = async () => {
    if (otpCode.length < 6) {
      Alert.alert('Eksik Kod', 'Lütfen gelen 6 haneli doğrulama kodunu eksiksiz giriniz.');
      return;
    }

    setIsLoading(true);
    try {
      const clean = phone.replace(/\D/g, '');
      const res = await verifyPhoneOtp(clean, otpCode);
      if (res.success) {
        router.replace('/(tabs)');
      } else {
        Alert.alert('Hata', res.message || 'Hatalı kod girdiniz.');
      }
    } catch {
      Alert.alert('Hata', 'Doğrulama sırasında bir sorun oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  // Yeniden Kod Gönder
  const handleResendCode = async () => {
    if (countdown > 0) return;
    const clean = phone.replace(/\D/g, '');
    setIsLoading(true);
    await sendPhoneOtp(clean);
    setIsLoading(false);
    setCountdown(60);
    Alert.alert('Bilgi', 'Yeni doğrulama kodu SMS ile gönderildi.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* GERİ DÖN BUTONU */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => {
              if (step === 'otp') {
                setStep('phone');
              } else {
                router.back();
              }
            }}
          >
            <ArrowLeft size={22} color="#0f172a" />
          </TouchableOpacity>

          {step === 'phone' ? (
            /* ADIM 1: TELEFON NUMARASI GİRİŞİ */
            <View style={styles.content}>
              <View style={styles.iconCircle}>
                <Phone size={28} color="#15803d" />
              </View>

              <Text style={styles.title}>Telefon Numarası</Text>
              <Text style={styles.subtitle}>
                Şifresiz ve güvenli giriş için cep telefonu numaranızı girin. Size 6 haneli bir SMS onay kodu göndereceğiz.
              </Text>

              <View style={styles.inputContainer}>
                <View style={styles.countryCodeBadge}>
                  <Text style={styles.countryFlag}>🇹🇷</Text>
                  <Text style={styles.countryCodeText}>+90</Text>
                </View>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="(5XX) XXX XX XX"
                  placeholderTextColor="#94a3b8"
                  keyboardType="phone-pad"
                  maxLength={15}
                  value={phone}
                  onChangeText={handlePhoneChange}
                  autoFocus={true}
                />
              </View>

              <TouchableOpacity
                activeOpacity={0.88}
                style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
                onPress={handleSendCode}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.primaryButtonText}>Doğrulama Kodu Gönder</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            /* ADIM 2: 6 HANELİ SMS ONAY KODU */
            <View style={styles.content}>
              <View style={styles.iconCircle}>
                <ShieldCheck size={28} color="#15803d" />
              </View>

              <Text style={styles.title}>SMS Kodu Doğrulama</Text>
              <Text style={styles.subtitle}>
                +90 {phone} numarasına gönderilen 6 haneli kodu giriniz.
              </Text>

              <TouchableOpacity onPress={() => setStep('phone')} style={styles.changePhoneBtn}>
                <Text style={styles.changePhoneBtnText}>Numarayı Değiştir</Text>
              </TouchableOpacity>

              {/* 6 HANELİ KOD GİRİŞİ */}
              <View style={styles.otpBoxesRow}>
                {[0, 1, 2, 3, 4, 5].map(idx => {
                  const char = otpCode[idx] || '';
                  const isCurrent = otpCode.length === idx;
                  return (
                    <View
                      key={idx}
                      style={[
                        styles.otpBox,
                        char ? styles.otpBoxFilled : null,
                        isCurrent ? styles.otpBoxActive : null,
                      ]}
                    >
                      <Text style={styles.otpBoxText}>{char}</Text>
                    </View>
                  );
                })}
              </View>

              {/* GİZLİ INPUT (TÜM KLAVYE GİRDİSİNİ ALIR) */}
              <TextInput
                ref={otpInputRef}
                style={styles.hiddenInput}
                keyboardType="number-pad"
                maxLength={6}
                value={otpCode}
                onChangeText={setOtpCode}
              />

              <TouchableOpacity
                activeOpacity={0.88}
                style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
                onPress={handleVerifyCode}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.primaryButtonText}>Girişi Tamamla</Text>
                )}
              </TouchableOpacity>

              {/* TEKRAR GÖNDER */}
              <View style={styles.resendContainer}>
                {countdown > 0 ? (
                  <Text style={styles.countdownText}>
                    Kodu tekrar gönderebilirsiniz: {countdown}s
                  </Text>
                ) : (
                  <TouchableOpacity
                    onPress={handleResendCode}
                    style={styles.resendBtn}
                    disabled={isLoading}
                  >
                    <RotateCw size={14} color="#15803d" />
                    <Text style={styles.resendBtnText}>Kodu Tekrar Gönder</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    padding: 24,
    paddingTop: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  content: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#86efac',
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 14,
    marginBottom: 20,
    overflow: 'hidden',
  },
  countryCodeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: '#f1f5f9',
    borderRightWidth: 1,
    borderRightColor: '#e2e8f0',
    gap: 6,
  },
  countryFlag: {
    fontSize: 16,
  },
  countryCodeText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#15803d',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  changePhoneBtn: {
    marginBottom: 20,
  },
  changePhoneBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#15803d',
    textDecorationLine: 'underline',
  },
  otpBoxesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
    width: '100%',
  },
  otpBox: {
    width: 46,
    height: 52,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBoxFilled: {
    borderColor: '#15803d',
    backgroundColor: '#f0fdf4',
  },
  otpBoxActive: {
    borderColor: '#15803d',
    borderWidth: 2,
  },
  otpBoxText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0.01,
    width: 1,
    height: 1,
  },
  resendContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  countdownText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  resendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  resendBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#15803d',
  },
});
