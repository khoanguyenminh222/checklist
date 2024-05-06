import { View, Text, SafeAreaView, ScrollView, RefreshControl, TouchableOpacity, Platform, Alert, Button } from 'react-native'
import React, { useCallback, useState, useEffect } from 'react'
import { StatusBar } from 'expo-status-bar';
import axios from 'axios';
import Header from '../components/Header';
import { useUser } from '../UserProvider';
import { domain, listSubmitRoute, userRoute } from '../api/BaseURL';
import DateTimePicker from '@react-native-community/datetimepicker';
import ToastMesssage from '../components/ToastMessage';
import * as FileSystem from 'expo-file-system';
import * as Notifications from 'expo-notifications';
import { shareAsync } from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

const Report = ({ navigation }) => {
  const { isLogin } = useUser();
  const [refreshing, setRefreshing] = useState(false);
  const [dateStart, setDateStart] = useState(new Date());
  const [showDatePickerStart, setShowDatePickerStart] = useState(false)
  const [dateEnd, setDateEnd] = useState(new Date());
  const [showDatePickerEnd, setShowDatePickerEnd] = useState(false)
  const [message, setMessage] = useState('')
  const [toastKey, setToastKey] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);

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

  const onChangeDateStart = (event, selectedDate) => {
    const currentDate = selectedDate;
    setShowDatePickerStart(false);
    setDateStart(currentDate);
  };

  const onChangeDateEnd = (event, selectedDate) => {
    const currentDate = selectedDate;
    setShowDatePickerEnd(false);
    setDateEnd(currentDate);
  };

  const handleExport = async () => {
    try {
      const response = await axios.post(`${domain}${listSubmitRoute}/export`, {
        fromDate: dateStart,
        endDate: dateEnd
      });
      if (response.status >= 200 && response.status < 300) {
        const startDate = dateStart.toLocaleDateString().replace(/\//g, '-'); // Chuyển ngày bắt đầu thành chuỗi và thay thế dấu /
        const endDate = dateEnd.toLocaleDateString().replace(/\//g, '-'); // Chuyển ngày kết thúc thành chuỗi và thay thế dấu /
        const fileName = `list_submit_${startDate}_to_${endDate}.xlsx`;
        const fileUri = response.data.fileUrl;
        const result = await FileSystem.downloadAsync(
          fileUri,
          FileSystem.documentDirectory + fileName
        );
        if (result && result.status === 200) {
          save(result.uri, fileName, result.headers["Content-Type"]);
        } else {
          throw new Error('Failed to download Excel file');
        }

      } else {
        throw new Error('Failed to export Excel file');
      }
    } catch (error) {
      console.log(error)
      setMessage("Xuất file thất bại");
      setToastKey(prevKey => prevKey + 1);
    }
  }

  const save = async (uri, filename, mimetype) => {
    if (Platform.OS === "android") {
      const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (permissions.granted) {
        const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
        await FileSystem.StorageAccessFramework.createFileAsync(permissions.directoryUri, filename, mimetype)
          .then(async (uri) => {
            await FileSystem.writeAsStringAsync(uri, base64, { encoding: FileSystem.EncodingType.Base64 });
            Alert.alert('Thông báo', 'Tệp Excel đã được tải xuống thành công.');
            await Notifications.scheduleNotificationAsync({
              content: {
                title: 'Expo notification',
                body: 'scheduleNotificationAsync'
              },
              trigger: null // Gửi ngay lập tức
            });
          })
          .catch(e => console.log(e));
      } else {
        shareAsync(uri);
      }
    } else {
      shareAsync(uri);
    }
  };

  const handleFilePick = async () => {
    try {
      const file = await DocumentPicker.getDocumentAsync({
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // Chỉ chấp nhận các tệp xlsx
        copyToCacheDirectory: false, // Không sao chép tệp vào thư mục cache
      });
      if (!file.canceled) {
        setSelectedFile(file);
      } else {
        Alert.alert('Thông báo', 'Người dùng không chọn tệp nào.');
      }
    } catch (error) {
      console.error('Lỗi khi chọn tệp:', error);
    }
  };

  const handleFileSubmit = async () => {
    if (selectedFile) {
      try {
        const formData = new FormData();
        console.log(selectedFile)
        formData.append('excelFile', {
          uri: selectedFile.assets[0].uri,
          name: selectedFile.assets[0].name,
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        //Gửi tệp đã chọn đến server hoặc thực hiện xử lý khác
        const response = await axios.post(`${domain}${userRoute}/import`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        if (response.status >= 200 && response.status < 300) {
          setMessage(response.data.message);
          setToastKey(prevKey => prevKey + 1);
        }else{
          setMessage(response.data.message);
          setToastKey(prevKey => prevKey + 1);
        }
        console.log('Tệp đã chọn:', selectedFile);
      } catch (error) {
        setMessage('Lỗi file không chứa tiêu đề cần nhập');
        setToastKey(prevKey => prevKey + 1);
        //console.error('Error submitting file:', error);
      }
    } else {
      Alert.alert('Thông báo', 'Vui lòng chọn một tệp trước khi gửi.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-200">
      <StatusBar style="dark" />
      <Header screenName="Report" navigation={navigation} />
      <ScrollView
        contentContainerStyle={{ alignItems: 'center', paddingTop: '20' }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View className="w-11/12 bg-white px-5 py-5 rounded-2xl mb-3">
          <Text className="text-2xl font-bold text-center mb-5">Xuất báo cáo</Text>
          <Text className="text-lg font-semibold mb-2">Ngày bắt đầu</Text>
          <TouchableOpacity onPress={() => setShowDatePickerStart(true)}>
            <Text className="border border-gray-300 my-2 text-lg leading-9 p-2">{dateStart.toLocaleDateString()}</Text>
          </TouchableOpacity>
          {showDatePickerStart && <DateTimePicker
            value={dateStart}
            mode={'date'}
            onChange={onChangeDateStart}
            display={'default'}
          />}

          <Text className="text-lg font-semibold mt-4">Ngày kết thúc</Text>
          <TouchableOpacity onPress={() => setShowDatePickerEnd(true)}>
            <Text className="border border-gray-300 my-2 text-lg leading-9 p-2">{dateEnd.toLocaleDateString()}</Text>
          </TouchableOpacity>
          {showDatePickerEnd && <DateTimePicker
            value={dateEnd}
            mode={'date'}
            onChange={onChangeDateEnd}
            display={'default'}
          />}

          <TouchableOpacity className="mt-5 bg-blue-500 p-3 rounded-md items-center" onPress={handleExport}>
            <Text className="text-white text-lg font-semibold">Xuất báo cáo</Text>
          </TouchableOpacity>
          {message && <ToastMesssage message={message} key={toastKey} time={10000} />}
        </View>
        <View className="w-11/12 bg-white px-5 py-5 rounded-2xl mb-3">
          <Text className="text-2xl font-bold text-center mb-5">Nhập người dùng</Text>
          <TouchableOpacity className="mt-5 bg-blue-400 p-3 rounded-md items-center" onPress={handleFilePick}>
            <Text className="text-white text-lg font-semibold">Chọn tệp .xlsx</Text>
          </TouchableOpacity>
          {selectedFile && (
            <View className="mt-5">
              <Text>Tên tệp: {selectedFile.assets[0].name}</Text>
              <Text>Kích thước: {selectedFile.assets[0].size} bytes</Text>
              <Text>Loại: Spreadsheet</Text>
            </View>
          )}
          <TouchableOpacity className="mt-5 bg-blue-400 p-3 rounded-md items-center" onPress={handleFileSubmit} disabled={!selectedFile}>
            <Text className="text-white text-lg font-semibold">Gửi</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Report