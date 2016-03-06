/**
 * Mock class of stdout.
 */
export default class StdOutMock {
  /**
   * Initialize instance.
   */
  constructor() {
    this._text = '';
  }

  /**
   * Gets the written text.
   *
   * @return {String} Text.
   */
  get text() {
    return this._text;
  }

  /**
   * Write the text.
   *
   * @param {String} text Text.
   */
  write( text ) {
    if( typeof text === 'string' ) {
      this._text = text;
    }
  }
}
