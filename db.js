const mysql = require("mysql2");

const conexion = mysql.createConnection({

    host: "localhost",

    user: "root",

    password: "",

    database: "gestion_vehiculos"
});

conexion.connect((error) => {

    if(error){
        console.log(error);
    }else{
        console.log("MySQL conectado");
    }
});

module.exports = conexion;