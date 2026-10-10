
const db = require("../../config/db");

const Delay = {
  // Get all delay reports
  async findAll() {
    const [rows] = await db.execute(`
      SELECT
        dl.id,
        dl.trip_id,
        dl.delay_minutes,
        dl.reason,
        dl.notes,
        dl.recorded_by,
        dl.recorded_at,
        t.status AS trip_status,
        u.name AS recorded_by_name
      FROM delays dl
      INNER JOIN trips t ON dl.trip_id = t.id
      LEFT JOIN users u ON dl.recorded_by = u.id
      ORDER BY dl.recorded_at DESC
    `);

    return rows;
  },

  // Get reports belonging to a particular user
  async findByUserId(userId) {
    const [rows] = await db.execute(
      `
      SELECT
        dl.id,
        dl.trip_id,
        dl.delay_minutes,
        dl.reason,
        dl.notes,
        dl.recorded_by,
        dl.recorded_at,
        t.status AS trip_status,
        u.name AS recorded_by_name
      FROM delays dl
      INNER JOIN trips t ON dl.trip_id = t.id
      LEFT JOIN users u ON dl.recorded_by = u.id
      WHERE dl.recorded_by = ?
      ORDER BY dl.recorded_at DESC
      `,
      [userId]
    );

    return rows;
  },

  // Get one report
  async findById(id) {
    const [rows] = await db.execute(
      `
      SELECT
        dl.id,
        dl.trip_id,
        dl.delay_minutes,
        dl.reason,
        dl.notes,
        dl.recorded_by,
        dl.recorded_at,
        t.status AS trip_status,
        u.name AS recorded_by_name
      FROM delays dl
      INNER JOIN trips t ON dl.trip_id = t.id
      LEFT JOIN users u ON dl.recorded_by = u.id
      WHERE dl.id = ?
      LIMIT 1
      `,
      [id]
    );

    return rows[0] || null;
  },

  // Create a report
  async create(data) {
    const [result] = await db.execute(
      `
      INSERT INTO delays (
        trip_id,
        delay_minutes,
        reason,
        notes,
        recorded_by
      )
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        data.trip_id,
        data.delay_minutes,
        data.reason,
        data.notes || null,
        data.recorded_by,
      ]
    );

    return result.insertId;
  },

  // Update a report
  async update(id, data) {
    const [result] = await db.execute(
      `
      UPDATE delays
      SET
        delay_minutes = ?,
        reason = ?,
        notes = ?
      WHERE id = ?
      `,
      [
        data.delay_minutes,
        data.reason,
        data.notes || null,
        id,
      ]
    );

    return result.affectedRows;
  },

  // Delete a report
  async delete(id) {
    const [result] = await db.execute(
      "DELETE FROM delays WHERE id = ?",
      [id]
    );

    return result.affectedRows;
  },
};

module.exports = Delay;