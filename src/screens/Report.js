import { View, Text, StyleSheet  } from 'react-native'
import React from 'react'

const Report = () => {
  const reportData = {
    customerName: "Minh Khoa",
    district: "Thành phố Vũng Tàu",
    phoneNumber: "0969606095",
    address: "55A Ngô Đức Kế",
    checkedItems: [
      "6627356d9548261c65f4fd42",
      "662735999548261c65f4fd46"
    ],
    date: "2024-04-24T08:49:32.588Z",
    note: ""
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Báo cáo</Text>
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Tên khách hàng:</Text>
        <Text style={styles.value}>{reportData.customerName}</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Quận/Huyện:</Text>
        <Text style={styles.value}>{reportData.district}</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Số điện thoại:</Text>
        <Text style={styles.value}>{reportData.phoneNumber}</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Địa chỉ:</Text>
        <Text style={styles.value}>{reportData.address}</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Các mục đã kiểm tra:</Text>
        {reportData.checkedItems.map((item, index) => (
          <Text key={index} style={styles.value}>{item}</Text>
        ))}
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Ngày tạo:</Text>
        <Text style={styles.value}>{reportData.date}</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Ghi chú:</Text>
        <Text style={styles.value}>{reportData.note}</Text>
      </View>
    </View>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoContainer: {
    marginBottom: 10,
  },
  label: {
    fontWeight: 'bold',
  },
  value: {
    marginLeft: 10,
  },
});
export default Report