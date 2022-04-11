// import React, {useState} from 'react';
// import {BleManager, Device} from 'react-native-ble-plx';
// import base64 from 'react-native-base64';
// import BluetoothBle from './src/services/bluetooth/'

// import {
//   StyleSheet,
//   Text,
//   View,
//   TouchableOpacity,
//   Button,
//   LogBox,
// } from 'react-native';

// LogBox.ignoreLogs(['new NativeEventEmitter']); // Ignore log notification by message
// LogBox.ignoreAllLogs(); //Ignore all log notifications

// const BLTManager = new BleManager();
// const ble = new BluetoothBle();
// const SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
// const MESSAGE_UUID = '6d68efe5-04b6-4a85-abc4-c2670b7bf7fd';

// const App = () => {
//   const [isConnected, setIsConnected] = useState(false);
//   const [connectedDevice, setConnectedDevice] = useState<Device>();
//   const [message, setMessage] = useState('Esperando dados');

//   async function scanDevices() {
//       BLTManager.startDeviceScan(null, null, (error, scannedDevice) => {
//         if (error) {
//           console.warn(error);
//         }
                
//         if (scannedDevice && scannedDevice.name == 'ESP32') {
//           BLTManager.stopDeviceScan();
//           console.log('Conectou');
//           connectDevice(scannedDevice);
//         }
//       });

//       setTimeout(() => {
//         BLTManager.stopDeviceScan();
//       }, 5000);
//   }

//   async function connectDevice(device: Device) 
//   {
//     device
//       .connect()
//       .then(device => {
//         return device.discoverAllServicesAndCharacteristics();
//       })
//       .then(device => {
//         setConnectedDevice(device);
//         setIsConnected(true);

//         BLTManager.onDeviceDisconnected(device.id, (error, device) => {
//           console.log('Dispositivo desconectado');
//           setIsConnected(false);
//         });

//         device.monitorCharacteristicForService(
//           SERVICE_UUID,
//           MESSAGE_UUID,
//           (error, characteristic) => {
//             if (characteristic?.value != null) {
//               setMessage(base64.decode(characteristic?.value));
//               console.log(base64.decode(characteristic?.value));
//             }
//           },
//           'messagetransaction',
//         );
//       })
//   }

//   async function disconnectDevice() {
//     if (connectedDevice != null) {
//       const isDeviceConnected = await connectedDevice.isConnected();
//       if (isDeviceConnected) {
//         BLTManager.cancelTransaction('messagetransaction');
//         BLTManager.cancelTransaction('nightmodetransaction');

//         BLTManager.cancelDeviceConnection(connectedDevice.id).then(() =>
//           console.log('Desconexão completa'),
//         );
//       }

//       const connectionStatus = await connectedDevice.isConnected();
//       if (!connectionStatus) {
//         setIsConnected(false);
//       }
//     }
//   }

//   return (
//     <View style={styles.sectionContainer}>
//       <Text>
//         {isConnected ? message : 'Esperando dados'}
//       </Text>
//       <TouchableOpacity style={{width: 120, marginBottom: 10}}>
//         {!isConnected ? (
//             <Button
//               title="Connect"
//               onPress={() => {
//                 scanDevices();
//               }}
//               disabled={false}
//             />
//           ) : (
//             <Button
//               title="Disonnect"
//               onPress={() => {
//                 disconnectDevice();
//               }}
//               disabled={false}
//             />
//           )}
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   sectionContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center'
//   },
// });

// export default App;
