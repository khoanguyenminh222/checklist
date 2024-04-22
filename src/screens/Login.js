// LoginScreen.js
import React, { useState } from 'react';
import { Button, TextInput, Text, View, SafeAreaView } from 'react-native';
import { useUser } from '../UserProvider';


const Login = ({ navigation }) => {
  const { updateUser } = useUser();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    // Thực hiện xác thực đăng nhập, sau đó lưu thông tin người dùng vào Context
    const userData = { username, password }; // Thông tin người dùng
    updateUser(userData);
    setIsLoggedIn(true);
    navigation.navigate('Main'); // Chuyển đến màn hình Home sau khi đăng nhập thành công
  };

  return (
    <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <View className="w-10/12">
            <Text className="text-2xl font-bold mb-5 text-center">Đăng nhập</Text>
            <TextInput className="h-9 border border-gray-300 rounded mb-3 px-2" placeholder="Tên nhân viên" value={username} onChangeText={setUsername} />
            <TextInput className="h-9 border border-gray-300 rounded mb-3 px-2" placeholder="Mật khẩu" value={password} onChangeText={setPassword} secureTextEntry />
            <Button title="Đăng nhập" onPress={handleLogin} />
        </View>
    </SafeAreaView>
  );
};

export default Login;
