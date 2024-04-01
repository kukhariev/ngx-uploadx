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

  /**
   * Scales the chunk size based on the throughput.
   * If the elapsed time to upload a chunk is less than the min time, increase the chunk size.
   * If the elapsed time is more than the max time, decrease the chunk size.
   * Keeps the chunk size within the min and max limits.
   * @param throughput - represents the upload rate in bytes/sec.
   */
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
