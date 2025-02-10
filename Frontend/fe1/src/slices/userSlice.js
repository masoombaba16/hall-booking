import { createSlice } from '@reduxjs/toolkit';

export let userSlice = createSlice({
  name: 'user',
  initialState: {
    userData: null,
    error: null,
  },
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export let { setUserData, setError } = userSlice.actions;

export default userSlice.reducer;
