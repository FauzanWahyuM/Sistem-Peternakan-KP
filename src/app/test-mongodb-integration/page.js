'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TestMongoDBIntegration() {
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
      
      // Test 2: Create livestock data
      const livestockResponse = await fetch('/api/livestock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          jenisHewan: 'Sapi',
          jenisKelamin: 'Jantan',
          umurTernak: '2 tahun',
          statusTernak: 'Pejantan',
          kondisiKesehatan: 'Sehat'
        }),
      });
      
      if (!livestockResponse.ok) {
        throw new Error('Failed to create livestock');
      }
      
      const livestockData = await livestockResponse.json();
      const livestockId = livestockData.livestock._id;
      
      // Test 3: Create a questionnaire
      const questionnaireResponse = await fetch('/api/questionnaires', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          judul: 'Test Questionnaire',
          pertanyaan: [
            {
              id: 1,
              teks: 'Pertanyaan 1',
              tipe: 'pilihan_ganda',
              opsi: ['Opsi 1', 'Opsi 2', 'Opsi 3']
            },
            {
              id: 2,
              teks: 'Pertanyaan 2',
              tipe: 'text'
            }
          ]
        }),
      });
      
      if (!questionnaireResponse.ok) {
        throw new Error('Failed to create questionnaire');
      }
      
      const questionnaireData = await questionnaireResponse.json();
      const questionnaireId = questionnaireData.questionnaire._id;
      
      // Test 4: Create a questionnaire response
      const responseResponse = await fetch('/api/questionnaire-responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionnaireId: questionnaireId,
          userId: userId,
          responses: [
            {
              pertanyaanId: 'pertanyaan_1',
              jawaban: 'Opsi 2'
            },
            {
              pertanyaanId: 'pertanyaan_2',
              jawaban: 'Jawaban untuk pertanyaan 2'
            }
          ]
        }),
      });
      
      if (!responseResponse.ok) {
        throw new Error('Failed to create questionnaire response');
      }
      
      const responseData = await responseResponse.json();
      
      // Test 5: Fetch livestock data
      const fetchLivestockResponse = await fetch(`/api/livestock?userId=${userId}`);
      if (!fetchLivestockResponse.ok) {
        throw new Error('Failed to fetch livestock data');
      }
      const fetchLivestockData = await fetchLivestockResponse.json();
      
      // Test 6: Fetch livestock statistics
      const fetchStatsResponse = await fetch(`/api/livestock?stats=true&userId=${userId}`);
      if (!fetchStatsResponse.ok) {
        throw new Error('Failed to fetch livestock statistics');
      }
      const fetchStatsData = await fetchStatsResponse.json();
      
      // Test 7: Fetch questionnaire data
      const fetchQuestionnaireResponse = await fetch(`/api/questionnaires?userId=${userId}`);
      if (!fetchQuestionnaireResponse.ok) {
        throw new Error('Failed to fetch questionnaire data');
      }
      const fetchQuestionnaireData = await fetchQuestionnaireResponse.json();
      
      // Test 8: Fetch questionnaire responses
      const fetchResponseResponse = await fetch(`/api/questionnaire-responses?userId=${userId}`);
      if (!fetchResponseResponse.ok) {
        throw new Error('Failed to fetch questionnaire responses');
      }
      const fetchResponseData = await fetchResponseResponse.json();
      
      setTestResults({
        user: userData.user,
        livestock: livestockData.livestock,
        questionnaire: questionnaireData.questionnaire,
        response: responseData.response,
        fetchedLivestock: fetchLivestockData.livestock,
        livestockStats: fetchStatsData.statistics,
        fetchedQuestionnaires: fetchQuestionnaireData.questionnaires,
        fetchedResponses: fetchResponseData.responses
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
        <h1 className="text-3xl font-bold text-gray-800 mb-6">MongoDB Integration Test</h1>
        
        <div className="mb-6">
          <button
            onClick={runTest}
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {loading ? 'Running Tests...' : 'Run MongoDB Integration Tests'}
          </button>
          
          <button
            onClick={() => router.push('/dashboard/peternak')}
            className="ml-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Go to Peternak Dashboard
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
                <h3 className="font-bold text-blue-800">Livestock Creation</h3>
                <pre className="mt-2 text-sm bg-white p-2 rounded overflow-x-auto max-h-40">
                  {JSON.stringify(testResults.livestock, null, 2)}
                </pre>
              </div>
              
              <div className="p-4 bg-purple-100 border border-purple-400 rounded">
                <h3 className="font-bold text-purple-800">Questionnaire Creation</h3>
                <pre className="mt-2 text-sm bg-white p-2 rounded overflow-x-auto max-h-40">
                  {JSON.stringify(testResults.questionnaire, null, 2)}
                </pre>
              </div>
              
              <div className="p-4 bg-yellow-100 border border-yellow-400 rounded">
                <h3 className="font-bold text-yellow-800">Questionnaire Response</h3>
                <pre className="mt-2 text-sm bg-white p-2 rounded overflow-x-auto max-h-40">
                  {JSON.stringify(testResults.response, null, 2)}
                </pre>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-indigo-100 border border-indigo-400 rounded">
                <h3 className="font-bold text-indigo-800">Fetched Livestock Data</h3>
                <pre className="mt-2 text-sm bg-white p-2 rounded overflow-x-auto max-h-40">
                  {JSON.stringify(testResults.fetchedLivestock, null, 2)}
                </pre>
              </div>
              
              <div className="p-4 bg-teal-100 border border-teal-400 rounded">
                <h3 className="font-bold text-teal-800">Livestock Statistics</h3>
                <pre className="mt-2 text-sm bg-white p-2 rounded overflow-x-auto max-h-40">
                  {JSON.stringify(testResults.livestockStats, null, 2)}
                </pre>
              </div>
              
              <div className="p-4 bg-pink-100 border border-pink-400 rounded">
                <h3 className="font-bold text-pink-800">Fetched Questionnaires</h3>
                <pre className="mt-2 text-sm bg-white p-2 rounded overflow-x-auto max-h-40">
                  {JSON.stringify(testResults.fetchedQuestionnaires, null, 2)}
                </pre>
              </div>
              
              <div className="p-4 bg-orange-100 border border-orange-400 rounded">
                <h3 className="font-bold text-orange-800">Fetched Responses</h3>
                <pre className="mt-2 text-sm bg-white p-2 rounded overflow-x-auto max-h-40">
                  {JSON.stringify(testResults.fetchedResponses, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
        
        {!testResults && !error && !loading && (
          <div className="text-gray-600">
            <p>Click the button above to run MongoDB integration tests.</p>
            <p className="mt-2">This will test:</p>
            <ul className="list-disc list-inside mt-2">
              <li>User creation and management</li>
              <li>Livestock data creation and retrieval</li>
              <li>Livestock statistics calculation</li>
              <li>Questionnaire creation and management</li>
              <li>Questionnaire response submission and retrieval</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}