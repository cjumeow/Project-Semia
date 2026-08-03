import {
  LEARNING_LANGUAGE_OPTIONS,
  NATIVE_LANGUAGE_OPTIONS,
} from '@semia/shared';

export const POPOVER_WIDTH = 288;

export function buildPopoverFieldsHtml(
  learning: string,
  native: string,
  bilingual: boolean,
): string {
  const learningOptions = LEARNING_LANGUAGE_OPTIONS.map(
    (option) =>
      `<option value="${option.code}"${option.code === learning ? ' selected' : ''}>${option.label}</option>`,
  ).join('');

  const nativeOptions = NATIVE_LANGUAGE_OPTIONS.map(
    (option) =>
      `<option value="${option.code}"${option.code === native ? ' selected' : ''}>${option.label}</option>`,
  ).join('');

  return `
    <div class="popover" role="dialog" aria-label="Subtitle settings">
      <div class="popover-header">
        <div>
          <p class="popover-title">Semia subtitles</p>
          <p class="popover-subtitle">YouTube auto-translate</p>
        </div>
        <button type="button" class="close-btn" aria-label="Close" data-action="close-popover">×</button>
      </div>
      <div class="fields">
        <label class="field">
          <span class="field-label">Learning language</span>
          <select class="field-select" data-field="learningLanguage">${learningOptions}</select>
        </label>
        <label class="field">
          <span class="field-label">Native language</span>
          <select class="field-select" data-field="nativeLanguage">${nativeOptions}</select>
        </label>
        <label class="checkbox-row">
          <input type="checkbox" data-field="bilingualCaptionsEnabled"${bilingual ? ' checked' : ''} />
          Show bilingual captions
        </label>
        <p class="hint">Learning line is always shown. Native line appears when translation alignment is confident.</p>
      </div>
    </div>
  `;
}
