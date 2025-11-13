import React from "react";
import { HiOutlineArrowNarrowRight } from "react-icons/hi";
import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

// Predefined time slots
const timeSlots = [
  "09:00 - 10:30", "10:30 - 12:00", "12:00 - 13:30",
  "13:30 - 15:00", "15:00 - 16:30", "18:00 - 19:30",
  "19:30 - 21:00", "21:00 - 22:30",
];

// Predefined dishes for pre-ordering
const availableDishes = [
  "Signature Steak", "Grilled Salmon", "Mushroom Risotto", 
  "Caesar Salad", "Chocolate Lava Cake", "Cheesecake"
];

const Reservation = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [phone, setPhone] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  // 1. ADD STATE FOR DISHES
  const [dishes, setDishes] = useState([]); 
  const navigate = useNavigate();

  // Function to handle checkbox changes for dishes
  const handleDishChange = (dish) => {
    setDishes((prevDishes) =>
      prevDishes.includes(dish)
        ? prevDishes.filter((d) => d !== dish) // Uncheck: remove dish
        : [...prevDishes, dish] // Check: add dish
    );
  };

  const handleReservation = async (e) => {
    e.preventDefault();
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const { data } = await axios.post(
        // 2. FIX THE URL HERE by adding /api/v1
        `${backendUrl}/api/v1/reservation/send`,
        // 3. ADD 'dishes' to the data being sent
        { firstName, lastName, email, phone, date, time, tableNumber, dishes },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      toast.success(data.message);
      setFirstName(""); setLastName(""); setPhone("");
      setEmail(""); setTime(""); setDate("");
      setTableNumber("");
      setDishes([]); // Clear selected dishes
      navigate("/success");
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  return (
    <section className="reservation" id="reservation">
      <div className="container">
        <div className="banner">
          <img src="/reservation.png" alt="res" />
        </div>
        <div className="banner">
          <div className="reservation_form_box">
            <h1>MAKE A RESERVATION</h1>
            <p>For Further Questions, Please Call</p>
            <form onSubmit={handleReservation}>
              <div>
                <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required/>
                <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required/>
              </div>
              <div>
                <input type="date" placeholder="Date" value={date} onChange={(e) => setDate(e.target.value)} required/>
                <select value={time} onChange={(e) => setTime(e.target.value)} required>
                  <option value="">Select Time Slot</option>
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
              <div>
                <input type="email" placeholder="Email" className="email_tag" value={email} onChange={(e) => setEmail(e.target.value)} required/>
                <input type="tel" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} required/>
              </div>
              <div style={{width: '100%'}}>
                <input type="number" placeholder="Table Number" value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} required min="1"/>
              </div>

              {/* 4. ADD THE DISHES CHECKLIST BACK IN */}
              <div className="dishes-container">
                <h4>Pre-order Dishes (Optional)</h4>
                <div className="dishes-grid">
                  {availableDishes.map((dish) => (
                    <div key={dish} className="dish-item">
                      <input
                        type="checkbox"
                        id={dish}
                        value={dish}
                        checked={dishes.includes(dish)}
                        onChange={() => handleDishChange(dish)}
                      />
                      <label htmlFor={dish}>{dish}</label>
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit">RESERVE NOW <span><HiOutlineArrowNarrowRight /></span></button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Reservation;