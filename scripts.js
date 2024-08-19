document.addEventListener('DOMContentLoaded', () => {
    const inventory = document.querySelector('.inventory');
    const simulateButton = document.getElementById('simulateButton');
    const bossAlert = document.getElementById('boss-alert');
    const simulationCountElement = document.getElementById('simulationCount');
    const mythicItemCountElement = document.getElementById('mythicItemCount');
    const resetButton = document.getElementById('resetButton');
    const alertBox = document.getElementById('alert-box');

    let simulationCount = 0;
    let mythicItemCount = 0;
    let selectedBoss = null; // Variável para armazenar o boss selecionado

    // Função para criar um item do inventário
    const createItem = (item) => {
        const div = document.createElement('div');
        div.className = 'inventory-item';

        // Adiciona classes específicas com base no tipo do item
        if (item.isMythic) {
            div.classList.add('mythic');
        } else if (item.isUnique) {
            div.classList.add('unique');
        } else if (item.isLegendary) {
            div.classList.add('legendary');
        }

        // Verifique o item recebido
        console.log('Criando item:', item);

        // Se o item tem uma imagem, define a imagem de fundo da div
        if (item.imageUrl) {
            console.log('Imagem URL:', item.imageUrl); // Verifique a URL da imagem
            const img = document.createElement('img');
            img.src = item.imageUrl;
            img.alt = item.name || 'Item';
            img.className = 'item-image'; // Classe CSS para estilizar a imagem
            div.appendChild(img);
        }

        // Se o item tem um nome, cria um elemento para o nome e o adiciona como um filho
        if (item.name) {
            const name = document.createElement('span');
            name.textContent = item.name;
            name.className = 'item-name'; // Classe CSS para estilizar o nome
            div.appendChild(name);
        }

        return div;
    };

    // Função para atualizar o inventário
    const updateInventory = (items) => {
        inventory.innerHTML = ''; // Limpa o inventário antes de preencher

        items.forEach(item => {
            const inventoryItem = createItem(item);
            inventory.appendChild(inventoryItem);
        });

        // Preencher os espaços vazios se houver menos itens do que células
        const totalCells = 33; // 3 filas x 11 colunas
        const currentItems = items.length;
        for (let i = currentItems; i < totalCells; i++) {
            const emptyItem = createItem({}); // Cria um item vazio
            inventory.appendChild(emptyItem);
        }
    };

    // Função para lidar com a seleção do boss
    const handleBossSelection = (event) => {
        const button = event.target.closest('.boss-button');
        if (button) {
            // Remove a classe 'selected' de todos os botões
            document.querySelectorAll('.boss-button').forEach(btn => btn.classList.remove('selected'));
            // Adiciona a classe 'selected' ao botão clicado
            button.classList.add('selected');
            // Atualiza o boss selecionado
            selectedBoss = button.getAttribute('data-boss');
        }
    };

    // Adiciona evento de clique para a seleção do boss
    document.querySelectorAll('.boss-button').forEach(button => {
        button.addEventListener('click', handleBossSelection);
    });

document.getElementById('load-data').addEventListener('click', () => {
    fetch('data.json')
      .then(response => {
          if (!response.ok) {
              throw new Error('Network response was not ok');
          }
          return response.json();
      })
      .then(data => {
          console.log(data); // Verifique os dados no console
      })
      .catch(error => console.error('Erro ao obter o loot:', error));
});



    // Adiciona evento de clique para o botão de simulação
    simulateButton.addEventListener('click', () => {
        if (selectedBoss) {
            fetch('data.json')
                .then(response => response.json())
                .then(data => {
                    // Incrementar o contador de simulações
                    simulationCount++;
                    simulationCountElement.textContent = simulationCount;

                    // Calcular e incrementar o contador de itens míticos
                    const mythicItems = data.mythicDrops.length;
                    mythicItemCount += mythicItems;
                    mythicItemCountElement.textContent = mythicItemCount;

                    // Combine todos os itens
                    const allItems = [...data.drops, ...data.mythicDrops];
                    updateInventory(allItems);
                })
                .catch(error => {
                    console.error('Erro ao obter o loot:', error);
                });
        } else {
            // Mostrar o aviso personalizado
            bossAlert.classList.add('show');

            // Ocultar o aviso após 3 segundos
            setTimeout(() => {
                bossAlert.classList.remove('show');
            }, 4000);
        }
    });

    // Adiciona evento de clique para o botão de reset
    resetButton.addEventListener('click', () => {
        console.log('Reset button clicked');
        simulationCount = 0;
        mythicItemCount = 0;
        simulationCountElement.textContent = simulationCount;
        mythicItemCountElement.textContent = mythicItemCount;
    });
});
