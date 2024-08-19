const express = require('express');
const cors = require('cors');
const path = require('path');
const { lootTables, legendaryItems, mythicUniques } = require('./data');

const app = express();
const port = 3000;

app.use(cors());

// Serve arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Serve o index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Função para gerar um número aleatório entre min e max (inclusive)
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Função para selecionar um item baseado nas taxas de drop
const getDrop = (items) => {
    const roll = Math.random();
    let accumulatedRate = 0;

    for (let item of items) {
        accumulatedRate += item.dropRate;
        if (roll < accumulatedRate) {
            return item;
        }
    }

    return null;
};

// Função para gerar o loot
const generateLoot = (bossLootTable, totalLoot) => {
    const drops = [];
    const uniqueItemCount = getRandomInt(4, 5); // Garantir entre 4 e 6 itens únicos

    // Adiciona itens únicos
    while (drops.filter(item => item.isUnique).length < uniqueItemCount) {
        let drop = getDrop(bossLootTable);
        if (drop && drop.isUnique) {
            // Verifica se o item já foi adicionado
            if (!drops.some(d => d.name === drop.name)) {
                drops.push({ ...drop, imageUrl: `images/items/${drop.imageUrl}` });
            }
        }
        // Caso não tenha o número necessário de itens únicos, adicione itens lendários
        if (drops.filter(item => item.isUnique).length >= uniqueItemCount) break;
    }

    // Adiciona itens lendários adicionais se necessário
    while (drops.length < totalLoot) {
        let item = legendaryItems[getRandomInt(0, legendaryItems.length - 1)];
        let drop = { name: item.name, isLegendary: true, imageUrl: `images/items/${item.imageUrl}` };
        drops.push(drop);
    }

    return drops;
};

// Rota para obter o loot
app.get('/loot', (req, res) => {
    const boss = req.query.boss;

    if (!boss || !lootTables[boss]) {
        return res.status(400).send('Boss não encontrado');
    }

    const bossLootTable = lootTables[boss];
    const totalLoot = getRandomInt(22, 24);

    // Gera o loot para o boss
    const drops = generateLoot(bossLootTable, totalLoot);

    // Adiciona uma chance para itens míticos
    const mythicDrops = [];
    for (let i = 0; i < 5; i++) {
        if (Math.random() < 0.015) {
            const mythic = mythicUniques[getRandomInt(0, mythicUniques.length - 1)];
            mythicDrops.push({ name: mythic.name, isMythic: true, imageUrl: `images/items/${mythic.imageUrl}` });
        }
    }

    // Debugging: exibe o boss e o loot gerado
    console.log('Boss:', boss);
    console.log('Drops:', drops);
    console.log('Mythic Drops:', mythicDrops);

    res.json({ drops, mythicDrops });
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
