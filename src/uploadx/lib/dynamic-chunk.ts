const KiB = 1024;
/**
 * Adaptive chunk size
 */
export class DynamicChunk {
  /** Maximum chunk size in bytes */
  static maxSize = Number.MAX_SAFE_INTEGER;
  /** Minimum chunk size in bytes */
  static minSize = 256 * KiB;
  /** Initial chunk size in bytes */
  static size = 4 * (256 * KiB);
  static minChunkTime = 8;
  static maxChunkTime = 24;

  static scale(throughput: number): number {
    const elapsedTime = DynamicChunk.size / throughput;
    if (elapsedTime < DynamicChunk.minChunkTime) {
      DynamicChunk.size = Math.min(DynamicChunk.maxSize, DynamicChunk.size * 2);
    }
    if (elapsedTime > DynamicChunk.maxChunkTime) {
      DynamicChunk.size = Math.max(DynamicChunk.minSize, DynamicChunk.size / 2);
    }
    return DynamicChunk.size;
  }
}
