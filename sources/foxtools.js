'use strict';

module.exports = {
	homeUrl : 'http://foxtools.ru/',
	getProxies : function( options ) {
		var emitter = options.newEventEmitter();
		var protocols = [
			[],										//
			[ 'http' ], 							//	1
			[ 'https' ], 							//	2
			[],										//
			[ 'socks4' ], 							//	4
			[],										//
			[],										//
			[],										//
			[ 'socks5' ],							//	8
			[],										//
			[],										//
			[],										//
			[],										//
			[],										//
			[],										//
			[ 'http', 'https', 'socks4', 'socks5' ]	//	15
		];
		var anonymityLevel = {
			None : 'transparent',
			Low : 'transparent',
			Medium : 'anonymous',
			High : 'elite',
			HighKeepAlive : 'elite',
			All : 'transparent',
			Unknown : 'transparent'
		};
		var pageCount = 1;
		( function request() {
			options.request( {
				url : 'http://api.foxtools.ru/v2/Proxy.json?page=' + page
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
					pageCount = data.response.pageCount;
					emitter.emit( 'data', data.response.items.map( function( currentValue, index, array ) {
						return {
							ipAddress : currentValue.ip,
							port : currentValue.port,
							anonymityLevel : anonymityLevel[ currentValue.anonymity ],
							protocols : protocols[ currentValue.type ],
							country : currentValue.country.iso3166a2.toLowerCase()
						};
					} ) );
				} catch( error ) {
					emitter.emit( 'error', error );
				}
				if( page < data.response.pageCount )
					request( page + 1);
				else
					emitter.emit( 'end' );
			} );
		} )( 1 );
		return emitter;
	}
};
