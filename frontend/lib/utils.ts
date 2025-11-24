// Utility functions

/**
 * Format date to readable string
 */
export function formatDate(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

/**
 * Format date and time to readable string
 */
export function formatDateTime(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Format duration in minutes to readable string
 */
export function formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
        return `${hours} jam ${mins} menit`;
    }
    return `${mins} menit`;
}

/**
 * Calculate time remaining
 */
export function calculateTimeRemaining(endTime: string | Date): number {
    const end = new Date(endTime).getTime();
    const now = new Date().getTime();
    const remaining = end - now;

    return Math.max(0, Math.floor(remaining / 1000)); // Return seconds
}

/**
 * Format seconds to mm:ss
 */
export function formatSeconds(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Truncate text
 */
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

/**
 * Get score color class based on score percentage
 */
export function getScoreColor(score: number, maxScore: number): string {
    const percentage = (score / maxScore) * 100;

    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 40) return 'text-yellow-600';
    return 'text-red-600';
}

/**
 * Get difficulty badge color
 */
export function getDifficultyColor(difficulty: string): string {
    switch (difficulty.toLowerCase()) {
        case 'easy':
            return 'bg-green-100 text-green-800';
        case 'medium':
            return 'bg-yellow-100 text-yellow-800';
        case 'hard':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

/**
 * Get status badge color
 */
export function getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
        case 'completed':
            return 'bg-green-100 text-green-800';
        case 'in_progress':
            return 'bg-blue-100 text-blue-800';
        case 'not_started':
            return 'bg-gray-100 text-gray-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

/**
 * Validate email
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Generate random ID
 */
export function generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
