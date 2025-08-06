import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <h1 className="text-3xl font-bold text-gray-900">CoffeeChat</h1>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Welcome to CoffeeChat
          </h2>
          <p className="text-gray-600">
            Connect with Cornell students for peer-to-peer learning.
          </p>
        </div>
      </main>
    </div>
  );
}

export default App
