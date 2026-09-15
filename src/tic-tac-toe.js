/**
 * @typedef { 'X' | 'O' } PlayerMark
 */

/**
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
 * @typedef { 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 } GridPosition
 */

/**
 * All the possible moves that can be played in a game of tic-tac-toe.
 *
 * A move can be encoded with 5 bits:
 * - bits 0-3 for the grid position
 * - bit 4 as a flag for the mark (X or O)
 *
 * Examples:
 * - X5 = 0b1_0101
 * - O9 = 0b0_1001
 * - X3 = 0b1_0011
 * @typedef {`${PlayerMark}${GridPosition}`} PlayerMove
 */

/**
 * Encapsulates the logic and state management for a game of tic-tac-toe.
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
	 * The players' moves encoded into bytes.
	 * @type {Uint8Array}
	 */
	#moves = new Uint8Array(this.#buf, 4, 9);

	/**
	 * Encode a player's move into a byte.
	 * @param {PlayerMove} str
	 * @returns {number} The byte value as an unsigned 8-bit integer.
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
	 * Decode a player move from a byte.
	 * @param {number} uint8 The byte value as an unsigned 8-bit integer.
	 * @returns {PlayerMove} The decoded player move.
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
	 * Get all the positions set to 1 from the given grid mask.
	 * @param {number} mask A 9-bit long bitmask
	 * @returns {GridPosition[]} List of positions set to 1 in the given grid mask.
	 */
	static getGridPositions(mask) {
		if (!Number.isInteger(mask) || mask < 0 || mask > 0x1FF)
			throw new TypeError('InvalidGridMask: Expected integer between 0 and 511 inclusive', { cause: { value: mask } });

		/** @type {GridPosition[]} */
		const positions = [];

		for (let i = 0; i < 9; i++) {
			if ((mask >> i) & 1)
				positions.push(/** @type {GridPosition} */(i + 1));
		}

		return positions;
	}

	/**
	 * Get a bitmask for the specified positions on the grid.
	 * @param {GridPosition[]} positions - Integers between 1 and 9 inclusive.
	 * @returns {number} A bitmask with the specified bits turned on.
	 */
	static createGridMask(...positions) {
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

	static TOP_ROW_MASK
		= this.createGridMask(1, 2, 3);

	static MIDDLE_ROW_MASK
		= this.createGridMask(4, 5, 6);

	static BOTTOM_ROW_MASK
		= this.createGridMask(7, 8, 9);

	static LEFT_COL_MASK
		= this.createGridMask(1, 4, 7);

	static CENTER_COL_MASK
		= this.createGridMask(2, 5, 8);

	static RIGHT_COL_MASK
		= this.createGridMask(3, 6, 9);

	static DIAG_1_MASK
		= this.createGridMask(1, 5, 9);

	static DIAG_2_MASK
		= this.createGridMask(3, 5, 7);

	/**
	 * Get a grid mask of the marks that are three-in-a-row.
	 * @param {number} marks A player's marks represented by a bitfield.
	 * @returns {number} Zero if there are no marks that are three-in-a-row.
	 */
	static getWinningGridMask(marks) {
		if (!Number.isInteger(marks) || marks < 0 || marks > 0x1FF)
			throw new TypeError('InvalidGridMask: Expected an integer between 0 and 0x1FF inclusive', { cause: { value: marks } });

		const unmarked = ~marks;
		let mask = 0;

		if ((unmarked & this.DIAG_1_MASK) === 0)
			mask |= this.DIAG_1_MASK;
		if ((unmarked & this.DIAG_2_MASK) === 0)
			mask |= this.DIAG_2_MASK;
		if ((unmarked & this.TOP_ROW_MASK) === 0)
			mask |= this.TOP_ROW_MASK;
		if ((unmarked & this.MIDDLE_ROW_MASK) === 0)
			mask |= this.MIDDLE_ROW_MASK;
		if ((unmarked & this.BOTTOM_ROW_MASK) === 0)
			mask |= this.BOTTOM_ROW_MASK;
		if ((unmarked & this.LEFT_COL_MASK) === 0)
			mask |= this.LEFT_COL_MASK;
		if ((unmarked & this.CENTER_COL_MASK) === 0)
			mask |= this.CENTER_COL_MASK;
		if ((unmarked & this.RIGHT_COL_MASK) === 0)
			mask |= this.RIGHT_COL_MASK;

		return mask;
	}

	/**
	 * @param {GridPosition} position - Integer between 1 and 9 inclusive.
	 */
	isTaken(position) {
		const mask = TicTacToe.createGridMask(position);
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
		else if (TicTacToe.getWinningGridMask(this.#xMarks) || TicTacToe.getWinningGridMask(this.#oMarks))
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
		const position = /** @type {GridPosition} */(byte & 0x0F);
		const mark = byte >> 4;

		if (this.isTaken(position))
			throw new Error('Position is already taken');

		const mask = TicTacToe.createGridMask(position);

		if (mark === 1) {
			this.#moves.set([byte], idx);
			this.#xMarks |= mask;
		} else if (mark === 0) {
			this.#moves.set([byte], idx);
			this.#oMarks |= mask;
		}
	}
}
