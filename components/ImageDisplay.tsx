
import React from 'react';
import { View, Image, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors, commonStyles } from '../styles/commonStyles';
import Icon from './Icon';

interface ImageDisplayProps {
  imageUri?: string;
  isLoading?: boolean;
  onRetry?: () => void;
  error?: string;
}

export default function ImageDisplay({ imageUri, isLoading, onRetry, error }: ImageDisplayProps) {
  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <View style={styles.loadingContent}>
          <Icon name="image-outline" size={48} color={colors.textSecondary} />
          <Text style={[commonStyles.text, styles.loadingText]}>
            Generating your image...
          </Text>
          <Text style={[commonStyles.textSecondary, styles.loadingSubtext]}>
            This may take a few moments
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Icon name="alert-circle-outline" size={48} color={colors.error} />
        <Text style={[commonStyles.text, styles.errorText]}>
          Failed to generate image
        </Text>
        <Text style={[commonStyles.textSecondary, styles.errorSubtext]}>
          {error}
        </Text>
        {onRetry && (
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (imageUri) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />
      </View>
    );
  }

  return (
    <View style={[styles.container, styles.placeholderContainer]}>
      <Icon name="image-outline" size={64} color={colors.textSecondary} />
      <Text style={[commonStyles.textSecondary, styles.placeholderText]}>
        Your generated image will appear here
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 300,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  placeholderText: {
    marginTop: 12,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  loadingSubtext: {
    marginTop: 4,
    textAlign: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    textAlign: 'center',
    fontWeight: '600',
    color: colors.error,
  },
  errorSubtext: {
    marginTop: 4,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
