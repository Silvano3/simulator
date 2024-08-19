const express = require('express');
const path = require('path');
const { lootTables, legendaryItems, mythicUniques } = require('./data/data');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/simulate', (req, res) => {
    const bossName = req.query.boss;
    const numDrops = Math.floor(Math.random() * (24 - 22 + 1)) + 22; // Número aleatório de itens dropados

    if (!bossName || !lootTables[bossName]) {
        return res.status(400).json({ error: 'Boss inválido' });
    }

    const drops = simulateDrops(bossName, numDrops);
    res.json(drops);
});

// Função para gerar um número aleatório entre min e max (inclusive)
function getRandomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

// Função para simular o drop de itens
function simulateDrops(bossName, numDrops) {
    const lootTable = lootTables[bossName];
    const drops = [];
    const uniqueDrops = new Set(); // Para armazenar itens únicos dropados

    // Determina aleatoriamente a quantidade de itens únicos a serem dropados (entre 4 e 6)
    const maxUniqueDrops = Math.floor(Math.random() * (6 - 4 + 1)) + 4;

    for (let i = 0; i < numDrops; i++) {
        const roll = getRandomFloat(0, 1);
        let cumulativeProbability = 0;
        let itemDropped = false;

        // Tentar um item da tabela de loot
        for (const item of lootTable) {
            cumulativeProbability += item.dropRate;
            if (roll < cumulativeProbability) {
                if (item.isUnique) {
                    // Garantir que não exceda o limite de itens únicos
                    if (uniqueDrops.size < maxUniqueDrops && !uniqueDrops.has(item.name)) {
                        uniqueDrops.add(item.name);
                        drops.push(item.name);
                        itemDropped = true;
                        break;
                    }
                } else {
                    drops.push(item.name);
                    itemDropped = true;
                    break;
                }
            }
        }

        // Se nenhum item foi droppado da tabela de loot, dropar um item lendário genérico
        if (!itemDropped) {
            const randomLegendary = legendaryItems[Math.floor(Math.random() * legendaryItems.length)];
            drops.push(randomLegendary);
        }

        // Se já temos o máximo de itens únicos permitidos, preenchemos com itens lendários genéricos
        if (uniqueDrops.size >= maxUniqueDrops) {
            const remainingDrops = numDrops - drops.length;
            for (let j = 0; j < remainingDrops; j++) {
                const randomLegendary = legendaryItems[Math.floor(Math.random() * legendaryItems.length)];
                drops.push(randomLegendary);
            }
            break; // Interrompe o loop para evitar exceder o número total de drops
        }
    }

    // Se após o loop ainda não atingimos o número desejado de drops, adicione itens lendários genéricos
    if (drops.length < numDrops) {
        const remainingDrops = numDrops - drops.length;
        for (let j = 0; j < remainingDrops; j++) {
            const randomLegendary = legendaryItems[Math.floor(Math.random() * legendaryItems.length)];
            drops.push(randomLegendary);
        }
    }

    // Adicionar itens Mythic Uniques com base em sua taxa de drop
    mythicUniques.forEach(item => {
        if (Math.random() < item.dropRate) {
            if (!drops.includes(item.name)) {
                drops.push(item.name);
            }
        }
    });

    // Garantir que o total de drops não exceda o número desejado
    if (drops.length > numDrops) {
        drops.splice(numDrops); // Remove itens excedentes
    }

    return drops;
}

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
