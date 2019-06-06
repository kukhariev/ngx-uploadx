import { UploaderX } from '../../uploadx';

export class UploaderExt extends UploaderX {
  // Disable delete files on cancel
  onCancel() {}
}
