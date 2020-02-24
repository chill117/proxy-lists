'use strict';

module.exports = {
	homeUrl : 'https://hidester.com/',
	getProxies : function( options ) {
		var emitter = options.newEventEmitter();
		( function request( offset ) {
			options.request( {
				url : 'https://hidester.com/proxydata/php/data.php?mykey=data&offset=' + offset + '&limit=5&orderBy=latest_check&sortOrder=DESC&country=&port=&type=11&anonymity=7&ping=7&gproxy=2',
				headers : {
					'User-Agent' : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36',
					'Referer' : 'https://hidester.com/proxylist/'
				}
			}, function( error, response, data ) {
				if( error )
					emitter.emit( 'error', error );
				if( response.statusCode >= 300 ) {
					error = new Error( data );
					error.status = response.statusCode;
					emitter.emit( 'error', error );
				}
				try {
					data = JSON.parse( data );
					if( data.length > 0 )
						emitter.emit( 'data', data.map( function( currentValue, index, array ) {
							return {
								ipAddress : currentValue.IP,
								port : currentValue.PORT,
								anonymityLevel : currentValue.anonymity.toLowerCase(),
								protocols : [ currentValue.type ]
							};
						} ) );
				} catch( error ) {
					emitter.emit( 'error', error );
				}
				if( data.length > 0 )
					request( offset + 1 );
				else
					emitter.emit( 'end' );
			} );
		} )( 0 );
		return emitter;
	}
};
