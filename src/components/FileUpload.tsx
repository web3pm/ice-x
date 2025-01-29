import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileUpload: (data: any) => void;
}

const FileUpload = ({ onFileUpload }: FileUploadProps) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        onFileUpload(jsonData);
      } catch (error) {
        console.error('Error parsing JSON:', error);
      }
    };
    
    reader.readAsText(file);
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json']
    },
    multiple: false
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        'file-drop-zone',
        isDragActive && 'dragging'
      )}
    >
      <input {...getInputProps()} />
      <p className="text-center text-muted-foreground">
        {isDragActive
          ? 'Drop your network data file here'
          : 'Drag & drop your network JSON file here, or click to select'}
      </p>
    </div>
  );
};

export default FileUpload;