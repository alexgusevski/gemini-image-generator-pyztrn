
import { useState, useCallback } from 'react';
import { ImageService, GenerateImageParams, GenerateImageResult } from '../services/imageService';
import type { GeneratedImage } from '../integrations/supabase/types';

export interface UseImageGenerationReturn {
  isLoading: boolean;
  error: string | null;
  generatedImage: string | null;
  currentImageId: string | null;
  generateImage: (params: GenerateImageParams) => Promise<GenerateImageResult>;
  pollImageStatus: (imageId: string) => Promise<void>;
  clearImage: () => void;
  clearError: () => void;
  deleteImage: (imageId: string) => Promise<boolean>;
}

export function useImageGeneration(): UseImageGenerationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [currentImageId, setCurrentImageId] = useState<string | null>(null);

  const generateImage = useCallback(async (params: GenerateImageParams): Promise<GenerateImageResult> => {
    console.log('Starting image generation with params:', params);
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    setCurrentImageId(null);

    try {
      const result = await ImageService.generateImage(params);
      
      if (result.success && result.imageId) {
        setCurrentImageId(result.imageId);
        
        // Start polling for the image status
        await pollImageStatus(result.imageId);
        
        return result;
      } else {
        setError(result.error || 'Image generation failed');
        return result;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Error in generateImage:', err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const pollImageStatus = useCallback(async (imageId: string): Promise<void> => {
    console.log('Starting to poll image status for ID:', imageId);
    const maxAttempts = 30; // 30 attempts with 2-second intervals = 1 minute max
    let attempts = 0;

    const poll = async (): Promise<void> => {
      try {
        attempts++;
        console.log(`Polling attempt ${attempts}/${maxAttempts} for image ${imageId}`);
        
        const imageData = await ImageService.getImageStatus(imageId);
        
        if (!imageData) {
          throw new Error('Failed to fetch image status');
        }

        console.log('Image status:', imageData.status);

        switch (imageData.status) {
          case 'completed':
            if (imageData.image_url) {
              setGeneratedImage(imageData.image_url);
              console.log('Image generation completed successfully with URL:', imageData.image_url);
              return;
            } else {
              console.error('Image completed but no URL available:', imageData);
              throw new Error('Image completed but no URL available');
            }
            
          case 'failed':
            throw new Error(imageData.error_message || 'Image generation failed');
            
          case 'pending':
          case 'generating':
            if (attempts >= maxAttempts) {
              throw new Error('Image generation timed out');
            }
            // Continue polling
            setTimeout(poll, 2000);
            break;
            
          default:
            throw new Error(`Unknown image status: ${imageData.status}`);
        }
      } catch (err) {
        console.error('Error polling image status:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to check image status';
        setError(errorMessage);
        setIsLoading(false);
      }
    };

    await poll();
  }, []);

  const clearImage = useCallback(() => {
    console.log('Clearing image data');
    setGeneratedImage(null);
    setCurrentImageId(null);
    setError(null);
    setIsLoading(false);
  }, []);

  const clearError = useCallback(() => {
    console.log('Clearing error');
    setError(null);
  }, []);

  const deleteImage = useCallback(async (imageId: string): Promise<boolean> => {
    try {
      console.log('Deleting image:', imageId);
      const result = await ImageService.deleteImage(imageId);
      
      if (result.success) {
        // Clear the current image if it's the one being deleted
        if (currentImageId === imageId) {
          clearImage();
        }
        return true;
      } else {
        setError(result.error || 'Failed to delete image');
        return false;
      }
    } catch (err) {
      console.error('Error deleting image:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete image');
      return false;
    }
  }, [currentImageId, clearImage]);

  return {
    isLoading,
    error,
    generatedImage,
    currentImageId,
    generateImage,
    pollImageStatus,
    clearImage,
    clearError,
    deleteImage
  };
}
