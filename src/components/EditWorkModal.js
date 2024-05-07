import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons'

const EditWorkModal = ({ visible, work, onSave, onClose }) => {
    const [editedWork, setEditedWork] = useState({ ...work });
    const handleSave = () => {
        onSave(editedWork);
    };
    useEffect(() => {
        setEditedWork({ ...work });
    }, [work]);
    const handleCloseModal = () => {
        console.log(editedWork)
        setEditedWork({ name: '' }); // Đặt lại giá trị của trường "name" về rỗng
        
        onClose(); // Gọi hàm onClose để đóng modal
    };
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                <View className="bg-white p-5 rounded-md">
                    <TouchableOpacity onPress={handleCloseModal} className="absolute top-2 right-2">
                        <Ionicons name="close" size={30} color="black" />
                    </TouchableOpacity>
                    <TextInput
                        value={editedWork.name}
                        onChangeText={(text) => setEditedWork({...editedWork, name: text})}
                        placeholder="Tên công việc"
                        className="border-b-2 my-2 text-lg leading-9"
                        multiline={true}
                        numberOfLines={4}
                    />
                    <Button title="Lưu" onPress={handleSave} />
                </View>
            </View>
        </Modal>
    );
};

export default EditWorkModal;
