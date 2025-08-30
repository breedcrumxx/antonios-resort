'use client';

import { cn } from '@/lib/utils/cn';
import { formatFileSize } from '@edgestore/react/utils';
import clsx from 'clsx';
import {
  CheckCircleIcon,
  DatabaseBackup,
  FileIcon,
  LucideFileWarning,
  Trash2Icon,
  UploadCloudIcon,
  X,
  XIcon,
} from 'lucide-react';
import * as React from 'react';
import { useDropzone, type DropzoneOptions } from 'react-dropzone';
import { twMerge } from 'tailwind-merge';

const variants = {
  base: 'relative rounded-md p-4 w-full flex justify-center items-center flex-col cursor-pointer border border-dashed border-gray-400 dark:border-gray-300 transition-colors duration-200 ease-in-out',
  active: 'border-2',
  disabled:
    'bg-gray-200 border-gray-300 cursor-default pointer-events-none bg-opacity-30 dark:bg-gray-700 dark:border-gray-600',
  accept: 'border border-blue-500 bg-blue-500 bg-opacity-10',
  reject: 'border border-red-700 bg-red-700 bg-opacity-10',
};

export type FileState = {
  file: File;
  key: string; // used to identify the file in the progress callback
  progress: 'PENDING' | 'COMPLETE' | 'ERROR' | number;
  abortController?: AbortController;
};

type InputProps = {
  className?: string;
  value?: File;
  onChange?: (file: File | undefined) => void;
  onFilesAdded?: (addedFiles: File) => void | Promise<void>;
  disabled?: boolean;
  dropzoneOptions?: Omit<DropzoneOptions, 'disabled'>;
};

const ERROR_MESSAGES = {
  fileTooLarge(maxSize: number) {
    return `The file is too large. Max size is ${formatFileSize(maxSize)}.`;
  },
  fileInvalidType() {
    return 'Invalid file type.';
  },
  tooManyFiles(maxFiles: number) {
    return `You can only add ${maxFiles} file(s).`;
  },
  fileNotSupported() {
    return 'The file is not supported.';
  },
};

const UploadDatabaseBackup = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { dropzoneOptions, value, className, disabled, onFilesAdded, onChange },
    ref,
  ) => {
    const [customError, setCustomError] = React.useState<string>();
    if (value) {
      disabled = true
    }
    // dropzone configuration
    const {
      getRootProps,
      getInputProps,
      fileRejections,
      isFocused,
      isDragAccept,
      isDragReject,
    } = useDropzone({
      disabled,
      maxFiles: 1,
      accept: { 'application/x-zip-compressed': [] },
      onDrop: (acceptedFiles) => {
        setCustomError(undefined);
        if (acceptedFiles.length > 1) {
          setCustomError("Maximum of 1 file!")
          return
        }
        if (acceptedFiles.length > 0) {
          void onChange?.(acceptedFiles[0] as File);
        }
      },
      ...dropzoneOptions,
    });

    // styling
    const dropZoneClassName = React.useMemo(
      () =>
        twMerge(
          variants.base,
          isFocused && variants.active,
          disabled && variants.disabled,
          (isDragReject ?? fileRejections[0]) && variants.reject,
          isDragAccept && variants.accept,
          className,
        ).trim(),
      [
        isFocused,
        fileRejections,
        isDragAccept,
        isDragReject,
        disabled,
        className,
      ],
    );

    // error validation messages
    const errorMessage = React.useMemo(() => {
      if (fileRejections[0]) {
        const { errors } = fileRejections[0];
        if (errors[0]?.code === 'file-too-large') {
          return ERROR_MESSAGES.fileTooLarge(dropzoneOptions?.maxSize ?? 0);
        } else if (errors[0]?.code === 'file-invalid-type') {
          return ERROR_MESSAGES.fileInvalidType();
        } else if (errors[0]?.code === 'too-many-files') {
          return ERROR_MESSAGES.tooManyFiles(1);
        } else {
          return ERROR_MESSAGES.fileNotSupported();
        }
      }
      return undefined;
    }, [fileRejections, dropzoneOptions]);

    return (
      <div className="w-full">
        <div className="flex w-full flex-col gap-2">
          <div className="w-full">
            {/* Main File Input */}
            <div
              {...getRootProps({
                className: clsx(dropZoneClassName, { "hidden": value }),
              })}
            >
              <input ref={ref} {...getInputProps()} />
              <div className="flex flex-col items-center justify-center text-xs text-gray-400">
                <UploadCloudIcon className="mb-1 h-7 w-7" />
                <div className="text-gray-400">
                  Upload backup file
                </div>
              </div>
            </div>

            {/* Error Text */}
            <div className="mt-1 text-xs text-red-500">
              {customError ?? errorMessage}
            </div>
          </div>

          {
            value && (
              <div
                {...getRootProps({
                  className: "w-[150px] h-[150px] rounded-lg py-auto text-black border relative",
                })}
              >
                <X className='absolute top-2 right-2 w-4 h-4 cursor-pointer hover:scale-125' onClick={() => onChange?.(undefined)} />
                <div className="w-full h-full flex flex-col items-center justify-center text-xs ">
                  <DatabaseBackup className="mb-1 h-7 w-7" />
                  <div>
                    {value.name}
                  </div>
                </div>
              </div>
            )
          }
        </div>
      </div>
    );
  },
);
UploadDatabaseBackup.displayName = 'UploadDatabaseBackup';

export { UploadDatabaseBackup };