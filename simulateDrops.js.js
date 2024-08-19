// simulateDrops.js
const lootTables = require('./data'); // Certifique-se de que o caminho está correto

/**
 * Simula o drop de itens para um chefe específico.
 * @param {string} bossName - Nome do chefe.
 * @returns {Array} - Array de itens que foram droppados.
 */
function simulateBossDrop(bossName) {
    if (!lootTables[bossName]) {
        throw new Error(`Loot table for boss ${bossName} does not exist.`);
    }

    const lootTable = lootTables[bossName];
    const totalItems = 22 + Math.floor(Math.random() * 3); // Número total de itens, entre 22 e 24
    let drops = [];
    
    // Configurações para itens míticos
    const mythicDropChance = 0.075; // 7.5% chance total
    const mythicDropDistribution = 0.015; // 1.5% por evento
    const numberOfMythicChecks = 5; // Número de verificações para drops míticos

    // Verifica se algum item mítico vai dropar
    const mythicDrops = [];
    for (let i = 0; i < numberOfMythicChecks; i++) {
        if (Math.random() < mythicDropDistribution) {
            const mythicItem = getRandomItem(lootTable, item => item.isMythic);
            if (mythicItem && !mythicDrops.includes(mythicItem)) {
                mythicDrops.push(mythicItem);
            }
        }
    }

    // Preencher o restante do loot com itens não míticos
    while (drops.length < totalItems - mythicDrops.length) {
        const item = getRandomItem(lootTable, item => !item.isMythic);
        if (item && !drops.includes(item)) {
            drops.push(item);
        }
    }

    // Adicionar itens míticos ao loot, garantindo que o total não ultrapasse o limite
    drops = drops.concat(mythicDrops);
    if (drops.length > totalItems) {
        drops = drops.slice(0, totalItems);
    }

    return drops;
}

/**
 * Seleciona um item aleatório da tabela de loot com base na função de filtro fornecida.
 * @param {Array} lootTable - Array de itens na tabela de loot.
 * @param {Function} filterFn - Função de filtro para selecionar itens específicos.
 * @returns {Object} - Item selecionado aleatoriamente ou null se nenhum item corresponder.
 */
function getRandomItem(lootTable, filterFn = () => true) {
    const filteredItems = lootTable.filter(filterFn);
    return filteredItems.length > 0 ? filteredItems[Math.floor(Math.random() * filteredItems.length)] : null;
}

// Exportar para uso em outros módulos
module.exports = { simulateBossDrop };
