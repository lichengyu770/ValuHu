import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UserState {
  id: number | null
  username: string | null
  email: string | null
  role: string | null
  phone: string | null
  avatar_url: string | null
  status: string | null
  token: string | null
  isLoggedIn: boolean
}

const initialState: UserState = {
  id: null,
  username: null,
  email: null,
  role: null,
  phone: null,
  avatar_url: null,
  status: null,
  token: null,
  isLoggedIn: false,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<any>) => {
      state.id = action.payload.id
      state.username = action.payload.username
      state.email = action.payload.email
      state.role = action.payload.role
      state.phone = action.payload.phone
      state.avatar_url = action.payload.avatar_url
      state.status = action.payload.status
      state.isLoggedIn = true
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload
      localStorage.setItem('access_token', action.payload)
    },
    clearUser: (state) => {
      state.id = null
      state.username = null
      state.email = null
      state.role = null
      state.phone = null
      state.avatar_url = null
      state.status = null
      state.token = null
      state.isLoggedIn = false
      localStorage.removeItem('access_token')
    },
  },
})

export const { setUser, setToken, clearUser } = userSlice.actions
export default userSlice.reducer
