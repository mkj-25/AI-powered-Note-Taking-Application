import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Square, Loader2, Volume2 } from 'lucide-react';
import toast from 'react-hot-toast';
import * as aiService from '../../services/aiService';

function VoiceRecorder({ onTranscription }) {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [duration, setDuration] = useState(0);
  const [visualizerData, setVisualizerData] = useState(new Array(20).fill(2));
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const animRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);

  const startVisualization = (stream) => {
    const ctx = new AudioContext();
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 64;
    source.connect(analyser);
    analyserRef.current = analyser;

    const tick = () => {
      const data = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(data);
      const bars = Array.from(data.slice(0, 20)).map((v) => Math.max(2, (v / 255) * 40));
      setVisualizerData(bars);
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
  };

  const stopVisualization = () => {
    cancelAnimationFrame(animRef.current);
    setVisualizerData(new Array(20).fill(2));
  };

  // Pick the best supported mimeType for Whisper compatibility
  const getSupportedMimeType = () => {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg;codecs=opus',
    ];
    return types.find((t) => MediaRecorder.isTypeSupported(t)) || '';
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      startVisualization(stream);

      const mimeType = getSupportedMimeType();
      const options = mimeType ? { mimeType } : {};
      const mr = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.start(250); // collect data every 250ms for reliability
      setRecording(true);
      setDuration(0);
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    } catch (err) {
      toast.error(err.name === 'NotAllowedError' ? 'Microphone access denied' : 'Could not start recording');
    }
  };

  const stopRecording = () => {
    clearInterval(timerRef.current);
    stopVisualization();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setRecording(false);

    if (!mediaRecorderRef.current) return;
    const mr = mediaRecorderRef.current;
    mr.onstop = async () => {
      // Use the recorder's actual mimeType for the blob
      const mimeType = mr.mimeType || 'audio/webm';
      const blob = new Blob(chunksRef.current, { type: mimeType });
      await transcribe(blob, mimeType);
    };
    mr.stop();
  };

  const transcribe = async (blob, mimeType = 'audio/webm') => {
    setProcessing(true);
    try {
      // Derive file extension from mimeType for Whisper to identify format
      const ext = mimeType.includes('mp4') ? 'mp4'
        : mimeType.includes('ogg') ? 'ogg'
        : 'webm';
      const formData = new FormData();
      formData.append('audio', blob, `voice.${ext}`);
      const res = await aiService.transcribeVoice(formData);
      if (!res.text) throw new Error('Empty transcription');
      onTranscription?.(res.text);
      toast.success('Voice transcribed!');
    } catch (err) {
      toast.error(err.message === 'Empty transcription' ? 'No speech detected' : 'Transcription failed');
    } finally {
      setProcessing(false);
      setDuration(0);
    }
  };

  useEffect(() => () => { clearInterval(timerRef.current); cancelAnimationFrame(animRef.current); }, []);

  const fmt = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
      padding: '20px',
      background: 'var(--bg-secondary)', borderRadius: 'var(--radius-xl)',
      border: '1px solid var(--border-default)',
    }}>
      {/* Visualizer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '48px' }}>
        {visualizerData.map((h, i) => (
          <div
            key={i}
            style={{
              width: '3px',
              height: `${h}px`,
              background: recording ? 'var(--accent)' : 'var(--border-strong)',
              borderRadius: '2px',
              transition: recording ? 'height 0.08s ease' : 'none',
            }}
          />
        ))}
      </div>

      {/* Duration */}
      <div style={{ fontSize: '24px', fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: recording ? 'var(--text-primary)' : 'var(--text-muted)', letterSpacing: '2px' }}>
        {fmt(duration)}
      </div>

      {/* Button */}
      {processing ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13px' }}>
          <Loader2 size={18} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent)' }} />
          Transcribing…
        </div>
      ) : (
        <button
          id="voice-record-btn"
          onClick={recording ? stopRecording : startRecording}
          style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: recording
              ? 'var(--red-light)' : 'linear-gradient(135deg, var(--accent), #A78BFA)',
            border: recording ? '2px solid var(--red)' : 'none',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: recording ? '0 0 0 8px rgba(239,68,68,0.1)' : 'var(--shadow-glow)',
            transition: 'all 0.2s ease',
            color: recording ? 'var(--red)' : '#fff',
          }}
        >
          {recording ? <Square size={22} fill="currentColor" /> : <Mic size={22} />}
        </button>
      )}

      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
        {recording ? 'Click to stop recording' : 'Click to start recording'}
      </p>
    </div>
  );
}

export default VoiceRecorder;
