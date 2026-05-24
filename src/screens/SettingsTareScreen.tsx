import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Switch,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { useTareConfig } from '../context/TareConfigContext';

const SettingsTareScreen = ({ navigation }: any) => {
  const { isTareByTime, bagsPerKg, kgPerBag, setIsTareByTime, setBagsPerKg, setKgPerBag } = useTareConfig();

  const [tempBags, setTempBags] = useState(bagsPerKg.toString());
  const [tempKgPerBag, setTempKgPerBag] = useState(kgPerBag.toString());

  const onSave = () => {
    if (isTareByTime) {
      const val = parseFloat(tempKgPerBag.replace(',', '.'));
      if (!isNaN(val) && val >= 0) {
        setKgPerBag(val);
      }
    } else {
      const val = parseInt(tempBags);
      if (!isNaN(val) && val > 0) {
        setBagsPerKg(val);
      }
    }
    navigation.goBack();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.mainContainer}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

        {/* Header Area */}
        <View style={styles.headerArea}>
          <SafeAreaView edges={['top']}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Ionicons name="chevron-back" size={26} color="white" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>TRỪ BÌ</Text>
              <TouchableOpacity style={styles.saveBtnSmall} onPress={onSave}>
                <Ionicons name="save" size={20} color="black" />
                <Text style={styles.saveBtnSmallText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex1}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Section 1: Tare Mode Toggle */}
            <View style={styles.section}>
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleRow}>
                    <MaterialCommunityIcons
                      name={isTareByTime ? "scale-balance" : "scale-off"}
                      size={24}
                      color={Colors.primary}
                    />
                    <Text style={styles.cardTitle}>Trừ bì trên lần cân</Text>
                  </View>
                  <Switch
                    trackColor={{ false: '#d1d5db', true: Colors.success }}
                    thumbColor={isTareByTime ? '#fff' : '#f4f3f4'}
                    onValueChange={setIsTareByTime}
                    value={isTareByTime}
                  />
                </View>
                <Text style={styles.cardDesc}>
                  {isTareByTime
                    ? "Đang bật: Khối lượng trừ bì sẽ được tính trực tiếp trên mỗi lần cân."
                    : "Đang tắt: Khối lượng trừ bì sẽ được tính dựa trên tổng số bao đã cân."}
                </Text>
              </View>
            </View>

            {/* Section 2: Conditional Input Based on Tare Mode */}
            <View style={styles.section}>
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleRow}>
                    <MaterialCommunityIcons
                      name={isTareByTime ? "weight-kilogram" : "layers-outline"}
                      size={24}
                      color={Colors.primary}
                    />
                    <Text style={styles.cardTitle}>
                      {isTareByTime ? "Trừ bì trên 1 lần cân KG/bao" : "Số bao trên 1kg"}
                    </Text>
                  </View>
                </View>

                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    value={isTareByTime ? tempKgPerBag : tempBags}
                    onChangeText={isTareByTime ? setTempKgPerBag : setTempBags}
                    keyboardType={isTareByTime ? "decimal-pad" : "numeric"}
                    placeholder={isTareByTime ? "0.5" : "8"}
                  />
                  <Text style={styles.inputUnit}>
                    {isTareByTime ? "KG / BAO" : "BAO / 1KG"}
                  </Text>
                </View>

                <View style={styles.noteContainer}>
                  <Text style={styles.noteTitle}>(*) Chú ý:</Text>
                  <View style={styles.noteItem}>
                    <View style={styles.dot} />
                    <Text style={styles.noteText}>
                      {isTareByTime
                        ? "Khối lượng trừ bì sẽ tính trên 1 lần cân (ví dụ: mỗi bao lúa trừ 0.5kg)."
                        : "Số bao tương ứng với số lần cân (1 lần cân = 1 bao)."}
                    </Text>
                  </View>

                  {isTareByTime ? (
                    <View style={styles.formulaBox}>
                      <Text style={styles.formulaText}>
                        VD: Cân 100 lần, cài trừ 0.5 kg/bao {'\n'}
                        {`=>`} Tổng trừ: 100 x 0.5 = <Text style={styles.highlightText}>50.0 kg</Text>
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.formulaBox}>
                      <Text style={styles.formulaText}>
                        VD: Cân 100 bao, cài 8 bao/1kg {'\n'}
                        {`=>`} Tổng trừ: 100 / 8 = <Text style={styles.highlightText}>12.5 kg</Text>
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            <View style={styles.bottomActions}>
               <TouchableOpacity style={styles.btnExit} onPress={() => navigation.goBack()}>
                  <Ionicons name="close" size={20} color="#000" />
                  <Text style={styles.btnExitText}>Thoát</Text>
               </TouchableOpacity>
               <TouchableOpacity style={styles.btnSaveLarge} onPress={onSave}>
                  <Ionicons name="save" size={20} color="black" />
                  <Text style={styles.btnSaveLargeText}>Lưu lại</Text>
               </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: Colors.background },
  flex1: { flex: 1 },
  headerArea: { backgroundColor: Colors.primary, paddingBottom: 15, borderBottomLeftRadius: 5, borderBottomRightRadius: 5 },
  header: { height: 60, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, justifyContent: 'space-between' },
  backBtn: { width: 40, height: 40, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: '900', letterSpacing: 1 },
  saveBtnSmall: { backgroundColor: Colors.secondary, flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, elevation: 4 },
  saveBtnSmallText: { color: 'black', fontWeight: '900', marginLeft: 4, fontSize: 14 },
  scrollContent: { padding: 20, paddingBottom: 50 },
  section: { marginBottom: 20 },
  card: { backgroundColor: 'white', borderRadius: 24, padding: 20, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center' },
  cardTitle: { fontSize: 18, fontWeight: '900', color: Colors.text, marginLeft: 10 },
  cardDesc: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20, fontWeight: '600', marginBottom: 10 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 16, borderWidth: 2, borderColor: '#e2e8f0', paddingHorizontal: 20, height: 70, marginVertical: 15 },
  input: { flex: 1, fontSize: 32, fontWeight: '900', color: Colors.danger, textAlign: 'right', marginRight: 15 },
  inputUnit: { fontSize: 16, fontWeight: '900', color: Colors.text },
  noteContainer: { marginTop: 10 },
  noteTitle: { fontSize: 16, fontWeight: '900', color: Colors.danger, marginBottom: 10 },
  noteItem: { flexDirection: 'row', marginBottom: 8, paddingRight: 10 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.danger, marginTop: 8, marginRight: 10 },
  noteText: { fontSize: 14, color: '#475569', fontWeight: '700', lineHeight: 20 },
  formulaBox: { backgroundColor: '#fff7ed', padding: 15, borderRadius: 12, marginTop: 10, borderWidth: 1, borderColor: '#ffedd5' },
  formulaText: { fontSize: 15, color: '#9a3412', fontWeight: '700', lineHeight: 22 },
  highlightText: { color: Colors.danger, fontWeight: '900' },
  bottomActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  btnExit: { backgroundColor: '#f1f5f9', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15, borderRadius: 15, width: '45%', borderWidth: 1, borderColor: '#cbd5e1' },
  btnExitText: { color: Colors.text, fontWeight: '900', fontSize: 16, marginLeft: 8 },
  btnSaveLarge: { backgroundColor: Colors.secondary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15, borderRadius: 15, width: '45%', elevation: 4, shadowColor: Colors.secondary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  btnSaveLargeText: { color: 'black', fontWeight: '900', fontSize: 16, marginLeft: 8 },
});

export default SettingsTareScreen;
