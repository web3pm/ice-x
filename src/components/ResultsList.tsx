import React from 'react';

interface Result {
  name: string;
  explanation: string;
}

interface ResultsListProps {
  title: string;
  results: Result[];
  isLoading: boolean;
}

const ResultsList = ({ title, results, isLoading }: ResultsListProps) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="loading-spinner" />
        <p className="mt-4 text-muted-foreground">Analyzing network data...</p>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="results-container">
        {results.map((result, index) => (
          <div key={index} className="result-card">
            <h3 className="font-medium">{result.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{result.explanation}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultsList;