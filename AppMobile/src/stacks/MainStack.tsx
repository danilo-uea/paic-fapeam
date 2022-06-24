import React, { useEffect, useState } from 'react';
import { View, LogBox, Text, Alert } from 'react-native';
import DadosBluetooth from '../services/sqlite/DadosBluetooth';

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
import Details from '../screens/details';
import Export from '../screens/export';
import { ViewHorizontal } from './styles';
import { useNavigation } from '@react-navigation/native';
import { propsNavigationStack } from './models';
import { propsStack } from './models';
import ButtonTopMenu from '../components/ButtonTopMenu';
import FixPosition from '../screens/fixPosition';

const Stack = createNativeStackNavigator<propsNavigationStack>();

var cont: number = 1234;

const MainStack = () => {
    const [insistir, setInsistir] = useState<boolean>(false);
    const [isConnected, setIsConnected] = useState(false);
    const [armazenar, setArmazenar] = useState(false);
    const [connectedDevice, setConnectedDevice] = useState<Device>();
    const [message, setMessage] = useState<string>('');
    const [messageArray, setMessageArray] = useState<string[]>([]);
    const navigation = useNavigation<propsStack>();
    const [intervalId, setIntervalId] = useState<any>();
    const [intervalIdBle, setIntervalIdBle] = useState<any>();
    const [ erro, setErro ] = useState<string>('');

    useEffect(() => {
        splitString(message, ';')
    }, [message])
    
    useEffect(() => {
        if (messageArray.length === 10 && armazenar) {
            DadosBluetooth.create(messageArray[0], messageArray[1], messageArray[2], messageArray[3], messageArray[4], messageArray[5], messageArray[6], messageArray[7], messageArray[8], messageArray[9])
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
            if (arrayOfStrings.length === 9) {
                let utcDate = new Date();

                let data =
                    `${utcDate.getFullYear()}-` +                           //Ano
                    `${DadosBluetooth.zeroEsquerda(utcDate.getMonth() + 1)}-` + //Mês
                    `${DadosBluetooth.zeroEsquerda(utcDate.getDate())} ` +      //Dia
                    `${utcDate.toLocaleTimeString()}`;                      //Hora:minuto:segundo
                
                arrayOfStrings.push(data)

                setMessageArray(arrayOfStrings);
            }
        }
    }

    async function scanDevices() {
        BLTManager.startDeviceScan(null, null, (error, scannedDevice) => {
            if (error) {
                console.log('Erro ao scanear: ' + error);
                setErro(error.message.toString())
            } else {
                setErro('')
            }

            if (scannedDevice && scannedDevice.name == 'ESP32') {
                BLTManager.stopDeviceScan();
                if (intervalIdBle) {
                    clearInterval(intervalIdBle);
                }
                connectDevice(scannedDevice);
            }
        });

        // setTimeout(() => {
        //     console.log('Parou o escaneamento')
        //     BLTManager.stopDeviceScan();
        // }, 5000);
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
                console.log('Conectou');
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

    const conectarMock = () => {
        if (intervalId) {
            clearInterval(intervalId);
        }

        let Id = setInterval(() => {
            cont++;
            let message = cont.toString() + ';2022-05-08 13:20:15;7;-75;21;-3.030872;-59.970642;-3.030444;-59.970444';
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

    useEffect(() => {
        if (insistir) {
            if (!isConnected) {
                // scanDevices()

                // let id = setInterval(() => {
                //     console.log('Scaneando Ble')
                //     BLTManager.stopDeviceScan();
                //     scanDevices()
                // }, 10000)
                // setIntervalIdBle(id)

                conectarMock()
            } else {
                BLTManager.stopDeviceScan();
                if (intervalIdBle) {
                    clearInterval(intervalIdBle);
                }
            }
        } else {
            BLTManager.stopDeviceScan();
            if (intervalIdBle) {
                clearInterval(intervalIdBle);
            }
            
            if (isConnected){
                // disconnectDevice()
                desconectarMock()
            }
        }
    }, [insistir, isConnected])

    return (
        <>
            <View style={{ marginRight: 8, marginLeft: 8, marginTop: 10, marginBottom: 10 }}>
                <ViewHorizontal style={{ paddingBottom: 5 }}>
                    <ButtonTopMenu texto='Principal' tamanho='180px' onPress={() => navigation.navigate('Main')} />
                    <ButtonTopMenu texto='Paginação' tamanho='180px' onPress={() => navigation.navigate('Pagination')} />
                </ViewHorizontal>
                <ViewHorizontal style={{
                    borderTopColor: '#D8D3D3',
                    borderTopWidth: 1,
                    paddingTop: 5
                }}>
                    {!insistir ? (
                        <ButtonTopMenu texto='Conectar' tamanho='100px' onPress={() => setInsistir(true)} />
                    ) : (
                        <ButtonTopMenu texto='Desconectar' tamanho='120px' onPress={() => setInsistir(false)} />
                    )}
                    {armazenar ? (
                        <ButtonTopMenu texto='On' tamanho='50px' onPress={() => setArmazenar(!armazenar)} />
                    ) : (
                        <ButtonTopMenu texto='Off' tamanho='50px' onPress={() => setArmazenar(!armazenar)} />
                    )}
                    <View style={{ alignItems: 'center', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
                        <Text>Bluetooth: {isConnected ? 'Conectado' : 'Desconectado'}</Text>
                    </View>
                </ViewHorizontal>
            </View>
            <View style={{ marginRight: 8, marginLeft: 8, marginBottom: 5 }}>
                {isConnected && messageArray.length === 10 && erro === '' ?
                    (
                        <>
                            <Text style={{ fontSize: 15 }}>Contador: {messageArray[0]}</Text>
                            <Text style={{ fontSize: 15 }}>Satélite Data: {messageArray[1]}</Text>
                            <Text style={{ fontSize: 15 }}>Fator de Espalhamento: {messageArray[2]}</Text>
                            <Text style={{ fontSize: 15 }}>RSSI: {messageArray[3]}</Text>
                            <Text style={{ fontSize: 15 }}>Tamanho Pacote: {messageArray[4]} bytes</Text>
                            <Text style={{ fontSize: 15 }}>Emissor Latitude: {messageArray[5]}</Text>
                            <Text style={{ fontSize: 15 }}>Emissor Longitude: {messageArray[6]}</Text>
                            <Text style={{ fontSize: 15 }}>Receptor Latitude: {messageArray[7]}</Text>
                            <Text style={{ fontSize: 15 }}>Receptor Longitude: {messageArray[8]}</Text>
                            <Text style={{ fontSize: 15 }}>Data: {messageArray[9]}</Text>
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
            </View>
            <Stack.Navigator initialRouteName="Main"
                screenOptions={{
                    headerShown: false
                }}
            >
                <Stack.Screen name="Main" component={Main} />
                <Stack.Screen name="Pagination" component={Pagination} />
                <Stack.Screen name="Details" component={Details} />
                <Stack.Screen name="Export" component={Export} />
                <Stack.Screen name="FixPosition" component={FixPosition} />
            </Stack.Navigator>
        </>
    )
}

export default MainStack;