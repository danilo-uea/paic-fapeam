import React, { useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import ButtonTopMenu from '../../components/ButtonTopMenu';
import InputName from "../../components/InputName"
import DadosBluetooth from '../../services/sqlite/DadosBluetooth';
import { useNavigation } from '@react-navigation/native';
import { propsStack } from '../../stacks/models';

const FixPosition = () => {
    const [latitude, setLatitude] = useState<string>('')
    const [longitude, setLongitude] = useState<string>('')
    const navigation = useNavigation<propsStack>()
    
    useEffect(() => {
        
    })

    const cadastrarPosicao = () => {
        console.log('Cadastrar Posição Fixa')
    }

    return (
        <View style={{ marginRight: 8, marginLeft: 8 }}>
            <View style={{ marginTop: 8, marginBottom: 8 }}>
                <Text>Posição Fixa</Text>
            </View>
            <InputName
                placeholder="Digite a latitude"
                value={latitude}
                onChangeText={(t:string) => setLatitude(t)}
            />
            <InputName
                placeholder="Digite a longitude"
                value={longitude}
                onChangeText={(t:string) => setLongitude(t)}
            />

            <ButtonTopMenu texto='Cadastrar' tamanho='200px' bottom={10} onPress={() => cadastrarPosicao()} />
            <ButtonTopMenu texto='Voltar' tamanho='200px' bottom={10} onPress={() => navigation.navigate('Main')} />
        </View>
    );
};

export default FixPosition;
