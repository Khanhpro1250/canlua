import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { useInputFormat, InputFormatMode } from '../context/InputFormatContext';

const { width } = Dimensions.get('window');

const SettingsInputFormatScreen = ({ navigation }: any) => {
  const { mode, setMode } = useInputFormat();

  const renderOption = (
    targetMode: InputFormatMode,
    mainText: string,
    desc: string,
    example: string,
    result?: string,
    isYellow?: boolean
  ) => {
    const isSelected = mode === targetMode;

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        style={[
          styles.optionRow,
          isSelected && (isYellow ? styles.selectedRowYellow : styles.selectedRow)
        ]}
        onPress={() => setMode(targetMode)}
      >
        <View style={styles.radioContainer}>
          <Ionicons
            name={isSelected ? "radio-button-on" : "radio-button-off"}
            size={26}
            color={isSelected ? Colors.primary : Colors.textSecondary}
          />
        </View>
        <View style={styles.optionInfo}>
          <Text style={[styles.optionMain, isSelected && styles.selectedText]}>
            Nhập <Text style={styles.highlightText}>{mainText}</Text>
          </Text>
          <Text style={styles.optionDesc}>{desc}</Text>
          <View style={styles.exampleContainer}>
            <Text style={styles.optionExample}>{example}</Text>
            {result && (
              <View style={styles.resultBadge}>
                <Text style={styles.optionResult}>{result}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Consistent Modern Header */}
      <View style={styles.headerArea}>
        <SafeAreaView edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={26} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>QUY CÁCH NHẬP</Text>
            <View style={{ width: 40 }} />
          </View>
        </SafeAreaView>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Section 1: Low Weight Range */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.numberCircle}><Text style={styles.numberText}>1</Text></View>
            <View>
              <Text style={styles.sectionTitle}>MỨC KHỐI LƯỢNG THẤP</Text>
              <Text style={styles.sectionSubTitle}>Dành cho hàng hóa <Text style={styles.blueBold}>{"< 100kg"}</Text></Text>
            </View>
          </View>

          <View style={styles.card}>
            {renderOption(
              'under-2-digits',
              '02 số (Chẵn)',
              'Chỉ nhập phần nguyên',
              'VD: 50kg, 51kg, 52kg...'
            )}
            {renderOption(
              'under-3-digits',
              '03 số (Lẻ)',
              'Nhập cả số lẻ thập phân',
              'VD: 50.0kg, 52.4kg, 52.6kg...',
              'Sẽ nhập: 500, 524, 526...',
              true
            )}
          </View>
        </View>

        {/* Section 2: High Weight Range */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.numberCircle}><Text style={styles.numberText}>2</Text></View>
            <View>
              <Text style={styles.sectionTitle}>MỨC KHỐI LƯỢNG CAO</Text>
              <Text style={styles.sectionSubTitle}>Dành cho hàng hóa <Text style={styles.blueBold}>{">= 100kg"}</Text></Text>
            </View>
          </View>

          <View style={styles.card}>
            {renderOption(
              'above-3-digits',
              '03 số (Chẵn)',
              'Chỉ nhập phần nguyên',
              'VD: 101kg, 110kg, 200kg...'
            )}
            {renderOption(
              'above-4-digits',
              '04 số (Lẻ)',
              'Nhập cả số lẻ thập phân',
              'VD: 100.0kg, 102.4kg, 220.6kg...',
              'Sẽ nhập: 1000, 1014, 2206...'
            )}
          </View>
        </View>

        <View style={styles.infoBox}>
          <MaterialCommunityIcons name="information-variant" size={24} color={Colors.primary} />
          <Text style={styles.infoBoxText}>
            Lưu ý: Chỉ chọn được 1 quy cách nhập duy nhất để đảm bảo tính chính xác khi cân lúa.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.background
  },
  headerArea: {
    backgroundColor: Colors.primary,
    paddingBottom: 15,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    justifyContent: 'space-between'
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40
  },
  section: {
    marginBottom: 30
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    marginLeft: 5
  },
  numberCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  numberText: {
    color: 'white',
    fontWeight: '900',
    fontSize: 18
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: Colors.text,
    letterSpacing: 0.5
  },
  sectionSubTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginTop: 2
  },
  blueBold: {
    color: Colors.primary,
    fontWeight: '900'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  selectedRow: {
    backgroundColor: '#f0f7ff' // Light blue hint
  },
  selectedRowYellow: {
    backgroundColor: '#fffbeb' // Soft amber hint
  },
  radioContainer: {
    marginRight: 15
  },
  optionInfo: {
    flex: 1
  },
  optionMain: {
    fontSize: 19,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4
  },
  selectedText: {
    fontWeight: '900',
  },
  highlightText: {
    color: Colors.danger,
    fontWeight: '900'
  },
  optionDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600'
  },
  exampleContainer: {
    marginTop: 8
  },
  optionExample: {
    fontSize: 13,
    color: '#64748b',
    fontStyle: 'italic',
    lineHeight: 18
  },
  resultBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  optionResult: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1e293b'
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#e7f0ff',
    padding: 15,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#d0e1ff'
  },
  infoBoxText: {
    flex: 1,
    fontSize: 13,
    color: Colors.primaryDark,
    marginLeft: 10,
    fontWeight: '700',
    lineHeight: 18
  }
});

export default SettingsInputFormatScreen;
