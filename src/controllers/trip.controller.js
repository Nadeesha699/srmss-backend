const tripService = require("../services/trip.service");

const getAllTrips = async (req, res) => {
  try {
    res.json({
      success: true,
      data: await tripService.getAllTrips(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getTripById = async (req, res) => {
  try {
    res.json({
      success: true,
      data: await tripService.getTripById(req.params.id),
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

const createTrip = async (req, res) => {
  try {
    res.status(201).json({
      success: true,
      message: "Trip created successfully",
      data: await tripService.createTrip(req.body),
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const updateTrip = async (req, res) => {
  try {
    res.json({
      success: true,
      message: "Trip updated successfully",
      data: await tripService.updateTrip(
        req.params.id,
        req.body
      ),
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


const updateStatus = 
  async (req, res)=> {
    try {
      const { id } = req.params;
      const {
        status,
        actual_start_time,
        actual_end_time,
      } = req.body;


      if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid trip ID",
        });
      }


      const affectedRows = await tripService.updateStatus(
        Number(id),
        {
          status,
          actual_start_time: actual_start_time || null,
          actual_end_time: actual_end_time || null,
        }
      );

      return res.status(200).json({
        success: true,
        message: "Trip status updated successfully",
        data: {
          id: Number(id),
          status,
          actual_start_time: actual_start_time || null,
          actual_end_time: actual_end_time || null,
          affectedRows,
        },
      });
    } catch (error) {
      console.error("Update trip status error:", error);

      if (error.message === "Trip not found or no changes made") {
        return res.status(404).json({
          success: false,
          message: "Trip not found or no changes made",
        });
      }

      return res.status(500).json({
        success: false,
        message: "Failed to update trip status",
      });
    }
  }




module.exports = {
  getAllTrips,
  getTripById,
  createTrip,
  updateTrip,
  updateStatus
};