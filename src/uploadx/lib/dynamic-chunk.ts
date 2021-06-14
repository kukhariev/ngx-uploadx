const MAX_FILE_SIZE = 5_497_558_138_880; // 5TB

class ChunkConfig {
  /** Fixed chunk size */
  chunkSize?: number;
  /** Maximum chunk size in bytes */
  maxChunkSize = MAX_FILE_SIZE;
  /** Minimum chunk size in bytes */
  minChunkSize = 262_144;
  /** Initial chunk size in bytes */
  initialChunkSize = 1_048_576;
  minChunkTime = 2;
  maxChunkTime = 8;
}

/**
 * Adaptive chunk size
 */
// tslint:disable-next-line: max-classes-per-file
export class DynamicChunk extends ChunkConfig {
  get size(): number {
    return this.chunkSize === 0 ? (this.chunkSize = MAX_FILE_SIZE) : this.chunkSize || this._size;
  }
  private _size = this.initialChunkSize;

  scale(throughput: number): number {
    if (!this.chunkSize) {
      const elapsedTime = this._size / throughput;
      if (elapsedTime < this.minChunkTime) {
        this._size = Math.min(this.maxChunkSize, this._size * 2);
      }
      if (elapsedTime > this.maxChunkTime) {
        this._size = Math.max(this.minChunkSize, this._size / 2);
      }
    }

    return this.size;
  }
}
