import React, { useEffect, useState } from "react"
import { Alert, Text, View } from "react-native"
import { useNavigation } from '@react-navigation/native'
import { propsStack } from '../../stacks/models'
import ButtonTopMenu from "../../components/ButtonTopMenu"
import InputName from "../../components/InputName"
import DadosEsp32 from "../../services/sqlite/DadosEsp32"

const Export = ({ route }: any) => {
    const [dataInicial] = useState<string>(route.params?.dataInicial)
    const [dataFinal] = useState<string>(route.params?.dataFinal)
    const navigation = useNavigation<propsStack>()
    const [nome, setNome] = useState<string>('')
    const RNFS = require('react-native-fs');

    useEffect(() => {
        // console.log(dataInicial, dataFinal)
    }, [dataInicial, dataFinal])

    const gerarArquivo = async () => {
        if (nome === '') {
            Alert.alert('Messagem', 'Digite um nome para o arquivo')
        } else {
            let nameSave = getName()
            var ok = true

            await RNFS.readDir(RNFS.ExternalStorageDirectoryPath + '/Download/')
                .then((result: any) => {
                    result.every((element: any) => {
                        if (element.name === nameSave) {
                            Alert.alert('Messagem', 'Já existe um arquivo com esse nome')
                            ok = false
                            return false
                        }
                        return true
                    });
                })
                .catch((err: any) => {
                    Alert.alert('Erro', err.message.toString())
                    console.log(err.message, err.code);
                });
            
            if (ok) {
                var path = RNFS.ExternalStorageDirectoryPath + '/Download/' + nameSave;

                RNFS.writeFile(path, await getStringToDate(), 'utf8')
                    .then((success: any) => {
                        Alert.alert('Messagem', 'Criado com sucesso: ' + nameSave)
                        console.log('Criado com sucesso: ' + nameSave)
                    })
                    .catch((err: any) => {
                        Alert.alert('Erro', err.message.toString())
                        console.log(err.message);
                    });
            }
        }
    }

    const deletarArquivo = () => {
        let nameSave = getName()
        var diretorio = RNFS.ExternalStorageDirectoryPath +  '/Download/' + nameSave

        RNFS.unlink(diretorio)
            .then(() => {
                Alert.alert('Messagem', 'Arquivo deletado: ' + nameSave)
                console.log('Arquivo deletado: ' + nameSave);
            })
            .catch((err: any) => {
                Alert.alert('Erro', err.message.toString())
                console.log(err.message);
            });
    }

    const getName = () => {
        let arrayOfStrings = nome.split('.')

        return arrayOfStrings[0] + '.txt'
    }

    const getStringToDate = async () => {
        var texto = ''
        
        await DadosEsp32.listToExport(dataInicial, dataFinal)
            .then((response: any) => {
                response?.forEach((element: any) => {
                    var linha = 
                    `${element.contador};` +
                    `${element.sateliteDataHora};` +
                    `${element.fe};` +
                    `${element.rssi};` +
                    `${element.tamanho};` +
                    `${element.latitudeEmissor};` +
                    `${element.longitudeEmissor};` +
                    `${element.latitudeReceptor};` +
                    `${element.longitudeReceptor};` +
                    `${element.dataHora}\n`

                    texto += linha
                });
            })
            .catch(err => {
                Alert.alert('Erro', err.message.toString())
                console.log(err)
            })
        
        return texto
    }

    return (
        <View style={{ marginRight: 8, marginLeft: 8 }}>
            <Text></Text>
            <InputName
                placeholder="Digite um nome (sem extenssão)"
                value={nome}
                onChangeText={(t:string) => setNome(t)}
            />
            <Text style={{ marginBottom: 10, textAlign: 'center' }}>Gerando arquivos (.txt) no diretório de download</Text>
            <ButtonTopMenu texto='Gerar Arquivo' tamanho='150px' onPress={() => { gerarArquivo() }} />
            <Text></Text>
            <ButtonTopMenu texto='Deletar Arquivo' tamanho='150px' onPress={() => { deletarArquivo() }} />
            <Text></Text>
            <ButtonTopMenu texto='Voltar' tamanho='100px' onPress={() => navigation.navigate('Pagination')} />
        </View>
    )
}

export default Export
