'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TestLivestockStats() {
  const router = useRouter();
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runTest = async () => {
    setLoading(true);
    setError(null);
    setTestResults(null);
    
    try {
      // Test 1: Create a user
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
      
      if (!userResponse.ok) {
        throw new Error('Failed to create user');
      }
      
      const userData = await userResponse.json();
      const userId = userData.user._id;
      
      // Test 2: Create multiple livestock records
      const livestockData = [
        {
          userId: userId,
          jenisHewan: 'Sapi',
          jenisKelamin: 'Jantan',
          umurTernak: '2 tahun',
          statusTernak: 'Pejantan',
          kondisiKesehatan: 'Sehat'
        },
        {
          userId: userId,
          jenisHewan: 'Sapi',
          jenisKelamin: 'Betina',
          umurTernak: '3 tahun',
          statusTernak: 'Indukan',
          kondisiKesehatan: 'Sehat'
        },
        {
          userId: userId,
          jenisHewan: 'Kambing',
          jenisKelamin: 'Jantan',
          umurTernak: '1 tahun',
          statusTernak: 'Pejantan',
          kondisiKesehatan: 'Sakit'
        },
        {
          userId: userId,
          jenisHewan: 'Kambing',
          jenisKelamin: 'Betina',
          umurTernak: '2 tahun',
          statusTernak: 'Indukan',
          kondisiKesehatan: 'Sehat'
        },
        {
          userId: userId,
          jenisHewan: 'Domba',
          jenisKelamin: 'Jantan',
          umurTernak: '1.5 tahun',
          statusTernak: 'Pejantan',
          kondisiKesehatan: 'Sehat'
        }
      ];
      
      const createdLivestock = [];
      for (const data of livestockData) {
        const livestockResponse = await fetch('/api/livestock', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        
        if (!livestockResponse.ok) {
          throw new Error('Failed to create livestock');
        }
        
        const livestockResult = await livestockResponse.json();
        createdLivestock.push(livestockResult.livestock);
      }
      
      // Test 3: Fetch livestock statistics
      const statsResponse = await fetch(`/api/livestock?stats=true&userId=${userId}`);
      if (!statsResponse.ok) {
        throw new Error('Failed to fetch livestock statistics');
      }
      const statsData = await statsResponse.json();
      
      setTestResults({
        user: userData.user,
        livestock: createdLivestock,
        statistics: statsData.statistics
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Livestock Statistics Test</h1>
        
        <div className="mb-6">
          <button
            onClick={runTest}
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {loading ? 'Running Tests...' : 'Run Livestock Statistics Test'}
          </button>
          
          <button
            onClick={() => router.push('/peternak/ternak/lihat')}
            className="ml-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            View Livestock Data
          </button>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        {testResults && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-700">Test Results</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-green-100 border border-green-400 rounded">
                <h3 className="font-bold text-green-800">User Creation</h3>
                <pre className="mt-2 text-sm bg-white p-2 rounded overflow-x-auto max-h-40">
                  {JSON.stringify(testResults.user, null, 2)}
                </pre>
              </div>
              
              <div className="p-4 bg-blue-100 border border-blue-400 rounded">
                <h3 className="font-bold text-blue-800">Created Livestock</h3>
                <pre className="mt-2 text-sm bg-white p-2 rounded overflow-x-auto max-h-40">
                  {JSON.stringify(testResults.livestock, null, 2)}
                </pre>
              </div>
            </div>
            
            <div className="p-4 bg-purple-100 border border-purple-400 rounded">
              <h3 className="font-bold text-purple-800">Livestock Statistics</h3>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                {testResults.statistics.map((stat, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg shadow">
                    <div className="text-3xl mb-2">
                      {stat._id === 'Sapi' && '🐄'}
                      {stat._id === 'Kambing' && '🐐'}
                      {stat._id === 'Domba' && '🐑'}
                      {stat._id === 'Ayam' && '🐔'}
                      {stat._id === 'Bebek' && '🦆'}
                      {!['Sapi', 'Kambing', 'Domba', 'Ayam', 'Bebek'].includes(stat._id) && '🐾'}
                    </div>
                    <h4 className="text-lg font-semibold">{stat._id}</h4>
                    <p className="text-2xl font-bold text-green-600">{stat.total} Ekor</p>
                    <div className="mt-2 text-sm">
                      <p className="text-green-600">Sehat: {stat.sehat}</p>
                      <p className="text-red-600">Sakit: {stat.sakit}</p>
                    </div>
                  </div>
                ))}
              </div>
              <pre className="mt-4 text-sm bg-white p-2 rounded overflow-x-auto max-h-40">
                {JSON.stringify(testResults.statistics, null, 2)}
              </pre>
            </div>
          </div>
        )}
        
        {!testResults && !error && !loading && (
          <div className="text-gray-600">
            <p>Click the button above to run livestock statistics tests.</p>
            <p className="mt-2">This will test:</p>
            <ul className="list-disc list-inside mt-2">
              <li>User creation</li>
              <li>Livestock data creation with different animal types</li>
              <li>Livestock statistics calculation by animal type</li>
              <li>Display of statistics in the format shown in the reference image</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}