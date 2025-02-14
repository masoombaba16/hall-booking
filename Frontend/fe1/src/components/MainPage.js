import React, { useEffect, useState } from "react";
import "./MainPage.css";
import { setBookings, setError } from "../slices/bookingsSlice";
import { setAvailability } from "../slices/availabilitySlice";
import { useDispatch } from "react-redux";
import Login_Common from "./Login_Common"; // Import your LoginPage component

const MainPage = () => {
  const dispatch = useDispatch();
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const fetchAvailabilities = async () => {
      try {
        const response = await fetch("http://localhost:5000/public/get-availability");
        const availabilityData = await response.json();
        if (availabilityData.success && Array.isArray(availabilityData.data)) {
          dispatch(setAvailability(availabilityData.data));
        } else {
          dispatch(setError("Failed to Load Bookings."));
        }
      } catch (error) {
        dispatch(setError("Failed to load bookings."));
      }
    };
    fetchAvailabilities();

    const intervalId = setInterval(fetchAvailabilities, 60 * 5 * 1000);

    return () => clearInterval(intervalId);
  }, [dispatch]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch("http://localhost:5000/public/get-bookings");
        const bookingsData = await response.json();
        if (bookingsData.success && Array.isArray(bookingsData.hallBookings)) {
          dispatch(setBookings(bookingsData.hallBookings));
        } else {
          dispatch(setError("Failed to Load Bookings."));
        }
      } catch (error) {
        dispatch(setError("Failed to load bookings."));
      }
    };
    fetchBookings();

    const intervalId = setInterval(fetchBookings, 2000);

    return () => clearInterval(intervalId);
  }, [dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLogin(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (showLogin) {
    return <Login_Common />;
  }

  return (
    <div className="main-page">
      <div className="text-container">
        <h1 className="animated-text">Welcome to</h1>
        <h1 className="highlighted-text">VenueVista</h1>
        <p className="description">
          The ultimate solution for effortless and seamless <span>Hall Booking</span>.
        </p>
      </div>
      <div className="animation-container">
        <div className="circle"></div>
        <div className="circle small"></div>
        <div className="circle medium"></div>
        <div className="circle large"></div>
      </div>
    </div>
  );
};

export default MainPage;
