'use strict';

/**
 * Display the log message for the stdout.
 */
class Logger {
  /**
   * Initialize instance.
   *
   * @param {Boolean} available "true" to display the report, default is "true".
   */
  constructor( available = true ) {
    if( available === null || available === undefined ) {
      available = true;
    }

    this._available = available;
  }

  /**
   * Display a log message for the stdout.
   *
   * @param {Array.<Object>} args Message arguments.
   */
  log( ...args ) {
    if( this._available ) {
      console.log( ...args );
    }
  }

  /**
   * Display an error message for the stdout.
   *
   * @param {Array.<Object>} args Message arguments.
   */
  error( ...args ) {
    if( this._available ) {
      console.error( ...args );
    }
  }
}

module.exports = Logger;
