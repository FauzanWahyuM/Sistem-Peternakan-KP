'use client';

import { useState, useEffect } from 'react';

export default function TestMongoDBPage() {
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runTest = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Test creating a user
      const userResponse = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test User',
          username: 'testuser',
          email: 'test@example.com',
          password: 'testpassword',
          role: 'peternak',
          kelompok: 'Test Group'
        }),
      });
      
      const userData = await userResponse.json();
      
      // Test creating livestock data
      const livestockResponse = await fetch('/api/livestock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userData.user._id,
          jenisHewan: 'Sapi',
          jenisKelamin: 'Jantan',
          umurTernak: '2 tahun',
          statusTernak: 'Pejantan',
          kondisiKesehatan: 'Sehat'
        }),
      });
      
      const livestockData = await livestockResponse.json();
      
      // Test fetching livestock data
      const fetchResponse = await fetch(`/api/livestock?userId=${userData.user._id}`);
      const fetchData = await fetchResponse.json();
      
      // Test updating livestock data
      const updateResponse = await fetch(`/api/livestock/${livestockData.livestock._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          umurTernak: '3 tahun',
          kondisiKesehatan: 'Sakit'
        }),
      });
      
      const updateData = await updateResponse.json();
      
      // Test deleting livestock data
      const deleteResponse = await fetch(`/api/livestock/${livestockData.livestock._id}`, {
        method: 'DELETE',
      });
      
      const deleteData = await deleteResponse.json();
      
      setTestResults({
        userCreated: userData.user,
        livestockCreated: livestockData.livestock,
        livestockFetched: fetchData.livestock,
        livestockUpdated: updateData.livestock,
        livestockDeleted: deleteData.message
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">MongoDB Integration Test</h1>
        
        <div className="mb-6">
          <button
            onClick={runTest}
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {loading ? 'Running Tests...' : 'Run MongoDB Tests'}
          </button>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        {testResults && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-700">Test Results</h2>
            
            <div className="p-4 bg-green-100 border border-green-400 rounded">
              <h3 className="font-bold text-green-800">User Creation</h3>
              <pre className="mt-2 text-sm bg-white p-2 rounded overflow-x-auto">
                {JSON.stringify(testResults.userCreated, null, 2)}
              </pre>
            </div>
            
            <div className="p-4 bg-blue-100 border border-blue-400 rounded">
              <h3 className="font-bold text-blue-800">Livestock Creation</h3>
              <pre className="mt-2 text-sm bg-white p-2 rounded overflow-x-auto">
                {JSON.stringify(testResults.livestockCreated, null, 2)}
              </pre>
            </div>
            
            <div className="p-4 bg-yellow-100 border border-yellow-400 rounded">
              <h3 className="font-bold text-yellow-800">Livestock Fetch</h3>
              <pre className="mt-2 text-sm bg-white p-2 rounded overflow-x-auto">
                {JSON.stringify(testResults.livestockFetched, null, 2)}
              </pre>
            </div>
            
            <div className="p-4 bg-purple-100 border border-purple-400 rounded">
              <h3 className="font-bold text-purple-800">Livestock Update</h3>
              <pre className="mt-2 text-sm bg-white p-2 rounded overflow-x-auto">
                {JSON.stringify(testResults.livestockUpdated, null, 2)}
              </pre>
            </div>
            
            <div className="p-4 bg-red-100 border border-red-400 rounded">
              <h3 className="font-bold text-red-800">Livestock Deletion</h3>
              <p className="mt-2">{testResults.livestockDeleted}</p>
            </div>
          </div>
        )}
        
        {!testResults && !error && !loading && (
          <div className="text-gray-600">
            <p>Click the button above to run MongoDB integration tests.</p>
            <p className="mt-2">This will test:</p>
            <ul className="list-disc list-inside mt-2">
              <li>User creation</li>
              <li>Livestock data creation</li>
              <li>Data fetching</li>
              <li>Data updating</li>
              <li>Data deletion</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}