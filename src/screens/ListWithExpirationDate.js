import { View, Text, SafeAreaView, StatusBar, ScrollView, Image, RefreshControl } from 'react-native'
import React, { useCallback, useState, useEffect } from 'react'
import axios from 'axios';
import Header from '../components/Header'
import MapDisplay from '../components/MapDisplay';
import { useUser } from '../UserProvider';
import { domain, listSubmitRoute } from '../api/BaseURL';

const ListWithExpirationDate = ({ navigation, route }) => {
    const { user, isLogin } = useUser();
    const [itemsWith15DaysLeft, setItemsWith15DaysLeft] = useState([]);
    useEffect(() => {
        const fetchItemExpired = async () => {
            try {
                const response = await axios.get(`${domain}${listSubmitRoute}/getAll`,{
                    params: {role: user.role, userId: user._id}
                });
                const listSubmits = response.data;
                // Lấy ra ngày hiện tại
                const currentDate = new Date();
                // Tính toán ngày hết hạn chỉ còn lại 15 ngày cho mỗi phần tử trong mảng
                const dataWithExpirationDate = listSubmits.map(item => {
                    const expirationDate = new Date(item.dateExpired);
                    const timeDifference = expirationDate.getTime() - currentDate.getTime();
                    const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));
                    item.daysLeft = daysDifference;
                    return item;
                });
                // Lọc ra các phần tử chỉ còn lại 15 ngày hoặc ít hơn
                const itemDaysLeft = dataWithExpirationDate.filter(item => item.daysLeft <= 15 && item.daysLeft >= 0);
                setItemsWith15DaysLeft(itemDaysLeft);
            } catch (error) {
                console.log(error)
            }
        }
        // Nếu không có dữ liệu truyền qua từ route.params, thì fetch dữ liệu mới
        if (route.params && route.params.itemsWith15DaysLeft) {
            setItemsWith15DaysLeft(route.params.itemsWith15DaysLeft);
        } else {
            fetchItemExpired();
        }
    }, [route.params]); // Sử dụng route.params như dependency để kích hoạt useEffect khi route.params thay đổi
    
    const [refreshing, setRefreshing] = useState(false);
    useEffect(() => {
        // Kiểm tra trạng thái đăng nhập khi màn hình được tạo
        if (!isLogin()) {
            navigation.replace('Login'); // Nếu chưa đăng nhập, chuyển hướng đến màn hình đăng nhập
        }
    }, [navigation]);

      const onRefresh = useCallback(() => {
        setRefreshing(true);
        navigation.reset({
          index: 0, // Chỉ định màn hình đầu tiên trong danh sách
          routes: [{ name: 'ListWithExpirationDate' }],
        });
        setTimeout(() => {
          setRefreshing(false);
        }, 2000);
      }, []);
    return (
        <SafeAreaView className="flex-1 bg-gray-100">
            <StatusBar style="dark" />
            <Header screenName="Sắp đến hạn" navigation={navigation} />
            <ScrollView
                contentContainerStyle={{ alignItems: 'center', marginBottom: 20 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {Array.isArray(itemsWith15DaysLeft) && itemsWith15DaysLeft.map((item, index) => (
                    <View key={index} className="px-5 pb-5 mt-5 mb-2 bg-white rounded-2xl w-11/12">
                        <Text className="text-lg font-bold mt-5">Nhân viên:</Text>
                        <Text className="text-base mt-1">
                            {item.userId.fullname} - {item.userId.username}
                        </Text>
                        <Text className="text-lg font-bold mt-5">Tên Khách Hàng:</Text>
                        <Text className="text-base mt-1">{item.customerName}</Text>
                        <Text className="text-lg font-bold mt-5">Địa chỉ:</Text>
                        <Text className="text-base mt-1">{item.address}
                            {item.pho && item.pho.tenPho && `, ${item.pho.tenPho}`}
                            {item.phuong && item.phuong.tenPhuong && `, ${item.phuong.tenPhuong}`}
                            {item.quan && item.quan.tenQuan && `, ${item.quan.tenQuan}`}
                        </Text>
                        <Text className="text-lg font-bold mt-5">Số Điện Thoại:</Text>
                        <Text className="text-base mt-1">{item.phoneNumber}</Text>
                        <Text className="text-lg font-bold mt-5">Tài khoản vnpt:</Text>
                        <Text className="text-base mt-1">{item.vnptAccount || "Không có tài khoản"}</Text>
                        <Text className="text-lg font-bold mt-5">Ngày Kiểm Tra:</Text>
                        <Text className="text-base mt-1">{new Date(item.date).toLocaleDateString()}</Text>
                        <Text className="text-lg font-bold mt-5">Ngày hết hạn:</Text>
                        <Text className="text-base mt-1 text-red-500">{new Date(item.dateExpired).toLocaleDateString()}</Text>
                        <Text className="text-lg font-bold mt-5">Nhà mạng:</Text>
                        <Text className="text-base mt-1">{item.networks || "Không có ghi chú"}</Text>
                        <Text className="text-lg font-bold mt-5">Ghi Chú:</Text>
                        <Text className="text-base mt-1">{item.note || "Không có ghi chú"}</Text>
                        <Text className="text-lg font-bold mt-5">Các Mục Đã Kiểm Tra:</Text>
                        <View className="text-base ml-2">
                            {item.checkedItems.map((i, index) => (
                                <Text className="text-base mb-2" key={index}>- {i.name}</Text>
                            ))}
                        </View>
                        {item.image && (
                            <View className='flex items-center justify-center mt-5'>
                                <Image
                                    source={{ uri: domain + item.image }}
                                    className='w-40 h-40 rounded-md'
                                />
                            </View>
                        )}
                        <Text className="text-lg font-bold mt-3">Location:</Text>
                        <Text className="text-base mt-1">{item.location.latitude}, {item.location.longitude}</Text>
                        <MapDisplay latitude={item.location.latitude} longitude={item.location.longitude} />
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    )
}

export default ListWithExpirationDate