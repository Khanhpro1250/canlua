import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  Animated,
  Dimensions,
  StatusBar,
  FlatList,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialIcons, MaterialCommunityIcons, Ionicons, Entypo } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import CustomDrawerContent from '../components/CustomDrawerContent';
import AddItemScreen from './AddItemScreen';
import { initDatabase, getVessels, deleteVessel, Vessel } from '../database/db';
import { useFontSettings } from '../context/FontSizeContext';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.82;

const formatWeight = (num: number) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const VesselItem = ({ item, index, totalItems, activeMenuId, setActiveMenuId, handleEdit, handleDelete, handleIntoScale }: any) => {
  const { sizes, colors } = useFontSettings();

  return (
    <View style={styles.cardWrapper}>
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.card}
        onPress={() => setActiveMenuId(null)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View style={styles.indexBadge}>
              <Text style={styles.indexText}>{totalItems - index}</Text>
            </View>
            <View style={styles.headerIconBg}>
              <MaterialCommunityIcons name="ship-wheel" size={24} color="#0056b3" />
            </View>
            <View style={styles.headerInfo}>
              <Text style={[styles.itemTitle, { fontSize: sizes.title }]} numberOfLines={1}>{item.name.toUpperCase()}</Text>
              <View style={styles.dateRow}>
                <Feather name="clock" size={12} color={Colors.textSecondary} />
                <Text style={[styles.dateText, { fontSize: sizes.subtitle }]}> Ngày tạo: {item.dateStr}/2026</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity onPress={() => setActiveMenuId(activeMenuId === item.id ? null : item.id)} style={styles.menuTrigger}>
            <Entypo name="dots-three-vertical" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={[styles.statLabel, { fontSize: sizes.label }]}>K/L CÒN LẠI</Text>
            <View style={styles.statValueRow}>
              <Text style={[styles.statValueOrange, { fontSize: sizes.value }]} numberOfLines={1} adjustsFontSizeToFit>{formatWeight(item.weight)}</Text>
              <Text style={[styles.statUnit, { fontSize: sizes.subtitle }]}> KG</Text>
            </View>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={[styles.statLabel, { fontSize: sizes.label }]}>LẦN CÂN (BAO)</Text>
            <View style={styles.statValueRow}>
              <Text style={[styles.statValueBlue, { fontSize: sizes.value, color: colors.primaryText }]} numberOfLines={1} adjustsFontSizeToFit>{item.count}</Text>
              <Text style={[styles.statUnit, { fontSize: sizes.subtitle }]}> LẦN</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.phoneRow}>
            <Feather name="smartphone" size={18} color="#0056b3" />
            <Text style={[styles.phoneNumber, { fontSize: sizes.base }]} numberOfLines={1} adjustsFontSizeToFit>{item.phone || "---"}</Text>
          </View>
          <TouchableOpacity style={styles.intoScaleBtn} onPress={() => handleIntoScale(item)}>
            <Text style={[styles.intoScaleBtnText, { fontSize: sizes.base }]}>VÀO CÂN</Text>
            <Feather name="chevron-right" size={18} color="white" />
          </TouchableOpacity>
        </View>

        {activeMenuId === item.id && (
          <View style={styles.contextMenu}>
            <TouchableOpacity style={styles.menuAction} onPress={() => handleEdit(item)}>
              <Feather name="edit-2" size={18} color={Colors.primary} />
              <Text style={styles.menuActionText}>Sửa</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuAction} onPress={() => handleDelete(item)}>
              <Feather name="trash-2" size={18} color={Colors.danger} />
              <Text style={[styles.menuActionText, { color: Colors.danger }]}>Xóa</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const HomeScreen = ({ navigation }: any) => {
  const { sizes } = useFontSettings();
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const [editingVessel, setEditingVessel] = useState<Vessel | null>(null);

  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const loadData = async () => {
    try {
      await initDatabase();
      const data = await getVessels();
      setVessels(data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openSidebar = () => {
    setSidebarVisible(true);
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 350, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
    ]).start();
  };

  const closeSidebar = () => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: -DRAWER_WIDTH, duration: 300, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setSidebarVisible(false));
  };

  const handleDelete = (vessel: Vessel) => {
    Alert.alert("Xác nhận", `Bạn có chắc chắn muốn xóa ${vessel.name}?`, [
      { text: "Hủy", style: "cancel", onPress: () => setActiveMenuId(null) },
      { text: "Xóa", style: "destructive", onPress: async () => {
        await deleteVessel(vessel.id);
        loadData();
        setActiveMenuId(null);
      }}
    ]);
  };

  const handleEdit = (vessel: Vessel) => {
    setEditingVessel(vessel);
    setAddModalVisible(true);
  };

  const onSaveComplete = () => {
    setAddModalVisible(false);
    setEditingVessel(null);
    setActiveMenuId(null);
    loadData();
  };

  const handleIntoScale = (vessel: Vessel) => {
    navigation.navigate('FarmerDetail', { vessel });
  };

  const totalWeight = vessels.reduce((acc, curr) => acc + curr.weight, 0);
  const totalCount = vessels.length;

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <Modal transparent={true} visible={isSidebarVisible} onRequestClose={closeSidebar}>
        <View style={styles.modalContainer}>
          <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
            <Pressable style={styles.flex1} onPress={closeSidebar} />
          </Animated.View>
          <Animated.View style={[styles.sidebarContent, { transform: [{ translateX: slideAnim }] }]}>
            <CustomDrawerContent
              onClose={closeSidebar}
              navigation={navigation}
            />
          </Animated.View>
        </View>
      </Modal>

      <Modal visible={isAddModalVisible} animationType="slide" presentationStyle="fullScreen">
        <AddItemScreen
          navigation={{ goBack: () => { setAddModalVisible(false); setEditingVessel(null); } }}
          route={{ params: { onSaveSuccess: onSaveComplete, editItem: editingVessel } }}
        />
      </Modal>

      <View style={styles.headerArea}>
        <SafeAreaView edges={['top']}>
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
        <Text style={[styles.dateHeaderText, { fontSize: sizes.title }]}>HÔM NAY: 23/5/2026</Text>
      </View>

      {vessels.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <View style={styles.guideBox}>
            <Text style={styles.guideTextTitle}>CHƯA CÓ DỮ LIỆU</Text>
            <View style={styles.guideStep}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
              <Text style={[styles.guideText, { fontSize: sizes.base }]}>Bấm vào nút <Text style={styles.boldYellow}>[+ THÊM MỚI]</Text> ở góc dưới bên phải màn hình.</Text>
            </View>
            <View style={styles.guideStep}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
              <Text style={[styles.guideText, { fontSize: sizes.base }]}>Nhập tên <Text style={styles.boldBlue}>GHE hoặc XE</Text> và số điện thoại.</Text>
            </View>
            <View style={styles.guideStep}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
              <Text style={[styles.guideText, { fontSize: sizes.base }]}>Bấm <Text style={styles.boldGreen}>[LƯU LẠI]</Text> để bắt đầu cân lúa.</Text>
            </View>
          </View>
          <View style={styles.arrowContainer}>
             <Text style={styles.arrowText}>Bấm ở đây để thêm</Text>
             <MaterialCommunityIcons name="arrow-down" size={50} color="#ffb300" />
          </View>
        </View>
      ) : (
        <FlatList
          data={vessels}
          renderItem={({ item, index }) => (
            <VesselItem
              item={item}
              index={index}
              totalItems={vessels.length}
              activeMenuId={activeMenuId}
              setActiveMenuId={setActiveMenuId}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
              handleIntoScale={handleIntoScale}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          onScroll={() => setActiveMenuId(null)}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => { setEditingVessel(null); setAddModalVisible(true); }}>
        <Ionicons name="add" size={28} color="black" />
        <Text style={styles.fabText}>THÊM MỚI</Text>
      </TouchableOpacity>

      <View style={styles.summaryBar}>
        <View style={styles.summaryCol}>
          <View style={styles.labelRow}>
            <MaterialCommunityIcons name="scale-balance" size={16} color="#e2e8f0" />
            <Text style={styles.summaryLabel}>TỔNG KHỐI LƯỢNG</Text>
          </View>
          <Text style={[styles.summaryValueYellow, { fontSize: sizes.value + 4 }]} numberOfLines={1} adjustsFontSizeToFit>{formatWeight(totalWeight)} <Text style={styles.unitSmallSum}>KG</Text></Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryCol}>
          <View style={styles.labelRow}>
            <MaterialCommunityIcons name="text-box-check-outline" size={16} color="#e2e8f0" />
            <Text style={styles.summaryLabel}>TỔNG PHIẾU CÂN</Text>
          </View>
          <Text style={[styles.summaryValueWhite, { fontSize: sizes.value + 4 }]} numberOfLines={1} adjustsFontSizeToFit>{totalCount} <Text style={styles.unitSmallSum}>PHIẾU</Text></Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#f4f7fa' },
  headerArea: { backgroundColor: '#1d71d4', paddingBottom: 10 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, height: 60 },
  headerIcon: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  dateHeader: { flexDirection: 'row', alignItems: 'center', padding: 15 },
  dateHeaderText: { color: '#004aad', fontWeight: '900', marginLeft: 8 },
  listContent: { paddingHorizontal: 12, paddingBottom: 180 },
  cardWrapper: { marginBottom: 15 },
  card: { backgroundColor: 'white', borderRadius: 24, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4, borderWidth: 1, borderColor: '#eff2f5' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  indexBadge: { backgroundColor: Colors.success, width: 26, height: 26, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  indexText: { color: 'white', fontWeight: '900', fontSize: 13 },
  headerIconBg: { width: 44, height: 44, backgroundColor: '#f0f7ff', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  headerInfo: { flex: 1, marginLeft: 12 },
  itemTitle: { fontWeight: '900', color: '#1a1c1e', marginBottom: 2 },
  dateRow: { flexDirection: 'row', alignItems: 'center' },
  dateText: { color: Colors.textSecondary },
  menuTrigger: { padding: 5 },
  statsContainer: { flexDirection: 'row', backgroundColor: '#f8fafc', borderRadius: 18, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#f1f5f9' },
  statBox: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: '#e2e8f0', marginHorizontal: 5 },
  statLabel: { color: '#64748b', fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  statValueRow: { flexDirection: 'row', alignItems: 'baseline' },
  statValueOrange: { fontWeight: '900', color: '#e65100' },
  statValueBlue: { fontWeight: '900', color: '#0d47a1' },
  statUnit: { fontWeight: '900', color: '#333', marginLeft: 4 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 12 },
  phoneRow: { flexDirection: 'row', alignItems: 'center' },
  phoneNumber: { fontWeight: '900', color: '#1e293b', marginLeft: 8 },
  intoScaleBtn: { backgroundColor: '#1d71d4', flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 18, borderRadius: 12, elevation: 2 },
  intoScaleBtnText: { color: 'white', fontWeight: 'bold', marginRight: 5 },
  fab: { position: 'absolute', bottom: 120, right: 20, backgroundColor: '#ffb300', flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 22, borderRadius: 28, elevation: 10, shadowColor: '#ffb300', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.4, shadowRadius: 8, borderWidth: 2, borderColor: 'white' },
  fabText: { fontSize: 16, fontWeight: 'bold', color: 'black', marginLeft: 5 },
  summaryBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 110, backgroundColor: '#003a8c', flexDirection: 'row', alignItems: 'center', paddingBottom: 30, borderTopLeftRadius: 35, borderTopRightRadius: 35, elevation: 25, shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.3, shadowRadius: 15 },
  summaryCol: { flex: 1, alignItems: 'center', paddingTop: 10 },
  summaryDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.1)' },
  summaryLabel: { color: '#e2e8f0', fontSize: 12, fontWeight: '900', marginLeft: 5 },
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  summaryValueYellow: { color: '#ffff00', fontWeight: '900' },
  summaryValueWhite: { color: '#ffffff', fontWeight: '900' },
  unitSmallSum: { fontSize: 12, color: '#e2e8f0', fontWeight: 'normal' },
  contextMenu: { position: 'absolute', top: 50, right: 0, backgroundColor: 'white', borderRadius: 12, elevation: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 12, zIndex: 1000, padding: 8, minWidth: 120, borderWidth: 1, borderColor: '#f1f5f9' },
  menuAction: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
  menuActionText: { fontSize: 14, fontWeight: 'bold', marginLeft: 12, color: '#334155' },
  modalContainer: { flex: 1, flexDirection: 'row' },
  emptyStateContainer: { flex: 1, paddingHorizontal: 30, justifyContent: 'flex-start', alignItems: 'center', paddingTop: 50 },
  guideBox: { backgroundColor: 'white', padding: 25, borderRadius: 24, width: '100%', elevation: 10, shadowColor: '#004aad', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, borderWidth: 1, borderColor: '#f0f4ff' },
  guideTextTitle: { fontSize: 22, fontWeight: '900', color: '#0056b3', textAlign: 'center', marginBottom: 20, letterSpacing: 1 },
  guideStep: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  stepNumber: { backgroundColor: '#f0f7ff', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 15, borderWidth: 1.5, borderColor: '#0056b3' },
  stepNumberText: { color: '#0056b3', fontWeight: 'bold', fontSize: 16 },
  guideText: { flex: 1, color: '#333', lineHeight: 24, fontWeight: '500' },
  boldYellow: { color: '#e6a100', fontWeight: '900' },
  boldBlue: { color: '#0056b3', fontWeight: '900' },
  boldGreen: { color: '#2e7d32', fontWeight: '900' },
  arrowContainer: { position: 'absolute', bottom: 190, right: 40, alignItems: 'center', zIndex: 10 },
  arrowText: { color: '#d97706', fontWeight: '800', fontSize: 15, marginBottom: 5, fontStyle: 'italic' },
  flex1: { flex: 1 },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)' },
  sidebarContent: { width: DRAWER_WIDTH, height: '100%', backgroundColor: Colors.drawerBackground },
});

export default HomeScreen;
