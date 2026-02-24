"use server";

import { signupSchema } from "@/lib/zodSchemas";
import {  z } from "zod";
import {  PoolClient } from "pg";
import { env } from "@/lib/env-server";
import { redirect } from "next/navigation";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs"
import tryCatch from "@/lib/tryCatch";
import { signupVerification } from "@/lib/emailTemplates";
import {getTransporter} from "@/lib/emailTransporter";
  const transporter = getTransporter();
import pool from "@/lib/db"; // Reuse a pool (don’t create per-request in production)

// Define the action result type
export type ActionResult =
  | {
      success: true;
      message: string;
      emailVerified?: boolean;
    }
  | {
      success: false;
      data: z.infer<typeof signupSchema>;
      errors: {
        name?: { _errors: string[] };
        email?: { _errors: string[] };
        password?: { _errors: string[] };
        confirm_password?: { _errors: string[] };
        _errors?: string[];
      };
    };

interface UserRow {
  id: number;
  email_verified: boolean;
  auth_providers: ("local" | "google" | "github")[];
}

export async function localSignupServerAction(
  rawData: z.infer<typeof signupSchema>
): Promise<ActionResult> {
  console.log(rawData);

  // validate user provided data
  const validateUser = signupSchema.safeParse(rawData);
  if (!validateUser.success) {
    return {
      success: false,
      errors: validateUser.error.format(),
      data: rawData,
    };
  }

  const { email, password, name } = validateUser.data;
  const genericErrorResponse : ActionResult = {
      success: false,
      data: {email, password, confirm_password : password,name},
      errors: { _errors: ["Internal server error"] },
    };
  let client: PoolClient | null = null;
  let existingUsers: UserRow[] = [];

  try {
    client = await pool.connect();

    // check if user exists in db
    const { rows } = await client.query<UserRow>(
      `SELECT id, email_verified, auth_providers 
       FROM users 
       WHERE email = $1`,
      [email]
    );
    console.log(rows);
    existingUsers = rows;
  } catch (error) {
    console.error("❌ Database query failed:", error);
    return genericErrorResponse;

  } finally {
    client?.release();
  }

  // Handle existing user that already has local authentication method
  
// 3. Handle existing users
  if (existingUsers.length > 0) {
    const user = existingUsers[0];

    // Case 1: User already has local login
    if (user.auth_providers.includes("local")) {
      if (!user.email_verified) {
        // Redirect them to verification if they haven’t verified yet
        redirect(`/verification-required?type=signup&email=${encodeURIComponent(email)}`);
      }
      // Otherwise, block signup
      return {
        success: false,
        errors: {
          _errors: ["An account already exists with this email. Please log in instead."],
        },
        data: rawData,
      };
    }

    // Case 2: User has OAuth login but no local → add local auth
    const [token, addLocalAuthError] = await addLocalAuthToExistingUser(
        client, existingUsers[0].id, email, password);

    if (addLocalAuthError || !token) {
        client.release();
        return genericErrorResponse;
}


// Force user to verify their email
   
  const [, emailError]  = await tryCatch(()=> sendVerificationMail(email, token));
  if(emailError){

    await removeLocalAuthFromExistingUser(client,existingUsers[0].id)
    client.release();
    return {
        success :false,
        errors:{
            _errors : ["Failed to send verification email. Pleases provide a valid email or contact support."]
        },
        data : {email, password, confirm_password : password, name},
    };
  }

  client.release();
  return { success: true, message: "Signup successfully. Check you email for verification." };
  
 } 
 // Case 3: User doesn’t exist → TODO: create brand new user row
 const [token, createUserError] = await createNewUserWithLocalAuth(
    client, email, name, password
 )
 if(createUserError ){
    client.release()
    return genericErrorResponse;
 }
 if(!token) return genericErrorResponse;

 const [, emailError] = await tryCatch(() => sendVerificationMail(
    email, token
 ))
 if(emailError){
    await tryCatch(()=>client.query(`DELETE FROM users WHERE email = $1`,[email]) )
    client.release();
    return {
        success:false,
        errors : {_errors : ["Failed to send verification email. Please a provide a valid email address or contact support"]},
        data : {email, password, confirm_password : password, name},
    }
 }
    // client.release();
  return { success: true, message: "Signup successful! Check you email for verification" };
}



export async function addLocalAuthToExistingUser(
  client: PoolClient,
  userId: number,
  email: string,
  password: string
) :Promise<[string | null, Error | null]>{
  const token = randomBytes(64).toString("hex");
//   const expiresAt = new Date(Date.now() + (1000 * 60 * 60)/4 ); // 15 minute expiry

  try {
    const hashedPassword = await bcrypt.hash(password, 12);

    await client.query("BEGIN");

    // Add local auth method to the existing user
    await client.query(
      `
      UPDATE users
      SET password_hash = $1,
          email_verified = false,
          auth_providers = array_append(auth_providers, 'local'::auth_provider)
      WHERE id = $2
    `,
      [hashedPassword, userId]
    );

    // Add email verification token for existing user
    await client.query(
      `
      INSERT INTO email_verifications (user_id, email, token, expires_at)
      VALUES ($1, $2, $3, NOW() + INTERVAL '15 minutes');
    `,
      [userId, email, token]
    );

    await client.query("COMMIT");

    return [ token , null]
  } catch (error) {
    await tryCatch(()=> client.query("ROLLBACK"));
    console.error("❌ Failed to add local auth:", error);
    return[ null, error as Error];
  }
}


async function sendVerificationMail(
  email: string,
  token: string
) {
  const confirmLink = `${env.BASE_URL}/verify-email?token=${encodeURIComponent(
    token
  )}`;

  await transporter.sendMail({
    from: env.SMTP_USER,
    to: email,
    subject: signupVerification.subject,
    text: signupVerification.text({ confirmLink }),
    html: signupVerification.html({ confirmLink }),
  });
}



export async function removeLocalAuthFromExistingUser(
  client: PoolClient,
  userId: number
) {
  try {
    // Start a database transaction
    await client.query("BEGIN");

    // Remove local authentication from the user
    await client.query(
      `
      UPDATE users
      SET 
        password_hash = NULL,
        email_verified = NULL,
        auth_providers = array_remove(auth_providers, 'local'::auth_provider)
      WHERE id = $1
      `,
      [userId]
    );

    // Delete email verification record for the user
    await client.query(`
      DELETE FROM email_verifications WHERE user_id = $1`,
      [userId]
    );

    // Commit the transaction
    await client.query("COMMIT");
  } catch (error) {
    // Rollback if there's an error
    await tryCatch(()=>client.query("ROLLBACK"));
    console.error("❌ Error removing local auth:", error);
    throw error; // Re-throw to handle it at a higher level
  }
}

async function createNewUserWithLocalAuth(client:PoolClient, 
    email : string, 
    name: string,
    password : string
) : Promise<[string | null , Error | null]>{
    
    const token = randomBytes(64).toString("hex");

  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    await client.query("BEGIN;");
    //Addd a new fresh uses to our database
    const {rows} = await client.query <{id : number}>(
      `INSERT INTO users (email, name, password_hash, auth_providers, email_verified)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [email, name, hashedPassword, ["local"], false]
    );
    
     // Add email verification entry into the database
    await client.query(
        `INSERT INTO email_verifications (user_id, email, token, expires_at)
        VALUES ($1, $2, $3, NOW() + INTERVAL '15 minutes')`,
        [rows[0].id, email, token]
    )

    await client.query("COMMIT;");
    return [token, null];
  } catch (error) {
    await tryCatch(()=>client.query("ROLLBACK;"));
    console.error("Error creating a new use:",error);
    return [null, error as Error];
  }

}