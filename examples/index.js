const wpxml2md = require( 'wpxml2md' );
const util = require( './util.js' );

const dest = './dest';
util.mkdirSync( dest );

wpxml2md( 'wp.xml', dest, { report: true } )
.then( () => {
  console.log( 'Completed!!!' );
} )
.catch( ( err ) => {
  console.error( err );
} );
