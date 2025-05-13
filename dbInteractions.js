const mariadb = require('mariadb')
const config = require('connection.js')

async function AddUser(data)  {
    try {
        let connection = mariadb.createConnection(config)
        return new Promise(
            (resolve) => {
                setTimeout(function () {
                    resolve(
                        connection.query(
                            `INSERT INTO TravelTrackerDB.Cliente(Username, Mail, Nome, Cognome, Password, DataDiNascita)
                             VALUES
                             (?,?,?,?,?,?)`,
                             [data.Username, data.Mail, data.Nome, data.Cognome, data.Password, data.DataDiNascita]
                        )
                    )
                }, 2000)
            })
    } 
    catch (error) {
        throw new Error(error)
    }
}

async function TryToLog(body){
    try {
        let connection = mariadb.createConnection(config)
        return new Promise(
            (resolve) => {
                setTimeout(function () {
                    resolve(
                        connection.query(
                            'query da inserire'
                        ),
                        [data.Username, data.Password]

                        //ritorna [] se non trova nessun utente teoricamente, ma lo sapremo quando avremo dei dati da testare
                    )
                })
            }
        )
    } 
    catch (error) {
        throw new Error(error)
    }
}