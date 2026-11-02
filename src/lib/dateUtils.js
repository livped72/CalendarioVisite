export const MONTH_ABBREVIATIONS = {
    gennaio: 'gen',
    febbraio: 'feb',
    marzo: 'mar',
    aprile: 'apr',
    maggio: 'mag',
    giugno: 'giu',
    luglio: 'lug',
    agosto: 'ago',
    settembre: 'set',
    ottobre: 'ott',
    novembre: 'nov',
    dicembre: 'dic',
    Gennaio: 'Gen',
    Febbraio: 'Feb',
    Marzo: 'Mar',
    Aprile: 'Apr',
    Maggio: 'Mag',
    Giugno: 'Giu',
    Luglio: 'Lug',
    Agosto: 'Ago',
    Settembre: 'Set',
    Ottobre: 'Ott',
    Novembre: 'Nov',
    Dicembre: 'Dic',
};
export const abbreviateMonths = (text) => {
    if (!text)
        return '';
    let result = text;
    for (const [full, abbr] of Object.entries(MONTH_ABBREVIATIONS)) {
        // Replace full month with abbreviated version preserving surrounding characters
        const regex = new RegExp(`\\b${full}\\b`, 'gi');
        result = result.replace(regex, abbr.toLowerCase());
    }
    return result;
};
const ITALIAN_MONTHS = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
];
/**
 * Returns Monday and Sunday ISO strings (YYYY-MM-DD) for the calendar week containing the given date.
 */
export function getCalendarWeekRange(date = new Date()) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    // In JS getDay(): 0 is Sunday, 1 is Monday...
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(d);
    monday.setDate(d.getDate() + diffToMonday);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const mondayIso = monday.toISOString().slice(0, 10);
    const sundayIso = sunday.toISOString().slice(0, 10);
    return { mondayIso, sundayIso };
}
/**
 * Check if targetDate (defaults to today) falls within a week's dates or its calendar week.
 */
export function isWeekCurrent(startDate, endDate, targetDate = new Date()) {
    if (!startDate || !endDate)
        return false;
    const targetIso = targetDate.toISOString().slice(0, 10);
    if (targetIso >= startDate && targetIso <= endDate)
        return true;
    // Check calendar week overlap (Monday-Sunday)
    const { mondayIso, sundayIso } = getCalendarWeekRange(targetDate);
    // Two intervals [A, B] and [C, D] overlap if A <= D and B >= C
    return startDate <= sundayIso && endDate >= mondayIso;
}
/**
 * Finds the best matching week index in the array for a given date.
 * 1. Exact interval match (startDate <= date <= endDate)
 * 2. Calendar week overlap (Monday..Sunday overlaps week)
 * 3. Closest upcoming week
 * 4. Closest past week
 * Returns 0 if list is non-empty and no match found, or -1 if empty.
 */
export function findWeekIndexForDate(settimane, targetDate = new Date()) {
    if (!settimane || settimane.length === 0)
        return -1;
    const targetIso = targetDate.toISOString().slice(0, 10);
    // 1. Exact match
    const exactIdx = settimane.findIndex((w) => Boolean(w.startDate && w.endDate && targetIso >= w.startDate && targetIso <= w.endDate));
    if (exactIdx >= 0)
        return exactIdx;
    // 2. Calendar week overlap
    const { mondayIso, sundayIso } = getCalendarWeekRange(targetDate);
    const overlapIdx = settimane.findIndex((w) => Boolean(w.startDate && w.endDate && w.startDate <= sundayIso && w.endDate >= mondayIso));
    if (overlapIdx >= 0)
        return overlapIdx;
    // 3. Closest upcoming week
    const upcomingIdx = settimane.findIndex((w) => Boolean(w.startDate && w.startDate >= targetIso));
    if (upcomingIdx >= 0)
        return upcomingIdx;
    // 4. Closest past week (last element before targetIso)
    for (let i = settimane.length - 1; i >= 0; i--) {
        const w = settimane[i];
        if (w.endDate && w.endDate <= targetIso) {
            return i;
        }
    }
    return 0;
}
/**
 * Get Month info (name in Italian, year, and key like "2026-11") from a week.
 */
export function getMonthInfoFromWeek(week) {
    if (week.startDate) {
        const parts = week.startDate.split('-');
        const year = parseInt(parts[0], 10);
        const monthNum = parseInt(parts[1], 10); // 1-12
        const monthName = ITALIAN_MONTHS[monthNum - 1] || 'Mese';
        return {
            monthKey: `${year}-${String(monthNum).padStart(2, '0')}`,
            monthName,
            year,
        };
    }
    // Fallback using period text or anno
    const year = week.anno || new Date().getFullYear();
    return {
        monthKey: `${year}-01`,
        monthName: 'Generale',
        year,
    };
}
