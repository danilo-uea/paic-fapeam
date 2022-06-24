import React, { useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import ButtonTopMenu from '../../components/ButtonTopMenu';
import DadosBluetooth from '../../services/sqlite/DadosBluetooth';
import { useNavigation } from '@react-navigation/native';
import { propsStack } from '../../stacks/models';

const Details = ({ route }: any) => {
    const [id, setId] = useState<number>(route.params?.id)
    const [obj, setObj] = useState<any>(null)
    const navigation = useNavigation<propsStack>();
    
    useEffect(() => {
        DadosBluetooth.get(id)
        .then((response:any) => {
            setObj(response)
        }).catch(err => {
            Alert.alert('Erro', err.message.toString())
            console.log(err)
        })
    }, [id])

    return (
        <View style={{ marginRight: 8, marginLeft: 8 }}>
            {obj !== null ? 
                <View style={{ marginBottom: 15, marginTop: 15 }}>
                    <Text>Id: {obj.id}</Text>
                    <Text>Contador: {obj.contador}</Text>
                    <Text>Satélite Data Hora: {obj.sateliteDataHora}</Text>
                    <Text>Fator de Espalhamento: {obj.fe}</Text>
                    <Text>RSSI: {obj.rssi}</Text>
                    <Text>Tamanho do pacote: {obj.tamanho} [bytes]</Text>
                    <Text>Emissor Latitude: {obj.latitudeEmissor}</Text>
                    <Text>Emissor Longitude: {obj.longitudeEmissor}</Text>
                    <Text>Receptor Latitude: {obj.latitudeReceptor}</Text>
                    <Text>Receptor Longitude: {obj.longitudeReceptor}</Text>
                    <Text>Data Hora: {obj.dataHora}</Text>
                </View>
            : <></>
            }
            
            <ButtonTopMenu texto='Voltar' tamanho='100px' onPress={() => navigation.navigate('Pagination')} />
        </View>
    );
};

export default Details;
