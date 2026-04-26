import territoireData from '../data/decoupage-territorial-benin.json';

/**
 * Extrait la liste complète des communes du Bénin depuis le fichier de découpage territorial.
 * Retourne un tableau de chaînes comme : [{ departement: "ATLANTIQUE", commune: "ABOMEY-CALAVI" }, ...]
 */
export const getCommunesParDepartement = () => {
    return territoireData.map(dept => ({
        departement: dept.lib_dep,
        communes: (dept.communes || []).map(c => c.lib_com)
    }));
};

/**
 * Retourne la liste plate de toutes les communes du Bénin triées alphabétiquement.
 */
export const getAllCommunes = () => {
    const communes = [];
    for (const dept of territoireData) {
        for (const com of dept.communes) {
            communes.push(com.lib_com);
        }
    }
    return communes.sort((a, b) => a.localeCompare(b, 'fr'));
};

/**
 * Retourne un tableau de { label: "COMMUNE (DEPT)", value: "COMMUNE" }
 * pour les selects avec groupement département optionnel.
 */
export const getCommunesOptions = () => {
    return getAllCommunes().map(c => ({ label: c, value: c }));
};
