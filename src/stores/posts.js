import { defineStore } from 'pinia';
import { supabase } from '../supabase';
import { v4 as uuidv4 } from 'uuid';

export const usePostStore = defineStore('post', {
  state: () => ({
    posts: [],
    postContent: '',
    previewImages: [],
    exceedsLimit: false,
    file: null,
    loading: false,
    errorMessage: '',
    dialog: false,
    maxFiles: 10,
  }),
  actions: {
    async fetchPosts() {
      const { data: postsData } = await supabase
        .from('posts')
        .select()
        .order('created_at', { ascending: false }); // Sort the posts in descending order based on the 'created_at' column

      this.posts = postsData;
    },

    async addPost(post) {
      await supabase.from('posts').insert(post);

      // Fetch posts again to update the state
      await this.fetchPosts();
    },

    async handleCancel() {
      this.dialog = false;
      this.postContent = '';
      this.previewImages = [];
    },

    async handleUploadChange(event) {
      const files = event.target.files;
      const fileCount = files.length;
      // Clear existing preview images and reset exceedsLimit flag
      this.previewImages = [];
      this.exceedsLimit = false;
      // Check if the number of selected files exceeds the limit
      if (fileCount > this.maxFiles) {
        this.exceedsLimit = true;
        return;
      }
      // Perform operations for each file
      for (let i = 0; i < fileCount; i++) {
        this.file = files[i];
        // Read the file as a data URL
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target.result;
          // Add the data URL to the preview images array
          this.previewImages.push(dataUrl);
        };
        reader.readAsDataURL(this.file);
      }
    },

    async removeImage(index) {
      this.previewImages.splice(index, 1);
    },

    async submit() {
      this.loading = true;

      const imageUrls = []; // Array to store image URLs

      for (const image of this.previewImages) {
        const fileName = uuidv4();
        const fileData = image.split(',')[1]; // Extract the base64-encoded file data

        // Convert the base64-encoded file data to a Blob object
        const byteCharacters = atob(fileData);
        const byteArrays = [];
        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
          const slice = byteCharacters.slice(offset, offset + 512);
          const byteNumbers = new Array(slice.length);
          for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          byteArrays.push(byteArray);
        }
        const blob = new Blob(byteArrays, { type: 'image/jpeg' }); // Modify the type if necessary

        // Upload the image to the storage
        const { data, error } = await supabase.storage
          .from('images')
          .upload(`public/${fileName}.jpg`, blob); // Modify the file extension if necessary

        if (error) {
          this.loading = false;
          this.errorMessage = 'Unable to upload image';
          return;
        }

        imageUrls.push(data.path); // Store the image URL
      }

      // Insert the post details and image URLs into the "posts" table
      const newPost = await supabase.from('posts').insert({
        image_urls: imageUrls,
        post_content: this.postContent,
        profile_id: user.value.id,
      });

      if (newPost.error) {
        this.loading = false;
        this.errorMessage = 'Unable to create post';
        return;
      }

      await this.addPost(newPost.data);

      this.loading = false;
      this.handleCancel();
      await this.fetchPosts();
      const username = user.value.username;
      router.push(`/profile/${username}`);
    },
  },
});
