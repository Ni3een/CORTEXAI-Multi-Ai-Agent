import { configureStore } from '@reduxjs/toolkit'
import userReducer from "./userSlice"
import conversationReducer from "./conversationSlice"
import messageReducer from "./messageSlice"
import agentReducer from "./agentSlice"

export const store = configureStore({
  reducer: {
    user:userReducer,
    conversation:conversationReducer,
    message:messageReducer,
    agent:agentReducer
  },
})