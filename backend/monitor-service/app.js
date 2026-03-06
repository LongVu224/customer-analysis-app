let express = require('express'),
  mongoose = require('mongoose'),
  cors = require('cors'),
  bodyParser = require('body-parser'),
  createError = require('http-errors');

const monitorApi = require('./routes/monitor.routes')
const config = require("./config/config");
const { getSecrets } = require("./config/keyvault");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cors());

app.use('/monitor', monitorApi)

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

// Async startup: fetch secrets from Key Vault, then connect to MongoDB
async function startServer() {
  try {
    // Fetch secrets from Azure Key Vault
    const secrets = await getSecrets(config.keyVaultName);
    config.dbConnectionString = secrets.dbConnectionString;

    // MongoDB Configuration
    mongoose.Promise = global.Promise;
    await mongoose.connect(config.dbConnectionString, {
      useNewUrlParser: true
    });
    console.log('✓ Database successfully connected');

    const port = process.env.PORT || 4000;
    app.listen(port, () => {
      console.log(`✓ Monitor service running on port ${port}`);
    });
  } catch (error) {
    console.error('✗ Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();