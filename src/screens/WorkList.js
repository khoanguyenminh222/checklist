import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, Button, SafeAreaView, Alert, ScrollView, RefreshControl } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Header from '../components/Header';
import { useUser } from '../UserProvider';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons'
import { checklistRoute, domain } from '../api/BaseURL';
import EditWorkModal from '../components/EditWorkModal';
import ToastMesssage from '../components/ToastMessage';

const WorkList = ({ navigation }) => {
    const { isLogin } = useUser();
    const [workList, setWorkList] = useState(null);
    const [work, setWork] = useState([]); // State để lưu thông tin công việc đang chỉnh sửa
    const [modalVisible, setModalVisible] = useState(false);
    const [message, setMessage] = useState('');
    const [toastKey, setToastKey] = useState(0);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        const fetchCheckList = async () => {
            try {
                const response = await axios.get(`${domain}${checklistRoute}`);
                setWorkList(response.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchCheckList();
    }, [])

    useEffect(() => {
        // Kiểm tra trạng thái đăng nhập khi màn hình được tạo
        if (!isLogin()) {
            navigation.replace('Login'); // Nếu chưa đăng nhập, chuyển hướng đến màn hình đăng nhập
        }
    }, [navigation]);

    const handleDeleteWork = (id) => {
        // Xoá công việc khỏi danh sách
        Alert.alert(
            'Xác nhận xoá',
            'Bạn có chắc chắn muốn xoá công việc này?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'OK',
                    onPress: async () => {
                        try {
                            // Gửi request DELETE để xoá công việc
                            const response = await axios.put(`${domain}${checklistRoute}/delete/${id}`,{status:1});
                            if (response.status >= 200 && response.status < 300) {
                                // Cập nhật danh sách công việc sau khi xoá thành công
                                const updatedWorkList = workList.filter(work => work._id !== id);
                                setWorkList(updatedWorkList);
                                setMessage("Xoá thành công")
                                setToastKey(prevKey => prevKey + 1);
                            } else {
                                console.error('Submission failed with status:', response.status);
                            }
                            
                        } catch (error) {
                            console.error('Error deleting work:', error);
                        }
                    }
                }
            ]
        );
    };
    const handleAddWork = async () => {
        setModalVisible(true);
    }

    const handleEditWork = async (id) => {
        try {
            const response = await axios.get(`${domain}${checklistRoute}/${id}`);
            setWork(response.data); // Lưu thông tin công việc đang chỉnh sửa vào state
            setModalVisible(true); // Mở modal chỉnh sửa
        } catch (error) {
            console.error('Error saving work:', error);
        }

    };
    const handleSaveWork = async (updatedWork) => {
        try {
            if(!updatedWork.name){
                setMessage("Vui lòng điền tên công việc");
                setToastKey(prevKey => prevKey + 1);
                return;
            }
            if (!updatedWork._id) {
                // Thêm mới công việc
                const response = await axios.post(`${domain}${checklistRoute}`, updatedWork);
                if (response.status >= 200 && response.status < 300) {
                    setMessage("Thêm thành công");
                    setToastKey(prevKey => prevKey + 1);
                    setWorkList(prevWorkList => [...prevWorkList, response.data]);
                } else {
                    console.error('Submission failed with status:', response.status);
                }
               
            } else {
                // Cập nhật công việc hiện có
                const response = await axios.put(`${domain}${checklistRoute}/${updatedWork._id}`, updatedWork);
                if (response.status >= 200 && response.status < 300) {
                    // Cập nhật danh sách công việc sau khi cập nhật
                    const updatedWorkList = workList.map(item => {
                        if (item._id === updatedWork._id) {
                            return updatedWork;
                        }
                        return item;
                    });
                    setWorkList(updatedWorkList);
                    setMessage("Đã lưu thay đổi");
                    setToastKey(prevKey => prevKey + 1);
                } else {
                    console.error('Submission failed with status:', response.status);
                }
                
            }
        } catch (error) {
            setMessage("Error saving work");
            setToastKey(prevKey => prevKey + 1);
            console.error('Error saving work:', error);
        }
        // Đóng modal sau khi lưu công việc
        setModalVisible(false);
        // Xóa thông tin công việc đang chỉnh sửa
        setWork(null);
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        navigation.reset({
            index: 0, // Chỉ định màn hình đầu tiên trong danh sách
            routes: [{ name: 'WorkList' }],
        });
        setTimeout(() => {
          setRefreshing(false);
        }, 2000);
      }, []);
    return (
        <SafeAreaView className="flex-1">
            <StatusBar style="dark" />
            <Header screenName="WorkList" navigation={navigation} />
            <ScrollView refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                />}
                >
            <View className="flex p-2">
                {workList && workList.map((item, index) => (
                    item.status==0 && 
                    (<TouchableOpacity key={item._id} onPress={() => handleEditWork(item._id)}>
                        <View className="flex flex-row justify-between items-center px-4 py-2 border-b-2 border-b-white mb-2">
                            <Text className="flex-1 mr-2 text-lg">{workList.filter(work => work.status === 0).indexOf(item) + 1}. {item.name}</Text>
                            <TouchableOpacity className="mr-2" onPress={() => handleEditWork(item._id)}>
                                <Ionicons name="create-outline" size={24} color="blue"></Ionicons>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDeleteWork(item._id)}>
                                <Ionicons name="trash-outline" size={24} color="red"></Ionicons>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>)
                ))}
                <EditWorkModal
                    visible={modalVisible}
                    work={work}
                    onSave={handleSaveWork}
                    onClose={() => setModalVisible(false)}
                />
                {/* Nút thêm công việc */}
                <Button title="Thêm công việc" onPress={() => handleAddWork()} />
                {message && <ToastMesssage message={message} key={toastKey} time={1500}/>}
            </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default WorkList