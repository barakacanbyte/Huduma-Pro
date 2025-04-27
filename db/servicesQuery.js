import supabase from "./pool.js";

export default async function services() {
    const {data: servicesList} = await supabase
        .from("services")
        .select('*')
        .order('service_name', {ascending: true});
    console.log("services", servicesList)

    return servicesList;
    
}