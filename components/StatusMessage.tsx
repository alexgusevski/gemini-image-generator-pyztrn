
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../styles/commonStyles';
import Icon from './Icon';

interface StatusMessageProps {
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  onDismiss?: () => void;
}

const StatusMessage: React.FC<StatusMessageProps> = ({ type, title, message, onDismiss }) => {
  const getIconName = () => {
    switch (type) {
      case 'info':
        return 'information-circle-outline';
      case 'warning':
        return 'warning-outline';
      case 'error':
        return 'alert-circle-outline';
      case 'success':
        return 'checkmark-circle-outline';
      default:
        return 'information-circle-outline';
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'info':
        return colors.primary + '20';
      case 'warning':
        return '#F59E0B20';
      case 'error':
        return '#EF444420';
      case 'success':
        return '#10B98120';
      default:
        return colors.backgroundAlt;
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'info':
        return colors.primary;
      case 'warning':
        return '#F59E0B';
      case 'error':
        return '#EF4444';
      case 'success':
        return '#10B981';
      default:
        return colors.text;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: getBackgroundColor() }]}>
      <Icon name={getIconName()} size={24} color={getIconColor()} />
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginVertical: 8,
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});

export default StatusMessage;
