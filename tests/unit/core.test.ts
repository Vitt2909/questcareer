import { describe, it, expect } from 'vitest';
import { getQuizForSkill, type QuizQuestion } from '@/lib/seed/quizzes';
import { calculateLevel, QUEST_XP, STREAK_7_XP, STREAK_30_XP } from '@/modules/execution/xp';
import { seedPlatforms } from '@/lib/seed/platforms';

// ─── Quiz Tests ──────────────────────────────────────────────────
describe('getQuizForSkill', () => {
    it('returns specific quiz for python-basic', () => {
        const questions = getQuizForSkill('python-basic');
        expect(questions.length).toBe(5);
        expect(questions[0].options.length).toBe(4);
        expect(questions[0].correctIndex).toBeGreaterThanOrEqual(0);
        expect(questions[0].correctIndex).toBeLessThan(4);
    });

    it('returns specific quiz for etl-pipelines', () => {
        const questions = getQuizForSkill('etl-pipelines');
        expect(questions.length).toBe(5);
        expect(questions[0].question).toContain('ETL');
    });

    it('returns generic quiz for unknown skill', () => {
        const questions = getQuizForSkill('unknown-skill-xyz');
        expect(questions.length).toBe(5);
        // Generic quiz correctIndex is always 0
        questions.forEach((q: QuizQuestion) => {
            expect(q.correctIndex).toBe(0);
        });
    });

    it('all quizzes have explanations', () => {
        const skills = ['python-basic', 'logic-programming', 'sql-basic', 'etl-pipelines'];
        skills.forEach((id) => {
            const questions = getQuizForSkill(id);
            questions.forEach((q: QuizQuestion) => {
                expect(q.explanation).toBeTruthy();
            });
        });
    });
});

// ─── XP Tests ────────────────────────────────────────────────────
describe('XP system', () => {
    it('calculates level correctly', () => {
        expect(calculateLevel(0)).toBe(1);
        expect(calculateLevel(99)).toBe(1);
        expect(calculateLevel(100)).toBe(2);
        expect(calculateLevel(300)).toBe(4);
    });

    it('awards quest XP based on time', () => {
        expect(QUEST_XP(15)).toBe(30);
        expect(QUEST_XP(25)).toBe(50);
        expect(QUEST_XP(60)).toBe(120);
    });

    it('has streak bonuses', () => {
        expect(STREAK_7_XP).toBeGreaterThan(0);
        expect(STREAK_30_XP).toBeGreaterThan(STREAK_7_XP);
    });
});

// ─── Platform Tests ──────────────────────────────────────────────
describe('seedPlatforms', () => {
    it('exports the function', () => {
        expect(typeof seedPlatforms).toBe('function');
    });
});
