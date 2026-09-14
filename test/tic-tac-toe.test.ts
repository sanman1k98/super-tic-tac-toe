/* eslint-disable test/no-import-node-test */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { TicTacToe } from '../src/tic-tac-toe.js';

describe('Grid positions', () => {
	it('Creates bitmasks for specified positions', () => {
		assert.equal(TicTacToe.createGridMask(1), 0b000_000_001);
		assert.equal(TicTacToe.createGridMask(2), 0b000_000_010);
		assert.equal(TicTacToe.createGridMask(3), 0b000_000_100);
		assert.equal(TicTacToe.createGridMask(4), 0b000_001_000);
		assert.equal(TicTacToe.createGridMask(5), 0b000_010_000);
		assert.equal(TicTacToe.createGridMask(6), 0b000_100_000);
		assert.equal(TicTacToe.createGridMask(7), 0b001_000_000);
		assert.equal(TicTacToe.createGridMask(8), 0b010_000_000);
		assert.equal(TicTacToe.createGridMask(9), 0b100_000_000);

		assert.equal(TicTacToe.createGridMask(1, 2, 3), 0b000_000_111);
		assert.equal(TicTacToe.createGridMask(4, 5, 6), 0b000_111_000);
		assert.equal(TicTacToe.createGridMask(7, 8, 9), 0b111_000_000);
	});

	it('Can get a list of positions from a bitmask', () => {
		assert.deepEqual(TicTacToe.getGridPositions(0b000_000_001), [1]);
		assert.deepEqual(TicTacToe.getGridPositions(0b000_000_010), [2]);
		assert.deepEqual(TicTacToe.getGridPositions(0b000_000_100), [3]);
		assert.deepEqual(TicTacToe.getGridPositions(0b000_001_000), [4]);
		assert.deepEqual(TicTacToe.getGridPositions(0b000_010_000), [5]);
		assert.deepEqual(TicTacToe.getGridPositions(0b000_100_000), [6]);
		assert.deepEqual(TicTacToe.getGridPositions(0b001_000_000), [7]);
		assert.deepEqual(TicTacToe.getGridPositions(0b010_000_000), [8]);
		assert.deepEqual(TicTacToe.getGridPositions(0b100_000_000), [9]);

		assert.deepEqual(TicTacToe.getGridPositions(0b000_000_111), [1, 2, 3]);
		assert.deepEqual(TicTacToe.getGridPositions(0b000_111_000), [4, 5, 6]);
		assert.deepEqual(TicTacToe.getGridPositions(0b111_000_000), [7, 8, 9]);
	});

	it('Has bitmasks for all winning three-in-a-row positions', () => {
		assert.equal(
			TicTacToe.DIAG_1_MASK,
			0b100_010_001,
		);
		assert.equal(
			TicTacToe.DIAG_2_MASK,
			0b001_010_100,
		);
		assert.equal(
			TicTacToe.TOP_ROW_MASK,
			0b000_000_111,
		);
		assert.equal(
			TicTacToe.MIDDLE_ROW_MASK,
			0b000_111_000,
		);
		assert.equal(
			TicTacToe.BOTTOM_ROW_MASK,
			0b111_000_000,
		);
		assert.equal(
			TicTacToe.LEFT_COL_MASK,
			0b001_001_001,
		);
		assert.equal(
			TicTacToe.CENTER_COL_MASK,
			0b010_010_010,
		);
		assert.equal(
			TicTacToe.RIGHT_COL_MASK,
			0b100_100_100,
		);
	});
});

describe('Player moves', () => {
	it('Encodes', () => {
		assert.equal(TicTacToe.encodeMove('X1'), 0x11);
		assert.equal(TicTacToe.encodeMove('X2'), 0x12);
		assert.equal(TicTacToe.encodeMove('X3'), 0x13);
		assert.equal(TicTacToe.encodeMove('X4'), 0x14);
		assert.equal(TicTacToe.encodeMove('X5'), 0x15);
		assert.equal(TicTacToe.encodeMove('X6'), 0x16);
		assert.equal(TicTacToe.encodeMove('X7'), 0x17);
		assert.equal(TicTacToe.encodeMove('X8'), 0x18);
		assert.equal(TicTacToe.encodeMove('X9'), 0x19);

		assert.equal(TicTacToe.encodeMove('O1'), 0x01);
		assert.equal(TicTacToe.encodeMove('O2'), 0x02);
		assert.equal(TicTacToe.encodeMove('O3'), 0x03);
		assert.equal(TicTacToe.encodeMove('O4'), 0x04);
		assert.equal(TicTacToe.encodeMove('O5'), 0x05);
		assert.equal(TicTacToe.encodeMove('O6'), 0x06);
		assert.equal(TicTacToe.encodeMove('O7'), 0x07);
		assert.equal(TicTacToe.encodeMove('O8'), 0x08);
		assert.equal(TicTacToe.encodeMove('O9'), 0x09);
	});

	it('Decodes', () => {
		assert.equal(TicTacToe.decodeMove(0x11), 'X1');
		assert.equal(TicTacToe.decodeMove(0x12), 'X2');
		assert.equal(TicTacToe.decodeMove(0x13), 'X3');
		assert.equal(TicTacToe.decodeMove(0x14), 'X4');
		assert.equal(TicTacToe.decodeMove(0x15), 'X5');
		assert.equal(TicTacToe.decodeMove(0x16), 'X6');
		assert.equal(TicTacToe.decodeMove(0x17), 'X7');
		assert.equal(TicTacToe.decodeMove(0x18), 'X8');
		assert.equal(TicTacToe.decodeMove(0x19), 'X9');

		assert.equal(TicTacToe.decodeMove(0x01), 'O1');
		assert.equal(TicTacToe.decodeMove(0x02), 'O2');
		assert.equal(TicTacToe.decodeMove(0x03), 'O3');
		assert.equal(TicTacToe.decodeMove(0x04), 'O4');
		assert.equal(TicTacToe.decodeMove(0x05), 'O5');
		assert.equal(TicTacToe.decodeMove(0x06), 'O6');
		assert.equal(TicTacToe.decodeMove(0x07), 'O7');
		assert.equal(TicTacToe.decodeMove(0x08), 'O8');
		assert.equal(TicTacToe.decodeMove(0x09), 'O9');
	});

	it('Throws for invalid inputs', () => {
		assert.throws(
			// @ts-expect-error invalid grid position
			() => TicTacToe.encodeMove('X0'),
			RangeError,
		);
		assert.throws(
			() => TicTacToe.decodeMove(0x00),
			Error,
		);
	});
});

describe('Game state', () => {
	it('Can determine if a position is taken', () => {
		const game = new TicTacToe();
		game.play('X5');

		assert(!game.isTaken(1));
		assert(!game.isTaken(2));
		assert(!game.isTaken(3));
		assert(!game.isTaken(4));
		assert(!game.isTaken(6));
		assert(!game.isTaken(7));
		assert(!game.isTaken(8));
		assert(!game.isTaken(9));

		assert(game.isTaken(5));

		game.play('O9');

		assert(!game.isTaken(1));
		assert(!game.isTaken(2));
		assert(!game.isTaken(3));
		assert(!game.isTaken(4));
		assert(!game.isTaken(6));
		assert(!game.isTaken(7));
		assert(!game.isTaken(8));

		assert(game.isTaken(5));
		assert(game.isTaken(9));
	});
});
