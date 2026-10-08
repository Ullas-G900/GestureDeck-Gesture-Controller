import assert from 'node:assert/strict';
import test from 'node:test';
import { validatePresentationFiles, type PresentationFileLike } from './presentationFiles';

const file = (
  name: string,
  type = '',
  size = 1024,
): PresentationFileLike => ({ name, type, size });

test('accepts one PDF, one PowerPoint, or a group of images', () => {
  assert.equal(validatePresentationFiles([file('deck.pdf')]).kind, 'pdf');
  assert.equal(validatePresentationFiles([file('deck.pptx')]).kind, 'pptx');
  assert.equal(
    validatePresentationFiles([file('one.png'), file('two.jpg')]).kind,
    'images',
  );
});

test('rejects unsupported and mixed document selections', () => {
  assert.throws(() => validatePresentationFiles([file('notes.docx')]), /not a supported/);
  assert.throws(
    () => validatePresentationFiles([file('deck.pdf'), file('photo.png')]),
    /Choose one PDF or PowerPoint/,
  );
});

test('rejects oversized uploads and excessive image batches', () => {
  assert.throws(
    () => validatePresentationFiles([file('large.pdf', '', 101 * 1024 * 1024)]),
    /smaller than 100 MB/,
  );
  assert.throws(
    () => validatePresentationFiles(
      Array.from({ length: 41 }, (_, index) => file(`image-${index}.png`)),
    ),
    /up to 40 images/,
  );
});
