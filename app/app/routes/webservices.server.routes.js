'use strict';

module.exports = function(app) {
	// Root routing
	var webservices = require('../../app/controllers/webservices.server.controller');
	app.route('/services/testapi').get(webservices.testapi);

	// Game Creation
	app.route('/services/game/create').post(webservices.createGame);
	// Waiting room : get the games one can join
	app.route('/services/game/getWaiting').get(webservices.getWaiting);

};