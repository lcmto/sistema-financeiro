// ==================== FUNÇÕES UTIlITÁRIAS GLOBAIS ====================
// Estas funções são declaradas no topo para garantir que estejam sempre disponíveis.

/**
 * Formata um valor numérico como moeda BRL.
 * @param {number} value - O valor a ser formatado.
 * @returns {string} O valor formatado como string.
 */
function formatCurrency(value) {
    if (typeof value !== 'number') return 'R$ 0,00';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// No topo do script, junto com as outras instâncias de gráfico
let evolucaoMensalCategoriaChartInstance = null; // ADICIONADO: Nova instância para o gráfico

/**
 * Gera um ID único e universalmente exclusivo (UUID) ou um fallback robusto.
 * Utiliza crypto.randomUUID() se disponível, caso contrário, um método baseado em timestamp e random.
 * @returns {string} Um ID único.
 */
function generateUniqueId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Fallback robusto para ambientes sem crypto.randomUUID
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 15);
}

/**
 * Exibe um alerta visual na interface do usuário.
 * @param {string} message - A mensagem a ser exibida.
 * @param {'success' | 'error' | 'info'} type - O tipo de alerta para estilização.
 */
function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('globalAlertContainer');
    if (!alertContainer) {
        console.warn('globalAlertContainer não encontrado. Alerta não exibido.');
        return;
    }

    const alertDiv = document.createElement('div');
    alertDiv.className = `p-4 mb-3 rounded-lg shadow-md text-white flex items-center justify-between transition-opacity duration-300`;

    // Estilos baseados no tipo
    switch (type) {
        case 'success':
            alertDiv.classList.add('bg-emerald-500');
            break;
        case 'error':
            alertDiv.classList.add('bg-red-500');
            break;
        case 'info':
            alertDiv.classList.add('bg-sky-500');
            break;
    }

    alertDiv.innerHTML = `
        <span>${message}</span>
        <button class="ml-4 opacity-75 hover:opacity-100 close-alert-btn">
            <i class="fas fa-times"></i>
        </button>
    `;

    alertContainer.prepend(alertDiv); // Adiciona no topo para que os mais novos apareçam primeiro

    // Adiciona listener para fechar o alerta
    alertDiv.querySelector('.close-alert-btn').addEventListener('click', () => {
        alertDiv.classList.add('opacity-0');
        alertDiv.addEventListener('transitionend', () => alertDiv.remove());
    });

    // Remove o alerta automaticamente após 5 segundos
    setTimeout(() => {
        alertDiv.classList.add('opacity-0');
        alertDiv.addEventListener('transitionend', () => alertDiv.remove());
    }, 5000);
}

/**
 * Função robusta para formatar datas em 'YYYY-MM-DD'.
 * @param {any} dateInput - O valor da data a ser formatado.
 * @returns {string} A data formatada como 'YYYY-MM-DD'. Retorna a data atual se a entrada for inválida.
 */
function formatDate(dateInput) {
    if (!dateInput) return new Date().toISOString().split('T')[0];

    // Handle Excel numeric date (days since 1900-01-01)
    if (typeof dateInput === 'number') {
        const excelEpoch = new Date(1899, 11, 30); // Excel's epoch is Dec 30, 1899
        const date = new Date(excelEpoch.getTime() + dateInput * 24 * 60 * 60 * 1000);
        return date.toISOString().split('T')[0];
    }

    const s = String(dateInput).trim();

    // ISO format YYYY-MM-DD
    const isoMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
    if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;

    // Brazilian format DD/MM/YYYY or DD-MM-YYYY
    const brMatch = /^(\d{1,2})[/\-](\d{1,2})[/\-](\d{2,4})$/.exec(s);
    if (brMatch) {
        const day = brMatch[1].padStart(2, '0');
        const month = brMatch[2].padStart(2, '0');
        let year = brMatch[3];
        if (year.length === 2) { // Convert YY to YYYY (e.g., 23 to 2023)
            year = (parseInt(year) > 50 ? '19' : '20') + year; // Basic heuristic
        }
        return `${year}-${month}-${day}`;
    }

    // Try parsing directly as Date object
    const parsedDate = new Date(s);
    if (!isNaN(parsedDate.getTime())) {
        return parsedDate.toISOString().split('T')[0];
    }

    // Fallback to today's date if all parsing fails
    return new Date().toISOString().split('T')[0];
}

/**
 * Formata a data para exibição no formato DD/MM/YYYY.
 * @param {string} isoDate - Data no formato YYYY-MM-DD.
 * @returns {string} Data no formato DD/MM/YYYY.
 */
function formatDisplayDate(isoDate) {
    if (!isoDate) return '';
    try {
        const [year, month, day] = isoDate.split('-');
        return `${day}/${month}/${year}`;
    } catch (e) {
        console.error("Erro ao formatar data de exibição:", e);
        return isoDate; // Retorna a original em caso de erro
    }
}

/**
 * Refactored function to determine transaction type.
 * @param {string} descricao - The transaction description.
 * @param {number} valor - The transaction value.
 * @param {string} documentType - The document type (e.g., 'extrato_bancario', 'fatura_cartao_credito').
 * @returns {string} The determined transaction type ('receita' or 'despesa').
 */
function determineTransactionType(descricao, valor, documentType) {
    const rules = DOCUMENT_TYPE_RULES[documentType] || DOCUMENT_TYPE_RULES[CONSTANTS.DOC_TYPE_GENERIC];
    const lowerCaseDescricao = String(descricao).toLowerCase();

    if (rules.special_terms) {
        for (const termRule of rules.special_terms) {
            if (termRule.terms.some(term => lowerCaseDescricao.includes(term))) {
                return termRule.type;
            }
        }
    }

    if (documentType === CONSTANTS.DOC_TYPE_CREDIT_CARD_BILL) {
        return CONSTANTS.TRANSACTION_TYPE_EXPENSE; // Padrão para faturas
    }

    // Fallback para o sinal do valor em extratos
    return valor >= 0 ? CONSTANTS.TRANSACTION_TYPE_INCOME : CONSTANTS.TRANSACTION_TYPE_EXPENSE;
}

/**
 * Função para cancelar a revisão de importação e fechar o modal.
 * Esta função foi movida para o topo para ser globalmente acessível.
 */
function cancelImportReview() {
    closeModal('importReviewModal');
    appState.transactionsToReview = []; // Limpa as transações de revisão
    showAlert('Revisão de importação cancelada.', CONSTANTS.ALERT_TYPE_INFO);
}

// ==================== CONFIGURAÇÃO GLOBAL ====================
const CONSTANTS = {
    TRANSACTION_TYPE_INCOME: 'receita',
    TRANSACTION_TYPE_EXPENSE: 'despesa',
    ALERT_TYPE_SUCCESS: 'success',
    ALERT_TYPE_ERROR: 'error',
    ALERT_TYPE_INFO: 'info',
    UNCATEGORIZED: 'Não categorizado',
    CARD_CREDIT_TERMS: ['cartão de crédito', 'cartao de credito', 'credito', 'credit card', 'fatura', 'pagamento fatura', 'pagto fatura', 'compra com cartao', 'ccred'],
    PIX_TERMS: ['pix', 'qr code', 'transferencia pix'],
    DEBIT_TERMS: ['débito', 'debito', 'debit', 'cartao de debito', 'cartão de débito'],
    MONEY_TERMS: ['dinheiro', 'cash', 'espécie'],
    BOLETO_TERMS: ['boleto', 'pagamento boleto'],
    TRANSFER_TERMS: ['transferencia', 'transfer', 'ted', 'doc'],
    RECURRING_FREQUENCY_WEEKLY: 'weekly',
    RECURRING_FREQUENCY_MONTHLY: 'monthly',
    RECURRING_FREQUENCY_BIMESTRAL: 'bimestral',
    RECURRING_FREQUENCY_QUARTERLY: 'quarterly',
    RECURRING_FREQUENCY_SEMESTRAL: 'semestral',
    RECURRING_FREQUENCY_YEARLY: 'yearly',
    PAYMENT_TYPE_SINGLE: 'single',
    PAYMENT_TYPE_INSTALLMENT: 'installment',
    DOC_TYPE_BANK_STATEMENT: 'extrato_bancario',
    DOC_TYPE_CREDIT_CARD_BILL: 'fatura_cartao_credito',
    DOC_TYPE_GENERIC: 'outros',
};

// ==================== REGRAS DE CATEGORIZAÇÃO AUTOMÁTICA ====================
const CATEGORY_KEYWORDS = [
    // Despesas - Moradia
    { terms: ['aluguel'], tipo: CONSTANTS.TRANSACTION_TYPE_EXPENSE, category: 'Moradia', subcategory: 'Aluguel' },
    { terms: ['condominio'], tipo: CONSTANTS.TRANSACTION_TYPE_EXPENSE, category: 'Moradia', subcategory: 'Condomínio' },
    { terms: ['iptu'], tipo: CONSTANTS.TRANSACTION_TYPE_EXPENSE, category: 'Moradia', subcategory: 'IPTU' },
    { terms: ['supermercado', 'mercado', 'paodeacucar', 'carrefour', 'extra'], tipo: CONSTANTS.TRANSACTION_TYPE_EXPENSE, category: 'Moradia', subcategory: 'Supermercado' },
    { terms: ['restaurante', 'delivery', 'comida', 'ifood', 'rappi', 'ubereats', 'pizza'], tipo: CONSTANTS.TRANSACTION_TYPE_EXPENSE, category: 'Moradia', subcategory: 'Restaurantes/deliverys' },
    { terms: ['agua', 'saneamento', 'cedae', 'sabesp'], tipo: CONSTANTS.TRANSACTION_TYPE_EXPENSE, category: 'Moradia', subcategory: 'Conta de água' },
    { terms: ['luz', 'energia', 'eletricidade', 'enel', 'light'], tipo: CONSTANTS.TRANSACTION_TYPE_EXPENSE, category: 'Moradia', subcategory: 'Conta de energia' },
    { terms: ['celular', 'telefonia', 'claro', 'vivo', 'tim'], tipo: CONSTANTS.TRANSACTION_TYPE_EXPENSE, category: 'Moradia', subcategory: 'Celulares' },
    { terms: ['internet', 'banda larga', 'provedor', 'net', 'claro net', 'gvt'], tipo: CONSTANTS.TRANSACTION_TYPE_EXPENSE, category: 'Moradia', subcategory: 'Internet' },
    { terms: ['baba'], tipo: CONSTANTS.TRANSACTION_TYPE_EXPENSE, category: 'Moradia', subcategory: 'Babá' },
    { terms: ['encargos trabalhistas'], tipo: CONSTANTS.TRANSACTION_TYPE_EXPENSE, category: 'Moradia', subcategory: 'Encargos trabalhistas babá' },
    { terms: ['diarista', 'faxina'], tipo: CONSTANTS.TRANSACTION_TYPE_EXPENSE, category: 'Moradia', subcategory: 'Diarista' },
    { terms: ['itens para casa', 'decoracao', 'utensilios', 'moveis'], tipo: CONSTANTS.TRANSACTION_TYPE_EXPENSE, category: 'Moradia', subcategory: 'Itens para casa' },
    // Despesas - Saúde
    { terms: ['plano de saude', 'unimed', 'bradesco saude', 'amil'], tipo: CONSTANTS.TRANSACTION_TYPE_EXPENSE, category: 'Saúde', subcategory: 'Plano de Saúde' },
    { terms: ['psicologo', 'terapeuta', 'psiquiatra', 'terapia'], tipo: CONSTANTS.TRANSACTION_TYPE_EXPENSE, category: 'Saúde', subcategory: 'Psicólogo/Terapeutas' },
    { terms: ['dentista', 'odontologia', 'aparelho'], tipo: CONSTANTS.TRANSACTION_TYPE_EXPENSE, category: 'Saúde', subcategory: 'Dentista' },
    { terms: ['farmacia', 'remedio', 'drogasil', 'drogaria'], tipo: CONSTANTS.TRANSACTION_TYPE_EXPENSE, category: 'Saúde', subcategory: 'Farmácia' },
    { terms: ['medico', 'consulta medica', 'exame', 'laboratorio', 'hospital'], tipo: CONSTANTS.TRANSACTION_TYPE_EXPENSE, category: 'Saúde', subcategory: 'Médicos' },
    // Despesas - Pessoais
    { terms: ['curso', 'educacao', 'livro', 'faculdade', 'pos-graduacao'], tipo: CONSTANTS.TRANSACTION_TYPE_EXPENSE, category: 'Despesas Pessoais', subcategory: 'Cursos' },
    { terms: ['salao', 'cabeleireiro', 'unha', 'manicure'], tipo: CONSTANTS.TRANSACTION_TYPE_EXPENSE, category: 'Despesas Pessoais', subcategory: 'Salão' },
    { terms: ['sobrancelha'], tipo: CONSTANTS.TRANSACTION_TYPE_EXPENSE, category: 'Despesas Pessoais', subcategory: 'Sobrancelha' },
    { terms: ['massagem', 'cuidado personal', 'estetica'], tipo: CONSTANTS.TRANSACTION_TYPE_EXPENSE, category: 'Despesas Pessoais', subcategory: 'Massagem e cuidados' },
    { terms: ['vestuario', 'roupa', 'sapato', 'acessorios'], tipo: CONSTANTS.TRANSACTION_TYPE_EXPENSE, category: 'Despesas Pessoais', subcategory: 'Vestuário' },
    { terms: ['suplemento', 'nutricao'], tipo: CONSTANTS.TRANSACTION_TYPE_EXPENSE, category: 'Despesas Pessoais', subcategory: 'Suplementos' },
    { terms: ['academia', 'esporte', 'natacao', 'pilates', 'yoga'], tipo: CONSTANTS.TRANSACTION_TYPE_EXPENSE, category: 'Despesas Pessoais', subcategory: 'Academia e esportes' },
    { terms: ['iclinic software'], tipo: CONSTANTS.TRANSACTION_TYPE_EXPENSE, category: 'Custos da profissão', subcategory: 'Aplicativos (iclinic + whitebook)' },
    { terms: ['totalpass'], tipo: CONSTANTS.TRANSACTION_TYPE_EXPENSE, category: 'Despesas Pessoais', subcategory: 'Academia e esportes' },
    // Despesas - Férias (viagens)
    { terms: ['hospedagem', 'hotel', 'airbnb', 'pousada'], tipo: CONSTANTS.TRANSACTION_TYPE_EXPENSE, category: 'Férias (viagens)', subcategory: 'Hospedagens' },
    { terms: ['passagem', 'gasolina viagem', 'voo', 'aereo', 'onibus'], tipo: CONSTANTS.TRANSACTION_TYPE_EXPENSE, category: 'Férias (viagens)', subcategory: 'Passagens + gasolina' },
    { terms: ['passeio', 'turismo', 'excursao', 'ingresso'], tipo: CONSTANTS.TRANSACTION_TYPE_EXPENSE, category: 'Férias (viagens)', subcategory: 'Passeios' },
    { terms: ['alimentacao viagem'], tipo: CONSTANTS.TRANSACTION_TYPE_EXPENSE, category: 'Férias (viagens)', subcategory: 'Alimentação' },
    // Despesas - Transporte
    { terms: ['combustivel', 'posto', 'gasolina', 'etanol', 'diesel'], tipo: CONSTANTS.TRANSACTION_TYPE_EXPENSE, category: 'Transporte', subcategory: 'Combustível' },
    { terms: ['seguro carro', 'seguro veiculo', 'allianz', 'porto seguro'], tipo: CONSTANTS.TRANSACTION_TYPE_EXPENSE, category: 'Transporte', subcategory: 'Seguros' },
    { terms: ['manutencao carro', 'reparo veiculo', 'oficina', 'troca oleo', 'pneu'], tipo: CONSTANTS.TRANSACTION_TYPE_EXPENSE, category: 'Transporte', subcategory: 'Manutenção e reparos' },
    { terms: ['lavagem carro'], tipo: CONSTANTS.TRANSACTION_TYPE_EXPENSE, category: 'Transporte', subcategory: 'Lavagens' },
    { terms: ['estacionamento', 'parada'], tipo: CONSTANTS.TRANSACTION_TYPE_EXPENSE, category: 'Transporte', subcategory: 'Estacionamentos' },
    { terms: ['multa'], tipo: CONSTANTS.TRANSACTION_TYPE_EXPENSE, category: 'Transporte', subcategory: 'Multas' },
    { terms: ['ipva'], tipo: CONSTANTS.TRANSACTION_TYPE_EXPENSE, category: 'Transporte', subcategory: 'IPVA (Bia + Lucas)' },
    { terms: ['aplicativos transporte', 'uber', '99', 'taxi'], tipo: CONSTANTS.TRANSACTION_TYPE_EXPENSE, category: 'Transporte', subcategory: 'Aplicativos' },
    // Despesas - Outros
    { terms: ['doacao'], tipo: CONSTANTS.TRANSACTION_TYPE_EXPENSE, category: 'Outros', subcategory: 'Doações' },
    { terms: ['presente', 'aniversario', 'casamento'], tipo: CONSTANTS.TRANSACTION_TYPE_EXPENSE, category: 'Outros', subcategory: 'Presentes' },
    { terms: ['custos do cartao', 'taxa cartao', 'anuidade'], tipo: CONSTANTS.TRANSACTION_TYPE_EXPENSE, category: 'Outros', subcategory: 'Custos do cartão' },
    // Despesas - Custos da profissão
    { terms: ['aluguel sala', 'consultorio aluguel'], tipo: CONSTANTS.TRANSACTION_TYPE_EXPENSE, category: 'Custos da profissão', subcategory: 'Aluguel sala' },
    { terms: ['contador', 'mensalidade contador'], tipo: CONSTANTS.TRANSACTION_TYPE_EXPENSE, category: 'Custos da profissão', subcategory: 'Mensalidade Contador' },
    { terms: ['impostos pj', 'iss', 'pis', 'cofins', 'csll', 'irpj'], tipo: CONSTANTS.TRANSACTION_TYPE_EXPENSE, category: 'Custos da profissão', subcategory: 'Impostos PJ (ISS + PIS + Cofins + CSLL + IRPJ)' },
    { terms: ['publicidade', 'marketing', 'anuncio'], tipo: CONSTANTS.TRANSACTION_TYPE_EXPENSE, category: 'Custos da profissão', subcategory: 'Publicidade' },
    { terms: ['iclinic', 'whitebook', 'medico aplicativo'], tipo: CONSTANTS.TRANSACTION_TYPE_EXPENSE, category: 'Custos da profissão', subcategory: 'Aplicativos (iclinic + whitebook)' },
    { terms: ['materiais consultorio', 'equipamento medico', 'insumos'], tipo: CONSTANTS.TRANSACTION_TYPE_EXPENSE, category: 'Custos da profissão', subcategory: 'Materiais de consultório' },
    { terms: ['conselhos', 'crm', 'sbpt'], tipo: CONSTANTS.TRANSACTION_TYPE_EXPENSE, category: 'Custos da profissão', subcategory: 'Conselhos (CRM PF e PJ | SBPT)' },
    // Receitas
    { terms: ['consultorio particular', 'atendimento particular'], tipo: CONSTANTS.TRANSACTION_TYPE_INCOME, category: 'Consultório particular', subcategory: 'Consultório particular' },
    { terms: ['unimed pj', 'pagamento unimed pj'], tipo: CONSTANTS.TRANSACTION_TYPE_INCOME, category: 'Unimed PJ', subcategory: 'Unimed PJ' },
    { terms: ['unimed pf', 'pagamento unimed pf'], tipo: CONSTANTS.TRANSACTION_TYPE_INCOME, category: 'Unimed PF', subcategory: 'Unimed PF' },
    { terms: ['hospital santa rosalia', 'pagamento hospital'], tipo: CONSTANTS.TRANSACTION_TYPE_INCOME, category: 'Hospital Santa Rosália', subcategory: 'Hospital Santa Rosália' },
    { terms: ['sae ampliado'], tipo: CONSTANTS.TRANSACTION_TYPE_INCOME, category: 'SAE ampliado', subcategory: 'SAE ampliado' },
    { terms: ['visitas domiciliares'], tipo: CONSTANTS.TRANSACTION_TYPE_INCOME, category: 'Visitas domiciliares particulares', subcategory: 'Visitas domiciliares particulares' },
    { terms: ['visitas hospitalares'], tipo: CONSTANTS.TRANSACTION_TYPE_INCOME, category: 'Visitas hospitalares particulares', subcategory: 'Visitas hospitalares particulares' },
    { terms: ['dividendos', 'fundo imobiliario', 'acoes', 'rendimento'], tipo: CONSTANTS.TRANSACTION_TYPE_INCOME, category: 'Dividendos Fundos e ações', subcategory: 'Dividendos Fundos e ações' },
    { terms: ['lucas salario', 'salario lucas'], tipo: CONSTANTS.TRANSACTION_TYPE_INCOME, category: 'Lucas salário', subcategory: 'Lucas salário' },
];

// ==================== REGRAS DE IMPORTAÇÃO POR TIPO DE DOCUMENTO ====================
const DOCUMENT_TYPE_RULES = {
    [CONSTANTS.DOC_TYPE_BANK_STATEMENT]: {
        description: 'Extrato Bancário (Transações diversas)',
        defaultMeio: 'transferencia',
        special_terms: []
    },
    [CONSTANTS.DOC_TYPE_CREDIT_CARD_BILL]: {
        description: 'Fatura de Cartão de Crédito',
        defaultMeio: 'cartao_credito',
        special_terms: [
            { terms: ['pagamento recebido', 'pagamento_cartao', 'credito', 'estorno', 'reembolso', 'devolucao', 'cashback'], type: CONSTANTS.TRANSACTION_TYPE_INCOME },
            { terms: ['juros', 'encargos', 'multa', 'anuidade', 'tarifa', 'servico'], type: CONSTANTS.TRANSACTION_TYPE_EXPENSE }
        ]
    },
    [CONSTANTS.DOC_TYPE_GENERIC]: {
        description: 'Documento Genérico',
        defaultMeio: 'outros',
        special_terms: []
    }
};

// ==================== PERFIS DE IMPORTAÇÃO ====================
// ===== INÍCIO DA ALTERAÇÃO (COMPLETA DO OBJETO IMPORTERPROFILES) =====
const importerProfiles = {
    bancoDoBrasil: {
        name: 'Banco do Brasil',
        headerSignature: ['Data', 'Lançamento', 'Valor', 'Tipo Lançamento'],
        delimiter: ',',
    },
    bancoInter: {
        name: 'Banco Inter',
        delimiter: ';',
        // Assinatura corrigida para corresponder ao arquivo "extrato inter.csv"
        headerSignature: ['Data Lançamento', 'Histórico', 'Descrição', 'Valor'],
    }
};
// ===== FIM DA ALTERAÇÃO =====


/**
 * Tenta detectar o perfil de um arquivo CSV/Excel com base nos seus cabeçalhos.
 * @param {string[]} lines - As primeiras linhas do arquivo.
 * @returns {object|null} O perfil detectado ou null.
 */
function detectFileProfile(lines) {
    if (!lines || lines.length === 0) return null;

    for (let i = 0; i < Math.min(lines.length, 10); i++) { // Check first 10 lines for header
        const headerLine = lines[i];
        if (!headerLine) continue;

        for (const profileKey in importerProfiles) {
            const profile = importerProfiles[profileKey];
            if (!profile.headerSignature) continue; // Ensure signature exists

            // Convert header columns to lowercase for case-insensitive comparison
            const headerColumns = headerLine.split(new RegExp(profile.delimiter + '(?=(?:[^"]*"[^"]*")*[^"]*$)'))
                .map(h => h.trim().replace(/"/g, '').toLowerCase());

            // Check if all signature terms are present in the lowercase header columns
            const allSignaturesFound = profile.headerSignature.every(sig => headerColumns.includes(sig.toLowerCase()));

            if (allSignaturesFound) {
                console.log(`Perfil detectado: ${profile.name}`);
                // Dynamically find column indices based on common keywords or exact matches
                profile.mapping = {
                    date: headerColumns.findIndex(h => h.includes('data') || h.includes('data lançamento')),
                    description: headerColumns.findIndex(h => h.includes('histórico') || h.includes('descrição') || h.includes('detalhe')),
                    value: headerColumns.findIndex(h => h.includes('valor') || h.includes('montante') || h.includes('quantia')),
                    typeSignal: headerColumns.findIndex(h => h.includes('sinal') || h.includes('tipo de lancamento')),
                    category: headerColumns.findIndex(h => h.includes('categoria')),
                    subcategory: headerColumns.findIndex(h => h.includes('subcategoria'))
                };

                // Basic validation for essential columns
                if (profile.mapping.date === -1 || profile.mapping.value === -1) {
                    console.warn(`Perfil ${profile.name} detectado, mas colunas essenciais (Data, Valor) não encontradas.`);
                    return null; // Don't use this profile if essential columns are missing
                }

                profile.skipRows = i + 1; // Skip header row(s)
                return profile;
            }
        }
    }

    console.log('Nenhum perfil de banco específico detectado. Usando importador genérico.');
    return null;
}


// ==================== FUNÇÕES DE PROCESSAMENTO DE ARQUIVOS ====================
/**
 * Processa um arquivo CSV, tenta detectar o perfil e extrair transações.
 * @param {File} file - O arquivo CSV a ser processado.
 * @param {string} documentType - O tipo de documento selecionado pelo usuário.
 * @returns {Promise<object>} Um objeto contendo as transações parsed e a contagem de linhas inválidas.
 */
async function processCSV(file, documentType) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const csvText = event.target.result;
                const lines = csvText.trim().split(/\r\n|\n/); // Corrected regex literal
                const profile = detectFileProfile(lines);
                let parsedTransactions = [];
                let invalidRows = 0;

                if (profile) {
                    for (let i = profile.skipRows; i < lines.length; i++) {
                        const line = lines[i].trim();
                        if (!line) continue;

                        const row = line.split(profile.delimiter).map(field => field.trim().replace(/"/g, ''));

                        // Ensure row has enough columns based on detected mapping
                        const maxIndex = Math.max(
                            profile.mapping.date,
                            profile.mapping.value,
                            profile.mapping.description,
                            profile.mapping.typeSignal || -1,
                            profile.mapping.category || -1,
                            profile.mapping.subcategory || -1
                        );

                        if (row.length <= maxIndex) {
                            console.warn(`Linha ${i + 1} do CSV ${file.name} tem colunas insuficientes. Pulando.`);
                            invalidRows++;
                            continue;
                        }

                        try {
                            const data = formatDate(row[profile.mapping.date]);
                            const descricao = row[profile.mapping.description] || '';
                            let valor = parseBrazilianCurrencyStringToFloat(row[profile.mapping.value]);

                            if (isNaN(valor)) {
                                invalidRows++;
                                continue;
                            }

                            // ADICIONADO: Pula linhas com valor zero, que são inúteis para a análise.
                            if (valor === 0) {
                                invalidRows++;
                                continue;
                            }

                            // ===== INÍCIO DA ALTERAÇÃO: Substituindo bloco if/else por determineTransactionType =====
                            let tipoTransacao = determineTransactionType(descricao, valor, documentType);
                            // ===== FIM DA ALTERAÇÃO =====

                            let meioFinal = detectMeioPagamento('', descricao); // Detect payment method based on description


                            const rule = findCategoryRule(descricao, 'description', tipoTransacao);
                            const categoriaOriginalDoArquivo = (profile.mapping.category !== -1 && profile.mapping.category < row.length) ? row[profile.mapping.category] : undefined;
                            const subcategoriaOriginalDoArquivo = (profile.mapping.subcategory !== -1 && profile.mapping.subcategory < row.length) ? row[profile.mapping.subcategory] : undefined;

                            const categoriaFinal = rule ? rule.category : (categoriaOriginalDoArquivo || CONSTANTS.UNCATEGORIZED);
                            const subcategoriaFinal = rule ? rule.subcategory : (subcategoriaOriginalDoArquivo || '');

                            parsedTransactions.push({
                                data: data,
                                descricao: descricao,
                                valor: Math.abs(valor),
                                tipo: tipoTransacao,
                                categoria: categoriaFinal,
                                subcategoria: subcategoriaFinal,
                                meio: meioFinal,
                                needsReview: (isNaN(new Date(data).getTime()) || categoriaFinal === CONSTANTS.UNCATEGORIZED || subcategoriaFinal === '' || meioFinal === 'outros')
                            });
                        } catch (e) {
                            console.warn(`Erro processando linha com perfil (${profile.name}): ${lines[i]}`, e);
                            invalidRows++;
                        }
                    }
                    resolve({ transactions: parsedTransactions, invalidRows: invalidRows });
                } else {
                    // Generic CSV parsing using PapaParse if no specific profile detected
                    Papa.parse(csvText, {
                        worker: true, // Use Web Worker for performance
                        header: true,
                        skipEmptyLines: true,
                        complete: (results) => {
                            try {
                                const genericParsed = (results.data || []).map(row => {
                                    const keys = Object.keys(row).map(k => k.toLowerCase());
                                    const valKey = keys.find(k => k.includes('valor') || k.includes('montante') || k.includes('quantia'));
                                    const descKey = keys.find(k => k.includes('descri') || k.includes('histórico') || k.includes('detalhe') || k.includes('descrição'));
                                    const dateKey = keys.find(k => k.includes('data') || k.includes('dia') || k.includes('data lançamento'));
                                    const categoriaKey = keys.find(k => k.includes('categoria'));
                                    const subcategoriaKey = keys.find(k => k.includes('subcategoria'));
                                    const tipoLancamentoKey = keys.find(k => k.includes('tipo') || k.includes('natureza') || k.includes('lançamento'));

                                    if (!valKey || !dateKey || !row[Object.keys(row).find(k => k.toLowerCase() === valKey)]) {
                                        invalidRows++;
                                        return null;
                                    }

                                    const valorStr = String(row[Object.keys(row).find(k => k.toLowerCase() === valKey)] || '0');
                                    let valor = parseBrazilianCurrencyStringToFloat(valorStr);

                                    if (isNaN(valor)) {
                                        invalidRows++;
                                        return null;
                                    }

                                    const data = formatDate(row[Object.keys(row).find(k => k.toLowerCase() === dateKey)]);
                                    const descricao = row[Object.keys(row).find(k => k.toLowerCase() === descKey)] || '';
                                    const tipoLancamentoValue = tipoLancamentoKey ? row[Object.keys(row).find(k => k.toLowerCase() === tipoLancamentoKey)] : '';

                                    // ===== INÍCIO DA ALTERAÇÃO: Substituindo bloco if/else por determineTransactionType =====
                                    let tipoTransacao = determineTransactionType(descricao, valor, documentType);
                                    // ===== FIM DA ALTERAÇÃO =====

                                    let meioFinal = detectMeioPagamento('', descricao); // Prioritize description for detection

                                    const rule = findCategoryRule(descricao, 'description', tipoTransacao);
                                    const categoriaOriginalValue = categoriaKey ? row[Object.keys(row).find(k => k.toLowerCase() === categoriaKey)] : undefined;
                                    const subcategoriaOriginalValue = subcategoriaKey ? row[Object.keys(row).find(k => k.toLowerCase() === subcategoriaKey)] : undefined;

                                    const categoriaFinal = rule ? rule.category : (String(categoriaOriginalValue || '') || CONSTANTS.UNCATEGORIZED);
                                    const subcategoriaFinal = rule ? rule.subcategory : (String(subcategoriaOriginalValue || '') || '');

                                    return {
                                        data: data,
                                        descricao: descricao,
                                        valor: Math.abs(valor),
                                        tipo: tipoTransacao,
                                        categoria: categoriaFinal,
                                        subcategoria: subcategoriaFinal,
                                        meio: meioFinal,
                                        needsReview: (isNaN(new Date(data).getTime()) || categoriaFinal === CONSTANTS.UNCATEGORIZED || subcategoriaFinal === '' || meioFinal === 'outros')
                                    };
                                }).filter(t => t !== null); // Filter out nulls from invalid rows
                                parsedTransactions.push(...genericParsed);
                                resolve({ transactions: parsedTransactions, invalidRows: invalidRows });
                            } catch (error) {
                                console.error(`Erro no processamento genérico do CSV: ${error.message}`, error);
                                resolve({ transactions: [], invalidRows: invalidRows + 1 });
                            }
                        },
                        error: (err) => {
                            console.error(`Erro ao fazer parse do CSV genérico: ${err.message}`, err);
                            resolve({ transactions: [], invalidRows: invalidRows + 1 });
                        }
                    });
                }
            } catch (error) {
                console.error(`Erro no processamento do CSV: ${error.message}`, error);
                resolve({ transactions: [], invalidRows: 1 });
            }
        };
        reader.onerror = (error) => {
            console.error(`Erro na leitura do arquivo CSV: ${error.message}`, error);
            resolve({ transactions: [], invalidRows: 1 });
        };
        reader.readAsText(file, 'UTF-8');
    });
}

/**
 * Processa um arquivo Excel (XLSX, XLS), tenta detectar o perfil e extrair transações.
 * @param {File} file - O arquivo Excel a ser processado.
 * @param {string} documentType - O tipo de documento selecionado pelo usuário.
 * @returns {Promise<object>} Um objeto contendo as transações parsed e a contagem de linhas inválidas.
 */
async function processExcel(file, documentType) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = async function(event) {
            let importedTransactions = [];
            let invalidRows = 0;
            try {
                const data = new Uint8Array(event.target?.result);
                if (!data || data.length === 0) throw new Error("Conteúdo do Excel vazio.");
                const workbook = XLSX.read(data, { type: 'array' });

                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                // Use header: 1 to get array of arrays, easier for manual header detection
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                if (jsonData.length < 2) {
                    console.warn(`Arquivo Excel ${file.name} está vazio ou não possui dados.`);
                    return resolve({ transactions: [], invalidRows: invalidRows });
                }

                const headerRow = jsonData[0].map(h => String(h || '').toLowerCase().trim()); // Ensure header is string and lowercased

                const dataIndex = headerRow.findIndex(h => h.includes('data') || h.includes('dia') || h.includes('data lançamento'));
                const valorIndex = headerRow.findIndex(h => h.includes('valor') || h.includes('montante') || h.includes('quantia'));
                const descricaoIndex = headerRow.findIndex(h => h.includes('descri') || h.includes('historico') || h.includes('detalhe') || h.includes('descrição'));
                const tipoLancamentoIndex = headerRow.findIndex(h => h.includes('tipo') || h.includes('natureza') || h.includes('lançamento'));
                const categoriaIndex = headerRow.findIndex(h => h.includes('categoria'));
                const subcategoriaIndex = headerRow.findIndex(h => h.includes('subcategoria'));
                const meioPagamentoIndex = headerRow.findIndex(h => h.includes('meio') || h.includes('pagamento') || h.includes('forma de pagamento'));

                if (dataIndex === -1 || valorIndex === -1) {
                    console.warn(`Arquivo Excel ${file.name} não possui colunas 'Data' e 'Valor' reconhecíveis.`);
                    return resolve({ transactions: [], invalidRows: invalidRows });
                }

                const rules = DOCUMENT_TYPE_RULES[documentType] || DOCUMENT_TYPE_RULES[CONSTANTS.DOC_TYPE_GENERIC];

                for (let i = 1; i < jsonData.length; i++) { // Start from second row (data rows)
                    const row = jsonData[i];
                    // Skip empty rows
                    if (!row || row.length === 0 || row.every(x => x === null || x === '')) {
                        invalidRows++;
                        continue;
                    }

                    try {
                        const dataValue = row[dataIndex];
                        const valorValue = row[valorIndex];
                        const descricaoValue = descricaoIndex !== -1 ? (row[descricaoIndex] || '') : '';
                        const tipoLancamentoValue = tipoLancamentoIndex !== -1 ? (row[tipoLancamentoIndex] || '') : '';
                        const categoriaOriginalValue = categoriaIndex !== -1 ? (row[categoriaIndex] || CONSTANTS.UNCATEGORIZED) : CONSTANTS.UNCATEGORIZED;
                        const subcategoriaOriginalValue = subcategoriaIndex !== -1 ? (row[subcategoriaIndex] || '') : '';
                        const meioPagamentoValue = meioPagamentoIndex !== -1 ? (row[meioPagamentoIndex] || '') : '';

                        let valor = parseBrazilianCurrencyStringToFloat(valorValue);

                        if (isNaN(valor)) {
                            console.warn(`Linha ${i + 1} do Excel ${file.name} com valor inválido: "${valorValue}". Pulando.`);
                            invalidRows++;
                            continue;
                        }

                        // ===== INÍCIO DA ALTERAÇÃO: Substituindo bloco if/else por determineTransactionType =====
                        let tipoTransacao = determineTransactionType(descricaoValue, valor, documentType);
                        // ===== FIM DA ALTERAÇÃO =====

                        // Prioritize payment method from column if available and recognized, else detect from description
                        let meioFinal = detectMeioPagamento(meioPagamentoValue, descricaoValue);

                        const rule = findCategoryRule(String(descricaoValue), 'description', tipoTransacao);
                        // Use category/subcategory from file if available and no rule matches, else use rule
                        const categoriaFinal = rule ? rule.category : (String(categoriaOriginalValue) || CONSTANTS.UNCATEGORIZED);
                        const subcategoriaFinal = rule ? rule.subcategory : (String(subcategoriaOriginalValue) || '');

                        const transaction = {
                            data: formatDate(dataValue),
                            descricao: String(descricaoValue) || '',
                            valor: Math.abs(valor),
                            tipo: tipoTransacao,
                            categoria: categoriaFinal,
                            subcategoria: subcategoriaFinal,
                            meio: meioFinal,
                            needsReview: (isNaN(new Date(dataValue).getTime()) || categoriaFinal === CONSTANTS.UNCATEGORIZED || subcategoriaFinal === '' || meioFinal === 'outros')
                        };
                        importedTransactions.push(transaction);
                    } catch (e) {
                        console.warn(`Erro processando linha do Excel ${file.name}: ${JSON.stringify(row)}`, e);
                        invalidRows++;
                    }
                }
                resolve({ transactions: importedTransactions, invalidRows: invalidRows });
            } catch (error) {
                console.error(`Erro ao processar Excel: ${error.message}`, error);
                resolve({ transactions: [], invalidRows: invalidRows + 1 });
            }
        };
        reader.onerror = (error) => {
            console.error(`Erro na leitura do arquivo Excel: ${error.message}`, error);
            resolve({ transactions: [], invalidRows: 1 });
        };
        reader.readAsArrayBuffer(file);
    });
}

// ==================== DATABASE CONFIGURATION ====================
const db = new Dexie('FinancialControlDB');

function showLoading() {
    try {
        const el = document.getElementById('loadingOverlay');
        if (el) el.classList.remove('hidden');
    } catch (error) {
        console.error('Erro ao mostrar loading:', error);
    }
}

function hideLoading() {
    try {
        const el = document.getElementById('loadingOverlay');
        if (el) el.classList.add('hidden');
    } catch (error) {
        console.error('Erro ao esconder loading:', error);
    }
}

const DEFAULT_CATEGORIES_DATA = {
    [CONSTANTS.TRANSACTION_TYPE_INCOME]: {
        "Consultório particular": [],
        "Unimed PJ": [],
        "Unimed PF": [],
        "Hospital Santa Rosália": [],
        "SAE ampliado": [],
        "Visitas domiciliares particulares": [],
        "Visitas hospitalares particulares": [],
        "Dividendos Fundos e ações": [],
        "Outros": [],
        "Lucas salário": []
    },
    [CONSTANTS.TRANSACTION_TYPE_EXPENSE]: {
        "Moradia": [
            "Aluguel", "Condomínio", "IPTU", "Supermercado", "Restaurantes/deliverys",
            "Conta de água", "Conta de energia", "Celulares", "Internet", "Babá",
            "Encargos trabalhistas babá", "Diarista", "Itens para casa", "Outros (em Moradia)"
        ],
        "Saúde": ["Plano de Saúde", "Psicólogo/Terapeutas", "Dentista", "Farmácia", "Médicos", "Outros"],
        "Despesas Pessoais": [
            "Cursos", "Salão", "Sobrancelha", "Massagem e cuidados", "Vestuário",
            "Suplementos", "Academia e esportes", "Outros"
        ],
        "Férias (viagens)": ["Hospedagens", "Passagens + gasolina", "Passeios", "Alimentação", "Outros"],
        "Transporte": [
            "Combustível", "Seguros", "Manutenção e reparos", "Lavagens",
            "Estacionamentos", "Multas", "IPVA (Bia + Lucas)", "Aplicativos"
        ],
        "Outros": ["Doações", "Presentes", "Custos do cartão"],
        "Custos da profissão": [
            "Aluguel sala", "Mensalidade Contador", "Impostos PJ (ISS + PIS + Cofins + CSLL + IRPJ)",
            "Publicidade", "Aplicativos (iclinic + whitebook)", "Materiais de consultório",
            "Conselhos (CRM PF e PJ | SBPT)", "Outros"
        ]
    }
};

db.version(483).stores({
    transactions: '++id,data,tipo,categoria,meio,dataCreated,isRecurring,recurringFrequency,nextOccurrenceDate,parentRecurringId,isInstallment,groupId,[tipo+data],[categoria+data]',
    appSettings: 'id',
}).upgrade(async tx => {
    console.log('Iniciando migração de banco de dados para a versão', tx.db.verno);
    let count = 0;
    let errorCount = 0;

    try {
        await tx.transactions.toCollection().modify(transaction => {
            try {
                // Ensure 'data' is always YYYY-MM-DD
                const originalData = transaction.data;
                transaction.data = formatDate(originalData);

                // For installment transactions, ensure groupId is set
                if (transaction.isInstallment && !transaction.groupId) {
                    // Use a new unique ID or existing ID if it was the first installment
                    transaction.groupId = transaction.id;
                }

                // Initialize new fields if they don't exist
                if (typeof transaction.isRecurring === 'undefined') transaction.isRecurring = false;
                if (typeof transaction.nextOccurrenceDate === 'undefined') transaction.nextOccurrenceDate = null;
                if (typeof transaction.recurringFrequency === 'undefined') transaction.recurringFrequency = null;
                if (typeof transaction.parentRecurringId === 'undefined') transaction.parentRecurringId = null;
                if (typeof transaction.isInstallment === 'undefined') transaction.isInstallment = false;
                if (typeof transaction.installmentInfo === 'undefined') transaction.installmentInfo = null;
                if (typeof transaction.groupId === 'undefined') transaction.groupId = null;
                if (typeof transaction.dataCreated === 'undefined') transaction.dataCreated = new Date().toISOString(); // Set creation date if missing

                count++;
            } catch (e) {
                errorCount++;
                console.error(`Falha ao migrar transação ID ${transaction.id}.`, e);
                // Set fallback values to ensure data consistency
                transaction.data = '1970-01-01';
                transaction.isRecurring = false;
                transaction.recurringFrequency = null;
                transaction.nextOccurrenceDate = null;
                transaction.parentRecurringId = null;
                transaction.isInstallment = false;
                transaction.installmentInfo = null;
                transaction.groupId = null;
                transaction.dataCreated = new Date().toISOString();
            }
        });

        console.log(`Migração concluída. ${count} transações processadas.`);
        if (errorCount > 0) {
            console.warn(`${errorCount} transações falharam durante a migração.`);
        }
    } catch (error) {
        console.error('Erro durante a migração do banco de dados:', error);
        showAlert('Erro crítico durante a migração do banco de dados. Algumas funcionalidades podem não funcionar corretamente.', CONSTANTS.ALERT_TYPE_ERROR);
    }
});


// ==================== GERENCIAMENTO DE ESTADO GLOBAL ====================
const appState = {
    categoriesData: DEFAULT_CATEGORIES_DATA,
    lastImportedTransactionIds: [],
    editingTransactionId: null,
    editingCategoryId: null,
    searchTimeout: null,
    currentSortOrder: 'desc',
    domElements: {},
    transactionsToReview: [],
    mainChartInstance: null, // Para a instância do Chart.js
    topCategoriasChartInstance: null, // Novo para o gráfico Top 10
    evolucaoMensalCategoriaChartInstance: null, // ADICIONADO: Nova instância para o gráfico de Evolução Mensal por Categoria
    currentReportTableTransactions: [], // ADICIONADO: Para armazenar as transações do relatório
};

// ==================== FUNÇÕES AUXILIARES DE IMPORTAÇÃO ====================
function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    if (event.currentTarget) {
        event.currentTarget.classList.add('dragover');
    }
}

function handleDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();
    if (event.currentTarget) {
        event.currentTarget.classList.remove('dragover');
    }
}

/**
 * Valida a seleção do tipo de documento e inicia o processamento dos arquivos.
 * @param {FileList} files - Lista de arquivos selecionados.
 */
function processAndValidateFiles(files) {
    try {
        const documentTypeSelect = appState.domElements.documentTypeSelect;
        const documentType = documentTypeSelect ? documentTypeSelect.value : '';
        if (!documentType) {
            showAlert('Por favor, selecione o tipo de documento antes de importar.', CONSTANTS.ALERT_TYPE_ERROR);
            if (documentTypeSelect) {
                documentTypeSelect.classList.add('is-invalid');
                const errorMessageElement = document.getElementById(`${documentTypeSelect.id}-error`);
                if (errorMessageElement) {
                    errorMessageElement.textContent = 'Este campo é obrigatório.';
                    errorMessageElement.style.display = 'block';
                    errorMessageElement.setAttribute('aria-live', 'assertive');
                }
            }
            return;
        }
        clearValidationError(documentTypeSelect);

        if (files && files.length > 0) {
            processUploadedFiles(files, documentType);
        }
    } catch (error) {
        console.error('Erro em processAndValidateFiles:', error);
        showAlert('Erro ao processar arquivos: ' + error.message, CONSTANTS.ALERT_TYPE_ERROR);
    }
}

function handleFileSelect(event) {
    if (event.target) {
        processAndValidateFiles(event.target.files);
    }
}

function handleFileDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    if (event.currentTarget) {
        event.currentTarget.classList.remove('dragover');
    }
    if (event.dataTransfer) {
        processAndValidateFiles(event.dataTransfer.files);
    }
}

/**
 * Orquestra o processamento de arquivos, categorização e exibição do modal de revisão.
 * @param {FileList} files - Lista de arquivos a serem processados.
 * @param {string} documentType - Tipo de documento selecionado pelo usuário.
 */
async function processUploadedFiles(files, documentType) {
    showLoading();
    let allParsedTransactions = [];
    let totalInvalidRows = 0;

    try {
        const promises = Array.from(files).map(file => {
            const extension = file.name.split('.').pop()?.toLowerCase();
            if (extension === 'csv') {
                return processCSV(file, documentType);
            } else if (['xlsx', 'xls'].includes(extension)) {
                return processExcel(file, documentType);
            } else {
                showAlert(`Formato de arquivo não suportado: ${file.name}`, CONSTANTS.ALERT_TYPE_ERROR);
                return Promise.resolve({ transactions: [], invalidRows: 0 }); // Resolve immediately for unsupported files
            }
        });

        const results = await Promise.all(promises.map(p => p.catch(e => {
            console.error("Erro durante o processamento de um arquivo:", e);
            showAlert(`Erro ao processar um arquivo: ${e.message}`, CONSTANTS.ALERT_TYPE_ERROR);
            return { transactions: [], invalidRows: 1 }; // Return a minimal error result to not break Promise.all
        })));

        results.forEach(result => {
            if (result && result.transactions) {
                allParsedTransactions.push(...result.transactions);
                totalInvalidRows += result.invalidRows;
            }
        });
    } catch (error) {
        // This catch is for errors in the Promise.all setup itself, not individual file processing
        console.error(`Erro no orquestramento de arquivos: ${error.message}`, error);
        showAlert(`Ocorreu um erro ao preparar a leitura dos arquivos: ${error.message}.`, CONSTANTS.ALERT_TYPE_ERROR);
    } finally {
        hideLoading();
    }

    if (totalInvalidRows > 0) {
        showAlert(`${totalInvalidRows} linha(s) não puderam ser lidas (por formato inválido ou dados ausentes) e foram ignoradas.`, CONSTANTS.ALERT_TYPE_INFO);
    }

    if (allParsedTransactions.length > 0) {
        applyAutoCategorization(allParsedTransactions);
        appState.transactionsToReview = allParsedTransactions;
        showAlert(`Processamento concluído. Revise as ${appState.transactionsToReview.length} transações encontradas.`, CONSTANTS.ALERT_TYPE_SUCCESS);
        openReviewModal(appState.transactionsToReview);
    } else {
        showAlert('Nenhuma transação válida foi encontrada nos arquivos selecionados.', CONSTANTS.ALERT_TYPE_INFO);
    }
}


// ==================== INICIALIZAÇÃO DO SISTEMA ====================
document.addEventListener('DOMContentLoaded', initializeSystem);

/**
 * Inicializa o sistema, abre o banco de dados, carrega configurações e configura a UI.
 */
async function initializeSystem() {
    showLoading();
    console.log('Iniciando sistema...');

    try {
        await db.open();
    } catch (dbError) {
        console.error(`Erro crítico ao abrir o banco de dados: ${dbError.message}`, dbError);
        showAlert('Erro crítico ao carregar o sistema: Não foi possível acessar o banco de dados. Tente recarregar a página ou limpar o cache.', CONSTANTS.ALERT_TYPE_ERROR);
        return;
    }

    try {
        const settings = await db.appSettings.get('generalSettings');
        if (settings) {
            appState.categoriesData = settings.categoriesData || DEFAULT_CATEGORIES_DATA;
            appState.lastImportedTransactionIds = settings.lastImportedTransactionIds || [];
        } else {
            // Initialize settings if not found
            await db.appSettings.put({
                id: 'generalSettings',
                categoriesData: DEFAULT_CATEGORIES_DATA,
                lastImportedTransactionIds: [],
            });
        }

        cacheDomElements();
        populateInitialSubcategories();

        const today = new Date().toISOString().split('T')[0];
        if (appState.domElements.dataInput) {
            appState.domElements.dataInput.value = today;
        }

        setupEventListeners();

        // ADICIONADA: Chamada para verificar a integridade das datas
        await verificarIntegridadeDasDates();

        showTab('panel-cadastro');

        showAlert('Sistema carregado com sucesso!', CONSTANTS.ALERT_TYPE_SUCCESS);
        console.log('Sistema inicializado com sucesso!');
        debugInfo();
    } catch (error) {
        console.error(`Erro na inicialização do sistema: ${error.message}`, error);
        showAlert('Erro ao inicializar sistema: ' + error.message, CONSTANTS.ALERT_TYPE_ERROR);
    } finally {
        hideLoading();
    }
}

// ==================== CACHE DE ELEMENTOS DOM ====================
/**
 * Centraliza a obtenção de referências a elementos DOM frequentemente usados.
 */
function cacheDomElements() {
    try {
        // Form de Cadastro
        appState.domElements.dataInput = document.getElementById('data');
        appState.domElements.tipoSelect = document.getElementById('tipo');
        appState.domElements.categoriaSelect = document.getElementById('categoria');
        appState.domElements.subcategoriaSelect = document.getElementById('subcategoria');
        appState.domElements.outraCategoriaInput = document.getElementById('outraCategoria');
        appState.domElements.outraSubcategoriaInput = document.getElementById('outraSubcategoria');
        appState.domElements.valorInput = document.getElementById('valor');
        appState.domElements.meioSelect = document.getElementById('meio');
        appState.domElements.descricaoInput = document.getElementById('descricao');

        appState.domElements.transactionForm = document.getElementById('transactionForm');
        appState.domElements.clearFormBtn = document.getElementById('clearFormBtn');
        appState.domElements.categoriaGroup = document.getElementById('categoriaGroup');
        appState.domElements.outraCategoriaGroup = document.getElementById('outraCategoriaGroup');
        appState.domElements.subcategoriaGroup = document.getElementById('subcategoriaGroup');
        appState.domElements.outraSubcategoriaGroup = document.getElementById('outraSubcategoriaGroup');
        appState.domElements.step1SubcategoryFields = document.getElementById('step1-subcategory-fields');
        appState.domElements.step2TypeCategoryFields = document.getElementById('step2-type-category-fields');
        appState.domElements.step3EssentialFields = document.getElementById('step3-essential-fields');
        appState.domElements.step4OptionalFields = document.getElementById('step4-optional-fields');

        // Form de Importação
        appState.domElements.fileInput = document.getElementById('fileInput');
        appState.domElements.importArea = document.getElementById('importArea');
        appState.domElements.undoImportBtn = document.getElementById('undoImportBtn');
        appState.domElements.importProgressDiv = document.getElementById('importProgress');
        appState.domElements.progressFillDiv = document.getElementById('progressFill');
        appState.domElements.progressTextP = document.getElementById('progressText');
        appState.domElements.documentTypeSelect = document.getElementById('documentTypeSelect');

        // Tabela de Transações
        appState.domElements.transactionsBody = document.getElementById('transactionsBody');
        appState.domElements.masterCheckbox = document.getElementById('masterCheckbox');
        appState.domElements.selectedCountSpan = document.getElementById('selectedCount');
        appState.domElements.selectedCountMeioModalSpan = document.getElementById('selectedCountMeioModal');
        appState.domElements.deleteSelectedBtn = document.getElementById('deleteSelectedBtn');
        appState.domElements.editSelectedMeioBtn = document.getElementById('editSelectedMeioBtn');
        appState.domElements.filterDataInicioInput = document.getElementById('filterDataInicio');
        appState.domElements.filterDataFimInput = document.getElementById('filterDataFim');
        appState.domElements.filterTipoSelect = document.getElementById('filterTipo');
        appState.domElements.filterCategoriaSelect = document.getElementById('filterCategoria');
        appState.domElements.searchBoxInput = document.getElementById('searchBox');
        appState.domElements.sortDateBtn = document.getElementById('sortDateBtn');
        appState.domElements.sortIconSpan = document.getElementById('sortIcon');
        appState.domElements.transactionStatsContainer = document.getElementById('transactionStats');
        appState.domElements.applyFiltersBtn = document.getElementById('applyFiltersBtn');
        appState.domElements.clearFiltersBtn = document.getElementById('clearFiltersBtn');
        appState.domElements.selectAllBtn = document.getElementById('selectAllBtn');

        // Relatórios
        appState.domElements.reportDataInicioInput = document.getElementById('reportDataInicio');
        appState.domElements.reportDataFimInput = document.getElementById('reportDataFim');
        appState.domElements.mainChartArea = document.getElementById('main-chart-area');
        appState.domElements.reportChartSelect = document.getElementById('reportChartSelect');
        appState.domElements.reportCategoriaFilter = document.getElementById('reportCategoriaFilter'); // ADICIONADO
appState.domElements.evolucaoCategoriaSelect = document.getElementById('evolucao-categoria-select');
        appState.domElements.chartTypeDespesasSelect = document.getElementById('chartTypeDespesas');
        appState.domElements.generateReportsBtn = document.getElementById('generateReportsBtn');
        appState.domElements.exportExcelReportBtn = document.getElementById('exportExcelReportBtn');
        appState.domElements.exportPdfReportBtn = document.getElementById('exportPdfReportBtn');
        appState.domElements.mainChartTitle = document.getElementById('main-chart-title');
        // KPIs do novo layout
        appState.domElements.kpiTotalReceitas = document.getElementById('kpi-total-receitas');
        appState.domElements.kpiTotalDespesas = document.getElementById('kpi-total-despesas');
        appState.domElements.kpiSaldoLiquido = document.getElementById('kpi-saldo-liquido');
        // Novo gráfico top 10
        appState.domElements.topCategoriasChart = document.getElementById('top-categorias-chart');
        // ADICIONE AS DUAS LINHAS ABAIXO
        appState.domElements.reportDetailsTableBody = document.getElementById('report-details-table-body');
        appState.domElements.reportSearchInput = document.getElementById('report-search-input');
        // ADICIONADO: Elemento para o novo gráfico de evolução mensal por categoria
        appState.domElements.evolucaoCategoriaSelect = document.getElementById('evolucao-categoria-select');


        // Configurações
        appState.domElements.categoryManagementForm = document.getElementById('categoryManagementForm');
        appState.domElements.categoryTypeSelect = document.getElementById('categoryType');
        appState.domElements.categoryNameInput = document.getElementById('categoryName');
        appState.domElements.subcategoryNameInput = document.getElementById('subcategoryName');
        appState.domElements.saveCategoryBtn = document.getElementById('saveCategoryBtn');
        appState.domElements.categoryManagementBody = document.getElementById('categoryManagementBody');
        appState.domElements.clearCategoryFormBtn = document.getElementById('clearCategoryFormBtn');
        appState.domElements.exportAllDataBtn = document.getElementById('exportAllDataBtn');
        appState.domElements.importDataBtn = document.getElementById('importDataBtn');
        appState.domElements.clearAllDataBtn = document.getElementById('clearAllDataBtn');
        appState.domElements.systemStats = document.getElementById('systemStats');

        // Modais
        appState.domElements.editMeioModal = document.getElementById('editMeioModal');
        appState.domElements.modalMeioSelect = document.getElementById('modalMeio');
        appState.domElements.closeEditMeioModalBtn = document.getElementById('closeEditMeioModalBtn');
        appState.domElements.cancelEditMeioBtn = document.getElementById('cancelEditMeioModalBtn');
        appState.domElements.applyEditMeioBtn = document.getElementById('applyEditMeioBtn');
        appState.domElements.transactionDetailsModal = document.getElementById('transactionDetailsModal');
        appState.domElements.transactionDetailsTitle = document.getElementById('transactionDetailsTitle');
        appState.domElements.transactionDetailsBody = document.getElementById('transactionDetailsBody');
        appState.domElements.closeTransactionDetailsModalBtn = document.getElementById('closeTransactionDetailsModalBtn');
        appState.domElements.confirmationModal = document.getElementById('confirmationModal');
        appState.domElements.confirmationModalTitle = document.getElementById('confirmationModalTitle');
        appState.domElements.confirmationModalMessage = document.getElementById('confirmationModalMessage');
        appState.domElements.closeConfirmationModalBtn = document.getElementById('closeConfirmationModalBtn');
        appState.domElements.cancelConfirmationBtn = document.getElementById('cancelConfirmationBtn');
        appState.domElements.confirmActionBtn = document.getElementById('confirmActionBtn');
        appState.domElements.importReviewModal = document.getElementById('importReviewModal');
        appState.domElements.closeReviewModalBtn = document.getElementById('closeReviewModalBtn');
        appState.domElements.reviewTableBody = document.getElementById('reviewTableBody');
        appState.domElements.confirmImportBtn = document.getElementById('confirmImportBtn');
        appState.domElements.cancelReviewBtn = document.getElementById('cancelReviewBtn');
        appState.domElements.reviewCountSpan = document.getElementById('reviewCount');
        appState.domElements.reviewMasterCheckbox = document.getElementById('reviewMasterCheckbox');
        appState.domElements.reviewBulkTipoSelect = document.getElementById('reviewBulkTipo');
        appState.domElements.reviewBulkMeioSelect = document.getElementById('reviewBulkMeio');
        appState.domElements.applyBulkReviewBtn = document.getElementById('applyBulkReviewBtn');

        console.log('Elementos DOM cacheados com sucesso.');
    } catch (error) {
        console.error(`Erro ao cachear elementos DOM: ${error.message}`, error);
        showAlert('Erro interno: Falha ao carregar elementos da interface. Verifique o console para detalhes.', CONSTANTS.ALERT_TYPE_ERROR);
    }
}

// ==================== CONFIGURAÇÃO DE LISTENERS DE EVENTOS ====================
/**
 * Configura todos os ouvintes de evento da interface do usuário.
 */
function setupEventListeners() {
    console.log('Configurando event listeners...');
    try {
        setupNavigationListeners();
        setupTransactionFormListeners();
        setupImportListeners();
        setupTransactionsTableListeners();
        setupReportListeners();
        setupCategoryManagementListeners();
        setupModalListeners();
        setupGlobalSettingsListeners();

        // Specific listeners for Import Review Modal
        if (appState.domElements.closeReviewModalBtn) appState.domElements.closeReviewModalBtn.addEventListener('click', cancelImportReview);
        if (appState.domElements.cancelReviewBtn) appState.domElements.cancelReviewBtn.addEventListener('click', cancelImportReview);
        if (appState.domElements.confirmImportBtn) appState.domElements.confirmImportBtn.addEventListener('click', confirmImportFromReviewModal);
        if (appState.domElements.reviewMasterCheckbox) appState.domElements.reviewMasterCheckbox.addEventListener('change', toggleAllReviewCheckboxes);
        if (appState.domElements.applyBulkReviewBtn) appState.domElements.applyBulkReviewBtn.addEventListener('click', applyBulkReviewChanges);

        // Event delegation for review table inputs
        if (appState.domElements.reviewTableBody) {
            appState.domElements.reviewTableBody.addEventListener('input', handleReviewTableChange);
            appState.domElements.reviewTableBody.addEventListener('change', handleReviewTableChange);
            appState.domElements.reviewTableBody.addEventListener('blur', handleReviewTableBlur, true); // Use capture phase for blur
            appState.domElements.reviewTableBody.addEventListener('click', handleReviewTableClick);
        }

        console.log('Event listeners configurados com sucesso!');
    } catch (error) {
        console.error(`Erro ao configurar event listeners: ${error.message}`, error);
        showAlert('Erro ao configurar eventos: ' + error.message, CONSTANTS.ALERT_TYPE_ERROR);
    }
}

/**
 * Configura listeners para a navegação por abas.
 */
function setupNavigationListeners() {
    const navTabsContainer = document.querySelector('.nav-tabs');
    if (navTabsContainer) {
        navTabsContainer.addEventListener('click', function(e) {
            const clickedTab = e.target.closest('.nav-tab');
            if (clickedTab) {
                e.preventDefault();
                const targetTab = clickedTab.getAttribute('data-tab');
                showTab(targetTab);
            }
        });
    } else {
        console.warn("Elemento '.nav-tabs' não encontrado. Navegação por abas não funcionará.");
    }
}

/**
 * Limpa o formulário de transação, resetando valores e estados.
 */
function clearForm() {
    try {
        const form = appState.domElements.transactionForm;
        const { dataInput, valorInput } = appState.domElements;

        if (form) {
            form.reset();
            if (dataInput) dataInput.value = new Date().toISOString().split('T')[0];
            if (valorInput) valorInput.value = '';

            if (appState.domElements.subcategoriaSelect) appState.domElements.subcategoriaSelect.value = '';
            if (appState.domElements.outraSubcategoriaInput) appState.domElements.outraSubcategoriaInput.value = '';
            if (appState.domElements.tipoSelect) appState.domElements.tipoSelect.value = '';
            if (appState.domElements.categoriaSelect) appState.domElements.categoriaSelect.value = '';
            if (appState.domElements.outraCategoriaInput) appState.domElements.outraCategoriaInput.value = '';
            if (appState.domElements.descricaoInput) appState.domElements.descricaoInput.value = '';


            populateInitialSubcategories();
            updateCategories();

            appState.editingTransactionId = null;
            clearAllValidationErrors();
            updateFormVisibility(); // Re-evaluate visibility after clearing

            console.log('Formulário de transação limpo');
        }
    } catch (error) {
        console.error(`Erro ao limpar formulário: ${error.message}`, error);
    }
}

/**
 * Configura listeners para o formulário de transações.
 */
function setupTransactionFormListeners() {
    const { dataInput, tipoSelect, categoriaSelect, outraCategoriaInput, outraSubcategoriaInput,
        descricaoInput, meioSelect, transactionForm, clearFormBtn, valorInput,
        subcategoriaSelect
    } = appState.domElements;

    if (transactionForm) {
        transactionForm.addEventListener('submit', handleTransactionSubmit);

        if (valorInput) {
            valorInput.addEventListener('blur', (e) => {
                const numericValue = parseBrazilianCurrencyStringToFloat(e.target.value);
                e.target.value = formatFloatToBrazilianCurrencyString(numericValue);
                clearValidationError(valorInput);
            });

            valorInput.addEventListener('input', (e) => {
                let value = e.target.value;
                // Allow only numbers, comma, and dot
                value = value.replace(/[^\d,.]/g, ''); // CORRIGIDO PARA \d
                // Prevent leading zero if not followed by a decimal separator
                if (value.length > 1 && value[0] === '0' && value[1] !== ',' && value[1] !== '.') {
                    value = value.substring(1);
                }
                e.target.value = value;
            });
        }

        if (subcategoriaSelect) subcategoriaSelect.addEventListener('change', inferTransactionDetails);
        if (outraSubcategoriaInput) outraSubcategoriaInput.addEventListener('input', debounceInferTransactionDetails);
        if (tipoSelect) tipoSelect.addEventListener('change', updateFormVisibility);
        if (categoriaSelect) {
            categoriaSelect.addEventListener('change', () => {
                updateSubcategories();
                updateFormVisibility();
            });
        }
        if (outraCategoriaInput) outraCategoriaInput.addEventListener('input', updateFormVisibility);

        const validationElements = [
            dataInput, tipoSelect, categoriaSelect, outraCategoriaInput, outraSubcategoriaInput,
            meioSelect, descricaoInput, valorInput,
            subcategoriaSelect
        ];
        validationElements.forEach(element => {
            if (element) {
                element.addEventListener('input', () => clearValidationError(element));
                element.addEventListener('change', () => clearValidationError(element));
            }
        });
    }

    if (clearFormBtn) clearFormBtn.addEventListener('click', clearForm);
}

/**
 * Configura listeners para a área de importação de arquivos.
 */
function setupImportListeners() {
    const { fileInput, importArea, undoImportBtn, documentTypeSelect } = appState.domElements;

    if (fileInput) fileInput.addEventListener('change', handleFileSelect);
    if (importArea) {
        importArea.addEventListener('click', () => fileInput.click());
        importArea.addEventListener('dragover', handleDragOver);
        importArea.addEventListener('drop', handleFileDrop);
        importArea.addEventListener('dragleave', handleDragLeave);
    }
    if (undoImportBtn) undoImportBtn.addEventListener('click', undoLastImport);
    if (documentTypeSelect) {
        documentTypeSelect.addEventListener('change', () => clearValidationError(documentTypeSelect));
    }
}

/**
 * Configura listeners para a tabela de transações e filtros.
 */
function setupTransactionsTableListeners() {
    const { applyFiltersBtn, clearFiltersBtn, searchBoxInput, sortDateBtn,
        masterCheckbox, selectAllBtn, deleteSelectedBtn, editSelectedMeioBtn } = appState.domElements;

    if (applyFiltersBtn) applyFiltersBtn.addEventListener('click', applyFilters);
    if (clearFiltersBtn) clearFiltersBtn.addEventListener('click', clearFilters);
    if (searchBoxInput) {
        searchBoxInput.addEventListener('keyup', () => {
            clearTimeout(appState.searchTimeout);
            appState.searchTimeout = setTimeout(searchTransactions, 300);
        });
    }
    if (sortDateBtn) sortDateBtn.addEventListener('click', toggleSortOrder);
    if (masterCheckbox) masterCheckbox.addEventListener('change', toggleAllCheckboxes);
    if (selectAllBtn) {
        selectAllBtn.addEventListener('click', () => {
            if (masterCheckbox) {
                masterCheckbox.checked = !masterCheckbox.checked;
                masterCheckbox.dispatchEvent(new Event('change'));
            }
        });
    }
    if (deleteSelectedBtn) deleteSelectedBtn.addEventListener('click', deleteSelectedTransactions);
    if (editSelectedMeioBtn) editSelectedMeioBtn.addEventListener('click', openEditMeioModal); // Changed to call openEditMeioModal directly
}

/**
 * Configura listeners para os relatórios.
 */
function setupReportListeners() {
    const { generateReportsBtn, exportExcelReportBtn, exportPdfReportBtn, reportChartSelect, chartTypeDespesasSelect } = appState.domElements;
    if (generateReportsBtn) generateReportsBtn.addEventListener('click', generateReports);
    if (exportExcelReportBtn) exportExcelReportBtn.addEventListener('click', exportReportToExcel);
    if (exportPdfReportBtn) exportPdfReportBtn.addEventListener('click', exportReportToPdf);
    if (reportChartSelect) reportChartSelect.addEventListener('change', generateReports);
    if (appState.domElements.reportCategoriaFilter) { // ADICIONADO: Listener para o novo filtro
        appState.domElements.reportCategoriaFilter.addEventListener('change', generateReports);
    }
    if (chartTypeDespesasSelect) chartTypeDespesasSelect.addEventListener('change', generateReports);

    // ADICIONADO: Listener para o novo select de evolução por categoria
    if (appState.domElements.evolucaoCategoriaSelect) {
        appState.domElements.evolucaoCategoriaSelect.addEventListener('change', generateReports);
    }

    // ADICIONAR ESTE EVENT LISTENER PARA O CAMPO DE PESQUISA DA TABELA DE RELATÓRIOS
    if (appState.domElements.reportSearchInput) {
        appState.domElements.reportSearchInput.addEventListener('keyup', () => {
            clearTimeout(appState.searchTimeout); // Reutiliza o searchTimeout existente para debouncing
            appState.searchTimeout = setTimeout(() => {
                // Re-popula a tabela, usando a lista completa de transações que está cacheada no appState
                // e permitindo que updateReportTransactionsTable aplique o termo de busca.
                updateReportTransactionsTable(); // Chama sem argumentos para usar a lista cacheada
            }, 300);
        });
    }
}

/**
 * Configura listeners para as configurações globais do sistema.
 */
function setupGlobalSettingsListeners() {
    const { exportAllDataBtn, importDataBtn, clearAllDataBtn } = appState.domElements;
    if (exportAllDataBtn) exportAllDataBtn.addEventListener('click', exportData);
    if (importDataBtn) importDataBtn.addEventListener('click', importData);
    if (clearAllDataBtn) clearAllDataBtn.addEventListener('click', clearAllData);
}

/**
 * Configura listeners para o gerenciamento de categorias.
 */
function setupCategoryManagementListeners() {
    const { categoryManagementForm, clearCategoryFormBtn } = appState.domElements;
    if (categoryManagementForm) {
        categoryManagementForm.addEventListener('submit', handleCategoryManagementSubmit);
        const validationElements = [
            appState.domElements.categoryTypeSelect,
            appState.domElements.categoryNameInput,
            appState.domElements.subcategoryNameInput
        ];
        validationElements.forEach(el => {
            if (el) el.addEventListener('input', () => clearValidationError(el));
        });
    }
    if (clearCategoryFormBtn) clearCategoryFormBtn.addEventListener('click', clearCategoryForm);
}

/**
 * Configura listeners para modais genéricos.
 */
function setupModalListeners() {
    const { closeTransactionDetailsModalBtn, closeEditMeioModalBtn, cancelEditMeioBtn, applyEditMeioBtn,
        closeConfirmationModalBtn, cancelConfirmationBtn
    } = appState.domElements;

    if (closeTransactionDetailsModalBtn) closeTransactionDetailsModalBtn.addEventListener('click', () => closeModal('transactionDetailsModal'));
    if (closeEditMeioModalBtn) closeEditMeioModalBtn.addEventListener('click', () => closeModal('editMeioModal'));
    if (cancelEditMeioBtn) cancelEditMeioBtn.addEventListener('click', () => closeModal('editMeioModal'));
    if (applyEditMeioBtn) applyEditMeioBtn.addEventListener('click', applyBulkMeioChange);
    if (closeConfirmationModalBtn) closeConfirmationModalBtn.addEventListener('click', () => closeModal('confirmationModal', false));
    if (cancelConfirmationBtn) cancelConfirmationBtn.addEventListener('click', () => closeModal('confirmationModal', false));
}

// ==================== NAVEGAÇÃO POR ABAS ====================
/**
 * Alterna a exibição das abas da interface e carrega dados específicos de cada aba.
 * @param {string} tabName - O ID da aba a ser exibida.
 */
async function showTab(tabName) {
    console.log(`showTab: Iniciando transição para ${tabName}`);
    try {
        // 1. Encontra a aba e o botão de destino PRIMEIRO
        const targetTab = document.getElementById(tabName);
        const targetButton = document.querySelector(`.nav-tab[data-tab="${tabName}"]`);

        // 2. Verifica se a aba de destino realmente existe
        if (!targetTab) {
            console.error(`Aba com ID "${tabName}" não encontrada.`);
            showAlert(`Erro: A aba "${tabName}" não foi encontrada.`, 'error');
            return; // Interrompe a função se a aba não existir
        }

        // 3. Oculta todas as outras abas
        document.querySelectorAll('.tab-content').forEach(section => {
            section.classList.remove('active');
        });

        // 4. Remove a classe 'active' de todos os botões
        document.querySelectorAll('.nav-tab').forEach(button => {
            button.classList.remove('active');
        });

        // 5. Mostra a aba de destino e ativa o botão correspondente
        targetTab.classList.add('active');
        if (targetButton) {
            targetButton.classList.add('active');
        }

        // 6. Carrega os dados específicos da aba, se necessário
        if (tabName === 'panel-relatorios') {
            await populateReportFilterCategories();
            await generateReports();
        } else if (tabName === 'panel-transacoes') {
            await loadTransactions();
        } else if (tabName === 'panel-configuracoes') {
            await populateCategoryManagementTable();
            await updateSystemStats();
        }

        console.log(`showTab: Transição para ${tabName} concluída.`);

    } catch (error) {
        console.error(`Erro inesperado durante transição para ${tabName}: ${error.message}`, error);
        showAlert(`Ocorreu um erro ao tentar abrir a aba.`, 'error');
    }
}

// ==================== GERENCIAMENTO DE CATEGORIAS PERSONALIZADAS ====================
/**
 * Atualiza as opções do select de categoria com base no tipo de transação selecionado.
 * @param {string} [elementId] - O ID do select a ser atualizado (se não for o principal).
 * @param {string} [transactionType] - O tipo de transação ('receita' ou 'despesa').
 * @param {string} [selectedCategory] - A categoria a ser pré-selecionada.
 */
function updateCategories(elementId, transactionType = null, selectedCategory = '') {
    try {
        const selectElement = elementId ? document.getElementById(elementId) : appState.domElements.categoriaSelect;
        const type = transactionType || (appState.domElements.tipoSelect ? appState.domElements.tipoSelect.value : '');
        if (!selectElement) {
            console.warn(`Elemento de categoria (${elementId || 'principal'}) não encontrado. Pulando atualização.`);
            return;
        }

        selectElement.innerHTML = '<option value="">Selecione a categoria</option>';
        if (type && appState.categoriesData[type]) {
            Object.keys(appState.categoriesData[type]).sort().forEach(categoria => {
                const option = document.createElement('option');
                option.value = categoria;
                option.textContent = categoria;
                selectElement.appendChild(option);
            });
        }
        // Attempt to set the selected category
        if (selectedCategory && selectElement.querySelector(`option[value="${selectedCategory}"]`)) {
            selectElement.value = selectedCategory;
        } else if (selectedCategory === CONSTANTS.UNCATEGORIZED) {
            selectElement.value = ''; // Don't pre-select 'Não categorizado' as it's a fallback
        } else {
            selectElement.value = ''; // Clear selection if no valid category to select
        }
    } catch (error) {
        console.error(`Erro ao atualizar categorias: ${error.message}`, error);
        showAlert('Erro ao carregar categorias: ' + error.message, CONSTANTS.ALERT_TYPE_ERROR);
    }
}

/**
 * Popula o select de subcategorias com todas as opções únicas.
 * Esta função agora tenta popular com subcategorias específicas da categoria selecionada,
 * e também inclui todas as subcategorias únicas conhecidas para o preenchimento inicial.
 * @param {string} [elementId] - O ID do select a ser atualizado.
 * @param {string} [transactionType] - O tipo de transação para filtrar subcategorias.
 * @param {string} [category] - A categoria para filtrar subcategorias.
 * @param {string} [selectedSubcategory] - A subcategoria a ser pré-selecionada.
 */
function populateInitialSubcategories(elementId, transactionType = null, category = null, selectedSubcategory = '') {
    try {
        const selectElement = elementId ? document.getElementById(elementId) : appState.domElements.subcategoriaSelect;
        if (!selectElement) return;

        selectElement.innerHTML = '<option value="">Selecione a subcategoria</option>';

        const allUniqueSubcategories = new Set();
        // Add subcategories from CATEGORY_KEYWORDS (predefined rules)
        CATEGORY_KEYWORDS.forEach(rule => {
            if (rule.subcategory && rule.subcategory.trim() !== '') {
                allUniqueSubcategories.add(rule.subcategory);
            }
        });

        // Add subcategories from appState.categoriesData (user-defined)
        // If specific type and category provided, only add those
        if (transactionType && category && appState.categoriesData[transactionType] && appState.categoriesData[transactionType][category]) {
            appState.categoriesData[transactionType][category].forEach(sub => {
                allUniqueSubcategories.add(sub);
            });
        } else { // Otherwise, add all from user-defined categories
            for (const tipo in appState.categoriesData) {
                for (const cat in appState.categoriesData[tipo]) {
                    if (appState.categoriesData[tipo][cat]) {
                        appState.categoriesData[tipo][cat].forEach(sub => {
                            allUniqueSubcategories.add(sub);
                        });
                    }
                }
            }
        }

        Array.from(allUniqueSubcategories).sort((a, b) => a.localeCompare(b)).forEach(sub => {
            const option = document.createElement('option');
            option.value = sub;
            option.textContent = sub;
            selectElement.appendChild(option);
        });

        if (selectedSubcategory) {
            selectElement.value = selectedSubcategory;
        }
        console.log('Dropdown de subcategorias iniciais populado.');
    } catch (error) {
        console.error(`Erro em populateInitialSubcategories: ${error.message}`, error);
    }
}

/**
 * Atualiza as opções do select de subcategoria com base no tipo e categoria selecionados.
 * @param {string} [elementId] - O ID do select a ser atualizado.
 * @param {string} [transactionType] - O tipo de transação.
 * @param {string} [category] - A categoria selecionada.
 * @param {string} [selectedSubcategory] - A subcategoria a ser pré-selecionada.
 */
function updateSubcategories(elementId, transactionType = null, category = null, selectedSubcategory = '') {
    try {
        const selectElement = elementId ? document.getElementById(elementId) : appState.domElements.subcategoriaSelect;
        const type = transactionType || (appState.domElements.tipoSelect ? appState.domElements.tipoSelect.value : '');
        const cat = category || (appState.domElements.categoriaSelect ? appState.domElements.categoriaSelect.value : '');

        if (!selectElement) {
            console.warn(`Elemento de subcategoria (${elementId || 'principal'}) não encontrado. Pulando atualização.`);
            return;
        }

        selectElement.innerHTML = '<option value="">Selecione a subcategoria</option>';
        const subcategoriesToAdd = new Set();

        // Add subcategories from the selected category in appState.categoriesData
        if (type && cat && appState.categoriesData[type] && appState.categoriesData[type][cat]) {
            appState.categoriesData[type][cat].forEach(sub => subcategoriesToAdd.add(sub));
        }

        // Add relevant subcategories from CATEGORY_KEYWORDS based on type and category
        CATEGORY_KEYWORDS.forEach(rule => {
            if (rule.tipo === type && rule.category === cat && rule.subcategory) {
                subcategoriesToAdd.add(rule.subcategory);
            }
        });

        Array.from(subcategoriesToAdd).sort((a, b) => a.localeCompare(b)).forEach(subcategoria => {
            const option = document.createElement('option');
            option.value = subcategoria;
            option.textContent = subcategoria;
            selectElement.appendChild(option);
        });

        if (selectedSubcategory && selectElement.querySelector(`option[value="${selectedSubcategory}"]`)) {
            selectElement.value = selectedSubcategory;
        } else {
            selectElement.value = '';
        }
    } catch (error) {
        console.error(`Erro ao atualizar subcategories: ${error.message}`, error);
        showAlert('Erro ao carregar subcategorias: ' + error.message, CONSTANTS.ALERT_TYPE_ERROR);
    }
}

/**
 * Alterna a visibilidade dos campos "Ou Outra Categoria/Subcategoria".
 */
function toggleCustomCategoryFields() {
    try {
        const {
            categoriaSelect,
            outraCategoriaInput,
            categoriaGroup,
            outraCategoriaGroup,
            tipoSelect,
            subcategoriaSelect,
            outraSubcategoriaInput,
            subcategoriaGroup,
            outraSubcategoriaGroup
        } = appState.domElements;

        if (!categoriaSelect || !outraCategoriaInput || !categoriaGroup || !outraCategoriaGroup || !tipoSelect ||
            !subcategoriaSelect || !outraSubcategoriaInput || !subcategoriaGroup || !outraSubcategoriaGroup) {
            console.warn('Elementos de campos de categoria ou subcategoria não encontrados. Pulando toggle.');
            return;
        }

        const isTipoSelected = !!tipoSelect.value;
        const isOutraCategoriaFilled = outraCategoriaInput.value.trim() !== '';
        const isOutraSubcategoriaFilled = outraSubcategoriaInput.value.trim() !== '';

        // Handle Categoria fields
        if (isTipoSelected) {
            if (isOutraCategoriaFilled) {
                categoriaGroup.classList.add('hidden-field');
                categoriaSelect.value = '';
                categoriaSelect.removeAttribute('required');
                outraCategoriaInput.setAttribute('required', 'required');
                outraCategoriaGroup.classList.remove('hidden-field');
            } else {
                categoriaGroup.classList.remove('hidden-field');
                outraCategoriaInput.removeAttribute('required');
                outraCategoriaGroup.classList.add('hidden-field');
            }
        } else {
            categoriaGroup.classList.add('hidden-field');
            outraCategoriaGroup.classList.add('hidden-field');
            categoriaSelect.value = '';
            outraCategoriaInput.value = '';
            categoriaSelect.removeAttribute('required');
            outraCategoriaInput.removeAttribute('required');
        }

        // Handle Subcategoria fields (similar logic)
        if (isOutraSubcategoriaFilled) {
            subcategoriaGroup.classList.add('hidden-field');
            subcategoriaSelect.value = '';
            subcategoriaSelect.removeAttribute('required');
            outraSubcategoriaInput.setAttribute('required', 'required');
            outraSubcategoriaGroup.classList.remove('hidden-field');
        } else {
            subcategoriaGroup.classList.remove('hidden-field');
            outraSubcategoriaInput.removeAttribute('required');
            outraSubcategoriaGroup.classList.add('hidden-field');
        }

    } catch (error) {
        console.error(`Erro em toggleCustomCategoryFields: ${error.message}`, error);
    }
}


// ==================== FUNÇÕES DE PREENCHIMENTO AUTOMÁTICO E TOGGLE DE CAMPOS ====================
/**
 * Encontra uma regra de categoria com base em um texto e tipo de transação.
 * @param {string} textToSearch - O texto a ser pesquisado.
 * @param {'subcategory' | 'description'} searchContext - O contexto da busca (se é para subcategoria exata ou termos na descrição).
 * @param {string|null} transactionType - O tipo de transação (CONSTANTS.TRANSACTION_TYPE_INCOME ou CONSTANTS.TRANSACTION_TYPE_EXPENSE).
 * @returns {object|null} A regra encontrada (objeto com tipo, categoria, subcategoria) ou null se não houver correspondência.
 */
function findCategoryRule(textToSearch, searchContext = 'description', transactionType = null) {
    if (!textToSearch) return null;

    const lowerCaseText = String(textToSearch).toLowerCase();
    let bestMatch = null;
    let longestMatchLength = 0;

    // Filter rules by transaction type if provided
    const relevantRules = transactionType ?
        CATEGORY_KEYWORDS.filter(rule => rule.tipo === transactionType) :
        CATEGORY_KEYWORDS;

    // For subcategory context, look for exact match first
    if (searchContext === 'subcategory') {
        const exactMatch = relevantRules.find(rule =>
            rule.subcategory && rule.subcategory.toLowerCase() === lowerCaseText
        );
        if (exactMatch) return exactMatch;
    }

    // For description context or if no exact subcategory match, find longest term match
    for (const rule of relevantRules) {
        for (const term of rule.terms) {
            const lowerCaseTerm = term.toLowerCase();
            // Check if the description contains the term and if it's the longest match found so far
            if (lowerCaseText.includes(lowerCaseTerm) && lowerCaseTerm.length > longestMatchLength) {
                bestMatch = rule;
                longestMatchLength = lowerCaseTerm.length;
            }
        }
    }
    return bestMatch;
}

/**
 * Aplica a categorização automática a uma lista de transações.
 * Usado principalmente após a importação de arquivos para preencher automaticamente os campos.
 * @param {Array<object>} transactions - A lista de transações a serem categorizadas.
 */
function applyAutoCategorization(transactions) {
    transactions.forEach(t => {
        // Only try to categorize if category is not set or is 'Uncategorized'
        if (!t.categoria || t.categoria === CONSTANTS.UNCATEGORIZED || !t.subcategoria) {
            const rule = findCategoryRule(t.descricao, 'description', t.tipo);
            if (rule) {
                t.categoria = rule.category;
                t.subcategoria = rule.subcategory;
            } else if (!t.categoria) {
                t.categoria = CONSTANTS.UNCATEGORIZED; // Ensure a default if no rule applies
            }
        }
        // Always try to detect payment method
        t.meio = detectMeioPagamento('', t.descricao);

        // Mark for review if essential fields are still missing/default
        t.needsReview = (isNaN(new Date(t.data).getTime()) || t.categoria === CONSTANTS.UNCATEGORIZED || t.subcategoria === '' || t.meio === 'outros');
    });
}

/**
 * Infere e preenche Tipo e Categoria no formulário de cadastro com base na Subcategoria.
 */
function inferTransactionDetails() {
    console.log('Inferindo detalhes da transação...');
    try {
        const {
            tipoSelect,
            categoriaSelect,
            subcategoriaSelect,
            outraSubcategoriaInput,
            outraCategoriaInput
        } = appState.domElements;

        // Get the value from either predefined subcategory select or custom input
        const subcategoryValue = (outraSubcategoriaInput ? outraSubcategoriaInput.value.trim() : '') || (subcategoriaSelect ? subcategoriaSelect.value : '');

        if (!subcategoryValue) {
            // If no subcategory, clear related fields and reset form visibility
            if (tipoSelect) tipoSelect.value = '';
            if (categoriaSelect) categoriaSelect.value = '';
            if (outraCategoriaInput) outraCategoriaInput.value = '';
            updateCategories(); // Reset categories dropdown
            updateFormVisibility();
            return;
        }

        // Find a rule based on the subcategory value
        const foundRule = findCategoryRule(subcategoryValue, 'subcategory');

        if (foundRule) {
            // Apply inferred type
            if (tipoSelect) tipoSelect.value = foundRule.tipo;
            updateCategories(); // Update categories dropdown based on inferred type

            // Use requestAnimationFrame to ensure DOM updates are processed before setting category
            requestAnimationFrame(() => {
                // Try to set predefined category, if not found, use custom category input
                if (categoriaSelect && categoriaSelect.querySelector(`option[value="${foundRule.category}"]`)) {
                    categoriaSelect.value = foundRule.category;
                    if (outraCategoriaInput) outraCategoriaInput.value = ''; // Clear custom input
                } else if (outraCategoriaInput) {
                    if (categoriaSelect) categoriaSelect.value = ''; // Clear predefined select
                    outraCategoriaInput.value = foundRule.category; // Set custom category
                }

                // Ensure subcategory inputs are consistent
                if (subcategoriaSelect && subcategoriaSelect.value === subcategoryValue) {
                    if (outraSubcategoriaInput) outraSubcategoriaInput.value = '';
                } else if (outraSubcategoriaInput) {
                    if (subcategoriaSelect) subcategoriaSelect.value = '';
                    outraSubcategoriaInput.value = subcategoryValue;
                }
                showAlert('Tipo e Categoria preenchidos automaticamente.', CONSTANTS.ALERT_TYPE_INFO);
                updateFormVisibility(); // Re-evaluate form step visibility
                toggleCustomCategoryFields(); // Re-evaluate custom category/subcategory field visibility
            });
        } else {
            // If no rule found, clear type/category and prompt user
            if (tipoSelect) tipoSelect.value = '';
            if (categoriaSelect) categoriaSelect.value = '';
            if (outraCategoriaInput) outraCategoriaInput.value = '';
            updateCategories(); // Reset categories dropdown

            // If a predefined subcategory was selected but no rule, clear it
            if (subcategoriaSelect && !(outraSubcategoriaInput && outraSubcategoriaInput.value.trim())) {
                subcategoriaSelect.value = '';
            }
            showAlert('Subcategoria não reconhecida. Por favor, preencha Tipo e Categoria.', CONSTANTS.ALERT_TYPE_INFO);
            updateFormVisibility();
            toggleCustomCategoryFields();
        }
    } catch (error) {
        console.error(`Erro em inferTransactionDetails: ${error.message}`, error);
    }
}

let inferDetailsTimeout = null;

function debounceInferTransactionDetails() {
    clearTimeout(inferDetailsTimeout);
    inferDetailsTimeout = setTimeout(inferTransactionDetails, 300);
}

/**
 * Gerencia a visibilidade das etapas do formulário de cadastro.
 * Campos são revelados sequencialmente conforme os anteriores são preenchidos.
 */
function updateFormVisibility() {
    try {
        const {
            subcategoriaSelect,
            outraSubcategoriaInput,
            tipoSelect,
            categoriaSelect,
            outraCategoriaInput,
            valorInput,
            meioSelect,
            dataInput,
            descricaoInput,
            step1SubcategoryFields,
            step2TypeCategoryFields,
            step3EssentialFields,
            step4OptionalFields
        } = appState.domElements;

        // Step 1: Subcategory input (always visible initially)
        // No direct `hidden-field` toggle for step1 itself, as it's the starting point.

        const hasSubcategoryInput = (subcategoriaSelect ? subcategoriaSelect.value : '') || (outraSubcategoriaInput ? outraSubcategoriaInput.value.trim() : '');
        // Step 2: Type and Category fields (reveal if subcategory is provided)
        if (step2TypeCategoryFields) {
            step2TypeCategoryFields.classList.toggle('hidden-field', !hasSubcategoryInput);
        }
        // Set 'required' attribute dynamically
        if (tipoSelect) tipoSelect.required = hasSubcategoryInput;
        // Category required if subcategory and type are set, and it's not a custom category
        const isTipoSelected = tipoSelect ? !!tipoSelect.value : false;
        if (categoriaSelect) categoriaSelect.required = hasSubcategoryInput && isTipoSelected && !(outraCategoriaInput ? outraCategoriaInput.value.trim() : '');
        if (outraCategoriaInput) outraCategoriaInput.required = hasSubcategoryInput && isTipoSelected && !(categoriaSelect ? categoriaSelect.value : '');
        const hasTypeAndCategoryInput = isTipoSelected && ((categoriaSelect ? categoriaSelect.value : '') || (outraCategoriaInput ? outraCategoriaInput.value.trim() : ''));
        // Step 3: Essential fields (reveal if subcategory, type, and category are provided)
        if (step3EssentialFields) {
            step3EssentialFields.classList.toggle('hidden-field', !(hasSubcategoryInput && hasTypeAndCategoryInput));
        }
        if (valorInput) valorInput.required = (hasSubcategoryInput && hasTypeAndCategoryInput);
        if (meioSelect) meioSelect.required = (hasSubcategoryInput && hasTypeAndCategoryInput);
        if (dataInput) dataInput.required = (hasSubcategoryInput && hasTypeAndCategoryInput);

        // Step 4: Optional fields (reveal if essential fields are provided)
        if (step4OptionalFields) {
            step4OptionalFields.classList.toggle('hidden-field', !(hasSubcategoryInput && hasTypeAndCategoryInput && valorInput.value && meioSelect.value && dataInput.value));
        }

        // Always ensure custom category/subcategory fields are handled correctly
        toggleCustomCategoryFields();
    } catch (error) {
        console.error(`Erro em updateFormVisibility: ${error.message}`, error);
    }
}

// ==================== FORMULÁRIO DE TRANSAÇÃO (CADASTRO) ====================
/**
 * Coleta os dados do formulário de transação.
 * @param {HTMLFormElement} formElements - Os elementos do formulário.
 * @returns {object} Um objeto com os dados da transação.
 */
function getTransactionDataFromForm(formElements) {
    return {
        dataTransacao: formElements.data.value,
        tipo: formElements.tipo.value,
        categoriaFinal: formElements.outraCategoria.value.trim() || formElements.categoria.value,
        subcategoriaFinal: formElements.outraSubcategoria.value.trim() || formElements.subcategoria.value || '',
        valorOriginal: parseBrazilianCurrencyStringToFloat(formElements.valor.value),
        meio: formElements.meio.value,
        descricaoOriginal: formElements.descricao.value || '',
    };
}

/**
 * Atualiza a estrutura de categorias se uma nova for usada.
 * @param {string} tipo - Tipo da transação.
 * @param {string} categoriaFinal - Nome da categoria.
 * @param {string} subcategoriaFinal - Nome da subcategoria.
 */
async function updateCategoriesIfNeeded(tipo, categoriaFinal, subcategoriaFinal) {
    let categoriesDataChanged = false;
    try {
        if (categoriaFinal) {
            if (!appState.categoriesData[tipo]) {
                appState.categoriesData[tipo] = {};
                categoriesDataChanged = true;
            }
            if (!appState.categoriesData[tipo][categoriaFinal]) {
                appState.categoriesData[tipo][categoriaFinal] = [];
                categoriesDataChanged = true;
            }
        }
        if (categoriaFinal && subcategoriaFinal && appState.categoriesData[tipo] && appState.categoriesData[tipo][categoriaFinal] && !appState.categoriesData[tipo][categoriaFinal].includes(subcategoriaFinal)) {
            appState.categoriesData[tipo][categoriaFinal].push(subcategoriaFinal);
            appState.categoriesData[tipo][categoriaFinal].sort();
            categoriesDataChanged = true;
        }
        if (categoriesDataChanged) {
            await db.appSettings.update('generalSettings', { categoriesData: appState.categoriesData });
        }
    } catch (error) {
        console.error(`Erro em updateCategoriesIfNeeded: ${error.message}`, error);
    }
}


// SUBSTITUA AS 3 FUNÇÕES ANTIGAS (buildTransactionsArray, _buildTransactionsArrayInternal e handleTransactionSubmit) POR ESTAS 2 NOVAS

/**
 * Constrói uma única transação a partir dos dados do formulário.
 * @param {object} formData - Dados do formulário.
 * @param {number|null} originalTransactionId - ID da transação original sendo editada.
 * @returns {object} Um objeto de transação pronto para ser salvo.
 */
function buildSingleTransaction(formData, originalTransactionId) {
    const {
        dataTransacao,
        tipo,
        categoriaFinal,
        subcategoriaFinal,
        valorOriginal,
        meio,
        descricaoOriginal
    } = formData;

    return {
        id: originalTransactionId || generateUniqueId(),
        data: dataTransacao,
        tipo: tipo,
        categoria: categoriaFinal,
        subcategoria: subcategoriaFinal,
        valor: Math.abs(valorOriginal),
        meio: meio,
        descricao: descricaoOriginal,
        dataCreated: new Date().toISOString(),
        isInstallment: false, // Sempre falso
        installmentInfo: null,
        groupId: null,
        isRecurring: false, // Sempre falso
        recurringFrequency: null,
        nextOccurrenceDate: null,
        parentRecurringId: null
    };
}

/**
 * Lida com o envio do formulário de transação (versão simplificada).
 * @param {Event} event - O evento de submit.
 */
async function handleTransactionSubmit(event) {
    event.preventDefault();
    const formElements = event.target.elements;
    const errors = validateForm(formElements);

    if (Object.keys(errors).length > 0) {
        displayValidationErrors(errors);
        showAlert('Por favor, corrija os erros no formulário.', CONSTANTS.ALERT_TYPE_ERROR);
        return;
    }

    clearAllValidationErrors();

    // No formulário simplificado, o getTransactionDataFromForm pode ser simplificado também.
    // Por agora, vamos assumir que ele ainda funciona para pegar os dados básicos.
    const formData = getTransactionDataFromForm(formElements);

    try {
        await updateCategoriesIfNeeded(formData.tipo, formData.categoriaFinal, formData.subcategoriaFinal);

        const transactionToSave = buildSingleTransaction(formData, appState.editingTransactionId);
        await db.transactions.put(transactionToSave); // .put() funciona tanto para adicionar quanto para atualizar.

        const successMessage = appState.editingTransactionId ? 'Transação atualizada com sucesso!' : 'Transação salva com sucesso!';
        showAlert(successMessage, CONSTANTS.ALERT_TYPE_SUCCESS);

        // Offer to save new category/subcategory rule if a custom one was used
        const outraSubcategoriaUsada = formElements.outraSubcategoria.value.trim();
        if (outraSubcategoriaUsada) {
            const tipoDaTransacao = formData.tipo;
            const categoriaDaTransacao = formData.categoriaFinal;
            // Check if this specific subcategory is NOT already associated with this category/type in user settings
            const isRuleNew = !appState.categoriesData[tipoDaTransacao] ||
                !appState.categoriesData[tipoDaTransacao][categoriaDaTransacao] ||
                !appState.categoriesData[tipoDaTransacao][categoriaDaTransacao].includes(outraSubcategoriaUsada);
            if (isRuleNew) {
                // Delay prompt slightly to let save alert show first
                setTimeout(() => {
                    promptToSaveNewRule(tipoDaTransacao, categoriaDaTransacao, outraSubcategoriaUsada);
                }, 1000);
            }
        }

        appState.editingTransactionId = null;
        clearForm();
    } catch (error) {
        console.error(`Erro ao salvar transação: ${error.message}`, error);
        showAlert('Erro ao salvar transação: ' + error.message, CONSTANTS.ALERT_TYPE_ERROR);
    }
}

/**
 * Valida os campos do formulário de transação.
 * @param {HTMLFormElement} elements - Os elementos do formulário.
 * @returns {object} Um objeto com os erros de validação.
 */
function validateForm(elements) {
    const errors = {};
    const {
        dataInput,
        tipoSelect,
        categoriaSelect,
        outraCategoriaInput,
        valorInput,
        meioSelect,
        descricaoInput,
        subcategoriaSelect,
        outraSubcategoriaInput
    } = appState.domElements;

    // Subcategory validation
    const subcategoriaPredefinida = elements.subcategoria?.value;
    const outraSubcategoria = elements.outraSubcategoria?.value.trim();
    if (!subcategoriaPredefinida && !outraSubcategoria) {
        errors.subcategoria = 'Selecione uma subcategoria ou digite uma nova.';
        if (subcategoriaSelect) subcategoriaSelect.classList.add('is-invalid');
        if (outraSubcategoriaInput) outraSubcategoriaInput.classList.add('is-invalid');

    } else if (subcategoriaPredefinida && outraSubcategoria) {

        errors.subcategoria = 'Selecione apenas uma opção para subcategoria.'; // Assign to both for clear feedback
        errors.outraSubcategoria = 'Selecione apenas uma opção para subcategoria.';
        if (subcategoriaSelect) subcategoriaSelect.classList.add('is-invalid');
        if (outraSubcategoriaInput) outraSubcategoriaInput.classList.add('is-invalid');

    } else if (outraSubcategoria && outraSubcategoria.length > 50) {
        errors.outraSubcategoria = 'Subcategoria personalizada muito longa (máx. 50 caracteres).';
        if (outraSubcategoriaInput) outraSubcategoriaInput.classList.add('is-invalid');
    }

    // Type validation
    if (tipoSelect && tipoSelect.required && !tipoSelect.value) {
        errors.tipo = 'Tipo de transação é obrigatório.';
        if (tipoSelect) tipoSelect.classList.add('is-invalid');
    }

    // Category validation (similar to subcategory)
    if (categoriaSelect && categoriaSelect.required || outraCategoriaInput && outraCategoriaInput.required) {
        const categoriaPredefinida = elements.categoria?.value;
        const outraCategoria = elements.outraCategoria?.value.trim();
        if (!categoriaPredefinida && !outraCategoria) {
            errors.categoria = 'Selecione uma categoria ou digite uma nova.';
            if (categoriaSelect) categoriaSelect.classList.add('is-invalid');
            if (outraCategoriaInput) outraCategoriaInput.classList.add('is-invalid');
        } else if (categoriaPredefinida && outraCategoria) {
            errors.categoria = 'Selecione apenas uma opção para categoria.';
            errors.outraCategoria = 'Selecione apenas uma opção para categoria.';
            if (categoriaSelect) categoriaSelect.classList.add('is-invalid');
            if (outraCategoriaInput) outraCategoriaInput.classList.add('is-invalid');
        } else if (outraCategoria && outraCategoria.length > 50) {
            errors.outraCategoria = 'Categoria personalizada muito longa (máx. 50 caracteres).';
            if (outraCategoriaInput) outraCategoriaInput.classList.add('is-invalid');
        }
    }

    // Value validation
    if (valorInput && valorInput.required) {
        const valor = parseBrazilianCurrencyStringToFloat(elements.valor?.value);
        if (isNaN(valor) || valor <= 0) {
            errors.valor = 'Valor deve ser um número maior que zero.';
            if (valorInput) valorInput.classList.add('is-invalid');
        }
    }

    // Meio validation
    if (meioSelect && meioSelect.required && !meioSelect.value) {
        errors.meio = 'Meio de transação é obrigatório.';
        if (meioSelect) meioSelect.classList.add('is-invalid');
    }

    // Date validation
    if (dataInput && dataInput.required && !dataInput.value) {
        errors.data = 'Data é obrigatória.';
        if (dataInput) dataInput.classList.add('is-invalid');
    }

    // Description length validation
    if (elements.descricao?.value && elements.descricao.value.length > 255) {
        errors.descricao = 'Descrição não pode ter mais que 255 caracteres.';
        if (descricaoInput) descricaoInput.classList.add('is-invalid');
    }
    return errors;
}

/**
 * Exibe mensagens de erro de validação nos campos do formulário.
 * @param {object} errors - Objeto contendo os erros de validação.
 */
function displayValidationErrors(errors) {
    clearAllValidationErrors();
    for (const fieldId in errors) {
        const inputElement = document.getElementById(fieldId);
        const errorMessageElement = document.getElementById(`${fieldId}-error`);

        if (inputElement) {
            inputElement.classList.add('is-invalid');
            inputElement.setAttribute('aria-describedby', `${fieldId}-error`);
            inputElement.setAttribute('aria-invalid', 'true');
        }
        if (errorMessageElement) {
            errorMessageElement.textContent = errors[fieldId];
            errorMessageElement.style.display = 'block';
            errorMessageElement.setAttribute('aria-live', 'assertive');
        }
    }
}

/**
 * Limpa a mensagem de erro de um campo específico.
 * @param {HTMLElement} element - O elemento HTML a ter a validação limpa.
 */
function clearValidationError(element) {
    if (element) {
        element.classList.remove('is-invalid');
        element.removeAttribute('aria-invalid');
        element.removeAttribute('aria-describedby');

        const errorMessageElement = document.getElementById(`${element.id}-error`);
        if (errorMessageElement) {
            errorMessageElement.textContent = '';
            errorMessageElement.style.display = 'none';
            errorMessageElement.removeAttribute('aria-live');
        }
    }
}

/**
 * Limpa todas as mensagens de erro de validação do formulário.
 */
function clearAllValidationErrors() {
    document.querySelectorAll('.is-invalid').forEach(el => {
        el.classList.remove('is-invalid');
        el.removeAttribute('aria-invalid');
        el.removeAttribute('aria-describedby');
    });
    document.querySelectorAll('.error-message').forEach(el => {
        el.textContent = '';
        el.style.display = 'none';
        el.removeAttribute('aria-live');
    });
}

/**
 * Converte uma string no formato monetário brasileiro (ex: "1.234,56") para um número float.
 * Trata vírgulas como separadores decimais e pontos como separadores de milhares.
 * @param {string} valueStr A string do valor a ser convertido.
 * @returns {number} O valor numérico (float) ou NaN se a string não for um número válido.
 */
function parseBrazilianCurrencyStringToFloat(valueStr) {
    if (typeof valueStr !== 'string') {
        valueStr = String(valueStr || '');
    }
    // Remove tudo que não for dígito, vírgula, ponto ou sinal de menos
    let cleaned = valueStr.replace(/[^\d,.-]/g, '').trim(); // CORRIGIDO PARA \d

    // Se existirem tanto ponto quanto vírgula, decide qual é o decimal pela última ocorrência
    const hasComma = cleaned.includes(',');
    const hasDot = cleaned.includes('.');

    if (hasComma && hasDot) {
        if (cleaned.lastIndexOf(',') > cleaned.lastIndexOf('.')) {
            // A vírgula é o decimal, então removemos os pontos de milhar
            cleaned = cleaned.replace(/\./g, '').replace(',', '.');
        } else {
            // O ponto é o decimal, então removemos as vírgulas de milhar
            cleaned = cleaned.replace(/,/g, '');
        }
    } else if (hasComma) {
        // Se só existe vírgula, ela é o decimal
        cleaned = cleaned.replace(',', '.');
    }

    const n = parseFloat(cleaned);
    return isNaN(n) ? NaN : n;
}

/**
 * Formata um número float para uma string no formato monetário brasileiro (ex: "1.234,56").
 * @param {number} value O número float a ser formatado.
 * @returns {string} A string formatada. Retorna string vazia se o valor não for um número.
 */
function formatFloatToBrazilianCurrencyString(value) {
    if (isNaN(value) || value === null || value === undefined) {
        return '';
    }
    return value.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// ==================== GERENCIAMENTO DE CATEGORIAS PERSONALIZADAS ====================
/**
 * Carrega e exibe a tabela de gerenciamento de categorias.
 */
async function loadCategoriesManagementTable() {
    try {
        console.log('Carregando tabela de gerenciamento de categorias...');
        const {
            categoryManagementBody
        } = appState.domElements;
        if (!categoryManagementBody) {
            console.warn("Elemento 'categoryManagementBody' não encontrado. Pulando atualização.");
            return;
        }
        categoryManagementBody.innerHTML = ''; // Clear existing table rows

        const fragment = document.createDocumentFragment();

        let hasContent = false;
        for (const tipo in appState.categoriesData) {
            const categoriasDoTipo = appState.categoriesData[tipo];
            if (categoriasDoTipo && Object.keys(categoriasDoTipo).length > 0) {
                hasContent = true;
                const sortedCategories = Object.keys(categoriasDoTipo).sort();
                sortedCategories.forEach(categoria => {
                    const subcategorias = categoriasDoTipo[categoria] ? categoriasDoTipo[categoria].sort() : [];
                    const row = document.createElement('tr');
                    row.className = 'hover:bg-slate-800';

                    row.innerHTML = `
                        <td class="p-3">${tipo.charAt(0).toUpperCase() + tipo.slice(1)}</td>
                        <td class="p-3">${categoria}</td>
                        <td class="p-3">
                            <div class="flex flex-wrap gap-2">
                                ${subcategorias.length > 0 ? subcategorias.map(sub => `<span class="bg-slate-700 text-slate-300 text-xs font-medium px-2.5 py-0.5 rounded">${sub}</span>`).join('') : '<span class="text-slate-500">Nenhuma subcategoria</span>'}
                            </div>
                        </td>
                        <td class="p-3">
                            <div class="flex gap-2">
                                <button class="edit-category-btn bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 px-2 rounded" title="Editar/Adicionar Subcategoria"><i class="fas fa-plus"></i></button>
                                <button class="delete-category-btn bg-red-600 hover:bg-red-700 text-white text-xs py-1 px-2 rounded" title="Excluir Categoria"><i class="fas fa-trash"></i></button>
                            </div>
                        </td>
                    `;

                    row.querySelector('.edit-category-btn').onclick = () => editCategory(tipo, categoria);
                    row.querySelector('.delete-category-btn').onclick = () => deleteCategoryOrSubcategory(tipo, categoria);

                    fragment.appendChild(row);
                });
            }
        }
        if (!hasContent) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="4" class="p-3 text-center text-slate-500">Nenhuma categoria personalizada cadastrada.</td>`;
            fragment.appendChild(row);
        }
        categoryManagementBody.appendChild(fragment);
        console.log('Tabela de gerenciamento de categorias carregada.');
    } catch (error) {
        console.error(`Erro ao carregar tabela de gerenciamento de categorias: ${error.message}`, error);
        showAlert('Erro ao carregar categorias personalizadas: ' + error.message, CONSTANTS.ALERT_TYPE_ERROR);
    }
}

/**
 * Lida com o envio do formulário de gerenciamento de categorias.
 * @param {Event} event - O evento de submit.
 */
async function handleCategoryManagementSubmit(event) {
    event.preventDefault();
    console.log('Processando envio do formulário de categoria...');
    const formElements = event.target.elements;
    const errors = validateCategoryForm(formElements);
    if (Object.keys(errors).length > 0) {
        displayValidationErrors(errors);
        showAlert('Por favor, corrija os erros no formulário de categoria.', CONSTANTS.ALERT_TYPE_ERROR);
        return;
    }
    clearAllValidationErrors();

    const type = formElements.categoryType.value;
    const categoryName = formElements.categoryName.value.trim();
    const subcategoryName = formElements.subcategoryName.value.trim();

    try {
        if (!appState.categoriesData[type]) {
            appState.categoriesData[type] = {};
        }

        let categoryUpdated = false;

        if (appState.editingCategoryId && appState.editingCategoryId.type === type) {
            const originalCategoryName = appState.editingCategoryId.category;
            if (originalCategoryName !== categoryName) {
                // Renaming category
                if (appState.categoriesData[type][categoryName]) {
                    showAlert(`A categoria "${categoryName}" já existe para este tipo. Não é possível renomear para um nome existente.`, CONSTANTS.ALERT_TYPE_ERROR);
                    return;
                }
                appState.categoriesData[type][categoryName] = appState.categoriesData[type][originalCategoryName];
                delete appState.categoriesData[type][originalCategoryName];
                showAlert(`Categoria "${originalCategoryName}" renomeada para "${categoryName}"!`, CONSTANTS.ALERT_TYPE_SUCCESS);
                categoryUpdated = true;
            }
        }

        // Add or update subcategory
        if (!appState.categoriesData[type][categoryName]) {
            appState.categoriesData[type][categoryName] = [];
            if (!categoryUpdated) { // If it wasn't a rename, it's a new category
                showAlert(`Categoria "${categoryName}" adicionada!`, CONSTANTS.ALERT_TYPE_SUCCESS);
                categoryUpdated = true;
            }
        }

        if (subcategoryName && !appState.categoriesData[type][categoryName].includes(subcategoryName)) {
            appState.categoriesData[type][categoryName].push(subcategoryName);
            appState.categoriesData[type][categoryName].sort();
            showAlert(`Subcategoria "${subcategoryName}" adicionada à categoria "${categoryName}"!`, CONSTANTS.ALERT_TYPE_SUCCESS);
            categoryUpdated = true;
        } else if (subcategoryName && appState.categoriesData[type][categoryName].includes(subcategoryName) && !categoryUpdated) {
            showAlert(`Subcategoria "${subcategoryName}" já existe na categoria "${categoryName}".`, CONSTANTS.ALERT_TYPE_INFO);
        } else if (!subcategoryName && !categoryUpdated) {
            showAlert(`Nenhuma alteração feita na categoria "${categoryName}".`, CONSTANTS.ALERT_TYPE_INFO);
        }

        await db.appSettings.update('generalSettings', {
            categoriesData: appState.categoriesData
        });
        clearCategoryForm();
        loadCategoriesManagementTable();
        updateCategories(); // Update main form categories
        updateFilterCategories(); // Update transaction filter categories
        populateInitialSubcategories(); // Update initial subcategories list
    } catch (error) {
        console.error(`Erro ao salvar categoria: ${error.message}`, error);
        showAlert('Erro ao salvar categoria: ' + error.message, CONSTANTS.ALERT_TYPE_ERROR);
    }
}

/**
 * Valida o formulário de gerenciamento de categorias.
 * @param {HTMLFormElement} elements - Os elementos do formulário.
 * @returns {object} Um objeto com os erros de validação.
 */
function validateCategoryForm(elements) {
    const errors = {};
    const {
        categoryTypeSelect,
        categoryNameInput,
        subcategoryNameInput
    } = appState.domElements;

    // Clear previous errors first
    clearValidationError(categoryTypeSelect);
    clearValidationError(categoryNameInput);
    clearValidationError(subcategoryNameInput);

    if (!elements.categoryType || !elements.categoryType.value) {
        errors.categoryType = 'Tipo de transação é obrigatório.';
        if (categoryTypeSelect) categoryTypeSelect.classList.add('is-invalid');
    }
    const categoryName = elements.categoryName?.value.trim();
    if (!categoryName) {
        errors.categoryName = 'Nome da categoria é obrigatório.';
        if (categoryNameInput) categoryNameInput.classList.add('is-invalid');
    } else if (categoryName.length > 50) {
        errors.categoryName = 'Nome da categoria muito longa (máx. 50 caracteres).';
        if (categoryNameInput) categoryNameInput.classList.add('is-invalid');
    }

    const subcategoryName = elements.subcategoryName?.value.trim();
    if (subcategoryName && subcategoryName.length > 50) {
        errors.subcategoryName = 'Nome da subcategoria muito longo (máx. 50 caracteres).';
        if (subcategoryNameInput) subcategoryNameInput.classList.add('is-invalid');
    }

    return errors;
}

/**
 * Limpa o formulário de gerenciamento de categorias.
 */
function clearCategoryForm() {
    const {
        categoryManagementForm: form,
        saveCategoryBtn,
        categoryTypeSelect,
        categoryNameInput,
        subcategoryNameInput
    } = appState.domElements;
    if (form) {
        form.reset();
        if (saveCategoryBtn) saveCategoryBtn.textContent = 'Salvar';
        appState.editingCategoryId = null; // Clear editing state
        clearAllValidationErrors(); // Clear validation for all fields
        if (categoryTypeSelect) clearValidationError(categoryTypeSelect); // Specific for category form
        if (categoryNameInput) clearValidationError(categoryNameInput);
        if (subcategoryNameInput) clearValidationError(subcategoryNameInput);
        console.log('Formulário de gerenciamento de categorias limpo.');
    }
}

/**
 * Carrega dados de uma categoria para edição no formulário.
 * @param {string} type - Tipo da categoria.
 * @param {string} category - Nome da categoria.
 */
function editCategory(type, category) {
    const {
        categoryTypeSelect,
        categoryNameInput,
        subcategoryNameInput,
        saveCategoryBtn
    } = appState.domElements;
    if (categoryTypeSelect && categoryNameInput && subcategoryNameInput && saveCategoryBtn) {
        categoryTypeSelect.value = type;
        categoryNameInput.value = category;
        subcategoryNameInput.value = ''; // Clear subcategory input for new additions
        appState.editingCategoryId = {
            type,
            category
        }; // Store ID of category being edited
        saveCategoryBtn.textContent = 'Atualizar';
        showAlert(`Editando "${category}". Adicione uma subcategoria ou renomeie a categoria.`, CONSTANTS.ALERT_TYPE_INFO);
        console.log(`Carregado para edição: Tipo=${type}, Categoria=${category}`);
        subcategoryNameInput.focus(); // Focus on subcategory input for quick addition
    }
}

/**
 * Exclui uma categoria ou subcategoria.
 * @param {string} type - Tipo da categoria.
 * @param {string|null} [subcategory=null] - Nome da subcategoria. Se nulo, tenta excluir a categoria inteira.
 */
async function deleteCategoryOrSubcategory(type, category, subcategory = null) {
    try {
        if (!appState.categoriesData[type] || !appState.categoriesData[type][category]) {
            showAlert('Categoria não encontrada.', CONSTANTS.ALERT_TYPE_ERROR);
            return;
        }
        if (subcategory) {
            // Confirm deletion of a specific subcategory
            openConfirmationModal('Confirmar Exclusão', `Tem certeza que deseja excluir a subcategoria "${subcategory}" da categoria "${category}" (${type})?`, async () => {
                const index = appState.categoriesData[type][category].indexOf(subcategory);
                if (index > -1) {
                    appState.categoriesData[type][category].splice(index, 1);
                    showAlert(`Subcategoria "${subcategory}" excluída!`, CONSTANTS.ALERT_TYPE_SUCCESS);
                }
                await db.appSettings.update('generalSettings', {
                    categoriesData: appState.categoriesData
                });
                loadCategoriesManagementTable(); // Refresh table
                updateCategories(); // Refresh main form categories
                updateFilterCategories(); // Refresh filter categories
                populateInitialSubcategories(); // Refresh all subcategories dropdown
            });
        } else {
            // Before deleting a category, check if any transactions use it
            const transactionsUsingCategory = await db.transactions
                .where({
                    tipo: type,
                    categoria: category
                })
                .count();
            if (transactionsUsingCategory > 0) {
                showAlert(`Não é possível excluir a categoria "${category}" (${type}) porque há ${transactionsUsingCategory} transação(ões) associada(s) a ela.`, CONSTANTS.ALERT_TYPE_ERROR);
                return;
            }
            // Confirm deletion of entire category
            openConfirmationModal('Confirmar Exclusão', `Tem certeza que deseja excluir a categoria "${category}" (${type}) e todas as suas subcategorias? Esta ação não pode ser desfeita.`, async () => {
                delete appState.categoriesData[type][category];
                showAlert(`Categoria "${category}" excluída!`, CONSTANTS.ALERT_TYPE_SUCCESS);
                await db.appSettings.update('generalSettings', {
                    categoriesData: appState.categoriesData
                });
                loadCategoriesManagementTable(); // Refresh table
                updateCategories(); // Refresh main form categories
                updateFilterCategories(); // Refresh filter categories
                populateInitialSubcategories(); // Refresh all subcategories dropdown
            });
        }
    } catch (error) {
        console.error(`Erro em deleteCategoryOrSubcategory: ${error.message}`, error);
        showAlert('Erro ao excluir categoria/subcategoria: ' + error.message, CONSTANTS.ALERT_TYPE_ERROR);
    }
}

/**
 * Oferece ao usuário a opção de salvar uma nova associação de categoria (tipo + categoria + subcategoria).
 * @param {string} tipo - 'receita' ou 'despesa'.
 * @param {string} newCategory - O nome da nova categoria.
 * @param {string} newSubcategory - O nome da nova subcategoria.
 */
function promptToSaveNewRule(tipo, newCategory, newSubcategory) {
    const message = `Percebemos que "${newSubcategory}" é uma nova subcategoria para "${newCategory}". Deseja salvar esta associação para facilitar cadastros futuros?`;

    openConfirmationModal('Aprender Nova Categoria?', message, async () => {
        try {
            // Ensure the structure exists
            if (!appState.categoriesData[tipo]) appState.categoriesData[tipo] = {};
            if (!appState.categoriesData[tipo][newCategory]) appState.categoriesData[tipo][newCategory] = [];

            // Add only if not already present
            if (!appState.categoriesData[tipo][newCategory].includes(newSubcategory)) {
                appState.categoriesData[tipo][newCategory].push(newSubcategory);
                appState.categoriesData[tipo][newCategory].sort(); // Keep sorted

                await db.appSettings.update('generalSettings', {
                    categoriesData: appState.categoriesData
                });

                populateInitialSubcategories(); // Update dropdowns
                loadCategoriesManagementTable(); // Update management table
                showAlert(`Regra salva! A subcategoria "${newSubcategory}" foi adicionada.`, CONSTANTS.ALERT_TYPE_SUCCESS);
            } else {
                showAlert(`A subcategoria "${newSubcategory}" já existe na categoria "${newCategory}".`, CONSTANTS.ALERT_TYPE_INFO);
            }
        } catch (error) {
            console.error(`Erro ao salvar nova regra de categoria: ${error.message}`, error);
            showAlert('Não foi possível salvar a nova regra.', CONSTANTS.ALERT_TYPE_ERROR);
        }
    });
}

// ==================== FUNÇÕES DE IMPORTAÇÃO (Gerais) ====================
/**
 * Detecta o meio de pagamento de uma transação.
 * Prioriza termos em `meioStr` se houver, depois `descricaoStr`.
 * @param {string} meioStr - String do meio de pagamento (e.g., de uma coluna de planilha).
 * @param {string} descricaoStr - Descrição da transação.
 * @returns {string} O meio de pagamento detectado (chave interna, e.g., 'cartao_credito').
 */
function detectMeioPagamento(meioStr, descricaoStr) {
    const lowerCaseMeio = meioStr ? String(meioStr).toLowerCase() : '';
    const lowerCaseDescricao = descricaoStr ? String(descricaoStr).toLowerCase() : '';

    // Check `meioStr` first if it contains specific terms
    if (CONSTANTS.CARD_CREDIT_TERMS.some(term => lowerCaseMeio.includes(term))) {
        return 'cartao_credito';
    }
    if (CONSTANTS.PIX_TERMS.some(term => lowerCaseMeio.includes(term))) {
        return 'pix';
    }
    if (CONSTANTS.DEBIT_TERMS.some(term => lowerCaseMeio.includes(term))) {
        return 'debito';
    }
    if (CONSTANTS.MONEY_TERMS.some(term => lowerCaseMeio.includes(term))) {
        return 'dinheiro';
    }
    if (CONSTANTS.BOLETO_TERMS.some(term => lowerCaseMeio.includes(term))) {
        return 'boleto';
    }
    if (CONSTANTS.TRANSFER_TERMS.some(term => lowerCaseMeio.includes(term))) {
        return 'transferencia';
    }

    // If not found in `meioStr`, check `descricaoStr`
    if (CONSTANTS.CARD_CREDIT_TERMS.some(term => lowerCaseDescricao.includes(term))) {
        return 'cartao_credito';
    }
    if (CONSTANTS.PIX_TERMS.some(term => lowerCaseDescricao.includes(term))) {
        return 'pix';
    }
    if (CONSTANTS.DEBIT_TERMS.some(term => lowerCaseDescricao.includes(term))) {
        return 'debito';
    }
    if (CONSTANTS.MONEY_TERMS.some(term => lowerCaseDescricao.includes(term))) {
        return 'dinheiro';
    }
    if (CONSTANTS.BOLETO_TERMS.some(term => lowerCaseDescricao.includes(term))) {
        return 'boleto';
    }
    if (CONSTANTS.TRANSFER_TERMS.some(term => lowerCaseDescricao.includes(term))) {
        return 'transferencia';
    }
    return 'outros'; // Default if no specific term is matched
}

/**
 * Desfaz a última importação de transações.
 */
async function undoLastImport() {
    if (appState.lastImportedTransactionIds.length === 0) {
        showAlert('Nenhuma importação recente para desfazer.', CONSTANTS.ALERT_TYPE_ERROR);
        return;
    }

    openConfirmationModal('Confirmar Desfazer', `Tem certeza que deseja desfazer a última importação (${appState.lastImportedTransactionIds.length} transação(ões))?`, async () => {
        try {
            await db.transactions.bulkDelete(appState.lastImportedTransactionIds);
                        showAlert(`${appState.lastImportedTransactionIds.length} transação(ões) da última importação foram removidas!`, CONSTANTS.ALERT_TYPE_SUCCESS);
            appState.lastImportedTransactionIds = []; // Clear the list after undo
            await db.appSettings.update('generalSettings', {
                lastImportedTransactionIds: appState.lastImportedTransactionIds
            });
            // Refresh affected UI components
            loadTransactions();
            generateReports();
            updateFilterCategories();
            updateSystemStats();
        } catch (error) {
            console.error(`Erro ao desfazer importação: ${error.message}`, error);
            showAlert('Erro ao desfazer importação: ' + error.message, CONSTANTS.ALERT_TYPE_ERROR);
        }
    });
}

/**
 * Mostra a barra de progresso da importação.
 */
function showImportProgress() {
    const {
        importProgressDiv
    } = appState.domElements;
    if (importProgressDiv) {
        importProgressDiv.classList.remove('hidden-field');
        console.log('Barra de progresso de importação mostrada.');
    } else {
        console.warn('Elemento #importProgress não encontrado ao tentar mostrar o progresso.');
    }
}

/**
 * Atualiza o preenchimento e texto da barra de progresso.
 * @param {number} percentage - Percentual de progresso (0-100).
 */
function updateImportProgress(percentage) {
    const {
        progressFillDiv,
        progressTextP
    } = appState.domElements;

    if (progressFillDiv) {
        progressFillDiv.style.width = percentage + '%';
    }
    if (progressTextP) {
        progressTextP.textContent = Math.round(percentage) + '%';
    }
}

/**
 * Esconde a barra de progresso.
 */
function hideImportProgress() {
    const {
        importProgressDiv
    } = appState.domElements;
    if (importProgressDiv) {
        importProgressDiv.classList.add('hidden-field');
        console.log('Barra de progresso de importação escondida.');
    } else {
        console.warn('Elemento #importProgress não encontrado ao tentar esconder o progresso.');
    }
}

// ==================== EXIBIÇÃO DE TRANSAÇÕES (Tabela) ====================
/**
 * Alterna a ordem de ordenação da tabela de transações.
 */
function toggleSortOrder() {
    appState.currentSortOrder = (appState.currentSortOrder === 'desc') ? 'asc' : 'desc';
    loadTransactions(); // Reload transactions with new sort order
}

/**
 * Carrega e exibe as transações filtradas na tabela.
 */
async function loadTransactions() {
    try {
        console.log('Carregando transações...');
        const {
            transactionsBody,
            masterCheckbox,
            sortIconSpan
        } = appState.domElements;
        if (!transactionsBody) {
            console.warn("Elemento 'transactionsBody' não encontrado. Pulando atualização.");
            return;
        }
        transactionsBody.innerHTML = ''; // Clear existing table rows

        const fragment = document.createDocumentFragment();
        const filteredTransactions = await getFilteredTransactions(); // Get filtered and sorted transactions

        // Reset master checkbox and selected count
        if (masterCheckbox) masterCheckbox.checked = false;
        updateSelectedCount();

        filteredTransactions.forEach(transaction => {
            let description = transaction.descricao;

            const row = document.createElement('tr');
            row.className = 'hover:bg-slate-800'; // Add hover effect

            const checkboxCell = document.createElement('td');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            // Aplicando classes Tailwind diretamente ao invés de 'badge'
            checkbox.className = 'transaction-checkbox';
            checkbox.dataset.id = transaction.id;
            checkbox.setAttribute('aria-label', `Selecionar transação de ${description} no valor de ${transaction.valor}`);
            checkboxCell.appendChild(checkbox);
            row.appendChild(checkboxCell);

            const dateCell = document.createElement('td');
            dateCell.textContent = formatDisplayDate(transaction.data);
            row.appendChild(dateCell);

            const typeCell = document.createElement('td');
            const typeSpan = document.createElement('span');
            // Aplicando classes Tailwind diretamente ao invés de 'badge'
            typeSpan.className = `inline-block px-2.5 py-0.5 text-xs font-bold leading-none text-center whitespace-nowrap align-baseline rounded-md ${transaction.tipo === CONSTANTS.TRANSACTION_TYPE_INCOME ? 'positive' : 'negative'}`;
            typeSpan.textContent = transaction.tipo.toUpperCase();
            typeCell.appendChild(typeSpan);
            row.appendChild(typeCell);

            const categoryCell = document.createElement('td');
            categoryCell.textContent = transaction.categoria;
            row.appendChild(categoryCell);

            const subcategoryCell = document.createElement('td');
            subcategoryCell.textContent = transaction.subcategoria || '-';
            row.appendChild(subcategoryCell);

            const descriptionCell = document.createElement('td');
            descriptionCell.textContent = description;
            row.appendChild(descriptionCell);

            const amountCell = document.createElement('td');
            amountCell.className = `amount ${transaction.tipo === CONSTANTS.TRANSACTION_TYPE_INCOME ? 'positive' : 'negative'}`;
            amountCell.textContent = formatCurrency(transaction.valor); // Usando formatCurrency
            row.appendChild(amountCell);

            const meioCell = document.createElement('td');
            meioCell.textContent = formatMeio(transaction.meio);
            row.appendChild(meioCell);

            const actionsCell = document.createElement('td');
            actionsCell.className = 'table-actions-btns flex gap-2 justify-end items-center'; // Added flex for button layout
            const editBtn = document.createElement('button');
            editBtn.className = 'btn btn-sm bg-blue-600 hover:bg-blue-700 text-white p-1 rounded-md'; // Apply Tailwind classes
            editBtn.onclick = () => editTransaction(transaction.id);
            editBtn.setAttribute('aria-label', `Editar transação de ${description}`);
            editBtn.innerHTML = '<i class="fas fa-edit"></i>'; // Font Awesome icon
            actionsCell.appendChild(editBtn);

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn-sm bg-red-600 hover:bg-red-700 text-white p-1 rounded-md'; // Apply Tailwind classes
            deleteBtn.onclick = () => deleteTransaction(transaction.id);
            deleteBtn.setAttribute('aria-label', `Excluir transação de ${description}`);
            deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>'; // Font Awesome icon
            actionsCell.appendChild(deleteBtn);

            row.appendChild(actionsCell);

            // Add event listener for individual checkbox change
            checkbox.addEventListener('change', updateSelectedCount);
            fragment.appendChild(row);
        });
        transactionsBody.appendChild(fragment);
        updateTransactionStats(filteredTransactions);

        // Update sort icon based on current order
        if (sortIconSpan) {
            sortIconSpan.innerHTML = appState.currentSortOrder === 'desc' ? '<i class="fas fa-sort-down"></i>' : '<i class="fas fa-sort-up"></i>';
        }

        console.log('Transações carregadas:', filteredTransactions.length);
    } catch (error) {
        console.error(`Erro ao carregar transações: ${error.message}`, error);
        showAlert('Erro ao carregar transações: ' + error.message, CONSTANTS.ALERT_TYPE_ERROR);
    }
}

/**
 * Marca/desmarca todos os checkboxes da tabela de transações.
 */
function toggleAllCheckboxes() {
    const {
        masterCheckbox
    } = appState.domElements;
    const checkboxes = document.querySelectorAll('.transaction-checkbox');
    if (masterCheckbox) {
        checkboxes.forEach(checkbox => {
            checkbox.checked = masterCheckbox.checked;
        });
    }
    updateSelectedCount(); // Update the count of selected transactions
}

/**
 * Atualiza a contagem de transações selecionadas na UI e gerencia a visibilidade dos botões de ação em massa.
 */
function updateSelectedCount() {
    const {
        selectedCountSpan,
        selectedCountMeioModalSpan,
        deleteSelectedBtn,
        editSelectedMeioBtn,
        masterCheckbox
    } = appState.domElements;
    const checkboxes = document.querySelectorAll('.transaction-checkbox:checked');
    const allCheckboxes = document.querySelectorAll('.transaction-checkbox');

    if (selectedCountSpan) selectedCountSpan.textContent = checkboxes.length;
    if (selectedCountMeioModalSpan) selectedCountMeioModalSpan.textContent = checkboxes.length;

    // Show/hide bulk action buttons based on selection count
    if (deleteSelectedBtn) {
        deleteSelectedBtn.style.display = checkboxes.length > 0 ? 'inline-block' : 'none';
    }
    if (editSelectedMeioBtn) {
        editSelectedMeioBtn.style.display = checkboxes.length > 0 ? 'inline-block' : 'none';
    }
    // Update master checkbox state (checked if all are selected, unchecked otherwise, indeterminate if some but not all)
    if (masterCheckbox) {
        if (allCheckboxes.length === 0) {
            masterCheckbox.checked = false;
            masterCheckbox.indeterminate = false;
        } else if (checkboxes.length === allCheckboxes.length) {
            masterCheckbox.checked = true;
            masterCheckbox.indeterminate = false;
        } else if (checkboxes.length > 0) {
            masterCheckbox.checked = false;
            masterCheckbox.indeterminate = true;
        } else {
            masterCheckbox.checked = false;
            masterCheckbox.indeterminate = false;
        }
    }
}

/**
 * Exclui transações selecionadas em massa.
 */
async function deleteSelectedTransactions() {
    const selectedCheckboxes = document.querySelectorAll('.transaction-checkbox:checked');
    if (selectedCheckboxes.length === 0) {
        showAlert('Nenhuma transação selecionada para exclusão.', CONSTANTS.ALERT_TYPE_ERROR);
        return;
    }
    openConfirmationModal('Confirmar Exclusão em Massa', `Tem certeza que deseja excluir ${selectedCheckboxes.length} transação(ões) selecionada(s)?`, async () => {
        const idsToDelete = Array.from(selectedCheckboxes).map(cb => parseFloat(cb.dataset.id));
        try {
            await db.transactions.bulkDelete(idsToDelete);
            showAlert(`${selectedCheckboxes.length} transação(ões) excluída(s) com sucesso!`, CONSTANTS.ALERT_TYPE_SUCCESS);
            // Refresh UI components after deletion
            loadTransactions();
            generateReports();
            updateFilterCategories();
            updateSystemStats();
        } catch (error) {
            console.error(`Erro ao excluir transações selecionadas: ${error.message}`, error);
            showAlert('Erro ao excluir transações selecionadas: ' + error.message, CONSTANTS.ALERT_TYPE_ERROR);
        }
    });
}

/**
 * Abre o modal para edição em massa do meio de pagamento.
 */
function openEditMeioModal() {
    const {
        editMeioModal,
        selectedCountMeioModalSpan
    } = appState.domElements;
    const checkboxes = document.querySelectorAll('.transaction-checkbox:checked');
    if (checkboxes.length === 0) {
        showAlert('Selecione ao menos uma transação para modificar o meio de pagamento.', CONSTANTS.ALERT_TYPE_ERROR);
        return;
    }
    openModal('editMeioModal'); // Use generic openModal
    if (selectedCountMeioModalSpan) selectedCountMeioModalSpan.textContent = checkboxes.length;
}

/**
 * Aplica a alteração em massa do meio de pagamento às transações selecionadas.
 */
async function applyBulkMeioChange() {
    const {
        modalMeioSelect
    } = appState.domElements; // Get element from appState.domElements
    const newMeio = modalMeioSelect ? modalMeioSelect.value : '';
    if (!newMeio) {
        showAlert('Selecione um meio de pagamento válido.', CONSTANTS.ALERT_TYPE_ERROR);
        return;
    }
    const selectedIds = Array.from(document.querySelectorAll('.transaction-checkbox:checked')).map(cb => parseFloat(cb.dataset.id));
    let changedCount = 0;
    try {
        await db.transactions.where('id').anyOf(selectedIds).modify(t => {
            t.meio = newMeio;
            changedCount++;
        });
        closeModal('editMeioModal'); // Close the modal
        showAlert(`${changedCount} transação(ões) modificada(s) com sucesso para ${formatMeio(newMeio)}!`, CONSTANTS.ALERT_TYPE_SUCCESS);
        // Refresh UI components after bulk update
        loadTransactions();
        generateReports();
        updateSystemStats();
    } catch (error) {
        console.error(`Erro ao aplicar alteração em massa: ${error.message}`, error);
        showAlert('Erro ao aplicar alteração em massa: ' + error.message, CONSTANTS.ALERT_TYPE_ERROR);
    }
}

/**
 * Busca transações do banco de dados aplicando filtros e ordenação.
 * @returns {Promise<Array<object>>} Array de transações filtradas e ordenadas.
 */
async function getFilteredTransactions() {
    try {
        let transactions = await db.transactions.toArray(); // Get all transactions first
        const {
            filterDataInicioInput,
            filterDataFimInput,
            filterTipoSelect,
            filterCategoriaSelect,
            searchBoxInput
        } = appState.domElements;

        const dataInicio = filterDataInicioInput ? filterDataInicioInput.value : null;
        const dataFim = filterDataFimInput ? filterDataFimInput.value : null;
        const tipo = filterTipoSelect ? filterTipoSelect.value : null;
        const categoria = filterCategoriaSelect ? filterCategoriaSelect.value : null;
        const searchTerm = searchBoxInput ? searchBoxInput.value?.toLowerCase() : null;

        // Apply date filters
        if (dataInicio && dataInicio.trim() !== '') { // Added trim() and empty string check
            transactions = transactions.filter(t => t.data >= dataInicio);
        }
        if (dataFim && dataFim.trim() !== '') { // Added trim() and empty string check
            transactions = transactions.filter(t => t.data <= dataFim);
        }

        // Apply type filter
        if (tipo) {
            transactions = transactions.filter(t => t.tipo === tipo);
        }

        // Apply category filter
        if (categoria) {
            transactions = transactions.filter(t => t.categoria === categoria);
        }

        // Apply search term filter
        if (searchTerm) {
            transactions = transactions.filter(t =>
                String(t.descricao || '').toLowerCase().includes(searchTerm) ||
                String(t.categoria || '').toLowerCase().includes(searchTerm) ||
                String(t.subcategoria || '').toLowerCase().includes(searchTerm) ||
                String(formatMeio(t.meio) || '').toLowerCase().includes(searchTerm) // Search by friendly payment method name
            );
        }

        // Apply sorting based on currentSortOrder
        transactions.sort((a, b) => {
            const dateA = new Date(a.data + 'T00:00:00'); // Ensure date comparison is accurate by setting time to start of day
            const dateB = new Date(b.data + 'T00:00:00');
            const dataCreatedA = new Date(a.dataCreated);
            const dataCreatedB = new Date(b.dataCreated);

            let compareResult = 0;
            if (appState.currentSortOrder === 'asc') {
                compareResult = dateA.getTime() - dateB.getTime();
            } else { // 'desc'
                compareResult = dateB.getTime() - dateA.getTime();
            }

            // If dates are the same, sort by dataCreated to maintain consistent order
            if (compareResult === 0) {
                return dataCreatedA.getTime() - dataCreatedB.getTime();
            }
            return compareResult;
        });

        return transactions;
    } catch (error) {
        console.error(`Erro ao filtrar transações: ${error.message}`, error);
        showAlert('Erro ao carregar transações filtradas: ' + error.message, CONSTANTS.ALERT_TYPE_ERROR);
        return [];
    }
}


/**
 * Calcula totais de receitas, despesas e saldo.
 * @param {Array<object>} transactions - Lista de transações.
 * @returns {object} Objeto com totais.
 */
function calculateStats(transactions) {
    const totalReceitas = transactions
        .filter(t => t.tipo === CONSTANTS.TRANSACTION_TYPE_INCOME)
        .reduce((sum, t) => sum + t.valor, 0);
    const totalDespesas = transactions
        .filter(t => t.tipo === CONSTANTS.TRANSACTION_TYPE_EXPENSE)
        .reduce((sum, t) => sum + t.valor, 0);
    const saldo = totalReceitas - totalDespesas;
    return {
        totalReceitas,
        totalDespesas,
        saldo
    };
}

/**
 * Atualiza as estatísticas de transações na interface.
 * @param {Array<object>} filteredTransactions - Transações a serem exibidas.
 */
function updateTransactionStats(filteredTransactions) {
    try {
        const {
            transactionStatsContainer
        } = appState.domElements;
        const stats = calculateStats(filteredTransactions);
        const totalTransacoes = filteredTransactions.length;
        if (transactionStatsContainer) {
            transactionStatsContainer.innerHTML = `
                <div class="bg-slate-700 p-4 rounded-lg shadow-md">
                    <div class="text-white text-3xl font-bold mb-1 positive">${formatCurrency(stats.totalReceitas)}</div>
                    <div class="text-slate-400 text-sm">Total Receitas</div>
                </div>
                <div class="bg-slate-700 p-4 rounded-lg shadow-md">
                    <div class="text-white text-3xl font-bold mb-1 negative">${formatCurrency(stats.totalDespesas)}</div>
                    <div class="text-slate-400 text-sm">Total Despesas</div>
                </div>
                <div class="bg-slate-700 p-4 rounded-lg shadow-md">
                    <div class="text-white text-3xl font-bold mb-1 ${stats.saldo >= 0 ? 'positive' : 'negative'}">${formatCurrency(stats.saldo)}</div>
                    <div class="text-slate-400 text-sm">Saldo Líquido</div>
                </div>
                <div class="bg-slate-700 p-4 rounded-lg shadow-md">
                    <div class="text-white text-3xl font-bold mb-1 neutral">${totalTransacoes}</div>
                    <div class="text-slate-400 text-sm">Transações</div>
                </div>
            `;
        }
    } catch (error) {
        console.error(`Erro ao atualizar estatísticas: ${error.message}`, error);
    }
}

/**
 * Atualiza as opções de categoria nos filtros.
 */
async function updateFilterCategories() {
    try {
        const {
            filterCategoriaSelect
        } = appState.domElements;
        if (!filterCategoriaSelect) return;
        filterCategoriaSelect.innerHTML = '<option value="">Todas</option>'; // Reset to "Todas"

        const allCategoriesSet = new Set();
        // Collect all unique categories from user-defined data
        for (const tipo in appState.categoriesData) {
            for (const categoria in appState.categoriesData[tipo]) {
                allCategoriesSet.add(categoria);
            }
        }
        // Collect all unique categories from predefined keywords
        CATEGORY_KEYWORDS.forEach(rule => allCategoriesSet.add(rule.category));


        const allCategories = Array.from(allCategoriesSet).sort();

        allCategories.forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria;
            option.textContent = categoria;
            filterCategoriaSelect.appendChild(option);
        });
        console.log('Filtros de categoria atualizados');
    } catch (error) {
        console.error(`Erro ao atualizar filtros de categoria: ${error.message}`, error);
    }
}

/**
 * Aplica os filtros e recarrega as transações.
 */
async function applyFilters() {
    console.log('Aplicando filtros...');
    await loadTransactions();
}

/**
 * Limpa todos os campos de filtro e recarrega as transações.
 */
async function clearFilters() {
    try {
        console.log('Limpando filtros...');
        const {
            filterDataInicioInput,
            filterDataFimInput,
            filterTipoSelect,
            filterCategoriaSelect,
            searchBoxInput
        } = appState.domElements;
        if (filterDataInicioInput) filterDataInicioInput.value = '';
        if (filterDataFimInput) filterDataFimInput.value = '';
        if (filterTipoSelect) filterTipoSelect.value = '';
        if (filterCategoriaSelect) filterCategoriaSelect.value = '';
        if (searchBoxInput) searchBoxInput.value = '';

        await loadTransactions(); // Reload transactions with cleared filters
    } catch (error) {
        console.error(`Erro ao limpar filtros: ${error.message}`, error);
    }
}

/**
 * Executa a busca de transações.
 */
async function searchTransactions() {
    await loadTransactions(); // Just reload transactions, filters (including search) are applied in getFilteredTransactions
}

/**
 * Carrega os dados de uma transação para edição no formulário.
 * @param {number} id - ID da transação a ser editada.
 */
async function editTransaction(id) {
    try {
        console.log('Editando transação:', id);
        const transaction = await db.transactions.get(id);
        if (!transaction) {
            showAlert('Transação não encontrada!', CONSTANTS.ALERT_TYPE_ERROR);
            return;
        }
        appState.editingTransactionId = id;
        clearAllValidationErrors(); // Clear any existing form validation errors

        const {
            dataInput,
            tipoSelect,
            valorInput,
            meioSelect,
            descricaoInput,
            categoriaSelect,
            outraCategoriaInput,
            subcategoriaSelect,
            outraSubcategoriaInput
        } = appState.domElements;

        // Populate basic fields
        if (dataInput) dataInput.value = transaction.data;
        if (valorInput) valorInput.value = formatFloatToBrazilianCurrencyString(transaction.valor);
        if (meioSelect) meioSelect.value = transaction.meio;
        if (descricaoInput) descricaoInput.value = transaction.descricao;

        // Populate type, category, subcategory
        if (tipoSelect) tipoSelect.value = transaction.tipo;
        updateCategories(); // Update categories dropdown based on type

        // Use requestAnimationFrame to ensure DOM updates for category dropdown are done
        requestAnimationFrame(() => {
            // Check if transaction's category is a predefined one, else use "outraCategoria"
            if (appState.categoriesData[transaction.tipo] && Object.keys(appState.categoriesData[transaction.tipo]).includes(transaction.categoria)) {
                if (categoriaSelect) categoriaSelect.value = transaction.categoria;
                if (outraCategoriaInput) outraCategoriaInput.value = '';
            } else {
                if (categoriaSelect) categoriaSelect.value = '';
                if (outraCategoriaInput) outraCategoriaInput.value = transaction.categoria;
            }
            updateSubcategories(); // Update subcategories based on type and category

            requestAnimationFrame(() => {
                // Check if transaction's subcategory is a predefined one, else use "outraSubcategoria"
                const subcatInCurrentDropdown = subcategoriaSelect && subcategoriaSelect.querySelector(`option[value="${transaction.subcategoria}"]`);
                if (subcatInCurrentDropdown) {
                    if (subcategoriaSelect) subcategoriaSelect.value = transaction.subcategoria;
                    if (outraSubcategoriaInput) outraSubcategoriaInput.value = '';
                } else {
                    if (subcategoriaSelect) subcategoriaSelect.value = '';
                    if (outraSubcategoriaInput) outraSubcategoriaInput.value = transaction.subcategoria;
                }

                // Update form visibility and custom fields after populating
                toggleCustomCategoryFields();
                updateFormVisibility();
            });
        });

        showTab('panel-cadastro'); // Switch to cadastro tab
        showAlert('Transação carregada para edição!', CONSTANTS.ALERT_TYPE_SUCCESS);
    } catch (error) {
        console.error(`Erro ao carregar transação para edição: ${error.message}`, error);
        showAlert('Erro ao carregar transação para edição: ' + error.message, CONSTANTS.ALERT_TYPE_ERROR);
    }
}

/**
 * Exclui uma transação ou uma série de transações.
 * @param {number} id - ID da transação a ser excluída.
 */
async function deleteTransaction(id) {
    openConfirmationModal(
        'Confirmar Exclusão',
        'Tem certeza que deseja excluir esta transação?',
        async () => {
            try {
                await db.transactions.delete(id);
                showAlert(`1 transação excluída com sucesso!`, CONSTANTS.ALERT_TYPE_SUCCESS);
                loadTransactions();
                generateReports();
                updateFilterCategories();
                updateSystemStats();
            } catch (error) {
                console.error(`Erro ao excluir transação: ${error.message}`, error);
                showAlert('Erro ao excluir transação: ' + error.message, CONSTANTS.ALERT_TYPE_ERROR);
            }
        }
    );
}

// ==================== RELATÓRIOS (SEÇÃO ATUALIZADA) ====================

/**
 * Define as datas padrão para os filtros de relatório (primeiro dia do mês atual até hoje).
 */
function setupReportDates() {
    try {
        const {
            reportDataInicioInput,
            reportDataFimInput
        } = appState.domElements;
        const hoje = new Date();
        const primeiroDiaDoMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        if (reportDataInicioInput) {
            reportDataInicioInput.value = primeiroDiaDoMes.toISOString().split('T')[0];
        }
        if (reportDataFimInput) {
            reportDataFimInput.value = hoje.toISOString().split('T')[0];
        }
        console.log('Datas dos relatórios configuradas');
    } catch (error) {
        console.error(`Erro ao configurar datas dos relatórios: ${error.message}`, error);
    }
}

/**
 * Gera os relatórios e gráficos usando Chart.js.
 */
async function generateReports() {
    // ======================== DEBUG INFO ========================
    console.log('%c--- FUNÇÃO generateReports FOI CHAMADA! ---', 'color: red; font-size: 16px; font-weight: bold;');
    const debugDataInicio = appState.domElements.reportDataInicioInput ? appState.domElements.reportDataInicioInput.value : 'INPUT NÃO ENCONTRADO';
    const debugDataFim = appState.domElements.reportDataFimInput ? appState.domElements.reportDataFimInput.value : 'INPUT NÃO ENCONTRADO';
    console.log(`Valores de data nos inputs no momento da chamada: Início='${debugDataInicio}', Fim='${debugDataFim}'`);
    // ===============================================================
    try {
        console.log('Gerando relatórios com o novo layout...');
        const {
            reportDataInicioInput,
            reportDataFimInput,
            mainChartArea,
            reportChartSelect,
            chartTypeDespesasSelect
        } = appState.domElements;

        const dataInicio = reportDataInicioInput ? reportDataInicioInput.value : null;
        const dataFim = reportDataFimInput ? reportDataFimInput.value : null;

        if (!mainChartArea) {
            console.error("Área do gráfico principal não encontrada!");
            showAlert("Erro: A área do gráfico não foi encontrada.", CONSTANTS.ALERT_TYPE_ERROR);
            return;
        }

        const reportTransactions = await getFilteredTransactionsForReports(dataInicio, dataFim);
        appState.currentReportTableTransactions = reportTransactions; // Armazena as transações do relatório

        // Atualiza os KPIs no topo da página
        updateReportKPIs(reportTransactions);

        // Preenche a tabela de detalhes do relatório
        updateReportTransactionsTable(reportTransactions);


        const selectedChart = reportChartSelect ? reportChartSelect.value : 'despesasCategoriaChart';
        const chartType = chartTypeDespesasSelect ? chartTypeDespesasSelect.value : 'doughnut';

        // Destrói a instância anterior do gráfico principal para evitar sobreposição
        if (appState.mainChartInstance) {
            appState.mainChartInstance.destroy();
        }
        // Destrói a instância do gráfico Top Categorias para evitar sobreposição
        if (appState.topCategoriasChartInstance) {
            appState.topCategoriasChartInstance.destroy();
        }
        // ADICIONADO: Destrói a instância do novo gráfico de evolução por categoria
        if (appState.evolucaoMensalCategoriaChartInstance) {
            appState.evolucaoMensalCategoriaChartInstance.destroy();
        }


        if (appState.domElements.mainChartTitle && reportChartSelect) {
            // Garante que o título volte ao normal ao gerar o relatório principal
            appState.domElements.mainChartTitle.textContent = reportChartSelect.options[reportChartSelect.selectedIndex].text;
        }

        // Create new chart based on selection
        switch (selectedChart) {
            case 'despesasCategoriaChart':
                createDespesasCategoriaChart(reportTransactions, mainChartArea.getContext('2d'), chartType);
                break;
            case 'evolucaoMensalChart':
                createEvolucaoMensalChart(reportTransactions, mainChartArea.getContext('2d'));
                break;
            case 'transacoesMeioChart':
                createTransacoesMeioChart(reportTransactions, mainChartArea.getContext('2d'), chartType);
                break;
            default:
                createDespesasCategoriaChart(reportTransactions, mainChartArea.getContext('2d'), chartType); // Fallback
        }

        // CHAME A NOVA FUNÇÃO AQUI para o gráfico Top 10 Categorias
        renderTopCategoriasChart(reportTransactions);

        // ADICIONADO: Chame a nova função de renderização do gráfico de Evolução Mensal por Categoria
        const selectedEvolucaoCategory = appState.domElements.evolucaoCategoriaSelect.value;
        renderEvolucaoMensalPorCategoria(reportTransactions, selectedEvolucaoCategory);


        console.log('Relatórios gerados com sucesso');
    } catch (error) {
        console.error(`Erro ao gerar relatórios: ${error.message}`, error);
        showAlert('Erro ao gerar relatórios: ' + error.message, CONSTANTS.ALERT_TYPE_ERROR);
    }
}

/**
 * Atualiza os cards de KPI (Indicadores Chave) na aba de relatórios.
 * @param {Array<object>} transactions - As transações do período.
 */
function updateReportKPIs(transactions) {
    const {
        kpiTotalReceitas,
        kpiTotalDespesas,
        kpiSaldoLiquido
    } = appState.domElements;

    const stats = calculateStats(transactions);

    if (kpiTotalReceitas) {
        kpiTotalReceitas.textContent = formatCurrency(stats.totalReceitas);
    }
    if (kpiTotalDespesas) {
        kpiTotalDespesas.textContent = formatCurrency(stats.totalDespesas);
    }
    if (kpiSaldoLiquido) {
        kpiSaldoLiquido.textContent = formatCurrency(stats.saldo);
        kpiSaldoLiquido.classList.toggle('text-emerald-400', stats.saldo >= 0);
        kpiSaldoLiquido.classList.toggle('text-red-400', stats.saldo < 0);
        kpiSaldoLiquido.classList.toggle('text-sky-400', stats.saldo === 0); // Neutral color for zero
    }
}

// Palette for charts, adjusted for better visibility on dark background
const chartBackgroundColorPalette = [
    'rgba(56, 189, 248, 0.7)', // light-blue
    'rgba(52, 211, 153, 0.7)', // emerald
    'rgba(250, 204, 21, 0.7)', // yellow
    'rgba(251, 146, 60, 0.7)', // orange
    'rgba(248, 113, 113, 0.7)', // red
    'rgba(167, 139, 250, 0.7)', // purple
    'rgba(244, 114, 182, 0.7)', // pink
    'rgba(96, 165, 250, 0.7)', // blue
    'rgba(163, 230, 53, 0.7)', // lime
    'rgba(45, 212, 191, 0.7)', // teal
    'rgba(192, 132, 252, 0.7)', // fuchsia
    'rgba(253, 224, 71, 0.7)', // amber
    'rgba(253, 164, 46, 0.7)', // darker orange
    'rgba(100, 116, 139, 0.7)', // slate
    'rgba(236, 72, 153, 0.7)' // rose
];
const chartBorderColorPalette = chartBackgroundColorPalette.map(c => c.replace('0.7', '1')); // More opaque borders

/**
 * Cria o gráfico de Despesas por Categoria usando Chart.js.
 * @param {Array<object>} transactions - Dados das transações.
 * @param {CanvasRenderingContext2D} ctx - O contexto do canvas.
 * @param {string} chartType - 'doughnut' ou 'bar'.
 */
function createDespesasCategoriaChart(transactions, ctx, chartType = 'doughnut') {
    // NO INÍCIO da função createDespesasCategoriaChart, armazene as transações
    // Isso garante que o clique no gráfico tenha acesso a todas as transações do período do relatório.
    if (!appState.mainChartInstance) appState.mainChartInstance = {};
    appState.mainChartInstance.data = {
        transactions: transactions
    }; // <<< ADICIONADO


    const despesas = transactions.filter(t => t.tipo === CONSTANTS.TRANSACTION_TYPE_EXPENSE);
    const groupedData = despesas.reduce((acc, item) => {
        acc[item.categoria] = (acc[item.categoria] || 0) + item.valor;
        return acc;
    }, {});

    const labels = Object.entries(groupedData)
        .sort(([, a], [, b]) => b - a)
        .map(item => item[0]);
    const values = Object.entries(groupedData)
        .sort(([, a], [, b]) => b - a)
        .map(item => item[1]);

    appState.mainChartInstance = new Chart(ctx, {
        type: chartType,
        data: {
            labels: labels,
            datasets: [{
                label: 'Despesas',
                data: values,
                backgroundColor: chartBackgroundColorPalette,
                borderColor: chartType === 'doughnut' ? '#0f172a' : chartBorderColorPalette, // Dark background for doughnut border
                borderWidth: chartType === 'doughnut' ? 2 : 1,
                borderRadius: chartType === 'bar' ? 4 : 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: chartType === 'doughnut', // Show legend for doughnut
                    position: 'bottom',
                    labels: {
                        color: '#94a3b8' // slate-400
                    }
                },
                tooltip: {
                    backgroundColor: '#1e293b', // slate-800
                    titleFont: {
                        weight: 'bold'
                    },
                    // #################### INÍCIO DA CORREÇÃO APLICADA ####################
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (label) {
                                label += ': ';
                            }
                            // CORRIGIDO: Usa context.raw para pegar o valor numérico correto.
                            const value = context.raw || 0;

                            // Agora o valor é formatado corretamente em Reais.
                            label += formatCurrency(value);

                            return label;
                        }
                    }
                    // #################### FIM DA CORREÇÃO APLICADA ####################
                }
            },
            scales: chartType === 'bar' ? {
                x: {
                    beginAtZero: true,
                    ticks: {
                        color: '#94a3b8'
                    }, // slate-400
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    } // Light grid lines
                },
                y: {
                    ticks: {
                        color: '#94a3b8'
                    }, // slate-400
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    } // Light grid lines
                }
            } : {}, // No scales for doughnut chart
            // ===== ADICIONADO: Lógica de click para drill-down =====
            onClick: (e, elements) => {
                if (elements.length > 0) {
                    const clickedIndex = elements[0].index;
                    const clickedCategory = labels[clickedIndex]; // Pega o nome da categoria clicada
                    const reportCategoryFilter = appState.domElements.reportCategoriaFilter;

                    // Atualiza o filtro <select> da página
                    if (reportCategoryFilter) {
                        reportCategoryFilter.value = clickedCategory;
                        // Dispara o evento de mudança para que a página se atualize
                        reportCategoryFilter.dispatchEvent(new Event('change'));
                    }
                }
            }
            // ===== FIM DA ADIÇÃO =====
        }
    });
}
/**
 * Cria o gráfico de Evolução Mensal (Receitas vs. Despesas) usando Chart.js.
 * @param {Array<object>} transactions - Dados das transações.
 * @param {CanvasRenderingContext2D} ctx - O contexto do canvas.
 */
function createEvolucaoMensalChart(transactions, ctx) {
    const dadosPorMes = {}; // Stores { 'YYYY-MM': { receitas: X, despesas: Y } }
    transactions.forEach(t => {
        const mesAno = t.data.substring(0, 7); // 'YYYY-MM'
        if (!dadosPorMes[mesAno]) {
            dadosPorMes[mesAno] = {
                receitas: 0,
                despesas: 0
            };
        }
        if (t.tipo === CONSTANTS.TRANSACTION_TYPE_INCOME) {
            dadosPorMes[mesAno].receitas += t.valor;
        } else {
            dadosPorMes[mesAno].despesas += t.valor;
        }
    });

    const labels = Object.keys(dadosPorMes).sort(); // Sort months chronologically
    const receitasData = labels.map(mes => dadosPorMes[mes].receitas);
    const despesasData = labels.map(mes => dadosPorMes[mes].despesas);

    appState.mainChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Receitas',
                data: receitasData,
                borderColor: 'rgba(52, 211, 153, 1)', // emerald-400
                backgroundColor: 'rgba(52, 211, 153, 0.2)',
                fill: true,
                tension: 0.3 // Smooth lines
            }, {
                label: 'Despesas',
                data: despesasData,
                borderColor: 'rgba(248, 113, 113, 1)', // red-400
                backgroundColor: 'rgba(248, 113, 113, 0.2)',
                fill: true,
                tension: 0.3 // Smooth lines
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#94a3b8' // slate-400
                    }
                },
                tooltip: {
                    backgroundColor: '#1e293b', // slate-800
                    titleFont: {
                        weight: 'bold'
                    },
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += formatCurrency(context.parsed.y); // Usando formatCurrency
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#94a3b8'
                    }, // slate-400
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#94a3b8'
                    }, // slate-400
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
}

/**
 * Cria o gráfico de Transações por Meio de Pagamento usando Chart.js.
 * @param {Array<object>} transactions - Dados das transações.
 * @param {CanvasRenderingContext2D} ctx - O contexto do canvas.
 * @param {string} chartType - 'doughnut' ou 'bar'.
 */
function createTransacoesMeioChart(transactions, ctx, chartType = 'doughnut') {
    const groupedData = transactions.reduce((acc, item) => {
        const meio = formatMeio(item.meio); // Use friendly name for display
        acc[meio] = (acc[meio] || 0) + item.valor;
        return acc;
    }, {});

    // Sort data from highest to lowest value
    const sortedData = Object.entries(groupedData).sort(([, a], [, b]) => b - a);
    const labels = sortedData.map(item => item[0]);
    const values = sortedData.map(item => item[1]);

    appState.mainChartInstance = new Chart(ctx, {
        type: chartType,
        data: {
            labels: labels,
            datasets: [{
                label: 'Valor por Meio',
                data: values,
                backgroundColor: chartBackgroundColorPalette,
                borderColor: chartType === 'doughnut' ? '#0f172a' : chartBorderColorPalette,
                borderWidth: chartType === 'doughnut' ? 2 : 1,
                borderRadius: chartType === 'bar' ? 4 : 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: chartType === 'doughnut', // Show legend for doughnut
                    position: 'bottom',
                    labels: {
                        color: '#94a3b8'
                    }
                },
                tooltip: {
                    backgroundColor: '#1e293b',
                    titleFont: {
                        weight: 'bold'
                    },
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.value !== null) {
                                label += formatCurrency(context.parsed.value); // Usando formatCurrency
                            }
                            return label;
                        }
                    }
                }
            },
            scales: chartType === 'bar' ? {
                x: {
                    ticks: {
                        color: '#94a3b8'
                    }, // slate-400
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#94a3b8'
                    }, // slate-400
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            } : {}
        }
    });
}

/**
 * Renderiza o gráfico de Top 10 Categorias por Gasto.
 * @param {Array<object>} transactions - As transações do período.
 */
function renderTopCategoriasChart(transactions) {
    const ctx = document.getElementById('top-categorias-chart')?.getContext('2d');
    if (!ctx) return; // Se o elemento não estiver na tela, não faz nada

    // 1. Agrupar e somar gastos por categoria
    const despesas = transactions.filter(t => t.tipo === CONSTANTS.TRANSACTION_TYPE_EXPENSE);
    const groupedData = despesas.reduce((acc, item) => {
        acc[item.categoria] = (acc[item.categoria] || 0) + item.valor;
        return acc;
    }, {});

    // 2. Ordenar, pegar o top 10 e preparar para o gráfico
    const sortedData = Object.entries(groupedData).sort(([, a], [, b]) => b - a).slice(0, 10);
    const labels = sortedData.map(item => item[0]);
    const values = sortedData.map(item => item[1]);

    // 3. Renderizar o gráfico (lógica adaptada de 'analisar cartão.html')
    if (appState.topCategoriasChartInstance) {
        appState.topCategoriasChartInstance.destroy();
    }

    appState.topCategoriasChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                data: values,
                backgroundColor: chartBackgroundColorPalette, // Reutiliza a paleta de cores existente
                borderColor: chartBorderColorPalette,
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            indexAxis: 'y', // Gráfico de barras horizontais
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        color: '#94a3b8'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    ticks: {
                        color: '#94a3b8'
                    },
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: '#1e293b',
                    titleFont: {
                        weight: 'bold'
                    },
                    callbacks: {
                        label: c => ` ${formatCurrency(c.raw)}` // Usando formatCurrency
                    }
                }
            }
        }
    });
}

/**
 * Cria ou atualiza o gráfico de Evolução Mensal para uma Categoria Específica.
 * @param {Array<object>} transactions - Todas as transações do período do relatório.
 * @param {string} selectedCategory - A categoria para a qual o gráfico será gerado.
 */
function renderEvolucaoMensalPorCategoria(transactions, selectedCategory) {
    const ctx = document.getElementById('evolucao-mensal-categoria-chart')?.getContext('2d');
    if (!ctx) return;

    if (appState.evolucaoMensalCategoriaChartInstance) { // Usando appState para a instância
        appState.evolucaoMensalCategoriaChartInstance.destroy();
    }

    // Se nenhuma categoria for selecionada, não renderiza o gráfico.
    if (!selectedCategory || selectedCategory === 'all') {
        return;
    }

    // 1. Filtrar transações apenas para a categoria e tipo de despesa selecionados
    const despesasDaCategoria = transactions.filter(t =>
        t.tipo === CONSTANTS.TRANSACTION_TYPE_EXPENSE && t.categoria === selectedCategory
    );

    // 2. Agrupar os gastos por mês (YYYY-MM)
    const gastosPorMes = despesasDaCategoria.reduce((acc, t) => {
        const mes = t.data.substring(0, 7); // Extrai 'YYYY-MM'
        acc[mes] = (acc[mes] || 0) + t.valor;
        return acc;
    }, {});

    const meses = Object.keys(gastosPorMes).sort();
    const labels = meses.map(m => new Date(m + '-02').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }));
    const data = meses.map(m => gastosPorMes[m]);

    // 3. Renderizar o gráfico de linha
    appState.evolucaoMensalCategoriaChartInstance = new Chart(ctx, { // Usando appState para a instância
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `Gastos em ${selectedCategory}`,
                data: data,
                borderColor: '#38bdf8', // sky-400
                backgroundColor: 'rgba(56, 189, 248, 0.2)',
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { color: '#94a3b8' } },
                tooltip: {
                    callbacks: { label: c => `${c.dataset.label}: ${formatCurrency(c.raw)}` }
                }
            },
            scales: {
                y: { ticks: { color: '#94a3b8', callback: value => formatCurrency(value) } },
                x: { ticks: { color: '#94a3b8' } }
            }
        }
    });
}


/**
 * Atualiza a tabela de detalhes na aba de relatórios com as transações fornecidas.
 * @param {Array<object>} transactions - As transações a serem exibidas. Se não fornecido, usa o último conjunto de transações armazenado.
 */
function updateReportTransactionsTable(transactions) {
    // Armazena a lista completa de transações para que o campo de busca possa sempre filtrar o conjunto original.
    // Se a função for chamada sem um novo array 'transactions', ela usa o último armazenado.
    if (transactions) {
        appState.currentReportTableTransactions = transactions;
    } else {
        transactions = appState.currentReportTableTransactions;
    }

    const {
        reportDetailsTableBody,
        reportSearchInput
    } = appState.domElements;
    if (!reportDetailsTableBody) return;

    const searchTerm = reportSearchInput ? reportSearchInput.value.toLowerCase() : '';
    const filteredTransactions = searchTerm ?
        transactions.filter(t => t.descricao.toLowerCase().includes(searchTerm)) :
        transactions;

    reportDetailsTableBody.innerHTML = ''; // Limpa a tabela
    if (filteredTransactions.length === 0) {
        reportDetailsTableBody.innerHTML = `<tr><td colspan="4" class="text-center p-4 text-slate-500">Nenhuma transação para exibir.</td></tr>`;
        return;
    }

    const fragment = document.createDocumentFragment();
    // Ordena as transações por data, da mais recente para a mais antiga
    filteredTransactions.sort((a, b) => new Date(b.data) - new Date(a.data));

    filteredTransactions.forEach(t => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-slate-800';
        row.innerHTML = `
            <td class="p-3 text-sm">${formatDisplayDate(t.data)}</td>
            <td class="p-3 text-sm">${t.descricao}</td>
            <td class="p-3 text-sm">${t.subcategoria || '-'}</td>
            <td class="p-3 text-sm text-right font-medium ${t.tipo === 'receita' ? 'text-emerald-400' : 'text-red-400'}">
                ${formatCurrency(t.valor)}
            </td>
        `;
        fragment.appendChild(row);
    });
    reportDetailsTableBody.appendChild(fragment);
}


/**
 * Exporta o relatório atual para um arquivo Excel.
 */
async function exportReportToExcel() {
    try {
        console.log('Exportando relatório para Excel...');
        const {
            reportDataInicioInput,
            reportDataFimInput
        } = appState.domElements;
        const reportTransactions = await getFilteredTransactionsForReports(
            reportDataInicioInput ? reportDataInicioInput.value : null,
            reportDataFimInput ? reportDataFimInput.value : null
        );
        if (reportTransactions.length === 0) {
            showAlert('Nenhuma transação para exportar neste período.', CONSTANTS.ALERT_TYPE_ERROR);
            return;
        }
        const headers = ['Data', 'Tipo', 'Categoria', 'Subcategoria', 'Descrição', 'Valor', 'Meio'];
        const data = reportTransactions.map(t => {
            let description = t.descricao;
            return [formatDisplayDate(t.data), t.tipo.toUpperCase(), t.categoria, t.subcategoria, description, t.valor, formatMeio(t.meio)];
        });
        const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Relatorio Financeiro");
        XLSX.writeFile(wb, `relatorio_financeiro_${new Date().toISOString().split('T')[0]}.xlsx`);
        showAlert('Relatório exportado para Excel com sucesso!', CONSTANTS.ALERT_TYPE_SUCCESS);
    } catch (error) {
        console.error(`Erro ao exportar relatório para Excel: ${error.message}`, error);
        showAlert('Erro ao exportar relatório para Excel: ' + error.message, CONSTANTS.ALERT_TYPE_ERROR);
    }
}

/**
 * Exporta o relatório atual para um arquivo PDF.
 */
async function exportReportToPdf() {
    try {
        console.log('Exportando relatório para PDF...');
        const {
            jspdf
        } = window.jspdf;
        const doc = new jspdf.jsPDF();
        const {
            reportDataInicioInput,
            reportDataFimInput
        } = appState.domElements;
        const reportTransactions = await getFilteredTransactionsForReports(
            reportDataInicioInput ? reportDataInicioInput.value : null,
            reportDataFimInput ? reportDataFimInput.value : null
        );
        if (reportTransactions.length === 0) {
            showAlert('Nenhuma transação para exportar neste período.', CONSTANTS.ALERT_TYPE_ERROR);
            return;
        }
        const headers = [
            ['Data', 'Tipo', 'Categoria', 'Subcategoria', 'Descrição', 'Valor (R$)', 'Meio']
        ];
        const data = reportTransactions.map(t => {
            let description = t.descricao;
            return [formatDisplayDate(t.data), t.tipo.toUpperCase(), t.categoria, t.subcategoria, description, formatCurrency(t.valor), formatMeio(t.meio)];
        });
        doc.text("Relatório Financeiro Doméstico", 14, 20);
        doc.autoTable({
            startY: 30,
            head: headers,
            body: data,
            theme: 'striped',
            styles: {
                fontSize: 8,
                cellPadding: 2,
                halign: 'left'
            },
            headStyles: {
                fillColor: [44, 62, 80],
                textColor: [255, 255, 255],
                fontStyle: 'bold'
            },
            columnStyles: {
                5: {
                    halign: 'right'
                }
            }, // Right-align value column
            margin: {
                top: 25,
                right: 10,
                bottom: 10,
                left: 10
            },
            didParseCell: function(data) {
                // Apply color to value column based on transaction type
                if (data.section === 'body' && data.column.index === 5) {
                    const transaction = reportTransactions[data.row.index];
                    if (transaction && transaction.tipo === CONSTANTS.TRANSACTION_TYPE_INCOME) {
                        data.cell.styles.textColor = [40, 167, 69]; // Green for income
                    } else if (transaction && transaction.tipo === CONSTANTS.TRANSACTION_TYPE_EXPENSE) {
                        data.cell.styles.textColor = [176, 0, 32]; // Red for expense
                    }
                }
            }
        });
        doc.save(`relatorio_financeiro_${new Date().toISOString().split('T')[0]}.pdf`);
        showAlert('Relatório exportado para PDF com sucesso!', CONSTANTS.ALERT_TYPE_SUCCESS);
    } catch (error) {
        console.error(`Erro ao exportar relatório para PDF: ${error.message}`, error);
        showAlert('Erro ao exportar relatório para PDF: ' + error.message, CONSTANTS.ALERT_TYPE_ERROR);
    }
}

/**
 * Obtém transações filtradas por data para relatórios.
 * @param {string} dataInicio - Data de início do período (YYYY-MM-DD).
 * @param {string} dataFim - Data de fim do período (YYYY-MM-DD).
 * @returns {Promise<Array<object>>} Array de transações para o período.
 */
async function getFilteredTransactionsForReports(dataInicio, dataFim) {
    console.log(`Buscando transações para relatório entre '${dataInicio}' e '${dataFim}'`);

    const isDataInicioValid = dataInicio && typeof dataInicio === 'string' && dataInicio.trim() !== '';
    const isDataFimValid = dataFim && typeof dataFim === 'string' && dataFim.trim() !== '';
    const categoria = appState.domElements.reportCategoriaFilter ? appState.domElements.reportCategoriaFilter.value : 'all'; // ADICIONADO: Pega o filtro de categoria

    try {
        let query = db.transactions.toCollection();

        if (isDataInicioValid && isDataFimValid) {
            query = query.where('data').between(dataInicio, dataFim, true, true);
        } else if (isDataInicioValid) {
            query = query.where('data').aboveOrEqual(dataInicio);
        } else if (isDataFimValid) {
            query = query.where('data').belowOrEqual(dataFim);
        }

        let transactions = await query.toArray();

        // Aplica o filtro de categoria APÓS a busca no banco
        if (categoria && categoria !== 'all') {
            transactions = transactions.filter(t => t.categoria === categoria);
        }

        return transactions;
    } catch (error) {
        console.error("Erro na consulta de transações para relatórios:", error);
        showAlert('Ocorreu um erro ao buscar os dados para o relatório.', CONSTANTS.ALERT_TYPE_ERROR);
        return [];
    }
}


/**
 * Atualiza as estatísticas gerais do sistema na aba de configurações.
 */
async function updateSystemStats() {
    try {
        const {
            systemStats
        } = appState.domElements;
        const totalTransacoes = await db.transactions.count();
        const totalReceitas = await db.transactions.where('tipo').equals(CONSTANTS.TRANSACTION_TYPE_INCOME).count();
        const totalDespesas = await db.transactions.where('tipo').equals(CONSTANTS.TRANSACTION_TYPE_EXPENSE).count();

        // Estimate data size
        const allTransactions = await db.transactions.toArray();
        const allSettings = await db.appSettings.toArray();
        const dataSize = (JSON.stringify(allTransactions).length + JSON.stringify(allSettings).length) / 1024; // in KB

        if (systemStats) {
            systemStats.innerHTML = `
                <div class="bg-slate-700 p-4 rounded-lg shadow-md">
                    <div class="text-white text-3xl font-bold mb-1 neutral">${totalTransacoes}</div>
                    <div class="text-slate-400 text-sm">Total de Transações Registradas</div>
                </div>
                <div class="bg-slate-700 p-4 rounded-lg shadow-md">
                    <div class="text-white text-3xl font-bold mb-1 positive">${formatCurrency(totalReceitas)}</div>
                    <div class="text-slate-400 text-sm">Total de Receitas Registradas</div>
                </div>
                <div class="bg-slate-700 p-4 rounded-lg shadow-md">
                    <div class="text-white text-3xl font-bold mb-1 negative">${formatCurrency(totalDespesas)}</div>
                    <div class="text-slate-400 text-sm">Total de Despesas Registradas</div>
                </div>
                <div class="bg-slate-700 p-4 rounded-lg shadow-md">
                    <div class="text-white text-3xl font-bold mb-1 neutral">${dataSize.toFixed(2)} KB</div>
                    <div class="text-slate-400 text-sm">Tamanho dos Dados (Estimado)</div>
                </div>
            `;
        }
    } catch (error) {
        console.error(`Erro ao atualizar estatísticas do sistema: ${error.message}`, error);
        showAlert('Erro ao carregar estatísticas do sistema.', CONSTANTS.ALERT_TYPE_ERROR);
    }
}

// ==================== EXPORTAÇÃO E IMPORTAÇÃO DE DADOS COMPLETOS ====================
/**
 * Exporta todos os dados da aplicação para um arquivo JSON.
 * Inclui transações, categorias personalizadas e IDs da última importação.
 */
async function exportData() {
    try {
        console.log('Exportando dados de backup...');
        showLoading();
        const allTransactions = await db.transactions.toArray();
        const currentSettings = await db.appSettings.get('generalSettings'); // Retrieve all app settings

        const dataToExport = {
            transactions: allTransactions,
            appSettings: currentSettings, // Export the entire settings object
            exportDate: new Date().toISOString(),
            version: '1.0.0_financial_control_system_backup' // Custom version for compatibility
        };
        const dataStr = JSON.stringify(dataToExport, null, 2); // Pretty print JSON
        const dataBlob = new Blob([dataStr], {
            type: 'application/json'
        });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `financeiro_backup_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(link.href); // Clean up the URL object
        showAlert('Dados de backup exportado com sucesso!', CONSTANTS.ALERT_TYPE_SUCCESS);
    } catch (error) {
        console.error(`Erro ao exportar dados de backup: ${error.message}`, error);
        showAlert('Erro ao exportar dados de backup: ' + error.message, CONSTANTS.ALERT_TYPE_ERROR);
    } finally {
        hideLoading();
    }
}

/**
 * Importa dados de um arquivo JSON.
 * Irá substituir todos os dados existentes (transações e configurações).
 */
async function importData() {
    try {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json'; // Only accept JSON files
        input.onchange = async (event) => {
            if (!event.target.files || event.target.files.length === 0) {
                showAlert('Nenhum arquivo selecionado.', CONSTANTS.ALERT_TYPE_INFO);
                return;
            }
            const file = event.target.files[0];

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedData = JSON.parse(e.target.result);
                    // Basic validation for expected structure
                    if (!importedData.transactions || !importedData.appSettings) {
                        throw new Error('Arquivo JSON inválido ou não contém os dados esperados (transações e configurações).');
                    }

                    openConfirmationModal(
                        'Confirmar Importação de Backup',
                        'Atenção: Isso substituirá TODAS as suas transações e configurações atuais pelos dados do arquivo. Esta ação não pode ser desfeita. Deseja continuar?',
                        async () => { // onConfirm callback
                            showLoading();
                            try {
                                // Use Dexie transaction for atomic operation
                                await db.transaction('rw', db.transactions, db.appSettings, async () => {
                                    await db.transactions.clear(); // Clear existing transactions
                                    await db.appSettings.clear(); // Clear existing settings

                                    // Bulk add imported data
                                    await db.transactions.bulkAdd(importedData.transactions);
                                    await db.appSettings.put(importedData.appSettings);

                                    // Update appState with imported settings immediately
                                    appState.categoriesData = importedData.appSettings.categoriesData || DEFAULT_CATEGORIES_DATA;
                                    appState.lastImportedTransactionIds = importedData.appSettings.lastImportedTransactionIds || [];
                                });
                                showAlert('Dados importados com sucesso! O sistema será recarregado para aplicar as alterações.', CONSTANTS.ALERT_TYPE_SUCCESS);
                                // Substituído window.location.reload()
                                loadTransactions();
                                generateReports();
                                updateFilterCategories();
                                updateSystemStats();
                                hideLoading(); // Esconder loading após as atualizações
                            } catch (dbError) {
                                console.error('Erro ao salvar dados importados no banco:', dbError);
                                showAlert(`Erro ao importar dados: ${dbError.message}`, CONSTANTS.ALERT_TYPE_ERROR);
                                hideLoading();
                            }
                        }
                    );
                } catch (parseError) {
                    console.error('Erro ao processar o arquivo JSON:', parseError);
                    showAlert(`Erro ao ler o arquivo JSON: ${parseError.message}`, CONSTANTS.ALERT_TYPE_ERROR);
                }
            };
            reader.onerror = () => {
                showAlert('Não foi possível ler o arquivo selecionado.', CONSTANTS.ALERT_TYPE_ERROR);
            };
            reader.readAsText(file); // Read file as text
        };
        input.click(); // Trigger file input click programmatically
    } catch (error) {
        console.error('Erro na função importData:', error);
        showAlert(`Ocorreu um erro inesperado durante a importação: ${error.message}`, CONSTANTS.ALERT_TYPE_ERROR);
    }
}

/**
 * Limpa todos os dados do aplicativo (transações e configurações) após confirmação.
 */
async function clearAllData() {
    openConfirmationModal(
        'Limpar Todos os Dados',
        'Você tem CERTEZA de que deseja apagar TODAS as transações e configurações? Esta ação é IRREVERSÍVEL.',
        async () => { // onConfirm callback
            showLoading();
            try {
                await db.delete(); // This deletes the entire database
                showAlert('Todos os dados foram apagados. A página será recarregada.', CONSTANTS.ALERT_TYPE_SUCCESS);
                // Substituído window.location.reload()
                // Após db.delete(), o estado do Dexie.js pode ser inconsistente,
                // um reload completo ainda é a forma mais segura de reinicializar o banco do zero.
                // No entanto, para seguir o roteiro, as chamadas de atualização de UI são abaixo.
                // Se o sistema ainda apresentar problemas após limpar tudo, considere um window.location.reload() aqui.
                loadTransactions();
                generateReports();
                updateFilterCategories();
                updateSystemStats();
                hideLoading();
            } catch (error) {
                console.error('Erro ao limpar todos os dados:', error);
                showAlert(`Erro ao limpar dados: ${error.message}`, CONSTANTS.ALERT_TYPE_ERROR);
                hideLoading();
            }
        }
    );
}

// ==================== FUNÇÕES DE REVISÃO DE IMPORTAÇÃO ====================

/**
 * Abre o modal de revisão de importação e preenche a tabela.
 * @param {Array<object>} transactions - As transações a serem revisadas.
 */
function openReviewModal(transactions) {
    const {
        importReviewModal,
        reviewCountSpan
    } = appState.domElements;
    if (importReviewModal) {
        openModal('importReviewModal');
        updateReviewTable(transactions);
        if (reviewCountSpan) reviewCountSpan.textContent = transactions.length;
    }
}

/**
 * Atualiza a tabela de revisão de importação com as transações fornecidas.
 * @param {Array<object>} transactions - As transações a serem exibidas na tabela de revisão.
 */
function updateReviewTable(transactions) {
    const {
        reviewTableBody,
        reviewMasterCheckbox
    } = appState.domElements;
    if (!reviewTableBody) return;

    reviewTableBody.innerHTML = '';
    reviewMasterCheckbox.checked = false; // Reset master checkbox

    transactions.forEach((t, index) => {
        const row = reviewTableBody.insertRow();
        row.dataset.index = index; // Store original index for updates
        if (t.needsReview) {
            row.classList.add('needs-review');
        }

        const checkboxCell = row.insertCell();
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'review-checkbox h-4 w-4';
        checkbox.checked = true; // All are selected by default for import
        checkbox.addEventListener('change', updateReviewSelectedCount);
        checkboxCell.appendChild(checkbox);

        const dataCell = row.insertCell();
        const dataInput = document.createElement('input');
        dataInput.type = 'date';
        dataInput.value = t.data;
        dataInput.className = 'w-full bg-slate-700 border-slate-600 rounded-md p-1 text-sm';
        dataInput.name = 'data'; // Adicionado name
        // REMOVIDO: dataInput.addEventListener('change', (e) => { t.data = e.target.value; updateReviewRowNeedsReview(row, t); });
        dataCell.appendChild(dataInput);

        const tipoCell = row.insertCell();
        const tipoSelect = document.createElement('select');
        tipoSelect.className = 'w-full bg-slate-700 border-slate-600 rounded-md p-1 text-sm';
        tipoSelect.name = 'tipo'; // Adicionado name
        tipoSelect.setAttribute('data-field', 'tipo'); // Adicionado data-field
        tipoSelect.innerHTML = `<option value="receita">Receita</option><option value="despesa">Despesa</option>`;
        tipoSelect.value = t.tipo;
        // REMOVIDO: tipoSelect.addEventListener('change', (e) => { t.tipo = e.target.value; updateReviewRowNeedsReview(row, t); });
        tipoCell.appendChild(tipoSelect);

        const categoriaCell = row.insertCell();
        const categoriaSelect = document.createElement('select');
        categoriaSelect.className = 'w-full bg-slate-700 border-slate-600 rounded-md p-1 text-sm review-category-select'; // Adicionado review-category-select
        categoriaSelect.name = 'categoria'; // Adicionado name
        // Populate categories for this specific row
        let categoryOptionsHTML = '<option value="">Selecione</option>';
        if (appState.categoriesData[t.tipo]) {
            Object.keys(appState.categoriesData[t.tipo]).sort().forEach(cat => {
                categoryOptionsHTML += `<option value="${cat}">${cat}</option>`;
            });
        }
        categoriaSelect.innerHTML = categoryOptionsHTML;
        categoriaSelect.value = t.categoria;
        // REMOVIDO: categoriaSelect.addEventListener('change', (e) => { /* ... */ });
        categoriaCell.appendChild(categoriaSelect);


        const subcategoriaCell = row.insertCell();
        const subcategoriaSelect = document.createElement('select'); // Changed to select for predefined
        subcategoriaSelect.className = 'w-full bg-slate-700 border-slate-600 rounded-md p-1 text-sm review-subcategory-select'; // Adicionado review-subcategory-select
        subcategoriaSelect.name = 'subcategoria'; // Adicionado name
        let subcatOptionsHTML = '<option value="">Selecione</option>';
        if (appState.categoriesData[t.tipo] && appState.categoriesData[t.tipo][t.categoria]) {
            appState.categoriesData[t.tipo][t.categoria].sort().forEach(sub => {
                subcatOptionsHTML += `<option value="${sub}">${sub}</option>`;
            });
        }
        subcategoriaSelect.innerHTML = subcatOptionsHTML;
        subcategoriaSelect.value = t.subcategoria;
        // REMOVIDO: subcategoriaSelect.addEventListener('change', (e) => { t.subcategoria = e.target.value; updateReviewRowNeedsReview(row, t); });
        subcategoriaCell.appendChild(subcategoriaSelect);


        const descricaoCell = row.insertCell();
        const descricaoInput = document.createElement('input');
        descricaoInput.type = 'text';
        descricaoInput.value = t.descricao;
        descricaoInput.className = 'w-full bg-slate-700 border-slate-600 rounded-md p-1 text-sm';
        descricaoInput.name = 'descricao'; // Adicionado name
        // REMOVIDO: descricaoInput.addEventListener('change', (e) => { t.descricao = e.target.value; updateReviewRowNeedsReview(row, t); });
        descricaoCell.appendChild(descricaoInput);

        const valorCell = row.insertCell();
        const valorInput = document.createElement('input');
        valorInput.type = 'text';
        valorInput.value = formatFloatToBrazilianCurrencyString(t.valor);
        valorInput.className = 'w-full bg-slate-700 border-slate-600 rounded-md p-1 text-sm';
        valorInput.name = 'valor'; // Adicionado name
        // REMOVIDO: valorInput.addEventListener('blur', (e) => { /* ... */ });
        // REMOVIDO: valorInput.addEventListener('input', (e) => { /* ... */ });
        valorCell.appendChild(valorInput);

        const meioCell = row.insertCell();
        const meioSelect = document.createElement('select');
        meioSelect.className = 'w-full bg-slate-700 border-slate-600 rounded-md p-1 text-sm';
        meioSelect.name = 'meio'; // Adicionado name
        meioSelect.setAttribute('data-field', 'meio'); // Adicionado data-field
        meioSelect.innerHTML = `
            <option value="pix">PIX</option>
            <option value="cartao_credito">Cartão de Crédito</option>
            <option value="debito">Débito</option>
            <option value="dinheiro">Dinheiro</option>
            <option value="boleto">Boleto</option>
            <option value="transferencia">Transferência</option>
            <option value="outros">Outros</option>
        `;
        meioSelect.value = t.meio;
        // REMOVIDO: meioSelect.addEventListener('change', (e) => { t.meio = e.target.value; updateReviewRowNeedsReview(row, t); });
        meioCell.appendChild(meioSelect);

        const actionCell = row.insertCell();
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-sm bg-red-600 hover:bg-red-700 text-white p-1 rounded-md text-xs delete-review-row-btn'; // Adicionado delete-review-row-btn
        deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
        deleteBtn.title = 'Remover desta importação';
        // REMOVIDO: deleteBtn.onclick = () => { /* ... */ }; // Manipulado por delegação
        actionCell.appendChild(deleteBtn);
    });
    updateReviewSelectedCount(); // Initial count update
    // Update master checkbox based on all checkboxes being checked (by default)
    if (transactions.length > 0) {
        reviewMasterCheckbox.checked = true;
        reviewMasterCheckbox.indeterminate = false;
    } else {
        reviewMasterCheckbox.checked = false;
        reviewMasterCheckbox.indeterminate = false;
    }
}

/**
 * Atualiza o status de `needsReview` de uma transação na tabela de revisão e a classe da linha.
 * @param {HTMLTableRowElement} row - A linha da tabela HTML.
 * @param {object} transaction - O objeto de transação associado à linha.
 */
function updateReviewRowNeedsReview(row, transaction) {
    // Re-evaluate needsReview based on current values in the transaction object
    transaction.needsReview = (
        isNaN(new Date(transaction.data).getTime()) || // Invalid Date
        !transaction.categoria || transaction.categoria === CONSTANTS.UNCATEGORIZED || // No category or uncategorized
        !transaction.subcategoria || transaction.subcategoria === '' || // No subcategory
        !transaction.meio || transaction.meio === 'outros' || // No payment method or 'outros'
        isNaN(transaction.valor) || transaction.valor <= 0 // Adicionado: Valor inválido ou zero
    );
    if (transaction.needsReview) {
        row.classList.add('needs-review');
    } else {
        row.classList.remove('needs-review');
    }
}

/**
 * Atualiza a contagem de transações selecionadas no modal de revisão.
 */
function updateReviewSelectedCount() {
    const {
        reviewCountSpan,
        reviewMasterCheckbox
    } = appState.domElements;
    const checkboxes = document.querySelectorAll('#reviewTableBody .review-checkbox');
    const checkedCheckboxes = document.querySelectorAll('#reviewTableBody .review-checkbox:checked');

    if (reviewCountSpan) reviewCountSpan.textContent = checkedCheckboxes.length;

    // Update master checkbox state
    if (checkboxes.length === 0) {
        reviewMasterCheckbox.checked = false;
        reviewMasterCheckbox.indeterminate = false;
    } else if (checkedCheckboxes.length === checkboxes.length) {
        reviewMasterCheckbox.checked = true;
        reviewMasterCheckbox.indeterminate = false;
    } else if (checkedCheckboxes.length > 0) {
        reviewMasterCheckbox.checked = false;
        reviewMasterCheckbox.indeterminate = true;
    } else {
        reviewMasterCheckbox.checked = false;
        reviewMasterCheckbox.indeterminate = false;
    }
}

/**
 * Marca/desmarca todos os checkboxes no modal de revisão.
 */
function toggleAllReviewCheckboxes() {
    const {
        reviewMasterCheckbox
    } = appState.domElements;
    const checkboxes = document.querySelectorAll('#reviewTableBody .review-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = reviewMasterCheckbox.checked;
    });
    updateReviewSelectedCount();
}

/**
 * Aplica as alterações em massa (Tipo e Meio) às transações selecionadas no modal de revisão.
 */
function applyBulkReviewChanges() {
    const {
        reviewBulkTipoSelect,
        reviewBulkMeioSelect
    } = appState.domElements;
    const bulkTipo = reviewBulkTipoSelect.value;
    const bulkMeio = reviewBulkMeioSelect.value;

    if (!bulkTipo && !bulkMeio) {
        showAlert('Selecione um tipo ou meio para aplicar em massa.', CONSTANTS.ALERT_TYPE_ERROR);
        return;
    }

    const checkboxes = document.querySelectorAll('#reviewTableBody .review-checkbox:checked');
    if (checkboxes.length === 0) {
        showAlert('Nenhuma transação selecionada para aplicar alterações em massa.', CONSTANTS.ALERT_TYPE_ERROR);
        return;
    }

    let changedCount = 0;
    checkboxes.forEach(checkbox => {
        const row = checkbox.closest('tr');
        const index = parseInt(row.dataset.index);
        const transaction = appState.transactionsToReview[index];

        if (bulkTipo && transaction.tipo !== bulkTipo) {
            transaction.tipo = bulkTipo;
            const tipoEl = row.querySelector('[name="tipo"]');
            if (tipoEl) tipoEl.value = bulkTipo;

            // Update category and subcategory selects based on new type
            const categoriaEl = row.querySelector('[name="categoria"]');
            const subcategoriaEl = row.querySelector('[name="subcategoria"]');

            let categoryOptionsHTML = '<option value="">Selecione</option>';
            if (appState.categoriesData[transaction.tipo]) {
                Object.keys(appState.categoriesData[transaction.tipo]).sort().forEach(cat => {
                    categoryOptionsHTML += `<option value="${cat}">${cat}</option>`;
                });
            }
            if (categoriaEl) {
                categoriaEl.innerHTML = categoryOptionsHTML;
                // Try to keep the category if it's still valid for the new type, otherwise clear
                if (appState.categoriesData[transaction.tipo] && Object.keys(appState.categoriesData[transaction.tipo]).includes(transaction.categoria)) {
                    categoriaEl.value = transaction.categoria;
                } else {
                    transaction.categoria = CONSTANTS.UNCATEGORIZED;
                    categoriaEl.value = '';
                }
            }


            let subcatOptionsHTML = '<option value="">Selecione</option>';
            if (appState.categoriesData[transaction.tipo] && appState.categoriesData[transaction.tipo][transaction.categoria]) {
                appState.categoriesData[transaction.tipo][transaction.categoria].sort().forEach(sub => {
                    subcatOptionsHTML += `<option value="${sub}">${sub}</option>`;
                });
            }
            if (subcategoriaEl) {
                subcategoriaEl.innerHTML = subcatOptionsHTML;
                // Try to keep the subcategory if it's still valid for the new type/category, otherwise clear
                if (appState.categoriesData[transaction.tipo] && appState.categoriesData[transaction.tipo][transaction.categoria] && appState.categoriesData[transaction.tipo][transaction.categoria].includes(transaction.subcategoria)) {
                    subcategoriaEl.value = transaction.subcategoria;
                } else {
                    transaction.subcategoria = '';
                    subcategoriaEl.value = '';
                }
            }

            changedCount++;
        }
        if (bulkMeio && transaction.meio !== bulkMeio) {
            transaction.meio = bulkMeio;
            const meioEl = row.querySelector('[name="meio"]');
            if (meioEl) meioEl.value = bulkMeio;
            changedCount++;
        }
        updateReviewRowNeedsReview(row, transaction); // Re-evaluate needsReview for the row
    });

    if (changedCount > 0) {
        showAlert(`${changedCount} transação(ões) atualizada(s) em massa!`, CONSTANTS.ALERT_TYPE_SUCCESS);
    } else {
        showAlert('Nenhuma alteração aplicada.', CONSTANTS.ALERT_TYPE_INFO);
    }
}

/**
 * Confirma a importação das transações revisadas para o banco de dados.
 */
async function confirmImportFromReviewModal() {
    const selectedTransactions = appState.transactionsToReview.filter((t, index) => {
        const checkbox = document.querySelector(`#reviewTableBody tr[data-index="${index}"] .review-checkbox`);
        return checkbox && checkbox.checked;
    });

    if (selectedTransactions.length === 0) {
        showAlert('Selecione ao menos uma transação para importar.', CONSTANTS.ALERT_TYPE_ERROR);
        return;
    }

    const transactionsNeedingReview = selectedTransactions.filter(t => t.needsReview);
    if (transactionsNeedingReview.length > 0) {
        showAlert(`Ainda há ${transactionsNeedingReview.length} transação(ões) marcadas para revisão. Por favor, corrija-as ou desmarque-as antes de importar.`, CONSTANTS.ALERT_TYPE_ERROR);
        return;
    }

    showLoading();
    try {
        // Assign unique IDs to new transactions
        const transactionsToImport = selectedTransactions.map(t => ({
            ...t,
            id: generateUniqueId(), // Usar generateUniqueId() aqui
            dataCreated: new Date().toISOString()
        }));

        await db.transactions.bulkAdd(transactionsToImport); // Add all selected and reviewed transactions
        appState.lastImportedTransactionIds = transactionsToImport.map(t => t.id); // Store IDs for undo feature
        await db.appSettings.update('generalSettings', {
            lastImportedTransactionIds: appState.lastImportedTransactionIds
        });

        showAlert(`${transactionsToImport.length} transação(ões) importada(s) com sucesso!`, CONSTANTS.ALERT_TYPE_SUCCESS);
        closeModal('importReviewModal');
        appState.transactionsToReview = []; // Clear review transactions after import

        // Refresh UI
        loadTransactions();
        generateReports();
        updateFilterCategories();
        updateSystemStats();
    } catch (error) {
        console.error(`Erro ao importar transações: ${error.message}`, error);
        showAlert('Erro ao importar transações: ' + error.message, CONSTANTS.ALERT_TYPE_ERROR);
    } finally {
        hideLoading();
    }
}

/**
 * Manipula eventos de input e change na tabela de revisão de importação.
 * Usado usa event delegation.
 * @param {Event} e - O evento.
 */
function handleReviewTableChange(e) {
    const target = e.target;
    const row = target.closest('tr');
    if (!row) return;

    const index = parseInt(row.dataset.index);
    const transaction = appState.transactionsToReview[index];

    if (!transaction) return;

    if (target.matches('input[name="data"]')) {
        transaction.data = target.value;
    } else if (target.matches('select[name="categoria"]')) {
        transaction.categoria = target.value;
        // Quando a categoria muda, atualize as subcategorias desta linha
        const subcatSelect = row.querySelector('select[name="subcategoria"]');
        let subcatOptionsHTML = '<option value="">Selecione</option>';
        if (appState.categoriesData[transaction.tipo] && appState.categoriesData[transaction.tipo][transaction.categoria]) {
            appState.categoriesData[transaction.tipo][transaction.categoria].sort().forEach(sub => {
                subcatOptionsHTML += `<option value="${sub}">${sub}</option>`;
            });
        }
        if (subcatSelect) {
            subcatSelect.innerHTML = subcatOptionsHTML;
            // Tenta manter a subcategoria se for válida para a nova categoria
            if (appState.categoriesData[transaction.tipo] && appState.categoriesData[transaction.tipo][transaction.categoria] && appState.categoriesData[transaction.tipo][transaction.categoria].includes(transaction.subcategoria)) {
                subcatSelect.value = transaction.subcategoria;
            } else {
                transaction.subcategoria = '';
                subcatSelect.value = '';
            }
        }
    } else if (target.matches('select[name="subcategoria"]')) {
        transaction.subcategoria = target.value;
    } else if (target.matches('input[name="descricao"]')) {
        transaction.descricao = target.value;
    } else if (target.matches('select[name="tipo"]')) {
        transaction.tipo = target.value;
        // Quando o TIPO muda, precisamos atualizar Categoria e Subcategoria
        const categoriaSelect = row.querySelector('select[name="categoria"]');
        const subcategoriaSelect = row.querySelector('select[name="subcategoria"]');

        let categoryOptionsHTML = '<option value="">Selecione</option>';
        if (appState.categoriesData[transaction.tipo]) {
            Object.keys(appState.categoriesData[transaction.tipo]).sort().forEach(cat => {
                categoryOptionsHTML += `<option value="${cat}">${cat}</option>`;
            });
        }
        if (categoriaSelect) {
            categoriaSelect.innerHTML = categoryOptionsHTML;
            // Tenta manter a categoria atual ou limpa se for inconsistente
            if (appState.categoriesData[transaction.tipo] && Object.keys(appState.categoriesData[transaction.tipo]).includes(transaction.categoria)) {
                categoriaSelect.value = transaction.categoria;
            } else {
                transaction.categoria = CONSTANTS.UNCATEGORIZED;
                categoriaSelect.value = '';
            }
        }

        let subcategoryOptionsHTML = '<option value="">Selecione</option>';
        if (appState.categoriesData[transaction.tipo] && appState.categoriesData[transaction.tipo][transaction.categoria]) {
            appState.categoriesData[transaction.tipo][transaction.categoria].sort().forEach(sub => {
                subcategoryOptionsHTML += `<option value="${sub}">${sub}</option>`;
            });
        }
        if (subcategoriaSelect) {
            subcategoriaSelect.innerHTML = subcategoryOptionsHTML;
            // Tenta manter a subcategoria atual ou limpa
            if (appState.categoriesData[transaction.tipo] && appState.categoriesData[transaction.tipo][transaction.categoria] && appState.categoriesData[transaction.tipo][transaction.categoria].includes(transaction.subcategoria)) {
                subcategoriaSelect.value = transaction.subcategoria;
            } else {
                transaction.subcategoria = '';
                subcategoriaSelect.value = '';
            }
        }

    } else if (target.matches('select[name="meio"]')) {
        transaction.meio = target.value;
    }

    updateReviewRowNeedsReview(row, transaction); // Re-avaliar se a linha precisa de revisão
}

/**
 * Manipula eventos blur na tabela de revisão de importação.
 * Usado principalmente para campos de valor que precisam de formatação ao perder o foco.
 * @param {Event} e - O evento.
 */
function handleReviewTableBlur(e) {
    const target = e.target;
    const row = target.closest('tr');
    if (!row) return;

    const index = parseInt(row.dataset.index);
    const transaction = appState.transactionsToReview[index];

    if (!transaction) return;

    if (target.matches('input[name="valor"]')) {
        const numericValue = parseBrazilianCurrencyStringToFloat(target.value);
        target.value = formatFloatToBrazilianCurrencyString(numericValue);
        transaction.valor = numericValue;
    }

    updateReviewRowNeedsReview(row, transaction);
}

/**
 * Manipula cliques na tabela de revisão (por exemplo, para o botão de exclusão da linha).
 * @param {Event} e - O evento.
 */
function handleReviewTableClick(e) {
    const target = e.target;
    if (target.closest('.delete-review-row-btn')) { // Certifique-se de adicionar esta classe ao botão de exclusão
        const row = target.closest('tr');
        if (!row) return;
        const transactionIndex = parseInt(row.dataset.index);

        appState.transactionsToReview.splice(transactionIndex, 1); // Remove do array
        updateReviewTable(appState.transactionsToReview); // Re-renderiza a tabela
        updateReviewSelectedCount();
        showAlert('Transação removida da lista de importação.', CONSTANTS.ALERT_TYPE_INFO);
    }
}


// ==================== FUNÇÕES AUXILIARES DIVERSAS ====================
/**
 * Formata a chave interna do meio de pagamento para um nome amigável.
 * @param {string} meioKey - A chave do meio de pagamento (ex: 'cartao_credito').
 * @returns {string} O nome formatado (ex: 'Cartão de Crédito').
 */
function formatMeio(meioKey) {
    const meioMap = {
        'cartao_credito': 'Cartão de Crédito',
        'pix': 'PIX',
        'debito': 'Débito',
        'dinheiro': 'Dinheiro',
        'boleto': 'Boleto',
        'transferencia': 'Transferência',
        // A linha problemática '' foi removida daqui.
        'outros': 'Outros'
    };
    return meioMap[meioKey] || meioKey; // Retorna o nome amigável ou a chave original se não for encontrada
}
/**
 * Abre um modal genérico.
 * @param {string} modalId - O ID do elemento do modal.
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex'); // Assumes modals use flexbox for centering
    }
}

/**
 * Fecha um modal genérico.
 * @param {string} modalId - O ID do elemento do modal.
 * @param {boolean} confirmed - Indica se a ação foi confirmada (para modais de confirmação).
 */
function closeModal(modalId, confirmed = false) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
    // If it's a confirmation modal and the action was NOT confirmed, reset the confirm button listener
    if (modalId === 'confirmationModal' && !confirmed) {
        const confirmBtn = appState.domElements.confirmActionBtn;
        if (confirmBtn) {
            // Recreate the button to remove old event listeners
            const newBtn = confirmBtn.cloneNode(true);
            confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);
            appState.domElements.confirmActionBtn = newBtn; // Update cached reference
        }
    }
}

/**
 * Abre o modal de confirmação com uma mensagem e uma ação a ser executada.
 * @param {string} title - O título do modal.
 * @param {string} message - A mensagem a ser exibida.
 * @param {Function} onConfirm - A função a ser chamada se o usuário confirmar.
 */
function openConfirmationModal(title, message, onConfirm) {
    const {
        confirmationModalTitle,
        confirmationModalMessage,
        confirmActionBtn
    } = appState.domElements;
    if (confirmationModalTitle) confirmationModalTitle.textContent = title;
    if (confirmationModalMessage) confirmationModalMessage.textContent = message;

    if (confirmActionBtn) {
        // Ensure old event listeners are removed by cloning and replacing the button
        const newConfirmBtn = confirmActionBtn.cloneNode(true);
        confirmActionBtn.parentNode.replaceChild(newConfirmBtn, confirmActionBtn);
        appState.domElements.confirmActionBtn = newConfirmBtn; // Update the cached DOM element

        // Add the new listener
        newConfirmBtn.addEventListener('click', () => {
            onConfirm(); // Execute the provided confirmation function
            closeModal('confirmationModal', true); // Close modal, passing true for 'confirmed'
        }, {
            once: true
        }); // Ensures the listener is executed only once
    }

    openModal('confirmationModal'); // Show the modal
}

/**
 * Exibe uma mensagem de debug no console com informações do estado atual.
 */
function debugInfo() {
    console.log("===== DEBUG INFO ====");
    console.log("Estado da Aplicação (appState):");
    for (const key in appState) {
        if (key === 'domElements') {
            console.log(`  ${key}: { ... (muitos elementos DOM) }`);
        } else if (key === 'mainChartInstance' && appState[key]) {
            console.log(`  ${key}: Chart.js Instance`);
        } else if (key === 'topCategoriasChartInstance' && appState[key]) { // Adicionado para o novo gráfico
            console.log(`  ${key}: Chart.js Instance (Top Categorias)`);
        } else if (key === 'evolucaoMensalCategoriaChartInstance' && appState[key]) { // Adicionado para o novo gráfico
            console.log(`  ${key}: Chart.js Instance (Evolução Mensal por Categoria)`);
        } else {
            console.log(`  ${key}:`, appState[key]);
        }
    }
    console.log("Banco de Dados (db):");
    console.log("=====================");
}

/**
 * [FUNÇÃO DE DIAGNÓSTICO]
 * Varre todas as transações no banco de dados para verificar a integridade do campo 'data'.
 * Registra no console quaisquer transações com datas inválidas.
 */
async function verificarIntegridadeDasDates() {
    console.log('%cINICIANDO VERIFICAÇÃO DE INTEGRIDADE DAS DATAS...', 'color: yellow; font-weight: bold;');
    try {
        const todasAsTransacoes = await db.transactions.toArray();
        let registrosInvalidos = 0;

        const regexDataValida = /^\d{4}-\d{2}-\d{2}$/; // CORRIGIDO: Removido \ extra

        for (const t of todasAsTransacoes) {
            // Verifica se o campo 'data' é uma string no formato YYYY-MM-DD
            if (typeof t.data !== 'string' || !regexDataValida.test(t.data) || isNaN(new Date(t.data).getTime())) {
                console.error(`--> TRANSAÇÃO INVÁLIDA ENCONTRADA! ID: ${t.id}, Data:`, t.data);
                registrosInvalidos++;
            }
        }

        if (registrosInvalidos > 0) {
            console.warn(`%cVerificação concluída. ${registrosInvalidos} transação(ões) com datas inválidas encontradas.`, 'color: orange; font-weight: bold;');
            showAlert(`Atenção: ${registrosInvalidos} registro(s) com data corrompida foram encontrados. Veja o console (F12) para detalhes.`, CONSTANTS.ALERT_TYPE_ERROR);
        } else {
            console.log('%cVerificação concluída. Todas as datas estão íntegras!', 'color: lightgreen; font-weight: bold;');
        }
    } catch (error) {
        console.error("Erro durante a verificação de integridade das datas:", error);
    }
}

/**
 * [FUNÇÃO DE CORREÇÃO]
 * Encontra transações com datas inválidas e as corrige, definindo-as para a data de hoje.
 * Esta função deve ser chamada manualmente pelo console do navegador.
 */
async function corrigirDatasInvalidas() {
    console.log("Iniciando rotina de correção de datas...");
    const hoje = new Date().toISOString().split('T')[0];
    let registrosCorrigidos = 0;

    await db.transactions.toCollection().modify(t => {
        const regexDataValida = /^\d{4}-\d{2}-\d{2}$/; // CORRIGIDO: Removido \ extra
        if (typeof t.data !== 'string' || !regexDataValida.test(t.data) || isNaN(new Date(t.data).getTime())) {
            console.warn(`Corrigindo ID: ${t.id}. Data antiga:`, t.data, `Nova data: ${hoje}`);
            t.data = hoje; // Define a data para hoje
            registrosCorrigidos++;
        }
    });

    if (registrosCorrigidos > 0) {
        alert(`${registrosCorrigidos} transação(ões) foram corrigidas! A página será recarregada.`);
        window.location.reload();
    } else {
        alert("Nenhuma transação com data inválida foi encontrada para corrigir.");
    }
}

// ==================== FUNÇÕES DE DIAGNÓSTICO E CORREÇÃO DE INTEGRIDADE (ADICIONADAS CONFORME INSTRUÇÃO) ====================

/**
 * [DIAGNÓSTICO] Varre transações para verificar a integridade do campo 'isRecurring'.
 * Esta função deve ser adicionada e, após a correção, pode ser removida.
 */
async function verificarIntegridadeRecorrencia() {
    console.log('%cINICIANDO VERIFICAÇÃO DE INTEGRIDADE DO CAMPO "isRecurring"...', 'color: yellow; font-weight: bold;');
    try {
        const transacoes = await db.transactions.toArray();
        let invalidos = 0;
        for (const t of transacoes) {
            if (typeof t.isRecurring !== 'boolean') {
                console.error(`--> TRANSAÇÃO COM RECORRÊNCIA INVÁLIDA! ID: ${t.id}, isRecurring:`, t.isRecurring);
                invalidos++;
            }
        }
        if (invalidos > 0) {
            console.warn(`%cVerificação concluída. ${invalidos} transação(ões) com campo 'isRecurring' corrompido.`, 'color: orange;');
            showAlert("Problema de dados encontrado no campo 'recorrência'. Execute a correção no console.", CONSTANTS.ALERT_TYPE_ERROR);
        } else {
            console.log('%cVerificação concluída. Todos os campos "isRecurring" estão íntegros!', 'color: lightgreen;');
        }
    } catch (error) {
        console.error("Erro durante a verificação de recorrência:", error);
    }
}

/**
 * [CORREÇÃO] Encontra transações com 'isRecurring' inválido e corrige para 'false'.
 * Deve ser chamada manualmente pelo console. Após a correção, pode ser removida.
 */
async function corrigirRecorrenciaInvalida() {
    console.log("Iniciando rotina de correção de recorrência...");
    let corrigidos = 0;
    await db.transactions.toCollection().modify(t => {
        if (typeof t.isRecurring !== 'boolean') {
            console.warn(`Corrigindo ID: ${t.id}. Valor antigo de isRecurring:`, t.isRecurring, `Novo valor: false`);
            t.isRecurring = false; // Define um valor padrão seguro
            corrigidos++;
        }
    });

    if (corrigidos > 0) {
        alert(`${corrigidos} transação(ões) foram corrigidas! A página será recarregada.`);
        window.location.reload();
    } else {
        alert("Nenhuma transação com recorrência inválida foi encontrada para corrigir.");
    }
}

// NOVO: Função para popular o filtro de categorias nos relatórios
async function populateReportFilterCategories() { // <-- ADICIONADA ESTA FUNÇÃO NOVA
    try {
        const {
            reportCategoriaFilter,
            evolucaoCategoriaSelect // ADICIONADO: Novo select de evolução
        } = appState.domElements;
        if (!reportCategoriaFilter || !evolucaoCategoriaSelect) return;

        const currentFilterValue = reportCategoriaFilter.value; // Salva o valor atual
        const currentEvolucaoValue = evolucaoCategoriaSelect.value; // Salva o valor atual

        reportCategoriaFilter.innerHTML = '<option value="all">Todas as Categorias</option>';
        evolucaoCategoriaSelect.innerHTML = '<option value="all">Selecione uma Categoria</option>';

        const allCategoriesSet = new Set();
        const transactions = await db.transactions.toArray();
        transactions.forEach(t => allCategoriesSet.add(t.categoria));

        const allCategories = Array.from(allCategoriesSet).sort();

        allCategories.forEach(categoria => {
            // Popula o filtro principal
            const option = document.createElement('option');
            option.value = categoria;
            option.textContent = categoria;
            reportCategoriaFilter.appendChild(option);

            // Popula o novo select de evolução
            const evolucaoOption = option.cloneNode(true);
            evolucaoCategoriaSelect.appendChild(evolucaoOption);
        });

        // Restaura os valores selecionados
        reportCategoriaFilter.value = currentFilterValue;
        evolucaoCategoriaSelect.value = currentEvolucaoValue;

    } catch (error) {
        console.error(`Erro ao popular categorias do filtro de relatório: ${error.message}`, error);
    }
}