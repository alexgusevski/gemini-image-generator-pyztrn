
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { commonStyles, colors } from '../styles/commonStyles';
import TextInput from '../components/TextInput';
import Button from '../components/Button';
import ImageDisplay from '../components/ImageDisplay';
import LoadingSpinner from '../components/LoadingSpinner';
import Icon from '../components/Icon';

export default function ImageGeneratorScreen() {
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      Alert.alert('Error', 'Please enter a description for your image');
      return;
    }

    console.log('Starting image generation with prompt:', prompt);
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      // Simulate API call for now - this will be replaced with actual Gemini API call
      // when backend is connected
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // For now, we'll show a placeholder message
      setError('Backend integration needed. Please connect Supabase to enable image generation with Gemini API.');
      console.log('Image generation completed (simulated)');
    } catch (err) {
      console.error('Error generating image:', err);
      setError('Failed to generate image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    console.log('Retrying image generation');
    handleGenerateImage();
  };

  const clearAll = () => {
    console.log('Clearing all data');
    setPrompt('');
    setGeneratedImage(null);
    setError(null);
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView style={commonStyles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Icon name="sparkles" size={32} color={colors.primary} />
            <Text style={commonStyles.title}>Nano Banana</Text>
          </View>
          <Text style={[commonStyles.textSecondary, styles.subtitle]}>
            Generate stunning images with AI using Gemini
          </Text>
        </View>

        {/* Prompt Input */}
        <View style={commonStyles.section}>
          <TextInput
            label="Describe your image"
            placeholder="e.g., A futuristic city at sunset with flying cars..."
            value={prompt}
            onChangeText={setPrompt}
            multiline
            numberOfLines={4}
            maxLength={500}
          />
          
          <View style={styles.promptActions}>
            <Text style={[commonStyles.textSecondary, styles.characterCount]}>
              {prompt.length}/500
            </Text>
            {prompt.length > 0 && (
              <TouchableOpacity onPress={clearAll} style={styles.clearButton}>
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Generate Button */}
        <View style={commonStyles.section}>
          <Button
            text={isLoading ? 'Generating...' : 'Generate Image'}
            onPress={handleGenerateImage}
            style={[
              { opacity: isLoading || !prompt.trim() ? 0.6 : 1 },
              styles.generateButton
            ]}
            textStyle={{ color: '#FFFFFF' }}
          />
          {isLoading && (
            <View style={styles.loadingIndicator}>
              <LoadingSpinner size={20} color={colors.primary} />
            </View>
          )}
        </View>

        {/* Image Display */}
        <View style={commonStyles.section}>
          <Text style={[commonStyles.subtitle, styles.resultTitle]}>
            Generated Image
          </Text>
          <ImageDisplay
            imageUri={generatedImage}
            isLoading={isLoading}
            error={error}
            onRetry={handleRetry}
          />
        </View>

        {/* Features Info */}
        <View style={[commonStyles.section, styles.featuresSection]}>
          <Text style={[commonStyles.subtitle, styles.featuresTitle]}>
            What you can create:
          </Text>
          <View style={styles.featuresList}>
            <FeatureItem 
              icon="brush-outline" 
              title="Text-to-Image" 
              description="Generate images from descriptions"
            />
            <FeatureItem 
              icon="layers-outline" 
              title="Image Editing" 
              description="Modify existing images with text prompts"
            />
            <FeatureItem 
              icon="color-palette-outline" 
              title="Style Transfer" 
              description="Apply styles from reference images"
            />
            <FeatureItem 
              icon="text-outline" 
              title="Text Rendering" 
              description="Generate images with legible text"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FeatureItem({ icon, title, description }: { 
  icon: keyof typeof import('@expo/vector-icons').Ionicons.glyphMap; 
  title: string; 
  description: string; 
}) {
  return (
    <View style={styles.featureItem}>
      <Icon name={icon} size={24} color={colors.primary} />
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );
}

const styles = {
  header: {
    alignItems: 'center' as const,
    marginBottom: 32,
    paddingTop: 20,
  },
  headerContent: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center' as const,
    fontSize: 16,
  },
  promptActions: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginTop: 8,
  },
  characterCount: {
    fontSize: 12,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  clearButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  generateButton: {
    backgroundColor: colors.primary,
  },
  loadingIndicator: {
    alignItems: 'center' as const,
    marginTop: 12,
  },
  resultTitle: {
    marginBottom: 12,
  },
  featuresSection: {
    marginTop: 20,
    marginBottom: 40,
  },
  featuresTitle: {
    marginBottom: 16,
  },
  featuresList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    padding: 16,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featureContent: {
    flex: 1,
    marginLeft: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
};
