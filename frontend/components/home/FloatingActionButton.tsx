import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';

interface FloatingActionButtonProps {
  onPress: () => void;
}

export function FloatingActionButton({ onPress }: FloatingActionButtonProps) {
  return (
    <View style={styles.container}>
        <TouchableOpacity onPress={onPress} style={styles.button}>
            <IconSymbol name="plus" size={24} color="white" />
        </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        zIndex: 1000,
    },
    button: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#645273',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
}); 