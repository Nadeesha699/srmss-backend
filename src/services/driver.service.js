
const Driver = require("../models/driver.model");

const VALID_STATUSES = [
  "AVAILABLE",
  "ON_DUTY",
  "OFF_DUTY",
  "SUSPENDED",
];

function validateDriver(data) {
  const required = [
    "employee_no",
    "name",
    "license_no",
    "license_expiry",
  ];

  for (const field of required) {
    if (
      data[field] === undefined ||
      data[field] === null ||
      String(data[field]).trim() === ""
    ) {
      throw new Error(`${field} is required`);
    }
  }

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(data.license_expiry) ||
    Number.isNaN(Date.parse(data.license_expiry))
  ) {
    throw new Error("License expiry must be a valid YYYY-MM-DD date");
  }

  if (
    data.working_hours !== undefined &&
    (!Number.isFinite(Number(data.working_hours)) ||
      Number(data.working_hours) < 0)
  ) {
    throw new Error("Working hours must be a non-negative number");
  }
}

const driverService = {
  getAll() {
    return Driver.findAll();
  },

  async getById(id) {
    const driver = await Driver.findById(id);

    if (!driver) {
      throw new Error("Driver not found");
    }

    return driver;
  },

  async create(data) {
    validateDriver(data);

    if (await Driver.findByEmployeeNo(data.employee_no)) {
      throw new Error("Employee number already exists");
    }

    if (await Driver.findByLicenseNo(data.license_no)) {
      throw new Error("License number already exists");
    }

    return Driver.create(data);
  },

  async update(id, data) {
    await this.getById(id);
    validateDriver(data);

    const employee = await Driver.findByEmployeeNo(data.employee_no);
    if (employee && Number(employee.id) !== Number(id)) {
      throw new Error("Employee number already exists");
    }

    const license = await Driver.findByLicenseNo(data.license_no);
    if (license && Number(license.id) !== Number(id)) {
      throw new Error("License number already exists");
    }

    return Driver.update(id, data);
  },

  async updateStatus(id, status) {
    await this.getById(id);

    if (!VALID_STATUSES.includes(status)) {
      throw new Error("Invalid driver status");
    }

    return Driver.updateStatus(id, status);
  },

  async delete(id) {
    await this.getById(id);

    // A driver with historical assignments should normally be retained.
    const db = require("../../config/db");
    const [assignments] = await db.execute(
      "SELECT id FROM assignments WHERE driver_id = ? LIMIT 1",
      [id]
    );

    if (assignments.length > 0) {
      throw new Error(
        "This driver has assignments. Deactivate the driver instead."
      );
    }

    return Driver.delete(id);
  },
};

module.exports = driverService;