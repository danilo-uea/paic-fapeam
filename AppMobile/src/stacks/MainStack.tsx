import React, { useState } from 'react';
import { View, LogBox, StyleSheet, Text } from 'react-native';

import base64 from 'react-native-base64';
import BluetoothBle from '../../src/services/bluetooth';
import { BleManager, Device } from 'react-native-ble-plx';
const BLTManager = new BleManager();
const ble = new BluetoothBle();
const SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const MESSAGE_UUID = '6d68efe5-04b6-4a85-abc4-c2670b7bf7fd';
LogBox.ignoreLogs(['new NativeEventEmitter']); //Ignore log notification by message
LogBox.ignoreAllLogs();                        //Ignore all log notifications

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Main from '../screens/main';
import Pagination from '../screens/pagination';
import { ViewHorizontal } from './styles';
import { useNavigation } from '@react-navigation/native';
import { propsNavigationStack } from './models';
import { propsStack } from './models';
import ButtonTopMenu from '../components/ButtonTopMenu';

const Stack = createNativeStackNavigator<propsNavigationStack>();

const MainStack = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [connectedDevice, setConnectedDevice] = useState<Device>();
    const [message, setMessage] = useState('Esperando dados');
    const navigation = useNavigation<propsStack>();

    async function scanDevices() {
        BLTManager.startDeviceScan(null, null, (error, scannedDevice) => {
            if (error) {
                console.warn(error);
            }

            if (scannedDevice && scannedDevice.name == 'ESP32') {
                BLTManager.stopDeviceScan();
                console.log('Conectou');
                connectDevice(scannedDevice);
            }
        });

        setTimeout(() => {
            console.log('Parou o escaneamento')
            BLTManager.stopDeviceScan();
        }, 5000);
    }

    async function connectDevice(device: Device) {
        device
            .connect()
            .then(device => {
                return device.discoverAllServicesAndCharacteristics();
            })
            .then(device => {
                setConnectedDevice(device);
                setIsConnected(true);

                BLTManager.onDeviceDisconnected(device.id, (error, device) => {
                    console.log('Dispositivo desconectado');
                    setIsConnected(false);
                });

                device.monitorCharacteristicForService(
                    SERVICE_UUID,
                    MESSAGE_UUID,
                    (error, characteristic) => {
                        if (characteristic?.value != null) {
                            setMessage(base64.decode(characteristic?.value));
                            console.log(base64.decode(characteristic?.value));
                        }
                    },
                    'messagetransaction',
                );
            })
    }

    async function disconnectDevice() {
        if (connectedDevice != null) {
            const isDeviceConnected = await connectedDevice.isConnected();
            if (isDeviceConnected) {
                BLTManager.cancelTransaction('messagetransaction');
                BLTManager.cancelTransaction('nightmodetransaction');

                BLTManager.cancelDeviceConnection(connectedDevice.id);
            }

            const connectionStatus = await connectedDevice.isConnected();

            if (!connectionStatus) {
                setIsConnected(false);
            }
        }
    }

    const pagePrincipal = () => {
        navigation.navigate('Main', { name: 'Main', id: 1 });
    }

    const pagePaginacao = () => {
        navigation.navigate('Pagination', { name: 'Pagination', id: 2 });
    }

    return (
        <>
            <View style={{ marginTop: 10, marginBottom: 10 }}>
                <ViewHorizontal>
                    <ButtonTopMenu texto='Principal' tamanho='100px' onPress={pagePrincipal} />
                    <ButtonTopMenu texto='Paginação' tamanho='110px' onPress={pagePaginacao} />
                    {!isConnected ? (
                        <ButtonTopMenu texto='Conectar' tamanho='100px' onPress={() => scanDevices()} />
                    ) : (
                        <ButtonTopMenu texto='Desconectar' tamanho='120px' onPress={() => disconnectDevice()} />
                    )}
                </ViewHorizontal>
            </View>
            <Text style={{ fontSize: 15 }}>{message}</Text>
            <Stack.Navigator initialRouteName="Main"
                screenOptions={{
                    headerShown: false
                }}
            >
                <Stack.Screen name="Main" component={Main} />
                <Stack.Screen name="Pagination" component={Pagination} />
            </Stack.Navigator>
        </>
    )
}

export default MainStack;