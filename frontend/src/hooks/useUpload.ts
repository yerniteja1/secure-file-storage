import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { filesAPI } from '../api';

interface UploadState {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export function useUpload() {
  const queryClient = useQueryClient();
  const [uploads, setUploads] = useState<UploadState[]>([]);

  const uploadMutation = useMutation({
    mutationFn: (file: File) => {
      return new Promise<void>((resolve, reject) => {
        filesAPI.upload(file, (progress) => {
          setUploads((prev) =>
            prev.map((u) =>
              u.file === file ? { ...u, progress, status: 'uploading' as const } : u
            )
          );
        }).then(() => resolve()).catch(reject);
      });
    },
    onSuccess: (_, file) => {
      setUploads((prev) =>
        prev.map((u) =>
          u.file === file ? { ...u, status: 'success' as const, progress: 100 } : u
        )
      );
      queryClient.invalidateQueries({ queryKey: ['files'] });

      setTimeout(() => {
        setUploads((prev) => prev.filter((u) => u.file !== file));
      }, 3000);
    },
    onError: (error: Error, file) => {
      setUploads((prev) =>
        prev.map((u) =>
          u.file === file
            ? { ...u, status: 'error' as const, error: error.message }
            : u
        )
      );
    },
  });

  const uploadFile = (file: File) => {
    if (file.size > 100 * 1024 * 1024) {
      setUploads((prev) => [
        ...prev,
        {
          file,
          progress: 0,
          status: 'error' as const,
          error: 'File size exceeds 100MB limit',
        },
      ]);
      return;
    }

    setUploads((prev) => [
      ...prev,
      { file, progress: 0, status: 'pending' as const },
    ]);
    uploadMutation.mutate(file);
  };

  const uploadFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(uploadFile);
  };

  const clearUploads = () => {
    setUploads([]);
  };

  return {
    uploads,
    uploadFile,
    uploadFiles,
    clearUploads,
    isUploading: uploadMutation.isPending,
  };
}