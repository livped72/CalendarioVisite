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
