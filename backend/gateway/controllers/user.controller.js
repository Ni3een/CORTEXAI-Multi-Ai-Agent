export const getCurrentUser=async (req,res) => {
    try {
        // If user exists in request (set by middleware), return it
        if (req.user) {
            return res.status(200).json(req.user)
        }
        
        // If no user, return null (not logged in)
        return res.status(401).json({ message: "Not authenticated" })
        
    } catch (error) {
        console.error("Get current user error:", error)
        return res.status(500).json({message:`get current user error ${error}`})
    }
}