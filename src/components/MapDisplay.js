import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { api_key } from '../api/google';

const MapDisplay = ({ latitude, longitude, isDraggable, handleDragEnd, currentLatitude, currentLongitude }) => {
    return (
        <View style={styles.container}>
            <MapView
                style={{ width: 300, height: 300 }}
                initialRegion={{
                    latitude: latitude,
                    longitude: longitude,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                }}
                provider={PROVIDER_GOOGLE}
            >
                <Marker
                    coordinate={{
                        latitude: latitude,
                        longitude: longitude,
                    }}
                    draggable={isDraggable}
                    onDragEnd={handleDragEnd}
                />
                {currentLatitude && currentLongitude && (
                    <Marker
                    coordinate={{
                        latitude: currentLatitude,
                        longitude: currentLongitude,
                    }}
                    title="vị trí hiện tại"
                    pinColor="blue"
                    />
                )}
                {currentLatitude && currentLongitude && (
                    
                    <MapViewDirections 
                        origin={{
                            latitude: currentLatitude,
                            longitude: currentLongitude,
                        }}
                        destination={{
                            latitude: latitude,
                            longitude: longitude,
                        }}
                        apikey={api_key}
                        strokeWidth={3}
                        strokeColor="hotpink"
                    />
                )}

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