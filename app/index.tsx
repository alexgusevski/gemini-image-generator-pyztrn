
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { commonStyles, colors } from '../styles/commonStyles';
import { supabase } from './integrations/supabase/client';
import { useImageGeneration } from './hooks/useImageGeneration';
import TextInput from '../components/TextInput';
import Button from '../components/Button';
import ImageDisplay from '../components/ImageDisplay';
import ImageHistory from '../components/ImageHistory';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusMessage from '../components/StatusMessage';
import Icon from '../components/Icon';

export default function ImageGeneratorScreen() {
  const [prompt, setPrompt] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [user, setUser] = useState<any>(null);

  
  const {
    isLoading,
    error,
    generatedImage,
    currentImageId,
    status,
    generateImage,
    clearImage,
    clearError,
    deleteImage
  } = useImageGeneration();

  useEffect(() => {
    // Get initial user session
    getCurrentUser();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setUser(session?.user || null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const getCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    } catch (error) {
      console.error('Error getting current user:', error);
    }
  };

  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      Alert.alert('Error', 'Please enter a description for your image');
      return;
    }

    console.log('Starting image generation with prompt:', prompt);
    
    try {
      const result = await generateImage({
        prompt: prompt.trim(),
        userId: user?.id
      });

      if (!result.success) {
        Alert.alert('Error', result.error || 'Failed to generate image');
      }
    } catch (error) {
      console.error('Error in handleGenerateImage:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  const handleRetry = () => {
    console.log('Retrying image generation');
    handleGenerateImage();
  };

  const handleClearAll = () => {
    console.log('Clearing all data');
    setPrompt('');
    clearImage();
  };

  const handleDeleteCurrentImage = async () => {
    if (!currentImageId) return;
    
    Alert.alert(
      'Delete Image',
      'Are you sure you want to delete this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteImage(currentImageId);
            if (success) {
              handleClearAll();
            }
          }
        }
      ]
    );
  };

  const handleImageSelect = (imageUrl: string) => {
    // When an image is selected from history, show it in the main display
    setShowHistory(false);
    // Note: We're not setting this as the current generated image since it's from history
    // You might want to add a separate state for viewing historical images
  };

  if (showHistory) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={styles.historyHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setShowHistory(false)}
          >
            <Icon name="arrow-back" size={24} color={colors.text} />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        </View>
        <ImageHistory onImageSelect={handleImageSelect} />
      </SafeAreaView>
    );
  }

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
          
          {/* User Status */}
          <View style={styles.userStatus}>
            {user ? (
              <Text style={styles.userText}>
                Signed in as {user.email}
              </Text>
            ) : (
              <Text style={styles.userText}>
                Using anonymous mode
              </Text>
            )}
            <TouchableOpacity
              style={styles.historyButton}
              onPress={() => setShowHistory(true)}
            >
              <Icon name="time-outline" size={20} color={colors.primary} />
              <Text style={styles.historyButtonText}>History</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Status Message - Only show if there's an error or important info */}
        {error && (
          <View style={commonStyles.section}>
            <StatusMessage
              type="error"
              title="Generation Failed"
              message={error}
              onDismiss={clearError}
            />
          </View>
        )}

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
              <TouchableOpacity onPress={handleClearAll} style={styles.clearButton}>
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
            disabled={isLoading || !prompt.trim()}
          />
          {isLoading && (
            <View style={styles.loadingIndicator}>
              <LoadingSpinner size={20} color={colors.primary} />
              <Text style={[commonStyles.textSecondary, styles.loadingText]}>
                {status === 'generating' ? 'Generating image...' : 'Starting generation...'}
              </Text>
              <Text style={[commonStyles.textSecondary, styles.loadingSubtext]}>
                This may take up to 30 seconds
              </Text>
            </View>
          )}
        </View>

        {/* Image Display */}
        <View style={commonStyles.section}>
          <View style={styles.resultHeader}>
            <Text style={[commonStyles.subtitle, styles.resultTitle]}>
              Generated Image
            </Text>
            {generatedImage && currentImageId && (
              <TouchableOpacity
                style={styles.deleteImageButton}
                onPress={handleDeleteCurrentImage}
              >
                <Icon name="trash-outline" size={20} color={colors.error || '#EF4444'} />
              </TouchableOpacity>
            )}
          </View>
          
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

        {/* Integration Notice */}
        <View style={[commonStyles.section, styles.integrationNotice]}>
          <Icon name="information-circle-outline" size={24} color={colors.primary} />
          <View style={styles.noticeContent}>
            <Text style={styles.noticeTitle}>Powered by Supabase & Gemini</Text>
            <Text style={styles.noticeDescription}>
              Your images are securely stored and processed using Supabase backend with Google's Gemini AI.
            </Text>
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
    marginBottom: 16,
  },
  userStatus: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    width: '100%',
    paddingHorizontal: 16,
  },
  userText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  historyButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  historyButtonText: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 4,
    fontWeight: '600' as const,
  },
  historyHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  backButtonText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 8,
    fontWeight: '600' as const,
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
  loadingText: {
    marginTop: 8,
    textAlign: 'center' as const,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  loadingSubtext: {
    marginTop: 4,
    textAlign: 'center' as const,
    fontSize: 12,
    opacity: 0.7,
  },
  resultHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
  },
  resultTitle: {
    marginBottom: 0,
  },
  deleteImageButton: {
    padding: 8,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featuresSection: {
    marginTop: 20,
    marginBottom: 20,
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
  integrationNotice: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    padding: 16,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 40,
  },
  noticeContent: {
    flex: 1,
    marginLeft: 12,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 4,
  },
  noticeDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
};
