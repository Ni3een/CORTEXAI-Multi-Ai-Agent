import redis from "../../shared/redis/redis.js"

const protect=async (req,res,next) => {
    try {
        const sessionId=req.cookies?.session
        
        if(!sessionId){
            // Clear invalid cookie if present
            res.clearCookie("session", {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                path: "/"
            })
            return res.status(401).json({message:"unauthorized"})
        }
        
        const session=await redis.get(`session-${sessionId}`)
        console.log("Session data:", session)
        
        if(!session){
            // Session expired or invalid - clear cookie
            res.clearCookie("session", {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                path: "/"
            })
            return res.status(401).json({message:"session expired"})
        }
        
        req.user=JSON.parse(session)
        next()
       
    } catch (error) {
        console.error("Auth middleware error:", error)
        // Clear cookie on error
        res.clearCookie("session", {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            path: "/"
        })
        return res.status(500).json({message:`protect error ${error}`})
    }
}

export default protect