const express = require('express');
const mysql = require('mysql');
const random_name = require('node-random-name');

function tableExists(conn, tableName) {
    return new Promise(async (resolve) => {
        let sql = `SHOW TABLES LIKE '${tableName}';`;
        
        await conn.query(sql, (err, result) => {
            if (err) throw err;
            resolve(result.length > 0);
        });
    });
}

function createPeopleTable(conn) {
    return new Promise(async (resolve) => {
        let sql = "CREATE TABLE people (name VARCHAR(255))";

        const exists = await tableExists(conn, 'people');

        if (!exists) {
            conn.query(sql, function (err, res) {
                if (err) throw err;
                resolve(!!res);
            });
        } else {
            resolve(true);
        }
    });
}

function connectDb() {
    let conn = mysql.createConnection({
        host: 'db',
        user: 'root',
        password: 'root',
        database:'nodedb'
    });

    return conn;
}

function initDataBase() {
    return new Promise(async (resolve) => {
        const conn = connectDb();
        await createPeopleTable(conn);
        resolve(conn);
    });
}

async function insertRandonName(conn) {
    const name = random_name();
    const sql = `INSERT INTO people(name) values('${name}')`;
    await conn.query(sql);
    return true;
}

function getPeopleNames(conn) {
    return new Promise((resolve) => {
        const sql = `SELECT * FROM people;`;
        conn.query(sql, (err, result) => {
            if (err) throw err;
            resolve(result);
        });
    });
}

function runServer(conn) {
    const app = express()
    const port = 3000
    
    app.get('/', async (req,res) => {
        await insertRandonName(conn);
        const result = await getPeopleNames(conn);

        let list = "<ul>";

        result.forEach((row) => {
            list += `<li>${row.name}</li>`;
        });

        list += '</ul>';

        const html = "<h1>Full Cycle</h1></br>" + list;

        console.log(html);

        res.send(html);
    })
    
    app.listen(port, ()=> {
        console.log('Rodando na porta ' + port)
    })
}

initDataBase().then(async (conn) => {
    runServer(conn);
});