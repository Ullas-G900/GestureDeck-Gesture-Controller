import type { PDFDocumentLoadingTask, PDFDocumentProxy } from 'pdfjs-dist';
import type { PptxRenderer } from 'pptx-browser';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { validatePresentationFiles } from './presentationFiles';

export type ImportedPresentation =
  | {
      kind: 'pdf';
      name: string;
      pageCount: number;
      document: PDFDocumentProxy;
      loadingTask: PDFDocumentLoadingTask;
    }
  | {
      kind: 'pptx';
      name: string;
      pageCount: number;
      renderer: PptxRenderer;
    }
  | {
      kind: 'images';
      name: string;
      pageCount: number;
      images: string[];
    };

export async function loadImportedPresentation(
  files: readonly File[],
): Promise<ImportedPresentation> {
  const selection = validatePresentationFiles(files);

  if (selection.kind === 'images') {
    return {
      kind: 'images',
      name: files.length === 1 ? files[0].name : `${files.length} images`,
      pageCount: files.length,
      images: files.map((file) => URL.createObjectURL(file)),
    };
  }

  const file = files[0];
  if (selection.kind === 'pdf') {
    const pdfjs = await import('pdfjs-dist');
    pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
    const loadingTask = pdfjs.getDocument({
      data: new Uint8Array(await file.arrayBuffer()),
    });
    try {
      const document = await loadingTask.promise;
      if (document.numPages < 1) {
        await loadingTask.destroy();
        throw new Error('This PDF does not contain any pages.');
      }
      return {
        kind: 'pdf',
        name: file.name,
        pageCount: document.numPages,
        document,
        loadingTask,
      };
    } catch (error) {
      void loadingTask.destroy().catch(() => undefined);
      throw error;
    }
  }

  const { PptxRenderer } = await import('pptx-browser');
  const renderer = new PptxRenderer();
  try {
    await renderer.load(file);
    if (renderer.slideCount < 1) {
      throw new Error('This PowerPoint does not contain any slides.');
    }
    return {
      kind: 'pptx',
      name: file.name,
      pageCount: renderer.slideCount,
      renderer,
    };
  } catch (error) {
    renderer.destroy();
    throw error;
  }
}

export function disposeImportedPresentation(
  presentation: ImportedPresentation | null,
): void {
  if (!presentation) return;
  if (presentation.kind === 'pdf') {
    void presentation.loadingTask.destroy().catch(() => undefined);
  } else if (presentation.kind === 'pptx') {
    presentation.renderer.destroy();
  } else {
    presentation.images.forEach((image) => URL.revokeObjectURL(image));
  }
}
