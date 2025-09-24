
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

export const colors = {
  primary: '#6366F1',
  secondary: '#8B5CF6',
  accent: '#06B6D4',
  background: '#FFFFFF',
  backgroundAlt: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#1F2937',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
};

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  } as ViewStyle,
  
  content: {
    flex: 1,
    paddingHorizontal: 16,
  } as ViewStyle,
  
  section: {
    marginBottom: 24,
  } as ViewStyle,
  
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginLeft: 12,
  } as TextStyle,
  
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  } as TextStyle,
  
  text: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  } as TextStyle,
  
  textSecondary: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  } as TextStyle,
  
  textSmall: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  } as TextStyle,
  
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  } as ViewStyle,
  
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  } as TextStyle,
  
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.background,
  } as ViewStyle,
  
  inputFocused: {
    borderColor: colors.primary,
  } as ViewStyle,
  
  inputError: {
    borderColor: colors.error,
  } as ViewStyle,
  
  errorText: {
    color: colors.error,
    fontSize: 14,
    marginTop: 4,
  } as TextStyle,
  
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  
  spaceBetween: {
    justifyContent: 'space-between',
  } as ViewStyle,
  
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  } as ViewStyle,
});
