'use client';

import { useState, useEffect } from 'react';

export default function TestApiPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/test-api');
        const data = await response.json();
        setUsers(data.users || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Test API</h1>
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Users in Database:</h2>
        {users.length === 0 ? (
          <p>No users found</p>
        ) : (
          <ul className="list-disc pl-5">
            {users.map((user, index) => (
              <li key={index}>
                Username: {user.username}, Role: {user.role}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}