// import React, {useState} from 'react';
import { PermissionsAndroid } from 'react-native';
import {BleManager, Device} from 'react-native-ble-plx';
import base64 from 'react-native-base64';

const SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const MESSAGE_UUID = '6d68efe5-04b6-4a85-abc4-c2670b7bf7fd';

export default class BluetoothBle
{
    public BLTManager = new BleManager();
    public connectedDevice: Device | undefined = undefined;

    disconnectDevice = async () => {
        console.log('Iniciando desconexão');
    
        if (this.connectedDevice != null) {
          const isDeviceConnected = await this.connectedDevice.isConnected();
          if (isDeviceConnected) {
            this.BLTManager.cancelTransaction('messagetransaction');
            this.BLTManager.cancelTransaction('nightmodetransaction');
    
            this.BLTManager.cancelDeviceConnection(this.connectedDevice.id).then(() =>
              console.log('Desconexão completa'),
            );
          }
    
        //   const connectionStatus = await connectedDevice.isConnected();
        //   if (!connectionStatus) {
        //     setIsConnected(false);
        //   }
        }
      }

    connectDevice = async (device: Device): Promise<Device> => {
        console.log('Conectando o dispositivo:', device.name);

        return await device
        .connect()
        .then(device => {
            // setConnectedDevice(device);
            // setIsConnected(true);
            return device.discoverAllServicesAndCharacteristics();
        })
        .then(device => {
            this.connectedDevice = device;

            this.BLTManager.onDeviceDisconnected(device.id, (error, device) => {
                console.log('Dispositivo desconectado');
                //   setIsConnected(false);
            });

            //Message
            device.monitorCharacteristicForService(
                SERVICE_UUID,
                MESSAGE_UUID,
                (error, characteristic) => {
                    if (characteristic?.value != null) {
                        //   setMessage(base64.decode(characteristic?.value));
                        console.log(base64.decode(characteristic?.value));
                    }
                },
            'messagetransaction',
            );

            return device;
        })
    }

    scanDevices = async () => {
        
        await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
                title: 'Permission Localisation Bluetooth',
                message: 'Requirement for Bluetooth',
                buttonNeutral: 'Later',
                buttonNegative: 'Cancel',
                buttonPositive: 'OK',
            },
        ).then(answere => {
            console.log('Escaneando bluetooth');

            this.BLTManager.startDeviceScan(null, null, async (error, scannedDevice) => {
                if (error) {
                    console.warn(error);
                    return undefined;
                }
                        
                if (scannedDevice && scannedDevice.name == 'ESP32') {
                    this.BLTManager.stopDeviceScan();
                    await this.connectDevice(scannedDevice)
                        .then(response => {
                            console.log('Retorno deu certo')
                            console.log(response.name)
                            return response;
                        })
                        .catch(error => {
                            return undefined
                        });
                }
            });
            
            setTimeout(() => {
                this.BLTManager.stopDeviceScan();
                return undefined;
            }, 5000);

            return undefined;
        })
        .catch(error => {
            return undefined;
        });
    }
}