
const Delay = require("../models/delay.model");

const delayService = {
  async getAll() {
    return await Delay.findAll();
  },

  async getByUserId(userId) {
    return await Delay.findByUserId(userId);
  },

  async getById(id) {
    const delay = await Delay.findById(id);

    if (!delay) {
      throw new Error("Delay report not found.");
    }

    return delay;
  },

  async create(data) {
    const tripId = Number(data.trip_id);
    const minutes = Number(data.delay_minutes);
    const recordedBy = Number(data.recorded_by);
    const reason = String(data.reason || "").trim();
    const notes = String(data.notes || "").trim();

    if (!Number.isInteger(tripId) || tripId <= 0) {
      throw new Error("A valid trip is required.");
    }

    if (!Number.isInteger(minutes) || minutes <= 0) {
      throw new Error("Delay minutes must be a positive whole number.");
    }

    if (!reason) {
      throw new Error("Delay reason is required.");
    }

    if (!Number.isInteger(recordedBy) || recordedBy <= 0) {
      throw new Error("A valid reporting user is required.");
    }

    const id = await Delay.create({
      trip_id: tripId,
      delay_minutes: minutes,
      reason,
      notes: notes || null,
      recorded_by: recordedBy,
    });

    return await Delay.findById(id);
  },

  async update(id, data) {
    const delayId = Number(id);
    const minutes = Number(data.delay_minutes);
    const reason = String(data.reason || "").trim();
    const notes = String(data.notes || "").trim();

    if (!Number.isInteger(delayId) || delayId <= 0) {
      throw new Error("Invalid delay report ID.");
    }

    await this.getById(delayId);

    if (!Number.isInteger(minutes) || minutes <= 0) {
      throw new Error("Delay minutes must be a positive whole number.");
    }

    if (!reason) {
      throw new Error("Delay reason is required.");
    }

    await Delay.update(delayId, {
      delay_minutes: minutes,
      reason,
      notes: notes || null,
    });

    return await Delay.findById(delayId);
  },

  async delete(id) {
    const delayId = Number(id);

    if (!Number.isInteger(delayId) || delayId <= 0) {
      throw new Error("Invalid delay report ID.");
    }

    await this.getById(delayId);

    await Delay.delete(delayId);

    return true;
  },
};

module.exports = delayService;