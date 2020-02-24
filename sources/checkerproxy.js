'use strict';

module.exports = {
	homeUrl : 'https://checkerproxy.net/',
	getProxies : function( options ) {
		var emitter = options.newEventEmitter();
		var now = Date.now();
		var protocols = [
			[],					//
			[ 'http' ], 		//	1
			[ 'https' ], 		//	2
			[],					//
			[ 'socks5' ], 		//	4
			[ 'http', 'https' ] //	5
		];
		var anonymityLevel = [
			'transparent',		//	0
			null,				//
			'anonymous'			//	2
		];
		require( 'async' ).mapLimit( new Array( 14 ).fill( null ).map( function( currentValue, index, array ) {
			return new Date( now - index * 86400 * 1000 ).toISOString().split( 'T' )[ 0 ];
		} ), 1, function( item, callback ) {
			options.request( {
				url : 'https://checkerproxy.net/api/archive/' + item
			}, function( error, response, data ) {
				if( error )
					return callback( error );
				if( response.statusCode >= 300 ) {
					error = new Error( data );
					error.status = response.statusCode;
					return callback( error );
				}
				try {
					return callback( null, JSON.parse( data ).map( function( currentValue, index, array ) {
						currentValue.addr = currentValue.addr.split( ':' );
						return {
							ipAddress : currentValue.addr[ 0 ],
							port : currentValue.addr[ 1 ],
							anonymityLevel : anonymityLevel[ currentValue.kind ],
							protocols : protocols[ currentValue.type ],
							country : currentValue.addr_geo_iso
						};
					} ) );
				} catch( error ) {
					return callback( error );
				}
			} );
		}, function( err, results ) {
			if( err )
				emitter.emit( 'error', err );
			else {
				emitter.emit( 'data', results.flat() );
				emitter.emit( 'end' );
			}
		} );
		return emitter;
	}
};
