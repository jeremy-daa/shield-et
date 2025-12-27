"use client";
import { useEffect, useState } from 'react';
import { storage } from '@/lib/appwrite';

export default function TestConnection() {
  const [status, setStatus] = useState<'testing' | 'success' | 'error'>('testing');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const verify = async () => {
      try {
        // Attempt to list files. Even if empty, it verifies the bucket exists & is reachable.
        await storage.listFiles(process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!);
        setStatus('success');
      } catch (err: any) {
        console.error("Connection Error:", err);
        setStatus('error');
        // 'Storage bucket not found' or 'Unauthorized' are common here
        setErrorMsg(err.message || 'Access Denied');
      }
    };
    verify();
  }, []);

  return (
    <div className="p-6 border-2 border-dashed rounded-xl m-4 bg-gray-50 dark:bg-zinc-900">
      <h2 className="font-bold text-lg mb-2">Appwrite Bridge Check</h2>
      {status === 'testing' && <p className="text-blue-500 animate-pulse">Pinging Bucket...</p>}
      {status === 'success' && (
        <p className="text-green-600 font-semibold">✅ Handshake Successful: Project & Bucket are live!</p>
      )}
      {status === 'error' && (
        <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600">
          <p className="font-bold">❌ Connection Failed</p>
          <p className="text-sm italic">{errorMsg}</p>
          <p className="text-xs mt-2 text-gray-500">
            Hint: Check if localhost is added to "Platforms" in Appwrite Console.
          </p>
        </div>
      )}
    </div>
  );
}