import { Reservation } from "../models/reservation.js";
import ErrorHandler from "../middlewares/error.js";
import { sendEmail } from "../utils/SendEmail.js";

export const sendReservation = async (req, res, next) => {
  // --- LOGGING STEP 1: Announce that the function was called ---
  console.log("--- Received a new reservation request ---");

  const { firstName, lastName, email, phone, date, time, tableNumber } = req.body;

  // --- LOGGING STEP 2: Log the received data immediately ---
  console.log("Request Body Received:", req.body);

  if (!firstName || !lastName || !email || !phone || !date || !time || !tableNumber) {
    console.error("Validation Error: A required field is missing.");
    return next(new ErrorHandler("Please fill out the entire reservation form!", 400));
  }

  try {
    const numericTableNumber = parseInt(tableNumber, 10);
    if (isNaN(numericTableNumber)) {
      console.error("Validation Error: tableNumber is not a valid number.");
      return next(new ErrorHandler("Invalid Table Number provided.", 400));
    }

    // --- LOGGING STEP 3: Log the exact query we are about to run ---
    const conflictQuery = {
      tableNumber: numericTableNumber,
      date: date,
      time: time,
    };
    console.log("Checking for conflicts with this query:", conflictQuery);

    const existingReservation = await Reservation.findOne(conflictQuery);

    if (existingReservation) {
      // --- LOGGING STEP 4: If a conflict is found, log the conflicting document ---
      console.error("Conflict Found! An existing reservation was found in the database:");
      console.error(existingReservation);
      return next(new ErrorHandler("This table is already booked for the selected date and time slot. Please choose another slot.", 400));
    }
    
    // If we reach here, it means no conflict was found.
    console.log("No conflicts found. Proceeding to create reservation.");

    // The rest of the code remains the same...
    await Reservation.create({
      firstName, lastName, email, phone, date, time,
      tableNumber: numericTableNumber,
    });
    
    console.log("Reservation created successfully in the database.");

    try {
      // Email logic...
    } catch (emailError) {
      console.error("Email could not be sent:", emailError);
    }

    res.status(201).json({
      success: true,
      message: "Reservation Sent Successfully!",
    });

  } catch (error) {
    console.error("--- An unexpected error occurred in the try-catch block ---");
    console.error(error);
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return next(new ErrorHandler(validationErrors.join(', '), 400));
    }
    return next(error);
  }
};