import React from 'react';
import { View, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { ThemedText } from '../ThemedText';
import { FontAwesome } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';

interface FormFieldProps extends TextInputProps {
  label: string;
  icon: keyof typeof FontAwesome.glyphMap;
}

const FormField: React.FC<FormFieldProps> = ({ label, icon, ...props }) => {
  const backgroundColor = useThemeColor({}, 'inputBackground');
  const textColor = useThemeColor({}, 'text');
  const placeholderColor = useThemeColor({}, 'placeholder');
  const iconColor = useThemeColor({}, 'icon');

  return (
    <View style={styles.container}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <View style={[styles.inputContainer, { backgroundColor }]}>
        <FontAwesome name={icon} size={20} color={iconColor} style={styles.icon} />
        <TextInput
          style={[styles.input, { color: textColor }]}
          placeholderTextColor={placeholderColor}
          {...props}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
});

export default FormField; 