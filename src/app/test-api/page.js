'use client';

import { useState, useEffect } from 'react';

export default function TestApiPage() {
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testApiConnection = async () => {
    setLoading(true);
    setError(null);
    setTestResult(null);

    try {
      // Get the base URL from environment variable or default to localhost
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      console.log('Testing API connection to:', baseUrl);
      
      const response = await fetch(`${baseUrl}/api/test`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API test failed with status ${response.status}`);
      }

      const data = await response.json();
      setTestResult(data);
    } catch (err) {
      console.error('API test error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testAuthApiConnection = async () => {
    setLoading(true);
    setError(null);
    setTestResult(null);

    try {
      // Get the base URL from environment variable or default to localhost
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      console.log('Testing auth API connection to:', baseUrl);
      
      const response = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'OPTIONS',
      });

      console.log('Auth API response status:', response.status);
      console.log('Auth API response headers:', [...response.headers.entries()]);
      
      setTestResult({
        status: response.status,
        message: 'Auth API endpoint is accessible',
        headers: [...response.headers.entries()]
      });
    } catch (err) {
      console.error('Auth API test error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">API Connection Test</h1>
        
        <div className="space-y-4">
          <button
            onClick={testApiConnection}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test General API Connection'}
          </button>
          
          <button
            onClick={testAuthApiConnection}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Auth API Connection'}
          </button>
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <h2 className="font-bold">Error:</h2>
            <p>{error}</p>
          </div>
        )}

        {testResult && (
          <div className="mt-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            <h2 className="font-bold">Test Result:</h2>
            <pre className="mt-2 whitespace-pre-wrap break-words">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-6 p-4 bg-gray-100 rounded">
          <h2 className="font-bold text-gray-800 mb-2">Debug Information:</h2>
          <p><strong>NEXT_PUBLIC_API_URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'Not set (defaulting to localhost)'}</p>
          <p><strong>Current Host:</strong> {typeof window !== 'undefined' ? window.location.origin : 'Server-side'}</p>
        </div>
      </div>
    </div>
  );
}