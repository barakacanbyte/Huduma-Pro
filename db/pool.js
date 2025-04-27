// import pg from "pg";
import morgan from "morgan";
import { createClient } from '@supabase/supabase-js'; 
import dotenv from "dotenv";
import path from 'path';
import express from 'express';
import bodyParser from "body-parser";
// import SupabaseClient from "@supabase/supabase-js";


//configuring path to .env file
const __fileName = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__fileName);
import { fileURLToPath } from "url";
dotenv.config({ path: path.resolve(__dirname, "../.env") });


const app = express();

//supabase confs
app.use(morgan('combined'))
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
)

export default supabase;




// const { Pool } = pg;

// const pool = new Pool({
//   host: "localhost",
//   user: "postgres",
//   database: "top_users",
//   password: "b1a2r3a4",
//   port: 5432,
// });

// export default pool;
