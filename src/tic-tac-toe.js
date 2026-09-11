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
	 * The moves played by the players serialized into bytes.
	 * @type {Uint8Array}
	 */
	#moves = new Uint8Array(9);

	/**
	 * Bitfields representing the positions occupied by each player.
	 * @type {{ x: number; o: number }}
	 */
	#marks = {
		x: 0b000_000_000,
		o: 0b000_000_000,
	};

	/**
	 * Get a bitmask for the specified positions on the grid.
	 * @param {number[]} positions - Integers between 1 and 9 inclusive.
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
		return ((this.#marks.x | this.#marks.o) & mask) !== 0;
	}

	/**
	 * @param {number} n
	 */
	static parseMoveData(n) {
		if (!Number.isInteger(n))
			throw new Error('InvalidMoveData: Expected an integer value', { cause: { data: n } });
		const position = n & 0b0_1111;
		if (position > 9 || position < 1)
			throw new Error('InvalidMoveData');
		const player = (n & 0b1_0000) === 1 ? 'x' : 'o';
		return { player, position };
	}

	/**
	 * @typedef {object} MoveInfo
	 * @property {'x' | 'o'} player Either X or O.
	 * @property {number} position The position on the grid.
	 */

	/**
	 * @type {MoveInfo[]}
	 */
	get moves() {
		return Array.from(this.#moves.filter(Boolean), (data) => {
			const player = (data & 0b1_0000) === 1 ? 'x' : 'o';
			const position = data & 0b0_1111;
			return { player, position };
		});
	}

	get finished() {
		if (this.#moves.findLastIndex(Boolean) === this.#moves.length - 1)
			return true;
		else if (TicTacToe.getWinningMarks(this.#marks.x) || TicTacToe.getWinningMarks(this.#marks.o))
			return true;
		return false;
	}

	/**
	 * @param {object} opts
	 * @param {'x' | 'o'} opts.player
	 * @param {number} opts.position
	 */
	play({ player, position }) {
		const idx = this.#moves.findLastIndex(Boolean) + 1;

		if (idx >= this.#moves.length)
			throw new Error('Unexpected game state');
		if (this.isTaken(position))
			throw new Error('Position is already taken');

		const mask = TicTacToe.createMask(position);

		if (player === 'x') {
			this.#moves.set([position | 0b1_0000], idx);
			this.#marks.x |= mask;
		} else if (player === 'o') {
			this.#moves.set([position], idx);
			this.#marks.o |= mask;
		} else {
			throw new RangeError('Expected either "x" or "o"', { cause: { player } });
		}
	}
}
