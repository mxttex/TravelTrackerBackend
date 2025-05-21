//importing main services
var express = require("express");
var bodyParser = require("body-parser");
var cors = require("cors");

//importing other js files with functions
var api = require("./crud");
var dbInteractions = require("./dbInteractions");

//declaring major variables
var app = express();
var router = express.Router();

//app.use
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use("/api", router);

//server starting
router.use((request, response, next) => {
  console.log("Server in funzione...");
  next();
});

//endpoint of getStation
router.route("/getStazione/:nStazione").get((req, res) => {
  console.log(req.params.nStazione);
  nomeStazione = req.params.nStazione;
  api.getStazione(nomeStazione).then((data) => {
    res.status(200).json(data);
    console.log(data);
  });
});

// router.route("/getStazioni").get((req, res) => {
//   api.getStations().then((data) => {
//     res.status(200).json(data)
//     console.log(data)
//   })
// })

//endpoint of getTicket given some starting parameters
router.route("/getTicket").post((req, res) => {
  console.log(req.body);  
  const searchParams = {
      departureLocationId: req.body.departureStation,
      arrivalLocationId: req.body.arrivalStation,
      departureTime: req.body.departureDate,
      arrivalTime : req.body.arrivalDate ? new Date(req.body.arrivalDate).toISOString() : null,
      adults: req.body.adultNumber,
      children: req.body.childrenNumber,
      criteria: req.body.criteria ? req.body.criteria : null,
      advancedSearchRequest: req.body.advancedSearchRequest ? req.body.advancedSearchRequest : null, 
    };


  if(searchParams.arrivalTime == null){
    delete searchParams.arrivalTime;
  }
  if(searchParams.advancedSearchRequest == null){
    delete searchParams.advancedSearchRequest;
  }
  if(searchParams.criteria == null){
    delete searchParams.criteria;
  }
  const searchParamsJson = JSON.stringify(searchParams);

  

  api.getTickets(searchParamsJson).then((data) => {
    res.status(201).json(data);
    
  });

});

//endpoint to getFlights
router.get("/getFlights", async (req, res) => {
  const { start, arrival, departureDate, returnDate, adults, children } =
    req.query;

  if (!start || !arrival || !departureDate || !adults) {
    return res.status(400).json({
      error:
        "Parametri obbligatori mancanti: start, arrival, departureDate e adults",
    });
  }

  const formattedDeparture = api.convertToApiDate(departureDate);
  const formattedReturn = returnDate ? api.convertToApiDate(returnDate) : null;

  if (!formattedDeparture || (returnDate && !formattedReturn)) {
    return res
      .status(400)
      .json({ error: "Formato data non valido. Usa DD/MM/YYYY-HH:MM" });
  }

  try {
    const adulti = parseInt(adults);
    const bambini = children ? parseInt(children) : 0;

    const andataData = await api.findFlights(
      start,
      arrival,
      formattedDeparture,
      adulti,
      bambini
    );
    const andata = (andataData.data || []).map((flight) => ({
      ...flight,
      tipo: "andata",
    }));

    let ritorno = [];
    if (formattedReturn) {
      const ritornoData = await api.findFlights(
        arrival,
        start,
        formattedReturn,
        adulti,
        bambini
      );
      ritorno = (ritornoData.data || []).map((flight) => ({
        ...flight,
        tipo: "ritorno",
      }));
    }

    const risultatiCombinati = [...andata, ...ritorno];

    risultatiCombinati.sort((a, b) => {
      const oraA = a.itineraries[0].segments[0].departure.at;
      const oraB = b.itineraries[0].segments[0].departure.at;
      return new Date(oraA) - new Date(oraB);
    });

    res.json(risultatiCombinati);
  } catch (error) {
    console.error("Errore nella richiesta ai voli:", error.message);
    res.status(500).json({ error: "Errore nella ricerca dei voli" });
  }
});

router.get('/getRandomFlights', async(req,res) => {
  try{
    const flights = await api.findRandomFlights();
    res.json(flights);
  }catch(error){
    console.error('Errore nella richiesta ai voli:', error.message);
    res.status(500).json({ error: 'Errore nella ricerca dei voli' });
  }
});

router.get("/getDelayFromAFlight", async (req, res) => {
  const {
    originLocationCode,
    destinationLocationCode,
    departureDate,
    departureTime,
    arrivalDate,
    arrivalTime,
    aircraftCode,
    carrierCode,
    flightNumber,
    duration
  } = req.query;

  if (!originLocationCode || !destinationLocationCode || !departureDate || !departureTime ||
      !arrivalDate || !arrivalTime || !aircraftCode || !carrierCode || !flightNumber || !duration) {
    return res.status(400).json({ error: 'Parametri mancanti: tutti i campi sono obbligatori' });
  }

  try {
    const prediction = await api.getDelayPrediction({
      originLocationCode,
      destinationLocationCode,
      departureDate,
      departureTime,
      arrivalDate,
      arrivalTime,
      aircraftCode,
      carrierCode,
      flightNumber,
      duration
    });
    res.json(prediction);
  } catch (error) {
    console.error("Errore nella delay prediction:", error.message);
    res.status(500).json({ error: "Errore nella delay prediction" });
  }
});

router.get("/getAeroporto/:nome", async (req, res) => {
  const nomeAeroporto = req.params.nome;

  try {
    const risultati = await api.getAeroporto(nomeAeroporto);
    res.status(200).json(risultati);
  } catch (error) {
    res.status(500).json({ error: "Errore nella ricerca aeroporto" });
  }
});

//used to add a user through dbInteraction's method
router.route("/addUser").post((req, res) => {
  dbInteractions.AddUser(req.body).then((data) => {
    try {
      res.status(201).json(data);
      console.log(data);
    } catch (ex) {
      res.status(500).send(`Errore nell'inserimento nel DB.`)
    }
  });
});


router.route("/tryToLog").post((req, res) => {
  //calling the method from the crud.js file
  console.dir(req.body)
  dbInteractions.TryToLog(req.body).then((data) => {
    try {
      if(data[0] == []){
        res.status(403).send(`No User Found.`)
        return;
      }
      res.status(200).json(data);
      console.log(data);
    } catch (ex) {
      res.status(500).send(`Errore interno al server.`)
    }
  });
});

router.route("/bookViaggio").post((req, res) => {
  res.status(500).send('ancora da implementare')
}) 

// console.log(await dbInteraction.TryToLog({Username: 'Nikolas', Password: 'ForzaNapoli'}));

var port = process.env.PORT || 8090;
app.listen(port);
console.log(`Le API sono in ascolto su http://localhost:${port}/api`);
