import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import ButtonTopMenu from '../../components/ButtonTopMenu';
import InputName from "../../components/InputName"
import DadosPosicaoFixa from '../../services/sqlite/DadosPosicaoFixa';
import { useNavigation } from '@react-navigation/native';
import { propsStack } from '../../stacks/models';

const FixPosition = () => {
    const [latitude, setLatitude] = useState<string>('')
    const [longitude, setLongitude] = useState<string>('')
    const navigation = useNavigation<propsStack>()

    useEffect(() => {
        if (latitude === '' || longitude === '') {
            init()
        }
    }, [])

    const init = async () => {
        var response: any = await DadosPosicaoFixa.get()
        if (response !== null) {
            setLatitude(response?.latitudeReceptor.toString())
            setLongitude(response?.longitudeReceptor.toString())
        }
    }

    const cadastrarPosicao = async () => {
        if (latitude === null || latitude === '' || longitude === null || latitude === '') {
            Alert.alert('Messagem', 'Digite uma latitude e uma longitude')
        } else {
            let latitudeNumber = parseFloat(latitude)
            let longitudeNumber = parseFloat(longitude)

            console.log(latitudeNumber)

            if (isNaN(latitudeNumber) || isNaN(longitudeNumber)) {
                Alert.alert('Messagem', 'Digite um formato válido')
            } else {
                let posicao = await DadosPosicaoFixa.get()

                if (posicao === null) {
                    DadosPosicaoFixa.insert(latitudeNumber, longitudeNumber)
                        .then((response: any) => {
                            Alert.alert('Messagem', response.toString())
                            console.log(response)
                        })
                        .catch(err => {
                            Alert.alert('Erro', err.message.toString())
                            console.log(err)
                        })
                } else {
                    DadosPosicaoFixa.update(latitudeNumber, longitudeNumber)
                        .then((response: any) => {
                            Alert.alert('Messagem', response.toString())
                            console.log(response)
                        })
                        .catch(err => {
                            Alert.alert('Erro', err.message.toString())
                            console.log(err)
                        })
                }
            }
        }
    }

    return (
        <View style={{ marginRight: 8, marginLeft: 8 }}>
            <View style={{ marginTop: 8, marginBottom: 8 }}>
                <Text>Posição Fixa</Text>
            </View>
            <InputName
                placeholder="Digite a latitude"
                value={latitude}
                onChangeText={setLatitude}
            />
            <InputName
                placeholder="Digite a longitude"
                value={longitude}
                onChangeText={setLongitude}
            />

            <ButtonTopMenu texto='Cadastrar' tamanho='200px' bottom={10} onPress={() => cadastrarPosicao()} />
            <ButtonTopMenu texto='Voltar' tamanho='200px' bottom={10} onPress={() => navigation.navigate('Main')} />
        </View>
    );
};

const styles = StyleSheet.create({
    input: {
        height: 40,
        margin: 12,
        borderWidth: 1,
        padding: 10,
    },
});

export default FixPosition;
