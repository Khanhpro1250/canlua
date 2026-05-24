import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { useFontSettings } from '../context/FontSizeContext';

const SettingsFontSizeScreen = ({ navigation }: any) => {
  const { fontSizeLabel, setFontSizeLabel, fontColorLabel, setFontColorLabel, sizes, colors } = useFontSettings();

  const fontSizeOptions = [
    { label: 'Chữ nhỏ', value: 'small' as const, color: '#0056b3' },
    { label: 'Mặc định', value: 'default' as const, color: '#2e7d32' },
    { label: 'Chữ lớn', value: 'large' as const, color: '#f57c00' },
    { label: 'Chữ rất lớn', value: 'extraLarge' as const, color: '#c62828' },
  ];

  const fontColorOptions = [
    { label: 'Màu đen (Mặc định)', value: 'black' as const, color: '#000000' },
    { label: 'Màu xanh', value: 'blue' as const, color: '#1d71d4' },
    { label: 'Màu đỏ', value: 'red' as const, color: '#e53935' },
  ];

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Header consistent with other views */}
      <View style={styles.headerArea}>
        <SafeAreaView edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={26} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>KÍCH CỠ CHỮ</Text>
            <View style={{ width: 40 }} />
          </View>
        </SafeAreaView>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Section 1: Font Size */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.numberCircle}><Text style={styles.numberText}>1</Text></View>
            <Text style={styles.sectionTitle}>THAY ĐỔI CỠ CHỮ</Text>
          </View>

          <View style={styles.optionsCard}>
            {fontSizeOptions.map((opt, index) => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.optionRow, index === fontSizeOptions.length - 1 && { borderBottomWidth: 0 }]}
                onPress={() => setFontSizeLabel(opt.value)}
              >
                <Ionicons
                  name={fontSizeLabel === opt.value ? "radio-button-on" : "radio-button-off"}
                  size={24}
                  color={fontSizeLabel === opt.value ? Colors.primary : Colors.textSecondary}
                />
                <Text style={[styles.optionLabel, { color: opt.color, fontWeight: fontSizeLabel === opt.value ? '900' : '700' }]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Section 2: Font Color */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.numberCircle}><Text style={styles.numberText}>2</Text></View>
            <Text style={styles.sectionTitle}>THAY ĐỔI MÀU CHỮ</Text>
          </View>

          <View style={styles.optionsCard}>
            {fontColorOptions.map((opt, index) => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.optionRow, index === fontColorOptions.length - 1 && { borderBottomWidth: 0 }]}
                onPress={() => setFontColorLabel(opt.value)}
              >
                <Ionicons
                  name={fontColorLabel === opt.value ? "radio-button-on" : "radio-button-off"}
                  size={24}
                  color={fontColorLabel === opt.value ? Colors.primary : Colors.textSecondary}
                />
                <Text style={[styles.optionLabel, { color: opt.color, fontWeight: fontColorLabel === opt.value ? '900' : '700' }]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Preview Section - Modern Style */}
        <View style={styles.previewContainer}>
          <View style={styles.previewDivider}>
            <View style={styles.dividerLine} />
            <Text style={styles.previewTitle}>XEM THAY ĐỔI</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.previewCard}>
            <View style={styles.cardHeader}>
              <View style={styles.headerIconBg}>
                <MaterialCommunityIcons name="ship-wheel" size={28} color={Colors.primary} />
              </View>
              <View style={styles.headerInfo}>
                <Text style={[styles.itemTitle, { fontSize: sizes.title }]}>HUYNH HOANG</Text>
                <View style={styles.dateRow}>
                  <Feather name="clock" size={12} color={Colors.textSecondary} />
                  <Text style={[styles.dateText, { fontSize: sizes.subtitle }]}> Ngày tạo: 23/05/2026</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.menuTrigger}>
                <Feather name="more-vertical" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Text style={[styles.statLabel, { fontSize: sizes.label }]}>K/L còn lại</Text>
                <View style={styles.statValueRow}>
                  <Text style={[styles.statValueOrange, { fontSize: sizes.value }]}>900,000</Text>
                  <Text style={[styles.statUnit, { fontSize: sizes.subtitle }]}> KG</Text>
                </View>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={[styles.statLabel, { fontSize: sizes.label }]}>Lần cân (bao)</Text>
                <View style={styles.statValueRow}>
                  <Text style={[styles.statValueBlue, { fontSize: sizes.value, color: colors.primaryText }]}>9,000</Text>
                  <Text style={[styles.statUnit, { fontSize: sizes.subtitle }]}> LẦN</Text>
                </View>
              </View>
            </View>

            <View style={styles.cardFooter}>
              <View style={styles.phoneRow}>
                <Feather name="smartphone" size={18} color={Colors.primary} />
                <Text style={[styles.phoneNumber, { fontSize: sizes.base }]}>0962 456 039</Text>
              </View>
              <TouchableOpacity style={styles.intoScaleBtn}>
                <Text style={[styles.intoScaleBtnText, { fontSize: sizes.base }]}>VÀO CÂN</Text>
                <Feather name="chevron-right" size={18} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: Colors.background },
  headerArea: { backgroundColor: Colors.primary, paddingBottom: 15, borderBottomLeftRadius: 5, borderBottomRightRadius: 5 },
  header: { height: 60, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, justifyContent: 'space-between' },
  backBtn: { width: 40, height: 40, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: '900', letterSpacing: 1 },
  scrollContent: { padding: 20, paddingBottom: 50 },
  section: { marginBottom: 25 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  numberCircle: { width: 30, height: 30, borderRadius: 15, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  numberText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  sectionTitle: { fontSize: 17, fontWeight: '900', color: Colors.text, letterSpacing: 0.5 },
  optionsCard: { backgroundColor: 'white', borderRadius: 24, overflow: 'hidden', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
  optionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  optionLabel: { fontSize: 18, marginLeft: 15 },
  previewContainer: { marginTop: 10 },
  previewDivider: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#cbd5e1' },
  previewTitle: { marginHorizontal: 15, fontSize: 14, fontWeight: '900', color: Colors.textSecondary, letterSpacing: 1 },
  previewCard: { backgroundColor: 'white', borderRadius: 24, padding: 18, elevation: 8, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 15 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  headerIconBg: { width: 50, height: 50, backgroundColor: '#f0f7ff', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  headerInfo: { flex: 1, marginLeft: 15 },
  itemTitle: { fontWeight: '900', color: '#004aad' },
  dateRow: { flexDirection: 'row', alignItems: 'center' },
  dateText: { color: Colors.textSecondary },
  menuTrigger: { padding: 5 },
  statsContainer: { flexDirection: 'row', backgroundColor: '#f8fafd', borderRadius: 15, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#f1f5f9' },
  statBox: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: '#dee2e6', marginHorizontal: 5 },
  statLabel: { color: '#495057', fontWeight: '800', marginBottom: 8 },
  statValueRow: { flexDirection: 'row', alignItems: 'baseline' },
  statValueOrange: { fontWeight: '900', color: '#e65100' },
  statValueBlue: { fontWeight: '900', color: '#0d47a1' },
  statUnit: { fontWeight: '900', color: '#333' },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  phoneRow: { flexDirection: 'row', alignItems: 'center' },
  phoneNumber: { fontWeight: '900', color: '#000', marginLeft: 8 },
  intoScaleBtn: { backgroundColor: '#1d71d4', flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 18, borderRadius: 12 },
  intoScaleBtnText: { color: 'white', fontWeight: 'bold', marginRight: 5 },
});

export default SettingsFontSizeScreen;
