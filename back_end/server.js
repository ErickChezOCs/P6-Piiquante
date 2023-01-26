const http = require('http');
const app = require('./app');



const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)); 

