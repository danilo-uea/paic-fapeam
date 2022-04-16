import React, {useEffect, useState} from 'react';
import { Text, View, TouchableOpacity, Button, LogBox, StyleSheet, Platform } from 'react-native';

import base64 from 'react-native-base64';
import BluetoothBle from '../../src/services/bluetooth';
import {BleManager, Device} from 'react-native-ble-plx';
const BLTManager = new BleManager();
const ble = new BluetoothBle();
const SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const MESSAGE_UUID = '6d68efe5-04b6-4a85-abc4-c2670b7bf7fd';
LogBox.ignoreLogs(['new NativeEventEmitter']); //Ignore log notification by message
LogBox.ignoreAllLogs();                        //Ignore all log notifications

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Main from '../screens/main';
import { ViewHorizontal, CustomButton, CustomButtonText } from './styles';
import DateTimeInput from '../components/DateTimeInput';

const Stack = createNativeStackNavigator();

const MainStack = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [connectedDevice, setConnectedDevice] = useState<Device>();
    const [message, setMessage] = useState('Esperando dados');

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
            BLTManager.stopDeviceScan();
        }, 5000);
    }
  
    async function connectDevice(device: Device) 
    {
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

    const [dateStart, setDateStart] = useState(new Date());
    const [dataInicialBr, setDataInicialBr] = useState<string>('');
    const [horaInicialBr, setHoraInicialBr] = useState<string>('');
    
    const [dateEnd, setDateEnd] = useState(new Date());
    const [dataFinalBr, setDataFinalBr] = useState<string>('');
    const [horaFinalBr, setHoraFinalBr] = useState<string>('');
    
    const [mode, setMode] = useState('date');
    const [show, setShow] = useState(false);
    const [text, setText] = useState('Empty');

    useEffect(() => {
        onChange(dateStart);
    }, [dateStart]);

    const onChange = (selectedDate: any) => {
        const currentDate = selectedDate || dateStart;
        setShow(Platform.OS === 'ios')
        setDateStart(currentDate);

        let tempDate = new Date(currentDate);
        let fDate = tempDate.getDate() + '/' + (tempDate.getMonth() + 1) + '/' + tempDate.getFullYear();
        let fTime = tempDate.getHours() + ':' + tempDate.getMinutes();
        
        setDataInicialBr(fDate);
        setHoraInicialBr(fTime);
    }

    const showMode = (currentMode: string) => {
        setShow(true);
        setMode(currentMode);
    }

    return (
        <>
            <View style={{ marginTop: 5 }} />
            <ViewHorizontal>
                <View style={{ marginRight: 10 }}>
                    <Text>Inicial</Text>
                    <ViewHorizontal>
                        <DateTimeInput
                            texto={dataInicialBr}
                            tamanho="110px"
                            onPress={() => { console.log('Pressionado') }}
                        />
                        <DateTimeInput
                            texto={horaInicialBr}
                            tamanho="60px"
                            onPress={() => { console.log('Pressionado') }}
                        />
                    </ViewHorizontal>
                </View>
                <View>
                    <Text>Final</Text>
                    <ViewHorizontal>
                        <DateTimeInput
                            texto="25/03/1988"
                            tamanho="110px"
                            onPress={() => { console.log('Pressionado') }}
                        />
                        <DateTimeInput
                            texto="19:51"
                            tamanho="60px"
                            onPress={() => { console.log('Pressionado') }}
                        />
                    </ViewHorizontal>
                </View>
            </ViewHorizontal>
            <ViewHorizontal>
                <CustomButton onPress={() => console.log('Desconectando')}>
                    <CustomButtonText>
                        Exportar
                    </CustomButtonText>
                </CustomButton>
                    {!isConnected ? (
                        <CustomButton onPress={() => console.log('Conectando')}>
                            <CustomButtonText>
                                Conectar
                            </CustomButtonText>
                        </CustomButton>
                    ) : (
                        <CustomButton onPress={() => console.log('Desconectando')}>
                            <CustomButtonText>
                                Desconectar
                            </CustomButtonText>
                        </CustomButton>
                    )}
                <CustomButton onPress={() => console.log('Desconectando')}>
                    <CustomButtonText>
                        Excluir
                    </CustomButtonText>
                </CustomButton>
            </ViewHorizontal>
            <Stack.Navigator initialRouteName="main"
                screenOptions={{
                    headerShown: false
                }}
            >
                <Stack.Screen name="Main" component={Main} />
            </Stack.Navigator>
        </>
    )
}

export default MainStack;