import React, { useState, useEffect } from 'react';
import { Platform, Text, View } from 'react-native';
import DateTimeInput from '../../components/DateTimeInput';
import { CustomButton, CustomButtonText, ViewHorizontal } from './styles';
import DateTimePicker from '@react-native-community/datetimepicker';

const Pagination = ({ route }: any) => {
    // console.log(route.params?.name + ': ' + route.params?.id)

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

    useEffect(() => {
        onChangeInicial('', dateStart);
        onChangeFinal('', dateEnd);
    }, [dateStart, dateEnd]);

    const onChangeInicial = (event: any, selectedDate: any) => {
        const currentDate = selectedDate || dateStart;
        setShowInicial(Platform.OS === 'ios')
        setDateStart(currentDate);

        let tempDate = new Date(currentDate);
        let fDate = zeroEsquerda(tempDate.getDate()) + '/' + zeroEsquerda(tempDate.getMonth() + 1) + '/' + tempDate.getFullYear();
        let fTime = zeroEsquerda(tempDate.getHours()) + ':' + zeroEsquerda(tempDate.getMinutes());

        setDataInicialBr(fDate);
        setHoraInicialBr(fTime);
    }

    const onChangeFinal = (event: any, selectedDate: any) => {
        const currentDate = selectedDate || dateEnd;
        setShowFinal(Platform.OS === 'ios')
        setDateEnd(currentDate);

        let tempDate = new Date(currentDate);
        let fDate = zeroEsquerda(tempDate.getDate()) + '/' + zeroEsquerda(tempDate.getMonth() + 1) + '/' + tempDate.getFullYear();
        let fTime = zeroEsquerda(tempDate.getHours()) + ':' + zeroEsquerda(tempDate.getMinutes());

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

    const zeroEsquerda = (valor: number) => {
        let retorno: string = valor >= 0 && valor < 10 ? '0' + valor : valor.toString();
        return retorno;
    }

    return (
        <View>
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
                <CustomButton onPress={() => console.log('Exportar')}>
                    <CustomButtonText>
                        Exportar
                    </CustomButtonText>
                </CustomButton>
                <CustomButton onPress={() => console.log('Excluir')}>
                    <CustomButtonText>
                        Excluir
                    </CustomButtonText>
                </CustomButton>
            </ViewHorizontal>
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
