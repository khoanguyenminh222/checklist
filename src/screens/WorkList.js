import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Button, SafeAreaView } from 'react-native';
import Header from '../components/Header';
import { useUser } from '../UserProvider';

const WorkList = ({navigation}) => {
    const { isLogin } = useUser();
    const [workList, setWorkList] = useState([
        { id: 1, title: 'Công việc 1' },
        { id: 2, title: 'Công việc 2' },
        { id: 3, title: 'Công việc 3' },
        // Thêm các công việc khác vào đây
    ]);

    useEffect(() => {
        // Kiểm tra trạng thái đăng nhập khi màn hình được tạo
        if (!isLogin()) {
          navigation.replace('Login'); // Nếu chưa đăng nhập, chuyển hướng đến màn hình đăng nhập
        }
    },[navigation]);

    const handleDeleteWork = (id) => {
        // Xoá công việc khỏi danh sách
        const updatedWorkList = workList.filter(work => work.id !== id);
        setWorkList(updatedWorkList);
    };
    const renderItem = ({ item }) => (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#ddd' }}>
            <Text>{item.title}</Text>
            <TouchableOpacity onPress={() => handleDeleteWork(item.id)}>
                <Text style={{ color: 'red' }}>Xoá</Text>
            </TouchableOpacity>
        </View>
    );
    return (
        <SafeAreaView>
            <Header screenName="WorkList" navigation={navigation}/>
            <View>
                <FlatList
                    data={workList}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                />
                {/* Nút thêm công việc */}
                <Button title="Thêm công việc" onPress={() => console.log('Thêm công việc')} />
            </View>
        </SafeAreaView>
    )
}

export default WorkList