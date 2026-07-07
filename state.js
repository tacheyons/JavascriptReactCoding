import { BsDashLg, BsPlusLg } from "react-icons/bs";
import { useState, useRef } from "react";

export default function App() {
  const [countState, setCountState] = useState(0);
  const countRef = useRef(0);
  const [refValue, setRefValue] = useState(countRef.current); // State to reflect ref value in DOM


  const incrementState = () => {
    setCountState((prev) => prev + 1);
  };

  const decrementState = () => {
    setCountState((prev) => prev - 1);
  };


  const incrementRef = () => {
    countRef.current += 1;
    setRefValue(countRef.current); // Update state to trigger re-render
  };

  const decrementRef = () => {
    countRef.current -= 1;
    setRefValue(countRef.current); // Update state to trigger re-render
  };

  return (
    <main className="py-24 min-h-dvh bg-gray-100 p-4">
      <div className="flex flex-col gap-8 w-full max-w-xl mx-auto shadow-2xl p-8 bg-white rounded-2xl">
        <h1 className="text-4xl font-bold text-center">
          useState vs useRef counter
        </h1>

        <div className="flex items-center justify-center gap-8 py-1">
          <div className="flex flex-col gap-6 p-4 rounded-lg">
            <h2 className="text-2xl font-semibold text-center">
              Counter state
            </h2>

            <div className="flex flex-row items-center justify-center gap-4">
              <button
                className="bg-teal-500 size-12 rounded-xl hover:bg-teal-700 text-white flex items-center justify-center cursor-pointer"
                aria-label="decrement-state"
                onClick={decrementState}
              >
                <BsDashLg className="size-8" />
              </button>

              <span
                data-testid="state-value"
                className="text-2xl font-semibold"
              >
                {refValue}
              </span>

              <button
                className="bg-teal-500 size-12 rounded-xl hover:bg-teal-700 text-white flex items-center justify-center cursor-pointer"
                aria-label="increment-state"
                onClick={incrementState}
              >
                <BsPlusLg className="size-8" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-6 p-4 rounded-lg">
            <h2 className="text-2xl font-semibold text-center">Counter ref</h2>

            <div className="flex flex-row items-center justify-center gap-4">
              <button
                className="bg-teal-500 size-12 rounded-xl hover:bg-teal-700 text-white flex items-center justify-center cursor-pointer"
                aria-label="decrement-ref"
                onClick={decrementRef}
              >
                <BsDashLg className="size-8" />
              </button>

              <span data-testid="ref-value" className="text-2xl font-semibold">
                {countRef.current}
              </span>

              <button
                className="bg-teal-500 size-12 rounded-xl hover:bg-teal-700 text-white flex items-center justify-center cursor-pointer"
                aria-label="increment-ref"
                onClick={incrementRef}
              >
                <BsPlusLg className="size-8" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}