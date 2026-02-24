import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

export const pool = new Pool({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  port: process.env.PORT,
  ssl: false
})

export async function initDB() {

  // users
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      password VARCHAR(255),
      count_periodic_tasks INT,
      count_right_periodic_tasks INT,
      count_triggered_tasks INT,
      count_right_triggered_tasks INT,
      count_sha_tasks INT,
      count_right_sha_tasks INT
    )
  `)

// await pool.query(`ALTER TABLE sha_tasks ADD COLUMN number_id SERIAL UNIQUE`)

  // periodic
  await pool.query(`
    CREATE TABLE IF NOT EXISTS periodic_tasks (
    job_id VARCHAR PRIMARY KEY,
    number INTEGER,
    result BOOLEAN DEFAULT FALSE,
    status BOOLEAN DEFAULT FALSE,
    is_right BOOLEAN DEFAULT FALSE,
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES users(id),
    task_time FLOAT,
    number_id SERIAL UNIQUE
    )
    `)

  // triggered
  await pool.query(`
    CREATE TABLE IF NOT EXISTS triggered_tasks (
    job_id VARCHAR PRIMARY KEY,
    difficulty INT,
    range INTEGER,
    count INTEGER,
    sum INTEGER,
    status BOOLEAN DEFAULT FALSE,
    is_right BOOLEAN DEFAULT FALSE,
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES users(id),
    task_time FLOAT,
    number_id SERIAL UNIQUE
    )
    `)
  // sha
  await pool.query(`
    CREATE TABLE IF NOT EXISTS sha_tasks (
      job_id VARCHAR PRIMARY KEY,
      text TEXT,
      difficulty INT,
      prefix TEXT,
      status BOOLEAN DEFAULT FALSE,
      result VARCHAR(255),
      is_right BOOLEAN DEFAULT FALSE,
      user_id INT,
      FOREIGN KEY (user_id) REFERENCES users(id), 
      task_time FLOAT,
      number_id SERIAL UNIQUE
    )
  `)
    // periodoc ответы
  await pool.query(`
    CREATE TABLE IF NOT EXISTS periodic_right_answers (
      periodic_right INT[]
    )
  `)
  // triggered ответы
    await pool.query(`
    CREATE TABLE IF NOT EXISTS triggered_right_answers (
      difficulty INT,
      right_count INT,
      right_sum INT
    )
  `)

  console.log('Таблицы созданы')
}
// проверка пользователя


