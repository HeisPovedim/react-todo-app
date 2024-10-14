import express, { Request, Response } from "express";
import { Pool } from "pg";
import cors from "cors";

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "react-todo-app",
  password: "1234",
  port: 5432,
});

// Проверка на подключение к БД
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Error connecting to the database", err);
  } else {
    console.log("Successfully connected to the database");
    console.log("Current timestamp from DB:", res.rows[0].now);
  }
});

// Получение всех записей
app.get("/tasks", async (req: Request, res: Response) => {
  const result = await pool.query("SELECT * FROM tasks");
  res.json(result.rows);
});

// Добавление новой записи
app.post("/tasks", async (req: Request, res: Response) => {
  const { task } = req.body;
  const result = await pool.query(
    "INSERT INTO tasks(task, created_at, status) VALUES($1, CURRENT_DATE, TRUE) RETURNING *",
    [task]
  );
  res.json(result.rows[0]);
});

// Удаление записи
app.delete("/tasks/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await pool.query(
    "DELETE FROM tasks WHERE id = $1 RETURNING *",
    [id]
  );
  if (result.rows.length === 0) {
    res.status(404).json({ message: "Task not found" });
  } else {
    res.json(result.rows[0]);
  }
});

// Сменяем статус задачи
app.patch("/tasks/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const result = await pool.query(
    "UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *",
    [status, id]
  );
  res.json(result.rows[0]);
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
