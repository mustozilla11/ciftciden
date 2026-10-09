import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
  ScrollView,
  Platform,
} from 'react-native';
import { X, Send, MessageCircle, AlertCircle, Heart, CheckCircle2 } from 'lucide-react-native';

interface FeedbackModalProps {
  visible: boolean;
  onClose: () => void;
}

const FEEDBACK_TYPES = [
  'Hata / Sorun',
  'Öneri / Fikir',
  'Tarla & Mahsul Talebi',
  'Diğer',
] as const;

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ visible, onClose }) => {
  const [selectedType, setSelectedType] = useState<string>('Hata / Sorun');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSend = () => {
    if (!message.trim()) {
      Alert.alert('Eksik Alan', 'Lütfen iletmek istediğiniz mesajı veya sorunu yazın.');
      return;
    }

    // Doğrudan geliştirici WhatsApp hattına veya e-postasına yönlendirme imkanı
    const fullMessage = encodeURIComponent(
      `[Çiftçiden Geri Bildirim]\nKonu: ${selectedType}\nGönderen: ${name || 'İsimsiz Üretici/Alıcı'}\n\nMesaj:\n${message}`
    );

    // Geliştirici destek hattı (Örnek numara, kullanıcı kendi numarasını koyabilir)
    const developerWhatsApp = '905321234567';
    const waUrl = `whatsapp://send?phone=${developerWhatsApp}&text=${fullMessage}`;

    Linking.canOpenURL(waUrl)
      .then(supported => {
        if (supported) {
          Linking.openURL(waUrl);
        } else {
          // Destek e-postası fallback
          Linking.openURL(`mailto:destek@ciftciden.app?subject=${selectedType}&body=${fullMessage}`);
        }
      })
      .catch(() => {
        // Yerel teşekkür mesajı
        setIsSent(true);
        setTimeout(() => {
          setIsSent(false);
          setMessage('');
          onClose();
        }, 1200);
      });

    setIsSent(true);
    setTimeout(() => {
      setIsSent(false);
      setMessage('');
      onClose();
    }, 1200);
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
              <AlertCircle size={22} color="#15803d" />
              <Text style={styles.title}>Geliştiriciye Sorun / Öneri Bildir</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={22} color="#475569" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <Text style={styles.description}>
              Uygulamada karşılaştığınız hataları veya yeni özellik önerilerinizi doğrudan uygulama geliştiricisine iletebilirsiniz.
            </Text>

            {/* GERİ BİLDİRİM TÜRÜ */}
            <Text style={styles.label}>Konu Seçin</Text>
            <View style={styles.typeRow}>
              {FEEDBACK_TYPES.map(type => {
                const isSelected = selectedType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setSelectedType(type)}
                    style={[styles.typeChip, isSelected && styles.typeChipActive]}
                  >
                    <Text style={[styles.typeChipText, isSelected && styles.typeChipTextActive]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* AD SOYAD (İSTEĞE BAĞLI) */}
            <Text style={styles.label}>Adınız / Bölgeniz (İsteğe Bağlı)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Örn: Ali Çiftçi - Kumluca"
              placeholderTextColor="#94a3b8"
              value={name}
              onChangeText={setName}
            />

            {/* MESAJ */}
            <Text style={styles.label}>Mesajınız / Karşılaştığınız Sorun *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Hangi ekranda sorun yaşadınız veya ne eklenmesini istersiniz?.."
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={4}
              value={message}
              onChangeText={setMessage}
            />

            {/* GÖNDER BUTONU */}
            <TouchableOpacity
              activeOpacity={0.88}
              style={[styles.sendButton, isSent && styles.sendButtonSuccess]}
              onPress={handleSend}
            >
              {isSent ? (
                <>
                  <CheckCircle2 size={18} color="#ffffff" />
                  <Text style={styles.sendButtonText}>İletildi, Teşekkürler!</Text>
                </>
              ) : (
                <>
                  <MessageCircle size={18} color="#ffffff" />
                  <Text style={styles.sendButtonText}>WhatsApp ile Bize İlet</Text>
                </>
              )}
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
    maxHeight: '85%',
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
    gap: 8,
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
  description: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    marginTop: 10,
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  typeChipActive: {
    backgroundColor: '#15803d',
    borderColor: '#15803d',
  },
  typeChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  typeChipTextActive: {
    color: '#ffffff',
  },
  textInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '600',
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#15803d',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
    gap: 8,
  },
  sendButtonSuccess: {
    backgroundColor: '#16a34a',
  },
  sendButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
});
