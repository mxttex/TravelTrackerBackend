const mariadb = require('mariadb')
const config = require('connection.js')

async function AddUser(data) {
    try {
        return DoQuery([data.Username, data.Mail, data.Nome, data.Cognome, data.Password, data.DataDiNascita],
                       `INSERT INTO TravelTrackerDB.Cliente(Username, Mail, Nome, Cognome, Password, DataDiNascita)
                        VALUES
                        (?,?,?,?,?,?)`)
    } catch (error) {
        throw new Error(error)
    }
}

async function TryToLog(data){
    try {
        return DoQuery([data.Username, data.Password], `SELECT Username, Mail, Nome, Cognome, DataDiNascita FROM Clienti WHERE Username=? AND Password=?`)
    } 
    catch (error) {
        throw new Error(error)
    }
}

async function AddViaggio(data){
    try {
        return 
    } catch (error) {
        
    }
}

async function AddTratta(data){
    try {
        
    } catch (error) {
        
    }
}

async function FetchAllViaggiGivenUser(data){
    try {
        
    } catch (error) {
        
    }
}

async function FetchTratteGivenViaggio(data){
    try {
        
    } catch (error) {
        
    }
}

async function FetchViaggioGivenPartenzaArrivoUtente(data){
    try {
        
    } catch (error) {
        
    }
}


const DoQuery = async (data, query) => {
    let connection = mariadb.createConnection(config)
        return new Promise(
            (resolve) => {
                setTimeout(function () {
                    resolve(
                        connection.query(
                            query
                        ),
                        data
                    )
                })
            }
        )
}

module.exports = {
    TryToLog: TryToLog,
    AddUser : AddUser
}