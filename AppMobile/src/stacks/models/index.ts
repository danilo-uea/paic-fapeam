import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export type propsNavigationStack = {
    Main?: { }
    Pagination?: { }
    Details?: {
        id: number
    }
    Export?: {
        dataInicial: string,
        dataFinal: string
    }
    FixPosition?: { }
}

export type propsStack = NativeStackNavigationProp<propsNavigationStack>