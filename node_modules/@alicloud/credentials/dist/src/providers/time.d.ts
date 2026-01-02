/**
 * Parses a UTC format date time string and returns the number of milliseconds between midnight,
 * January 1, 1970 Universal Coordinated Time (UTC) (or GMT) and the specified date.
 * @param value A UTC format date time string. For example: 2015-04-09T11:52:19Z
 * @returns The number of milliseconds between 1970.01.01 to the specified date.
 */
export declare function parseUTC(value: string): number;
