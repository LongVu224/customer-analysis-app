let express = require('express'),
  mongoose = require('mongoose'),
  cors = require('cors');

const monitorApi = require('./routes/monitor.routes')
const config = require("./config/config");
const { getSecrets } = require("./config/keyvault");

const app = express();
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use(cors());

app.use('/monitor', monitorApi)

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
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
    await mongoose.connect(config.dbConnectionString);
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