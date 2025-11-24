'use client';

// Custom hook untuk auto-save exam answers
import { useState, useEffect, useCallback, useRef } from 'react';
import api from '@/lib/api';

interface Answer {
    question_id: number;
    answer: string;
}

interface UseExamSubmissionOptions {
    submissionId: number;
    autoSaveDelay?: number; // milliseconds
}

export function useExamSubmission({ submissionId, autoSaveDelay = 2000 }: UseExamSubmissionOptions) {
    const [answers, setAnswers] = useState<Map<number, string>>(new Map());
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Auto-save function
    const saveAnswer = useCallback(async (questionId: number, answer: string) => {
        try {
            setIsSaving(true);
            await api.post('/exams/save-answer', {
                submission_id: submissionId,
                question_id: questionId,
                answer,
            });
            setLastSaved(new Date());
        } catch (error) {
            console.error('Error saving answer:', error);
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [submissionId]);

    // Update answer with auto-save
    const updateAnswer = useCallback((questionId: number, answer: string) => {
        setAnswers((prev) => new Map(prev).set(questionId, answer));

        // Clear existing timeout
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        // Set new timeout for auto-save
        saveTimeoutRef.current = setTimeout(() => {
            saveAnswer(questionId, answer);
        }, autoSaveDelay);
    }, [saveAnswer, autoSaveDelay]);

    // Get answer for a question
    const getAnswer = useCallback((questionId: number): string | undefined => {
        return answers.get(questionId);
    }, [answers]);

    // Submit exam
    const submitExam = useCallback(async () => {
        try {
            // Clear any pending saves
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }

            const response = await api.post('/exams/submit', {
                submission_id: submissionId,
            });

            return response.data;
        } catch (error) {
            console.error('Error submitting exam:', error);
            throw error;
        }
    }, [submissionId]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, []);

    return {
        answers,
        updateAnswer,
        getAnswer,
        submitExam,
        isSaving,
        lastSaved,
    };
}
