import { useEffect,useState } from "react";

function useLocalStorage(key, intialValue) {
    const [value,setValue] = useState(() => {
        const savedValue = localStorage.getItem(key);

        if (savedValue !== null) {
            return JSON.parse(savedValue);
        }

        return intialValue;
    });

    useEffect(() => {
        localStorage.setItem(
            key,
            JSON.stringify(value)
        );
    },[key, value]);
  return [value,setValue];
}

export default useLocalStorage;
