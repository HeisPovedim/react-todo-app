import React, { useEffect, useState } from "react";
import axios from "axios";

import TodoList from "./components/ui/todolist/TodoList";
import getRealTime from "./utils/get-real-time";

import "./App.scss";

interface Item {
  id: number;
  task: string;
  status: boolean;
}

function App(): JSX.Element {
  const [items, setItems] = useState<Item[]>([]);
  const [task, setTask] = useState<string>("");

  // GET CURRENT TIME
  const [currentTime, setCurrentTime] = useState<string>(
    new Date().toLocaleTimeString()
  );
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // GET TODO LIST
  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const response = await axios.get<Item[]>("http://localhost:3001/tasks");
    console.log(response.data);
    setItems(response.data);
  };

  // Добавление задачи
  const addItem = async () => {
    if (task) {
      await axios.post<Item>("http://localhost:3001/tasks", { task });
      fetchItems();
      setTask("");
    }
  };

  // Удаление задачи
  const deleteItem = async (id: number) => {
    await axios.delete(`http://localhost:3001/tasks/${id}`);
    fetchItems();
  };

  // Изменение статуса задачи
  const toggleTaskStatus = async (id: number, currentStatus: boolean) => {
    await axios.patch(`http://localhost:3001/tasks/${id}`, {
      status: !currentStatus,
    });
    fetchItems();
  };

  return (
    <div className="app">
      <span className="text-white text-xl">{currentTime}</span>
      <h1 className="text-[2rem] text-[white] font-bold">To Do List 📜</h1>
      <div className="app__add-task mt-[28px] w-full flex justify-center gap-[24px]">
        <input
          className="app__add-task_input py-[10px] pl-[20px] w-full max-w-[400px]"
          type="text"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="Добавить новую задачу ✏️"
        />
        <button className="app__add-task_button p-[10px]" onClick={addItem}>
          Добавить 📌
        </button>
      </div>
      <div className="app__tasks w-full max-w-[550px] py-[18px] px-[22px] mt-[24px]">
        <ul className="app__tasks_list flex flex-col gap-[10px]">
          {items.map((item) => (
            <div key={item.id} className="flex flex-row gap-[10px]">
              <input
                className="app__tasks_status"
                type="checkbox"
                id="status"
                defaultChecked={!item.status}
                onChange={() => toggleTaskStatus(item.id, item.status)}
              />
              <label htmlFor="status"></label>
              <li className="app__tasks_task w-full py-[10px] flex justify-center gap-2">
                <span className={item.status ? "" : "line-through"}>
                  {item.task}
                </span>
              </li>
              <button onClick={() => deleteItem(item.id)}>❌</button>
            </div>
          ))}
        </ul>
      </div>
    </div>
  );
}
export default App;
