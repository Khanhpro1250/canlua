import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

const { width } = Dimensions.get('window');

interface Props {
  onClose?: () => void;
}

const CustomDrawerContent = ({ onClose }: Props) => {
  return (
    <View style={styles.container}>
      {/* Header Profile Section */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.logoContainer}>
            <MaterialCommunityIcons name="scale-balance" size={32} color={Colors.white} />
          </View>
          <TouchableOpacity style={styles.exitButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Cân Lúa Mekong</Text>
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>Phiên bản 5.3.14</Text>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.idSection}>
          <Text style={styles.idLabel}>ID THIẾT BỊ</Text>
          <Text style={styles.idValue}>D23ED70</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CẤU HÌNH CÂN</Text>
          <View style={styles.card}>
            <MenuItem
              icon={<MaterialCommunityIcons name="bluetooth-connect" size={24} color={Colors.primary} />}
              label="Kết nối Bluetooth"
              status="Đã ngắt"
              statusColor={Colors.secondary}
            />
            <MenuItem
              icon={<MaterialCommunityIcons name="archive-arrow-down-outline" size={24} color={Colors.success} />}
              label="Trừ bì"
            />
            <MenuItem
              icon={<MaterialCommunityIcons name="form-select" size={24} color="#673ab7" />}
              label="Quy cách nhập"
            />
            <MenuItem
              icon={<MaterialCommunityIcons name="format-size" size={24} color="#ff9800" />}
              label="Kích cỡ chữ"
            />
            <MenuItem
              icon={<MaterialCommunityIcons name="text-to-speech" size={24} color="#00bcd4" />}
              label="Đọc số thành tiếng"
            />
            <MenuItem
              icon={<MaterialCommunityIcons name="cog-outline" size={24} color="#607d8b" />}
              label="Cài đặt hệ thống"
            />
            <MenuItem
              icon={<MaterialCommunityIcons name="history" size={24} color={Colors.primary} />}
              label="Nhật ký cân"
              isLast
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>HỖ TRỢ</Text>
          <View style={styles.card}>
            <MenuItem
              icon={<Ionicons name="help-buoy-outline" size={24} color="#e91e63" />}
              label="Yêu cầu trợ giúp"
            />
            <MenuItem
              icon={<Ionicons name="book-outline" size={24} color="#3f51b5" />}
              label="Hướng dẫn sử dụng"
            />
            <MenuItem
              icon={<Ionicons name="information-circle-outline" size={24} color="#4caf50" />}
              label="Về phần mềm"
              isLastItem
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2024 Mekong Tech</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const MenuItem = ({ icon, label, status, statusColor, isLast }: any) => (
  <TouchableOpacity style={[styles.menuItem, isLast && { borderBottomWidth: 0 }]}>
    <View style={styles.menuItemLeft}>
      <View style={styles.iconWrapper}>{icon}</View>
      <Text style={styles.menuItemLabel}>{label}</Text>
    </View>
    <View style={styles.menuItemRight}>
      {status && <Text style={[styles.statusText, { color: statusColor }]}>{status}</Text>}
      <Ionicons name="chevron-forward" size={18} color={Colors.grey} />
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.drawerBackground,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: 60,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomRightRadius: 30,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exitButton: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 12,
  },
  headerInfo: {
    marginTop: 20,
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  versionContainer: {
    marginTop: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  versionText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.9,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  idSection: {
    margin: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffebee',
    elevation: 2,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  idLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  idValue: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.secondary,
    marginTop: 5,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.textSecondary,
    marginBottom: 10,
    marginLeft: 5,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
    color: Colors.text,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    marginRight: 8,
  },
  footer: {
    marginTop: 10,
    alignItems: 'center',
    paddingBottom: 20,
  },
  footerText: {
    color: Colors.grey,
    fontSize: 12,
  },
});

export default CustomDrawerContent;
