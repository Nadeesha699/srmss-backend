
const db = require("../../config/db");

const Fuel = {
  async findAll() {
    const [rows] = await db.execute(`
      SELECT
        f.id,
        f.bus_id,
        f.trip_id,
        f.fuel_type,
        f.fuel_date,
        f.fuel_date AS date,
        f.liters,
        f.liters AS quantity_liters,
        f.unit_price,
        f.cost,
        f.cost AS total_cost,
        f.mileage,
        f.mileage AS odometer_reading,
        f.recorded_by,
        f.recorded_by AS staff_id,
        f.created_at,
        b.registration_no,
        b.depot_id,
        u.name AS recorded_by_name
      FROM fuel_logs f
      LEFT JOIN buses b ON b.id = f.bus_id
      LEFT JOIN trips t ON t.id = f.trip_id
      LEFT JOIN users u ON u.id = f.recorded_by
      ORDER BY f.fuel_date DESC, f.id DESC
    `);

    return rows;
  },

  async findById(id) {
    const [rows] = await db.execute(
      `
      SELECT
        f.id,
        f.bus_id,
        f.trip_id,
        f.fuel_type,
        f.fuel_date,
        f.fuel_date AS date,
        f.liters,
        f.liters AS quantity_liters,
        f.unit_price,
        f.cost,
        f.cost AS total_cost,
        f.mileage,
        f.mileage AS odometer_reading,
        f.recorded_by,
        f.recorded_by AS staff_id,
        f.created_at,
        b.registration_no,
        b.depot_id,
        u.name AS recorded_by_name
      FROM fuel_logs f
      LEFT JOIN buses b ON b.id = f.bus_id
      LEFT JOIN trips t ON t.id = f.trip_id
      LEFT JOIN users u ON u.id = f.recorded_by
      WHERE f.id = ?
      `,
      [id]
    );

    return rows[0] || null;
  },

  async findByRecordedBy(userId) {
    const [rows] = await db.execute(
      `
      SELECT
        f.*,
        f.liters AS quantity_liters,
        f.cost AS total_cost,
        f.mileage AS odometer_reading,
        f.recorded_by AS staff_id,
        b.registration_no
      FROM fuel_logs f
      LEFT JOIN buses b ON b.id = f.bus_id
      LEFT JOIN trips t ON t.id = f.trip_id
      WHERE f.recorded_by = ?
      ORDER BY f.fuel_date DESC, f.id DESC
      `,
      [userId]
    );

    return rows;
  },

  async create(data) {
    const [result] = await db.execute(
      `
      INSERT INTO fuel_logs (
        bus_id,
        trip_id,
        fuel_type,
        fuel_date,
        liters,
        unit_price,
        cost,
        mileage,
        recorded_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        data.bus_id,
        data.trip_id ?? null,
        data.fuel_type || "DIESEL",
        data.fuel_date,
        data.liters,
        data.unit_price,
        data.cost,
        data.mileage ?? null,
        data.recorded_by ?? null,
      ]
    );

    return result.insertId;
  },

  async update(id, data) {
    const [result] = await db.execute(
      `
      UPDATE fuel_logs
      SET
        bus_id = ?,
        trip_id = ?,
        fuel_type = ?,
        fuel_date = ?,
        liters = ?,
        unit_price = ?,
        cost = ?,
        mileage = ?
      WHERE id = ?
      `,
      [
        data.bus_id,
        data.trip_id ?? null,
        data.fuel_type || "DIESEL",
        data.fuel_date,
        data.liters,
        data.unit_price,
        data.cost,
        data.mileage ?? null,
        id,
      ]
    );

    return result.affectedRows;
  },

  async delete(id) {
    const [result] = await db.execute(
      "DELETE FROM fuel_logs WHERE id = ?",
      [id]
    );

    return result.affectedRows;
  },
};

module.exports = Fuel;