import { trackShareCard, trackToolUse } from '../analytics';
import { focusHeading, h, svg, watchStoreClicks, whenVisible } from '../dom';
import { isCorrect, QUIZ, score, scoreMessage, shareText, type QuizQuestion } from '../quiz';

const TOOL = 'line-quiz' as const;

function mark(ok: boolean): SVGSVGElement {
  const icon = svg('svg', {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': '2',
    'stroke-linecap': 'round',
    'aria-hidden': 'true',
    class: 't-quiz-mark',
  });
  icon.append(svg('path', { d: ok ? 'M5 12.5l4.5 4.5L19 7.5' : 'M6 6l12 12M18 6 6 18' }));
  return icon;
}

export function mountQuiz(): void {
  const root = document.querySelector<HTMLElement>('[data-quiz]');
  if (!root) return;
  const q = <T extends Element>(selector: string) => root.querySelector<T>(selector);
  const progress = q<HTMLElement>('[data-progress]');
  const body = q<HTMLElement>('[data-body]');
  const figure = q<HTMLElement>('[data-figure]');
  const quizSvg = q<SVGSVGElement>('[data-quiz-svg]');
  const prompt = q<HTMLElement>('[data-prompt]');
  const options = q<HTMLElement>('[data-options]');
  const feedback = q<HTMLElement>('[data-feedback]');
  const next = q<HTMLButtonElement>('[data-next]');
  const scoreBox = q<HTMLElement>('[data-score]');
  if (!progress || !body || !figure || !quizSvg || !prompt || !options || !feedback || !next || !scoreBox) return;
  watchStoreClicks(`tool-${TOOL}`);

  whenVisible(root, () => {
    let index = 0;
    let answers: Record<string, string> = {};

    const show = (question: QuizQuestion, moveFocus: boolean) => {
      progress.textContent = `Question ${index + 1} of ${QUIZ.length}`;
      prompt.textContent = question.prompt;
      const target = question.show;
      figure.hidden = target === null;
      for (const line of quizSvg.querySelectorAll<SVGGElement>('[data-line]')) {
        line.classList.toggle('is-on', target !== null && 'line' in target && target.line === line.dataset.line);
      }
      for (const mount of quizSvg.querySelectorAll<SVGEllipseElement>('[data-mount]')) {
        mount.classList.toggle('is-on', target !== null && 'mount' in target && target.mount === mount.dataset.mount);
      }
      options.replaceChildren(
        ...question.options.map((option) => h('button', { type: 'button', class: 't-quiz-option', 'data-option': option.id, text: option.label })),
      );
      feedback.replaceChildren();
      next.hidden = true;
      if (moveFocus) focusHeading(prompt);
    };

    const finish = () => {
      const correct = score(answers);
      body.hidden = true;
      progress.textContent = 'Your score';
      const title = h('h2', { class: 't-result-title', text: `You got ${correct} of ${QUIZ.length}` });
      const share = h('button', { type: 'button', class: 'btn btn-secondary', text: 'Share my score' });
      const again = h('button', { type: 'button', class: 'btn btn-gold', text: 'Try again' });
      const note = h('p', { class: 't-caveat', role: 'status' });
      share.addEventListener('click', async () => {
        const text = shareText(correct, `${location.origin}/tools/palm-reading-quiz/`);
        trackShareCard(TOOL);
        try {
          if (navigator.share) await navigator.share({ text });
          else {
            await navigator.clipboard.writeText(text);
            note.textContent = 'Copied. Paste it into WhatsApp or any chat.';
          }
        } catch {
          // Share sheet closed: nothing to do.
        }
      });
      again.addEventListener('click', () => {
        index = 0;
        answers = {};
        scoreBox.hidden = true;
        body.hidden = false;
        show(QUIZ[0]!, true);
      });
      scoreBox.replaceChildren(
        title,
        h('p', { text: scoreMessage(correct) }),
        h('p', { class: 't-caveat', text: 'Your score stays on this page. Sharing sends only the words you choose to share.' }),
        h('div', { class: 't-actions' }, again, share),
        note,
        h('p', {}, h('a', { class: 'text-link', href: '/tools/palm-map/', text: 'Learn the lines on the interactive palm map' })),
      );
      scoreBox.hidden = false;
      focusHeading(title);
    };

    options.addEventListener('click', (event) => {
      const button = (event.target as Element).closest<HTMLButtonElement>('[data-option]');
      const question = QUIZ[index];
      if (!button || !question || answers[question.id]) return;
      trackToolUse(TOOL);
      const picked = button.dataset.option ?? '';
      answers[question.id] = picked;
      const ok = isCorrect(question, picked);
      for (const item of options.querySelectorAll<HTMLButtonElement>('[data-option]')) {
        item.disabled = true;
        if (item.dataset.option === question.answer) item.classList.add('is-right');
        else if (item === button) item.classList.add('is-wrong');
      }
      const right = question.options.find((option) => option.id === question.answer)?.label ?? '';
      feedback.replaceChildren(
        mark(ok),
        h('span', {}, h('strong', { text: ok ? 'Correct. ' : `Not quite. It’s “${right}”. ` }), question.explain),
      );
      next.textContent = index === QUIZ.length - 1 ? 'See my score' : 'Next question';
      next.hidden = false;
      next.focus();
    });

    next.addEventListener('click', () => {
      index += 1;
      const question = QUIZ[index];
      if (question) show(question, true);
      else finish();
    });

    show(QUIZ[0]!, false);
  });
}
