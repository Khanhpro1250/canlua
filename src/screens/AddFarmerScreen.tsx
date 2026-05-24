import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { addFarmer, updateVesselTotals } from '../database/db';
import { useFontSettings } from '../context/FontSizeContext';

const { height } = Dimensions.get('window');

const AddFarmerScreen = ({ navigation, route }: any) => {
  const { vesselId } = route.params;
  const { sizes } = useFontSettings();

  const [name, setName] = useState('');
  const [goodsName, setGoodsName] = useState('');
  const [price, setPrice] = useState('');
  const [isFocused, setIsFocused] = useState<string | null>(null);

  const formatCurrency = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    if (!numericValue) return '';
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const onSave = async () => {
    if (!name.trim()) return;

    try {
      const numericPrice = parseInt(price.replace(/[^0-9]/g, '') || '0');

      await addFarmer({
        vesselId,
        name: name,
        goodsName: goodsName,
        price: numericPrice,
        weight: 0,
        count: 0,
        deposit: 0,
        paid: 0,
        dateStr: '23/05'
      });

      navigation.goBack();
    } catch (error) {
      console.error('Error saving farmer:', error);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.mainContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="white" />

        <SafeAreaView edges={['top']} style={styles.headerSafe}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
              <Ionicons name="close" size={28} color={Colors.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { fontSize: sizes.title }]}>Thêm nông dân mới</Text>
            <TouchableOpacity
              style={[styles.saveBtnSmall, !name.trim() && styles.disabledBtn]}
              onPress={onSave}
              disabled={!name.trim()}
            >
              <Text style={[styles.saveBtnSmallText, { fontSize: sizes.base }]}>Lưu</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex1}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.illustrationSection}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons name="account-plus" size={50} color={Colors.primary} />
              </View>
              <Text style={[styles.screenIntro, { fontSize: sizes.base }]}>Nhập thông tin nông dân và đơn giá</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { fontSize: sizes.label + 2 }]}>Tên nông dân <Text style={styles.required}>*</Text></Text>
                <View style={[
                  styles.inputContainer,
                  isFocused === 'name' && styles.inputFocused,
                  !name.trim() && isFocused !== 'name' && styles.inputError
                ]}>
                  <Feather name="user" size={20} color={isFocused === 'name' ? Colors.primary : Colors.textSecondary} />
                  <TextInput
                    style={[styles.input, { fontSize: sizes.base + 2 }]}
                    placeholder="Ví dụ: Chú Bảy, Anh Tám..."
                    placeholderTextColor="#adb5bd"
                    value={name}
                    onChangeText={setName}
                    onFocus={() => setIsFocused('name')}
                    onBlur={() => setIsFocused(null)}
                    maxLength={25}
                  />
                </View>
                <View style={styles.inputFooter}>
                  <Text style={styles.hint}>Họ tên người bán lúa</Text>
                  <Text style={styles.counter}>{name.length}/25</Text>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { fontSize: sizes.label + 2 }]}>Tên hàng hóa</Text>
                <View style={[
                  styles.inputContainer,
                  isFocused === 'goods' && styles.inputFocused
                ]}>
                  <Feather name="package" size={20} color={isFocused === 'goods' ? Colors.primary : Colors.textSecondary} />
                  <TextInput
                    style={[styles.input, { fontSize: sizes.base + 2 }]}
                    placeholder="Ví dụ: Lúa OM18, Đài Thơm 8..."
                    placeholderTextColor="#adb5bd"
                    value={goodsName}
                    onChangeText={setGoodsName}
                    onFocus={() => setIsFocused('goods')}
                    onBlur={() => setIsFocused(null)}
                    maxLength={30}
                  />
                </View>
                <View style={styles.inputFooter}>
                  <Text style={styles.hint}>Loại lúa hoặc nông sản</Text>
                  <Text style={styles.counter}>{goodsName.length}/30</Text>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { fontSize: sizes.label + 2 }]}>Đơn giá (VNĐ)</Text>
                <View style={[
                  styles.inputContainer,
                  styles.priceContainer,
                  isFocused === 'price' && styles.inputFocused
                ]}>
                  <MaterialCommunityIcons name="currency-usd" size={24} color={isFocused === 'price' ? Colors.primary : Colors.textSecondary} />
                  <TextInput
                    style={[styles.input, styles.priceInput, { fontSize: sizes.value + 8 }]}
                    placeholder="0"
                    placeholderTextColor="#adb5bd"
                    value={formatCurrency(price)}
                    onChangeText={(text) => setPrice(text.replace(/[^0-9]/g, ''))}
                    keyboardType="numeric"
                    onFocus={() => setIsFocused('price')}
                    onBlur={() => setIsFocused(null)}
                  />
                  <Text style={[styles.currencyUnit, { fontSize: sizes.title }]}>VNĐ</Text>
                </View>
                <View style={styles.inputFooter}>
                  <Text style={styles.hint}>Giá thỏa thuận mỗi KG</Text>
                </View>
              </View>

              <View style={styles.infoBox}>
                <Ionicons name="information-circle" size={20} color={Colors.primary} />
                <Text style={[styles.infoBoxText, { fontSize: sizes.subtitle }]}>
                  Hệ thống sẽ tự động tính Thành tiền dựa trên Khối lượng và Đơn giá bạn nhập.
                </Text>
              </View>
            </View>

            <View style={styles.footerActions}>
              <TouchableOpacity style={styles.mainSaveBtn} onPress={onSave}>
                <Text style={[styles.mainSaveBtnText, { fontSize: sizes.base }]}>XÁC NHẬN LƯU</Text>
                <Ionicons name="arrow-forward" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: 'white' },
  flex1: { flex: 1 },
  headerSafe: { backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  header: { height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15 },
  closeBtn: { padding: 5 },
  headerTitle: { fontWeight: '900', color: Colors.text },
  saveBtnSmall: { backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 12 },
  saveBtnSmallText: { color: 'white', fontWeight: 'bold' },
  disabledBtn: { backgroundColor: '#e9ecef' },
  scrollContent: { padding: 25, paddingBottom: 50 },
  illustrationSection: { alignItems: 'center', marginBottom: 35 },
  iconCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#f0f4ff', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  screenIntro: { color: Colors.textSecondary, fontWeight: '700' },
  form: { flex: 1 },
  inputGroup: { marginBottom: 25 },
  label: { fontWeight: '800', color: Colors.text, marginBottom: 10, marginLeft: 2 },
  required: { color: Colors.danger },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8f9fa', borderRadius: 16, borderWidth: 1.5, borderColor: '#f1f3f5', paddingHorizontal: 15, height: 60 },
  inputFocused: { borderColor: Colors.primary, backgroundColor: 'white', shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 2 },
  inputError: { borderColor: '#ffdad6' },
  input: { flex: 1, color: Colors.text, fontWeight: '800', marginLeft: 12 },
  priceContainer: { height: 85 },
  priceInput: { fontWeight: '900', color: Colors.danger, textAlign: 'right', marginRight: 10 },
  currencyUnit: { fontWeight: '900', color: Colors.text },
  inputFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, paddingHorizontal: 5 },
  hint: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  counter: { color: Colors.textSecondary, fontSize: 12, fontWeight: '700' },
  infoBox: { flexDirection: 'row', backgroundColor: '#f0f7ff', padding: 15, borderRadius: 15, alignItems: 'center', marginTop: 10, borderWidth: 1, borderColor: '#e0efff' },
  infoBoxText: { flex: 1, color: Colors.primaryDark, marginLeft: 10, fontWeight: '700', lineHeight: 20 },
  footerActions: { marginTop: 40 },
  mainSaveBtn: { backgroundColor: Colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 60, borderRadius: 18, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  mainSaveBtnText: { color: 'white', fontWeight: '900', marginRight: 10, letterSpacing: 1 },
});

export default AddFarmerScreen;
