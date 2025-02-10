import React, { useState } from 'react';
import './AddClub.css';
import eye from '../../images/eye.png';
import hidden from '../../images/hidden.png';
import { useSelector } from 'react-redux';

function AddClub({ isOpen, onClose }) {
  const [showPassword, setShowPassword] = useState(false);
  const { userData } = useSelector((state) => state.user); 
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const clubname = e.target.clubname.value;
    const clubUsername = e.target.username.value;
    const password = e.target.password.value;
    const description = e.target.description.value;
    const username = userData.username;
  
    const payload = {
      clubname,
      username,
      clubUsername,
      password,
      description,
    };
  
    const token = userData.token;
    
    try {
      const response = await fetch('http://localhost:5000/admin/add-club', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
    
      if (response.ok) {
        const data = await response.json();
        alert('Club added successfully!');
        window.location.reload();
        onClose();
      } else {
        alert('Failed to add club. Please try again.');
      }
    } catch (error) {
      alert('An error occurred. Please try again later.');
    }
  };
  

  if (!isOpen) return null;

  return (
    <div className="add-club-form-overlay">
      <div className="add-club-form">
        <h2 className="form-title">Add New Club</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="clubname">Club Name :- </label>
            <input
              type="text"
              id="clubname"
              name="clubname"
              placeholder="Enter club name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="username">Username :- </label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Enter club username"
              required
            />
          </div>

          <div className="form-group password-group">
            <div className="password-input-wrapper">
            <label htmlFor="password">Password :- </label>

              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                placeholder="Enter password"
                required
              />
              <button
                type="button"
                className="toggle-password-visibility"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                <img
                  src={showPassword ? hidden : eye}
                  alt={showPassword ? 'Hide password' : 'Show password'}
                />
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description :- </label>
            <input
              type="text"
              id="description"
              name="description"
              placeholder="Enter club description"
              required
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-button">
              Add Club
            </button>
            <button type="button" className="close-button" onClick={onClose}>
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddClub;
