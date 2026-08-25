import { createSlice } from "@reduxjs/toolkit";

const agentSlice = createSlice({
    name: "agent",
    initialState: {
        selectedAgent: "Auto"
    },
    reducers: {
        setSelectedAgent: (state, action) => {
            state.selectedAgent = action.payload
        }
    }
})

export const { setSelectedAgent } = agentSlice.actions
export default agentSlice.reducer
