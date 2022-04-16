import React, {useEffect, useState} from 'react';
import { Text, View, TouchableOpacity, Button, LogBox, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

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
    
    const [mode, setMode] = useState<any>('date');
    const [modeFinal, setModeFinal] = useState<any>('date');
    const [show, setShow] = useState(false);
    const [showFinal, setShowFinal] = useState(false);

    useEffect(() => {
        onChange('', dateStart);
        onChangeFinal('', dateEnd);
    }, [dateStart, dateEnd]);

    const onChange = (event: any, selectedDate: any) => {
        const currentDate = selectedDate || dateStart;
        setShow(Platform.OS === 'ios')
        setDateStart(currentDate);

        let tempDate = new Date(currentDate);
        let fDate = zeroEsquerda(tempDate.getDate()) + '/' + zeroEsquerda(tempDate.getMonth() + 1) + '/' + tempDate.getFullYear();
        let fTime = zeroEsquerda(tempDate.getHours()) + ':' + zeroEsquerda(tempDate.getMinutes());
        
        setDataInicialBr(fDate);
        setHoraInicialBr(fTime);
    }

    const onChangeFinal = (event: any, selectedDate: any) => {
        const currentDate = selectedDate || dateEnd;
        setShowFinal(Platform.OS === 'ios')
        setDateEnd(currentDate);

        let tempDate = new Date(currentDate);
        let fDate = zeroEsquerda(tempDate.getDate()) + '/' + zeroEsquerda(tempDate.getMonth() + 1) + '/' + tempDate.getFullYear();
        let fTime = zeroEsquerda(tempDate.getHours()) + ':' + zeroEsquerda(tempDate.getMinutes());
        
        setDataFinalBr(fDate);
        setHoraFinalBr(fTime);
    }

    const showMode = (currentMode: string) => {
        setShow(true);
        setMode(currentMode);
    }

    const showModeFinal = (currentMode: string) => {
        setShowFinal(true);
        setModeFinal(currentMode);
    }

    const zeroEsquerda = (valor: number) => {
        let retorno: string = valor >= 0 && valor < 10 ? '0' + valor: valor.toString();
        return retorno;
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
                            onPress={() => { showMode('date') }}
                        />
                        <DateTimeInput
                            texto={horaInicialBr}
                            tamanho="60px"
                            onPress={() => { showMode('time') }}
                        />
                    </ViewHorizontal>
                </View>
                <View>
                    <Text>Final</Text>
                    <ViewHorizontal>
                        <DateTimeInput
                            texto={dataFinalBr}
                            tamanho="110px"
                            onPress={() => { showModeFinal('date') }}
                        />
                        <DateTimeInput
                            texto={horaFinalBr}
                            tamanho="60px"
                            onPress={() => { showModeFinal('time') }}
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
            {show && (
                <DateTimePicker
                    testID='dateTimePicker'
                    value={dateStart}
                    mode={mode}
                    is24Hour={true}
                    display='default'
                    onChange={onChange}
                 />
            )}
            {showFinal && (
                <DateTimePicker
                    testID='dateTimePicker'
                    value={dateEnd}
                    mode={modeFinal}
                    is24Hour={true}
                    display='default'
                    onChange={onChangeFinal}
                 />
            )}
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