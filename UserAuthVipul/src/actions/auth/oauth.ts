"use server"

import {redirect} from "next/navigation"
import {createUrl as createRouteLoader} from "@/lib/OAuthClient";
export type OAuthProvider = "github" | "google";
export type Action  = "signin" | "signup";

export default async function  OAuthSignIn (
    provider : OAuthProvider,
    action : Action
)  {
    const authUrl:string = await createRouteLoader(provider, action);
    redirect(authUrl)
  
}
