import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'
import { UserProvider } from './src/UserProvider';

import Login from './src/screens/Login';
import CheckList from './src/screens/CheckList';
import WorkList from './src/screens/WorkList';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator screenOptions={{
      headerShown: false,
    }}>
      <Tab.Screen name='CheckList' component={CheckList} options={{
          title: "CheckList",
          tabBarIcon:({color,size})=>{
              return <Ionicons name="home-outline" color={color} size={size}></Ionicons>
          }
      }}/>
      <Tab.Screen name='WorkList' component={WorkList} options={{
          title: "WorkList",
          tabBarIcon:({color,size})=>{
              return <Ionicons name="home-outline" color={color} size={size}></Ionicons>
          }
      }}/>
    </Tab.Navigator>
  )
}

const StackNavigator = () => {
  return (
    <Stack.Navigator
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
        }}
      >
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="CheckList" component={CheckList} />
        <Stack.Screen name="WorkList" component={WorkList} />
        <Stack.Screen name="Main" component={TabNavigator} />
    </Stack.Navigator>
  )
}

export default function App() {
  const isLoggedIn = false;
  return (
    <UserProvider>
    <NavigationContainer>
      <StackNavigator />
    </NavigationContainer>
    </UserProvider>
  );
}
