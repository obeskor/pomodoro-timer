import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import App from '../App';
import { DEFAULT_SETTINGS, MAX_HISTORY } from '../types';

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('отображает этап работы и значение по умолчанию 25:00', () => {
    render(<App />);
    expect(screen.getByText('Работа')).toBeInTheDocument();
    expect(screen.getByRole('timer')).toHaveTextContent('25:00');
  });

  it('переключает старт и паузу кнопкой', async () => {
    const user = userEvent.setup();
    render(<App />);
    const primary = screen.getByRole('button', { name: 'Старт' });
    await user.click(primary);
    expect(screen.getByRole('button', { name: 'Пауза' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Пауза' }));
    expect(screen.getByRole('button', { name: 'Продолжить' })).toBeInTheDocument();
  });

  it('сбрасывает текущий этап', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Старт' }));
    await user.click(screen.getByRole('button', { name: 'Сброс' }));
    expect(screen.getByRole('timer')).toHaveTextContent('25:00');
    expect(screen.getByRole('button', { name: 'Старт' })).toBeInTheDocument();
  });

  it('пропускает этап и переходит к перерыву без инкремента', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Пропустить этап' }));
    expect(screen.getByText('Короткий перерыв')).toBeInTheDocument();
    expect(screen.getByTestId('session-count')).toHaveTextContent('0');
  });

  it('сохраняет настройки в localStorage', async () => {
    const user = userEvent.setup();
    render(<App />);
    const workInput = screen.getByLabelText('Длительность работы, мин');
    await user.tripleClick(workInput);
    await user.keyboard('30');
    expect(
      JSON.parse(localStorage.getItem('pomodoro:settings') ?? '{}').workMin,
    ).toBe(30);
  });

  it('применяет сохранённые настройки при запуске', () => {
    localStorage.setItem(
      'pomodoro:settings',
      JSON.stringify({ workMin: 40, shortBreakMin: 8, longBreakMin: 20 }),
    );
    render(<App />);
    expect(screen.getByRole('timer')).toHaveTextContent('40:00');
  });

  it('сбрасывает настройки к значениям по умолчанию', async () => {
    const user = userEvent.setup();
    localStorage.setItem(
      'pomodoro:settings',
      JSON.stringify({ workMin: 40, shortBreakMin: 8, longBreakMin: 20 }),
    );
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Сбросить настройки' }));
    expect(screen.getByRole('timer')).toHaveTextContent('25:00');
    expect(
      JSON.parse(localStorage.getItem('pomodoro:settings') ?? '{}'),
    ).toEqual(DEFAULT_SETTINGS);
  });

  it('переключает и сохраняет тему', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: /Переключить на тёмную тему/ }));
    expect(JSON.parse(localStorage.getItem('pomodoro:theme') ?? '""')).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('показывает статистику по сохранённой истории', () => {
    const history = Array.from({ length: 3 }, () => ({
      completedAt: new Date().toISOString(),
      workMinutes: 25,
    }));
    localStorage.setItem('pomodoro:history', JSON.stringify(history));
    render(<App />);
    expect(screen.getByTestId('today-count')).toHaveTextContent('3');
    expect(screen.getByTestId('total-count')).toHaveTextContent('3');
  });

  it('переключает старт/паузу по пробелу', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.keyboard(' ');
    expect(screen.getByRole('button', { name: 'Пауза' })).toBeInTheDocument();
    await user.keyboard(' ');
    expect(screen.getByRole('button', { name: 'Продолжить' })).toBeInTheDocument();
  });

  it('ограничивает историю константой MAX_HISTORY', () => {
    const history = Array.from({ length: MAX_HISTORY }, () => ({
      completedAt: new Date().toISOString(),
      workMinutes: 25,
    }));
    localStorage.setItem('pomodoro:history', JSON.stringify(history));
    render(<App />);
    expect(screen.getByTestId('total-count')).toHaveTextContent(String(MAX_HISTORY));
  });
});
