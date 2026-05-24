import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  TextInput,
  Switch,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
  Modal
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { Farmer, updateFarmerData, getWeighingRecords, saveWeighingRecord, WeighingRecord } from '../database/db';
import { useFontSettings } from '../context/FontSizeContext';
import { useTareConfig } from '../context/TareConfigContext';
import { useInputFormat } from '../context/InputFormatContext';

const { width } = Dimensions.get('window');

const WeighingSessionScreen = ({ navigation, route }: any) => {
  const { farmer } = route.params as { farmer: Farmer };
  const { sizes, colors } = useFontSettings();
  const { isTareByTime, bagsPerKg: globalBagsPerKg } = useTareConfig();
  const { mode: inputMode } = useInputFormat();
  const insets = useSafeAreaInsets();

  // Farmer States
  const [farmerName, setFarmerName] = useState(farmer.name);
  const [goodsName, setGoodsName] = useState(farmer.goodsName || '');
  const [bagCount, setBagCount] = useState(farmer.count.toString());
  const [impurity, setImpurity] = useState('0');
  const [price, setPrice] = useState(farmer.price.toString());
  const [deposit, setDeposit] = useState((farmer.deposit || 0).toString());
  const [paid, setPaid] = useState(farmer.paid.toString());
  const [paidInFull, setPaidInFull] = useState(false);

  // Weighing Grid States
  const [records, setRecords] = useState<Record<number, string>>({}); // Use string for editing
  const [isInputActive, setIsInputActive] = useState(false);
  const [activeCellIndex, setActiveCellIndex] = useState<number | null>(null);

  // Local Tare override
  const [sessionTareMode, setSessionTareMode] = useState(farmer.tareMode ?? (isTareByTime ? 1 : 0));
  const [sessionBagsPerKg, setSessionBagsPerKg] = useState(farmer.bagsPerKg || globalBagsPerKg);
  const [sessionKgPerBag, setSessionKgPerBag] = useState(farmer.kgPerBag || 0);

  // Custom Tare Modal State
  const [isTareModalVisible, setIsTareModalVisible] = useState(false);
  const [tempTareValue, setTempTareValue] = useState(sessionBagsPerKg.toString());

  const inputRefs = useRef<Record<number, TextInput | null>>({});

  // Load weighing records on mount
  useEffect(() => {
    const loadRecords = async () => {
      try {
        const dbRecords = await getWeighingRecords(farmer.id);
        const recordMap: Record<number, string> = {};
        dbRecords.forEach(r => {
          let val = r.weight;
          // Reverse the decimal logic for display in grid
          if (inputMode === 'under-3-digits' || inputMode === 'above-4-digits') {
              // Convert 52.5 back to 525 for display
              recordMap[r.recordIndex] = Math.round(val * 10).toString();
          } else {
              recordMap[r.recordIndex] = val.toString();
          }
        });
        setRecords(recordMap);
      } catch (error) {
        console.error('Error loading weighing records:', error);
      }
    };
    loadRecords();
  }, [farmer.id, inputMode]);

  const handleFarmerNameChange = (newName: string) => {
    setFarmerName(newName);
  };

  const handleFarmerNameBlur = () => {
    if (!farmerName.trim()) {
      setFarmerName(farmer.name);
    }
  };

  const handleEditLocalTare = () => {
    setTempTareValue(sessionBagsPerKg.toString());
    setIsTareModalVisible(true);
  };

  const handleSaveLocalTare = () => {
    const num = parseInt(tempTareValue);
    if (!isNaN(num) && num > 0) {
      setSessionBagsPerKg(num);
      setIsTareModalVisible(false);
    } else {
      Alert.alert("Lỗi", "Vui lòng nhập số bao hợp lệ");
    }
  };

  // Toggle "Mở" mode and auto-focus
  const toggleInputMode = () => {
    const newActiveState = !isInputActive;
    setIsInputActive(newActiveState);

    if (newActiveState) {
      // Find the next empty index
      let nextIndex = 0;
      while (records[nextIndex] !== undefined && records[nextIndex] !== '') {
        nextIndex++;
      }
      setActiveCellIndex(nextIndex);
      // Timeout to ensure TextInput is rendered before focusing
      setTimeout(() => {
        inputRefs.current[nextIndex]?.focus();
      }, 100);
    } else {
      setActiveCellIndex(null);
      Keyboard.dismiss();
    }
  };

  const handleWeightInputChange = (index: number, text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    let maxDigits = 2;
    if (inputMode === 'under-3-digits' || inputMode === 'above-3-digits') maxDigits = 3;
    if (inputMode === 'above-4-digits') maxDigits = 4;

    const truncated = cleaned.slice(0, maxDigits);
    const newRecords = { ...records, [index]: truncated };
    setRecords(newRecords);

    // If reached max digits, move to next cell
    if (truncated.length === maxDigits) {
      saveRecordToDb(index, truncated);
      const nextIdx = index + 1;
      setActiveCellIndex(nextIdx);
      setTimeout(() => {
        inputRefs.current[nextIdx]?.focus();
      }, 50);
    }
  };

  const saveRecordToDb = async (index: number, value: string) => {
    if (!value) return;

    let weight = parseFloat(value);
    // Handle decimal logic based on mode
    if (inputMode === 'under-3-digits' || inputMode === 'above-4-digits') {
        weight = weight / 10;
    }

    try {
      await saveWeighingRecord(farmer.id, weight, index);
      // Refresh bag count and total weight from DB (or calculate locally)
      const dbRecords = await getWeighingRecords(farmer.id);
      setBagCount(dbRecords.length.toString());
    } catch (error) {
      console.error('Error saving record:', error);
    }
  };

  // Auto-save logic
  useEffect(() => {
    const saveData = async () => {
      try {
        const dataToUpdate: any = {
          goodsName: goodsName,
          price: parseInt(price) || 0,
          deposit: parseInt(deposit) || 0,
          paid: parseInt(paid) || 0,
          impurity: parseFloat(impurity) || 0,
          tareMode: sessionTareMode,
          bagsPerKg: sessionBagsPerKg,
          kgPerBag: sessionKgPerBag,
        };
        if (farmerName.trim()) dataToUpdate.name = farmerName.trim();
        await updateFarmerData(farmer.id, dataToUpdate);
      } catch (error) {
        console.error('Error auto-saving farmer data:', error);
      }
    };
    const timeoutId = setTimeout(saveData, 500);
    return () => clearTimeout(timeoutId);
  }, [farmerName, goodsName, price, deposit, paid, impurity, sessionBagsPerKg, sessionTareMode, sessionKgPerBag]);

  const formatCurrency = (text: string | number) => {
    let str = text.toString();
    const isNegative = str.startsWith('-');
    let numericValue = str.replace(/[^0-9]/g, '');
    if (numericValue.length > 1) numericValue = numericValue.replace(/^0+/, '');
    if (!numericValue || numericValue === '0') return '0';
    const formatted = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return isNegative ? `-${formatted}` : formatted;
  };

  const cleanNumericInput = (text: string) => {
    let cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length > 1) cleaned = cleaned.replace(/^0+/, '');
    return cleaned || '0';
  };

  const formatWeight = (num: number) => {
    const parts = (num % 1 === 0 ? num : num.toFixed(1)).toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join('.');
  };

  // Calculations for display
  const totalWeight = useMemo(() => {
      return Object.entries(records).reduce((sum, [idx, val]) => {
          if (!val) return sum;
          let w = parseFloat(val);
          if (inputMode === 'under-3-digits' || inputMode === 'above-4-digits') w = w / 10;
          return sum + w;
      }, 0);
  }, [records, inputMode]);

  const tareTotal = useMemo(() => {
      const count = Object.values(records).filter(v => v !== '').length;
      if (sessionTareMode === 0) {
          // Mode 0: Bags per KG
          return sessionBagsPerKg > 0 ? count / sessionBagsPerKg : 0;
      } else {
          // Mode 1: KG per Bag
          return count * sessionKgPerBag;
      }
  }, [records, sessionBagsPerKg, sessionTareMode, sessionKgPerBag]);

  const netWeight = totalWeight - tareTotal - (parseFloat(impurity) || 0);
  const totalAmount = netWeight * (parseInt(price) || 0);
  const remainingAmount = totalAmount - (parseInt(deposit) || 0) - (parseInt(paid) || 0);

  // Grid Logic: Generate tables
  const tables = useMemo(() => {
    const maxIndex = Math.max(-1, ...Object.keys(records).map(Number));
    // Always show at least 1 table.
    const lastIndexUsed = Math.max(maxIndex, activeCellIndex || 0);
    const numTables = Math.floor(lastIndexUsed / 25) + 1;

    // Return indices for tables
    return Array.from({ length: numTables }, (_, index) => index);
  }, [records, activeCellIndex]);

  const renderGridCell = (tableIdx: number, colIdx: number, rowIdx: number) => {
    // Column-major order within a table
    // Index = (tableIdx * 25) + (colIdx * 5) + rowIdx
    const index = (tableIdx * 25) + (colIdx * 5) + rowIdx;
    const value = records[index] || '';
    const isActive = activeCellIndex === index && isInputActive;
    const isFilled = value !== '';
    const canEdit = isInputActive && (isFilled || index === 0 || (records[index-1] !== undefined && records[index-1] !== ''));

    return (
      <View key={`${colIdx}-${rowIdx}`} style={[styles.gridCell, isActive && styles.activeGridCell]}>
        {isInputActive && canEdit ? (
          <TextInput
            ref={ref => inputRefs.current[index] = ref}
            style={[styles.gridInput, { fontSize: sizes.base + 2, fontWeight: '900' }]}
            value={value}
            onChangeText={(t) => handleWeightInputChange(index, t)}
            keyboardType="number-pad"
            selectTextOnFocus
            onFocus={() => setActiveCellIndex(index)}
          />
        ) : (
          <Text style={[styles.cellText, { fontSize: sizes.base + 2, fontWeight: '900' }]}>{value || '-'}</Text>
        )}
      </View>
    );
  };

  const calculateColumnTotal = (tableIdx: number, colIdx: number) => {
    let sum = 0;
    for (let r = 0; r < 5; r++) {
      const idx = tableIdx * 25 + colIdx * 5 + r;
      const val = records[idx];
      if (val) {
        let w = parseFloat(val);
        if (inputMode === 'under-3-digits' || inputMode === 'above-4-digits') w = w / 10;
        sum += w;
      }
    }
    return formatWeight(sum);
  };

  const calculateTableTotal = (tableIdx: number) => {
    let sum = 0;
    for (let i = 0; i < 25; i++) {
      const idx = tableIdx * 25 + i;
      const val = records[idx];
      if (val) {
        let w = parseFloat(val);
        if (inputMode === 'under-3-digits' || inputMode === 'above-4-digits') w = w / 10;
        sum += w;
      }
    }
    return formatWeight(sum);
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* 1. Header */}
      <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.roundBtn}>
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, { fontSize: sizes.title }]} numberOfLines={1}>
              {(farmerName.trim() || farmer.name).toUpperCase()}
            </Text>
            <View style={styles.statusPill}>
              <Text style={styles.statusPillText}>{formatWeight(totalWeight)} kg / {bagCount} bao</Text>
            </View>
          </View>

          <TouchableOpacity style={[styles.unlockBtn, isInputActive && styles.unlockBtnActive]} onPress={toggleInputMode}>
            <Ionicons name={isInputActive ? "lock-open" : "lock-closed"} size={18} color="white" />
            <Text style={styles.unlockBtnText}>{isInputActive ? "ĐÓNG" : "MỞ"}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex1}
      >
        <ScrollView
          style={styles.flex1}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
        >
          {/* 2. Banner */}
          <View style={styles.resultsBanner}>
            <Text style={[styles.resultsBannerText, { fontSize: sizes.title + 2 }]}>KẾT QUẢ PHIÊN CÂN</Text>
          </View>

          <View style={styles.formContainer}>
            {/* Farmer & Goods */}
            <View style={styles.inputGroup}>
              <Text style={[styles.fieldLabel, { fontSize: sizes.label }]}>Tên nông dân</Text>
              <View style={styles.inputBox}>
                <TextInput
                  style={[styles.inputText, { fontSize: sizes.base + 2, color: colors.primaryText }]}
                  value={farmerName}
                  onChangeText={handleFarmerNameChange}
                  onBlur={handleFarmerNameBlur}
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <View style={[styles.inputBox, styles.inputBoxSuccess]}>
                <TextInput
                  style={[styles.inputText, styles.italic, { fontSize: sizes.base + 2, color: colors.primaryText }]}
                  placeholder="Nhập tên giống lúa..."
                  placeholderTextColor="#94a3b8"
                  value={goodsName}
                  onChangeText={setGoodsName}
                />
              </View>
            </View>

            <View style={styles.divider} />

            {/* Weights */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <MaterialCommunityIcons name="layers" size={24} color={Colors.success} />
                <Text style={[styles.sectionTitle, { fontSize: sizes.title }]}>Tổng khối lượng</Text>
              </View>
              <View style={styles.resultBoxYellow}>
                <Text style={[styles.resultValue, { fontSize: sizes.value + 12 }]} adjustsFontSizeToFit numberOfLines={1}>
                  {formatWeight(totalWeight)}
                </Text>
                <Text style={[styles.resultUnit, { fontSize: sizes.label + 2 }]}>KG</Text>
              </View>
              <Text style={[styles.guideNoteRed, { fontSize: sizes.subtitle }]}>(*) Khối lượng CHƯA trừ bì</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <MaterialCommunityIcons name="archive-outline" size={24} color={Colors.primary} />
                <Text style={[styles.sectionTitle, { fontSize: sizes.title }]}>Số lần cân (Bao)</Text>
              </View>
              <View style={[styles.inputBoxWithIcon, styles.bgLocked]}>
                <Text style={[styles.inputText, styles.textCenter, { fontSize: sizes.value, color: colors.primaryText, height: undefined, paddingLeft: 0, paddingRight: 0 }]}>
                  {bagCount}
                </Text>
                <MaterialCommunityIcons name="lock-outline" size={20} color={Colors.textSecondary} />
              </View>
            </View>

            <View style={styles.divider} />

            {/* Tare & Impurity */}
            <View style={styles.inputGroup}>
              <Text style={[styles.fieldHeading, { fontSize: sizes.label + 2 }]}>Trừ bì (-)</Text>
              <View style={[styles.inputBoxWithIcon, styles.bgLocked]}>
                <TouchableOpacity onPress={handleEditLocalTare} style={styles.gearBtn}>
                  <Ionicons name="settings-outline" size={20} color={Colors.danger} />
                </TouchableOpacity>
                <Text style={[styles.valueTextBold, { fontSize: sizes.value }]}>{tareTotal % 1 === 0 ? tareTotal : tareTotal.toFixed(1)} KG</Text>
              </View>
              <Text style={[styles.guideNoteRed, { fontSize: sizes.subtitle }]}>(*) Trừ bì đang cài: {sessionBagsPerKg} bao / 1kg</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.fieldHeading, { fontSize: sizes.label + 2 }]}>Trừ tạp chất (-)</Text>
              <View style={styles.inputBox}>
                <TextInput
                  style={[styles.inputText, styles.textRight, { fontSize: sizes.value, color: colors.primaryText }]}
                  value={impurity.replace('.', ',')} // Display dot as comma for user familiarity in VN
                  onChangeText={(t) => {
                    // Allow both dot and comma
                    let cleaned = t.replace(/[^0-9.,]/g, '');
                    // Convert comma to dot for internal numeric state
                    cleaned = cleaned.replace(',', '.');
                    const parts = cleaned.split('.');
                    // Only allow one decimal point
                    if (parts.length > 2) cleaned = parts[0] + '.' + parts.slice(1).join('');
                    setImpurity(cleaned);
                  }}
                  keyboardType="decimal-pad"
                  selectTextOnFocus
                />
                <Text style={[styles.unitSuffix, { fontSize: sizes.label + 2 }]}>KG</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <MaterialCommunityIcons name="scale-balance" size={24} color={Colors.danger} />
                <Text style={[styles.sectionTitle, { fontSize: sizes.title }]}>Khối lượng thực lĩnh</Text>
              </View>
              <View style={[styles.resultBoxYellow, styles.resultBoxSuccess]}>
                <Text style={[styles.resultValue, { fontSize: sizes.value + 12, color: Colors.success }]} adjustsFontSizeToFit numberOfLines={1}>
                    {formatWeight(netWeight)}
                </Text>
                <Text style={[styles.resultUnit, { color: Colors.success, fontSize: sizes.label + 2 }]}>KG</Text>
              </View>
              <Text style={[styles.guideNoteGreen, { fontSize: sizes.subtitle }]}>(*) Khối lượng ĐÃ trừ bì & tạp chất</Text>
            </View>

            {/* Money */}
            <View style={styles.inputGroup}>
              <Text style={[styles.fieldHeading, { fontSize: sizes.label + 2 }]}>Đơn giá thỏa thuận</Text>
              <View style={styles.inputBox}>
                <TextInput
                  style={[styles.inputText, styles.textRight, { fontSize: sizes.value, color: colors.primaryText }]}
                  value={formatCurrency(price)}
                  onChangeText={(t) => setPrice(cleanNumericInput(t))}
                  keyboardType="number-pad"
                  selectTextOnFocus
                />
                <Text style={[styles.unitSuffixRed, { fontSize: sizes.label + 2 }]}>Vnđ</Text>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.fieldHeading, { fontSize: sizes.label + 2 }]}>Thành tiền</Text>
              <View style={styles.resultBoxYellow}>
                <Text style={[styles.resultValue, { fontSize: sizes.value + 12 }]} adjustsFontSizeToFit numberOfLines={1}>
                  {formatCurrency(Math.round(totalAmount).toString())}
                </Text>
                <Text style={[styles.resultUnitRed, { fontSize: sizes.label + 2 }]}>Vnđ</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.inputGroup}>
              <Text style={[styles.fieldHeading, { fontSize: sizes.label + 2 }]}>Tiền đặt cọc (-)</Text>
              <View style={styles.inputBox}>
                <TextInput
                  style={[styles.inputText, styles.textRight, { fontSize: sizes.value, color: colors.primaryText }]}
                  value={formatCurrency(deposit)}
                  onChangeText={(t) => setDeposit(cleanNumericInput(t))}
                  keyboardType="number-pad"
                  selectTextOnFocus
                />
                <Text style={[styles.unitSuffixRed, { fontSize: sizes.label + 2 }]}>Vnđ</Text>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.fieldHeading, { fontSize: sizes.label + 2 }]}>Tiền đã trả (-)</Text>
              <View style={styles.inputBox}>
                <TextInput
                  style={[styles.inputText, styles.textRight, { fontSize: sizes.value, color: colors.primaryText }]}
                  value={formatCurrency(paid)}
                  onChangeText={(t) => setPaid(cleanNumericInput(t))}
                  keyboardType="number-pad"
                  selectTextOnFocus
                />
                <Text style={[styles.unitSuffixRed, { fontSize: sizes.label + 2 }]}>Vnđ</Text>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.fieldHeading, { fontSize: sizes.label + 2 }]}>TIỀN CÒN LẠI PHẢI TRẢ</Text>
              <View style={styles.resultBoxNavy}>
                <Text style={[styles.resultValueYellow, { fontSize: sizes.value + 14 }]} adjustsFontSizeToFit numberOfLines={1}>
                  {formatCurrency(Math.round(remainingAmount).toString())}
                </Text>
                <Text style={[styles.resultUnitWhite, { fontSize: sizes.label + 2 }]}>Vnđ</Text>
              </View>
            </View>

            <View style={styles.switchRow}>
              <Text style={[styles.switchLabel, { fontSize: sizes.base + 4 }]}>Đã trả đủ tiền</Text>
              <Switch
                value={paidInFull}
                onValueChange={setPaidInFull}
                trackColor={{ false: '#cbd5e1', true: Colors.success }}
                thumbColor="#fff"
              />
            </View>
          </View>

          {/* 16. Dynamic Grid Tables */}
          {tables.map((tableIdx) => (
            <View key={tableIdx} style={styles.gridCard}>
              <View style={styles.gridHeader}>
                <Text style={styles.gridTitle}>BẢNG {tableIdx + 1}</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{Math.min(25, Object.keys(records).filter(k => parseInt(k) >= tableIdx*25 && parseInt(k) < (tableIdx+1)*25 && records[parseInt(k)] !== '').length)} bao</Text>
                </View>
              </View>

              <View style={styles.gridColHeaders}>
                {['C1', 'C2', 'C3', 'C4', 'C5'].map(c => (
                  <Text key={c} style={styles.gridColText}>{c}</Text>
                ))}
              </View>

              <View style={styles.gridBody}>
                {[0, 1, 2, 3, 4].map((rowIdx) => (
                  <View key={rowIdx} style={styles.gridRow}>
                    {[0, 1, 2, 3, 4].map((colIdx) => renderGridCell(tableIdx, colIdx, rowIdx))}
                  </View>
                ))}
              </View>

              <View style={styles.gridFooter}>
                {[0, 1, 2, 3, 4].map(colIdx => (
                  <Text key={colIdx} style={styles.footerValue}>{calculateColumnTotal(tableIdx, colIdx)}</Text>
                ))}
              </View>

              <View style={styles.tableTotalArea}>
                <Text style={styles.totalLabel}>TỔNG KHỐI LƯỢNG BẢNG {tableIdx + 1}</Text>
                <Text style={styles.totalValue}>{calculateTableTotal(tableIdx)} <Text style={styles.totalUnit}>KG</Text></Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal for Tare Edit */}
      <Modal
        visible={isTareModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsTareModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalFlex}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setIsTareModalVisible(false)}
          >
            <TouchableWithoutFeedback>
              <View style={styles.modernTareCard}>
                <View style={styles.modalHeaderHeader}>
                  <Text style={styles.modalTitleText}>CÀI ĐẶT TRỪ BÌ</Text>
                  <TouchableOpacity onPress={() => setIsTareModalVisible(false)} style={styles.modalCloseBtn}>
                    <Ionicons name="close" size={24} color={Colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalBody}>
                  <Text style={styles.modalSubtitleText}>Thiết lập số bao tương ứng trên 1kg</Text>
                  <View style={styles.mainInputContainer}>
                    <TextInput
                      style={styles.bigNumberInput}
                      value={tempTareValue}
                      onChangeText={(t) => setTempTareValue(t.replace(/[^0-9]/g, ''))}
                      keyboardType="number-pad"
                      autoFocus={true}
                      maxLength={2}
                    />
                    <Text style={styles.suffixText}>BAO / 1KG</Text>
                  </View>
                  <View style={styles.infoAlertBox}>
                    <Ionicons name="information-circle" size={20} color="#0369a1" />
                    <Text style={styles.infoAlertText}>1 lần cân = 1 bao. Thay đổi này chỉ cho nông dân này.</Text>
                  </View>
                </View>

                <View style={styles.modalFooterActions}>
                  <TouchableOpacity style={styles.cancelModalBtn} onPress={() => setIsTareModalVisible(false)}>
                    <Text style={styles.cancelModalBtnText}>HỦY</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.confirmActionBtn} onPress={handleSaveLocalTare}>
                    <Text style={styles.confirmActionText}>LƯU LẠI</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#f1f5f9' },
  flex1: { flex: 1 },
  headerContainer: { backgroundColor: '#1d71d4', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, paddingBottom: 15, elevation: 10, shadowColor: '#1d71d4', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 10, zIndex: 100 },
  header: { height: 60, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, justifyContent: 'space-between' },
  roundBtn: { width: 40, height: 40, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { color: 'white', fontWeight: '900', letterSpacing: 1 },
  statusPill: { backgroundColor: 'rgba(0,0,0,0.2)', paddingHorizontal: 12, paddingVertical: 2, borderRadius: 15, marginTop: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  statusPillText: { color: 'white', fontSize: 12, fontWeight: '800' },
  unlockBtn: { backgroundColor: '#c62828', flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, elevation: 4, borderWidth: 1, borderColor: '#fff' },
  unlockBtnActive: { backgroundColor: Colors.success },
  unlockBtnText: { color: 'white', fontWeight: '900', marginLeft: 4, fontSize: 13 },
  gearBtn: { padding: 10, marginLeft: -10 },
  scrollContent: { padding: 12, paddingBottom: 100 },
  resultsBanner: { backgroundColor: '#c62828', paddingVertical: 12, alignItems: 'center', borderRadius: 15, marginBottom: 15, elevation: 5 },
  resultsBannerText: { color: 'white', fontSize: 20, fontWeight: '900', letterSpacing: 2 },
  formContainer: { backgroundColor: 'white', borderRadius: 24, padding: 18, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 10, borderWidth: 1, borderColor: '#f0f0f0' },
  inputGroup: { marginBottom: 15 },
  fieldLabel: { fontSize: 13, fontWeight: '900', color: '#c62828', marginBottom: 8, marginLeft: 4 },
  fieldHeading: { fontSize: 16, fontWeight: '900', color: '#333', marginBottom: 8, marginLeft: 4 },
  inputBox: { height: 54, borderRadius: 14, borderWidth: 1.5, borderColor: '#cbd5e1', flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', overflow: 'hidden' },
  inputBoxSuccess: { borderColor: Colors.success },
  inputBoxWithIcon: { height: 54, borderRadius: 14, borderWidth: 1.5, borderColor: '#cbd5e1', paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff' },
  bgLocked: { backgroundColor: '#f8fafc' },
  inputText: { flex: 1, height: '100%', fontWeight: '900', color: Colors.text, paddingLeft: 12, paddingRight: 0, paddingVertical: 0 },
  italic: { fontStyle: 'italic' },
  textCenter: { textAlign: 'center', paddingRight: 12 },
  textRight: { textAlign: 'right', paddingRight: 0 },
  divider: { height: 1.5, backgroundColor: '#f1f5f9', marginVertical: 12 },
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, marginLeft: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#000', marginLeft: 8 },
  resultBoxYellow: { backgroundColor: '#ffff8d', height: 70, borderRadius: 18, borderWidth: 2.5, borderColor: Colors.black, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 15, elevation: 4 },
  resultBoxSuccess: { backgroundColor: '#f0fdf4', borderColor: Colors.success },
  resultBoxNavy: { backgroundColor: '#0f172a', height: 80, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 15, elevation: 6 },
  resultValue: { fontWeight: '900', color: Colors.black, flex: 1, textAlign: 'center' },
  resultValueYellow: { fontWeight: '900', color: '#ffff00', flex: 1, textAlign: 'center' },
  resultUnit: { fontSize: 16, fontWeight: '900', color: Colors.danger, marginLeft: 6, marginTop: 10 },
  resultUnitRed: { fontSize: 16, fontWeight: '900', color: Colors.danger, marginLeft: 6, marginTop: 10 },
  resultUnitWhite: { fontSize: 16, fontWeight: '900', color: 'white', marginLeft: 6, marginTop: 10 },
  unitSuffix: { fontSize: 16, fontWeight: '900', color: Colors.text, marginRight: 12 },
  unitSuffixRed: { fontSize: 16, fontWeight: '900', color: Colors.danger, marginRight: 12 },
  guideNoteRed: { color: Colors.danger, fontSize: 13, fontStyle: 'italic', marginTop: 6, textAlign: 'center', fontWeight: '700' },
  guideNoteGreen: { color: Colors.success, fontSize: 13, fontStyle: 'italic', marginTop: 6, textAlign: 'center', fontWeight: '700' },
  guideNoteDark: { color: '#64748b', fontSize: 13, fontStyle: 'italic', marginTop: 6, textAlign: 'center', fontWeight: '700' },
  valueTextBold: { fontWeight: '900', color: Colors.danger, flex: 1, textAlign: 'right' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, paddingVertical: 15, borderTopWidth: 1.5, borderTopColor: '#f1f5f9' },
  switchLabel: { fontSize: 20, fontWeight: '900', color: Colors.success },
  gridCard: { backgroundColor: 'white', borderRadius: 24, overflow: 'hidden', elevation: 5, marginTop: 20, marginBottom: 20, borderWidth: 1, borderColor: '#e2e8f0' },
  gridHeader: { backgroundColor: '#1b5e20', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15 },
  gridTitle: { color: 'white', fontSize: 16, fontWeight: '900' },
  badge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
  badgeText: { color: 'white', fontWeight: '800', fontSize: 13 },
  gridColHeaders: { flexDirection: 'row', backgroundColor: '#f8fafc', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  gridColText: { flex: 1, textAlign: 'center', paddingVertical: 12, fontSize: 14, fontWeight: '900', color: '#1b5e20' },
  gridBody: { padding: 5 },
  gridRow: { flexDirection: 'row', gap: 4, marginBottom: 4 },
  gridCell: { flex: 1, height: 48, backgroundColor: '#f8fafc', borderRadius: 6, borderWidth: 1, borderColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' },
  activeGridCell: { backgroundColor: '#fff9c4', borderWidth: 2, borderColor: Colors.danger },
  gridInput: { width: '100%', height: '100%', textAlign: 'center', fontWeight: '900', color: '#000' },
  cellText: { fontWeight: 'bold', color: '#333' },
  emptyDash: { color: '#e2e8f0', fontWeight: 'bold' },
  gridFooter: { flexDirection: 'row', backgroundColor: '#fffbeb' },
  footerValue: { flex: 1, textAlign: 'center', paddingVertical: 14, fontSize: 16, fontWeight: '900', color: Colors.black },
  tableTotalArea: { backgroundColor: '#f8fafc', paddingVertical: 20, alignItems: 'center', borderTopWidth: 2, borderTopColor: '#1b5e20' },
  totalLabel: { fontSize: 11, fontWeight: '900', color: '#64748b', letterSpacing: 2, marginBottom: 5 },
  totalValue: { fontSize: 48, fontWeight: '900', color: Colors.danger },
  totalUnit: { fontSize: 14, fontWeight: '900', color: Colors.textSecondary, marginTop: -5 },
  modalFlex: { flex: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modernTareCard: { backgroundColor: 'white', borderRadius: 28, width: '100%', maxWidth: 360, overflow: 'hidden', elevation: 25 },
  modalHeaderHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 25, paddingTop: 25, paddingBottom: 15 },
  modalCloseBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' },
  modalTitleText: { fontSize: 18, fontWeight: '900', color: Colors.text },
  modalSubtitleText: { fontSize: 14, color: '#64748b', fontWeight: '600', marginBottom: 15, textAlign: 'center' },
  modalBody: { paddingHorizontal: 25, paddingBottom: 25 },
  mainInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 16, borderWidth: 1.5, borderColor: '#e2e8f0', height: 64, paddingHorizontal: 20, marginBottom: 20, justifyContent: 'center' },
  bigNumberInput: { fontSize: 32, fontWeight: '900', color: Colors.danger, textAlign: 'right', minWidth: 50, paddingRight: 8 },
  suffixText: { fontSize: 16, fontWeight: '900', color: Colors.textSecondary },
  infoAlertBox: { flexDirection: 'row', backgroundColor: '#f0f9ff', padding: 15, borderRadius: 18, borderWidth: 1, borderColor: '#e0f2fe', alignItems: 'flex-start' },
  infoAlertText: { flex: 1, fontSize: 13, color: '#0369a1', fontWeight: '700', marginLeft: 10, lineHeight: 18 },
  modalFooterActions: { padding: 15, backgroundColor: '#f8fafc', borderTopWidth: 1, borderTopColor: '#f1f5f9', flexDirection: 'row', gap: 12 },
  cancelModalBtn: { flex: 1, height: 50, borderRadius: 14, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  cancelModalBtnText: { fontSize: 15, fontWeight: '800', color: '#64748b' },
  confirmActionBtn: { flex: 2, backgroundColor: Colors.primary, height: 50, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  confirmActionText: { fontSize: 15, fontWeight: '900', color: 'white' },
});

export default WeighingSessionScreen;
