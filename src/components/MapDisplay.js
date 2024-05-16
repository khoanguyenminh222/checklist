import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const MapDisplay = ({ latitude, longitude }) => {
    return (
        <View style={styles.container}>
            <MapView
                style={{ width: 300, height: 300 }}
                initialRegion={{
                    latitude: latitude,
                    longitude: longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }}
            >
                <Marker
                    coordinate={{
                        latitude: latitude,
                        longitude: longitude,
                    }}
                />
            </MapView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
export default MapDisplay;