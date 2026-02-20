'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ConfirmationModal } from './ConfirmationModal';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useAuth } from '@/hooks/useAuth';
import { ImagePlus, X } from 'lucide-react';

export function IssueForm() {
  const router = useRouter();
  const { user, getToken } = useAuth();
  const { latitude, longitude, error: geoError, loading: geoLoading, requestLocation } = useGeolocation();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    urgency: 'NORMAL' as 'NORMAL' | 'URGENT',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageUploadUrl, setImageUploadUrl] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && user.role !== 'USER') {
      router.replace('/dashboard');
    }
  }, [user, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
      setError('Please take a photo in JPEG or PNG format (camera only).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB.');
      return;
    }
    setError('');
    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
    setImageUploadUrl(null);
  };

  const removeImage = () => {
    setImageFile(null);
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImagePreviewUrl(null);
    setImageUploadUrl(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!latitude || !longitude) {
      setError('Please allow location access to report an issue.');
      return;
    }
    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Please fill in title and description.');
      return;
    }
    if (!imageFile) {
      setError('Photo is required. Please take a photo using your camera.');
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirm = async () => {
    setShowConfirmModal(false);
    setSubmitting(true);
    setError('');

    try {
      if (!imageFile) {
        setError('Photo is required. Please take a photo using your camera.');
        setSubmitting(false);
        return;
      }

      const token = getToken();
      const uploadForm = new FormData();
      uploadForm.append('file', imageFile);
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: uploadForm,
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || 'Image upload failed');
      const finalImageUrl = uploadData.url;
      if (!finalImageUrl) throw new Error('Photo upload failed. Please try again.');
      const response = await fetch('/api/issues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim(),
          image_url: finalImageUrl,
          latitude,
          longitude,
          urgency: formData.urgency,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create issue');
      }

      if (data.message?.includes('Support count incremented')) {
        setError('');
        router.push(`/issues/${data.issue?.id || ''}`);
        router.refresh();
        return;
      }

      router.push('/issues');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to create issue');
    } finally {
      setSubmitting(false);
    }
  };

  if (user && user.role !== 'USER') {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <h1 className="text-2xl font-bold mb-6">Report New Issue</h1>
      <p className="text-sm text-black mb-4 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
        If someone already reported a similar issue within 50m, your report will add support to it instead of creating a duplicate. You&apos;ll see the support count on the issue.
      </p>

      {geoError && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded mb-4">
          <p className="mb-2">{geoError}</p>
          <Button variant="outline" onClick={requestLocation}>
            Request Location Again
          </Button>
        </div>
      )}

      {geoLoading && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-4">
          Getting your location...
        </div>
      )}

      {latitude && longitude && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          GPS captured: {latitude.toFixed(6)}, {longitude.toFixed(6)}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <Input
          label="Title"
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Brief description of the issue"
        />

        <div>
          <label className="block text-sm font-medium text-black mb-1">Description</label>
          <textarea
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
            rows={5}
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Detailed description of the issue..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-1">Photo (required - take from camera)</label>
          <div className="flex items-center gap-3">
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
              <ImagePlus className="w-4 h-4" />
              Take photo
              <input
                type="file"
                accept="image/jpeg,image/png"
                capture="environment"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>
            {imagePreviewUrl && (
              <div className="relative inline-block">
                <img
                  src={imagePreviewUrl}
                  alt="Preview"
                  className="h-16 w-16 object-cover rounded border"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"
                  aria-label="Remove image"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
          <p className="mt-1 text-xs text-black">Required. Take a photo using your camera (not from gallery). JPEG or PNG. Max 5MB.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-1">Urgency</label>
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
            value={formData.urgency}
            onChange={(e) =>
              setFormData({ ...formData, urgency: e.target.value as 'NORMAL' | 'URGENT' })
            }
          >
            <option value="NORMAL">Normal</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            disabled={submitting || !latitude || !longitude || !imageFile}
            className="flex-1"
          >
            {submitting ? 'Submitting...' : 'Submit Issue'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>

      <ConfirmationModal
        isOpen={showConfirmModal}
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirmModal(false)}
      />
    </div>
  );
}
