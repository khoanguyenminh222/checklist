import { View, Text, StyleSheet, SafeAreaView, ScrollView, RefreshControl, TextInput } from 'react-native'
import React, { useCallback, useState, useEffect } from 'react'
import axios from 'axios';
import Header from '../components/Header';
import { useUser } from '../UserProvider';
import { domain, listSubmitRoute } from '../api/BaseURL';

const Report = ({ navigation }) => {
  const { isLogin } = useUser();
  const [refreshing, setRefreshing] = useState(false);
  const [reports, setReports] = useState([]);
  const [checkList, setCheckList] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    navigation.reset({
      index: 0, // Chỉ định màn hình đầu tiên trong danh sách
      routes: [{ name: 'Report' }],
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

  useEffect(() => {
    const fetchListSubmit = async () => {
      const response = await axios.get(`${domain}${listSubmitRoute}`); // lấy ra danh sánh listSubmit
      setReports(response.data);
    }
    fetchListSubmit();
  }, [])

  const handelSearch = async (text) => {
    setSearch(text)
    try {
      const response = await axios.get(`${domain}${listSubmitRoute}/search?query=${text}`);
      setReports(response.data);
      console.log(response.data)
    } catch (error) {
      console.error('Error fetching list submissions by query:', error);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header screenName="Report" navigation={navigation} />
      <TextInput className="h-14 border-b border-gray-200 mb-5 text-xl px-2"
        placeholder='Tìm kiếm'
        value={search}
        onChangeText={(text) => handelSearch(text)}
      />
      <ScrollView
        contentContainerStyle={{ alignItems: 'center', paddingTop: '20' }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {reports.map((report, index) => (
          <View key={index} className="px-5 pb-5 mb-5 bg-gray-100 rounded-2xl w-11/12">
            <Text className="text-lg font-bold mt-5">Nhân viên:</Text>
            <Text className="text-base mt-1">
              {report.userId.fullname} - {report.userId.username}
            </Text>
            <Text className="text-lg font-bold mt-5">Tên Khách Hàng:</Text>
            <Text className="text-base mt-1">{report.customerName}</Text>
            <Text className="text-lg font-bold mt-5">Quận/Huyện:</Text>
            <Text className="text-base mt-1">{report.district}</Text>
            <Text className="text-lg font-bold mt-5">Số Điện Thoại:</Text>
            <Text className="text-base mt-1">{report.phoneNumber}</Text>
            <Text className="text-lg font-bold mt-5">Địa Chỉ:</Text>
            <Text className="text-base mt-1">{report.address}</Text>
            <Text className="text-lg font-bold mt-5">Ngày Kiểm Tra:</Text>
            <Text className="text-base mt-1">{new Date(report.date).toLocaleDateString()}</Text>
            <Text className="text-lg font-bold mt-5">Ghi Chú:</Text>
            <Text className="text-base mt-1">{report.note || "Không có ghi chú"}</Text>
            <Text className="text-lg font-bold mt-5">Các Mục Đã Kiểm Tra:</Text>
            <View className="text-base ml-2">
              {report.checkedItems.map((item, index) => (
                <Text className="text-base mb-2" key={index}>- {item.name}</Text> // Thay `item.name` bằng trường thông tin bạn muốn hiển thị về mục kiểm tra
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

export default Report