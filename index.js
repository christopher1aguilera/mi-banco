const { Pool } = require("pg");
const Cursor = require("pg-cursor");
const config = {
    user: "chris",
    host: "localhost",
    database: "banco",
    password: "chris1997",
    port: 5432,
};

const accion = process.argv[2]
const idcuenta = parseInt(process.argv[6])
const filtro = process.argv[3]
const fecha = process.argv[4]
const monto = parseInt(process.argv[5])
const descripcion = process.argv[3]
console.log(`${accion}, ${idcuenta}, ${fecha}, ${monto}, ${descripcion}`)
const pool = new Pool(config);

function transccion(idcuenta, descripcion, fecha, monto){
    pool.connect(async(error_conexion, client, release) => {
    if (error_conexion) return console.error(error_conexion.code);
    await client.query("BEGIN");
    try {
    const trans ={
    text: "INSERT INTO transacciones (descripcion, fecha, monto, cuenta) values ($1, $2, $3, $4) RETURNING *;",
    values: [descripcion, fecha, monto, idcuenta],
    }
    const transferencia = await client.query(trans);
    const descontar ={
    text: "UPDATE cuentas SET saldo = saldo - $1 WHERE id = $2 RETURNING *",
    values: [monto, idcuenta],
    }
    const desconto = await client.query(descontar);
    console.log("Acreditación realizada con éxito: ", transferencia.rows);
    console.log("Descuento realizado con éxito: ", desconto.rows);
    await client.query("COMMIT");
    }
    catch (e) {
        await client.query("ROLLBACK");
        console.log("Error código: " + e.code);
        console.log("Detalle del error: " + e.detail);
        console.log("Tabla originaria del error: " + e.table);
        console.log("Restricción violada en el campo: " + e.constraint);
        }
        release();
        pool.end();
    });
}

 function consulta(cuenta){
    pool.connect((error_conexion, client, release) => {
        if (error_conexion) return console.error(error_conexion.code);
    const consultas = new Cursor("select * from transacciones where cuenta = $1",[cuenta]);
    const cursor = client.query(consultas);
    cursor.read(10, (err, rows) => {
        console.log(rows);
        cursor.close();
        release();
        pool.end();
    });
    });
}

function consultaSaldo(cuenta){
    pool.connect((error_conexion, client, release) => {
        if (error_conexion) return console.error(error_conexion.code);
    const consultas = new Cursor("select * from cuentas where id = $1",[cuenta]);
    const cursor = client.query(consultas);
    cursor.read(10, (err, rows) => {
        console.log(rows);
        cursor.close();
        release();
        pool.end();
    });
    });
}

if (accion == 'transaccion'){
    transccion(idcuenta, descripcion, fecha, monto)
    }
if (accion == 'consulta'){
    consulta(filtro)
}
if (accion == 'consultasaldo'){
    consultaSaldo(filtro)
}




// const { Pool } = require("pg");
// const Cursor = require("pg-cursor");
// const config = {
//     user: "chris",
//     host: "localhost",
//     database: "banco",
//     password: "chris1997",
//     port: 5432,
// };

// const accion = process.argv[2]
// const idcuenta = parseInt(process.argv[6])
// const filtro = process.argv[3]
// const fecha = process.argv[4]
// const monto = parseInt(process.argv[5])
// const descripcion = process.argv[3]
// console.log(`${accion}, ${idcuenta}, ${fecha}, ${monto}, ${descripcion}`)
// const pool = new Pool(config);

// function poolsql(queryObj){
// pool.connect(async(error_conexion, client, release) => {
//     if (error_conexion) return console.error(error_conexion.code);
//     if (accion == 'transaccion'){
//         try {
//             const transferencia = await client.query(trans);
//             const desconto = await client.query(descontar);
//             console.log("Acreditación realizada con éxito: ", transferencia.rows);
//             console.log("Descuento realizado con éxito: ", desconto.rows);
//             await client.query("COMMIT");
        
//             }
//             catch (e) {
//                 await client.query("ROLLBACK");
//                 console.log("Error código: " + e.code);
//                 console.log("Detalle del error: " + e.detail);
//                 console.log("Tabla originaria del error: " + e.table);
//                 console.log("Restricción violada en el campo: " + e.constraint);
//                 }
//         }
//     if (accion == 'consulta' || 'consultasaldo'){
//         const cursor = client.query(queryObj);
//         cursor.read(10, (err, rows) => {
//             console.log(rows);
//             cursor.close();
//         })
//     }
//     // if (accion == 'consultasaldo'){
//     //     consultaSaldo(filtro)
//     // }
//     release();
//     pool.end();
// });
// }


// function transccion(idcuenta, descripcion, fecha, monto){
//     const trans ={
//     text: "INSERT INTO transacciones (descripcion, fecha, monto, cuenta) values ($1, $2, $3, $4) RETURNING *;",
//     values: [descripcion, fecha, monto, idcuenta],
//     }
//     const descontar ={
//     text: "UPDATE cuentas SET saldo = saldo - $1 WHERE id = $2 RETURNING *",
//     values: [monto, idcuenta],
//     }
// }

//  function consulta(cuenta){
//     const consultas = new Cursor("select * from transacciones where cuenta = $1",[cuenta]);
//     return consultas
// }

// function consultaSaldo(cuenta){
//     const consultas = new Cursor("select * from cuentas where id = $1",[cuenta]);
//     return consultas
// }

// if (accion == 'transaccion'){
//     transccion(idcuenta, descripcion, fecha, monto)
//     .then( (queryObj) => poolsql(queryObj))
//     }
// if (accion == 'consulta'){
//     consulta(filtro)
//     .then( (queryObj) => poolsql(queryObj))
// }
// if (accion == 'consultasaldo'){
//     consultaSaldo(filtro)
//     .then( (queryObj) => poolsql(queryObj))
// }