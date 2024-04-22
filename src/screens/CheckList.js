import { View, Text, SafeAreaView, TextInput, Button } from 'react-native'
import React, { useState, useEffect } from 'react';
import DropdownComponent from '../components/DropdownComponent';
import validator from 'validator';
import Item from '../components/Item';
import Header from '../components/Header';
import { useUser } from '../UserProvider';

const CheckList = ({navigation}) => {
    const { isLogin } = useUser();
    const [name, setName] = useState('');
    const [district, setDistrict] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [address, setAddress] = useState('');
    const [vnptAccount, setVnptAccount] = useState('');
    const [errorName, setErrorName] = useState('');
    const [errorDistrict, setErrorDistrict] = useState('');
    const [errorPhoneNumber, setErrorPhoneNumber] = useState('');
    const [errorAddress, setErrorAddress] = useState('');

    useEffect(() => {
        // Kiểm tra trạng thái đăng nhập khi màn hình được tạo
        if (!isLogin()) {
          navigation.replace('Login'); // Nếu chưa đăng nhập, chuyển hướng đến màn hình đăng nhập
        }
    },[navigation]);

    const data = [
        { label: 'Item 1', value: '1' },
        { label: 'Item 2', value: '2' },
        { label: 'Item 3', value: '3' },
        { label: 'Item 4', value: '4' },
        { label: 'Item 5', value: '5' },
        { label: 'Item 6', value: '6' },
        { label: 'Item 7', value: '7' },
        { label: 'Item 8', value: '8' },
    ];
    const handleDistrictChange = (value) => {
        setDistrict(value);
    };
    const handleSubmit = () => {
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

        // Xử lý dữ liệu khi người dùng nhấn nút gửi
        console.log('Tên khách hàng:', name);
        console.log('Quận/Huyện:', district);
        console.log('Số điện thoại:', phoneNumber);
        console.log('Địa chỉ:', address);
        console.log('Tài khoản VNPT:', vnptAccount);
        // Thực hiện các thao tác khác như lưu dữ liệu vào cơ sở dữ liệu, gửi dữ liệu đến máy chủ, vv.
    };
    return (
        <SafeAreaView>
            <Header screenName="CheckList" navigation={navigation}/>
            <View className="flex flex-col mx-2 mb-2 h-screen bg-gray-100">
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
                <View className="bg-white rounded-lg shadow-md px-8 pt-6 pb-8 mb-4">
                    <Text className="text-base text-center font-bold text-blue-500 mb-4">Nội dung công việc đến nhà khách hàng</Text>
                    <Item />
                    <Button
                        title='Gửi'
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        onPress={handleSubmit}
                    />
                </View>
            </View>
        </SafeAreaView>
    )
}

export default CheckList