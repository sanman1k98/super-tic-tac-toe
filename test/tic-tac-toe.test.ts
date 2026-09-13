/* eslint-disable test/no-import-node-test */

import assert from 'node:assert';
import { describe, it } from 'node:test';
import { TicTacToe } from '../src/tic-tac-toe.js';

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
	});
});
