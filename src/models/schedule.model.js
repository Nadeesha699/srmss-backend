
const db = require("../../config/db");

const ScheduleModel = {
  // Get all schedules with route and depot details
  async findAll() {
    const [rows] = await db.execute(`
      SELECT
        s.id,
        s.schedule_code,
        s.route_id,
        s.depot_id,
        s.schedule_date,
        s.departure_time,
        s.arrival_time,
        s.status,
        s.created_at,
        s.updated_at,

        r.route_code,
        r.name AS route_name,
        r.start_point,
        r.end_point,

        d.name AS depot_name

      FROM schedules s

      LEFT JOIN routes r
        ON s.route_id = r.id

      LEFT JOIN depots d
        ON s.depot_id = d.id

      ORDER BY
        s.schedule_date DESC,
        s.departure_time ASC
    `);

    return rows;
  },

  // Get schedule by ID
  async findById(id) {
    const [rows] = await db.execute(
      `
      SELECT
        s.id,
        s.schedule_code,
        s.route_id,
        s.depot_id,
        s.schedule_date,
        s.departure_time,
        s.arrival_time,
        s.status,
        s.created_at,
        s.updated_at,

        r.route_code,
        r.name AS route_name,
        r.start_point,
        r.end_point,

        d.name AS depot_name

      FROM schedules s

      LEFT JOIN routes r
        ON s.route_id = r.id

      LEFT JOIN depots d
        ON s.depot_id = d.id

      WHERE s.id = ?
      `,
      [id]
    );

    return rows[0] || null;
  },

  // Create schedule
  async create(data) {
    const [result] = await db.execute(
      `
      INSERT INTO schedules (
        schedule_code,
        route_id,
        depot_id,
        schedule_date,
        departure_time,
        arrival_time,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        data.schedule_code,
        Number(data.route_id),
        Number(data.depot_id),
        data.schedule_date,
        data.departure_time,
        data.arrival_time,
        data.status || "SCHEDULED",
      ]
    );

    return result.insertId;
  },

  // Update schedule
  async update(id, data) {
    const [result] = await db.execute(
      `
      UPDATE schedules
      SET
        schedule_code = ?,
        route_id = ?,
        depot_id = ?,
        schedule_date = ?,
        departure_time = ?,
        arrival_time = ?,
        status = ?
      WHERE id = ?
      `,
      [
        data.schedule_code,
        Number(data.route_id),
        Number(data.depot_id),
        data.schedule_date,
        data.departure_time,
        data.arrival_time,
        data.status || "SCHEDULED",
        id,
      ]
    );

    return result.affectedRows;
  },

  // Delete schedule
  async delete(id) {
    const [result] = await db.execute(
      `
      DELETE FROM schedules
      WHERE id = ?
      `,
      [id]
    );

    return result.affectedRows;
  },

  // Update schedule status
  async updateStatus(id, status) {
    const [result] = await db.execute(
      `
      UPDATE schedules
      SET status = ?
      WHERE id = ?
      `,
      [status, id]
    );

    return result.affectedRows;
  },
};

module.exports = ScheduleModel;