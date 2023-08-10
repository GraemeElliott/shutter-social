import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { supabase } from '../supabase';
import { v4 as uuidv4 } from 'uuid';
import { useUserStore } from './users';
export const usePostStore = defineStore('post', (/* provide, options */) => {
  const userStore = useUserStore(); // Access the user store directly
  const posts = ref([]);
  const postContent = ref('');
  const previewImages = ref([]);
  const exceedsLimit = ref(false);
  const file = ref(null);
  const loading = ref(false);
  const errorMessage = ref('');
  const alertTimeout = ref(null);
  const dialog = ref(false);
  const maxFiles = ref(10);
  const fetchPosts = async () => {
    const { data: postsData } = await supabase
      .from('posts')
      .select()
      .order('created_at', { ascending: false });
    posts.value = postsData;
  };
  const addPost = async (post) => {
    const { data, error } = await supabase.from('posts').insert(post);
    if (error) {
      throw new Error(error.message);
    }
    location.reload();
  };

  const handleCancel = async () => {
    dialog.value = false;
    postContent.value = '';
    previewImages.value = [];
  };
  const handleUploadChange = async (event) => {
    const files = event.target.files;
    const fileCount = files.length;
    // Check if the number of selected files exceeds the limit
    if (previewImages.value.length + fileCount > maxFiles.value) {
      exceedsLimit.value = true;
      // Clear the previous timeout (if any)
      clearTimeout(alertTimeout.value);
      // Set a new timeout to hide the alert after 5 seconds
      alertTimeout.value = setTimeout(() => {
        exceedsLimit.value = false;
      }, 3000);
      return;
    }
    // Perform operations for each file
    for (let i = 0; i < fileCount; i++) {
      file.value = files[i];
      // Read the file as a data URL
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        // Add the data URL to the preview images array
        previewImages.value.push(dataUrl);
      };
      reader.readAsDataURL(file.value);
    }
  };
  const removeImage = async (index) => {
    previewImages.value.splice(index, 1);
  };
  const submit = async (router) => {
    loading.value = true;
    const imageUrls = [];
    for (const image of previewImages.value) {
      const fileName = uuidv4();
      const fileData = image.split(',')[1];
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
      const blob = new Blob(byteArrays, { type: 'image/jpeg' });
      const { data, error } = await supabase.storage
        .from('images')
        .upload(`public/${fileName}.jpg`, blob);
      if (error) {
        loading.value = false;
        errorMessage.value = 'Unable to upload image';
        return;
      }
      imageUrls.push(data.path);
    }
    const newPost = await supabase.from('posts').insert({
      image_urls: imageUrls,
      post_content: postContent.value,
      profile_id: userStore.user.id,
    });
    if (newPost.error) {
      loading.value = false;
      errorMessage.value = 'Unable to create post';
      return;
    }
    await addPost(newPost.data);
    await fetchPosts();
    loading.value = false;
    handleCancel();
  };
  const likesCount = ref({});
  const likePost = async (postId) => {
    await supabase.from('liked_posts').insert({
      liked_by_id: userStore.user.id,
      liked_post_id: postId,
    });
    likesCount.value[postId]++;
  };
  const unlikePost = async (postId) => {
    await supabase
      .from('liked_posts')
      .delete()
      .eq('liked_by_id', userStore.user.id)
      .eq('liked_post_id', postId);
    likesCount.value[postId]--;
  };
  const countLikes = async (postId) => {
    const { count } = await supabase
      .from('liked_posts')
      .select('*', { count: 'exact' })
      .eq('liked_post_id', postId);
    likesCount.value[postId] = count;
  };
  const formattedLikesCount = computed(() => {
    return (postId) => {
      const count = likesCount.value[postId];
      if (count === 0) {
        return 'Be the first to like this post';
      } else if (count === 1) {
        return '1 like';
      } else {
        return `${count} likes`;
      }
    };
  });
  const savePost = async (postId) => {
    await supabase.from('saved_posts').insert({
      saved_by_id: userStore.user.id,
      saved_post_id: postId,
    });
  };
  const unsavePost = async (postId) => {
    await supabase
      .from('saved_posts')
      .delete()
      .eq('saved_by_id', userStore.user.id)
      .eq('saved_post_id', postId);
  };
  return {
    fetchPosts,
    addPost,
    handleCancel,
    handleUploadChange,
    removeImage,
    submit,
    likePost,
    unlikePost,
    countLikes,
    savePost,
    unsavePost,
    likesCount,
    formattedLikesCount,
    posts,
    postContent,
    previewImages,
    exceedsLimit,
    file,
    loading,
    errorMessage,
    alertTimeout,
    dialog,
    maxFiles,
  };
});
