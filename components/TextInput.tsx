
import React from 'react';
import { TextInput as RNTextInput, StyleSheet, View, Text, TextInputProps } from 'react-native';
import { colors, commonStyles } from '../styles/commonStyles';

interface CustomTextInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: any;
}

export default function TextInput({ 
  label, 
  error, 
  containerStyle, 
  style, 
  ...props 
}: CustomTextInputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}
      <RNTextInput
        style={[
          commonStyles.input,
          props.multiline && commonStyles.inputMultiline,
          error && styles.inputError,
          style
        ]}
        placeholderTextColor={colors.textSecondary}
        {...props}
      />
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
  },
});
