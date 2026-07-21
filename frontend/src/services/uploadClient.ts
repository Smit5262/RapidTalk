import { api } from "./api";

interface PresignResult {
  url: string;
  fileUrl: string;
  key: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percent: number;
}

export async function presignUpload(
  workspaceId: string,
  channelId: string,
  file: File,
): Promise<PresignResult> {
  const { data } = await api.post<{ data: PresignResult }>(
    `/workspaces/${workspaceId}/channels/${channelId}/uploads/presign`,
    { fileName: file.name, mimeType: file.type, sizeBytes: file.size },
  );
  return data.data;
}

export function uploadFileDirectly(
  presignedUrl: string,
  file: File,
  onProgress?: (progress: UploadProgress) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", presignedUrl);
    xhr.setRequestHeader("Content-Type", file.type);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress({ loaded: e.loaded, total: e.total, percent: Math.round((e.loaded / e.total) * 100) });
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload failed: ${xhr.status}`));
    };

    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.send(file);
  });
}

export async function uploadAndAttach(
  workspaceId: string,
  channelId: string,
  file: File,
  onProgress?: (progress: UploadProgress) => void,
) {
  const presigned = await presignUpload(workspaceId, channelId, file);
  await uploadFileDirectly(presigned.url, file, onProgress);

  return {
    fileUrl: presigned.fileUrl,
    fileName: file.name,
    mimeType: file.type,
    sizeBytes: file.size,
  };
}
