import { showToast } from './toast.js';

// Setup Cloudinary widget helper
// Requires Cloudinary JS to be loaded via script tag: <script src="https://upload-widget.cloudinary.com/global/all.js" type="text/javascript"></script>

const cloudName = 'YOUR_CLOUD_NAME'; // To be updated
const uploadPreset = 'YOUR_UNSIGNED_PRESET'; // To be updated

export function openUploadWidget(options = {}, onSuccess) {
  if (typeof cloudinary === 'undefined') {
    showToast('Cloudinary script not loaded', 'error');
    return;
  }

  const defaultOptions = {
    cloudName: cloudName,
    uploadPreset: uploadPreset,
    sources: ['local', 'url'],
    multiple: true,
    resourceType: 'auto',
    folder: 'store',
    ...options
  };

  const widget = cloudinary.createUploadWidget(defaultOptions, (error, result) => {
    if (error) {
      console.error('Upload Error:', error);
      showToast('Upload failed', 'error');
      return;
    }
    if (result && result.event === 'success') {
      onSuccess({ 
        url: result.info.secure_url, 
        public_id: result.info.public_id, 
        type: result.info.resource_type 
      });
    }
  });

  widget.open();
}

export function getThumbnailUrl(publicId) {
  return `https://res.cloudinary.com/${cloudName}/image/upload/w_400,f_auto,q_auto/${publicId}`;
}

export function getMainImageUrl(publicId) {
  return `https://res.cloudinary.com/${cloudName}/image/upload/w_900,f_auto,q_auto/${publicId}`;
}

export function getGalleryThumbnailUrl(publicId) {
  return `https://res.cloudinary.com/${cloudName}/image/upload/w_120,h_120,c_fill,f_auto,q_auto/${publicId}`;
}
