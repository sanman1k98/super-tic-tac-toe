/**
 * @typedef { 'X' | 'O' } PlayerMark
 */

/**
 * @typedef { 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 } GridPosition
 */

/**
 * @typedef { `${PlayerMark}${GridPosition}` } PlayerMove
 */

/**
 * Contains the moves played by both players.
 *
 * The game grid will be represented with positions corresponding to the
 * integers 1 through 9 inclusive as follows:
 *
 * ```
 *  1 ┃ 2 ┃ 3
 * ━━━╋━━━╋━━━
 *  4 ┃ 5 ┃ 6
 * ━━━╋━━━╋━━━
 *  7 ┃ 8 ┃ 9
 * ```
 *
 * Each move will be represented with 5 bits, where the most significant bit
 * represents the player and the remaining 4 bits the position.
 *
 * - X5 = 0b1_0101
 * - O9 = 0b0_1001
 * - X3 = 0b1_0011
 *
 */
export class TicTacToe {
	/**
	 * Backing buffer used to store all data for this game.
	 * @type {ArrayBuffer}
	 */
	#buf = new ArrayBuffer(2 + 2 + 9);

	/**
	 * Used to manipulate bytes within the array buffer.
	 * @type {DataView}
	 */
	#view = new DataView(this.#buf);

	/**
	 * Bitset used to represent the current positions occupied by X.
	 * @type {number}
	 */
	get #xMarks() {
		return this.#view.getUint16(0);
	}

	/**
	 * Bitset used to represent the current positions occupied by O.
	 * @type {number}
	 */
	get #oMarks() {
		return this.#view.getUint16(2);
	}

	set #xMarks(uint16) {
		this.#view.setUint16(0, uint16);
	}

	set #oMarks(uint16) {
		this.#view.setUint16(2, uint16);
	}

	/**
	 * The moves played by the players serialized into bytes.
	 * @type {Uint8Array}
	 */
	#moves = new Uint8Array(this.#buf, 4, 9);

	/**
	 * Encoded a string representation of a player's move as an unsigned 8-bit integer.
	 * @param {PlayerMove} str
	 * @returns {number} The unsigned 8-bit integer representation of the given move.
	 */
	static encodeMove(str) {
		if (typeof str !== 'string' || str.length !== 2)
			throw new Error('Expected a string with two chars', { cause: { value: str } });

		const [mark, position] = /** @type {[string, string]} */ (Array.from(str));
		let encoded = Number.parseInt(position, 10);

		if (Number.isNaN(encoded) || encoded < 1 || encoded > 9)
			throw new RangeError('InvalidGridPosition: Expected integer between 1 and 9 inclusive', { cause: { position: encoded } });
		if (mark === 'X')
			encoded |= 0b1_0000;
		else if (mark !== 'O')
			throw new Error('InvalidPlayerMark: Expected either "X" or "O"', { cause: { mark } });

		return encoded;
	}

	/**
	 * Take an unsigned 8-bit integer and get back the player move that it represents.
	 * @param {number} uint8
	 * @returns {PlayerMove} The move decoded from the given data.
	 */
	static decodeMove(uint8) {
		if (!Number.isInteger(uint8))
			throw new TypeError('Expected an integer', { cause: { value: uint8 } });

		const position = /** @type {GridPosition} */(uint8 & 0b0_1111);
		if (position < 1 || position > 9)
			throw new Error('InvalidGridPosition');

		const mark = uint8 >> 4;
		if (mark === 1)
			return `X${position}`;
		else if (mark === 0)
			return `O${position}`;
		else
			throw new Error('InvalidPlayerMove');
	}

	/**
	 * Get a bitmask for the specified positions on the grid.
	 * @param {number[]} positions - Integers between 1 and 9 inclusive.
	 * @returns {number} A bitmask with the specified bits turned on.
	 */
	static createMask(...positions) {
		let m = 0;
		for (const pos of positions) {
			switch (pos) {
				case 1: // Represented by least significant bit (0).
					m |= 0b000_000_001;
					break;
				case 2:
					m |= 0b000_000_010;
					break;
				case 3:
					m |= 0b000_000_100;
					break;
				case 4:
					m |= 0b000_001_000;
					break;
				case 5:
					m |= 0b000_010_000;
					break;
				case 6:
					m |= 0b000_100_000;
					break;
				case 7:
					m |= 0b001_000_000;
					break;
				case 8:
					m |= 0b010_000_000;
					break;
				case 9: // Represented by most significant bit (8).
					m |= 0b100_000_000;
					break;
				default:
					throw new RangeError('InvalidGridPosition: Expected integer between 1 and 9 inclusive', { cause: { value: pos } });
			}
		}
		return m;
	}

	static TOP_ROW_MASK = this.createMask(1, 2, 3);
	static MIDDLE_ROW_MASK = this.createMask(4, 5, 6);
	static BOTTOM_ROW_MASK = this.createMask(7, 8, 9);
	static LEFT_COL_MASK = this.createMask(1, 4, 7);
	static CENTER_COL_MASK = this.createMask(2, 5, 8);
	static RIGHT_COL_MASK = this.createMask(3, 6, 9);
	static DIAG_1_MASK = this.createMask(1, 5, 9);
	static DIAG_2_MASK = this.createMask(3, 5, 7);

	/**
	 * @param {number} marks - A player's marks represented by a bitfield.
	 */
	static getWinningMarks(marks) {
		marks = ~marks;

		if ((marks & this.DIAG_1_MASK) === 0)
			return this.DIAG_1_MASK;
		else if ((marks & this.DIAG_2_MASK) === 0)
			return this.DIAG_2_MASK;
		else if ((marks & this.TOP_ROW_MASK) === 0)
			return this.TOP_ROW_MASK;
		else if ((marks & this.MIDDLE_ROW_MASK) === 0)
			return this.MIDDLE_ROW_MASK;
		else if ((marks & this.BOTTOM_ROW_MASK) === 0)
			return this.BOTTOM_ROW_MASK;
		else if ((marks & this.LEFT_COL_MASK) === 0)
			return this.LEFT_COL_MASK;
		else if ((marks & this.CENTER_COL_MASK) === 0)
			return this.CENTER_COL_MASK;
		else if ((marks & this.RIGHT_COL_MASK) === 0)
			return this.RIGHT_COL_MASK;
		return 0;
	}

	/**
	 * @param {number} position - Integer between 1 and 9 inclusive.
	 */
	isTaken(position) {
		const mask = TicTacToe.createMask(position);
		return ((this.#xMarks | this.#oMarks) & mask) !== 0;
	}

	/**
	 * @type {PlayerMove[]}
	 */
	get moves() {
		return Array.from(this.#moves.filter(Boolean), TicTacToe.decodeMove);
	}

	get finished() {
		if (this.#moves.findLastIndex(Boolean) === this.#moves.length - 1)
			return true;
		else if (TicTacToe.getWinningMarks(this.#xMarks) || TicTacToe.getWinningMarks(this.#oMarks))
			return true;
		return false;
	}

	/**
	 * @param {PlayerMove} move
	 */
	play(move) {
		const idx = this.#moves.findLastIndex(Boolean) + 1;
		if (idx >= this.#moves.length)
			throw new Error('Unexpected game state');

		const byte = TicTacToe.encodeMove(move);
		const position = byte & 0x0F;
		const mark = byte >> 4;

		if (this.isTaken(position))
			throw new Error('Position is already taken');

		const mask = TicTacToe.createMask(position);

		if (mark === 1) {
			this.#moves.set([byte], idx);
			this.#xMarks |= mask;
		} else if (mark === 0) {
			this.#moves.set([byte], idx);
			this.#oMarks |= mask;
		}
	}
}
