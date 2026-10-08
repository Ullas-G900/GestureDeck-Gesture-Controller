export type PresentationFileKind = 'pdf' | 'pptx' | 'images';

export type PresentationFileLike = {
  name: string;
  type: string;
  size: number;
};

const IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp']);
const POWERPOINT_MIME =
  'application/vnd.openxmlformats-officedocument.presentationml.presentation';
const MAX_FILE_SIZE = 100 * 1024 * 1024;
const MAX_TOTAL_SIZE = 150 * 1024 * 1024;
const MAX_IMAGE_FILES = 40;

function extension(name: string): string {
  return name.split('.').pop()?.toLowerCase() ?? '';
}

function kindOf(file: PresentationFileLike): 'pdf' | 'pptx' | 'image' | null {
  const ext = extension(file.name);
  if (ext === 'pdf' || file.type === 'application/pdf') return 'pdf';
  if (ext === 'pptx' || file.type === POWERPOINT_MIME) return 'pptx';
  if (IMAGE_EXTENSIONS.has(ext) || file.type.startsWith('image/')) return 'image';
  return null;
}

export function validatePresentationFiles(
  files: readonly PresentationFileLike[],
): { kind: PresentationFileKind; files: readonly PresentationFileLike[] } {
  if (files.length === 0) throw new Error('Choose a file to open.');
  if (files.some((file) => file.size > MAX_FILE_SIZE)) {
    throw new Error('Each file must be smaller than 100 MB.');
  }
  if (files.reduce((total, file) => total + file.size, 0) > MAX_TOTAL_SIZE) {
    throw new Error('The selected files must total less than 150 MB.');
  }

  const types = files.map(kindOf);
  if (types.some((type) => type === null)) {
    const unsupportedIndex = types.findIndex((type) => type === null);
    throw new Error(`“${files[unsupportedIndex].name}” is not a supported file type.`);
  }

  if (types.every((type) => type === 'image')) {
    if (files.length > MAX_IMAGE_FILES) {
      throw new Error(`Choose up to ${MAX_IMAGE_FILES} images at a time.`);
    }
    return { kind: 'images', files };
  }

  if (files.length !== 1) {
    throw new Error('Choose one PDF or PowerPoint, or select a group of images.');
  }

  return { kind: types[0] as 'pdf' | 'pptx', files };
}
