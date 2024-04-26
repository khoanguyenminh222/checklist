import { View, Text, SafeAreaView, ScrollView, RefreshControl, TextInput } from 'react-native'
import React, { useCallback, useState, useEffect } from 'react'
import { StatusBar } from 'expo-status-bar';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons'
import Header from '../components/Header';
import { useUser } from '../UserProvider';
import { domain, listSubmitRoute } from '../api/BaseURL';

const History = ({ navigation }) => {
  const { isLogin } = useUser();
  const [refreshing, setRefreshing] = useState(false);
  const [histories, setHistories] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [endOfList, setEndOfList] = useState(false);

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

  const fetchListSubmit = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${domain}${listSubmitRoute}?page=${page}`); // lấy ra danh sánh listSubmit
      const newData = response.data;
      if (newData.checklistSubmissions.length === 0) {
          setEndOfList(true);
      } else {
          setHistories(prevWorkList => [...prevWorkList, ...newData.checklistSubmissions]);
          setPage(prevPage => prevPage + 1);
      }
    } catch (error) {
      console.error('Error fetching work list:', error);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    fetchListSubmit();
  }, [])

  const handleScroll = ({ nativeEvent }) => {
    if (isCloseToBottom(nativeEvent) && !loading && !endOfList) {
      fetchListSubmit();
    }
  };

  const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
      const paddingToBottom = 20;
      return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
  };

  const handelSearch = async (text) => {
    setSearch(text)
    try {
      const response = await axios.get(`${domain}${listSubmitRoute}/search?query=${text}`);
      setHistories(response.data);
      console.log(response.data)
    } catch (error) {
      console.error('Error fetching list submissions by query:', error);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      <Header screenName="History" navigation={navigation} />
      <TextInput className="h-14 border-b border-gray-200 text-xl px-2"
        placeholder='Tìm kiếm'
        value={search}
        onChangeText={(text) => handelSearch(text)}
      />
      <ScrollView
        onScroll={handleScroll}
        contentContainerStyle={{ alignItems: 'center', marginBottom: 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {histories.map((history, index) => (
          <View key={index} className="px-5 pb-5 mt-5 mb-2 bg-gray-100 rounded-2xl w-11/12">
            <Text className="text-lg font-bold mt-5">Nhân viên:</Text>
            <Text className="text-base mt-1">
              {history.userId.fullname} - {history.userId.username}
            </Text>
            <Text className="text-lg font-bold mt-5">Tên Khách Hàng:</Text>
            <Text className="text-base mt-1">{history.customerName}</Text>
            <Text className="text-lg font-bold mt-5">Quận/Huyện:</Text>
            <Text className="text-base mt-1">{history.district}</Text>
            <Text className="text-lg font-bold mt-5">Số Điện Thoại:</Text>
            <Text className="text-base mt-1">{history.phoneNumber}</Text>
            <Text className="text-lg font-bold mt-5">Địa Chỉ:</Text>
            <Text className="text-base mt-1">{history.address}</Text>
            <Text className="text-lg font-bold mt-5">Tài khoản vnpt:</Text>
            <Text className="text-base mt-1">{history.vnptAccount || "Không có tài khoản"}</Text>
            <Text className="text-lg font-bold mt-5">Ngày Kiểm Tra:</Text>
            <Text className="text-base mt-1">{new Date(history.date).toLocaleDateString()}</Text>
            <Text className="text-lg font-bold mt-5">Ghi Chú:</Text>
            <Text className="text-base mt-1">{history.note || "Không có ghi chú"}</Text>
            <Text className="text-lg font-bold mt-5">Các Mục Đã Kiểm Tra:</Text>
            <View className="text-base ml-2">
              {history.checkedItems.map((item, index) => (
                <Text className="text-base mb-2" key={index}>- {item.name}</Text> // Thay `item.name` bằng trường thông tin bạn muốn hiển thị về mục kiểm tra
              ))}
            </View>
          </View>
        ))}
        {loading && <Ionicons name="reload-circle-outline" size={40} color="gray" />}
        {endOfList && <Text style={{ textAlign: 'center', marginBottom: 10 }}>Hết</Text>}
      </ScrollView>
    </SafeAreaView>
  )
}

export default History