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
`;

const CustomButtonText = styled.Text`
    font-size: 15px;
    color: #FFF;
`;

const ButtonTopMenu = ({ texto, tamanho, onPress }) => {
    return (
        <CustomButton tamanho={tamanho} onPress={onPress}>
            <CustomButtonText>
                {texto}
            </CustomButtonText>
        </CustomButton>
    );
}

export default ButtonTopMenu;