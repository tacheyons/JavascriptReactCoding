import React, { useState } from "react";

export default function App() {
  const [results, setResults] = useState([]);
  const [terms, setTerms] = useState([]);

  async function handleSubmit(e) {
    e.preventDefault();
    const searchTerm = e.currentTarget.elements[0].value;
    if (!searchTerm) return;

    try {
      const response = await fetch(
        `https://en.wikipedia.org/w/api.php?action=opensearch&format=json&origin=*&search=${searchTerm}`
      );
      const data = await response.json();
      setResults(data[1].map((title, index) => ({ title, url: data[3][index] })));
      setTerms((prevTerms) => [...prevTerms, { term: searchTerm, time: new Date() }].slice(-5));
    } catch (error) {
      console.error("Error fetching wiki data:", error);
    }
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-dvh bg-gray-100 p-4">
      <div className="flex flex-col gap-8 w-full max-w-2xl">
        <h1 className="text-3xl font-semibold text-gray-700">Wiki fetching</h1>

        <form
          onSubmit={handleSubmit}
          className="p-8 rounded-2xl shadow-md flex flex-col border border-neutral-200"
        >
          <label htmlFor="search" className="text-xl font-medium text-gray-600 mb-2">
            Search:
          </label>

          <div className="flex">
            <input
              id="search"
              className="grow font-light rounded-l-lg border-gray-300 border px-4 py-2"
            />

            <button
              type="submit"
              className="bg-teal-500 text-white px-4 py-2 rounded-r-lg hover:bg-teal-600 transition-colors cursor-pointer"
            >
              Submit
            </button>
          </div>
        </form>

        <div className="grid grid-cols-2 gap-8 border p-8 border-neutral-200 rounded-2xl shadow-md min-h-96">
          <div>
            <h2 className="text-2xl mb-4">Results</h2>
            {results.length === 0 ? (
              <p className="text-gray-500">No results yet.</p>
            ) : (
              <ul>
                {results.map((result, index) => (
                  <li key={index}>
                    <a
                      href={result.url}
                      className="underline text-blue-500 hover:text-blue-700"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {result.title}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h2 className="text-2xl mb-4">Last 5 terms</h2>
            {terms.length === 0 ? (
              <p className="text-gray-500">No terms yet.</p>
            ) : (
              <ul>
                {terms.map((term, index) => (
                  <li key={index} className="gap-2 flex">
                    <span className="font-medium">{term.term}</span>
                    <span className="font-light">{term.time.toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}