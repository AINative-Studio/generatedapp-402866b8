import React, { useState, useCallback } from 'react';
import { useMemory } from '@ainative/react-sdk';

export default function Dashboard() {
  const { memories, isLoading, error, remember, recall } = useMemory();
  const [input, setInput] = useState('');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleRemember = useCallback(async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    await remember(input, { tags: ['dashboard'] });
    setInput('');
  }, [input, remember]);

  const handleRecall = useCallback(async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    const found = await recall(query);
    setResults(found);
  }, [query, recall]);

  return (
    <div data-testid="dashboard-container" className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error.message}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Entry</h3>
        <form onSubmit={handleRemember} className="flex gap-3">
          <input
            data-testid="dashboard-input"
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Enter content..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            Save
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Search</h3>
        <form onSubmit={handleRecall} className="flex gap-3">
          <input
            data-testid="dashboard-search"
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search entries..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="px-6 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            Search
          </button>
        </form>
        {results.length > 0 && (
          <ul className="mt-4 space-y-2">
            {results.map(r => (
              <li key={r.id} className="p-3 bg-gray-50 rounded-lg text-gray-700 text-sm">
                {r.content}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Recent Entries
          {isLoading && <span className="ml-2 text-sm text-gray-400 font-normal">Loading...</span>}
        </h3>
        {memories.length === 0 && !isLoading && (
          <p className="text-gray-400 text-sm">No entries yet. Add one above.</p>
        )}
        <ul className="space-y-2">
          {memories.slice(0, 10).map(m => (
            <li key={m.id} className="p-3 bg-gray-50 rounded-lg text-gray-700 text-sm border border-gray-100">
              {m.content}
              <span className="ml-2 text-xs text-gray-400">
                {new Date(m.created_at).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
