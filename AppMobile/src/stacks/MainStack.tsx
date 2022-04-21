import React, { useEffect, useState } from 'react';
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

var cont: number = 1234;

const MainStack = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [connectedDevice, setConnectedDevice] = useState<Device>();
    const [message, setMessage] = useState('Esperando dados');
    const navigation = useNavigation<propsStack>();
    const [intervalId, setIntervalId] = useState<any>();

    useEffect(() => {        
        if (intervalId){
            clearInterval(intervalId);
        }
        
        var Id = setInterval(() => {
            cont++;
            setMessage(cont.toString() + ';17;4;2022;16:00:28;7;-75;21;-3.030872;-59.970642')
        }, 4000);

        setIntervalId(Id);
    }, []);

    useEffect(() => {
        splitString(message, ';')
    }, [message])

    const splitString = (stringToSplit:string, separator:string) => {
        var arrayOfStrings = stringToSplit.split(separator);

        console.log(
            arrayOfStrings[0] + ';' + 
            arrayOfStrings[1] + ';' +
            arrayOfStrings[2] + ';' + 
            arrayOfStrings[3] + ';' + 
            arrayOfStrings[4] + ';' + 
            arrayOfStrings[5] + ';' + 
            arrayOfStrings[6] + ';' + 
            arrayOfStrings[7] + ';' + 
            arrayOfStrings[8] + ';' + 
            arrayOfStrings[9]
        );
    }


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
        const options = {
            autoConnect: false,
            requestMTU: 128
          };

        device
            .connect(options)
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
                            // 10082;17;4;2022;16:00:28;7;-75;21;-3.030872;-59.970642
                            // dados_lora.contador, 
                            // dados_lora.dia, 
                            // dados_lora.mes, 
                            // dados_lora.ano, 
                            // dados_lora.hora, 
                            // dados_lora.minuto, 
                            // dados_lora.segundo, 
                            // fatorE, 
                            // lora_rssi, 
                            // tam_pacote, 
                            // dados_lora.f_latitude, 
                            // dados_lora.f_longitude
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
                await BLTManager.cancelTransaction('messagetransaction');
                await BLTManager.cancelTransaction('nightmodetransaction');

                BLTManager.cancelDeviceConnection(connectedDevice.id).then(response => {
                    setIsConnected(false);
                });
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