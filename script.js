// PREÇOS DOS PRODUTOS FIXOS
const PRECOS = {
    pastel: 8.00,
    coxinha: 8.00,
    refri: 5.00
};

// ESTADO DO CAIXA
let quantidades = {
    pastel: 0,
    coxinha: 0,
    refri: 0
};

let fiados = [];

// ELEMENTOS DOM
const elQtdPastel = document.getElementById('qtd-pastel');
const elQtdCoxinha = document.getElementById('qtd-coxinha');
const elQtdRefri = document.getElementById('qtd-refri');

const elSubtotalPastel = document.getElementById('subtotal-pastel');
const elSubtotalCoxinha = document.getElementById('subtotal-coxinha');
const elSubtotalRefri = document.getElementById('subtotal-refri');

const elResumoFixos = document.getElementById('resumo-fixos');
const elResumoOutros = document.getElementById('resumo-outros');
const elTotalGeral = document.getElementById('total-geral');

const elValorPago = document.getElementById('valor-pago');
const elTrocoBox = document.getElementById('troco-box');
const elTrocoLabel = document.getElementById('troco-label');
const elTrocoValor = document.getElementById('troco-valor');

const elFiadoNome = document.getElementById('fiado-nome');
const elFiadoValor = document.getElementById('fiado-valor');
const elFiadoLista = document.getElementById('fiado-lista');
const btnAddFiado = document.getElementById('btn-add-fiado');
const btnReset = document.getElementById('btn-reset');

// ADICIONAR OU REMOVER QUANTIDADE
function alterarQtd(item, delta) {
    if (quantidades[item] + delta >= 0) {
        quantidades[item] += delta;
        atualizarCalculos();
    }
}

// ADICIONAR ITEM NA LISTA DE FIADO/OUTROS
btnAddFiado.addEventListener('click', () => {
    const nome = elFiadoNome.value.trim() || 'Item Sem Nome';
    const valor = parseFloat(elFiadoValor.value);

    if (isNaN(valor) || valor <= 0) {
        alert('Por favor, insira um valor válido maior que zero.');
        return;
    }

    fiados.push({ id: Date.now(), nome, valor });
    
    // Limpar inputs de fiado
    elFiadoNome.value = '';
    elFiadoValor.value = '';

    renderizarFiados();
    atualizarCalculos();
});

// REMOVER ITEM DO FIADO
function removerFiado(id) {
    fiados = fiados.filter(f => f.id !== id);
    renderizarFiados();
    atualizarCalculos();
}

// RENDERIZAR LISTA DE FIADOS
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

// ATALHO PARA BOTAO DE DINHEIRO RÁPIDO
function adicionarDinheiroAtalho(valor) {
    const atual = parseFloat(elValorPago.value) || 0;
    elValorPago.value = (atual + valor).toFixed(2);
    atualizarCalculos();
}

// RECALCULAR TOTAL E TROCO
function atualizarCalculos() {
    // 1. Atualiza Contadores visuais dos cards
    elQtdPastel.textContent = quantidades.pastel;
    elQtdCoxinha.textContent = quantidades.coxinha;
    elQtdRefri.textContent = quantidades.refri;

    // 2. Subtotais Individuais
    const subPastel = quantidades.pastel * PRECOS.pastel;
    const subCoxinha = quantidades.coxinha * PRECOS.coxinha;
    const subRefri = quantidades.refri * PRECOS.refri;

    elSubtotalPastel.textContent = `R$ ${subPastel.toFixed(2).replace('.', ',')}`;
    elSubtotalCoxinha.textContent = `R$ ${subCoxinha.toFixed(2).replace('.', ',')}`;
    elSubtotalRefri.textContent = `R$ ${subRefri.toFixed(2).replace('.', ',')}`;

    // 3. Totais Acumulados
    const totalFixos = subPastel + subCoxinha + subRefri;
    const totalOutros = fiados.reduce((acc, cur) => acc + cur.valor, 0);
    const totalGeral = totalFixos + totalOutros;

    elResumoFixos.textContent = `R$ ${totalFixos.toFixed(2).replace('.', ',')}`;
    elResumoOutros.textContent = `R$ ${totalOutros.toFixed(2).replace('.', ',')}`;
    elTotalGeral.textContent = `R$ ${totalGeral.toFixed(2).replace('.', ',')}`;

    // 4. Cálculo do Troco
    const valorPagoInput = elValorPago.value;
    const valorPago = parseFloat(valorPagoInput);

    if (valorPagoInput === '' || isNaN(valorPago)) {
        elTrocoBox.className = 'change-box neutral';
        elTrocoLabel.textContent = 'Aguardando valor...';
        elTrocoValor.textContent = 'R$ 0,00';
    } else {
        const diferenca = valorPago - totalGeral;

        if (diferenca >= 0) {
            elTrocoBox.className = 'change-box success';
            elTrocoLabel.textContent = 'TROCO A DEVOLVER:';
            elTrocoValor.textContent = `R$ ${diferenca.toFixed(2).replace('.', ',')}`;
        } else {
            elTrocoBox.className = 'change-box warning';
            elTrocoLabel.textContent = 'FALTA RECEBER:';
            elTrocoValor.textContent = `R$ ${Math.abs(diferenca).toFixed(2).replace('.', ',')}`;
        }
    }
}

// RESETAR/LIMPAR CAIXA
btnReset.addEventListener('click', () => {
    quantidades = { pastel: 0, coxinha: 0, refri: 0 };
    fiados = [];
    elValorPago.value = '';
    renderizarFiados();
    atualizarCalculos();
});

// ESCUTAR DIGITAÇÃO NO CAMPO DE PAGAMENTO
elValorPago.addEventListener('input', atualizarCalculos);