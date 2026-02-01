import { supabase } from './supabaseClient';

/**
 * Uploads a workout image to Supabase Storage
 * @param imageUrl - URL of the image to upload
 * @param workoutName - Name of the workout for the file name
 * @returns URL to the uploaded image or null if failed
 */
export const imageService = {
  async uploadWorkoutImage(
    imageUrl: string,
    workoutName: string,
    userId: string
  ): Promise<string | null> {
    try {
      // Create a unique filename
      const timestamp = new Date().getTime();
      const sanitizedName = workoutName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 30);
      const filename = `${userId}/${sanitizedName}-${timestamp}.jpg`;

      // Fetch the image from the URL
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch image from URL');
      }

      const blob = await response.blob();

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('workout-images')
        .upload(filename, blob, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (error) {
        console.error('Error uploading image to Supabase:', error);
        return null;
      }

      if (!data) {
        return null;
      }

      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('workout-images')
        .getPublicUrl(filename);

      return publicUrlData.publicUrl;
    } catch (error) {
      console.error('Error in uploadWorkoutImage:', error);
      return null;
    }
  },

  /**
   * Deletes a workout image from Supabase Storage
   */
  async deleteWorkoutImage(imageUrl: string): Promise<boolean> {
    try {
      // Extract the filename from the URL
      const urlParts = imageUrl.split('/');
      const filename = urlParts.slice(-2).join('/'); // Get the last two parts (userId/filename)

      const { error } = await supabase.storage
        .from('workout-images')
        .remove([filename]);

      if (error) {
        console.error('Error deleting image from Supabase:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteWorkoutImage:', error);
      return false;
    }
  },
};
