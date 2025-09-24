
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  RefreshControl,
  StyleSheet
} from 'react-native';
import { ImageService } from '../app/services/imageService';
import { supabase } from '../app/integrations/supabase/client';
import type { GeneratedImage } from '../app/integrations/supabase/types';
import { colors, commonStyles } from '../styles/commonStyles';
import Icon from './Icon';
import LoadingSpinner from './LoadingSpinner';

interface ImageHistoryProps {
  onImageSelect?: (imageUrl: string) => void;
}

export default function ImageHistory({ onImageSelect }: ImageHistoryProps) {
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    loadImages();
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    } catch (error) {
      console.error('Error getting current user:', error);
    }
  };

  const loadImages = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      const userImages = await ImageService.getUserImages(user?.id);
      setImages(userImages);
    } catch (error) {
      console.error('Error loading images:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadImages();
    setIsRefreshing(false);
  };

  const handleDeleteImage = async (imageId: string, prompt: string) => {
    Alert.alert(
      'Delete Image',
      `Are you sure you want to delete the image for "${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await ImageService.deleteImage(imageId);
            if (result.success) {
              setImages(prev => prev.filter(img => img.id !== imageId));
            } else {
              Alert.alert('Error', result.error || 'Failed to delete image');
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return colors.success || '#10B981';
      case 'failed': return colors.error || '#EF4444';
      case 'generating': return colors.warning || '#F59E0B';
      case 'pending': return colors.textSecondary;
      default: return colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'failed': return 'Failed';
      case 'generating': return 'Generating...';
      case 'pending': return 'Pending';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size={32} color={colors.primary} />
        <Text style={[commonStyles.textSecondary, styles.loadingText]}>
          Loading your images...
        </Text>
      </View>
    );
  }

  if (images.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="images-outline" size={48} color={colors.textSecondary} />
        <Text style={[commonStyles.subtitle, styles.emptyTitle]}>
          No images yet
        </Text>
        <Text style={[commonStyles.textSecondary, styles.emptyDescription]}>
          Generate your first image to see it here
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      <Text style={[commonStyles.subtitle, styles.title]}>
        Your Generated Images ({images.length})
      </Text>
      
      <View style={styles.imageGrid}>
        {images.map((image) => (
          <View key={image.id} style={styles.imageCard}>
            <TouchableOpacity
              style={styles.imageContainer}
              onPress={() => {
                if (image.image_url && onImageSelect) {
                  onImageSelect(image.image_url);
                }
              }}
              disabled={!image.image_url}
            >
              {image.image_url ? (
                <Image source={{ uri: image.image_url }} style={styles.image} />
              ) : (
                <View style={styles.placeholderImage}>
                  <Icon 
                    name={image.status === 'generating' ? 'hourglass-outline' : 'image-outline'} 
                    size={32} 
                    color={colors.textSecondary} 
                  />
                </View>
              )}
              
              <View style={styles.statusBadge}>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(image.status) }]} />
                <Text style={[styles.statusText, { color: getStatusColor(image.status) }]}>
                  {getStatusText(image.status)}
                </Text>
              </View>
            </TouchableOpacity>
            
            <View style={styles.imageInfo}>
              <Text style={styles.promptText} numberOfLines={2}>
                {image.prompt}
              </Text>
              <Text style={styles.dateText}>
                {formatDate(image.created_at)}
              </Text>
              
              {image.error_message && (
                <Text style={styles.errorText} numberOfLines={2}>
                  Error: {image.error_message}
                </Text>
              )}
            </View>
            
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteImage(image.id, image.prompt)}
            >
              <Icon name="trash-outline" size={20} color={colors.error || '#EF4444'} />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    textAlign: 'center',
    lineHeight: 20,
  },
  title: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  imageGrid: {
    padding: 16,
    gap: 16,
  },
  imageCard: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: 200,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  imageInfo: {
    padding: 12,
  },
  promptText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 18,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  errorText: {
    fontSize: 12,
    color: colors.error || '#EF4444',
    lineHeight: 16,
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
    borderRadius: 20,
  },
});
