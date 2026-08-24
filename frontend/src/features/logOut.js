import React from 'react'
import api from '../../utils/axios'
import { auth } from '../../utils/firebase'
import { signOut } from 'firebase/auth'

async function logOut() {
try {
    // Backend logout
    const {data}=await api.get("/api/auth/logout")
    console.log(data)
    
    // Firebase logout
    await signOut(auth)
    
    // Clear local storage
    localStorage.clear()
    
    // Clear session storage
    sessionStorage.clear()
    
    // Reload page to clear all state
    window.location.reload()
    
} catch (error) {
    console.log(error)
    // Force reload even on error
    window.location.reload()
}
}

export default logOut
