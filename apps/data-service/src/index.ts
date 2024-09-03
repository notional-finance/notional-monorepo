import cronApp from './cronApp';
import app from './dataApp';
// Register an HTTP function with the Functions Framework that will be executed
// when you make an HTTP request to the deployed function's endpoint.
exports.dataService = app;
exports.cronService = cronApp;
