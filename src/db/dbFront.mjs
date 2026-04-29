/*import { pool } from "./db.mjs"
export async function getShaTasks(userId) {
    return await pool.query('SELECT job_id, status, is_right FROM sha_tasks WHERE user_id=$1', [userId])
}

export async function getTriggeredTasks(userId) {
    return await pool.query('SELECT job_id, status, is_right FROM triggered_tasks WHERE user_id=$1', [userId])
}

export async function getPeriodicTasks(userId) {
    return await pool.query('SELECT job_id, status, is_right FROM periodic_tasks WHERE user_id=$1', [userId])
}

export async function getUserStats(userId) {
    const res = await pool.query(`
        SELECT 
            count_periodic_tasks,
            count_right_periodic_tasks,
            count_triggered_tasks,
            count_right_triggered_tasks,
            count_sha_tasks,
            count_right_sha_tasks
        FROM users
        WHERE id = $1
    `, [userId]);

    const row = res.rows[0];

    if (!row) return { total_tasks: 0, done_tasks: 0, success_tasks: 0, sha_tasks: 0, triggered_tasks: 0, periodic_tasks: 0 };

    return {
        total_tasks: row.count_sha_tasks + row.count_triggered_tasks + row.count_periodic_tasks,
        done_tasks: row.count_sha_tasks + row.count_triggered_tasks + row.count_periodic_tasks,
        success_tasks: row.count_right_sha_tasks + row.count_right_triggered_tasks + row.count_right_periodic_tasks,
        
        // ✅ Добавляем детальные счетчики
        sha_tasks: row.count_sha_tasks,
        triggered_tasks: row.count_triggered_tasks,
        periodic_tasks: row.count_periodic_tasks
    };
} */
