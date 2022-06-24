import React from 'react';
import styled from 'styled-components/native';

const CustomButton = styled.TouchableOpacity`
    width: ${props => props.tamanho};
    height: 35px;
    background-color: #354C9C;
    border-radius: 10px;
    justify-content: center;
    align-items: center;
    margin: 1px;
    margin-top: ${props => props.top}px;
    margin-bottom: ${props => props.bottom}px;
`;

const CustomButtonText = styled.Text`
    font-size: 15px;
    color: #FFF;
`;

const ButtonTopMenu = ({ texto, tamanho, top = 1, bottom = 1, onPress }) => {
    return (
        <CustomButton tamanho={tamanho} onPress={onPress} top={top} bottom={bottom}>
            <CustomButtonText>
                {texto}
            </CustomButtonText>
        </CustomButton>
    );
}

export default ButtonTopMenu;