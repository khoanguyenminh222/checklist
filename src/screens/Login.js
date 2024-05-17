// LoginScreen.js
import React, { useState, useEffect } from 'react';
import { Button, TextInput, Text, View, SafeAreaView, Pressable, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '../UserProvider';
import axios from 'axios';
import { domain, userRoute } from '../api/BaseURL';
import Toast from 'react-native-toast-message';

const Login = ({ navigation }) => {
  const { updateUser } = useUser();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [isChecked, setChecked] = useState(false);
  const [message, setMessage] = useState('');
  const [toastKey, setToastKey] = useState(0);
  const [loginInfoRetrieved, setLoginInfoRetrieved] = useState(false);

  // Khi màn hình đăng nhập được tải, kiểm tra xem có thông tin đăng nhập đã được lưu trong AsyncStorage hay không
  useEffect(() => {
    const retrieveLoginInfo = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem('username');
        const storedPassword = await AsyncStorage.getItem('password');
        if (storedUsername && storedPassword) {
          setUsername(storedUsername);
          setPassword(storedPassword);
          setChecked(true); // Đánh dấu checkbox "Remember"
          setLoginInfoRetrieved(true);
        }
      } catch (error) {
        console.error('Lỗi khi lấy thông tin đăng nhập từ AsyncStorage:', error);
      }
    };

    retrieveLoginInfo();
  }, []);

  useEffect(() => {
    if (loginInfoRetrieved) {
      handleLogin();
    }
  }, [loginInfoRetrieved]);

  const handleLogin = async () => {
    // Thực hiện xác thực đăng nhập, sau đó lưu thông tin người dùng vào Context
    try {
      if (!username) {
        Toast.show({
          type: 'error',
          text1: 'Lỗi đăng nhập',
          text2: 'Vui lòng điền username',
        });
        return;
      }
      if (!password) {
        Toast.show({
          type: 'error',
          text1: 'Lỗi đăng nhập',
          text2: 'Vui lòng điền password',
        });
        return;
      }
      const userData = { username, password }; // Thông tin người dùng
      const response = await axios.post(`${domain}${userRoute}/login`, userData);
      if (response.status >= 200 && response.status < 300) {
        let user = response.data.user;
        updateUser(user);
        Toast.show({
          type: 'success',
          text1: 'Đăng nhập thành công',
        });
        if (isChecked) {
          // Nếu người dùng đã chọn "Remember", lưu thông tin đăng nhập vào AsyncStorage
          await AsyncStorage.setItem('username', username);
          await AsyncStorage.setItem('password', password);
        }

        if (user.role === 'admin' || user.role === 'manager') {
          navigation.navigate('MainAdmin'); // Chuyển đến màn hình Home sau khi đăng nhập thành công
        } else {
          navigation.navigate('MainUser');
        }
      } else {
        console.error('Submission failed with status:', response.status);
        Toast.show({
          type: 'error',
          text1: 'Lỗi đăng nhập',
          text2: 'Sai username hoặc password',
        });
      }
    } catch (error) {
      if (error.response.status == 401) {
        Toast.show({
          type: 'error',
          text1: 'Lỗi đăng nhập',
          text2: 'Sai username hoặc password',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Lỗi đăng nhập',
          text2: error.message,
        });
      }
    }

  };
  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry); // Đảo ngược trạng thái hiển thị mật khẩu
  };
  const toggleCheckbox = () => {
    setChecked(!isChecked);
  };
  return (
    <SafeAreaView className="flex-1 justify-center items-center bg-white">
    <StatusBar style="dark" />
      <View className="w-10/12">
        <Text className="text-2xl font-bold mb-5 text-center select-none">Đăng nhập</Text>
        <TextInput className="h-14 border border-gray-300 rounded mb-3 px-2 select-none" placeholder="Tên nhân viên" value={username} onChangeText={setUsername} />
        <View className="flex flex-row items-center mb-3">
          <TextInput className="flex-1 h-14 border border-gray-300 rounded px-2 select-none" placeholder="Mật khẩu" value={password} onChangeText={setPassword} secureTextEntry={secureTextEntry} />
          <TouchableOpacity className=" absolute right-2 items-center" onPress={toggleSecureEntry}>
            <Ionicons name={secureTextEntry ? 'eye-off-outline' : 'eye-outline'} size={22} color="black" />
          </TouchableOpacity>
        </View>
        <View className="flex flex-row items-center mb-3">
          <TouchableOpacity
            className={`h-6 w-6 rounded-sm border-2 border-gray-400 justify-center items-center mr-2 ${isChecked ? 'bg-blue-500' : 'bg-white'}`}
            onPress={toggleCheckbox}
            accessibilityRole="checkbox"
            aria-checked={isChecked}
          >
            {isChecked && <Ionicons name="checkmark" size={16} color="white" />}
          </TouchableOpacity>
          <Text className="select-none">Remember</Text>
        </View>

        <TouchableOpacity className="bg-blue-500 p-3 rounded-md items-center" onPress={handleLogin}>
          <Text className="text-white text-base font-bold select-none">Đăng nhập</Text>
        </TouchableOpacity>
      </View>
      <Toast />
    </SafeAreaView>
  );
};

export default Login;
