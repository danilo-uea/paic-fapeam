import React, { useEffect, useState } from 'react';
import { View, LogBox, Text, Alert } from 'react-native';
import DadosEsp32 from '../services/sqlite/DadosEsp32';

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
    const [message, setMessage] = useState<string>('');
    const [messageArray, setMessageArray] = useState<string[]>([]);
    const navigation = useNavigation<propsStack>();
    const [intervalId, setIntervalId] = useState<any>();
    const [ erro, setErro ] = useState<string>('');

    useEffect(() => {
        splitString(message, ';')
    }, [message])

    useEffect(() => {
        if (messageArray.length === 7) {
            DadosEsp32.create(messageArray[0], messageArray[1], messageArray[2], messageArray[3], messageArray[4], messageArray[5], messageArray[6])
                .then((response: any) => {
                    console.log(response)
                    setErro('')
                })
                .catch(err => {
                    console.log(err)
                    setErro(err.message.toString())
                })
        }
    }, [messageArray])

    const splitString = (stringToSplit: string, separator: string) => {
        if (message !== '') {
            let arrayOfStrings = stringToSplit.split(separator);
            if (arrayOfStrings.length === 7) {
                setMessageArray(arrayOfStrings);
            }
        }
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

    const conectarMock = () => {
        if (intervalId) {
            clearInterval(intervalId);
        }

        var Id = setInterval(() => {
            cont++;
            let utcDate = new Date();
            let data =
                `${utcDate.getFullYear()}-` +                           //Ano
                `${DadosEsp32.zeroEsquerda(utcDate.getMonth() + 1)}-` + //Mês
                `${DadosEsp32.zeroEsquerda(utcDate.getDate())} ` +      //Dia
                `${utcDate.toLocaleTimeString()}`;                      //Hora:minuto:segundo
            let message = cont.toString() + ';' + data + ';7;-75;21;-3.030872;-59.970642';
            setMessage(message)
        }, 1000);

        setIntervalId(Id);
        setIsConnected(true);
    }

    const desconectarMock = () => {
        if (intervalId) {
            clearInterval(intervalId);
        }

        setMessage('');
        setMessageArray([]);
        setIntervalId(undefined);
        setIsConnected(false);
    }

    return (
        <>
            <View style={{ marginTop: 10, marginBottom: 10 }}>
                <ViewHorizontal>
                    <ButtonTopMenu texto='Principal' tamanho='100px' onPress={pagePrincipal} />
                    <ButtonTopMenu texto='Paginação' tamanho='110px' onPress={pagePaginacao} />
                    {!isConnected ? (
                        // <ButtonTopMenu texto='Conectar' tamanho='100px' onPress={() => scanDevices()} />
                        <ButtonTopMenu texto='Conectar' tamanho='100px' onPress={() => conectarMock()} />
                    ) : (
                        // <ButtonTopMenu texto='Desconectar' tamanho='120px' onPress={() => disconnectDevice()} />
                        <ButtonTopMenu texto='Desconectar' tamanho='120px' onPress={() => desconectarMock()} />
                    )}
                </ViewHorizontal>
            </View>
            {isConnected && messageArray.length === 7 && erro === '' ?
                (
                    <>
                        <Text style={{ fontSize: 15 }}>Contador: {messageArray[0]}</Text>
                        <Text style={{ fontSize: 15 }}>Data: {messageArray[1]}</Text>
                        <Text style={{ fontSize: 15 }}>Fator de Espalhamento: {messageArray[2]}</Text>
                        <Text style={{ fontSize: 15 }}>RSSI: {messageArray[3]}</Text>
                        <Text style={{ fontSize: 15 }}>Tamanho Pacote: {messageArray[4]} bytes</Text>
                        <Text style={{ fontSize: 15 }}>Latitude: {messageArray[5]}</Text>
                        <Text style={{ fontSize: 15 }}>Longitude: {messageArray[6]}</Text>
                    </>
                ) : 
                    <>
                        { erro !== '' ?
                            <>
                                <View style={{ alignItems: 'center', flexDirection: 'column' }}>
                                    <Text style={{ color: 'red' }}>Erro</Text>
                                </View>
                                <Text style={{ color: 'red' }}>{erro}</Text>
                            </>
                        :   <></>
                        }
                    </>
            }
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