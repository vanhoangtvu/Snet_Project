'use client';

import { useEffect, useState } from 'react';
import { apiService } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export default function DebugPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const postsData = await apiService.getPosts(0, 5);
      setPosts(postsData.content || []);
      
      const friendsData = await apiService.getFriendsList();
      setFriends(friendsData || []);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const testLike = async (postId: number) => {
    try {
      const result = await apiService.toggleLike(postId);
      setTestResult({ action: 'like', postId, result });
      loadData();
    } catch (err: any) {
      setTestResult({ action: 'like', postId, error: err.message });
    }
  };

  const testComment = async (postId: number) => {
    try {
      const result = await apiService.addComment(postId, 'Test comment from debug page');
      setTestResult({ action: 'comment', postId, result });
      loadData();
    } catch (err: any) {
      setTestResult({ action: 'comment', postId, error: err.message });
    }
  };

  const testCreatePost = async () => {
    try {
      const result = await apiService.createPost({
        content: 'Test post from debug page - ' + new Date().toLocaleString(),
        privacy: 'PUBLIC'
      });
      setTestResult({ action: 'createPost', result });
      loadData();
    } catch (err: any) {
      setTestResult({ action: 'createPost', error: err.message });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔍 Debug Page</h1>

        {/* User Info */}
        <div className="bg-white/5 border border-gray-700 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">👤 Current User</h2>
          <pre className="bg-black/50 p-4 rounded-lg overflow-auto text-sm">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-xl p-4 mb-6">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Test Result */}
        {testResult && (
          <div className="bg-blue-500/10 border border-blue-500 text-blue-300 rounded-xl p-4 mb-6">
            <h3 className="font-bold mb-2">Last Test Result:</h3>
            <pre className="bg-black/50 p-4 rounded-lg overflow-auto text-sm">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}

        {/* Actions */}
        <div className="bg-white/5 border border-gray-700 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">🧪 Test Actions</h2>
          <div className="flex gap-3">
            <button
              onClick={testCreatePost}
              className="px-6 py-3 bg-primary-500 hover:bg-primary-600 rounded-lg font-semibold transition-colors"
            >
              Create Test Post
            </button>
            <button
              onClick={loadData}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 rounded-lg font-semibold transition-colors"
            >
              Reload Data
            </button>
          </div>
        </div>

        {/* Posts */}
        <div className="bg-white/5 border border-gray-700 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">📝 Posts ({posts.length})</h2>
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="bg-black/50 border border-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold">Post ID: {post.id}</p>
                    <p className="text-sm text-gray-400">
                      By: {post.user?.displayName || post.user?.email || 'Unknown'}
                    </p>
                    <p className="text-sm text-gray-400">
                      Created: {new Date(post.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => testLike(post.id)}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm transition-colors"
                    >
                      Test Like
                    </button>
                    <button
                      onClick={() => testComment(post.id)}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-sm transition-colors"
                    >
                      Test Comment
                    </button>
                  </div>
                </div>
                <p className="mb-3">{post.content}</p>
                <div className="flex gap-4 text-sm text-gray-400">
                  <span>👍 {post.likesCount || 0} likes</span>
                  <span>💬 {post.commentsCount || 0} comments</span>
                  <span>Liked: {post.liked ? '✅' : '❌'}</span>
                </div>
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm text-gray-400 hover:text-white">
                    View Raw JSON
                  </summary>
                  <pre className="bg-black p-3 rounded mt-2 overflow-auto text-xs">
                    {JSON.stringify(post, null, 2)}
                  </pre>
                </details>
              </div>
            ))}
          </div>
        </div>

        {/* Friends */}
        <div className="bg-white/5 border border-gray-700 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">👥 Friends ({friends.length})</h2>
          <div className="space-y-2">
            {friends.map((friend) => (
              <div key={friend.id} className="bg-black/50 border border-gray-700 rounded-lg p-3">
                <p className="font-semibold">{friend.displayName || friend.email}</p>
                <p className="text-sm text-gray-400">ID: {friend.id}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8">
          <a
            href="/dashboard"
            className="inline-block px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors"
          >
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
