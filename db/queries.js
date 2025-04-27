import supabase from "./pool.js";

//testing intergration with supabase
// export default async function Instruments() {
//   const {data: instruments} = await supabase.from("instruments").select();
//   console.log("instru", instruments)

//   return JSON.stringify(instruments, null, 2)
// }




// import pool from "./pool.js";

// async function getAllUsernames() {
//   const { rows } = await pool.query("SELECT * FROM users");
//   return rows;
// }

// async function insertUser(username, password) {
//   await pool.query("INSERT INTO users (username, password) VALUES ($1, $2)", [username, password]);
// }


export { getAllUsernames, insertUser };
