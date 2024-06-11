import { View, Text } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '../UserProvider';

const Header = ({ screenName, navigation, goback }) => {
  const { user, logout } = useUser();
  const handleLogout = async () => {
    await AsyncStorage.removeItem('username');
    await AsyncStorage.removeItem('password');
    logout();
    navigation.navigate('Login');
  }
  const handleBack = () => {
    navigation.goBack();
  }
  return (
    <View className="flex flex-row justify-between items-center bg-white pt-11 pb-4 px-2 mb-3 border-b border-gray-500">
      <View className="flex-1 flex-row items-center">
        {goback && <Ionicons name="chevron-back-outline" size={28} onPress={handleBack} />}
        <Text className="text-2xl font-bold ml-2 flex-shrink" numberOfLines={1} ellipsizeMode="tail">{screenName}</Text>
      </View>
      <View className="flex-1 flex-row items-center justify-end">
        {user && <Text className="text-sm mr-2 truncate" numberOfLines={1} ellipsizeMode="tail">Xin chào: {user.fullname}</Text>}
        <Ionicons name="log-out-outline" size={28} onPress={handleLogout} />
      </View>
    </View>
  )
}

export default Header