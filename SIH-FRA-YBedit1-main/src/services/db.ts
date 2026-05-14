import Dexie, { Table } from 'dexie';

export interface DbClaim {
  id: string; // claim-<timestamp>
  userId: string;
  village: string;
  area: number;
  coordinates: string;
  documentUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  approvedAt?: string;
  applicantName?: string;
  claimType?: string;
  documents?: string[];
  aadhaar?: string; // 12-digit UID; unique when present
}

export interface OcrResultRow {
  id?: number;
  createdAt: string;
  source: 'upload' | 'camera' | 'document';
  filename?: string;
  text: string;
  confidence?: number;
  processingTimeSec?: number;
  parsedFields?: Record<string, string>;
}

class AppDatabase extends Dexie {
  claims!: Table<DbClaim, string>;
  ocrResults!: Table<OcrResultRow, number>;

  constructor() {
    super('FRAAppDB');
    this.version(1).stores({
      claims: 'id, userId, status, createdAt',
      ocrResults: '++id, createdAt',
    });
    this.version(2).stores({
      claims: 'id, userId, status, createdAt, aadhaar',
      ocrResults: '++id, createdAt',
    }).upgrade(async (tx) => {
      // no-op: existing rows will just not have aadhaar until updated
    });
  }
}

export const db = new AppDatabase();

export async function seedClaimsIfEmpty(seed: DbClaim[]) {
  const count = await db.claims.count();
  if (count === 0 && seed.length > 0) {
    await db.claims.bulkAdd(seed);
  }
}


