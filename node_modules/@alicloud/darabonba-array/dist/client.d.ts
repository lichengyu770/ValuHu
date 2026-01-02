/**
 * This is a array module
 */
export default class Client {
    static split(raw: string[], index: number, limit: number): string[];
    static contains(raw: string[], str: string): boolean;
    static index(raw: string[], str: string): number;
    static size(raw: string[]): number;
    static get(raw: string[], index: number): string;
    static join(raw: string[], sep: string): string;
    static concat(raw: string[], sep: string[]): string[];
    static ascSort(raw: string[]): string[];
    static descSort(raw: string[]): string[];
    /**
     * append any array item
     */
    static append(array: any, item: any): void;
}
