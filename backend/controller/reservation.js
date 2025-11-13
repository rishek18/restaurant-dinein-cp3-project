import { Reservation } from "../models/reservation.js";
import ErrorHandler from "../middlewares/error.js";
import { sendEmail } from "../utils/SendEmail.js";

export const sendReservation = async (req, res, next) => {
  // Destructure all fields from the request body
  const { firstName, lastName, email, phone, date, time, tableNumber } = req.body;

  // This validation check remains the same
  if (!firstName || !lastName || !email || !phone || !date || !time || !tableNumber) {
    return next(new ErrorHandler("Please fill out the entire reservation form!", 400));
  }

  try {
    // --- FIX: EXPLICITLY CONVERT TABLE NUMBER TO AN INTEGER ---
    // The form sends tableNumber as a string ("1"). We must convert it to a number (1)
    // to ensure the database query works correctly and reliably.
    const numericTableNumber = parseInt(tableNumber, 10);

    // Add a check to make sure the conversion was successful
    if (isNaN(numericTableNumber)) {
      return next(new ErrorHandler("Invalid Table Number provided.", 400));
    }

    // Use the converted numericTableNumber in the database query
    const existingReservation = await Reservation.findOne({
      tableNumber: numericTableNumber,
      date,
      time,
    });

    if (existingReservation) {
      return next(new ErrorHandler("This table is already booked for the selected date and time slot. Please choose another slot.", 400));
    }

    // If no conflict, create the new reservation using the numericTableNumber
    // Note: 'dishes' logic is not included, as per your request.
    await Reservation.create({
      firstName,
      lastName,
      email,
      phone,
      date,
      time,
      tableNumber: numericTableNumber, // Save the corrected number to the DB
    });

    // The email sending logic remains the same, but we'll use the correct number
    try {
      const subject = "Your Reservation at ZEESH is Confirmed!";
      const message = `
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .container { padding: 20px; border: 1px solid #ddd; border-radius: 5px; max-width: 600px; margin: auto; }
            h1 { color: #333; }
            ul { list-style-type: none; padding: 0; }
            li { background: #f4f4f4; margin: 5px 0; padding: 10px; border-radius: 3px; }
            strong { color: #555; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Reservation Confirmation</h1>
            <p>Dear ${firstName} ${lastName},</p>
            <p>Thank you for booking a table at ZEESH. Your reservation is confirmed!</p>
            <h3>Booking Details:</h3>
            <ul>
              <li><strong>Date:</strong> ${date}</li>
              <li><strong>Time Slot:</strong> ${time}</li>
              <li><strong>Table Number:</strong> ${numericTableNumber}</li>
              <li><strong>Contact Phone:</strong> ${phone}</li>
            </ul>
            <p>We look forward to welcoming you!</p>
            <br>
            <p>Sincerely,</p>
            <p><strong>The ZEESH Team</strong></p>
          </div>
        </body>
        </html>
      `;

      await sendEmail({
        email: email,
        subject: subject,
        message: message,
      });

    } catch (emailError) {
      console.error("Email could not be sent:", emailError);
    }

    // The final success response remains the same
    res.status(201).json({
      success: true,
      message: "Reservation Sent Successfully!",
    });

  } catch (error) {
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return next(new ErrorHandler(validationErrors.join(', '), 400));
    }
    return next(error);
  }
};