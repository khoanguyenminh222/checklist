import { View, Text } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { useUser } from '../UserProvider';

const Header = ({screenName, navigation}) => {
    const { user, logout } = useUser();
    const handleLogout = () => {
        logout();
        navigation.navigate('Login');
    }
  return (
    <View className="flex flex-row justify-between items-center bg-white pt-11 pb-4 px-2 mb-3">
        <Text className="text-2xl font-bold">{screenName}</Text>
        <View className="flex flex-row items-center">
            {user && <Text className="text-sm mr-2">Xin chào: {user.username}</Text> }
            <Ionicons name="log-out-outline" size={28} onPress={handleLogout}></Ionicons>
        </View>
    </View>
  )
}

export default Header