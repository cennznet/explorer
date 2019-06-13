import { BigNumber } from 'bignumber.js';
BigNumber.config({
FORMAT: {
	decimalSeparator: '.',
	// grouping separator of the integer part
	groupSeparator: ',',
	// primary grouping size of the integer part
	groupSize: 3,
	// secondary grouping size of the integer part
	secondaryGroupSize: 0,
	// grouping separator of the fraction part
	fractionGroupSeparator: ',',
	// grouping size of the fraction part
	fractionGroupSize: 3
},
	DECIMAL_PLACES: 2
});

export enum Unit {
	CENNZ = 0,
	KUN = 5,
	UN = 6
}

const LEVEL = new BigNumber('1000');

export function toStdUnit(value: string | BigNumber, currentUnit: Unit = Unit.UN): BigNumber {
	if (typeof  value === 'string') {
		value = new BigNumber(value);
	}
	const diff = LEVEL.pow(currentUnit - Unit.CENNZ);
	return value.div(diff);
}

export function toBaseUnit(value: string | BigNumber, currentUnit: Unit = Unit.CENNZ): BigNumber {
	if (typeof  value === 'string') {
		value = new BigNumber(value);
	}
	const diff = LEVEL.pow(Unit.UN - currentUnit);
	return value.multipliedBy(diff);
}
