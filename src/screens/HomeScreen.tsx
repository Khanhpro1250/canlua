import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Pressable,
  Animated,
  Dimensions,
  StatusBar,
  FlatList,
  Alert
} from 'react-native';
import { Feather, MaterialIcons, MaterialCommunityIcons, Ionicons, Entypo, FontAwesome5 } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import CustomDrawerContent from '../components/CustomDrawerContent';
import AddItemScreen from './AddItemScreen';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.82;

interface ListItem {
  id: string;
  name: string;
  phone: string;
  date: string;
  weight: number;
  count: number;
}

const HomeScreen = () => {
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [items, setItems] = useState<ListItem[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<ListItem | null>(null);

  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const openSidebar = () => {
    setSidebarVisible(true);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeSidebar = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -DRAWER_WIDTH,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setSidebarVisible(false);
    });
  };

  const handleSaveItem = (itemData: ListItem) => {
    if (editingItem) {
      setItems(items.map(item => item.id === itemData.id ? itemData : item));
    } else {
      setItems([itemData, ...items]);
    }
    setAddModalVisible(false);
    setEditingItem(null);
    setActiveMenuId(null);
  };

  const handleEdit = (item: ListItem) => {
    setEditingItem(item);
    setAddModalVisible(true);
  };

  const formatWeight = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const toggleItemMenu = (id: string) => {
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  const handleDelete = (id: string) => {
    Alert.alert("Xác nhận", "Bạn có chắc chắn muốn xóa mục này?", [
      { text: "Hủy", style: "cancel" },
      { text: "Xóa", style: "destructive", onPress: () => {
        setItems(items.filter(i => i.id !== id));
        setActiveMenuId(null);
      }}
    ]);
  };

  const renderItem = ({ item }: { item: ListItem }) => (
    <View style={styles.cardWrapper}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.headerIconBg}>
            <MaterialCommunityIcons name="ship-wheel" size={28} color="#0056b3" />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.itemTitle}>{item.name.toUpperCase()}</Text>
            <View style={styles.dateRow}>
              <Feather name="clock" size={12} color={Colors.textSecondary} />
              <Text style={styles.dateText}> Ngày tạo: {item.date}/2026</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => toggleItemMenu(item.id)} style={styles.menuTrigger}>
            <Entypo name="dots-three-vertical" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>K/L còn lại</Text>
            <View style={styles.statValueRow}>
              <Text style={styles.statValueOrange}>{formatWeight(item.weight)}</Text>
              <Text style={styles.statUnit}> KG</Text>
            </View>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Lần cân (bao)</Text>
            <View style={styles.statValueRow}>
              <Text style={styles.statValueBlue}>{item.count}</Text>
              <Text style={styles.statUnit}> LẦN</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.phoneRow}>
            <Feather name="smartphone" size={18} color="#0056b3" />
            <Text style={styles.phoneNumber}>{item.phone || "Chưa cập nhật"}</Text>
          </View>
          <TouchableOpacity style={styles.intoScaleBtn}>
            <Text style={styles.intoScaleBtnText}>VÀO CÂN</Text>
            <Feather name="chevron-right" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {activeMenuId === item.id && (
        <View style={styles.contextMenu}>
          <TouchableOpacity style={styles.menuAction} onPress={() => handleEdit(item)}>
            <Feather name="edit-2" size={18} color={Colors.primary} />
            <Text style={styles.menuActionText}>Sửa</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuAction} onPress={() => handleDelete(item.id)}>
            <Feather name="trash-2" size={18} color={Colors.secondary} />
            <Text style={[styles.menuActionText, { color: Colors.secondary }]}>Xóa</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuAction} onPress={() => {}}>
            <Feather name="mail" size={18} color="#4caf50" />
            <Text style={[styles.menuActionText, { color: "#4caf50" }]}>Email</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Sidebar Modal */}
      <Modal transparent={true} visible={isSidebarVisible} onRequestClose={closeSidebar}>
        <View style={styles.modalContainer}>
          <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
            <Pressable style={styles.flex1} onPress={closeSidebar} />
          </Animated.View>
          <Animated.View style={[styles.sidebarContent, { transform: [{ translateX: slideAnim }] }]}>
            <CustomDrawerContent onClose={closeSidebar} />
          </Animated.View>
        </View>
      </Modal>

      {/* Add/Edit Item Modal */}
      <Modal visible={isAddModalVisible} animationType="slide" presentationStyle="fullScreen">
        <AddItemScreen
          navigation={{ goBack: () => {
            setAddModalVisible(false);
            setEditingItem(null);
          }}}
          route={{ params: {
            onSave: handleSaveItem,
            editItem: editingItem
          }}}
        />
      </Modal>

      <View style={styles.headerArea}>
        <SafeAreaView>
          <View style={styles.header}>
            <TouchableOpacity onPress={openSidebar} style={styles.headerIcon}>
              <Feather name="menu" size={28} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Danh sách Ghe/Xe</Text>
            <View style={{ width: 40 }} />
          </View>
        </SafeAreaView>
      </View>

      <View style={styles.dateHeader}>
        <MaterialCommunityIcons name="calendar-month" size={20} color="#0056b3" />
        <Text style={styles.dateHeaderText}>HÔM NAY: 23/5/2026</Text>
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <View style={styles.guideBox}>
            <Text style={styles.guideTextTitle}>CHƯA CÓ DỮ LIỆU</Text>
            <View style={styles.guideStep}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
              <Text style={styles.guideText}>Bấm vào nút <Text style={styles.boldYellow}>[+ THÊM MỚI]</Text> ở góc dưới bên phải màn hình.</Text>
            </View>
            <View style={styles.guideStep}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
              <Text style={styles.guideText}>Nhập tên <Text style={styles.boldBlue}>GHE hoặc XE</Text> và số điện thoại.</Text>
            </View>
            <View style={styles.guideStep}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
              <Text style={styles.guideText}>Bấm <Text style={styles.boldGreen}>[LƯU LẠI]</Text> để bắt đầu cân lúa.</Text>
            </View>
          </View>

          <View style={styles.arrowContainer}>
             <Text style={styles.arrowText}>Bấm ở đây để thêm</Text>
             <MaterialCommunityIcons name="arrow-down" size={50} color="#ffb300" />
          </View>
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          onScroll={() => setActiveMenuId(null)}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setEditingItem(null);
          setAddModalVisible(true);
        }}
      >
        <Ionicons name="add" size={28} color="black" />
        <Text style={styles.fabText}>THÊM MỚI</Text>
      </TouchableOpacity>

      <View style={styles.summaryBar}>
        <View style={styles.summaryCol}>
          <View style={styles.labelRow}>
            <MaterialCommunityIcons name="scale-balance" size={16} color="#adb5bd" />
            <Text style={styles.summaryLabel}>TỔNG KHỐI LƯỢNG</Text>
          </View>
          <Text style={styles.summaryValueYellow}>0 <Text style={styles.unitSmall}>KG</Text></Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryCol}>
          <View style={styles.labelRow}>
            <MaterialCommunityIcons name="text-box-check-outline" size={16} color="#adb5bd" />
            <Text style={styles.summaryLabel}>TỔNG PHIẾU CÂN</Text>
          </View>
          <Text style={styles.summaryValueWhite}>0 <Text style={styles.unitSmall}>PHIẾU</Text></Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f8fafd',
  },
  headerArea: {
    backgroundColor: '#1d71d4',
    paddingBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    height: 60,
  },
  headerIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  dateHeaderText: {
    color: '#004aad',
    fontWeight: '900',
    fontSize: 18,
    marginLeft: 8,
  },
  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 180,
  },
  cardWrapper: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerIconBg: {
    width: 50,
    height: 50,
    backgroundColor: '#eaf2ff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 15,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#004aad',
    marginBottom: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  menuTrigger: {
    padding: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#f3f7ff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#dee2e6',
    marginHorizontal: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#333', // Đậm hơn để dễ đọc dưới nắng
    fontWeight: '800',
    marginBottom: 8,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  statValueOrange: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#e65100',
  },
  statValueBlue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0d47a1',
  },
  statUnit: {
    fontSize: 13,
    fontWeight: '900',
    color: '#333',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneNumber: {
    fontSize: 17,
    fontWeight: '800',
    color: '#000', // Đen tuyệt đối để dễ đọc số điện thoại
    marginLeft: 8,
  },
  intoScaleBtn: {
    backgroundColor: '#0056b3', // Xanh đậm hơn
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  intoScaleBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 5,
  },
  fab: {
    position: 'absolute',
    bottom: 120, // Đẩy lên cao hơn để không dính vào thanh summary
    right: 20,
    backgroundColor: '#ffb300',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 28,
    elevation: 10,
    shadowColor: '#ffb300',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    borderWidth: 2,
    borderColor: 'white',
  },
  fabText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    marginLeft: 5,
  },
  summaryBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 110,
    backgroundColor: '#003a8c', // Xanh Midnight (cùng tông với Header nhưng đậm hơn)
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 30,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    elevation: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  summaryCol: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 10,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#495057',
  },
  summaryLabel: {
    color: '#e2e8f0', // Trắng xanh (độ tương phản cao hơn xám)
    fontSize: 12,
    fontWeight: '900', // Cực đậm để không bị lóa
    marginLeft: 5,
    letterSpacing: 0.5,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  summaryValueYellow: {
    color: '#ffff00', // Vàng chanh neon (cực kỳ bắt mắt dưới nắng)
    fontSize: 28,
    fontWeight: '900',
  },
  summaryValueWhite: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '900',
  },
  unitSmall: {
    fontSize: 12,
    color: '#adb5bd',
    fontWeight: 'normal',
  },
  contextMenu: {
    position: 'absolute',
    top: 50,
    right: 15,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    zIndex: 1000,
    padding: 10,
    minWidth: 120,
  },
  menuAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuActionText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  emptyStateContainer: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 50,
  },
  guideBox: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 24,
    width: '100%',
    elevation: 10,
    shadowColor: '#004aad',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    borderWidth: 1,
    borderColor: '#f0f4ff',
  },
  guideTextTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0056b3',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 1,
  },
  guideStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  stepNumber: {
    backgroundColor: '#f0f7ff',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 1.5,
    borderColor: '#0056b3',
  },
  stepNumberText: {
    color: '#0056b3',
    fontWeight: 'bold',
    fontSize: 16,
  },
  guideText: {
    flex: 1,
    fontSize: 17,
    color: '#333',
    lineHeight: 24,
    fontWeight: '500',
  },
  boldYellow: {
    color: '#e6a100',
    fontWeight: '900',
  },
  boldBlue: {
    color: '#0056b3',
    fontWeight: '900',
  },
  boldGreen: {
    color: '#2e7d32',
    fontWeight: '900',
  },
  arrowContainer: {
    position: 'absolute',
    bottom: 190, // Đẩy lên theo nút FAB
    right: 40,
    alignItems: 'center',
    zIndex: 10,
  },
  arrowText: {
    color: '#d97706', // Màu cam đất sang hơn vàng tươi
    fontWeight: '800',
    fontSize: 15,
    marginBottom: 5,
    fontStyle: 'italic',
  },
  flex1: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sidebarContent: {
    width: DRAWER_WIDTH,
    height: '100%',
    backgroundColor: Colors.drawerBackground,
  },
});

export default HomeScreen;
