var express = require("express");
var api = require("./crud");
var bodyParser = require("body-parser");
var cors = require("cors");
var app = express();
var router = express.Router();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use("/api", router);

router.use((request, response, next) => {
  console.log("Server in funzione...");
  next();
});

router.route("/getStazione/:nStazione").get((req, res) => {
  console.log(req.params.nStazione);
  nomeStazione = req.params.nStazione;
  api.getStazione(nomeStazione).then((data) => {
    res.status(201).json(data);
    console.log(data);
  });
});

// router.route("/getStazioni").get((req, res) => {
//   api.getStations().then((data) => {
//     res.status(201).json(data)
//     console.log(data)
//   })
// })


router.route("/getTicket").post((req, res) => {
 
    const searchParams = {
      departureLocationId: req.body.departureLocationId,
      arrivalLocationId: req.body.arrivalLocationId,
      departureTime: req.body.departureTime,
      adults: req.body.adults,
      children: req.body.children,
      criteria: req.body.criteria,
      advancedSearchRequest: req.body.advancedSearchRequest,
    };

  api.getTickets(searchParams).then((data) => {
    res.status(201).json(data);
    console.log(data);
  });
});

router.get('/getFlights', async (req, res) => {
  const { start, arrival, departureDate, returnDate, adults, children } = req.query;

  if (!start || !arrival || !departureDate || !adults) {
    return res.status(400).json({ error: 'Parametri obbligatori mancanti: start, arrival, departureDate e adults' });
  }

  const formattedDeparture = api.convertToApiDate(departureDate);
  const formattedReturn = returnDate ? api.convertToApiDate(returnDate) : null;

  if (!formattedDeparture || (returnDate && !formattedReturn)) {
    return res.status(400).json({ error: 'Formato data non valido. Usa DD/MM/YYYY-HH:MM' });
  }

  try {
    const adulti = parseInt(adults);
    const bambini = children ? parseInt(children) : 0;

    const andataData = await api.findFlights(start, arrival, formattedDeparture, adulti, bambini);
    const andata = (andataData.data || []).map(flight => ({
      ...flight,
      tipo: 'andata'
    }));

    let ritorno = [];
    if (formattedReturn) {
      const ritornoData = await api.findFlights(arrival, start, formattedReturn, adulti, bambini);
      ritorno = (ritornoData.data || []).map(flight => ({
        ...flight,
        tipo: 'ritorno'
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
    console.error('Errore nella richiesta ai voli:', error.message);
    res.status(500).json({ error: 'Errore nella ricerca dei voli' });
  }
});



var port = process.env.PORT || 8090;
app.listen(port);
console.log(`Le API sono in ascolto su http://localhost:${port}/api`);
