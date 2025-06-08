let express = require('express'),
  mongoose = require('mongoose'),
  cors = require('cors'),
  bodyParser = require('body-parser'),
  createError = require('http-errors');

const { insightsApi, insightsWorker } = require('./routes/insights.routes')
const config = require("./config/config");

// MongoDB Configuration
mongoose.Promise = global.Promise;
mongoose.connect(config.dbConnectionString, {
  useNewUrlParser: true
}).then(() => 
{
  console.log('Database sucessfully connected')
},
error => {
  console.log('Database could not be connected: ' + error)
})

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cors());

app.use('/insights', insightsApi)

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});
  
// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;

  // render the error page
  res.status(err.status || 500).send(err.message);
});

const port = process.env.PORT || 4000;
const server = app.listen(port, () => {
  console.log('Connected to port ' + port)

  // Run the insights worker
  insightsWorker()
  .then(() => {
    console.log('Worker started successfully');
  })
  .catch(err => {
    console.error('Error starting worker:', err);
  });
})