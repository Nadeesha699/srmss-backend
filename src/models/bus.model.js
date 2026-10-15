
const db = require("../../config/db");

const Bus = {
  async findAll() {
    const [rows] = await db.execute(`
      SELECT 
        b.id,
        b.registration_no,
        b.capacity,
        b.service_type AS serviceType,
        b.depot_id,
        b.mileage,
        b.status,
        b.created_at,
        b.updated_at,
        d.name AS depot_name
      FROM buses b
      LEFT JOIN depots d
        ON b.depot_id = d.id
      ORDER BY b.id DESC
    `);

    return rows;
  },

  // =========================================================
  // GET BUS BY ID
  // =========================================================
  async findById(id) {
    const [rows] = await db.execute(
      `
      SELECT
        b.id,
        b.registration_no,
        b.capacity,
        b.service_type AS serviceType,
        b.depot_id,
        b.mileage,
        b.status,
        b.created_at,
        b.updated_at,
        d.name AS depot_name
      FROM buses b
      LEFT JOIN depots d
        ON b.depot_id = d.id
      WHERE b.id = ?
      `,
      [id],
    );

    return rows[0];
  },

  // =========================================================
  // FIND BUS BY REGISTRATION NUMBER
  // =========================================================
  async findByRegistration(registrationNo) {
    const [rows] = await db.execute(
      `
      SELECT
        b.id,
        b.registration_no,
        b.capacity,
        b.service_type AS serviceType,
        b.depot_id,
        b.mileage,
        b.status,
        b.created_at,
        b.updated_at,
        d.name AS depot_name
      FROM buses b
      LEFT JOIN depots d
        ON b.depot_id = d.id
      WHERE b.registration_no = ?
      `,
      [registrationNo],
    );

    return rows[0];
  },

  async create(data) {
    const [result] = await db.execute(
      `
      INSERT INTO buses
      (
        registration_no,
        capacity,
        service_type,
        depot_id,
        mileage,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        data.registration_no,
        data.capacity,
        data.service_type,
        data.depot_id,
        data.mileage ?? 0,
        data.status ?? "AVAILABLE",
      ],
    );

    return result.insertId;
  },

  async update(id, data) {
    const [result] = await db.execute(
      `
      UPDATE buses
      SET
        registration_no = ?,
        capacity = ?,
        service_type = ?,
        depot_id = ?,
        mileage = ?,
        status = ?
      WHERE id = ?
      `,
      [
        data.registration_no,
        data.capacity,
        data.service_type,
        data.depot_id,
        data.mileage ?? 0,
        data.status,
        id,
      ],
    );

    return result.affectedRows;
  },

  // =========================================================
  // DELETE BUS
  // =========================================================
  async delete(id) {
    const [result] = await db.execute(
      `
      DELETE FROM buses
      WHERE id = ?
      `,
      [id],
    );

    return result.affectedRows;
  },

  // =========================================================
  // FIND AVAILABLE BUSES
  // Used by Supervisor Assignment
  // =========================================================
  async findAvailable() {
    const [rows] = await db.execute(`
      SELECT
        b.id,
        b.registration_no,
        b.capacity,
        b.service_type AS serviceType,
        b.depot_id,
        b.mileage,
        b.status,
        d.name AS depot_name
      FROM buses b
      LEFT JOIN depots d
        ON b.depot_id = d.id
      WHERE b.status IN ('AVAILABLE', 'ACTIVE')
      ORDER BY b.registration_no ASC
    `);

    return rows;
  },

  async updateStatus(id, status) {
  const sql = `
    UPDATE buses
    SET status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  const [result] = await db.execute(sql, [status, id]);

  if (result.affectedRows === 0) {
    throw new Error("Bus not found");
  }

  return this.findById(id);
},
};

module.exports = Bus;

