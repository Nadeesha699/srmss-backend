const db = require("../../config/db");

const Maintenance = {
  async findAll() {
    const [rows] = await db.execute(`
      SELECT
        m.*,
        b.registration_no,
        u.name AS recorded_by_name
      FROM maintenance_logs m
      LEFT JOIN buses b ON m.bus_id = b.id
      LEFT JOIN users u ON m.recorded_by = u.id
      ORDER BY m.service_date DESC, m.id DESC
    `);

    return rows;
  },

  async findById(id) {
    const [rows] = await db.execute(
      `
      SELECT
        m.*,
        b.registration_no,
        u.name AS recorded_by_name
      FROM maintenance_logs m
      LEFT JOIN buses b ON m.bus_id = b.id
      LEFT JOIN users u ON m.recorded_by = u.id
      WHERE m.id = ?
      `,
      [id]
    );

    return rows[0] || null;
  },

  async create(data) {
    const [result] = await db.execute(
      `
      INSERT INTO maintenance_logs
        (
          trip_id,
          bus_id,
          maintenance_type,
          description,
          service_date,
          cost,
          status,
          recorded_by
        )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        data.trip_id || null,
        data.bus_id,
        data.maintenance_type,
        data.description || null,
        data.service_date,
        data.cost ?? 0,
        data.status || "PENDING",
        data.recorded_by ?? null,
      ]
    );

    return this.findById(result.insertId);
  },

  async update(id, data) {
    await db.execute(
      `
      UPDATE maintenance_logs
      SET
        trip_id = ?,
        bus_id = ?,
        maintenance_type = ?,
        description = ?,
        service_date = ?,
        cost = ?,
        status = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [
        data.trip_id || null,
        data.bus_id,
        data.maintenance_type,
        data.description || null,
        data.service_date,
        data.cost ?? 0,
        data.status || "PENDING",
        id,
      ]
    );

    return this.findById(id);
  },

  async updateStatus(id, status) {
    await db.execute(
      `
      UPDATE maintenance_logs
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [status, id]
    );

    return this.findById(id);
  },

  async delete(id) {
    const [result] = await db.execute(
      "DELETE FROM maintenance_logs WHERE id = ?",
      [id]
    );

    return result.affectedRows > 0;
  },
};

module.exports = Maintenance;