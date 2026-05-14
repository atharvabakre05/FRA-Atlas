import { db, DbClaim, OcrResultRow } from './db';

export const dataStore = {
  async addClaim(claim: DbClaim) {
    await db.claims.put(claim);
    return claim;
  },
  async updateClaimStatus(id: string, status: DbClaim['status']) {
    await db.claims.update(id, { status });
  },
  async getClaim(id: string) {
    return db.claims.get(id);
  },
  async getAllClaims() {
    return db.claims.orderBy('createdAt').reverse().toArray();
  },
  async getUserClaims(userId: string) {
    return db.claims.where('userId').equals(userId).toArray();
  },
  async addOcrResult(row: OcrResultRow) {
    const id = await db.ocrResults.add(row);
    return { ...row, id };
  },
  async getOcrResults() {
    return db.ocrResults.orderBy('createdAt').reverse().toArray();
  }
};



