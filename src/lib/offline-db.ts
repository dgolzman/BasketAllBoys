import Dexie, { type Table } from 'dexie';

export interface OfflinePlayer {
    id: string;
    firstName: string;
    lastName: string;
    dni: string;
    birthDate: string | null;
    phone: string | null;
    email: string | null;
    status: string;
    tira: string;
    category: string | null;
    shirtNumber: string | null;
    partnerNumber: string | null;
    scholarship: boolean;
    playsPrimera: boolean;
    updatedAt: string;
}

export interface SyncMetadata {
    id: string; // e.g., 'players_sync'
    lastSync: number;
    count: number;
}

export class AllBoysOfflineDB extends Dexie {
    players!: Table<OfflinePlayer>;
    metadata!: Table<SyncMetadata>;
    categoryMappings!: Table<any>;

    constructor() {
        super('AllBoysBasketDB');
        this.version(2).stores({
            players: 'id, lastName, firstName, dni, tira, status',
            metadata: 'id',
            categoryMappings: 'id'
        });
    }
}

export const db = new AllBoysOfflineDB();
