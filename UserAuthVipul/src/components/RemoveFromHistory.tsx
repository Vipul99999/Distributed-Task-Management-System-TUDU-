"use client"

import { useEffect } from "react"

export default function RemoveFromHistory() {
    useEffect(()=>{
        window.history.replaceState(null, "", window.location.pathname);
    })
  return (
    null
  )
}
