import { View, Text, SafeAreaView, ScrollView, RefreshControl, TouchableOpacity, TextInput } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { useUser } from '../UserProvider';
import Header from '../components/Header';
import { domain, userRoute } from '../api/BaseURL';
import axios from 'axios';
import ToastMesssage from '../components/ToastMessage';

const Profile = ({ navigation }) => {
  const { user, isLogin } = useUser();
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

  const handleChangePassword = async() => {
    try {
      if(!currentPassword){
        setMessage('Vui lòng điền mật khẩu cũ')
        setToastKey(prevKey => prevKey + 1);
        return;
      }
      if(!newPassword){
        setMessage('Vui lòng điền mật khẩu mới')
        setToastKey(prevKey => prevKey + 1);
        return;
      }
      if(!confirmPassword){
        setMessage('Vui lòng điền `nhập lại mật khẩu mới`')
        setToastKey(prevKey => prevKey + 1);
        return;
      }
      if(newPassword!==confirmPassword){
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

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header screenName="Profile" navigation={navigation} />
      <ScrollView
        contentContainerStyle={{ alignItems: 'center', paddingTop: '20' }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View className="p-5 rounded-lg w-11/12 mb-5 bg-gray-100">
          <View className="items-center">
            <Text className="text-xl font-bold mb-3">{user.username}</Text>
            <Text className="text-base mb-1">Họ tên: {user.fullname}</Text>
            <Text className="text-base">Huyện: {user.district}</Text>
          </View>
        </View>
        <View className="p-5 rounded-lg w-11/12 mb-5 bg-gray-100">
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
          {message && <ToastMesssage message={message} key={toastKey} time={1500}/>}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Profile