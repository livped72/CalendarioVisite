/** Build a canonical key for a period, e.g. "2026-set-feb" */
export function periodoKey(anno, semestre) {
    return `${anno}-${semestre}`;
}
/** Parse a periodoKey back to AnnoSemestre */
export function parsePeriodoKey(key) {
    const idx = key.indexOf('-set-feb') >= 0 ? key.indexOf('-set-feb') : key.indexOf('-mar-ago');
    const anno = parseInt(key.slice(0, idx), 10);
    const semestre = key.slice(idx + 1);
    return { anno, semestre };
}
/** Return the next period (e.g. 2026-set-feb → 2026-mar-ago → 2027-set-feb) */
export function nextPeriodo(as) {
    if (as.semestre === 'set-feb')
        return { anno: as.anno, semestre: 'mar-ago' };
    return { anno: as.anno + 1, semestre: 'set-feb' };
}
/** Return the previous period */
export function prevPeriodo(as) {
    if (as.semestre === 'mar-ago')
        return { anno: as.anno, semestre: 'set-feb' };
    return { anno: as.anno - 1, semestre: 'mar-ago' };
}
/** Human-readable label for a period */
export function periodoLabel(as) {
    if (as.semestre === 'set-feb') {
        return `Set ${as.anno} – Feb ${as.anno + 1}`;
    }
    return `Mar ${as.anno} – Ago ${as.anno}`;
}
/** Short label for header buttons */
export function periodoShortLabel(semestre) {
    return semestre === 'set-feb' ? 'Set – Feb' : 'Mar – Ago';
}
/** Get the AnnoSemestre that contains today's date */
export function currentAnnoSemestre() {
    const now = new Date();
    const month = now.getMonth() + 1; // 1-based
    const year = now.getFullYear();
    // set-feb: September (9) through February (2 of next year)
    // mar-ago: March (3) through August (8)
    if (month >= 9)
        return { anno: year, semestre: 'set-feb' };
    if (month <= 2)
        return { anno: year - 1, semestre: 'set-feb' };
    return { anno: year, semestre: 'mar-ago' };
}
