import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    FlatList,
    Dimensions,
    Platform,
    Animated,
    Alert,
    PanResponder
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons, Ionicons, Entypo } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { getFarmersByVessel, Vessel, Farmer, deleteFarmer } from '../database/db';
import { useFontSettings } from '../context/FontSizeContext';

const { width } = Dimensions.get('window');

const FarmerDetailScreen = ({ navigation, route }: any) => {
    const { vessel } = route.params as { vessel: Vessel };
    const { sizes, colors } = useFontSettings();
    const [farmers, setFarmers] = useState<Farmer[]>([]);
    const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const isExpandedRef = useRef(false);

    const expandAnim = useRef(new Animated.Value(0)).current;

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (evt, gestureState) => {
                return Math.abs(gestureState.dy) > 10;
            },
            onPanResponderRelease: (evt, gestureState) => {
                if (gestureState.dy < -40 && !isExpandedRef.current) {
                    toggleExpand();
                } else if (gestureState.dy > 20 && isExpandedRef.current) {
                    toggleExpand();
                }
            },
        })
    ).current;

    const loadData = async () => {
        try {
            const data = await getFarmersByVessel(vessel.id);
            setFarmers(data);
        } catch (error) {
            console.error('Error loading farmers:', error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const toggleExpand = () => {
        const toValue = isExpandedRef.current ? 0 : 1;
        Animated.spring(expandAnim, {
            toValue,
            useNativeDriver: false,
            friction: 8,
            tension: 40
        }).start();

        const newState = !isExpandedRef.current;
        setIsExpanded(newState);
        isExpandedRef.current = newState;
    };

    const handleDeleteFarmer = (farmer: Farmer) => {
        Alert.alert("Xác nhận xóa", `Bạn có chắc chắn muốn xóa nông dân ${farmer.name}?`, [
            { text: "Hủy", style: "cancel", onPress: () => setActiveMenuId(null) },
            {
                text: "Xóa",
                style: "destructive",
                onPress: async () => {
                    try {
                        await deleteFarmer(farmer);
                        loadData();
                        setActiveMenuId(null);
                    } catch (error) {
                        console.error('Error deleting farmer:', error);
                    }
                }
            }
        ]);
    };

    const formatNumber = (num: number) => {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    const calculateNetWeight = (item: Farmer) => {
        // Use default value if impurity or count is null/undefined
        const currentImpurity = item.impurity || 0;
        const currentCount = item.count || 0;
        const currentWeight = item.weight || 0;
        const currentBagsPerKg = item.bagsPerKg || 8;

        const tare = currentCount / currentBagsPerKg;
        const net = currentWeight - tare - currentImpurity;
        return net > 0 ? net : 0; // Prevent negative weight
    };

    const totalWeight = farmers.reduce((acc, curr) => acc + (curr.weight || 0), 0);
    const totalCount = farmers.reduce((acc, curr) => acc + (curr.count || 0), 0);
    const totalAmount = farmers.reduce((acc, curr) => acc + ((curr.price || 0) * (curr.weight || 0)), 0);
    const totalDeposit = farmers.reduce((acc, curr) => acc + (curr.deposit || 0), 0);
    const totalPaid = farmers.reduce((acc, curr) => acc + (curr.paid || 0), 0);
    const totalRemaining = totalAmount - totalDeposit - totalPaid;

    const sheetHeight = expandAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [180, 520]
    });

    const renderFarmerItem = ({ item, index }: { item: Farmer, index: number }) => (
        <View style={styles.cardWrapper}>
            <TouchableOpacity
                activeOpacity={0.9}
                style={styles.card}
                onPress={() => setActiveMenuId(null)}
            >
                {/* Header: Tên và Nút chức năng */}
                <View style={styles.cardHeader}>
                    <View style={styles.headerLeft}>
                        <View style={styles.indexBadge}>
                            <Text style={styles.indexText}>{farmers.length - index}</Text>
                        </View>
                        <View>
                            <Text style={[styles.farmerName, { fontSize: sizes.title }]} numberOfLines={1}>{item.name.toUpperCase()}</Text>
                            <Text style={[styles.timeText, { fontSize: sizes.subtitle }]}>23/05/2026 02:03</Text>
                        </View>
                    </View>
                    <View style={styles.headerRightActions}>
                        <TouchableOpacity
                            style={styles.maximizeBtn}
                            onPress={() => navigation.navigate('WeighingSession', { farmer: item })}
                        >
                            <Feather name="maximize" size={16} color="#9a3412" />
                            <Text style={styles.maximizeBtnText}>MỞ</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setActiveMenuId(activeMenuId === item.id ? null : item.id)}
                            style={styles.menuTrigger}
                        >
                            <Entypo name="dots-three-vertical" size={20} color={Colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Hàng hóa */}
                <View style={styles.goodsRow}>
                    <Text style={[styles.goodsLabel, { fontSize: sizes.base }]}>Hàng hóa: </Text>
                    <Text style={[styles.goodsValue, { fontSize: sizes.base }]}>{item.goodsName || 'Chưa cập nhật'}</Text>
                </View>

                {/* Khối Thống kê: KG và LẦN */}
                <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                        <View style={styles.statLabelRow}>
                            <MaterialCommunityIcons name="scale-balance" size={18} color={Colors.danger} />
                            <Text style={[styles.statLabelMain, { fontSize: Math.min(sizes.label, 14) }]}> K/Lượng còn lại</Text>
                        </View>
                        <Text style={styles.statLabelSub}>(đã trừ bì)</Text>
                        <View style={styles.valueWrap}>
                            <Text style={[styles.statValueRed, { fontSize: sizes.value }]} numberOfLines={1} adjustsFontSizeToFit>{formatNumber(item.weight || 0)}</Text>
                            <Text style={[styles.unitSmall, { fontSize: Math.min(sizes.subtitle, 14) }]}> KG</Text>
                        </View>
                    </View>

                    <View style={styles.statVerticalDivider} />

                    <View style={styles.statBox}>
                        <View style={styles.statLabelRow}>
                            <MaterialCommunityIcons name="archive-outline" size={18} color={Colors.primary} />
                            <Text style={[styles.statLabelMain, { fontSize: Math.min(sizes.label, 14) }]}> Lần cân</Text>
                        </View>
                        <Text style={styles.statLabelSub}>(tổng số bao)</Text>
                        <View style={styles.valueWrap}>
                            <Text style={[styles.statValueBlue, { fontSize: sizes.value, color: colors.primaryText }]} numberOfLines={1} adjustsFontSizeToFit>{item.count}</Text>
                            <Text style={[styles.unitSmall, { fontSize: Math.min(sizes.subtitle, 14) }]}> LẦN</Text>
                        </View>
                    </View>
                </View>

                {/* Thông tin tiền bạc */}
                <View style={styles.moneyContainer}>
                    <View style={styles.moneyRow}>
                        <Text style={[styles.moneyLabel, { fontSize: sizes.label }]}>Đơn giá:</Text>
                        <Text style={[styles.moneyValue, { fontSize: sizes.base }]} numberOfLines={1} adjustsFontSizeToFit>{formatNumber(item.price)} Đ</Text>
                    </View>
                    <View style={styles.moneyRow}>
                        <Text style={[styles.moneyLabel, { fontSize: sizes.label }]}>Thành tiền:</Text>
                        <Text style={[styles.moneyValueBold, { fontSize: sizes.base }]} numberOfLines={1} adjustsFontSizeToFit>{formatNumber((item.price || 0) * (item.weight || 0))} Đ</Text>
                    </View>
                    <View style={styles.moneyRow}>
                        <Text style={[styles.moneyLabel, { fontSize: sizes.label, color: '#d97706' }]}>Đặt cọc:</Text>
                        <Text style={[styles.moneyValue, { fontSize: sizes.base, color: '#d97706' }]} numberOfLines={1} adjustsFontSizeToFit>{formatNumber(item.deposit || 0)} Đ</Text>
                    </View>
                    <View style={styles.moneyRow}>
                        <Text style={[styles.moneyLabel, { fontSize: sizes.label }]}>Đã trả:</Text>
                        <Text style={[styles.moneyValue, { fontSize: sizes.base }]} numberOfLines={1} adjustsFontSizeToFit>{formatNumber(item.paid || 0)} Đ</Text>
                    </View>
                </View>

                {/* Còn lại */}
                <View style={styles.footerRow}>
                    <View style={styles.footerLeft}>
                        <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                        <Text style={[styles.footerLabel, { fontSize: sizes.base }]}> CÒN LẠI:</Text>
                    </View>
                    <Text style={[styles.footerValue, { fontSize: sizes.value }]} numberOfLines={1} adjustsFontSizeToFit>{formatNumber(((item.price || 0) * (item.weight || 0)) - (item.deposit || 0) - (item.paid || 0))} Đ</Text>
                </View>

                {activeMenuId === item.id && (
                    <View style={styles.contextMenu}>
                        <TouchableOpacity style={styles.menuAction} onPress={() => { }}>
                            <Feather name="edit-2" size={18} color={Colors.primary} />
                            <Text style={styles.menuActionText}>Sửa</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.menuAction} onPress={() => handleDeleteFarmer(item)}>
                            <Feather name="trash-2" size={18} color={Colors.danger} />
                            <Text style={[styles.menuActionText, { color: Colors.danger }]}>Xóa</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.mainContainer}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <View style={styles.headerContainer}>
                <SafeAreaView edges={['top']}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.roundIconButton}>
                            <Ionicons name="chevron-back" size={26} color="white" />
                        </TouchableOpacity>

                        <View style={styles.headerCenter}>
                            <Text style={[styles.headerTitle, { fontSize: sizes.title }]} numberOfLines={1}>{vessel.name.toUpperCase()}</Text>
                            <View style={styles.statusPill}>
                                <Text style={[styles.statusPillText, { fontSize: sizes.subtitle }]} numberOfLines={1} adjustsFontSizeToFit>{formatNumber(totalWeight)} KG / {totalCount} PHIẾU</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.headerAddBtn}
                            onPress={() => navigation.navigate('AddFarmer', {
                                vesselId: vessel.id
                            })}
                        >
                            <Ionicons name="add" size={22} color="black" />
                            <Text style={[styles.headerAddText, { fontSize: sizes.subtitle }]}>THÊM</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </View>

            <FlatList
                data={farmers}
                renderItem={renderFarmerItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listPadding}
                showsVerticalScrollIndicator={false}
                onScroll={() => setActiveMenuId(null)}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <View style={styles.guideBoxDetail}>
                            <Text style={styles.guideTitleDetail}>CHƯA CÓ NÔNG DÂN</Text>
                            <View style={styles.guideStepDetail}>
                                <View style={styles.stepNumDetail}><Text style={styles.stepNumTextDetail}>1</Text></View>
                                <Text style={[styles.guideTextDetail, { fontSize: sizes.base }]}>Bấm nút <Text style={styles.boldYellowDetail}>[+ THÊM]</Text> ở góc trên bên phải.</Text>
                            </View>
                            <View style={styles.guideStepDetail}>
                                <View style={styles.stepNumDetail}><Text style={styles.stepNumTextDetail}>2</Text></View>
                                <Text style={[styles.guideTextDetail, { fontSize: sizes.base }]}>Nhập <Text style={styles.boldBlueDetail}>Tên nông dân</Text> và đơn giá thỏa thuận.</Text>
                            </View>
                        </View>
                        <View style={styles.arrowContainerDetail}>
                            <MaterialCommunityIcons name="arrow-up-bold" size={50} color="#ffb300" />
                            <Text style={styles.arrowTextDetail}>Bấm ở đây để thêm</Text>
                        </View>
                    </View>
                )}
            />

            <Animated.View
                style={[styles.summarySheet, { height: sheetHeight }]}
                {...panResponder.panHandlers}
            >
                <View style={styles.handleBar} />

                <View style={styles.summaryHeader}>
                    <View style={styles.summaryTitleCol}>
                        <Text style={[styles.summaryTitle, { fontSize: sizes.title }]}>TỔNG CỘNG</Text>
                        <Text style={[styles.summarySub, { fontSize: sizes.subtitle }]}>{farmers.length} nông dân</Text>
                    </View>
                    <TouchableOpacity style={styles.detailBtn} onPress={toggleExpand}>
                        <Text style={[styles.detailBtnText, { fontSize: sizes.subtitle }]}>{isExpanded ? 'Thu gọn' : 'Xem chi tiết'}</Text>
                        <Ionicons name={isExpanded ? "chevron-down" : "chevron-up"} size={16} color={Colors.primary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.summaryGrid}>
                    <View style={styles.summaryBoxRed}>
                        <Text style={styles.sumBoxLabel}>TỔNG KHỐI LƯỢNG</Text>
                        <Text style={[styles.sumBoxValueRed, { fontSize: sizes.value }]} numberOfLines={1} adjustsFontSizeToFit>{formatNumber(totalWeight)} <Text style={styles.unitSmallSum}>KG</Text></Text>
                    </View>
                    <View style={styles.summaryBoxGreen}>
                        <Text style={styles.sumBoxLabel}>CÒN LẠI CẦN TRẢ</Text>
                        <Text style={[styles.sumBoxValueGreen, { fontSize: sizes.value }]} numberOfLines={1} adjustsFontSizeToFit>{formatNumber(totalRemaining)} <Text style={styles.unitSmallSum}>Đ</Text></Text>
                    </View>
                </View>

                {isExpanded && (
                    <View style={styles.expandedContent}>
                        <View style={styles.expandedRow}>
                            <View style={styles.expandedLeft}>
                                <MaterialCommunityIcons name="clipboard-text-outline" size={20} color={Colors.primaryDark} />
                                <Text style={[styles.expandedLabel, { fontSize: sizes.base }]}> Tổng số phiếu cân</Text>
                            </View>
                            <Text style={[styles.expandedValueBlue, { fontSize: sizes.title }]}>{totalCount} Lần</Text>
                        </View>
                        <View style={styles.divider} />

                        <View style={styles.expandedRow}>
                            <View style={styles.expandedLeft}>
                                <MaterialCommunityIcons name="currency-usd" size={20} color="#333" />
                                <Text style={[styles.expandedLabel, { fontSize: sizes.base }]}> Tổng thành tiền</Text>
                            </View>
                            <Text style={[styles.expandedValue, { fontSize: sizes.title }]} numberOfLines={1} adjustsFontSizeToFit>{formatNumber(totalAmount)} Đ</Text>
                        </View>

                        <View style={styles.expandedRow}>
                            <View style={styles.expandedLeft}>
                                <MaterialCommunityIcons name="cash-fast" size={20} color="#d97706" />
                                <Text style={[styles.expandedLabel, { fontSize: sizes.base }]}> Tổng tiền cọc</Text>
                            </View>
                            <Text style={[styles.expandedValue, { color: '#d97706', fontSize: sizes.title }]} numberOfLines={1} adjustsFontSizeToFit>{formatNumber(totalDeposit)} Đ</Text>
                        </View>

                        <View style={styles.expandedRow}>
                            <View style={styles.expandedLeft}>
                                <Ionicons name="checkmark-done-circle-outline" size={20} color={Colors.success} />
                                <Text style={[styles.expandedLabel, { fontSize: sizes.base }]}> Tổng đã thanh toán</Text>
                            </View>
                            <Text style={[styles.expandedValue, { color: Colors.success, fontSize: sizes.title }]} numberOfLines={1} adjustsFontSizeToFit>{formatNumber(totalPaid)} Đ</Text>
                        </View>
                    </View>
                )}
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: '#f1f5f9' },
    headerContainer: {
        backgroundColor: '#1d71d4',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        paddingBottom: 15,
        elevation: 10,
        shadowColor: '#1d71d4',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        zIndex: 1 // Đảm bảo header không đè lên content khi dùng zIndex
    },
    header: { height: 60, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, justifyContent: 'space-between' },
    roundIconButton: { width: 40, height: 40, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
    headerCenter: { flex: 1, alignItems: 'center', paddingHorizontal: 10 },
    headerTitle: { color: 'white', fontWeight: '900', letterSpacing: 1 },
    statusPill: { backgroundColor: 'rgba(0,0,0,0.2)', paddingHorizontal: 12, paddingVertical: 2, borderRadius: 15, marginTop: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
    statusPillText: { color: 'white', fontWeight: '800' },
    headerAddBtn: { backgroundColor: '#ffb300', flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, elevation: 4 },
    headerAddText: { color: 'black', fontWeight: '900', marginLeft: 4 },
    listPadding: { padding: 15, paddingBottom: 220 },
    cardWrapper: { marginBottom: 15 },
    card: { backgroundColor: 'white', borderRadius: 24, padding: 18, marginBottom: 5, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#f0f0f0' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#f8f9fa', paddingBottom: 10 },
    headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, overflow: 'hidden' },
    indexBadge: { backgroundColor: Colors.success, width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    indexText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
    farmerName: { fontWeight: '900', color: '#1a1c1e' },
    timeText: { color: '#64748b', marginTop: 2 },
    headerRightActions: { flexDirection: 'row', alignItems: 'center' },
    menuTrigger: { padding: 8, marginLeft: 5 },
    maximizeBtn: { backgroundColor: '#fff7ed', flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: '#ffedd5' },
    maximizeBtnText: { fontWeight: '900', marginLeft: 6, color: '#9a3412', fontSize: 13 },
    goodsRow: { flexDirection: 'row', marginBottom: 15, paddingHorizontal: 5 },
    goodsLabel: { fontWeight: '800', color: '#1a1c1e' },
    goodsValue: { color: '#64748b', fontWeight: '600' },
    statsRow: { flexDirection: 'row', backgroundColor: '#f8fafd', borderRadius: 20, padding: 15, marginBottom: 15, alignItems: 'center' },
    statBox: { flex: 1, alignItems: 'center', overflow: 'hidden', paddingHorizontal: 2 },
    statVerticalDivider: { width: 1, height: '80%', backgroundColor: '#dee2e6', marginHorizontal: 5 },
    statLabelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
    statLabelMain: { fontWeight: '900', color: '#475569' },
    statLabelSub: { fontSize: 9, color: '#64748b', marginBottom: 6 },
    statValueRed: { fontWeight: '900', color: Colors.danger },
    statValueBlue: { fontWeight: '900' },
    unitSmall: { fontSize: 12, fontWeight: '800', color: '#333' },
    valueWrap: { flexDirection: 'row', alignItems: 'baseline', width: '100%', justifyContent: 'center' },
    moneyContainer: { marginBottom: 15 },
    moneyRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' },
    moneyLabel: { fontWeight: '700', color: '#475569', marginRight: 10 },
    moneyValue: { fontWeight: '800', color: '#1a1c1e', flex: 1, textAlign: 'right' },
    moneyValueBold: { fontWeight: '900', color: '#1a1c1e', flex: 1, textAlign: 'right' },
    footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 15, borderTopWidth: 1.5, borderTopColor: '#f1f5f9' },
    footerLeft: { flexDirection: 'row', alignItems: 'center', flexShrink: 0 },
    footerLabel: { fontWeight: '900', color: '#1a1c1e' },
    footerValue: { fontWeight: '900', color: Colors.success, flex: 1, textAlign: 'right', marginLeft: 10 },
    summarySheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 20,
        paddingBottom: Platform.OS === 'ios' ? 40 : 25,
        elevation: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -12 },
        shadowOpacity: 0.25,
        shadowRadius: 24,
        overflow: 'visible',
        zIndex: 2000,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)'
    },
    handleBar: { width: 50, height: 6, backgroundColor: '#cbd5e1', borderRadius: 3, alignSelf: 'center', marginTop: 12, marginBottom: 5 },
    summaryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 15 },
    summaryTitleCol: { flex: 1 },
    summaryTitle: { fontWeight: '900', color: '#991b1b', letterSpacing: 1 },
    summarySub: { color: '#64748b', fontWeight: '600' },
    detailBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
    detailBtnText: { color: '#1d71d4', fontWeight: '800', marginRight: 4 },
    summaryGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    summaryBoxRed: { width: '48%', backgroundColor: '#fee2e2', borderRadius: 15, padding: 15, alignItems: 'center', overflow: 'hidden' },
    summaryBoxGreen: { width: '48%', backgroundColor: '#dcfce7', borderRadius: 15, padding: 15, alignItems: 'center', overflow: 'hidden' },
    sumBoxLabel: { fontSize: 10, fontWeight: '800', color: '#64748b', marginBottom: 5 },
    sumBoxValueRed: { fontWeight: '900', color: '#e53935', width: '100%', textAlign: 'center' },
    sumBoxValueGreen: { fontWeight: '900', color: '#43a047', width: '100%', textAlign: 'center' },
    unitSmallSum: { fontSize: 12, fontWeight: '800' },
    expandedContent: { marginTop: 5 },
    expandedRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, flexWrap: 'wrap' },
    expandedLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10, minWidth: 150 },
    expandedLabel: { fontWeight: '700', color: '#1a1c1e' },
    expandedValue: { fontWeight: '800', color: '#1a1c1e', flexShrink: 1 },
    expandedValueBlue: { fontWeight: '900', color: '#004aad', flexShrink: 1 },
    divider: { height: 1, backgroundColor: '#f1f5f9', width: '100%' },
    contextMenu: { position: 'absolute', top: 50, right: 15, backgroundColor: 'white', borderRadius: 12, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.2, shadowRadius: 10, zIndex: 1000, padding: 10, minWidth: 100 },
    menuAction: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 5 },
    menuActionText: { fontSize: 13, fontWeight: 'bold', marginLeft: 10, color: '#333' },
    emptyContainer: {
        flex: 1,
        paddingHorizontal: 30,
        paddingTop: 80, // Tăng padding top để bảng không quá sát Header
        alignItems: 'center',
        zIndex: 1000 // Đảm bảo toàn bộ container rỗng nằm trên cùng
    },
    guideBoxDetail: { backgroundColor: 'white', padding: 25, borderRadius: 24, width: '100%', elevation: 8, shadowColor: '#004aad', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, borderWidth: 1, borderColor: '#f0f4ff' },
    guideTitleDetail: { fontSize: 20, fontWeight: '900', color: '#004aad', textAlign: 'center', marginBottom: 20, letterSpacing: 1 },
    guideStepDetail: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    stepNumDetail: { backgroundColor: '#f0f7ff', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 15, borderWidth: 1.5, borderColor: '#0056b3' },
    stepNumTextDetail: { color: '#0056b3', fontWeight: 'bold', fontSize: 16 },
    guideTextDetail: { flex: 1, color: '#333', lineHeight: 24, fontWeight: '500' },
    boldYellowDetail: { color: '#e6a100', fontWeight: '900' },
    boldBlueDetail: { color: '#0056b3', fontWeight: '900' },
    arrowContainerDetail: {
        position: 'absolute',
        top: -5, // Đẩy mũi tên cao lên hẳn để không bị header che
        right: 0,
        alignItems: 'center',
        elevation: 20
    },
    arrowTextDetail: {
        color: '#e6a100', // Màu vàng rực hơn để tương phản tốt
        fontWeight: '900',
        fontSize: 16,
        marginBottom: 5,
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
});

export default FarmerDetailScreen;
