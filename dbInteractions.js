const mariadb = require('mariadb')
const config = require('./connection')

//add a User with some starting parameters
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

//try to log in give a mail, psw and other parameters
async function TryToLog(data){
    try {
        return DoQuery([data.Username, data.Password], `SELECT Username, Mail, Nome, Cognome, DataDiNascita FROM Clienti WHERE Username=? AND Password=?`)
    } 
    catch (error) {
        throw new Error(error)
    }
}

//add a Viaggio given CittàDiPartenza, CittàDiArrivo, Prezzo, PuntiAccumulati=0, NrPartecipanti
async function AddViaggio(data) {
    try {
        const result = await DoQuery(
            [data.Cliente, data.CittaDiPartenza, data.CittaDiArrivo, data.Prezzo],
            `INSERT INTO TravelTrackerDB.Viaggio (Cliente, CittaDiPartenza, CittaDiArrivo, Prezzo)
             VALUES (?, ?, ?, ?)`
        );

        const viaggioId = result.insertId; 

        await AddTratta(viaggioId, data.tratte);

        return true;
    } catch (error) {
        throw new Error(error.message || error);
    }
}

async function AddTratta(viaggioId, tratte) {
    try {
        let prog = 0;

        for (const tratta of tratte) {
            await DoQuery(
                [
                    viaggioId,
                    prog++,
                    tratta.CittaPartenza,
                    tratta.CittaArrivo,
                    tratta.OrarioPartenza,
                    tratta.OrarioArrivo,
                    tratta.CodiceMezzo,
                    tratta.Mezzo
                ],
                `INSERT INTO TravelTrackerDB.Tratta (
                    Viaggio,
                    Progressivo,
                    CittaDiPartenza,
                    CittaDiArrivo,
                    OrarioPartenza,
                    OrarioArrivo,
                    CodiceMezzo,
                    TipologiaMezzo
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
            );
        }

        return true;
    } catch (error) {
        throw new Error(error.message || error);
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
    AddUser : AddUser,
    AddViaggio: AddViaggio
}