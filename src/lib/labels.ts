import type { Stage } from '../types';

export const STAGE_LABELS: Record<Stage, string> = {
  work: 'Работа',
  shortBreak: 'Короткий перерыв',
  longBreak: 'Длинный перерыв',
};

export const STAGE_HINTS: Record<Stage, string> = {
  work: 'Сосредоточьтесь на задаче',
  shortBreak: 'Сделайте короткую паузу',
  longBreak: 'Отдохните подольше',
};
