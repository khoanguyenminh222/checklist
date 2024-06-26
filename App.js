import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'
import { RootSiblingParent } from 'react-native-root-siblings';
import { UserProvider } from './src/UserProvider';

import "./main.css";

import Login from './src/screens/Login';
import CheckList from './src/screens/CheckList';
import WorkList from './src/screens/WorkList';
import Profile from './src/screens/Profile';
import Report from './src/screens/Report';
import History from './src/screens/History';
import ListWithExpirationDate from './src/screens/ListWithExpirationDate';
import CustomerMap from './src/screens/CustomerMap';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigatorAdmin = () => {
  return (
    <Tab.Navigator screenOptions={{
      headerShown: false,
    }}>
      <Tab.Screen name='CheckList' component={CheckList} options={{
        title: "CheckList",
        tabBarIcon: ({ color, size }) => {
          return <Ionicons name="checkbox-outline" color={color} size={size}></Ionicons>
        }
      }} />
      <Tab.Screen name='WorkList' component={WorkList} options={{
        title: "WorkList",
        tabBarIcon: ({ color, size }) => {
          return <Ionicons name="home-outline" color={color} size={size}></Ionicons>
        }
      }} />
      <Tab.Screen name='History' component={History} options={{
        title: "History",
        tabBarIcon: ({ color, size }) => {
          return <Ionicons name="newspaper-outline" color={color} size={size}></Ionicons>
        }
      }} />
      <Tab.Screen name='ListWithExpirationDate' component={ListWithExpirationDate} options={{
        title: "Sắp đến hạn",
        tabBarIcon: ({ color, size }) => {
          return <Ionicons name="hourglass-outline" color={color} size={size}></Ionicons>
        }
      }} />
      <Tab.Screen name='CustomerMap' component={CustomerMap} options={{
        title: "Khách hàng",
        tabBarIcon: ({ color, size }) => {
          return <Ionicons name="map-outline" color={color} size={size}></Ionicons>
        }
      }} />
      <Tab.Screen name='Report' component={Report} options={{
        title: "Report",
        tabBarIcon: ({ color, size }) => {
          return <Ionicons name="document-outline" color={color} size={size}></Ionicons>
        }
      }} />
      <Tab.Screen name='Profile' component={Profile} options={{
        title: "Profile",
        tabBarIcon: ({ color, size }) => {
          return <Ionicons name="person-outline" color={color} size={size}></Ionicons>
        }
      }} />
    </Tab.Navigator>
  )
}

const TabNavigatorUser = () => {
  return (
    <Tab.Navigator screenOptions={{
      headerShown: false,
    }}>
      <Tab.Screen name='CheckList' component={CheckList} options={{
        title: "CheckList",
        tabBarIcon: ({ color, size }) => {
          return <Ionicons name="checkbox-outline" color={color} size={size}></Ionicons>
        }
      }} />
      <Tab.Screen name='History' component={History} options={{
        title: "History",
        tabBarIcon: ({ color, size }) => {
          return <Ionicons name="newspaper-outline" color={color} size={size}></Ionicons>
        }
      }} />
      <Tab.Screen name='ListWithExpirationDate' component={ListWithExpirationDate} options={{
        title: "Sắp đến hạn",
        tabBarIcon: ({ color, size }) => {
          return <Ionicons name="hourglass-outline" color={color} size={size}></Ionicons>
        }
      }} />
      <Tab.Screen name='Report' component={Report} options={{
        title: "Report",
        tabBarIcon: ({ color, size }) => {
          return <Ionicons name="document-outline" color={color} size={size}></Ionicons>
        }
      }} />
      <Tab.Screen name='CustomerMap' component={CustomerMap} options={{
        title: "Khách hàng",
        tabBarIcon: ({ color, size }) => {
          return <Ionicons name="map-outline" color={color} size={size}></Ionicons>
        }
      }} />
      <Tab.Screen name='Profile' component={Profile} options={{
        title: "Profile",
        tabBarIcon: ({ color, size }) => {
          return <Ionicons name="person-outline" color={color} size={size}></Ionicons>
        }
      }} />
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
      <Stack.Screen name="MainAdmin" component={TabNavigatorAdmin} />
      <Stack.Screen name="MainUser" component={TabNavigatorUser} />
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
