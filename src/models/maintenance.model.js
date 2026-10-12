const db = require("../../config/db");

const Maintenance = {
  async findAll() {
    const [rows] = await db.execute(`
      SELECT
        m.*,
        b.registration_no,
        b.depot_id,
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
        b.depot_id,
        u.name AS recorded_by_name
      FROM maintenance_logs m
      LEFT JOIN buses b ON m.bus_id = b.id
      LEFT JOIN users u ON m.recorded_by = u.id
      WHERE m.id = ?
      `,
      [id],
    );

    return rows[0] || null;
  },

  async create(data) {
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      // 1. Check and lock the bus
      const [buses] = await connection.execute(
        `SELECT id, status
       FROM buses
       WHERE id = ?
       FOR UPDATE`,
        [data.bus_id],
      );

      if (buses.length === 0) {
        throw new Error("Bus not found");
      }

      const bus = buses[0];

      // 2. Insert maintenance record
      const [result] = await connection.execute(
        `INSERT INTO maintenance_logs (
        trip_id,
        bus_id,
        maintenance_type,
        description,
        service_date,
        cost,
        status,
        recorded_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.trip_id || null,
          data.bus_id,
          data.maintenance_type,
          data.description || null,
          data.service_date,
          data.cost ?? 0,
          data.status || "REPORTED",
          data.recorded_by ?? null,
        ],
      );

      // 3. Take bus out of service when maintenance is required
      if (["REPORTED", "IN_PROGRESS"].includes(data.status || "REPORTED")) {
        await connection.execute(
          `UPDATE buses
         SET status = 'MAINTENANCE'
         WHERE id = ?
           AND status IN ('AVAILABLE', 'ASSIGNED')`,
          [data.bus_id],
        );
      }

      await connection.commit();

      return this.findById(result.insertId);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
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
      ],
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
      [status, id],
    );

    return this.findById(id);
  },

  async delete(id) {
    const [result] = await db.execute(
      "DELETE FROM maintenance_logs WHERE id = ?",
      [id],
    );

    return result.affectedRows > 0;
  },
};

module.exports = Maintenance;
