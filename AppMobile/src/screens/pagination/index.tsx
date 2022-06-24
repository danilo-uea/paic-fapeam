import React, { useState, useEffect } from 'react';
import { Alert, Platform, ScrollView, Text, View } from 'react-native';
import DateTimeInput from '../../components/DateTimeInput';
import { ViewHorizontal } from './styles';
import DateTimePicker from '@react-native-community/datetimepicker';
import DadosBluetooth from '../../services/sqlite/DadosBluetooth';
import ButtonTopMenu from '../../components/ButtonTopMenu';
import { useNavigation } from '@react-navigation/native';
import { propsStack } from '../../stacks/models';

const Pagination = () => {
    const [ listagem, setListagem ] = useState<any>([]);

    const [dateStart, setDateStart] = useState(new Date());
    const [dataInicialBr, setDataInicialBr] = useState<string>('');
    const [horaInicialBr, setHoraInicialBr] = useState<string>('');

    const [dateEnd, setDateEnd] = useState(new Date());
    const [dataFinalBr, setDataFinalBr] = useState<string>('');
    const [horaFinalBr, setHoraFinalBr] = useState<string>('');

    const [modeInicial, setModeInicial] = useState<any>('date');
    const [modeFinal, setModeFinal] = useState<any>('date');
    const [showInicial, setShowInicial] = useState(false);
    const [showFinal, setShowFinal] = useState(false);

    const navigation = useNavigation<propsStack>();

    useEffect(() => {
        onChangeInicial('', dateStart);
        onChangeFinal('', dateEnd);
    }, [dateStart, dateEnd]);

    const onChangeInicial = (event: any, selectedDate: any) => {
        const currentDate = selectedDate || dateStart;
        setShowInicial(Platform.OS === 'ios')
        setDateStart(currentDate);

        let tempDate = new Date(currentDate);
        let fDate = DadosBluetooth.zeroEsquerda(tempDate.getDate()) + '/' + DadosBluetooth.zeroEsquerda(tempDate.getMonth() + 1) + '/' + tempDate.getFullYear();
        let fTime = DadosBluetooth.zeroEsquerda(tempDate.getHours()) + ':' + DadosBluetooth.zeroEsquerda(tempDate.getMinutes());

        setDataInicialBr(fDate);
        setHoraInicialBr(fTime);
    }

    const onChangeFinal = (event: any, selectedDate: any) => {
        const currentDate = selectedDate || dateEnd;
        setShowFinal(Platform.OS === 'ios')
        setDateEnd(currentDate);

        let tempDate = new Date(currentDate);
        let fDate = DadosBluetooth.zeroEsquerda(tempDate.getDate()) + '/' + DadosBluetooth.zeroEsquerda(tempDate.getMonth() + 1) + '/' + tempDate.getFullYear();
        let fTime = DadosBluetooth.zeroEsquerda(tempDate.getHours()) + ':' + DadosBluetooth.zeroEsquerda(tempDate.getMinutes());

        setDataFinalBr(fDate);
        setHoraFinalBr(fTime);
    }

    const showModeInicial = (currentMode: string) => {
        setShowInicial(true);
        setModeInicial(currentMode);
    }

    const showModeFinal = (currentMode: string) => {
        setShowFinal(true);
        setModeFinal(currentMode);
    }

    const listDataHora = (DataInicial:Date, DataFinal:Date) => {
        let dataInicial = DadosBluetooth.formatoDataFiltro(DataInicial);
        let dataFinal = DadosBluetooth.formatoDataFiltro(DataFinal);

        DadosBluetooth.allDateTime(dataInicial, dataFinal)
            .then((response: any) => {
                // response?.forEach((element: any) => {
                //     console.log(element)
                // });
                // console.log('Qtd: ' + response?.length)
                setListagem(response)
            })
            .catch(err => {
                Alert.alert('Erro', err.message.toString())
                console.log(err)
            })
    }

    const removerDataHora = (DataInicial:Date, DataFinal:Date) => {
        Alert.alert('Perigo!', 'Deseja excluir todos os registros?', [
            {
                text: 'Sim', onPress: () => {
                    let dataInicial = DadosBluetooth.formatoDataFiltro(DataInicial);
                    let dataFinal = DadosBluetooth.formatoDataFiltro(DataFinal);

                    DadosBluetooth.removeDateTime(dataInicial, dataFinal)
                        .then((response: any) => {
                            Alert.alert('Messagem', response.toString())
                            console.log(response)
                        })
                        .catch(err => {
                            Alert.alert('Erro', err.message.toString())
                            console.log(err)
                        })
                }
            },
            { text: 'Não', onPress: () => console.log('Não deseja excluir todos os registros') }
        ]);
    }

    const exportar = (DataInicial:Date, DataFinal:Date) => {
        let dataInicial = DadosBluetooth.formatoDataFiltro(DataInicial);
        let dataFinal = DadosBluetooth.formatoDataFiltro(DataFinal);

        navigation.navigate('Export', { dataInicial: dataInicial, dataFinal: dataFinal })
    }

    return (
        <View style={{ marginRight: 8, marginLeft: 8 }}>
            <ViewHorizontal>
                <View style={{ marginRight: 10 }}>
                    <Text>Inicial</Text>
                    <ViewHorizontal>
                        <DateTimeInput
                            texto={dataInicialBr}
                            tamanho="110px"
                            onPress={() => { showModeInicial('date') }}
                        />
                        <DateTimeInput
                            texto={horaInicialBr}
                            tamanho="60px"
                            onPress={() => { showModeInicial('time') }}
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
                <ButtonTopMenu texto='Listar' tamanho='100px' onPress={() => listDataHora(dateStart, dateEnd)} />
                <ButtonTopMenu texto='Exportar' tamanho='100px' onPress={() => exportar(dateStart, dateEnd)} />
                <ButtonTopMenu texto='Excluir' tamanho='100px' onPress={() => removerDataHora(dateStart, dateEnd)} />
            </ViewHorizontal>
            <ViewHorizontal>
                <Text style={{ paddingBottom: 5 }} >{ `Quantidade: ${listagem?.length}` }</Text>
            </ViewHorizontal>
            <ScrollView>
                {
                    listagem.map((element:any) => {
                        return(
                            <Text 
                                style={{
                                    borderBottomColor: '#D8D3D3',
                                    borderBottomWidth: 1,
                                    paddingTop: 5,
                                    paddingBottom: 5
                                }} 
                                key={element.id}
                                onPress={() => navigation.navigate('Details', { id: element.id })}
                            >
                                {element.contador} {element.fe} {element.dataHora}
                            </Text>
                        )
                    })
                }
                <View style={{ marginTop: 170 }} />
            </ScrollView>
            {showInicial && (
                <DateTimePicker
                    testID='dateTimePicker'
                    value={dateStart}
                    mode={modeInicial}
                    is24Hour={true}
                    display='default'
                    onChange={onChangeInicial}
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
        </View>
    );
};

export default Pagination;
