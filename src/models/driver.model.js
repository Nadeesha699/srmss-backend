
const db = require("../../config/db");

const Driver = {
  async findAll() {
    const [rows] = await db.execute(`
      SELECT
        dr.*,
        d.name AS depot_name
      FROM drivers dr
      LEFT JOIN depots d ON dr.depot_id = d.id
      ORDER BY dr.id DESC
    `);

    return rows;
  },

  async findById(id) {
    const [rows] = await db.execute(
      `SELECT dr.*, d.name AS depot_name
       FROM drivers dr
       LEFT JOIN depots d ON dr.depot_id = d.id
       WHERE dr.id = ?`,
      [id]
    );

    return rows[0] || null;
  },

  async findByEmployeeNo(employeeNo) {
    const [rows] = await db.execute(
      "SELECT id FROM drivers WHERE employee_no = ?",
      [employeeNo]
    );

    return rows[0] || null;
  },

  async findByLicenseNo(licenseNo) {
    const [rows] = await db.execute(
      "SELECT id FROM drivers WHERE license_no = ?",
      [licenseNo]
    );

    return rows[0] || null;
  },

  async create(data) {
    const [result] = await db.execute(
      `INSERT INTO drivers
       (employee_no, name, phone, license_no, license_expiry,
        depot_id, working_hours, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.employee_no,
        data.name,
        data.phone || null,
        data.license_no,
        data.license_expiry,
        data.depot_id || null,
        data.working_hours ?? 0,
        data.status || "AVAILABLE",
      ]
    );

    return this.findById(result.insertId);
  },

  async update(id, data) {
    await db.execute(
      `UPDATE drivers
       SET employee_no = ?,
           name = ?,
           phone = ?,
           license_no = ?,
           license_expiry = ?,
           depot_id = ?,
           working_hours = ?
       WHERE id = ?`,
      [
        data.employee_no,
        data.name,
        data.phone || null,
        data.license_no,
        data.license_expiry,
        data.depot_id || null,
        data.working_hours ?? 0,
        id,
      ]
    );

    return this.findById(id);
  },

  async updateStatus(id, status) {
    await db.execute(
      "UPDATE drivers SET status = ? WHERE id = ?",
      [status, id]
    );

    return this.findById(id);
  },

  async delete(id) {
    const [result] = await db.execute(
      "DELETE FROM drivers WHERE id = ?",
      [id]
    );

    return result.affectedRows > 0;
  },
};

module.exports = Driver;