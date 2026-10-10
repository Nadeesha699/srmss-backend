const db = require("../../config/db");

const RouteModel = {
  /* =========================================================
     GET ALL ROUTES
  ========================================================= */

  async findAll() {
    const [rows] = await db.execute(`
      SELECT
        id,
        route_code,
        name,
        start_point,
        end_point,
        distance_km,
        estimated_duration,
        number_of_stops,
        status,
        created_at,
        updated_at
      FROM routes
      ORDER BY id DESC
    `);

    return rows;
  },

  /* =========================================================
     GET ROUTE BY ID
  ========================================================= */

  async findById(id) {
    const [rows] = await db.execute(
      `
      SELECT
        id,
        route_code,
        name,
        start_point,
        end_point,
        distance_km,
        estimated_duration,
        number_of_stops,
        status,
        created_at,
        updated_at
      FROM routes
      WHERE id = ?
      `,
      [id]
    );

    return rows[0];
  },

  /* =========================================================
     GET ROUTE BY CODE
  ========================================================= */

  async findByCode(code) {
    const [rows] = await db.execute(
      `
      SELECT
        id,
        route_code,
        name,
        start_point,
        end_point,
        distance_km,
        estimated_duration,
        number_of_stops,
        status,
        created_at,
        updated_at
      FROM routes
      WHERE route_code = ?
      `,
      [code]
    );

    return rows[0];
  },

  /* =========================================================
     CREATE ROUTE
  ========================================================= */

  async create(data) {
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      const [result] = await connection.execute(
        `
        INSERT INTO routes
        (
          route_code,
          name,
          start_point,
          end_point,
          distance_km,
          estimated_duration,
          number_of_stops,
          status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          data.route_code,
          data.name,
          data.start_point,
          data.end_point,
          data.distance_km,
          data.estimated_duration || 0,
          data.number_of_stops || 0,
          data.status || "ACTIVE",
        ]
      );

      /*
       * Optional route_stops support.
       *
       * If data.stops is an array of stop names,
       * save them into route_stops.
       */

      if (Array.isArray(data.stops)) {
        for (let i = 0; i < data.stops.length; i++) {
          await connection.execute(
            `
            INSERT INTO route_stops
            (
              route_id,
              stop_name,
              stop_order
            )
            VALUES (?, ?, ?)
            `,
            [
              result.insertId,
              data.stops[i],
              i + 1,
            ]
          );
        }
      }

      await connection.commit();

      return result.insertId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  /* =========================================================
     UPDATE ROUTE
  ========================================================= */

  async update(id, data) {
    const [result] = await db.execute(
      `
      UPDATE routes
      SET
        route_code = ?,
        name = ?,
        start_point = ?,
        end_point = ?,
        distance_km = ?,
        estimated_duration = ?,
        number_of_stops = ?,
        status = ?
      WHERE id = ?
      `,
      [
        data.route_code,
        data.name,
        data.start_point,
        data.end_point,
        data.distance_km,
        data.estimated_duration || 0,
        data.number_of_stops || 0,
        data.status || "ACTIVE",
        id,
      ]
    );

    return result.affectedRows;
  },

  /* =========================================================
     DELETE ROUTE
  ========================================================= */

  async delete(id) {
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      /*
       * Delete route stops first.
       * This is useful if route_stops has a foreign key
       * referencing routes.id.
       */

      await connection.execute(
        `
        DELETE FROM route_stops
        WHERE route_id = ?
        `,
        [id]
      );

      const [result] = await connection.execute(
        `
        DELETE FROM routes
        WHERE id = ?
        `,
        [id]
      );

      await connection.commit();

      return result.affectedRows;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },
};

module.exports = RouteModel;