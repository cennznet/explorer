import { BigNumber } from 'bignumber.js';
import { toStdUnit, toBaseUnit, Unit } from '../unit-convert';

describe('unit-convert', () => {
	describe('toCENNZE', () => {
		it('should return CENNZ', () => {
			const val = toStdUnit('1100000000000000000').toString();
			expect(val).toEqual('1.1');
		});

		it('should accept big number', () => {
			const val = toStdUnit(new BigNumber('1100000000000000000')).toString();
			expect(val).toEqual('1.1');
		});

		it('should return CENNZ with given unit', () => {
			const val = toStdUnit('1100000000000000000', Unit.KUN).toString();
			expect(val).toEqual('1100');
		});
	});

	describe('toBaseUnit', () => {
		it('should return UN', () => {
			const val = toBaseUnit('1.23').toString();
			expect(val).toEqual('1230000000000000000');
		});

		it('should accept big number', () => {
			const val = toBaseUnit(new BigNumber('1.23')).toString();
			expect(val).toEqual('1230000000000000000');
		});

		it('should return UN with given unit', () => {
			const val = toBaseUnit('1.23', Unit.KUN).toString();
			expect(val).toEqual('1230');
		});
	});
});
