// LoginScreen.js
import React, { useState, useEffect } from 'react';
import { Button, TextInput, Text, View, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons'
import Checkbox from 'expo-checkbox';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '../UserProvider';
import axios from 'axios';
import { domain, userRoute } from '../api/BaseURL';
import ToastMesssage from '../components/ToastMessage';

const Login = ({ navigation }) => {
  const { updateUser } = useUser();
  const [username, setUsername] = useState('khoa');
  const [password, setPassword] = useState('khoa');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [isChecked, setChecked] = useState(false);
  const [message, setMessage] = useState('');
  const [toastKey, setToastKey] = useState(0);

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
          handleLogin(); // Tự động đăng nhập
        }
      } catch (error) {
        console.error('Lỗi khi lấy thông tin đăng nhập từ AsyncStorage:', error);
      }
    };

    retrieveLoginInfo();
  }, []);

  const handleLogin = async () => {
    // Thực hiện xác thực đăng nhập, sau đó lưu thông tin người dùng vào Context
    try {
      if(!username){
        setMessage('Vui lòng điền username');
        setToastKey(prevKey => prevKey + 1);
      }
      if(!password){
        setMessage('Vui lòng điền password');
        setToastKey(prevKey => prevKey + 1);
      }
      const userData = { username, password }; // Thông tin người dùng
      const response = await axios.post(`${domain}${userRoute}/login`,userData);
      if (response.status >= 200 && response.status < 300) {
        let user = response.data.user;
        updateUser(user);
        setMessage('Đăng nhập thành công');
        setToastKey(prevKey => prevKey + 1);

        if (isChecked) {
          // Nếu người dùng đã chọn "Remember", lưu thông tin đăng nhập vào AsyncStorage
          await AsyncStorage.setItem('username', username);
          await AsyncStorage.setItem('password', password);
        }

        if(user.role==='admin'){
          navigation.navigate('MainAdmin'); // Chuyển đến màn hình Home sau khi đăng nhập thành công
        }else{
          navigation.navigate('CheckList');
        }
      } else {
        console.error('Submission failed with status:', response.status);
        setMessage('Sai username hoặc password');
        setToastKey(prevKey => prevKey + 1);
      }

    } catch (error) {
      if(error.response.status==401){
        setMessage('Sai username hoặc password');
        setToastKey(prevKey => prevKey + 1); 
      }else{
        console.log(error)
      }
    }

  };
  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry); // Đảo ngược trạng thái hiển thị mật khẩu
  };
  return (
    <SafeAreaView className="flex-1 justify-center items-center bg-white">
      <View className="w-10/12">
        <Text className="text-2xl font-bold mb-5 text-center">Đăng nhập</Text>
        <TextInput className="h-14 border border-gray-300 rounded mb-3 px-2" placeholder="Tên nhân viên" value={username} onChangeText={setUsername} />
        <View className="flex flex-row items-center mb-3">
          <TextInput className="flex-1 h-14 border border-gray-300 rounded px-2" placeholder="Mật khẩu" value={password} onChangeText={setPassword} secureTextEntry={secureTextEntry} />
          <TouchableOpacity className=" absolute right-2 items-center" onPress={toggleSecureEntry}>
            <Ionicons name={secureTextEntry ? 'eye-off-outline' : 'eye-outline'} size={22} color="black" />
          </TouchableOpacity>
        </View>
        <View className="flex flex-row items-center mb-3">
          <Checkbox
            className="my-2 mr-2"
            value={isChecked}
            onValueChange={setChecked}
            color={isChecked ? 'blue' : undefined}
          />
          <Text className="text-sm">Remember</Text>
        </View>
        <Button title="Đăng nhập" onPress={handleLogin} />
        {message && <ToastMesssage message={message} key={toastKey}/>} 
      </View>
    </SafeAreaView>
  );
};

export default Login;
