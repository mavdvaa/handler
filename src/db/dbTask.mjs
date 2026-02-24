import { pool } from "./db.mjs"
export async function shaTaskDb(userId, text, difficulty, jobId) {
    const shaTable = await pool.query(`
    INSERT INTO sha_tasks (user_id, text, difficulty, job_id)
    VALUES ($1, $2, $3, $4)
    RETURNING *`,
    [userId, text, difficulty, jobId])
    
}

export async function periodicTaskDb(userId, check, jobId) {
    const periodTable = await pool.query(`
    INSERT INTO periodic_tasks (user_id, number, job_id)
    VALUES ($1, $2, $3)
    RETURNING *`,
    [userId, check, jobId])
    
}

export async function triggeredTaskDb(userId, difficulty, range, jobId) {
    const triggeredTable = await pool.query(`
    INSERT INTO triggered_tasks (user_id, difficulty, range, job_id)
    VALUES ($1, $2, $3, $4)
    RETURNING *`,
    [userId, difficulty, range, jobId])
    
}

export async function userVerification(userId) {
  const check = await pool.query(`
    SELECT EXISTS(
    SELECT 1
    FROM users
    WHERE id = $1)`,
    [userId])

  return check.rows[0].exists
}

export async function userAuthorization(userId, hashedPassword) {
  const user = await pool.query(`
      INSERT INTO users (id, password)
      VALUES ($1, $2)
      RETURNING *`,
      [userId, hashedPassword])
}

