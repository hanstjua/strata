import { useLocation } from "@remix-run/react"

export default function CatchAll() {
    const location = useLocation()
    console.log(`No route matches for: ${location.pathname}`)

    return <></>
};