import { View, Text, SafeAreaView, ScrollView, RefreshControl, TouchableOpacity, TextInput, Alert } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons'
import { useUser } from '../UserProvider';
import Header from '../components/Header';
import { addressRoute, domain, userRoute } from '../api/BaseURL';
import axios from 'axios';
import ToastMesssage from '../components/ToastMessage';
import DropdownComponent from '../components/DropdownComponent';

const Profile = ({ navigation }) => {
  const { user, isLogin, updateUser } = useUser();
  const [refreshing, setRefreshing] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [message, setMessage] = useState('');
  const [toastKey, setToastKey] = useState(0);

  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry); // Đảo ngược trạng thái hiển thị mật khẩu
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    navigation.reset({
      index: 0, // Chỉ định màn hình đầu tiên trong danh sách
      routes: [{ name: 'Profile' }],
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

  // Thông tin user
  const [quanInfo, setQuanInfo] = useState({});
  const [phuongInfo, setPhuongInfo] = useState({});
  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get(`${domain}${addressRoute}/quan`);
      const quanData = response.data;
      // Kiểm tra xem user.codeDistrict có tồn tại không
      if (user && user.codeDistrict) {
        const uniqueQuanIds = [...new Set(user.codeDistrict.map(item => item.idQuan))];
        const filteredQuanData = quanData.filter(quan => uniqueQuanIds.includes(quan.idQuan));

        setQuanInfo(filteredQuanData);
        // Lưu thông tin quận vào state

        //Duyệt qua từng quận để lấy thông tin phường
        const phuongInfoObject = {};
        for (const quan of filteredQuanData) {
          const phuongResponse = await axios.get(`${domain}${addressRoute}/phuong/${quan.idQuan}`);
          const phuongData = phuongResponse.data;

          // Lọc các ID phường trong mỗi quận dựa trên user.codeDistrict
          const quanPhuongIds = user.codeDistrict
            .filter(item => item.idQuan === quan.idQuan)
            .map(item => item.idPhuong);
          // Lọc thông tin phường dựa trên các ID phường đã lấy được
          const filteredPhuongData = phuongData.filter(phuong => quanPhuongIds.includes(phuong.idPhuong));

          // Lưu thông tin phường vào object
          phuongInfoObject[quan.idQuan] = filteredPhuongData;

        }
        setPhuongInfo(prevPhuongInfo => ({
          ...prevPhuongInfo,
          ...phuongInfoObject
        }));
      }
    };
    
    fetchData();
  }, []);

  const handleChangePassword = async () => {
    try {
      if (!currentPassword) {
        setMessage('Vui lòng điền mật khẩu cũ')
        setToastKey(prevKey => prevKey + 1);
        return;
      }
      if (!newPassword) {
        setMessage('Vui lòng điền mật khẩu mới')
        setToastKey(prevKey => prevKey + 1);
        return;
      }
      if (!confirmPassword) {
        setMessage('Vui lòng điền `nhập lại mật khẩu mới`')
        setToastKey(prevKey => prevKey + 1);
        return;
      }
      if (newPassword !== confirmPassword) {
        setMessage('Mật khẩu mới và nhập lại mật khẩu chưa giống nhau')
        setToastKey(prevKey => prevKey + 1);
        return;
      }
      const response = await axios.put(`${domain}${userRoute}/change-password`, {
        username: user.username,
        currentPassword: currentPassword,
        newPassword: newPassword,
      });
      setMessage(response.data.message)
    } catch (error) {
      setMessage(error.response.data.message)
      setToastKey(prevKey => prevKey + 1);
      console.log(error)
    }
  };


  //Cập nhật khu vực
  const [quanList, setQuanList] = useState([]);
  const [phuongLists, setPhuongLists] = useState([[]]);
  const [selectedAreas, setSelectedAreas] = useState([{ quan: null, phuongs: [null] }]);
  const [messageDropdown, setMessageDropdown] = useState('');

  useEffect(() => {
    const fetchQuan = async () => {
      try {
        const response = await axios.get(`${domain}${addressRoute}/quan`);
        setQuanList(response.data);
      } catch (error) {
        console.error('Error fetching quan list:', error);
      }
    };
    fetchQuan();
  }, []);

  const handleQuanChange = async (value, index) => {
    try {
      const phuongData = await axios.get(`${domain}${addressRoute}/phuong/${value}`);
      const newPhuongLists = [...phuongLists];
      newPhuongLists[index] = phuongData.data;
      setPhuongLists(newPhuongLists);

      const newSelectedAreas = [...selectedAreas];
      newSelectedAreas[index] = { ...newSelectedAreas[index], quan: value, phuongs: [null] };
      setSelectedAreas(newSelectedAreas);
    } catch (error) {
      console.error('Error fetching phuong data:', error);
    }
  };


  const handlePhuongChange = (value, index, phuongIndex) => {
    const newSelectedAreas = [...selectedAreas];
    const newPhuongs = [...newSelectedAreas[index].phuongs];
    newPhuongs[phuongIndex] = value;
    newSelectedAreas[index] = { ...newSelectedAreas[index], phuongs: newPhuongs };
    setSelectedAreas(newSelectedAreas);
  };

  // Hàm xử lý khi người dùng nhấn vào thêm quận
  const handleAddDropdowns = () => {
    const lastArea = selectedAreas[selectedAreas.length - 1];
    if (lastArea && lastArea.quan !== null && lastArea.phuongs.every(p => p !== null)) {
      setSelectedAreas([...selectedAreas, { quan: null, phuongs: [null] }]);
      setPhuongLists([...phuongLists, []]);
    } else {
      setMessageDropdown('Vui lòng chọn quận và phường trước khi thêm mới');
      setToastKey(prevKey => prevKey + 1);
    }
  };

  const handleAddPhuong = (index) => {
    const currentPhuongs = selectedAreas[index].phuongs;
    // Kiểm tra xem tất cả các phường đã được chọn chưa
    if (currentPhuongs.every(p => p !== null)) {
      const newSelectedAreas = [...selectedAreas];
      newSelectedAreas[index].phuongs.push(null);
      setSelectedAreas(newSelectedAreas);
    } else {
      setMessageDropdown('Vui lòng chọn phường trước khi thêm mới');
      setToastKey(prevKey => prevKey + 1);
    }
  };

  // Hàm cập nhật khu vực
  const handelChangeDistrict = () => {
    // Kiểm tra xem có quận nào có giá trị nhưng không có phường nào được chọn
    const hasInvalidSelection = selectedAreas.some(item => item.quan !== null && item.phuongs.some(phuong => phuong === null));
    // Kiểm tra từ index 1 trở đi, nếu quận null và phường null thì báo lỗi
    const hasInvalidSelectionFromIndex1 = selectedAreas.slice(1).some(item => item.quan === null && item.phuongs.some(phuong => phuong === null));
    if (hasInvalidSelection || hasInvalidSelectionFromIndex1) {
      // Hiển thị thông báo lỗi nếu phát hiện quận có giá trị mà không có phường
      setMessageDropdown('Vui lòng chọn phường');
      setToastKey(prevKey => prevKey + 1);
      return;
    }
    Alert.alert(
      "Xác nhận",
      "Bạn có chắc muốn cập nhật khu vực không?",
      [
        {
          text: "Hủy",
          onPress: () => console.log("Cập nhật bị hủy"),
          style: "cancel"
        },
        {
          text: "OK", onPress: async () => {
            try {

              const codeDistrictArray = [];
              selectedAreas.forEach(item => {
                item.phuongs.forEach(phuong => {
                  codeDistrictArray.push({ idQuan: item.quan, idPhuong: phuong });
                });
              });
              const response = await axios.put(`${domain}${userRoute}/${user._id}/codeDistrict`, {
                codeDistrictArray: codeDistrictArray
              });
              if (response.status >= 200 && response.status < 300) {
                setMessageDropdown('Cập nhật thành công');
                setToastKey(prevKey => prevKey + 1);
                const response = await axios.get(`${domain}${userRoute}/${user.username}`);
                updateUser(response.data);
                onRefresh()
              }
              // Thêm logic cập nhật khu vực ở đây nếu cần
            } catch (error) {
              console.error(error);
            }
          }
        }
      ]
    );
  }

  // Render các dropdown quận và phường
  const renderDropdowns = () => {
    return selectedAreas.map((area, index) => (
      <View className="w-full" key={index}>
        <DropdownComponent
          labelField="tenQuan"
          valueField="idQuan"
          placeholder="Chọn quận (*)"
          data={quanList}
          onChange={(value) => handleQuanChange(value, index)}
        />
        {area.phuongs.map((phuong, phuongIndex) => (
          <DropdownComponent
            key={phuongIndex}
            labelField="tenPhuong"
            valueField="idPhuong"
            placeholder="Chọn phường (*)"
            data={phuongLists[index] || []}
            onChange={(value) => handlePhuongChange(value, index, phuongIndex)}
          />
        ))}
        <TouchableOpacity className="mb-2" onPress={() => handleAddPhuong(index)}>
          <Text>+ Thêm phường</Text>
        </TouchableOpacity>
      </View>
    ));
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <StatusBar style="dark" />
      <Header screenName="Profile" navigation={navigation} />
      <ScrollView
        contentContainerStyle={{ alignItems: 'center', paddingTop: '20' }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View className="p-5 rounded-lg w-11/12 mb-5 bg-white">
          {user && (
            <View>
              <View className="items-center mb-5">
                <Text className="text-xl font-bold mb-3">{user.role==="user" ? <>Người dùng: </>: <>Quản lý:</>} {user.username}</Text>
                <Text className="text-base mb-1">Họ tên: {user.fullname}</Text>
                <Text className="text-base">Huyện: {user.district}</Text>
              </View>
              <Text className="text-base font-bold">Khu vực trực thuộc</Text>
              {Array.isArray(quanInfo) && quanInfo.map(quan => (
                <View key={quan._id} style={{ marginTop: 10 }}>
                  <Text style={{ fontWeight: 'bold' }}>{quan.tenQuan}</Text>
                  <View style={{ marginLeft: 20 }}>
                    {Array.isArray(phuongInfo[quan.idQuan]) && phuongInfo[quan.idQuan].map(phuong => (
                      <Text key={phuong._id}>{phuong.tenPhuong}</Text>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        <View className="p-5 rounded-lg w-11/12 mb-5 bg-white">
          <View className="items-center">
            <Text className="text-xl font-bold mb-3">Cập nhật khu vực</Text>
            {renderDropdowns()}
          </View>
          {/* Button để thêm dropdowns mới */}
          <TouchableOpacity onPress={handleAddDropdowns}>
            <Text>+ Thêm quận và phường</Text>
          </TouchableOpacity>
          <TouchableOpacity className="mt-5 bg-blue-500 p-3 rounded-md items-center" onPress={handelChangeDistrict}>
            <Text className="text-white text-base font-bold">Cập nhật khu vực</Text>
          </TouchableOpacity>
          {messageDropdown && <ToastMesssage message={messageDropdown} key={toastKey} time={1500} />}
        </View>

        <View className="p-5 rounded-lg w-11/12 mb-5 bg-white">
          <View className="items-center">
            <Text className="text-xl font-bold mb-3">Thay đổi password</Text>

            <View className="flex flex-row items-center mb-3">
              <TextInput
                className="h-14 border rounded-md pl-3 w-full"
                placeholder="Mật khẩu cũ"
                secureTextEntry={secureTextEntry}
                value={currentPassword}
                onChangeText={setCurrentPassword}
              />
              <TouchableOpacity className=" absolute right-2 items-center" onPress={toggleSecureEntry}>
                <Ionicons name={secureTextEntry ? 'eye-off-outline' : 'eye-outline'} size={22} color="black" />
              </TouchableOpacity>
            </View>

            <TextInput
              className="h-14 border rounded-md pl-3 mb-3 w-full"
              placeholder="Mật khẩu mới"
              secureTextEntry={secureTextEntry}
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TextInput
              className="h-14 border rounded-md pl-3 w-full"
              placeholder="Nhập lại mật khẩu mới"
              secureTextEntry={secureTextEntry}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>
          <TouchableOpacity className="mt-5 bg-blue-500 p-3 rounded-md items-center" onPress={handleChangePassword}>
            <Text className="text-white text-base font-bold">Thay đổi mật khẩu</Text>
          </TouchableOpacity>
          {message && <ToastMesssage message={message} key={toastKey} time={1500} />}
        </View>

      </ScrollView>
    </SafeAreaView>
  )
}

export default Profile