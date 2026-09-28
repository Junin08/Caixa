// PREÇOS E NOMES DOS PRODUTOS FIXOS
const PRODUTOS = {
    pastel: { nome: 'Pastel', preco: 8.00 },
    coxinha: { nome: 'Coxinha', preco: 8.00 },
    refri: { nome: 'Refrigerante', preco: 5.00 }
};

// ESTADO DO CAIXA
let quantidades = {
    pastel: 0,
    coxinha: 0,
    refri: 0
};

let fiados = [];

// CARREGAR HISTÓRICO DO NAVEGADOR (LOCALSTORAGE)
let historicoVendas = JSON.parse(localStorage.getItem('historicoVendas_caixa')) || [];

// ELEMENTOS DOM
const elQtdPastel = document.getElementById('qtd-pastel');
const elQtdCoxinha = document.getElementById('qtd-coxinha');
const elQtdRefri = document.getElementById('qtd-refri');

const elSubtotalPastel = document.getElementById('subtotal-pastel');
const elSubtotalCoxinha = document.getElementById('subtotal-coxinha');
const elSubtotalRefri = document.getElementById('subtotal-refri');

const elResumoItensLista = document.getElementById('resumo-itens-lista');
const elTotalGeral = document.getElementById('total-geral');

const elValorPago = document.getElementById('valor-pago');
const elTrocoBox = document.getElementById('troco-box');
const elTrocoLabel = document.getElementById('troco-label');
const elTrocoValor = document.getElementById('troco-valor');
const btnConcluirVenda = document.getElementById('btn-concluir-venda');

const elFiadoNome = document.getElementById('fiado-nome');
const elFiadoValor = document.getElementById('fiado-valor');
const elFiadoLista = document.getElementById('fiado-lista');
const btnAddFiado = document.getElementById('btn-add-fiado');

// ELEMENTOS DO MODAL HISTÓRICO
const btnHistorico = document.getElementById('btn-historico');
const btnFecharModal = document.getElementById('btn-fechar-modal');
const modalHistorico = document.getElementById('modal-historico');
const elListaHistorico = document.getElementById('lista-historico');
const elTotalFaturado = document.getElementById('total-faturado');

// ADICIONAR OU REMOVER QUANTIDADE
function alterarQtd(item, delta) {
    if (quantidades[item] + delta >= 0) {
        quantidades[item] += delta;
        atualizarCalculos();
    }
}

// ADICIONAR ITEM FIADO/OUTROS
btnAddFiado.addEventListener('click', () => {
    const nome = elFiadoNome.value.trim() || 'Item Sem Nome';
    const valor = parseFloat(elFiadoValor.value);

    if (isNaN(valor) || valor <= 0) {
        alert('Por favor, insira um valor válido maior que zero.');
        return;
    }

    fiados.push({ id: Date.now(), nome, valor });
    
    elFiadoNome.value = '';
    elFiadoValor.value = '';

    renderizarFiados();
    atualizarCalculos();
});

// REMOVER ITEM FIADO
function removerFiado(id) {
    fiados = fiados.filter(f => f.id !== id);
    renderizarFiados();
    atualizarCalculos();
}

// RENDERIZAR LISTA DE FIADOS NA ESQUERDA
function renderizarFiados() {
    elFiadoLista.innerHTML = '';
    fiados.forEach(item => {
        const li = document.createElement('li');
        li.className = 'fiado-item';
        li.innerHTML = `
            <span><strong>${item.nome}</strong>: R$ ${item.valor.toFixed(2).replace('.', ',')}</span>
            <button onclick="removerFiado(${item.id})" class="btn-remove-item" title="Remover">✕</button>
        `;
        elFiadoLista.appendChild(li);
    });
}

// ATALHO PARA ADICIONAR OU SUBTRAIR DINHEIRO
function ajustarDinheiroAtalho(valor) {
    const atual = parseFloat(elValorPago.value) || 0;
    const novoValor = atual + valor;
    
    if (novoValor <= 0) {
        elValorPago.value = '';
    } else {
        elValorPago.value = novoValor.toFixed(2);
    }
    
    atualizarCalculos();
}

// RECALCULAR TOTAL E TROCO (DINÂMICO)
function atualizarCalculos() {
    // 1. Atualizar contadores visuais dos cards
    elQtdPastel.textContent = quantidades.pastel;
    elQtdCoxinha.textContent = quantidades.coxinha;
    elQtdRefri.textContent = quantidades.refri;

    // 2. Subtotais Individuais dos cards
    const subPastel = quantidades.pastel * PRODUTOS.pastel.preco;
    const subCoxinha = quantidades.coxinha * PRODUTOS.coxinha.preco;
    const subRefri = quantidades.refri * PRODUTOS.refri.preco;

    elSubtotalPastel.textContent = `R$ ${subPastel.toFixed(2).replace('.', ',')}`;
    elSubtotalCoxinha.textContent = `R$ ${subCoxinha.toFixed(2).replace('.', ',')}`;
    elSubtotalRefri.textContent = `R$ ${subRefri.toFixed(2).replace('.', ',')}`;

    // 3. Renderizar Resumo da Conta (Apenas o que foi adicionado)
    elResumoItensLista.innerHTML = '';
    let totalGeral = 0;
    let temItem = false;

    // Verificar produtos fixos com qtd > 0
    Object.keys(quantidades).forEach(key => {
        const qtd = quantidades[key];
        if (qtd > 0) {
            temItem = true;
            const subtotal = qtd * PRODUTOS[key].preco;
            totalGeral += subtotal;

            const div = document.createElement('div');
            div.className = 'summary-item-row';
            div.innerHTML = `
                <span>${qtd}x ${PRODUTOS[key].nome}</span>
                <strong>R$ ${subtotal.toFixed(2).replace('.', ',')}</strong>
            `;
            elResumoItensLista.appendChild(div);
        }
    });

    // Verificar fiados/outros itens
    fiados.forEach(f => {
        temItem = true;
        totalGeral += f.valor;

        const div = document.createElement('div');
        div.className = 'summary-item-row';
        div.innerHTML = `
            <span>1x ${f.nome} (Outros)</span>
            <strong>R$ ${f.valor.toFixed(2).replace('.', ',')}</strong>
        `;
        elResumoItensLista.appendChild(div);
    });

    if (!temItem) {
        elResumoItensLista.innerHTML = '<div class="summary-item-empty">Nenhum item adicionado</div>';
    }

    elTotalGeral.textContent = `R$ ${totalGeral.toFixed(2).replace('.', ',')}`;

    // 4. Cálculo do Troco e Visibilidade do Botão Concluir
    const valorPagoInput = elValorPago.value;
    const valorPago = parseFloat(valorPagoInput);

    if (valorPagoInput === '' || isNaN(valorPago)) {
        elTrocoBox.className = 'change-box neutral';
        elTrocoLabel.textContent = 'Aguardando valor...';
        elTrocoValor.textContent = 'R$ 0,00';
        btnConcluirVenda.classList.add('hidden');
    } else {
        const diferenca = valorPago - totalGeral;

        if (diferenca >= 0 && totalGeral > 0) {
            // Valor exato ou sobrando troco -> Fica VERDE e libera o botão de concluir
            elTrocoBox.className = 'change-box success';
            elTrocoLabel.textContent = diferenca === 0 ? 'PAGAMENTO EXATO' : 'TROCO A DEVOLVER:';
            elTrocoValor.textContent = `R$ ${diferenca.toFixed(2).replace('.', ',')}`;
            btnConcluirVenda.classList.remove('hidden');
        } else {
            // Faltando dinheiro -> Fica VERMELHO e esconde o botão
            elTrocoBox.className = 'change-box warning';
            elTrocoLabel.textContent = 'FALTA RECEBER:';
            elTrocoValor.textContent = `R$ ${Math.abs(diferenca).toFixed(2).replace('.', ',')}`;
            btnConcluirVenda.classList.add('hidden');
        }
    }
}

// CONCLUIR VENDA (SALVAR E LIMPAR)
function concluirVenda() {
    const totalGeralText = elTotalGeral.textContent;
    const valorPago = parseFloat(elValorPago.value) || 0;
    
    let itensResumo = [];
    Object.keys(quantidades).forEach(key => {
        if (quantidades[key] > 0) {
            itensResumo.push(`${quantidades[key]}x ${PRODUTOS[key].nome}`);
        }
    });
    fiados.forEach(f => itensResumo.push(`1x ${f.nome}`));

    // Registrar no histórico
    const venda = {
        id: Date.now(),
        hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        itens: itensResumo.join(', '),
        total: parseFloat(totalGeralText.replace('R$', '').replace('.', '').replace(',', '.')),
        pago: valorPago
    };

    historicoVendas.unshift(venda);

    // Salvar no armazenamento local do navegador
    localStorage.setItem('historicoVendas_caixa', JSON.stringify(historicoVendas));

    // Resetar campos para a próxima venda
    quantidades = { pastel: 0, coxinha: 0, refri: 0 };
    fiados = [];
    elValorPago.value = '';
    renderizarFiados();
    atualizarCalculos();
}

// MODAL E HISTÓRICO
btnHistorico.addEventListener('click', () => {
    renderizarHistorico();
    modalHistorico.classList.remove('hidden');
});

btnFecharModal.addEventListener('click', () => {
    modalHistorico.classList.add('hidden');
});

function renderizarHistorico() {
    elListaHistorico.innerHTML = '';
    let faturamentoTotal = 0;

    if (historicoVendas.length === 0) {
        elListaHistorico.innerHTML = '<p class="summary-item-empty">Nenhuma venda registrada ainda.</p>';
    } else {
        historicoVendas.forEach(venda => {
            faturamentoTotal += venda.total;
            const card = document.createElement('div');
            card.className = 'history-card';
            card.innerHTML = `
                <div class="history-card-header">
                    <span>${venda.hora} - R$ ${venda.total.toFixed(2).replace('.', ',')}</span>
                </div>
                <div class="history-card-details">${venda.itens}</div>
            `;
            elListaHistorico.appendChild(card);
        });
    }

    elTotalFaturado.textContent = `R$ ${faturamentoTotal.toFixed(2).replace('.', ',')}`;
}

function limparHistorico() {
    if (confirm('Deseja realmente apagar todo o histórico de vendas?')) {
        historicoVendas = [];
        localStorage.removeItem('historicoVendas_caixa');
        renderizarHistorico();
    }
}

// ESCUTAR DIGITAÇÃO
elValorPago.addEventListener('input', atualizarCalculos);