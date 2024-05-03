import { View, Text, SafeAreaView, TextInput, Button, ScrollView, RefreshControl, TouchableOpacity } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import DropdownComponent from '../components/DropdownComponent';
import validator from 'validator';
import Item from '../components/Item';
import Header from '../components/Header';
import { useUser } from '../UserProvider';
import { checklistRoute, domain, listSubmitRoute } from '../api/BaseURL';
import axios from 'axios';
import ToastMesssage from '../components/ToastMessage';
import DateTimePicker from '@react-native-community/datetimepicker';

const CheckList = ({ navigation }) => {
    const { user, isLogin } = useUser();
    const [name, setName] = useState('');
    const [district, setDistrict] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [address, setAddress] = useState('');
    const [vnptAccount, setVnptAccount] = useState('');
    const [date, setDate] = useState(new Date());
    const [note, setNote] = useState('');
    const [errorName, setErrorName] = useState('');
    const [errorDistrict, setErrorDistrict] = useState('');
    const [errorPhoneNumber, setErrorPhoneNumber] = useState('');
    const [errorAddress, setErrorAddress] = useState('');
    const [message, setMessage] = useState('');
    const [workList, setWorkList] = useState([]);
    const [checkedItems, setCheckedItems] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false)

    const onChange = (event, selectedDate) => {
        const currentDate = selectedDate;
        setShowDatePicker(false);
        setDate(currentDate);
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        navigation.reset({
            index: 0, // Chỉ định màn hình đầu tiên trong danh sách
            routes: [{ name: 'CheckList' }],
        });
        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
    }, []);

    const handleCheckboxChange = (isChecked, workId) => {
        if (isChecked) {
            // Nếu checkbox được check, thêm workId vào danh sách checkedItems
            setCheckedItems(prevState => [...prevState, workId]);
        } else {
            // Nếu checkbox được uncheck, loại bỏ workId khỏi danh sách checkedItems
            setCheckedItems(prevState => prevState.filter(id => id !== workId));
        }
    };

    useEffect(() => {
        fetchWorkList();
    }, []);

    const fetchWorkList = async () => {
        try {
            const response = await axios.get(`${domain}${checklistRoute}`);
            setWorkList(response.data);
        } catch (error) {
            console.error('Error fetching work list:', error);
        }
    };

    useEffect(() => {
        // Kiểm tra trạng thái đăng nhập khi màn hình được tạo
        if (!isLogin()) {
            navigation.replace('Login'); // Nếu chưa đăng nhập, chuyển hướng đến màn hình đăng nhập
        }
    }, [navigation]);

    const data = [
        { label: 'Thành phố Vũng Tàu', value: 'Thành phố Vũng Tàu' },
        { label: 'Bà Rịa', value: 'Bà Rịa' },
        { label: 'Châu Đức', value: 'Châu Đức' },
        { label: 'Xuyên Mộc', value: 'Xuyên Mộc' },
        { label: 'Phú Mỹ', value: 'Phú Mỹ' },
        { label: 'Long Điền', value: 'Long Điền' },
        { label: 'Đất Đỏ', value: 'Đất Đỏ' },
        { label: 'Côn Đảo', value: 'Côn Đảo' },
    ];
    const handleDistrictChange = (value) => {
        setDistrict(value);
    };

    const handleSubmit = async () => {
        try {
            // Kiểm tra xem các trường nhập liệu có giá trị null không
            if (!name) {
                setErrorName('Vui lòng điền tên khách hàng');
                return; // Kết thúc hàm nếu có trường nhập liệu không có giá trị
            } else {
                setErrorName('');
            }
            if (!district) {
                setErrorDistrict('Vui lòng chọn huyện');
                return; // Kết thúc hàm nếu có trường nhập liệu không có giá trị
            } else {
                setErrorDistrict('');
            }
            if (!phoneNumber) {
                setErrorPhoneNumber('Vui lòng điền số điện thoại');
                return; // Kết thúc hàm nếu có trường nhập liệu không có giá trị
            } else {
                setErrorPhoneNumber('')
            }
            // Kiểm tra xem số điện thoại có hợp lệ không
            if (!validator.isMobilePhone(phoneNumber, 'vi-VN')) {
                setErrorPhoneNumber('Số điện thoại không hợp lệ');
                return; // Kết thúc hàm nếu số điện thoại không hợp lệ
            } else {
                setErrorPhoneNumber('')
            }
            if (!address) {
                setErrorAddress('Vui lòng điền địa chỉ');
                return; // Kết thúc hàm nếu có trường nhập liệu không có giá trị
            } else {
                setErrorAddress('')
            }
            if (checkedItems.length === 0) {
                setMessage('Vui lòng chọn ít nhất một mục công việc');
                return;
            } else {
                setMessage('');
            }
            // Dữ liệu để gửi đi
            const formData = {
                customerName: name,
                district: district,
                phoneNumber: phoneNumber,
                address: address,
                vnptAccount: vnptAccount,
                checkedItems: checkedItems, // Chỉ lấy _id của các item được check
                date: date,
                note: note,
                userId: user._id,
                username: user.username
            };
            const response = await axios.post(`${domain}${listSubmitRoute}`, formData);
            if (response.status >= 200 && response.status < 300) {
                setMessage("Gửi thông tin thành công")
                onRefresh()
            } else {
                console.error('Submission failed with status:', response.status);
            }
        } catch (error) {
            setMessage("Error Submitting")
            console.log(error)
        }
        // Thực hiện các thao tác khác như lưu dữ liệu vào cơ sở dữ liệu, gửi dữ liệu đến máy chủ, vv.
    };
    return (
        <SafeAreaView className="flex-1">
            <StatusBar style="dark" />
            <Header screenName="CheckList" navigation={navigation} />
            <ScrollView refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                />}
            >
                <View className="flex-1 flex-col mx-2 mb-10 bg-gray-100">
                    <View className="bg-white rounded-lg shadow-md px-8 pt-6 pb-8 mb-4">
                        <Text className="text-lg text-center font-bold text-blue-500 mb-4">Thông tin khách hàng</Text>
                        <TextInput
                            className="border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            type="text"
                            value={name}
                            onChangeText={text => setName(text)}
                            placeholder="Nhập tên khách hàng (*)"
                        />
                        <Text className="text-red-500 mb-1">{errorName}</Text>
                        <DropdownComponent
                            labelField="label"
                            valueField="value"
                            placeholder="Chọn huyện (*)"
                            data={data}
                            onChange={handleDistrictChange}
                        />
                        <Text className="text-red-500 mb-1">{errorDistrict}</Text>
                        <TextInput
                            className="border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            type="tel"
                            value={phoneNumber}
                            onChangeText={text => setPhoneNumber(text)}
                            placeholder="Nhập số điện thoại (*)"
                            keyboardType='phone-pad'
                        />
                        <Text className="text-red-500 mb-1">{errorPhoneNumber}</Text>
                        <TextInput
                            className="border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            type="text"
                            value={address}
                            onChangeText={text => setAddress(text)}
                            placeholder="Nhập địa chỉ (*)"
                        />
                        <Text className="text-red-500 mb-1">{errorAddress}</Text>
                        <TextInput
                            className="border rounded w-full py-2 px-3 mb-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            type="text"
                            value={vnptAccount}
                            onChangeText={text => setVnptAccount(text)}
                            placeholder="Nhập tài khoản VNPT (nếu có)"
                        />

                    </View>
                    <View className="bg-white rounded-lg shadow-md px-8 pt-6 pb-8">
                        <Text className="text-base text-center font-bold text-blue-500 mb-4">Nội dung công việc đến nhà khách hàng</Text>
                        {/* Đây là chỗ fetch item */}
                        {workList.map((work, index) =>
                            work.status == 0 && 
                            (<Item key={work._id} work={work} index={workList.filter(work => work.status === 0).indexOf(work)} onCheckboxChange={handleCheckboxChange} district={district} />)
                        )}
                        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                            <Text className="border border-gray-300 my-2 text-lg leading-9 p-2">{date.toLocaleDateString()}</Text>
                        </TouchableOpacity>
                        {showDatePicker && <DateTimePicker
                            value={date}
                            mode={'date'}
                            onChange={onChange}
                            display={'default'}
                        />}
                        <TextInput
                            value={note}
                            onChangeText={(text) => setNote(text)}
                            placeholder="Ghi chú"
                            className="border border-gray-300 my-2 text-lg leading-9 p-2"
                            multiline={true}
                            numberOfLines={4}
                        />
                        <Button
                            title='Gửi'
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            onPress={handleSubmit}
                        />
                    </View>
                    {errorName && <ToastMesssage message={errorName} time={1500}/>}
                    {errorDistrict && <ToastMesssage message={errorDistrict} time={1500}/>}
                    {errorPhoneNumber && <ToastMesssage message={errorPhoneNumber} time={1500}/>}
                    {errorAddress && <ToastMesssage message={errorAddress} time={1500}/>}
                    {message && <ToastMesssage message={message} time={1500}/>}
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default CheckList