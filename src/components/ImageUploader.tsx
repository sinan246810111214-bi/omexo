import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Loader2, CheckCircle } from 'lucide-react';

interface ImageUploaderProps {
  onUploadSuccess: (base64Url: string) => void;
  label?: string;
  helperText?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onUploadSuccess,
  label = "Upload Image File",
  helperText = "Drag & drop or click to choose from your device (PNG, JPG, WEBP)"
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file only.');
      return;
    }

    setLoading(true);
    setSuccess(false);
    setUploadStatus('Reading local file...');

    const reader = new FileReader();
    reader.onload = async (e) => {
      if (e.target?.result && typeof e.target.result === 'string') {
        const base64Data = e.target.result;
        setUploadStatus('Uploading to Cloudinary...');
        try {
          const response = await fetch('/api/upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ image: base64Data })
          });
          
          if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || 'Cloudinary upload failed');
          }
          
          const result = await response.json();
          if (result.success && result.url) {
            onUploadSuccess(result.url);
            setSuccess(true);
            setUploadStatus('Optimized Live!');
            setTimeout(() => {
              setSuccess(false);
              setUploadStatus('');
            }, 3000);
          } else {
            throw new Error('Could not retrieve secure URL from Cloudinary');
          }
        } catch (err: any) {
          alert('Secure Upload Error: ' + err.message);
          setUploadStatus('');
        }
      }
      setLoading(false);
    };
    reader.onerror = () => {
      alert('Failed to read image file from device.');
      setLoading(false);
      setUploadStatus('');
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-1.5" id="image-uploader-wrapper">
      <label className="text-xs font-bold text-slate-600 block">{label}</label>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        onClick={(e) => e.stopPropagation()}
      />

      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerFileSelect}
        className={`relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center min-h-[110px] ${
          isDragActive 
            ? 'border-teal-500 bg-teal-50/50' 
            : 'border-slate-200 bg-white hover:border-teal-400 hover:bg-slate-50/50'
        }`}
        id="image-uploader-dropzone"
      >
        {loading ? (
          <div className="space-y-1.5 flex flex-col items-center">
            <Loader2 className="w-5 h-5 text-teal-600 animate-spin" />
            <span className="text-[11px] font-bold text-slate-500">{uploadStatus || 'Reading image file...'}</span>
          </div>
        ) : success ? (
          <div className="space-y-1.5 flex flex-col items-center">
            <CheckCircle className="w-5 h-5 text-emerald-500 animate-bounce" />
            <span className="text-[11px] font-bold text-emerald-600">{uploadStatus || 'Uploaded successfully!'}</span>
          </div>
        ) : (
          <div className="space-y-1.5 flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
              <Upload className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-700 block">Choose device file</span>
              <span className="text-[10px] text-slate-400 max-w-[220px] block leading-tight">
                {helperText}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
