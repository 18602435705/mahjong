import { useRef, useState, useCallback } from "react";

interface UseVideoRecorderOptions {
  /** 录制帧率，默认 30 FPS */
  frameRate?: number;
  /** 视频比特率，默认 5 Mbps */
  videoBitsPerSecond?: number;
  /** 视频格式，默认 webm */
  mimeType?: string;
}

interface UseVideoRecorderReturn {
  /** 是否正在录制 */
  isRecording: boolean;
  /** 录制完成的视频 URL */
  recordedVideoUrl: string | null;
  /** 开始录制 */
  startRecording: (canvas: HTMLCanvasElement) => void;
  /** 停止录制 */
  stopRecording: () => void;
  /** 下载视频 */
  downloadVideo: (filename?: string) => void;
  /** 清除录制的视频 */
  clearRecording: () => void;
}

/**
 * 视频录制 Hook
 * 用于将指定 DOM 元素内的 Canvas 录制为视频
 */
export const useVideoRecorder = (
  options: UseVideoRecorderOptions = {},
): UseVideoRecorderReturn => {
  const {
    frameRate = 30,
    videoBitsPerSecond = 5000000,
    mimeType = "video/webm;codecs=vp9",
  } = options;

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);

  // 开始录制
  const startRecording = useCallback(
    (canvas: HTMLCanvasElement) => {
      try {
        const stream = canvas.captureStream(frameRate);

        // 检查是否支持指定的 mimeType
        const supportedMimeType = MediaRecorder.isTypeSupported(mimeType)
          ? mimeType
          : "video/webm";

        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: supportedMimeType,
          videoBitsPerSecond,
        });

        chunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunksRef.current.push(e.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: supportedMimeType });
          const url = URL.createObjectURL(blob);
          setRecordedVideoUrl(url);
          setIsRecording(false);
        };

        mediaRecorder.onerror = (event) => {
          console.error("MediaRecorder error:", event);
          setIsRecording(false);
        };

        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start(100); // 每100ms收集一次数据
        setIsRecording(true);
      } catch (error) {
        console.error("Failed to start recording:", error);
      }
    },
    [frameRate, mimeType, videoBitsPerSecond],
  );

  // 停止录制
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  }, [isRecording]);

  // 下载视频
  const downloadVideo = useCallback(
    (filename?: string) => {
      if (!recordedVideoUrl) return;

      const a = document.createElement("a");
      a.href = recordedVideoUrl;
      a.download = filename || `recording-${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    },
    [recordedVideoUrl],
  );

  // 清除录制的视频
  const clearRecording = useCallback(() => {
    if (recordedVideoUrl) {
      URL.revokeObjectURL(recordedVideoUrl);
      setRecordedVideoUrl(null);
    }
  }, [recordedVideoUrl]);

  return {
    isRecording,
    recordedVideoUrl,
    startRecording,
    stopRecording,
    downloadVideo,
    clearRecording,
  };
};
