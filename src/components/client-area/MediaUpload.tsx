"use client";

import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface MediaUploadProps {
  onDrop: (acceptedFiles: File[], rejectedFiles: any[], event: any) => void;
  files: File[];
  onRemove: (index: number) => void;
}

const MediaUpload: React.FC<MediaUploadProps> = ({ onDrop, files, onRemove }) => {
  const onDropCallback = useCallback(onDrop, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropCallback,
    accept: {
      'image/*': ['.jpeg', '.png', '.jpg', '.gif'],
      'video/*': ['.mp4', '.mov', '.avi'],
    },
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-md p-8 text-center cursor-pointer
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Largue os ficheiros aqui...</p>
        ) : (
          <p>Arraste e largue alguns ficheiros aqui, ou clique para selecionar</p>
        )}
      </div>
      {files.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold">Ficheiros Selecionados:</h4>
          <ul className="list-disc pl-5 mt-2">
            {files.map((file, index) => (
              <li key={index} className="flex justify-between items-center">
                <span>{file.name}</span>
                <Button variant="ghost" size="sm" onClick={() => onRemove(index)}>
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MediaUpload; 