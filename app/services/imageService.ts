
import { supabase } from '../integrations/supabase/client';
import type { GeneratedImageInsert } from '../integrations/supabase/types';

export interface GenerateImageParams {
  prompt: string;
  userId?: string;
}

export interface GenerateImageResult {
  success: boolean;
  imageId?: string;
  imageUrl?: string;
  error?: string;
}

export class ImageService {
  static async generateImage(params: GenerateImageParams): Promise<GenerateImageResult> {
    try {
      console.log('Starting image generation process...');
      
      // First, create a record in the database
      const imageRecord: GeneratedImageInsert = {
        prompt: params.prompt,
        user_id: params.userId || null,
        status: 'pending'
      };

      const { data: insertedImage, error: insertError } = await supabase
        .from('generated_images')
        .insert(imageRecord)
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting image record:', insertError);
        throw new Error(`Failed to create image record: ${insertError.message}`);
      }

      console.log('Image record created with ID:', insertedImage.id);

      // Get the current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      // Call the Edge Function to generate the image
      console.log('Calling Edge Function with imageId:', insertedImage.id);
      const { data: functionResult, error: functionError } = await supabase.functions.invoke(
        'generate-image',
        {
          body: {
            prompt: params.prompt,
            imageId: insertedImage.id
          },
          headers: {
            Authorization: `Bearer ${session?.access_token || supabase.supabaseKey}`,
          }
        }
      );

      console.log('Edge Function response:', { functionResult, functionError });

      if (functionError) {
        console.error('Edge function error:', functionError);
        
        // Update the database record to reflect the error
        await supabase
          .from('generated_images')
          .update({ 
            status: 'failed',
            error_message: functionError.message,
            updated_at: new Date().toISOString()
          })
          .eq('id', insertedImage.id);
        
        throw new Error(`Image generation failed: ${functionError.message}`);
      }

      if (!functionResult.success) {
        // Update the database record to reflect the error
        await supabase
          .from('generated_images')
          .update({ 
            status: 'failed',
            error_message: functionResult.error,
            updated_at: new Date().toISOString()
          })
          .eq('id', insertedImage.id);
        
        throw new Error(functionResult.error || 'Image generation failed');
      }

      console.log('Image generation completed successfully');

      return {
        success: true,
        imageId: insertedImage.id,
        imageUrl: functionResult.imageUrl
      };

    } catch (error) {
      console.error('Error in generateImage:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  static async getImageStatus(imageId: string) {
    try {
      const { data, error } = await supabase
        .from('generated_images')
        .select('*')
        .eq('id', imageId)
        .single();

      if (error) {
        console.error('Error fetching image status:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getImageStatus:', error);
      return null;
    }
  }

  static async getUserImages(userId?: string) {
    try {
      let query = supabase
        .from('generated_images')
        .select('*')
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      } else {
        query = query.is('user_id', null);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching user images:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserImages:', error);
      return [];
    }
  }

  static async deleteImage(imageId: string) {
    try {
      // First get the image record to get the storage path
      const { data: imageRecord, error: fetchError } = await supabase
        .from('generated_images')
        .select('storage_path')
        .eq('id', imageId)
        .single();

      if (fetchError) {
        console.error('Error fetching image record:', fetchError);
        throw new Error(`Failed to fetch image record: ${fetchError.message}`);
      }

      // Delete from storage if storage path exists
      if (imageRecord.storage_path) {
        const { error: storageError } = await supabase.storage
          .from('generated-images')
          .remove([imageRecord.storage_path]);

        if (storageError) {
          console.error('Error deleting from storage:', storageError);
          // Continue with database deletion even if storage deletion fails
        }
      }

      // Delete from database
      const { error: deleteError } = await supabase
        .from('generated_images')
        .delete()
        .eq('id', imageId);

      if (deleteError) {
        console.error('Error deleting image record:', deleteError);
        throw new Error(`Failed to delete image record: ${deleteError.message}`);
      }

      console.log('Image deleted successfully');
      return { success: true };

    } catch (error) {
      console.error('Error in deleteImage:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}
