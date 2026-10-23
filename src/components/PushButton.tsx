import {Text, View, TouchableOpacity, StyleSheet, ImageSourcePropType, Image, Platform} from "react-native"

type PushButtonProps = {
    text?: string;
    image?: ImageSourcePropType;
    onPush?: (parametr: any) => (any | void);
    disabled?: boolean;
    backgroundColor?: string;
    unStyled?: boolean;
    imageWidth?: number;
}

export default function PushButton ({text, image, onPush, disabled, backgroundColor, unStyled, imageWidth} : PushButtonProps) {

    const styledButton = (unStyled || (image !== undefined)) ? styles.buttonUnstyled : styles.button
    
    return(
        <View>
            <TouchableOpacity disabled={disabled} style={[styledButton, { backgroundColor: backgroundColor }]} 
            onPress={onPush}>
                {image ? <Image source={image} style={[styles.image, { width: imageWidth || 24, height: imageWidth || 24 }]} /> : <Text style={styles.text}>{text}</Text>}
            </TouchableOpacity>
        </View>
    );
        
}


const styles=StyleSheet.create({
    text:{
        color: 'white',
        textAlign: 'center',
        fontSize: 14,
        fontFamily: 'Actay-Regular'
    },
    

    button: {
        alignSelf: 'flex-start',
        justifyContent: 'center',
        padding: 10, 
        backgroundColor: '#6B22F2',
        borderRadius: 10,
        width: 120,
        height: 'auto',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
            },
            android: {
                elevation: 4,
            },})
    },

    buttonUnstyled: {
        alignSelf: 'flex-start',
        justifyContent: 'center',
        borderRadius: 10,
        padding: 5
    },

    image:{
        resizeMode: 'contain'
    }
})