
const db = require("../../config/db");

const Trip = {
  /* =========================================================
     GET ALL TRIPS
  ========================================================= */

  async findAll() {
    const [rows] = await db.execute(`
      SELECT
        t.id,
        t.schedule_id,
        t.assignment_id,
        t.status,
        t.actual_start_time,
        t.actual_end_time,
        t.created_at,
        t.updated_at,

        /* Schedule */
        s.schedule_code,
        s.schedule_date,
        s.departure_time,
        s.arrival_time,

        /* Route */
        r.id AS route_id,
        r.route_code,
        r.name AS route_name,
        r.start_point AS origin,
        r.end_point AS destination,

        /* Assignment */
        a.bus_id,
        a.staff_id,
        a.assigned_by,
        a.status AS assignment_status,

        /* Bus */
        b.registration_no,

        /* Operational Staff */
        u.name AS staff_name,
        u.email AS staff_email,

        /* Depot */
        dp.id AS depot_id,
        dp.name AS depot_name

      FROM trips t

      INNER JOIN schedules s
        ON t.schedule_id = s.id

      INNER JOIN routes r
        ON s.route_id = r.id

      LEFT JOIN assignments a
        ON t.assignment_id = a.id

      LEFT JOIN buses b
        ON a.bus_id = b.id

      LEFT JOIN users u
        ON a.staff_id = u.id

      LEFT JOIN depots dp
        ON b.depot_id = dp.id

      ORDER BY
        s.schedule_date DESC,
        s.departure_time DESC
    `);

    return rows;
  },

  /* =========================================================
     GET TRIP BY ID
  ========================================================= */

  async findById(id) {
    const [rows] = await db.execute(
      `
      SELECT
        t.id,
        t.schedule_id,
        t.assignment_id,
        t.status,
        t.actual_start_time,
        t.actual_end_time,
        t.created_at,
        t.updated_at,

        /* Schedule */
        s.schedule_code,
        s.schedule_date,
        s.departure_time,
        s.arrival_time,

        /* Route */
        r.id AS route_id,
        r.route_code,
        r.name AS route_name,
        r.start_point AS origin,
        r.end_point AS destination,

        /* Assignment */
        a.bus_id,
        a.staff_id,
        a.assigned_by,
        a.status AS assignment_status,

        /* Bus */
        b.registration_no,

        /* Operational Staff */
        u.name AS staff_name,
        u.email AS staff_email,

        /* Depot */
        dp.id AS depot_id,
        dp.name AS depot_name

      FROM trips t

      INNER JOIN schedules s
        ON t.schedule_id = s.id

      INNER JOIN routes r
        ON s.route_id = r.id

      LEFT JOIN assignments a
        ON t.assignment_id = a.id

      LEFT JOIN buses b
        ON a.bus_id = b.id

      LEFT JOIN users u
        ON a.staff_id = u.id

      LEFT JOIN depots dp
        ON b.depot_id = dp.id

      WHERE t.id = ?
      `,
      [id]
    );

    return rows[0];
  },

  /* =========================================================
     CREATE TRIP
  ========================================================= */

  async create(data) {
    const [result] = await db.execute(
      `
      INSERT INTO trips
      (
        schedule_id,
        assignment_id,
        status
      )
      VALUES (?, ?, ?)
      `,
      [
        data.schedule_id,
        data.assignment_id,
        data.status || "SCHEDULED",
      ]
    );

    return result.insertId;
  },

  /* =========================================================
     UPDATE TRIP
  ========================================================= */

  async update(id, data) {
    const [result] = await db.execute(
      `
      UPDATE trips
      SET status = ?,
          actual_start_time = ?,
          actual_end_time = ?
      WHERE id = ?
      `,
      [
        data.status,
        data.actual_start_time || null,
        data.actual_end_time || null,
        id,
      ]
    );

    return result.affectedRows;
  },

  /* =========================================================
     UPDATE TRIP STATUS
  ========================================================= */

  async updateStatus(id, data) {
    const [result] = await db.execute(
      `
      UPDATE trips
      SET status = ?,
          actual_start_time = ?,
          actual_end_time = ?
      WHERE id = ?
      `,
      [
        data.status,
        data.actual_start_time || null,
        data.actual_end_time || null,
        id,
      ]
    );

    return result.affectedRows;
  },
};

module.exports = Trip;
