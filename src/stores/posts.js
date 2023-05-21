import { defineStore } from 'pinia';
import { supabase } from '../supabase';

export const usePostStore = defineStore('post', {
  state: () => ({
    posts: [],
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
  },
});
