import React, {useState} from 'react';
import {BleManager, Device} from 'react-native-ble-plx';
import base64 from 'react-native-base64';
import BluetoothBle from './src/services/bluetooth/'

import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Button,
  PermissionsAndroid,
  LogBox,
} from 'react-native';

LogBox.ignoreLogs(['new NativeEventEmitter']); // Ignore log notification by message
LogBox.ignoreAllLogs(); //Ignore all log notifications

const BLTManager = new BleManager();

const ble = new BluetoothBle();

const SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';

const MESSAGE_UUID = '6d68efe5-04b6-4a85-abc4-c2670b7bf7fd';

const App = () => {
  //Is a device connected?
  const [isConnected, setIsConnected] = useState(false);

  //What device is connected?
  const [connectedDevice, setConnectedDevice] = useState<Device>();

  const [message, setMessage] = useState('Esperando dados');

  // Scans availbale BLT Devices and then call connectDevice
  async function scanDevices() {
    PermissionsAndroid.request(
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
      // display the Activityindicator

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

      // stop scanning devices after 5 seconds
      setTimeout(() => {
        BLTManager.stopDeviceScan();
        console.log('Parou escaneamento');
      }, 5000);
    });
  }

  async function connectDevice(device: Device) 
  {
    console.log('Conectando o dispositivo:', device.name);

    device
      .connect()
      .then(device => {
        setConnectedDevice(device);
        setIsConnected(true);
        return device.discoverAllServicesAndCharacteristics();
      })
      .then(device => {
        //  Set what to do when DC is detected
        BLTManager.onDeviceDisconnected(device.id, (error, device) => {
          console.log('Dispositivo desconectado');
          setIsConnected(false);
        });

        //Message
        // device
        //   .readCharacteristicForService(SERVICE_UUID, MESSAGE_UUID)
        //   .then(valenc => {
        //     setMessage(base64.decode(valenc?.value));
        //   });

        //Message
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

  // handle the device disconnection (poorly)
  async function disconnectDevice() {
    console.log('Iniciando desconexão');

    if (connectedDevice != null) {
      const isDeviceConnected = await connectedDevice.isConnected();
      if (isDeviceConnected) {
        BLTManager.cancelTransaction('messagetransaction');
        BLTManager.cancelTransaction('nightmodetransaction');

        BLTManager.cancelDeviceConnection(connectedDevice.id).then(() =>
          console.log('Desconexão completa'),
        );
      }

      const connectionStatus = await connectedDevice.isConnected();
      if (!connectionStatus) {
        setIsConnected(false);
      }
    }
  }

  async function conectando() {
    await ble.scanDevices().then(response => {
      
      // console.log('Monitorando');
      // const SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
      // const MESSAGE_UUID = '6d68efe5-04b6-4a85-abc4-c2670b7bf7fd';
      // if(response === undefined){
      //   console.log('Indefinido')
      // }
      // else
      // {
      //   // console.log(response.name)
      // }
    //   ble.connectedDevice?.monitorCharacteristicForService(
    //     SERVICE_UUID,
    //     MESSAGE_UUID,
    //     (error, characteristic) => {
    //         if (characteristic?.value != null) {
    //             //   setMessage(base64.decode(characteristic?.value));
    //             console.log(base64.decode(characteristic?.value));
    //         }
    //     },
    // 'messagetransaction',
    // );

    });
  }

  async function desconectando() {
    ble.disconnectDevice();
    // console.log(bls.contador())
  }

  return (
    <View style={styles.sectionContainer}>
      <Text>
        {isConnected ? message : 'Esperando dados'}
      </Text>
      <TouchableOpacity style={{width: 120, marginBottom: 10}}>
        {!isConnected ? (
            <Button
              title="Connect"
              onPress={() => {
                scanDevices();
              }}
              disabled={false}
            />
          ) : (
            <Button
              title="Disonnect"
              onPress={() => {
                disconnectDevice();
              }}
              disabled={false}
            />
          )}
      </TouchableOpacity>
      <TouchableOpacity style={{width: 120, marginBottom: 10}}>
        <Button
          title="Testando Conectando"
          onPress={() => {
            conectando();
          }}
        />
      </TouchableOpacity>
      <TouchableOpacity style={{width: 120, marginBottom: 10}}>
        <Button
          title="Testando Desconectando"
          onPress={() => {
            desconectando();
          }}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
});

export default App;
