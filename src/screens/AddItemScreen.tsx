import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

const { height } = Dimensions.get('window');

const AddItemScreen = ({ navigation, route }: any) => {
  const editItem = route.params?.editItem;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isFocused, setIsFocused] = useState<string | null>(null);

  useEffect(() => {
    if (editItem) {
      setName(editItem.name);
      setPhone(editItem.phone);
    }
  }, [editItem]);

  const onSave = () => {
    if (!name.trim()) return;

    const itemData = {
      id: editItem ? editItem.id : Date.now().toString(),
      name: name,
      phone: phone,
      date: editItem ? editItem.date : '23/05',
      weight: editItem ? editItem.weight : 0,
      count: editItem ? editItem.count : 0
    };

    if (route.params?.onSave) {
      route.params.onSave(itemData);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      <SafeAreaView style={styles.headerSafe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
            <Ionicons name="close" size={28} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{editItem ? 'Sửa thông tin' : 'Thêm mới'}</Text>
          <TouchableOpacity
            style={[styles.saveBtnSmall, !name.trim() && styles.disabledBtn]}
            onPress={onSave}
            disabled={!name.trim()}
          >
            <Text style={styles.saveBtnSmallText}>Lưu</Text>
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
        >
          <View style={styles.illustrationSection}>
            <View style={styles.iconCircle}>
               <MaterialCommunityIcons
                 name={editItem ? "square-edit-outline" : "ship-wheel"}
                 size={50}
                 color={Colors.primary}
               />
            </View>
            <Text style={styles.screenIntro}>
              {editItem ? 'Cập nhật thông tin Ghe/Xe' : 'Nhập thông tin vận chuyển mới'}
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tên Ghe hoặc Xe <Text style={styles.required}>*</Text></Text>
              <View style={[
                styles.inputContainer,
                isFocused === 'name' && styles.inputFocused,
                !name.trim() && isFocused !== 'name' && styles.inputError
              ]}>
                <Feather name="edit-3" size={20} color={isFocused === 'name' ? Colors.primary : Colors.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="Ví dụ: Ghe Út Nhỏ, Xe tải 5t..."
                  placeholderTextColor="#adb5bd"
                  value={name}
                  onChangeText={setName}
                  onFocus={() => setIsFocused('name')}
                  onBlur={() => setIsFocused(null)}
                  maxLength={25}
                />
              </View>
              <View style={styles.inputFooter}>
                <Text style={styles.hint}>Tối đa 25 ký tự</Text>
                <Text style={styles.counter}>{name.length}/25</Text>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Số điện thoại liên hệ</Text>
              <View style={[
                styles.inputContainer,
                isFocused === 'phone' && styles.inputFocused
              ]}>
                <Feather name="phone" size={20} color={isFocused === 'phone' ? Colors.primary : Colors.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="Không bắt buộc"
                  placeholderTextColor="#adb5bd"
                  value={phone}
                  onChangeText={setPhone}
                  onFocus={() => setIsFocused('phone')}
                  onBlur={() => setIsFocused(null)}
                  keyboardType="phone-pad"
                  maxLength={15}
                />
              </View>
              <View style={styles.inputFooter}>
                <Text style={styles.hint}>Để liên lạc khi cần thiết</Text>
                <Text style={styles.counter}>{phone.length}/15</Text>
              </View>
            </View>

            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color={Colors.primary} />
              <Text style={styles.infoBoxText}>
                {editItem
                  ? 'Mọi thay đổi sẽ được cập nhật ngay vào danh sách và các phiếu cân liên quan.'
                  : 'Thông tin này sẽ được dùng để tạo phiếu cân lúa mới trong ngày hôm nay.'}
              </Text>
            </View>
          </View>

          <View style={styles.footerActions}>
            <TouchableOpacity style={styles.mainSaveBtn} onPress={onSave}>
              <Text style={styles.mainSaveBtnText}>{editItem ? 'CẬP NHẬT NGAY' : 'XÁC NHẬN LƯU'}</Text>
              <Ionicons name={editItem ? "checkmark-circle" : "arrow-forward"} size={20} color="white" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  flex1: {
    flex: 1,
  },
  headerSafe: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  closeBtn: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  saveBtnSmall: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 12,
  },
  saveBtnSmallText: {
    color: 'white',
    fontWeight: 'bold',
  },
  disabledBtn: {
    backgroundColor: '#e9ecef',
  },
  scrollContent: {
    padding: 25,
    paddingBottom: 50,
  },
  illustrationSection: {
    alignItems: 'center',
    marginBottom: 35,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  screenIntro: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 25,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 10,
    marginLeft: 2,
  },
  required: {
    color: Colors.secondary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#f1f3f5',
    paddingHorizontal: 15,
    height: 60,
  },
  inputFocused: {
    borderColor: Colors.primary,
    backgroundColor: 'white',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
  },
  inputError: {
    borderColor: '#ffdad6',
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: Colors.text,
    fontWeight: '600',
    marginLeft: 12,
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingHorizontal: 5,
  },
  hint: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  counter: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#e7f0ff',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  infoBoxText: {
    flex: 1,
    fontSize: 13,
    color: Colors.primaryDark,
    marginLeft: 10,
    fontWeight: '500',
    lineHeight: 18,
  },
  footerActions: {
    marginTop: 40,
  },
  mainSaveBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    borderRadius: 18,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  mainSaveBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '900',
    marginRight: 10,
    letterSpacing: 1,
  },
});

export default AddItemScreen;
