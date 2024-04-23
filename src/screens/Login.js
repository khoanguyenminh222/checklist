// LoginScreen.js
import React, { useState } from 'react';
import { Button, TextInput, Text, View, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons'
import Checkbox from 'expo-checkbox';
import { useUser } from '../UserProvider';


const Login = ({ navigation }) => {
  const { updateUser } = useUser();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [isChecked, setChecked] = useState(false);

  const handleLogin = () => {
    // Thực hiện xác thực đăng nhập, sau đó lưu thông tin người dùng vào Context
    const userData = { username, password }; // Thông tin người dùng
    updateUser(userData);
    navigation.navigate('Main'); // Chuyển đến màn hình Home sau khi đăng nhập thành công
  };
  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry); // Đảo ngược trạng thái hiển thị mật khẩu
  };
  return (
    <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <View className="w-10/12">
            <Text className="text-2xl font-bold mb-5 text-center">Đăng nhập</Text>
            <TextInput className="h-9 border border-gray-300 rounded mb-3 px-2" placeholder="Tên nhân viên" value={username} onChangeText={setUsername} />
            <View className="flex flex-row items-center">
              <TextInput className="flex-1 h-9 border border-gray-300 rounded px-2" placeholder="Mật khẩu" value={password} onChangeText={setPassword} secureTextEntry={secureTextEntry} />
              <TouchableOpacity className=" absolute right-2 items-center" onPress={toggleSecureEntry}>
                <Ionicons name={secureTextEntry ? 'eye-off-outline' : 'eye-outline'} size={22} color="black" />
              </TouchableOpacity>
            </View>
            <View className="flex flex-row items-center">
                <Checkbox
                    className="my-2 mr-2"
                    value={isChecked}
                    onValueChange={setChecked}
                    color={isChecked ? 'blue' : undefined}
                />
                <Text className="text-sm">Remember</Text>
            </View>
            <Button title="Đăng nhập" onPress={handleLogin} />
        </View>
    </SafeAreaView>
  );
};

export default Login;
