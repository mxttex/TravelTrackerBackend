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
async function TryToLog(data) {
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

//dynamically add tratte give a viaggio
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

//fetching all viaggi given a User Username
async function FetchAllViaggiGivenUser(data) {
    try {
        return await DoQuery(
            [data.UsernameCliente],
            `
            SELECT Viaggio.Id
            FROM Viaggo join Cliente on Viaggio.Cliente = Cliente.Username
            WHERE Cliente.Username = ?
            `
        )
    } catch (error) {
        throw new Error(error.message || error);
    }
}

//fetch all tratte given a viaggio.id
async function FetchTratteGivenViaggio(data) {
    try {
        return await DoQuery(
            [data.IdViaggio],
            `
            SELECT Tratta.Progressivo, Tratta.Viaggio
            FROM Tratta join Viaggio on Tratta.Viaggio = Viaggio.Id
            WHERE Viaggio.Id = ?
            `
        )
    } catch (error) {
        throw new Error(error.message || error);
    }
}

//fetch a Viaggio given its starting and ending cities
async function FetchViaggioGivenPartenzaArrivoUtente(data) {
    try {
        return await DoQuery(
            [data.CittaDiPartenza, data.CittaDiArrivo],
            `
            SELECT Viaggio.Id
            FROM Viaggio
            WHERE Viaggio.CittaDiPartenza = ? AND Viaggio.CittaDiArrivo = ?
            `
        )
    } catch (error) {
        throw new Error(error.message || error);
    }
}

//core of every query, it enstablish a connection with the db and allows to do queries
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

//export of various methods from this file to others
module.exports = {
    TryToLog: TryToLog,
    AddUser: AddUser,
    AddViaggio: AddViaggio,
    FetchAllViaggiGivenUser: FetchAllViaggiGivenUser,
    FetchTratteGivenViaggio: FetchTratteGivenViaggio,
    FetchViaggioGivenPartenzaArrivoUtente: FetchViaggioGivenPartenzaArrivoUtente
}