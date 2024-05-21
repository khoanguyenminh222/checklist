import { View, Text, SafeAreaView, ScrollView, RefreshControl, TextInput, Image, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native'
import React, { useCallback, useState, useEffect, useRef } from 'react'
import { StatusBar } from 'expo-status-bar';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons'
import Header from '../components/Header';
import { useUser } from '../UserProvider';
import { domain, listSubmitRoute } from '../api/BaseURL';
import MapDisplay from '../components/MapDisplay';
import LocationComponent from '../components/LocationComponent';

const History = ({ navigation }) => {
  const { user, isLogin } = useUser();
  const [refreshing, setRefreshing] = useState(false);
  const [histories, setHistories] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
  const [loading, setLoading] = useState(false);
  const [endOfList, setEndOfList] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentLatitude, setCurrentLatitude] = useState(null); // State để lưu trữ vĩ độ
  const [currentLongitude, setCurrentLongitude] = useState(null); // State để lưu trữ kinh độ

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    navigation.reset({
      index: 0, // Chỉ định màn hình đầu tiên trong danh sách
      routes: [{ name: 'History' }],
    });
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  useEffect(() => {
    // Kiểm tra trạng thái đăng nhập khi màn hình được tạo
    if (!isLogin()) {
      navigation.replace('Login'); // Nếu chưa đăng nhập, chuyển hướng đến màn hình đăng nhập
    }
  }, [navigation]);

  const fetchListSubmit = async (isRefreshing = false) => {
    try {
      setLoading(true);
      const response = await axios.get(`${domain}${listSubmitRoute}?page=${isRefreshing ? 1 : page}&pageSize=${pageSize}&search=${search}&role=${user.role}&userId=${user._id}`); // lấy ra danh sánh listSubmit
      const newData = response.data.checklistSubmissions;
      if (isRefreshing) {
        setHistories(newData); // Nếu là làm mới, đặt dữ liệu mới
        setPage(2); // Thiết lập trang mới là 2, vì đã lấy dữ liệu từ trang 1 rồi
      } else {
        setHistories(prevWorkList => [...prevWorkList, ...newData]); // Nếu không là làm mới, nối dữ liệu mới vào dữ liệu cũ
        setPage(prevPage => prevPage + 1);
      }
      if (newData.length === 0) {
        setEndOfList(true);
      }
    } catch (error) {
      console.error('Error fetching work list:', error);
    } finally {
      setLoading(false);
      if (isRefreshing) {
        setRefreshing(false);
      }
    }
  }


  useEffect(() => {
    fetchListSubmit(false);
  }, [])

  const renderItem = ({ item }) => (
    <View className="px-5 pb-5 mt-5 mb-2 bg-white rounded-2xl w-11/12">
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
        {item.checkedItems.map((checkedItem, index) => (
          <Text className="text-base mb-2" key={index}>- {checkedItem.name}</Text>
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
      <Text className="text-lg font-bold mt-3">Vị trí:</Text>
      <MapDisplay latitude={item.location.latitude} longitude={item.location.longitude} isDraggable={false} currentLatitude={currentLatitude} currentLongitude={currentLongitude} />
      {item.process == 1 ?

        <View className="flex flex-row items-center mt-3">
          <Ionicons name="checkmark-circle-outline" size={22} color="green" />
          <Text className="text-green-500 text-lg ml-2 capitalize">Đã xử lý</Text>
        </View>
        :
        <View className="flex flex-row items-center mt-3">
          <Text className="text-red-500 text-lg capitalize">Chưa xử lý</Text>
        </View>
      }
    </View>
  );

  const handleLoadMore = () => {
    if (!loading && !endOfList) {
      fetchListSubmit();
    }
  };

  const handleSearchChange = (text) => {
    setSearch(text);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500); // Thời gian chờ sau mỗi lần thay đổi, có thể điều chỉnh

    return () => {
      clearTimeout(timeoutId);
    };
  }, [search]);

  useEffect(() => {
    fetchListSubmit(true);
  }, [debouncedSearch]);

  const handleLocationChange = (latitude, longitude) => {
    if (latitude && longitude) {
      setCurrentLatitude(latitude); // Cập nhật vĩ độ
      setCurrentLongitude(longitude); // Cập nhật kinh độ
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <StatusBar style="dark" />
      <Header screenName="History" navigation={navigation} />
      <View className="w-11/12 mx-auto flex flex-row justify-between items-center bg-white rounded-full px-4 py-2 shadow-md">
        <TextInput
          className="flex-1 text-xl outline-none"
          placeholder='Tìm kiếm'
          value={search}
          onChangeText={handleSearchChange}
        />
      </View>
      <FlatList
        data={histories}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{ alignItems: 'center', paddingBottom: 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListFooterComponent={loading ? <ActivityIndicator /> : null}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
      />
      <LocationComponent onLocationChange={handleLocationChange} />
    </SafeAreaView>
  )
}

export default History