import { useState } from "react";
import { BsX } from "react-icons/bs";

type Item = {
  id: string;
  content: string;
  isComplete: boolean;
};

export function useLocalStorage<T>(key: string, initialValue: T) {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(error);
            return initialValue;
        }
    });

    useEffect(() => {
        try {
          localStorage.setItem(key, JSON.stringify(storedValue));
        } catch (error) {
          console.error("Error setting localStorage key:", key, error);
        }
      }, [key, storedValue]);
    
      return [storedValue, setStoredValue] as const;
    }


export function useTodo(){
    const [inputValue, setInputValue] = useState("");
   const [storedList, setStoredList] = useLocalStorage<Item[]>("todoList", []);
   const hasCompleted = storedList.some((el) => el.isComplete);
   
    function addTask () {
        const value = inputValue.trim();
        if (!value) return; // prevent adding empty tasks
        const id = crypto.randomUUID();
        setStoredList((prev) => [...prev, { id, content: value, isComplete: false }]);
        setInputValue("");
    }

    function deleteTask(id:string) {
        setStoredList((prev) => prev.filter((el)=>  el.id !== id));
    }

    function toggleTaskCompletion(id:string) {
        setStoredList((prev) =>
            prev.map((el) =>
                el.id === id ? { ...el, isComplete: !el.isComplete } : el,
            ),
        );
    }

    function clearCompletedTasks() {
        setStoredList((prev) => prev.filter((el) => !el.isComplete));
    }


    return {
        storedList,
    inputValue,
    setInputValue,
    hasCompleted,
    addTask,
    deleteTask,
    toggleTaskCompletion,
    clearCompletedTasks,
    }
}

export default function App() {

    const {   storedList,
        inputValue,
        setInputValue,
        hasCompleted,
        addTask,
        deleteTask,
        toggleTaskCompletion,
        clearCompletedTasks } = useTodo();
  

        const handleAddTask = (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            addTask();
          };

   

 

  return (
    <main className="max-w-md mx-auto bg-white shadow-lg rounded-lg overflow-hidden mt-16 p-8 flex flex-col gap-4 items-end">
      <h1 className="text-gray-800 font-bold text-3xl w-full">ToDo List</h1>

      <form
        onSubmit={handleAddTask}
        aria-label="Add task form"
        className="flex items-center border-b-2 border-teal-500 py-2 w-full"
      >
          <input
          aria-label="Task name"
          name="task"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none"
          type="text"
          placeholder="Add a task"
        />

        <button
          type="submit"
          className="flex-shrink-0 bg-teal-500 hover:bg-teal-700 transition-colors text-sm text-white py-2 px-4 rounded-2xl cursor-pointer"
        >
          Add
        </button>
      </form>

      <ul className="divide-y divide-gray-200 w-full">
        {list.map((el) => (
          <li className="py-4" key={el.id}>
            <div className="flex items-center justify-between">
              <label className="text-gray-900 flex items-center gap-2 grow">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded cursor-pointer"
                  checked={el.isComplete}
                  onChange={() => toggleTaskCompletion(el.id)}
                />
                <span
                  className={`text-lg font-medium ${
                    el.isComplete ? "line-through" : ""
                  }`}
                >
                  {el.content}
                </span>
              </label>

              <button
                onClick={() => deleteTask(el.id)}
                className="cursor-pointer text-gray-600 hover:scale-110 transition-transform"
                aria-label="delete task"
              >
                <BsX className="size-7" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {hasCompleted && (
        <button
          className="flex-shrink-0 bg-teal-500 hover:bg-teal-700 transition-colors text-sm text-white py-2 px-4 rounded-2xl cursor-pointer"
          onClick={clearCompletedTasks}
        >
          Clear complete
        </button>
      )}
    </main>
  );
}
