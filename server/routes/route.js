const router = require('express').Router();
const  {setupPage,  dualPage, addFlow}  =  require('../controllers/controller')

module.exports = function (io) {
  router.get('/setup',  setupPage)
  router.get('/dual',  dualPage)
  router.post('/add_flow', addFlow)
    // router.get('/setup', (req, res, next) => {
    //   res.render('setupEsp',{ maxCheckPoints: process.env.maxCheckPoints }); 
    // });
    // router.get('/dual', (req, res, next) => {
    //   res.render('dual'); 
    // });
    //s
    return router;
}