// ==================== CONFIGURAÇÃO GLOBAL ====================
const CONSTANTS = {
    TRANSACTION_TYPE_INCOME: 'receita',
    TRANSACTION_TYPE_EXPENSE: 'despesa',
    ALERT_TYPE_SUCCESS: 'success',
    ALERT_TYPE_ERROR: 'error',
    ALERT_TYPE_INFO: 'info',
    UNCATEGORIZED: 'Não categorizado',

    // Termos para detecção de meio de pagamento (minúsculas para comparação).
    CARD_CREDIT_TERMS: ['cartão de crédito', 'cartao de credito', 'credito', 'credit card', 'fatura', 'pagamento fatura', 'pagto fatura', 'compra com cartao', 'cartao compra', 'ccred'],
    PIX_TERMS: ['pix'],
    DEBIT_TERMS: ['débito', 'debito', 'debit', 'cartao de debito', 'cartão de débito'],
    MONEY_TERMS: ['dinheiro', 'cash'],
    BOLETO_TERMS: ['boleto'],
    TRANSFER_TERMS: ['transferencia', 'transfer', 'ted', 'doc'],

    // Constantes para frequência de transações recorrentes.
    RECURRING_FREQUENCY_WEEKLY: 'weekly',
    RECURRING_FREQUENCY_MONTHLY: 'monthly',
    RECURRING_FREQUENCY_BIMESTRAL: 'bimestral',
    RECURRING_FREQUENCY_QUARTERLY: 'quarterly',
    RECURRING_FREQUENCY_SEMESTRAL: 'semestral',
    RECURRING_FREQUENCY_YEARLY: 'yearly',

    // Constantes para tipo de pagamento (parcelamento).
    PAYMENT_TYPE_SINGLE: 'single',
    PAYMENT_TYPE_INSTALLMENT: 'installment',

    // MELHORIA: Constantes para tipos de documento (evitar magic strings)
    DOC_TYPE_BANK_STATEMENT: 'extrato_bancario',
    DOC_TYPE_CREDIT_CARD_BILL: 'fatura_cartao_credito',
    DOC_TYPE_GENERIC: 'outros',
};

// ==================== REGRAS DE CATEGORIZAÇÃO AUTOMÁTICA ====================
// Array de objetos para categorização automática baseada em termos na descrição.
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
    { terms: ['massagem', 'cuidado pessoal', 'estetica'], tipo: CONSTANTS.TRANSACTION_TYPE_EXPENSE, category: 'Despesas Pessoais', subcategory: 'Massagem e cuidados' },
    { terms: ['vestuario', 'roupa', 'sapato', 'acessorios'], tipo: CONSTANTS.TRANSACTION_TYPE_EXPENSE, category: 'Despesas Pessoais', subcategory: 'Vestuário' },
    { terms: ['suplemento', 'nutricao'], tipo: CONSTANTS.TRANSACTION_TYPE_EXPENSE, category: 'Despesas Pessoais', subcategory: 'Suplementos' },
    { terms: ['academia', 'esporte', 'natacao', 'pilates', 'yoga'], tipo: CONSTANTS.TRANSACTION_TYPE_EXPENSE, category: 'Despesas Pessoais', subcategory: 'Academia e esportes' },

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
    { terms: ['consultorio particular', 'atendimento particular'], tipo: CONSTANTS.TRANSACTION_TYPE_INCOME, category: 'Consultório particular', subcategory: '' },
    { terms: ['unimed pj', 'pagamento unimed pj'], tipo: CONSTANTS.TRANSACTION_TYPE_INCOME, category: 'Unimed PJ', subcategory: '' },
    { terms: ['unimed pf', 'pagamento unimed pf'], tipo: CONSTANTS.TRANSACTION_TYPE_INCOME, category: 'Unimed PF', subcategory: '' },
    { terms: ['hospital santa rosalia', 'pagamento hospital'], tipo: CONSTANTS.TRANSACTION_TYPE_INCOME, category: 'Hospital Santa Rosália', subcategory: '' },
    { terms: ['sae ampliado'], tipo: CONSTANTS.TRANSACTION_TYPE_INCOME, category: 'SAE ampliado', subcategory: '' },
    { terms: ['visitas domiciliares'], tipo: CONSTANTS.TRANSACTION_TYPE_INCOME, category: 'Visitas domiciliares particulares', subcategory: '' },
    { terms: ['visitas hospitalares'], tipo: CONSTANTS.TRANSACTION_TYPE_INCOME, category: 'Visitas hospitalares particulares', subcategory: '' },
    { terms: ['dividendos', 'fundo imobiliario', 'acoes', 'rendimento'], tipo: CONSTANTS.TRANSACTION_TYPE_INCOME, category: 'Dividendos Fundos e ações', subcategory: '' },
    { terms: ['lucas salario', 'salario lucas'], tipo: CONSTANTS.TRANSACTION_TYPE_INCOME, category: 'Lucas salário', subcategory: '' },
];

// ==================== REGRAS DE IMPORTAÇÃO POR TIPO DE DOCUMENTO ====================
// Define regras específicas para cada tipo de documento a ser importado.
// Isso permite que o sistema tire conclusões sobre a natureza das transações
// e preencha automaticamente campos como 'meio de pagamento' ou ajuste o 'tipo' (receita/despesa).
const DOCUMENT_TYPE_RULES = {
    [CONSTANTS.DOC_TYPE_BANK_STATEMENT]: { // MELHORIA: Usando constante
        description: 'Extrato Bancário (Transações diversas)',
        // Se o arquivo não fornecer um meio claro, assume-se transferência como padrão para extratos.
        defaultMeio: 'transferencia',
        // Não há termos especiais que sobreponham a lógica de valor ou detecção padrão para o tipo (receita/despesa)
        // em um extrato bancário, pois o sinal do valor já é bem indicativo.
        special_terms: []
    },
    [CONSTANTS.DOC_TYPE_CREDIT_CARD_BILL]: { // MELHORIA: Usando constante
        description: 'Fatura de Cartão de Crédito',
        // Para faturas de cartão, o meio de pagamento é sempre "cartao_credito", independente do que o arquivo diga.
        defaultMeio: 'cartao_credito',
        // Termos especiais que podem indicar um tipo de transação (receita/despesa) que difere do sinal do valor
        // em uma fatura de cartão de crédito. Por exemplo, um pagamento de fatura é uma "receita" para o controle pessoal,
        // mesmo que o valor possa aparecer como um débito ou crédito no extrato da fatura.
        special_terms: [
            // Exemplos de termos que indicam Receita (créditos no cartão, pagamentos, estornos)
            { terms: ['pagamento recebido', 'pagamento_cartao', 'credito', 'estorno', 'reembolso', 'devolucao', 'cashback'], type: CONSTANTS.TRANSACTION_TYPE_INCOME },
            // Exemplos de termos que indicam Despesa (encargos, juros, multas)
            { terms: ['juros', 'encargos', 'multa', 'anuidade', 'tarifa', 'servico'], type: CONSTANTS.TRANSACTION_TYPE_EXPENSE }
        ]
    },
    [CONSTANTS.DOC_TYPE_GENERIC]: { // MELHORIA: Usando constante
        description: 'Documento Genérico',
        defaultMeio: 'outros', // Se não houver detecção, usa o padrão "outros".
        special_terms: [] // Sem regras especiais, rely on autoCategorizeFromDescription
    }
};

// ==================== DATABASE CONFIGURATION (Dexie.js) ====================
// Instância do banco de dados IndexedDB via Dexie.js.
const db = new Dexie('FinancialControlDB');

// Estrutura padrão de categorias, usada para inicializar o sistema.
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

// ==================== REVISÃO: Migração de Banco de Dados ====================
// A estrutura original continha um bloco 'upgrade' duplicado, o que pode levar a
// comportamento inesperado. Garantimos agora um único bloco de upgrade por versão.
// Ajustes na lógica de migração para garantir a consistência dos campos
// 'isInstallment', 'installmentInfo', 'isRecurring', 'nextOccurrenceDate', etc.
db.version(47).stores({
    transactions: '++id,data,tipo,categoria,meio,dataCreated,isRecurring,recurringFrequency,nextOccurrenceDate,parentRecurringId,isInstallment,groupId',
    appSettings: 'id',
}).upgrade(async tx => {
    console.log('Iniciando migração de banco de dados para a versão 47...');
    let count = 0;
    await tx.transactions.toCollection().modify(transaction => {
        // Normaliza o formato da data para 'YYYY-MM-DD' garantindo consistência
        const originalData = transaction.data;
        transaction.data = formatDate(originalData); // Usa a versão revisada de formatDate
        if (originalData !== transaction.data) {
            console.warn(`[MIGRAÇÃO] Transação ID ${transaction.id}: Data '${originalData}' normalizada para '${transaction.data}'.`);
        }
        count++;

        // Garante que 'groupId' seja definido corretamente para parcelamentos
        if (transaction.isInstallment && transaction.installmentInfo && typeof transaction.installmentInfo.groupId !== 'undefined') {
            transaction.groupId = transaction.installmentInfo.groupId;
        } else {
            transaction.groupId = null;
        }
        // Se não for um parcelamento, 'installmentInfo' deve ser nulo
        if (!transaction.isInstallment) {
            transaction.installmentInfo = null;
        }

        // Garante que campos de recorrência tenham valores padrão se indefinidos
        if (typeof transaction.isRecurring === 'undefined') {
            transaction.isRecurring = false;
        }
        if (typeof transaction.nextOccurrenceDate === 'undefined') {
            transaction.nextOccurrenceDate = null;
        }
        if (typeof transaction.recurringFrequency === 'undefined') {
            transaction.recurringFrequency = null;
        }
        if (typeof transaction.parentRecurringId === 'undefined') {
            transaction.parentRecurringId = null;
        }
    });
    console.log(`Migração de banco de dados para a versão 47 concluída. ${count} transações processadas.`);
});


// ==================== REVISÃO: Gerenciamento de Estado Global ====================
// Variáveis de estado global da aplicação encapsuladas em um único objeto `appState`
// para melhor organização e para evitar poluição do escopo global.
const appState = {
    categoriesData: DEFAULT_CATEGORIES_DATA,
    lastImportedTransactionIds: [],
    editingTransactionId: null,
    editingCategoryId: null,
    searchTimeout: null,
    currentSortOrder: 'desc',
    domElements: {} // Objeto para armazenar referências a elementos DOM frequentemente usados
};


// ==================== FUNÇÕES AUXILIARES DE IMPORTAÇÃO (MOVIDAS PARA CIMA) ====================
// MELHORIA: Movidas para cima para garantir que sejam definidas antes de serem referenciadas.

/**
 * Manipula o evento de arrastar arquivo sobre a área de importação.
 * @param {DragEvent} event
 */
function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.add('dragover');
}

/**
 * Manipula o evento de sair da área de importação com o arquivo arrastado.
 * @param {DragEvent} event
 */
function handleDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove('dragover');
}

/**
 * MELHORIA: Nova função auxiliar para processar e validar arquivos, reduzindo duplicação.
 * @param {FileList} files - Lista de arquivos selecionados.
 */
function processAndValidateFiles(files) {
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
    clearValidationError(documentTypeSelect); // Limpa o erro se a seleção for válida

    if (files && files.length > 0) {
        processFiles(files, documentType);
    }
}

/**
 * Manipula o evento de seleção de arquivos do input.
 * @param {Event} event - O evento 'change' do input de arquivo.
 */
function handleFileSelect(event) {
    processAndValidateFiles(event.target.files);
}

/**
 * Manipula o evento de soltar arquivo na área de importação.
 * @param {DragEvent} event
 */
function handleFileDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove('dragover');
    processAndValidateFiles(event.dataTransfer.files);
}

// ==================== INICIALIZAÇÃO ====================
// Garante que o sistema seja inicializado após o carregamento completo do DOM.
document.addEventListener('DOMContentLoaded', initializeSystem);

async function initializeSystem() {
    try {
        console.log('Inicializando sistema...');
        await db.open(); // Abre ou cria o banco de dados.

        // Carrega configurações existentes ou define padrões.
        const settings = await db.appSettings.get('generalSettings');
        if (settings) {
            appState.categoriesData = settings.categoriesData || DEFAULT_CATEGORIES_DATA;
            appState.lastImportedTransactionIds = settings.lastImportedTransactionIds || [];
        } else {
            // Salva as configurações padrão se não existirem.
            await db.appSettings.put({
                id: 'generalSettings',
                categoriesData: DEFAULT_CATEGORIES_DATA,
                lastImportedTransactionIds: [],
            });
        }

        // Armazena referências DOM para uso posterior, reduzindo queries repetitivas
        cacheDomElements();

        // Define a data atual como padrão no formulário de transação.
        const today = new Date().toISOString().split('T')[0];
        if (appState.domElements.dataInput) appState.domElements.dataInput.value = today;

        setupEventListeners(); // Configura todos os ouvintes de evento da UI.
        await checkAndGenerateRecurringTransactions(); // Gera transações recorrentes pendentes.

        // Ajusta a visibilidade de campos condicionais na inicialização.
        toggleRecurringFields();
        toggleMeioDependentFields();

        setupReportDates(); // Define o período padrão para relatórios.
        updateCategories(); // Carrega categorias nos selects.
        loadCategoriesManagementTable();

        showAlert('Sistema carregado com sucesso!', CONSTANTS.ALERT_TYPE_SUCCESS);
        console.log('Sistema inicializado com sucesso!');
        debugInfo(); // Exibe informações de depuração.
    } catch (error) {
        console.error('Erro na inicialização:', error);
        showAlert('Erro ao inicializar sistema: ' + error.message, CONSTANTS.ALERT_TYPE_ERROR);
    }
}

// ==================== REVISÃO: Cache de Elementos DOM ====================
// Centraliza a obtenção de referências a elementos DOM frequentemente usados.
function cacheDomElements() {
    appState.domElements.dataInput = document.getElementById('data');
    appState.domElements.tipoSelect = document.getElementById('tipo');
    appState.domElements.categoriaSelect = document.getElementById('categoria');
    appState.domElements.subcategoriaSelect = document.getElementById('subcategoria');
    appState.domElements.outraCategoriaInput = document.getElementById('outraCategoria');
    appState.domElements.outraSubcategoriaInput = document.getElementById('outraSubcategoria');
    appState.domElements.valorInput = document.getElementById('valor');
    appState.domElements.meioSelect = document.getElementById('meio');
    appState.domElements.descricaoInput = document.getElementById('descricao');

    appState.domElements.isRecurringCheckbox = document.getElementById('isRecurringCheckbox');
    appState.domElements.recurringFrequencySelect = document.getElementById('recurringFrequencySelect');
    appState.domElements.recurringFieldsContainer = document.getElementById('recurringFieldsContainer'); // Adicionado

    appState.domElements.paymentTypeSingle = document.getElementById('paymentTypeSingle');
    appState.domElements.paymentTypeInstallment = document.getElementById('paymentTypeInstallment');
    appState.domElements.numInstallmentsInput = document.getElementById('numInstallmentsInput');
    appState.domElements.numInstallmentsGroup = document.getElementById('numInstallmentsGroup'); // Adicionado
    appState.domElements.installmentOptionsContainer = document.getElementById('installmentOptionsContainer'); // Adicionado

    appState.domElements.categoryManagementForm = document.getElementById('categoryManagementForm');
    appState.domElements.categoryTypeSelect = document.getElementById('categoryType');
    appState.domElements.categoryNameInput = document.getElementById('categoryName');
    appState.domElements.subcategoryNameInput = document.getElementById('subcategoryName');
    appState.domElements.saveCategoryBtn = document.getElementById('saveCategoryBtn');
    appState.domElements.categoryManagementBody = document.getElementById('categoryManagementBody');
    appState.domElements.clearCategoryFormBtn = document.getElementById('clearCategoryFormBtn'); // Adicionado

    appState.domElements.transactionsBody = document.getElementById('transactionsBody');
    appState.domElements.masterCheckbox = document.getElementById('masterCheckbox');
    appState.domElements.selectedCountSpan = document.getElementById('selectedCount');
    appState.domElements.selectedCountMeioModalSpan = document.getElementById('selectedCountMeioModal');
    appState.domElements.deleteSelectedBtn = document.getElementById('deleteSelectedBtn');
    appState.domElements.editSelectedMeioBtn = document.getElementById('editSelectedMeioBtn');
    appState.domElements.editMeioModal = document.getElementById('editMeioModal');
    appState.domElements.modalMeioSelect = document.getElementById('modalMeio');
    appState.domElements.closeEditMeioModalBtn = document.getElementById('closeEditMeioModalBtn'); // Adicionado
    appState.domElements.cancelEditMeioBtn = document.getElementById('cancelEditMeioBtn'); // Adicionado
    appState.domElements.applyEditMeioBtn = document.getElementById('applyEditMeioBtn'); // Adicionado

    appState.domElements.reportDataInicioInput = document.getElementById('reportDataInicio');
    appState.domElements.reportDataFimInput = document.getElementById('reportDataFim');
    appState.domElements.mainChartArea = document.getElementById('main-chart-area');
    appState.domElements.reportChartSelect = document.getElementById('reportChartSelect');
    appState.domElements.chartTypeDespesasSelect = document.getElementById('chartTypeDespesas');
    appState.domElements.reportStatsContainer = document.getElementById('reportStats');

    appState.domElements.filterDataInicioInput = document.getElementById('filterDataInicio');
    appState.domElements.filterDataFimInput = document.getElementById('filterDataFim');
    appState.domElements.filterTipoSelect = document.getElementById('filterTipo');
    appState.domElements.filterCategoriaSelect = document.getElementById('filterCategoria');
    appState.domElements.searchBoxInput = document.getElementById('searchBox');
    appState.domElements.sortDateBtn = document.getElementById('sortDateBtn');
    appState.domElements.sortIconSpan = document.getElementById('sortIcon');
    appState.domElements.transactionStatsContainer = document.getElementById('transactionStats');

    appState.domElements.fileInput = document.getElementById('fileInput');
    appState.domElements.importArea = document.getElementById('importArea');
    appState.domElements.undoImportBtn = document.getElementById('undoImportBtn');
    appState.domElements.importProgressDiv = document.getElementById('importProgress');
    appState.domElements.progressFillDiv = document.getElementById('progressFill');
    appState.domElements.progressTextP = document.getElementById('progressText');
    // NOVO: Adiciona referência ao select do tipo de documento
    appState.domElements.documentTypeSelect = document.getElementById('documentTypeSelect');

    appState.domElements.transactionForm = document.getElementById('transactionForm');
    appState.domElements.clearFormBtn = document.getElementById('clearFormBtn');
    appState.domElements.applyFiltersBtn = document.getElementById('applyFiltersBtn');
    appState.domElements.clearFiltersBtn = document.getElementById('clearFiltersBtn');
    appState.domElements.selectAllBtn = document.getElementById('selectAllBtn');

    appState.domElements.generateReportsBtn = document.getElementById('generateReportsBtn');
    appState.domElements.exportExcelReportBtn = document.getElementById('exportExcelReportBtn');
    appState.domElements.exportPdfReportBtn = document.getElementById('exportPdfReportBtn');

    appState.domElements.exportAllDataBtn = document.getElementById('exportAllDataBtn'); // Adicionado
    appState.domElements.importDataBtn = document.getElementById('importDataBtn'); // Adicionado
    appState.domElements.clearAllDataBtn = document.getElementById('clearAllDataBtn'); // Adicionado
    appState.domElements.systemStats = document.getElementById('systemStats'); // Adicionado

    appState.domElements.transactionDetailsModal = document.getElementById('transactionDetailsModal');
    appState.domElements.transactionDetailsTitle = document.getElementById('transactionDetailsTitle');
    appState.domElements.transactionDetailsBody = document.getElementById('transactionDetailsBody');
    appState.domElements.closeTransactionDetailsModalBtn = document.getElementById('closeTransactionDetailsModalBtn'); // Adicionado

    // NOVO: Referências para o modal de confirmação customizado
    appState.domElements.confirmationModal = document.getElementById('confirmationModal');
    appState.domElements.confirmationModalTitle = document.getElementById('confirmationModalTitle');
    appState.domElements.confirmationModalMessage = document.getElementById('confirmationModalMessage');
    appState.domElements.closeConfirmationModalBtn = document.getElementById('closeConfirmationModalBtn');
    appState.domElements.cancelConfirmationBtn = document.getElementById('cancelConfirmationBtn');
    appState.domElements.confirmActionBtn = document.getElementById('confirmActionBtn');

    // Grupos de formulário para alternar visibilidade via classe
    appState.domElements.categoriaGroup = document.getElementById('categoriaGroup');
    appState.domElements.outraCategoriaGroup = document.getElementById('outraCategoriaGroup');
    appState.domElements.subcategoriaGroup = document.getElementById('subcategoriaGroup');
    appState.domElements.outraSubcategoriaGroup = document.getElementById('outraSubcategoriaGroup');
}

// ==================== REVISÃO: Organização de Event Listeners ====================
// A função `setupEventListeners` foi dividida em funções menores e mais focadas
// para melhorar a legibilidade e a manutenção do código.
function setupEventListeners() {
    console.log('Configurando event listeners...');
    try {
        setupNavigationListeners();
        setupTransactionFormListeners();
        setupImportListeners();
        setupTransactionsTableListeners();
        setupReportListeners();
        setupCategoryManagementListeners();
        setupGlobalSettingsListeners();
        setupModalListeners();
        console.log('Event listeners configurados com sucesso!');
    } catch (error) {
        console.error('Erro ao configurar event listeners:', error);
        showAlert('Erro ao configurar eventos: ' + error.message, CONSTANTS.ALERT_TYPE_ERROR);
    }
}

function setupNavigationListeners() {
    const navTabsContainer = document.querySelector('.nav-tabs');
    if (navTabsContainer) {
        navTabsContainer.addEventListener('click', function(e) {
            const clickedTab = e.target.closest('.nav-tab');
            if (clickedTab && !clickedTab.classList.contains('active')) {
                e.preventDefault();
                const targetTab = clickedTab.getAttribute('data-tab');
                showTab(targetTab);
            }
        });
    }
}

function setupTransactionFormListeners() {
    const { dataInput, tipoSelect, categoriaSelect, outraCategoriaInput, outraSubcategoriaInput,
            descricaoInput, isRecurringCheckbox, recurringFrequencySelect, meioSelect,
            paymentTypeSingle, numInstallmentsInput, transactionForm, clearFormBtn, valorInput } = appState.domElements;

    if (transactionForm) {
        transactionForm.addEventListener('submit', handleTransactionSubmit);
        // Lista de elementos de input que devem ter validação limpa ao interagir
        const validationElements = [
            dataInput, tipoSelect, categoriaSelect, outraCategoriaInput, outraSubcategoriaInput,
            meioSelect, descricaoInput, recurringFrequencySelect, numInstallmentsInput, valorInput
        ];
        validationElements.forEach(element => {
            if (element) {
                element.addEventListener('input', () => clearValidationError(element));
                element.addEventListener('change', () => clearValidationError(element));
            }
        });
    }

    // MELHORIA: Tratamento de input para formato monetário brasileiro
    if (valorInput) {
        valorInput.addEventListener('blur', (e) => {
            // Converte a string de input para float, independentemente do formato (BR ou US)
            const numericValue = parseBrazilianCurrencyStringToFloat(e.target.value);
            // Formata o valor numérico para o formato de exibição brasileiro
            e.target.value = formatFloatToBrazilianCurrencyString(numericValue);
            clearValidationError(valorInput);
        });

        // Este listener agora faz uma limpeza básica, sem tentar interpretar o formato.
        // A interpretação complexa é feita no blur e na função de parsing.
        valorInput.addEventListener('input', (e) => {
            let value = e.target.value;
            // 1. Permite apenas dígitos, vírgulas e pontos
            value = value.replace(/[^\d,.]/g, '');

            // 2. Remove múltiplos zeros à esquerda, a menos que seja "0," ou "0."
            if (value.length > 1 && value[0] === '0' && value[1] !== ',' && value[1] !== '.') {
                value = value.substring(1);
            }
            
            // 3. Garante que haja apenas um separador decimal (vírgula ou ponto)
            //    Se existirem múltiplos, mantém apenas o último para fins de input temporário
            const lastCommaIndex = value.lastIndexOf(',');
            const lastDotIndex = value.lastIndexOf('.');

            // Se ambos os separadores existem e a vírgula é o último, remove os pontos.
            // Se o ponto é o último, remove as vírgulas.
            if (lastCommaIndex !== -1 && lastDotIndex !== -1) {
                if (lastCommaIndex > lastDotIndex) { // Provável formato BR (xxx.yyy,zz)
                    value = value.replace(/\.(?=[^,]*$)/g, ''); // Remove pontos de milhar antes da vírgula
                } else { // Provável formato US (xxx,yyy.zz)
                    value = value.replace(/,(?=[^.]*$)/g, ''); // Remove vírgulas de milhar antes do ponto
                }
            } else if (value.split('.').length > 2) { // Múltiplos pontos sem vírgula, tratar como milhares
                value = value.replace(/\.(?=[^.]*\.)/g, ''); // Remove pontos intermediários, mantendo o último
            } else if (value.split(',').length > 2) { // Múltiplas vírgulas sem ponto, manter apenas a última
                value = value.replace(/,(?=[^,]*.)/g, ''); // Remove vírgulas intermediárias, mantendo a última
            }
            
            e.target.value = value;
            // A validação de erro será feita no blur ou submit.
        });
    }


    if (tipoSelect) tipoSelect.addEventListener('change', updateCategories);
    if (tipoSelect) tipoSelect.addEventListener('change', autoFillFromDescription);

    if (categoriaSelect) {
        categoriaSelect.addEventListener('change', () => {
            updateSubcategories();
            toggleCustomCategoryFields();
        });
    }

    if (outraCategoriaInput) outraCategoriaInput.addEventListener('input', toggleCustomCategoryFields);
    if (outraSubcategoriaInput) outraSubcategoriaInput.addEventListener('input', toggleCustomCategoryFields);
    if (clearFormBtn) clearFormBtn.addEventListener('click', clearForm);
    if (descricaoInput) descricaoInput.addEventListener('blur', autoFillFromDescription);

    if (isRecurringCheckbox) {
        isRecurringCheckbox.addEventListener('change', toggleRecurringFields);
        isRecurringCheckbox.addEventListener('change', enforceMutualExclusivity);
    }

    if (meioSelect) {
        meioSelect.addEventListener('change', toggleMeioDependentFields);
        meioSelect.addEventListener('change', enforceMutualExclusivity);
    }

    document.querySelectorAll('input[name="paymentType"]').forEach(radio => {
        radio.addEventListener('change', toggleInstallmentFields);
        radio.addEventListener('change', enforceMutualExclusivity);
    });
}

function setupImportListeners() {
    const { fileInput, importArea, undoImportBtn, documentTypeSelect } = appState.domElements;

    if (fileInput) fileInput.addEventListener('change', handleFileSelect);
    if (importArea) {
        importArea.addEventListener('dragover', handleDragOver);
        importArea.addEventListener('drop', handleFileDrop);
        importArea.addEventListener('dragleave', handleDragLeave);
    }
    // CORREÇÃO CRÍTICA: O erro anterior estava aqui. 'undoImportBtn' é o elemento DOM.
    if (undoImportBtn) undoImportBtn.addEventListener('click', undoLastImport);

    // NOVO: Listener para o campo de seleção do tipo de documento para limpar validação
    if (documentTypeSelect) {
        documentTypeSelect.addEventListener('change', () => clearValidationError(documentTypeSelect));
    }
}

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
    if (editSelectedMeioBtn) editSelectedMeioBtn.addEventListener('click', openEditMeioModal);
}

function setupReportListeners() {
    const { generateReportsBtn, exportExcelReportBtn, exportPdfReportBtn, reportChartSelect, chartTypeDespesasSelect } = appState.domElements;
    if (generateReportsBtn) generateReportsBtn.addEventListener('click', generateReports);
    if (exportExcelReportBtn) exportExcelReportBtn.addEventListener('click', exportReportToExcel);
    if (exportPdfReportBtn) exportPdfReportBtn.addEventListener('click', exportReportToPdf);
    if (reportChartSelect) reportChartSelect.addEventListener('change', generateReports);
    if (chartTypeDespesasSelect) chartTypeDespesasSelect.addEventListener('change', generateReports);
}

function setupGlobalSettingsListeners() {
    const { exportAllDataBtn, importDataBtn, clearAllDataBtn } = appState.domElements;
    if (exportAllDataBtn) exportAllDataBtn.addEventListener('click', exportData);
    if (importDataBtn) importDataBtn.addEventListener('click', importData);
    if (clearAllDataBtn) clearAllDataBtn.addEventListener('click', clearAllData);
}

function setupCategoryManagementListeners() {
    const { categoryManagementForm, clearCategoryFormBtn } = appState.domElements;

    if (categoryManagementForm) {
        categoryManagementForm.addEventListener('submit', handleCategoryManagementSubmit);
        // Lista de elementos de input que devem ter validação limpa ao interagir
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

function setupModalListeners() {
    const { transactionDetailsModal, editMeioModal, closeTransactionDetailsModalBtn, closeEditMeioModalBtn, cancelEditMeioBtn, applyEditMeioBtn,
    closeConfirmationModalBtn, cancelConfirmationBtn } = appState.domElements; // Adiciona referências

    if (closeTransactionDetailsModalBtn) {
        closeTransactionDetailsModalBtn.addEventListener('click', () => {
            if (transactionDetailsModal) {
                transactionDetailsModal.classList.remove('is-active');
            }
        });
    }

    if (closeEditMeioModalBtn) closeEditMeioModalBtn.addEventListener('click', () => { if (editMeioModal) editMeioModal.classList.remove('is-active'); });
    if (cancelEditMeioBtn) cancelEditMeioBtn.addEventListener('click', () => { if (editMeioModal) editMeioModal.classList.remove('is-active'); });
    if (applyEditMeioBtn) applyEditMeioBtn.addEventListener('click', applyBulkMeioChange);

    // NOVO: Listeners para o modal de confirmação
    if (closeConfirmationModalBtn) {
        closeConfirmationModalBtn.addEventListener('click', () => {
            if (appState.domElements.confirmationModal) appState.domElements.confirmationModal.classList.remove('is-active');
            // Também dispara o callback com 'false' se o modal for fechado sem confirmar
            if (appState.domElements.confirmActionBtn._callback) appState.domElements.confirmActionBtn._callback(false);
        });
    }
    if (cancelConfirmationBtn) {
        cancelConfirmationBtn.addEventListener('click', () => {
            if (appState.domElements.confirmationModal) appState.domElements.confirmationModal.classList.remove('is-active');
            // Também dispara o callback com 'false' se cancelado
            if (appState.domElements.confirmActionBtn._callback) appState.domElements.confirmActionBtn._callback(false);
        });
    }
}


// Lógica para alternar a exibição das abas da interface.
async function showTab(tabName) {
    console.log('showTab: Iniciando transição para', tabName);
    try {
        const tabs = document.querySelectorAll('.tab-content');
        const navTabs = document.querySelectorAll('.nav-tab');

        // Oculta todas as abas e desativa os botões de navegação.
        tabs.forEach(tab => {
            tab.classList.remove('active');
        });
        navTabs.forEach(tab => {
            tab.classList.remove('active');
            tab.setAttribute('aria-selected', 'false');
            tab.setAttribute('tabindex', '-1');
        });

        // Mostra a aba alvo e ativa o botão de navegação correspondente.
        const targetTabContent = document.getElementById(tabName);
        if (targetTabContent) {
            targetTabContent.classList.add('active');
        }
        const activeNavTab = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeNavTab) {
            activeNavTab.classList.add('active');
            activeNavTab.setAttribute('aria-selected', 'true');
            activeNavTab.setAttribute('tabindex', '0');
        }

        // Lógica específica para carregar dados de cada aba ao ser ativada.
        if (tabName === 'panel-transacoes') { // MELHORIA: Usa o novo ID da seção
            await loadTransactions();
            updateFilterCategories();
        } else if (tabName === 'panel-relatorios') { // MELHORIA: Usa o novo ID da seção
            await generateReports();
            setTimeout(resizePlotlyCharts, 100);
        } else if (tabName === 'panel-configuracoes') { // MELHORIA: Usa o novo ID da seção
            updateSystemStats();
            loadCategoriesManagementTable();
        }
        console.log('showTab: Transição para', tabName, 'concluída (ou tentativa).');
    } catch (error) {
        console.error('showTab: Erro inesperado durante transição de aba:', error);
        showAlert('Erro ao navegar: ' + error.message, CONSTANTS.ALERT_TYPE_ERROR);
    }
}

// ==================== GERENCIAMENTO DE CATEGORIAS PERSONALIZADAS ====================
// Atualiza as opções do select de categoria com base no tipo de transação selecionado.
function updateCategories() {
    try {
        console.log('Atualizando categorias...');
        const { tipoSelect, categoriaSelect, subcategoriaSelect, outraCategoriaInput, outraSubcategoriaInput } = appState.domElements;
        if (!categoriaSelect || !subcategoriaSelect || !outraCategoriaInput || !outraSubcategoriaInput || !tipoSelect) {
            console.warn("Elementos de categoria/subcategoria não encontrados. Pulando atualização.");
            return;
        }

        const tipo = tipoSelect.value;

        // Armazena as seleções atuais para tentar restaurá-las após a atualização das opções.
        const currentSelectedCategoria = categoriaSelect.value;
        const currentSelectedSubcategoria = subcategoriaSelect.value;
        const currentOutraCategoria = outraCategoriaInput.value;
        const currentOutraSubcategoria = outraSubcategoriaInput.value;

        // Limpa os selects.
        categoriaSelect.innerHTML = '<option value="">Selecione a categoria</option>';
        subcategoriaSelect.innerHTML = '<option value="">Selecione a subcategoria</option>';

        // Preenche o select de categoria com base nas categorias do tipo selecionado.
        if (tipo && appState.categoriesData[tipo]) {
            Object.keys(appState.categoriesData[tipo]).sort().forEach(categoria => {
                const option = document.createElement('option');
                option.value = categoria;
                option.textContent = categoria;
                categoriaSelect.appendChild(option);
            });
            console.log('Categorias atualizadas para tipo:', tipo);
        }

        // Tenta restaurar as seleções anteriores.
        if (currentSelectedCategoria && categoriaSelect.querySelector(`option[value="${currentSelectedCategoria}"]`)) {
            categoriaSelect.value = currentSelectedCategoria;
            updateSubcategories();
            if (currentSelectedSubcategoria && subcategoriaSelect.querySelector(`option[value="${currentSelectedSubcategoria}"]`)) {
                subcategoriaSelect.value = currentSelectedSubcategoria;
            } else {
                outraSubcategoriaInput.value = currentOutraSubcategoria;
            }
        } else {
            outraCategoriaInput.value = currentOutraCategoria;
            outraSubcategoriaInput.value = currentOutraSubcategoria;
        }

        // Limpa mensagens de erro e ajusta a visibilidade dos campos personalizados.
        clearValidationError(tipoSelect);
        clearValidationError(categoriaSelect);
        clearValidationError(outraCategoriaInput);
        toggleCustomCategoryFields();
    } catch (error) {
        console.error('Erro ao atualizar categorias:', error);
        showAlert('Erro ao carregar categorias: ' + error.message, CONSTANTS.ALERT_TYPE_ERROR);
    }
}

// Atualiza as opções do select de subcategoria com base na categoria selecionada.
function updateSubcategories() {
    try {
        console.log('Atualizando subcategorias...');
        const { tipoSelect, categoriaSelect, subcategoriaSelect, outraSubcategoriaInput } = appState.domElements;
        if (!subcategoriaSelect || !outraSubcategoriaInput || !tipoSelect || !categoriaSelect) {
            console.warn("Elementos de subcategoria não encontrados. Pulando atualização.");
            return;
        }

        const tipo = tipoSelect.value;
        const categoria = categoriaSelect.value;

        const currentSelectedSubcategoria = subcategoriaSelect.value;
        const currentOutraSubcategoria = outraSubcategoriaInput.value;

        subcategoriaSelect.innerHTML = '<option value="">Selecione a subcategoria</option>';

        if (tipo && categoria && appState.categoriesData[tipo] && appState.categoriesData[tipo][categoria]) {
            appState.categoriesData[tipo][categoria].sort().forEach(subcategoria => {
                const option = document.createElement('option');
                option.value = subcategoria;
                option.textContent = subcategoria;
                subcategoriaSelect.appendChild(option);
            });
            console.log('Subcategorias atualizadas para categoria:', categoria);
        }

        if (currentSelectedSubcategoria && subcategoriaSelect.querySelector(`option[value="${currentSelectedSubcategoria}"]`)) {
            subcategoriaSelect.value = currentSelectedSubcategoria;
            outraSubcategoriaInput.value = '';
        } else {
            outraSubcategoriaInput.value = currentOutraSubcategoria;
        }

        clearValidationError(categoriaSelect);
        clearValidationError(outraSubcategoriaInput);
        toggleCustomCategoryFields();
    } catch (error) {
        console.error('Erro ao atualizar subcategorias:', error);
        showAlert('Erro ao carregar subcategorias: ' + error.message, CONSTANTS.ALERT_TYPE_ERROR);
    }
}

// Alterna a visibilidade dos campos 'Ou Outra Categoria/Subcategoria' usando classes CSS.
function toggleCustomCategoryFields() {
    const { categoriaSelect, outraCategoriaInput, subcategoriaSelect, outraSubcategoriaInput,
            categoriaGroup, outraCategoriaGroup, subcategoriaGroup, outraSubcategoriaGroup } = appState.domElements;

    if (!categoriaSelect || !outraCategoriaInput || !subcategoriaSelect || !outraSubcategoriaInput ||
        !categoriaGroup || !outraCategoriaGroup || !subcategoriaGroup || !outraSubcategoriaGroup) {
        console.warn('Elementos de campos de categoria/subcategoria não encontrados. Pulando toggle.');
        return;
    }

    // Lógica para categoria.
    if (outraCategoriaInput.value.trim() !== '') {
        categoriaGroup.classList.add('hidden-field');
        categoriaSelect.value = '';
        categoriaSelect.removeAttribute('required');
        outraCategoriaInput.setAttribute('required', 'required');
    } else {
        categoriaGroup.classList.remove('hidden-field');
        categoriaSelect.setAttribute('required', 'required');
        outraCategoriaInput.removeAttribute('required');
    }

    // Lógica para subcategoria.
    if (outraSubcategoriaInput.value.trim() !== '') {
        subcategoriaGroup.classList.add('hidden-field');
        subcategoriaSelect.value = '';
        subcategoriaSelect.removeAttribute('required');
        outraSubcategoriaInput.setAttribute('required', 'required');
    } else {
        subcategoriaGroup.classList.remove('hidden-field');
        // A subcategoria não é obrigatória por padrão, então não setamos 'required' aqui.
        outraSubcategoriaInput.removeAttribute('required');
    }
}

// ==================== FUNÇÕES DE PREENCHIMENTO AUTOMÁTICO E TOGGLE DE CAMPOS ====================
// Categoriza automaticamente a transação com base na descrição e termos-chave.
function autoCategorizeFromDescription(description, currentTipo) {
    const lowerCaseDescription = String(description).toLowerCase();
    let bestMatch = { category: '', subcategory: '' };
    let longestMatchLength = 0;

    for (const rule of CATEGORY_KEYWORDS) {
        // Se um tipo de transação (receita/despesa) é especificado, só considera regras daquele tipo.
        if (currentTipo && rule.tipo && rule.tipo !== currentTipo) {
            continue;
        }

        for (const term of rule.terms) {
            const lowerCaseTerm = term.toLowerCase();
            // Busca o termo mais longo para uma correspondência mais específica.
            if (lowerCaseDescription.includes(lowerCaseTerm)) {
                if (lowerCaseTerm.length > longestMatchLength) {
                    bestMatch.category = rule.category;
                    bestMatch.subcategory = rule.subcategory;
                    longestMatchLength = lowerCaseTerm.length;
                }
            }
        }
    }
    return bestMatch;
}

// Preenche automaticamente campos do formulário com base na descrição.
async function autoFillFromDescription() {
    const { descricaoInput, meioSelect, tipoSelect, categoriaSelect, subcategoriaSelect, outraCategoriaInput, outraSubcategoriaInput } = appState.domElements;
    if (!descricaoInput || !meioSelect || !tipoSelect || !categoriaSelect || !subcategoriaSelect || !outraCategoriaInput || !outraSubcategoriaInput) {
        console.warn('Elementos de formulário de preenchimento automático não encontrados.');
        return;
    }

    const description = descricaoInput.value.trim();
    if (description === '') return;

    const currentTipo = tipoSelect.value;

    // Tenta detectar e preencher o meio de pagamento se ainda não selecionado.
    if (!meioSelect.value) {
        const detectedMeio = detectMeioPagamento(null, description);
        if (detectedMeio && meioSelect.querySelector(`option[value="${detectedMeio}"]`)) {
            meioSelect.value = detectedMeio;
            showAlert(`Meio de pagamento sugerido: ${formatMeio(detectedMeio)}`, CONSTANTS.ALERT_TYPE_INFO);
            toggleMeioDependentFields();
            enforceMutualExclusivity();
        }
    }

    // Tenta categorizar e preencher categoria/subcategoria.
    if (currentTipo && !categoriaSelect.value && outraCategoriaInput.value.trim() === '') {
        const { category: detectedCategory, subcategory: detectedSubcategory } = autoCategorizeFromDescription(description, currentTipo);

        if (detectedCategory) {
            let categoryFoundInOptions = false;
            // Tenta selecionar a categoria existente.
            for (let i = 0; i < categoriaSelect.options.length; i++) {
                if (categoriaSelect.options[i].value === detectedCategory) {
                    categoriaSelect.value = detectedCategory;
                    categoryFoundInOptions = true;
                    break;
                }
            }

            // Se não encontrou, sugere como 'outra categoria'.
            if (categoryFoundInOptions) {
                outraCategoriaInput.value = '';
            } else {
                categoriaSelect.value = '';
                outraCategoriaInput.value = detectedCategory;
            }

            // Usa requestAnimationFrame para garantir que as atualizações do DOM ocorram antes de tentar a subcategoria.
            requestAnimationFrame(() => {
                updateSubcategories();
                requestAnimationFrame(() => {
                    if (detectedSubcategory) {
                        let subcategoryFoundInOptions = false;
                        if (outraCategoriaInput.value.trim() === '') { // Se não está usando "outra categoria"
                            for (let i = 0; i < subcategoriaSelect.options.length; i++) {
                                if (subcategoriaSelect.options[i].value === detectedSubcategory) {
                                    subcategoriaSelect.value = detectedSubcategory;
                                    subcategoryFoundInOptions = true;
                                    break;
                                }
                            }
                        }

                        if (subcategoryFoundInOptions) {
                            outraSubcategoriaInput.value = '';
                        } else {
                            subcategoriaSelect.value = '';
                            outraSubcategoriaInput.value = detectedSubcategory;
                        }
                    } else {
                        outraSubcategoriaInput.value = '';
                    }
                    toggleCustomCategoryFields();
                });
            });
            showAlert(`Categoria sugerida: ${detectedCategory}` + (detectedSubcategory ? ` / ${detectedSubcategory}` : ''), CONSTANTS.ALERT_TYPE_INFO);
        }
    }
}

// Controla a visibilidade dos campos relacionados à recorrência usando classes CSS.
function toggleRecurringFields() {
    const { isRecurringCheckbox, recurringFieldsContainer, recurringFrequencySelect } = appState.domElements;

    if (isRecurringCheckbox && recurringFieldsContainer && recurringFrequencySelect) {
        recurringFieldsContainer.classList.toggle('hidden-field', !isRecurringCheckbox.checked);
        recurringFrequencySelect.required = isRecurringCheckbox.checked;
        if (!isRecurringCheckbox.checked) {
            recurringFrequencySelect.value = '';
            clearValidationError(recurringFrequencySelect);
        }
    }
}

// Controla a visibilidade dos campos relacionados ao parcelamento usando classes CSS.
function toggleInstallmentFields() {
    const { paymentTypeInstallment, numInstallmentsGroup, numInstallmentsInput } = appState.domElements;
    if (paymentTypeInstallment && numInstallmentsGroup && numInstallmentsInput) {
        numInstallmentsGroup.classList.toggle('hidden-field', !paymentTypeInstallment.checked);
        numInstallmentsInput.required = paymentTypeInstallment.checked;
        if (!paymentTypeInstallment.checked) {
            numInstallmentsInput.value = 1;
            clearValidationError(numInstallmentsInput);
        }
    }
}

// Controla a visibilidade dos campos dependentes do meio de transação (ex: parcelamento para cartão de crédito) usando classes CSS.
function toggleMeioDependentFields() {
    const { meioSelect, installmentOptionsContainer, paymentTypeSingle, numInstallmentsInput } = appState.domElements;

    if (meioSelect && installmentOptionsContainer && paymentTypeSingle && numInstallmentsInput) {
        if (meioSelect.value === 'cartao_credito') {
            installmentOptionsContainer.classList.remove('hidden-field');
        } else {
            installmentOptionsContainer.classList.add('hidden-field');
            paymentTypeSingle.checked = true;
            numInstallmentsInput.value = 1;
        }
        toggleInstallmentFields();
    }
}

// Garante que uma transação não seja recorrente E parcelada ao mesmo tempo.
// PRIORIZA PARCELAMENTO.
function enforceMutualExclusivity() {
    const { isRecurringCheckbox, meioSelect, paymentTypeSingle, paymentTypeInstallment } = appState.domElements;

    if (!isRecurringCheckbox || !meioSelect || !paymentTypeSingle || !paymentTypeInstallment) return;

    const isCurrentlyRecurring = isRecurringCheckbox.checked;
    const isCurrentlyInstallment = meioSelect.value === 'cartao_credito' && paymentTypeInstallment.checked;

    if (isCurrentlyRecurring && isCurrentlyInstallment) {
        isRecurringCheckbox.checked = false;
        toggleRecurringFields();
        showAlert('Uma transação não pode ser recorrente e parcelada simultaneamente. A opção de recorrência foi desativada.', CONSTANTS.ALERT_TYPE_INFO);
    } else if (isCurrentlyRecurring) {
        // Se recorrência está ativada, garante que parcelamento esteja desativado.
        // Se o meio for cartão de crédito, volta para 'single' e desativa campos de parcela
        if (meioSelect.value === 'cartao_credito') {
            paymentTypeSingle.checked = true;
            toggleMeioDependentFields();
        }
    } else if (isCurrentlyInstallment) {
        // Se parcelamento está ativado, garante que recorrência esteja desativada.
        isRecurringCheckbox.checked = false;
        toggleRecurringFields();
    }
}


// ==================== FORMULÁRIO DE TRANSAÇÃO (CADASTRO) ====================
// NOVA FUNÇÃO AUXILIAR: Coleta os dados do formulário de transação.
function getTransactionDataFromForm(formElements) {
    return {
        dataTransacao: formElements.data.value,
        tipo: formElements.tipo.value,
        categoriaFinal: formElements.outraCategoria.value.trim() || formElements.categoria.value,
        subcategoriaFinal: formElements.outraSubcategoria.value.trim() || formElements.subcategoria.value || '',
        // Usa a nova função robusta para converter o valor
        valorOriginal: parseBrazilianCurrencyStringToFloat(formElements.valor.value),
        meio: formElements.meio.value,
        descricaoOriginal: formElements.descricao.value || '',
        isRecurringChecked: formElements.isRecurringCheckbox?.checked,
        recurringFrequency: formElements.isRecurringCheckbox?.checked ? formElements.recurringFrequencySelect.value : null,
        isInstallmentSelected: formElements.paymentType?.value === CONSTANTS.PAYMENT_TYPE_INSTALLMENT,
        numInstallments: parseInt(formElements.numInstallmentsInput.value)
    };
}

// NOVA FUNÇÃO AUXILIAR: Atualiza a estrutura de categorias se uma nova categoria/subcategoria for usada.
async function updateCategoriesIfNeeded(tipo, categoriaFinal, subcategoriaFinal) {
    let categoriesDataChanged = false;
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
    if (categoriaFinal && subcategoriaFinal && !appState.categoriesData[tipo][categoriaFinal].includes(subcategoryName)) {
        appState.categoriesData[tipo][categoriaFinal].push(subcategoriaFinal);
        categoriesDataChanged = true;
    }
    if (categoriesDataChanged) {
        await db.appSettings.update('generalSettings', { categoriesData: appState.categoriesData });
    }
}

// NOVA FUNÇÃO AUXILIAR: Constrói o array de transações a serem salvas, manipulando parcelamentos e recorrências.
async function buildTransactionsArray(formData, originalTransactionId) {
    let transactionsToSave = [];
    const { dataTransacao, tipo, categoriaFinal, subcategoriaFinal, valorOriginal, meio, descricaoOriginal,
            isRecurringChecked, recurringFrequency, isInstallmentSelected, numInstallments } = formData;

    // Lógica para exclusão de série antiga em caso de edição.
    if (originalTransactionId) {
        const existingTransaction = await db.transactions.get(originalTransactionId);
        if (existingTransaction && (existingTransaction.isInstallment || existingTransaction.isRecurring)) {
            // MELHORIA: Usa modal de confirmação customizado
            return new Promise((resolve) => {
                const message = existingTransaction.isInstallment
                    ? 'Esta transação é parte de uma série parcelada. Ao editar o número de parcelas ou o valor total, a série antiga será excluída e uma nova será criada. Continuar?'
                    : 'Esta transação era recorrente. Ao converter para parcelamento/única, a série recorrente antiga será excluída. Continuar?';

                showConfirmationModal('Atenção: Edição de Série!', message, async (confirmed) => {
                    if (confirmed) {
                        let idsToDelete = [];
                        if (existingTransaction.isInstallment) {
                            const groupIdToDelete = existingTransaction.groupId || originalTransactionId;
                            idsToDelete = await db.transactions.where('groupId').equals(groupIdToDelete).primaryKeys();
                        } else if (existingTransaction.isRecurring) {
                            const recurringIdToDelete = existingTransaction.parentRecurringId || originalTransactionId;
                            idsToDelete = await db.transactions.where('parentRecurringId').equals(recurringIdToDelete).primaryKeys();
                            if (existingTransaction.id === recurringIdToDelete) {
                                idsToDelete.push(recurringIdToDelete);
                            }
                        }
                        if (idsToDelete.length > 0) {
                            await db.transactions.bulkDelete(idsToDelete);
                        }
                        resolve(await _buildTransactionsArrayInternal(formData, null)); // Chamada interna com originalTransactionId = null
                    } else {
                        resolve(null); // Retorna null para indicar que a operação foi cancelada
                    }
                });
            });
        }
    }
    // Lógica original continua aqui, mas encapsulada ou chamada após a confirmação
    return _buildTransactionsArrayInternal(formData, originalTransactionId);
}

// Função auxiliar para evitar duplicação de lógica após a confirmação
async function _buildTransactionsArrayInternal(formData, originalTransactionId) {
    let transactionsToSave = [];
    const { dataTransacao, tipo, categoriaFinal, subcategoriaFinal, valorOriginal, meio, descricaoOriginal,
            isRecurringChecked, recurringFrequency, isInstallmentSelected, numInstallments } = formData;

    // Lógica para transações parceladas (aplica-se apenas a cartão de crédito).
    if (meio === 'cartao_credito' && isInstallmentSelected) {
        const valuePerInstallment = parseFloat((valorOriginal / numInstallments).toFixed(2));

        // Ajusta centavos para a última parcela, garantindo que o total seja exato.
        const totalExactValue = parseFloat((valuePerInstallment * numInstallments).toFixed(2));
        const difference = parseFloat((valorOriginal - totalExactValue).toFixed(2));

        // Define um groupId para agrupar todas as parcelas da mesma compra.
        const installmentGroupId = originalTransactionId || Date.now();

        // Cria uma transação para cada parcela.
        for (let i = 1; i <= numInstallments; i++) {
            // Calcula a data da parcela (primeira parcela na data original, as demais em meses subsequentes).
            const installmentDate = addMonths(new Date(dataTransacao + 'T00:00:00'), i - 1).toISOString().split('T')[0];
            let installmentValue = valuePerInstallment;
            if (i === numInstallments && difference !== 0) {
                installmentValue = parseFloat((installmentValue + difference).toFixed(2));
            }

            transactionsToSave.push({
                data: installmentDate,
                tipo: tipo,
                categoria: categoriaFinal,
                subcategoria: subcategoriaFinal,
                valor: installmentValue,
                meio: meio,
                descricao: descricaoOriginal,
                dataCreated: new Date().toISOString(),
                isRecurring: false,
                recurringFrequency: null,
                nextOccurrenceDate: null,
                parentRecurringId: null,
                isInstallment: true,
                installmentInfo: {
                    current: i,
                    total: numInstallments
                },
                groupId: installmentGroupId
            });
        }
    } else {
        // Lógica para transação única ou recorrente.
        const transaction = {
            id: originalTransactionId || Date.now(), // Usa ID existente ou gera um novo
            data: dataTransacao,
            tipo: tipo,
            categoria: categoriaFinal,
            subcategoria: subcategoriaFinal,
            valor: valorOriginal,
            meio: meio,
            descricao: descricaoOriginal,
            dataCreated: new Date().toISOString(),
            isInstallment: false,
            installmentInfo: null,
            groupId: null,
            isRecurring: isRecurringChecked,
            recurringFrequency: recurringFrequency,
            nextOccurrenceDate: isRecurringChecked ? calculateNextOccurrence(dataTransacao, recurringFrequency) : null,
            parentRecurringId: null // Este é o modelo original, não tem pai
        };
        transactionsToSave.push(transaction);
    }
    return transactionsToSave;
}


// A FUNÇÃO PRINCIPAL FICA MAIS LIMPA E LEGÍVEL
async function handleTransactionSubmit(event) {
    event.preventDefault();
    try {
        console.log('Processando envio de transação...');
        const formElements = event.target.elements;
        const errors = validateForm(formElements);

        if (Object.keys(errors).length > 0) {
            displayValidationErrors(errors);
            showAlert('Por favor, corrija os erros no formulário.', CONSTANTS.ALERT_TYPE_ERROR);
            return;
        }

        clearAllValidationErrors();

        // Passo 1: Coleta de dados do formulário
        const formData = getTransactionDataFromForm(formElements);

        // Passo 2: Atualização de categorias se necessário
        await updateCategoriesIfNeeded(formData.tipo, formData.categoriaFinal, formData.subcategoriaFinal);

        // Passo 3: Construção dos objetos de transação (parcelado, recorrente, único)
        const transactionsToSave = await buildTransactionsArray(formData, appState.editingTransactionId);
        if (transactionsToSave === null) { // Operação cancelada pelo usuário
            return;
        }
        if (transactionsToSave.length === 0) {
            showAlert('Nenhuma transação para salvar.', CONSTANTS.ALERT_TYPE_INFO);
            return;
        }

        // Passo 4: Salvar as transações no banco de dados.
        // BulkAdd é mais eficiente para múltiplos registros, mas 'put' para um único pode ser update.
        // Para séries parceladas, a primeira transação é 'put' (pode ser atualização), as demais são 'bulkAdd'.
        const firstTransaction = transactionsToSave[0];
        await db.transactions.put(firstTransaction); // 'put' pode atualizar se id já existe

        const subsequentTransactions = transactionsToSave.slice(1);
        if (subsequentTransactions.length > 0) {
            await db.transactions.bulkAdd(subsequentTransactions); // 'bulkAdd' só adiciona, não atualiza
        }
        showAlert('Transação(ões) salva(s) com sucesso!', CONSTANTS.ALERT_TYPE_SUCCESS);

        // Passo 5: Limpar o formulário e atualizar a UI
        appState.editingTransactionId = null;
        clearForm();
        await loadTransactions(); // Recarrega com await para garantir que esteja atualizado
        await generateReports(); // Recarrega com await
        updateFilterCategories();
        loadCategoriesManagementTable();
    } catch (error) {
        console.error('Erro ao salvar transação:', error);
        showAlert('Erro ao salvar transação: ' + error.message, CONSTANTS.ALERT_TYPE_ERROR);
    }
}

// Valida os campos do formulário de transação.
function validateForm(elements) {
    const errors = {};
    const { dataInput, tipoSelect, categoriaSelect, outraCategoriaInput, valorInput, meioSelect, descricaoInput,
            isRecurringCheckbox, recurringFrequencySelect, paymentTypeInstallment, numInstallmentsInput } = appState.domElements;
    // Validação da Data.
    if (!elements.data || !elements.data.value) {
        errors.data = 'Data é obrigatória.';
        dataInput?.setAttribute('aria-invalid', 'true');
    }
    // NOTA: A validação de "data não pode ser futura" foi removida conforme sua solicitação.

    // Validação do Tipo de Transação.
    if (!elements.tipo || !elements.tipo.value) {
        errors.tipo = 'Tipo de transação é obrigatório.';
        tipoSelect?.setAttribute('aria-invalid', 'true');
    }

    // Validação de Categoria (uma das duas deve ser preenchida, não ambas).
    const categoriaPredefinida = elements.categoria?.value;
    const outraCategoria = elements.outraCategoria?.value.trim();

    if (!categoriaPredefinida && !outraCategoria) {
        errors.categoria = 'Selecione uma categoria ou digite uma nova.';
        categoriaSelect?.classList.add('is-invalid');
        outraCategoriaInput?.classList.add('is-invalid');
    } else if (categoriaPredefinida && outraCategoria) {
        errors.categoria = 'Selecione apenas uma opção para categoria.';
        errors.outraCategoria = 'Selecione apenas uma opção para categoria.';
        categoriaSelect?.classList.add('is-invalid');
        outraCategoriaInput?.classList.add('is-invalid');
    } else if (outraCategoria && outraCategoria.length > 50) {
        errors.outraCategoria = 'Categoria personalizada muito longa.';
        outraCategoriaInput?.classList.add('is-invalid');
    }

    // Validação do Valor.
    // Usa a nova função robusta para converter o valor para validação
    const valor = parseBrazilianCurrencyStringToFloat(elements.valor?.value);
    if (isNaN(valor) || valor <= 0) {
        errors.valor = 'Valor deve ser um número maior que zero.';
        valorInput?.setAttribute('aria-invalid', 'true');
    }

    // Validação do Meio de Transação.
    if (!elements.meio || !elements.meio.value) {
        errors.meio = 'Meio de transação é obrigatório.';
        meioSelect?.setAttribute('aria-invalid', 'true');
    }

    // Validação de Recorrência.
    if (isRecurringCheckbox?.checked && !recurringFrequencySelect?.value) {
        errors.recurringFrequencySelect = 'Frequência de recorrência é obrigatória.';
        recurringFrequencySelect?.classList.add('is-invalid');
    }

    // Validação de Parcelamento.
    if (elements.meio?.value === 'cartao_credito' && paymentTypeInstallment?.checked) {
        const numInstallments = parseInt(numInstallmentsInput?.value);
        if (isNaN(numInstallments) || numInstallments <= 0) {
            errors.numInstallmentsInput = 'Número de parcelas deve ser um número inteiro maior que zero.';
            numInstallmentsInput?.classList.add('is-invalid');
        }
    }

    // Validação da Descrição.
    if (elements.descricao?.value && elements.descricao.value.length > 255) {
        errors.descricao = 'Descrição não pode ter mais que 255 caracteres.';
        descricaoInput?.setAttribute('aria-invalid', 'true');
    }
    return errors;
}

// Exibe mensagens de erro de validação nos campos do formulário.
function displayValidationErrors(errors) {
    clearAllValidationErrors(); // Garante que todos os erros anteriores sejam limpos
    for (const fieldId in errors) {
        const inputElement = document.getElementById(fieldId);
        const errorMessageElement = document.getElementById(`${fieldId}-error`);

        if (inputElement) {
            inputElement.classList.add('is-invalid');
            inputElement.setAttribute('aria-describedby', `${fieldId}-error`);
        }
        if (errorMessageElement) {
            errorMessageElement.textContent = errors[fieldId];
            errorMessageElement.style.display = 'block';
            errorMessageElement.setAttribute('aria-live', 'assertive');
        }
    }
}

// Limpa a mensagem de erro de um campo específico.
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

// Limpa todas as mensagens de erro de validação do formulário.
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

// Limpa o formulário de transação, resetando valores e estados.
function clearForm() {
    try {
        const form = appState.domElements.transactionForm;
        const { dataInput, isRecurringCheckbox, recurringFrequencySelect, meioSelect,
                paymentTypeSingle, paymentTypeInstallment, numInstallmentsInput,
                outraCategoriaInput, outraSubcategoriaInput, valorInput } = appState.domElements;

        if (form) {
            form.reset();
            if (dataInput) dataInput.value = new Date().toISOString().split('T')[0];
            if (valorInput) valorInput.value = ''; // Limpa o valor para garantir formatação inicial

            updateCategories();
            updateSubcategories();

            if (outraCategoriaInput) outraCategoriaInput.value = '';
            if (outraSubcategoriaInput) outraSubcategoriaInput.value = '';

            if (isRecurringCheckbox) {
                isRecurringCheckbox.checked = false;
                isRecurringCheckbox.disabled = false;
            }
            if (recurringFrequencySelect) recurringFrequencySelect.value = '';

            if (meioSelect) meioSelect.value = '';

            if (paymentTypeSingle) {
                paymentTypeSingle.checked = true;
                if (paymentTypeInstallment) paymentTypeInstallment.disabled = false;
            }
            if (numInstallmentsInput) {
                numInstallmentsInput.value = 1;
                numInstallmentsInput.disabled = false;
            }

            appState.editingTransactionId = null;
            clearAllValidationErrors();
            toggleCustomCategoryFields();
            toggleRecurringFields();
            toggleMeioDependentFields();
            enforceMutualExclusivity();

            console.log('Formulário de transação limpo');
        }
    } catch (error) {
        console.error('Erro ao limpar formulário:', error);
    }
}

/**
 * Converte uma string no formato monetário (potencialmente em formato brasileiro ou misto) para um número float.
 * Trata:
 * - "1.234,56" (Padrão brasileiro) -> 1234.56
 * - "1,234.56" (Padrão americano) -> 1234.56
 * - "1234,56" -> 1234.56
 * - "1234.56" -> 1234.56
 * - "9.008,44" -> 9008.44
 *
 * @param {string} valueStr A string do valor a ser convertido.
 * @returns {number} O valor numérico (float) ou NaN se a conversão falhar.
 */
function parseBrazilianCurrencyStringToFloat(valueStr) {
    if (typeof valueStr !== 'string') {
        valueStr = String(valueStr);
    }

    // 1. Remove qualquer caractere que não seja dígito, vírgula ou ponto
    let cleanedValue = valueStr.replace(/[^\d,.]/g, '');

    // 2. Determine decimal and thousands separators based on presence and position
    const lastCommaIndex = cleanedValue.lastIndexOf(',');
    const lastDotIndex = cleanedValue.lastIndexOf('.');

    let floatValue;

    // Caso 1: Ambos vírgula e ponto estão presentes.
    if (lastCommaIndex !== -1 && lastDotIndex !== -1) {
        if (lastCommaIndex > lastDotIndex) { // Formato brasileiro: vírgula é decimal, ponto é milhar
            // Remove todos os pontos, então substitui a vírgula por ponto
            cleanedValue = cleanedValue.replace(/\./g, '').replace(',', '.');
            floatValue = parseFloat(cleanedValue);
        } else { // Formato americano: ponto é decimal, vírgula é milhar
            // Remove todas as vírgulas, então mantém o ponto
            cleanedValue = cleanedValue.replace(/,/g, '');
            floatValue = parseFloat(cleanedValue);
        }
    }
    // Caso 2: Apenas vírgula está presente (implica decimal brasileiro)
    else if (lastCommaIndex !== -1) {
        cleanedValue = cleanedValue.replace(',', '.');
        floatValue = parseFloat(cleanedValue);
    }
    // Caso 3: Apenas ponto está presente (implica decimal americano, ou número simples com ponto)
    else if (lastDotIndex !== -1) {
        floatValue = parseFloat(cleanedValue);
    }
    // Caso 4: Nenhuma vírgula ou ponto (número inteiro)
    else {
        floatValue = parseInt(cleanedValue);
    }

    return floatValue;
}


/**
 * Formata um número float para uma string no formato monetário brasileiro (ex: "1.234,56").
 * @param {number} value O número float a ser formatado.
 * @returns {string} A string formatada no padrão monetário brasileiro.
 */
function formatFloatToBrazilianCurrencyString(value) {
    if (isNaN(value)) {
        return '';
    }
    // Usa toLocaleString com as opções de pt-BR para garantir o formato correto.
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}


// ==================== GERENCIAMENTO DE CATEGORIAS PERSONALIZADAS ====================
// Carrega e exibe a tabela de gerenciamento de categorias nas configurações.
async function loadCategoriesManagementTable() {
    try {
        console.log('Carregando tabela de gerenciamento de categorias...');
        const { categoryManagementBody } = appState.domElements;
        if (!categoryManagementBody) {
            console.warn("Elementos de categoria/subcategoria não encontrados. Pulando atualização.");
            return;
        }
        categoryManagementBody.innerHTML = '';

        const fragment = document.createDocumentFragment();

        for (const tipo in appState.categoriesData) {
            const categoriasDoTipo = appState.categoriesData[tipo];
            const sortedCategories = Object.keys(categoriasDoTipo).sort();

            if (sortedCategories.length === 0) {
                const row = document.createElement('tr');
                const cell = document.createElement('td');
                cell.colSpan = 4;
                cell.textContent = `Nenhuma categoria cadastrada para ${tipo}.`;
                row.appendChild(cell);
                fragment.appendChild(row);
            } else {
                sortedCategories.forEach(categoria => {
                    const subcategorias = categoriasDoTipo[categoria].sort();
                    const row = document.createElement('tr');

                    const tdTipo = document.createElement('td');
                    tdTipo.textContent = tipo.charAt(0).toUpperCase() + tipo.slice(1);
                    row.appendChild(tdTipo);

                    const tdCategoria = document.createElement('td');
                    tdCategoria.textContent = categoria;
                    row.appendChild(tdCategoria);

                    const tdSubcategorias = document.createElement('td');
                    const ulSubcategories = document.createElement('ul');
                    ulSubcategories.className = 'subcategories-list';
                    subcategorias.forEach(sub => {
                        const li = document.createElement('li');
                        li.textContent = sub; // Usando textContent para evitar XSS
                        ulSubcategories.appendChild(li);
                    });
                    tdSubcategorias.appendChild(ulSubcategories);

                    const addSubcategoryBtn = document.createElement('button');
                    addSubcategoryBtn.className = 'btn btn-sm btn-info';
                    addSubcategoryBtn.onclick = () => addSubcategoryPrompt(tipo, categoria);
                    addSubcategoryBtn.setAttribute('aria-label', `Adicionar subcategoria a ${categoria}`);
                    addSubcategoryBtn.textContent = '➕ Subcategoria';
                    tdSubcategorias.appendChild(addSubcategoryBtn);
                    row.appendChild(tdSubcategorias);


                    const tdActions = document.createElement('td');
                    tdActions.className = 'table-actions-btns';

                    const editBtn = document.createElement('button');
                    editBtn.className = 'btn btn-sm btn-secondary';
                    editBtn.onclick = () => editCategory(tipo, categoria);
                    editBtn.setAttribute('aria-label', `Editar categoria ${categoria}`);
                    editBtn.textContent = '✏️';
                    tdActions.appendChild(editBtn);

                    const deleteBtn = document.createElement('button');
                    deleteBtn.className = 'btn btn-sm btn-danger';
                    deleteBtn.onclick = () => deleteCategoryOrSubcategory(tipo, categoria);
                    deleteBtn.setAttribute('aria-label', `Excluir categoria ${categoria}`);
                    deleteBtn.innerHTML = '&#x1F5D1;'; // Ícone da lixeira com entidade HTML
                    tdActions.appendChild(deleteBtn);

                    row.appendChild(tdActions);
                    fragment.appendChild(row);
                });
            }
        }
        categoryManagementBody.appendChild(fragment);
        console.log('Tabela de gerenciamento de categorias carregada.');
    } catch (error) {
        console.error('Erro ao carregar tabela de gerenciamento de categorias:', error);
        showAlert('Erro ao carregar categorias personalizadas: ' + error.message, CONSTANTS.ALERT_TYPE_ERROR);
    }
}

// Manipula o envio do formulário de gerenciamento de categorias (adicionar/editar).
async function handleCategoryManagementSubmit(event) {
    event.preventDefault();
    try {
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

        if (!appState.categoriesData[type]) {
            appState.categoriesData[type] = {};
        }

        // Lógica para edição ou adição de subcategoria em uma categoria existente.
        if (appState.editingCategoryId && appState.editingCategoryId.category === categoryName && appState.editingCategoryId.type === type) {
            if (subcategoryName && !appState.categoriesData[type][categoryName].includes(subcategoryName)) {
                appState.categoriesData[type][categoryName].push(subcategoryName);
                appState.categoriesData[type][categoryName].sort();
                showAlert(`Subcategoria "${subcategoryName}" adicionada à categoria "${categoryName}"!`, CONSTANTS.ALERT_TYPE_SUCCESS);
            } else if (subcategoryName && appState.categoriesData[type][categoryName].includes(subcategoryName)) {
                showAlert(`Subcategoria "${subcategoryName}" já existe na categoria "${categoryName}".`, CONSTANTS.ALERT_TYPE_INFO);
            } else {
                showAlert(`Nenhuma alteração feita na categoria "${categoryName}".`, CONSTANTS.ALERT_TYPE_INFO);
            }
        } else {
            // Lógica para renomear uma categoria existente ou adicionar uma nova.
            if (appState.editingCategoryId && appState.editingCategoryId.type === type && appState.editingCategoryId.category !== categoryName) {
                if (appState.categoriesData[type][categoryName]) {
                    showAlert(`A categoria "${categoryName}" já existe. Não é possível renomear para um nome existente.`, CONSTANTS.ALERT_TYPE_ERROR);
                    return;
                }
                appState.categoriesData[type][categoryName] = appState.categoriesData[type][appState.editingCategoryId.category];
                delete appState.categoriesData[type][appState.editingCategoryId.category];
                showAlert(`Categoria "${appState.editingCategoryId.category}" renomeada para "${categoryName}"!`, CONSTANTS.ALERT_TYPE_SUCCESS);
            } else {
                // Adiciona uma nova categoria.
                if (!appState.categoriesData[type][categoryName]) {
                    appState.categoriesData[type][categoryName] = [];
                    showAlert(`Categoria "${categoryName}" adicionada!`, CONSTANTS.ALERT_TYPE_SUCCESS);
                } else {
                    showAlert(`A categoria "${categoryName}" já existe.`, CONSTANTS.ALERT_TYPE_INFO);
                }
            }

            // Adiciona subcategoria se fornecida e não existir.
            if (subcategoryName && !appState.categoriesData[type][categoryName].includes(subcategoryName)) {
                appState.categoriesData[type][categoryName].push(subcategoryName);
                appState.categoriesData[type][categoryName].sort();
                if (appState.editingCategoryId && appState.editingCategoryId.category === categoryName) {
                    showAlert(`Subcategoria "${subcategoryName}" adicionada à categoria "${categoryName}"!`, CONSTANTS.ALERT_TYPE_SUCCESS);
                }
            }
        }

        // Salva as categorias atualizadas no appSettings.
        await db.appSettings.update('generalSettings', { categoriesData: appState.categoriesData });

        clearCategoryForm();
        loadCategoriesManagementTable();
        updateCategories();
        updateFilterCategories();
    } catch (error) {
        console.error('Erro ao salvar categoria:', error);
        showAlert('Erro ao salvar categoria: ' + error.message, CONSTANTS.ALERT_TYPE_ERROR);
    }
}

// Valida o formulário de gerenciamento de categorias.
function validateCategoryForm(elements) {
    const errors = {};
    const { categoryTypeSelect, categoryNameInput, subcategoryNameInput } = appState.domElements;

    // Clear previous errors using clearValidationError for consistency
    if (categoryTypeSelect) clearValidationError(categoryTypeSelect);
    if (categoryNameInput) clearValidationError(categoryNameInput);
    if (subcategoryNameInput) clearValidationError(subcategoryNameInput);

    if (!elements.categoryType || !elements.categoryType.value) {
        errors.categoryType = 'Tipo de transação é obrigatório.';
        categoryTypeSelect?.setAttribute('aria-invalid', 'true');
    }

    const categoryName = elements.categoryName?.value.trim();
    if (!categoryName) {
        errors.categoryName = 'Nome da categoria é obrigatório.';
        categoryNameInput?.setAttribute('aria-invalid', 'true');
    } else if (categoryName.length > 50) {
        errors.categoryName = 'Nome da categoria muito longo.';
        categoryNameInput?.setAttribute('aria-invalid', 'true');
    }

    const subcategoryName = elements.subcategoryName?.value.trim();
    if (subcategoryName && subcategoryName.length > 50) {
        errors.subcategoryName = 'Nome da subcategoria muito longo.';
        subcategoryNameInput?.setAttribute('aria-invalid', 'true');
    }

    return errors;
}

// Limpa o formulário de gerenciamento de categorias.
function clearCategoryForm() {
    const { categoryManagementForm: form, saveCategoryBtn, categoryTypeSelect, categoryNameInput, subcategoryNameInput } = appState.domElements;
    if (form) {
        form.reset();
        if (saveCategoryBtn) saveCategoryBtn.textContent = '💾 Salvar Categoria/Subcategoria';
        appState.editingCategoryId = null;
        clearAllValidationErrors();
        // Clear specific fields if they might retain invalid state
        if (categoryTypeSelect) clearValidationError(categoryTypeSelect);
        if (categoryNameInput) clearValidationError(categoryNameInput);
        if (subcategoryNameInput) clearValidationError(subcategoryNameInput);
        console.log('Formulário de gerenciamento de categorias limpo.');
    }
}

// Carrega dados de uma categoria para edição no formulário.
function editCategory(type, category) {
    const { categoryTypeSelect, categoryNameInput, subcategoryNameInput, saveCategoryBtn } = appState.domElements;
    if (categoryTypeSelect && categoryNameInput && subcategoryNameInput && saveCategoryBtn) {
        categoryTypeSelect.value = type;
        categoryNameInput.value = category;
        subcategoryNameInput.value = '';
        appState.editingCategoryId = { type, category };
        saveCategoryBtn.textContent = 'Atualizar Categoria';
        showAlert(`Editando categoria "${category}". Você pode renomeá-la ou adicionar uma subcategoria.`, CONSTANTS.ALERT_TYPE_INFO);
        console.log(`Carregado para edição: Tipo=${type}, Categoria=${category}`);
    }
}

// Preenche o formulário para adicionar uma nova subcategoria a uma categoria existente.
function addSubcategoryPrompt(type, category) {
    editCategory(type, category);
    if (appState.domElements.subcategoryNameInput) {
        appState.domElements.subcategoryNameInput.focus();
    }
    showAlert(`Adicione uma nova subcategoria para "${category}".`, CONSTANTS.ALERT_TYPE_INFO);
}

// Exclui uma categoria ou subcategoria.
async function deleteCategoryOrSubcategory(type, category, subcategory = null) {
    if (!appState.categoriesData[type]) {
        showAlert('Tipo de categoria não encontrado.', CONSTANTS.ALERT_TYPE_ERROR);
        return;
    }
    if (!appState.categoriesData[type][category]) {
        showAlert('Categoria não encontrada.', CONSTANTS.ALERT_TYPE_ERROR);
        return;
    }

    if (subcategory) {
        // MELHORIA: Usa modal de confirmação customizado
        showConfirmationModal('Confirmar Exclusão', `Tem certeza que deseja excluir a subcategoria "${subcategory}" da categoria "${category}" (${type})?`, async (confirmed) => {
            if (confirmed) {
                const index = appState.categoriesData[type][category].indexOf(subcategory);
                if (index > -1) {
                    appState.categoriesData[type][category].splice(index, 1);
                    showAlert(`Subcategoria "${subcategory}" excluída!`, CONSTANTS.ALERT_TYPE_SUCCESS);
                }
                await db.appSettings.update('generalSettings', { categoriesData: appState.categoriesData });
                loadCategoriesManagementTable();
                updateCategories();
                updateFilterCategories();
            }
        });
    } else {
        const transactionsUsingCategory = await db.transactions
            .where({ tipo: type, categoria: category })
            .count();

        if (transactionsUsingCategory > 0) {
            showAlert(`Não é possível excluir a categoria "${category}" (${type}) porque há ${transactionsUsingCategory} transação(ões) associada(s) a ela.`, CONSTANTS.ALERT_TYPE_ERROR);
            return;
        }

        // MELHORIA: Usa modal de confirmação customizado
        showConfirmationModal('Confirmar Exclusão', `Tem certeza que deseja excluir a categoria "${category}" (${type}) e todas as suas subcategorias? Esta ação não pode ser desfeita.`, async (confirmed) => {
            if (confirmed) {
                delete appState.categoriesData[type][category];
                showAlert(`Categoria "${category}" excluída!`, CONSTANTS.ALERT_TYPE_SUCCESS);
                await db.appSettings.update('generalSettings', { categoriesData: appState.categoriesData });
                loadCategoriesManagementTable();
                updateCategories();
                updateFilterCategories();
            }
        });
    }
}


// ==================== FUNÇÕES DE IMPORTAÇÃO ====================
// Detecta o meio de pagamento de uma transação com base em strings.
function detectMeioPagamento(meioStr, descricaoStr) {
    const lowerCaseMeio = meioStr ? String(meioStr).toLowerCase() : '';
    const lowerCaseDescricao = descricaoStr ? String(descricaoStr).toLowerCase() : '';

    if (CONSTANTS.CARD_CREDIT_TERMS.some(term => lowerCaseMeio.includes(term) || lowerCaseDescricao.includes(term))) {
        return 'cartao_credito';
    }
    if (CONSTANTS.PIX_TERMS.some(term => lowerCaseMeio.includes(term) || lowerCaseDescricao.includes(term))) {
        return 'pix';
    }
    if (CONSTANTS.DEBIT_TERMS.some(term => lowerCaseMeio.includes(term) || lowerCaseDescricao.includes(term))) {
        return 'debito';
    }
    if (CONSTANTS.MONEY_TERMS.some(term => lowerCaseMeio.includes(term) || lowerCaseDescricao.includes(term))) {
        return 'dinheiro';
    }
    if (CONSTANTS.BOLETO_TERMS.some(term => lowerCaseMeio.includes(term) || lowerCaseDescricao.includes(term))) {
        return 'boleto';
    }
    if (CONSTANTS.TRANSFER_TERMS.some(term => lowerCaseMeio.includes(term) || lowerCaseDescricao.includes(term))) {
        return 'transferencia';
    }
    return 'outros';
}

// Processa múltiplos arquivos de importação (CSV, XLSX, XLS).
// MODIFICADO: Agora recebe o documentType selecionado pelo usuário.
async function processFiles(files, documentType) {
    if (files.length === 0) return;
    console.log('Processando', files.length, 'arquivo(s) do tipo:', documentType);
    showImportProgress();

    appState.lastImportedTransactionIds = [];

    let filesProcessed = 0;
    // Usa Promise.all para processar arquivos em paralelo.
    const promises = Array.from(files).map((file) => {
        return new Promise(async (resolve) => {
            const extension = file.name.split('.').pop()?.toLowerCase();
            console.log('Processando arquivo:', file.name, 'Tipo:', extension);

            let promise;
            switch (extension) {
                case 'csv':
                    promise = processCSV(file, documentType); // NOVO: Passa documentType
                    break;
                case 'xlsx':
                case 'xls':
                    promise = processExcel(file, documentType); // NOVO: Passa documentType
                    break;
                case 'pdf':
                    promise = Promise.resolve(showAlert(`A importação de dados de PDF é complexa e não está disponível nesta versão para extração de tabelas. Por favor, utilize CSV ou Excel para o arquivo: ${file.name}.`, CONSTANTS.ALERT_TYPE_ERROR));
                    break;
                default:
                    promise = Promise.resolve(showAlert(`Formato de arquivo não suportado: ${file.name}`, CONSTANTS.ALERT_TYPE_ERROR));
            }

            await promise;
            filesProcessed++;
            updateImportProgress(filesProcessed / files.length * 100);
            resolve();
        });
    });

    await Promise.all(promises);

    // Salva os IDs das transações importadas para a função de desfazer.
    await db.appSettings.update('generalSettings', {
        lastImportedTransactionIds: appState.lastImportedTransactionIds
    });

    setTimeout(hideImportProgress, 1000);
    // Recarrega dados na interface.
    loadTransactions();
    generateReports();
    updateFilterCategories();
    showAlert(`Processamento de ${files.length} arquivo(s) concluído.`, CONSTANTS.ALERT_TYPE_SUCCESS);
}

// Processa um arquivo CSV e importa as transações.
// MODIFICADO: Agora recebe o documentType para aplicar regras específicas.
async function processCSV(file, documentType) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async function(event) {
            try {
                const csv = event.target?.result;
                if (!csv) throw new Error("Conteúdo do CSV vazio.");
                // CORREÇÃO: Usar '\n' para dividir linhas, não '\n'
                const lines = csv.split('\n');
                const importedTransactions = [];

                const header = lines[0].toLowerCase().split(',').map(h => h.trim());
                // Mapeamento de cabeçalhos de coluna.
                const dataIndex = header.findIndex(h => h.includes('data'));
                const descricaoIndex = header.findIndex(h => h.includes('descri'));
                const valorIndex = header.findIndex(h => h.includes('valor'));
                const tipoLancamentoIndex = header.findIndex(h => h.includes('tipo de lançamento') || h === 'tipo');
                const categoriaIndex = header.findIndex(h => h.includes('categoria'));
                const subcategoriaIndex = header.findIndex(h => h.includes('subcategoria'));
                const meioPagamentoIndex = header.findIndex(h => h.includes('meio') || h.includes('pagamento') || h === 'forma de pagamento');

                // Valida se as colunas essenciais existem.
                if (dataIndex === -1 || valorIndex === -1) {
                    showAlert(`Arquivo CSV ${file.name} não possui colunas 'Data' e 'Valor' reconhecíveis.`, CONSTANTS.ALERT_TYPE_ERROR);
                    return reject(new Error('CSV headers missing'));
                }

                // NOVO: Obtém as regras específicas para o tipo de documento selecionado
                const rules = DOCUMENT_TYPE_RULES[documentType] || DOCUMENT_TYPE_RULES[CONSTANTS.DOC_TYPE_GENERIC]; // MELHORIA: Usa constante

                for (let i = 1; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (!line) continue;

                    const columns = line.split(',');
                    // Verifica se a linha tem colunas suficientes para os índices identificados.
                    const maxIndex = Math.max(dataIndex, valorIndex, descricaoIndex, tipoLancamentoIndex, categoriaIndex, subcategoriaIndex, meioPagamentoIndex);
                    if (columns.length <= maxIndex) {
                        console.warn(`Linha ${i+1} do CSV ${file.name} tem colunas insuficientes. Pulando.`);
                        continue;
                    }

                    // Extrai e converte os dados da linha.
                    const dataStr = columns[dataIndex];
                    const valorStr = columns[valorIndex];
                    const descricaoStr = descricaoIndex !== -1 ? columns[descricaoIndex] : '';
                    const tipoLancamentoStr = tipoLancamentoIndex !== -1 ? columns[tipoLancamentoIndex] : '';
                    const categoriaOriginalStr = categoriaIndex !== -1 ? columns[categoriaIndex] : CONSTANTS.UNCATEGORIZED;
                    const subcategoriaOriginalStr = subcategoriaIndex !== -1 ? columns[subcategoriaIndex] : '';
                    const meioPagamentoStr = meioPagamentoIndex !== -1 ? columns[meioPagamentoIndex] : '';
                    // Adaptação para parsing de valores com formato brasileiro em CSV
                    const valor = parseBrazilianCurrencyStringToFloat(valorStr) || 0; // Usando a nova função

                    // Valida o valor numérico.
                    if (isNaN(valor)) {
                        console.warn(`Linha ${i+1} do CSV ${file.name} com valor inválido: "${valorStr}". Pulando.`);
                        continue;
                    }

                    // === NOVO: Aplica a lógica de pré-classificação baseada no tipo de documento ===

                    let tipoTransacao; // Determina o tipo de transação (receita/despesa)
                    const lowerCaseDescricao = String(descricaoStr).toLowerCase();

                    // 1. Prioriza as regras de termos especiais definidas para o tipo de documento
                    let matchedSpecialTerm = false;
                    if (rules.special_terms && rules.special_terms.length > 0) {
                        for (const termRule of rules.special_terms) {
                            if (termRule.terms.some(term => lowerCaseDescricao.includes(term))) {
                                tipoTransacao = termRule.type;
                                matchedSpecialTerm = true;
                                break;
                            }
                        }
                    }

                    // 2. Se não houver termo especial, usa o tipo de lançamento do arquivo ou o sinal do valor
                    if (!matchedSpecialTerm) {
                        const lowerCaseTipoLancamento = String(tipoLancamentoStr).toLowerCase();
                        if (lowerCaseTipoLancamento.includes('estorno') || lowerCaseTipoLancamento.includes('pagamento') || lowerCaseTipoLancamento.includes('receita')) {
                            tipoTransacao = CONSTANTS.TRANSACTION_TYPE_INCOME;
                        } else if (lowerCaseTipoLancamento.includes('compra') || lowerCaseTipoLancamento.includes('despesa')) {
                            tipoTransacao = CONSTANTS.TRANSACTION_TYPE_EXPENSE;
                        } else {
                            tipoTransacao = valor >= 0 ? CONSTANTS.TRANSACTION_TYPE_INCOME : CONSTANTS.TRANSACTION_TYPE_EXPENSE;
                        }
                    }

                    // Determina o meio de pagamento
                    let meioFinal;
                    // Se o tipo de documento tem um 'defaultMeio' forte (não 'outros'), usa-o.
                    if (rules.defaultMeio && rules.defaultMeio !== 'outros') {
                        meioFinal = rules.defaultMeio;
                    } else {
                        // Caso contrário, tenta detectar do arquivo.
                        meioFinal = detectMeioPagamento(meioPagamentoStr, descricaoStr);
                        // Se a detecção falhar (retornar 'outros') e o tipo de documento tiver um 'defaultMeio' configurado, usa-o.
                        if (meioFinal === 'outros' && rules.defaultMeio) {
                            meioFinal = rules.defaultMeio;
                        }
                    }

                    // === FIM DA NOVA LÓGICA ===

                    // Tenta categorizar automaticamente a transação (mantém a lógica existente)
                    const { category: detectedCategory, subcategory: detectedSubcategory } = autoCategorizeFromDescription(descricaoStr, tipoTransacao);
                    const categoriaFinal = detectedCategory || categoriaOriginalStr;
                    const subcategoriaFinal = detectedSubcategory || subcategoriaOriginalStr;

                    // Cria o objeto da transação.
                    const transaction = {
                        data: formatDate(dataStr), // Garante formato 'YYYY-MM-DD' para data.
                        descricao: descricaoStr || '',
                        valor: Math.abs(valor), // Armazena o valor absoluto, o 'tipo' determina receita/despesa
                        tipo: tipoTransacao, // Usa o tipo determinado pela nova lógica
                        categoria: categoriaFinal,
                        subcategoria: subcategoriaFinal,
                        meio: meioFinal, // Usa o meio determinado pela nova lógica
                        dataCreated: new Date().toISOString(),
                        isRecurring: false,
                        recurringFrequency: null,
                        nextOccurrenceDate: null,
                        parentRecurringId: null,
                        isInstallment: false,
                        installmentInfo: null,
                        groupId: null
                    };
                    importedTransactions.push(transaction);
                }

                if (importedTransactions.length > 0) {
                    // bulkAdd para adicionar múltiplas transações de uma vez, mais eficiente.
                    const addedIds = await db.transactions.bulkAdd(importedTransactions, { allKeys: true });
                    appState.lastImportedTransactionIds.push(...addedIds);
                    showAlert(`${importedTransactions.length} transações importadas do arquivo ${file.name}`, CONSTANTS.ALERT_TYPE_SUCCESS);
                    resolve();
                } else {
                    showAlert(`Nenhuma transação válida encontrada no arquivo ${file.name}.`, CONSTANTS.ALERT_TYPE_INFO);
                    resolve(); // Resolve mesmo se vazio para não bloquear outras importações
                }
            } catch (error) {
                console.error('Erro ao processar CSV:', error);
                showAlert('Erro ao processar arquivo CSV: ' + error.message, CONSTANTS.ALERT_TYPE_ERROR);
                reject(error);
            }
        };
        reader.onerror = reject;
        reader.readAsText(file);
    });
}

// Processa um arquivo Excel (XLSX, XLS) e importa as transações.
// MODIFICADO: Agora recebe o documentType para aplicar regras específicas.
async function processExcel(file, documentType) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async function(event) {
            try {
                const data = new Uint8Array(event.target?.result);
                if (!data) throw new Error("Conteúdo do Excel vazio.");
                const workbook = XLSX.read(data, { type: 'array' });

                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                // Valida se o Excel tem dados.
                if (jsonData.length < 2) {
                    showAlert(`Arquivo Excel ${file.name} está vazio ou não possui dados.`, CONSTANTS.ALERT_TYPE_INFO);
                    return reject(new Error('Excel file empty'));
                }

                const headerRow = jsonData[0].map(h => String(h).toLowerCase().trim());
                // Mapeamento de cabeçalhos de coluna.
                const dataIndex = headerRow.findIndex(h => h.includes('data'));
                const valorIndex = headerRow.findIndex(h => h.includes('valor'));
                const descricaoIndex = headerRow.findIndex(h => h.includes('descri'));
                const tipoLancamentoIndex = headerRow.findIndex(h => h.includes('tipo de lançamento') || h === 'tipo');
                const categoriaIndex = headerRow.findIndex(h => h.includes('categoria'));
                const subcategoriaIndex = headerRow.findIndex(h => h.includes('subcategoria'));
                const meioPagamentoIndex = headerRow.findIndex(h => h.includes('meio') || h.includes('pagamento') || h === 'forma de pagamento');

                // Valida se as colunas essenciais existem.
                if (dataIndex === -1 || valorIndex === -1) {
                    showAlert(`Arquivo Excel ${file.name} não possui colunas 'Data' e 'Valor' reconhecíveis.`, CONSTANTS.ALERT_TYPE_ERROR);
                    return reject(new Error('Excel headers missing'));
                }

                // NOVO: Obtém as regras específicas para o tipo de documento selecionado
                const rules = DOCUMENT_TYPE_RULES[documentType] || DOCUMENT_TYPE_RULES[CONSTANTS.DOC_TYPE_GENERIC]; // MELHORIA: Usa constante

                const importedTransactions = [];
                for (let i = 1; i < jsonData.length; i++) {
                    const row = jsonData[i];
                    // Verifica se a linha tem colunas suficientes para os índices identificados.
                    const maxIndex = Math.max(dataIndex, valorIndex, descricaoIndex, tipoLancamentoIndex, categoriaIndex, subcategoriaIndex, meioPagamentoIndex);
                    if (row.length <= maxIndex) {
                        console.warn(`Linha ${i+1} do Excel ${file.name} tem colunas insuficientes. Pulando.`);
                        continue;
                    }

                    // Extrai e converte os dados da linha.
                    const dataValue = row[dataIndex];
                    const valorValue = row[valorIndex];
                    const descricaoValue = descricaoIndex !== -1 ? row[descricaoIndex] : '';
                    const tipoLancamentoValue = tipoLancamentoIndex !== -1 ? row[tipoLancamentoIndex] : '';
                    const categoriaOriginalValue = categoriaIndex !== -1 ? row[categoriaIndex] : CONSTANTS.UNCATEGORIZED;
                    const subcategoriaOriginalValue = subcategoriaIndex !== -1 ? row[subcategoriaIndex] : '';
                    const meioPagamentoValue = meioPagamentoIndex !== -1 ? row[meioPagamentoIndex] : '';
                    
                    // Adaptação para parsing de valores com formato brasileiro ou numérico puro em Excel
                    let valor = parseBrazilianCurrencyStringToFloat(valorValue); // Usando a nova função

                    // Valida o valor numérico.
                    if (isNaN(valor)) {
                        console.warn(`Linha ${i+1} do Excel ${file.name} com valor inválido: "${valorValue}". Pulando.`);
                        continue;
                    }

                    // === NOVO: Aplica a lógica de pré-classificação baseada no tipo de documento ===

                    let tipoTransacao; // Determina o tipo de transação (receita/despesa)
                    const lowerCaseDescricao = String(descricaoValue).toLowerCase();

                    // 1. Prioriza as regras de termos especiais definidas para o tipo de documento
                    let matchedSpecialTerm = false;
                    if (rules.special_terms && rules.special_terms.length > 0) {
                        for (const termRule of rules.special_terms) {
                            if (termRule.terms.some(term => lowerCaseDescricao.includes(term))) {
                                tipoTransacao = termRule.type;
                                matchedSpecialTerm = true;
                                break;
                            }
                        }
                    }

                    // 2. Se não houver termo especial, usa o tipo de lançamento do arquivo ou o sinal do valor
                    if (!matchedSpecialTerm) {
                        const lowerCaseTipoLancamento = String(tipoLancamentoValue).toLowerCase();
                        if (lowerCaseTipoLancamento.includes('estorno') || lowerCaseTipoLancamento.includes('pagamento') || lowerCaseTipoLancamento.includes('receita')) {
                            tipoTransacao = CONSTANTS.TRANSACTION_TYPE_INCOME;
                        } else if (lowerCaseTipoLancamento.includes('compra') || lowerCaseTipoLancamento.includes('despesa')) {
                            tipoTransacao = CONSTANTS.TRANSACTION_TYPE_EXPENSE;
                        } else {
                            tipoTransacao = valor >= 0 ? CONSTANTS.TRANSACTION_TYPE_INCOME : CONSTANTS.TRANSACTION_TYPE_EXPENSE;
                        }
                    }

                    // Determina o meio de pagamento
                    let meioFinal;
                    // Se o tipo de documento tem um 'defaultMeio' forte (não 'outros'), usa-o.
                    if (rules.defaultMeio && rules.defaultMeio !== 'outros') {
                        meioFinal = rules.defaultMeio;
                    } else {
                        // Caso contrário, tenta detectar do arquivo.
                        meioFinal = detectMeioPagamento(meioPagamentoValue, descricaoValue);
                        // Se a detecção falhar (retornar 'outros') e o tipo de documento tiver um 'defaultMeio' configurado, usa-o.
                        if (meioFinal === 'outros' && rules.defaultMeio) {
                            meioFinal = rules.defaultMeio;
                        }
                    }

                    // === FIM DA NOVA LÓGICA ===

                    // Tenta categorizar automaticamente a transação.
                    const { category: detectedCategory, subcategory: detectedSubcategory } = autoCategorizeFromDescription(String(descricaoValue), tipoTransacao);
                    const categoriaFinal = detectedCategory || String(categoriaOriginalValue);
                    const subcategoriaFinal = detectedSubcategory || String(subcategoriaOriginalValue);
                    // Cria o objeto da transação.
                    const transaction = {
                        data: formatDate(dataValue), // Garante formato 'YYYY-MM-DD' para data.
                        descricao: String(descricaoValue) || '',
                        valor: Math.abs(valor),
                        tipo: tipoTransacao,
                        categoria: categoriaFinal,
                        subcategoria: subcategoriaFinal,
                        meio: meioFinal,
                        dataCreated: new Date().toISOString(),
                        isRecurring: false,
                        recurringFrequency: null,
                        nextOccurrenceDate: null,
                        parentRecurringId: null,
                        isInstallment: false,
                        installmentInfo: null,
                        groupId: null
                    };
                    importedTransactions.push(transaction);
                }

                if (importedTransactions.length > 0) {
                    // bulkAdd para adicionar múltiplas transações de uma vez, mais eficiente.
                    const addedIds = await db.transactions.bulkAdd(importedTransactions, { allKeys: true });
                    appState.lastImportedTransactionIds.push(...addedIds);
                    showAlert(`${importedTransactions.length} transações importadas do arquivo ${file.name}`, CONSTANTS.ALERT_TYPE_SUCCESS);
                    resolve();
                } else {
                    showAlert(`Nenhuma transação válida encontrada no arquivo ${file.name}.`, CONSTANTS.ALERT_TYPE_INFO);
                    reject(new Error('No valid transactions in Excel'));
                }
            } catch (error) {
                console.error('Erro ao processar Excel:', error);
                showAlert('Erro ao processar arquivo Excel: ' + error.message, CONSTANTS.ALERT_TYPE_ERROR);
                reject(error);
            }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

// Desfaz a última importação de transações.
async function undoLastImport() {
    if (appState.lastImportedTransactionIds.length === 0) {
        showAlert('Não há importação recente para desfazer.', CONSTANTS.ALERT_TYPE_ERROR);
        return;
    }

    // MELHORIA: Usa modal de confirmação customizado
    showConfirmationModal('Confirmar Desfazer', `Tem certeza que deseja desfazer a última importação (${appState.lastImportedTransactionIds.length} transação(ões))?`, async (confirmed) => {
        if (confirmed) {
            try {
                await db.transactions.bulkDelete(appState.lastImportedTransactionIds);
                showAlert(`${appState.lastImportedTransactionIds.length} transação(ões) da última importação foram removidas!`, CONSTANTS.ALERT_TYPE_SUCCESS);
                appState.lastImportedTransactionIds = [];
                await db.appSettings.update('generalSettings', {
                    lastImportedTransactionIds: appState.lastImportedTransactionIds
                });

                // Recarrega dados na interface.
                loadTransactions();
                generateReports();
                updateFilterCategories();
                updateSystemStats();
            } catch (error) {
                console.error('Erro ao desfazer importação:', error);
                showAlert('Erro ao desfazer importação: ' + error.message, CONSTANTS.ALERT_TYPE_ERROR);
            }
        }
    });
}

// ==================== REVISÃO: Função formatDate (Robustez na Análise de Datas) ====================
// Função robusta para formatar datas em 'YYYY-MM-DD'.
// Lida com números (datas Excel), strings em vários formatos (DD/MM/YYYY, MM/DD/YYYY, DD-MM-YYYY)
// e objetos Date. Prioriza o parsing mais comum primeiro.
function formatDate(dateInput) {
    try {
        let date;
        // 1. Tenta interpretar como data do Excel (número de dias desde 1899-12-30).
        if (typeof dateInput === 'number' && dateInput > 1 && dateInput < 60000) { // Limite razoável para datas Excel
            const excelEpoch = new Date(Date.UTC(1899, 11, 30));
            date = new Date(excelEpoch.getTime() + dateInput * 24 * 60 * 60 * 1000);
        } else if (typeof dateInput === 'string') {
            // 2. Tenta formato ISO 8601 (YYYY-MM-DD) ou formatos que JS Date.parse() entende diretamente.
            date = new Date(dateInput + 'T00:00:00'); // Adiciona T00:00:00 para evitar problemas com fusos horários
            if (isNaN(date.getTime())) {
                // 3. Tenta formatos DD/MM/YYYY ou DD-MM-YYYY
                let parts = dateInput.match(/^(\\d{1,2})[/-](\\d{1,2})[/-](\\d{2,4})$/);
                if (parts) {
                    // Converte para MM/DD/YYYY, que é mais robusto para o construtor Date() em JS
                    date = new Date(`${parts[2]}/${parts[1]}/${parts[3]}T00:00:00`);
                }
            }
            if (isNaN(date.getTime())) {
                // 4. Tenta o formato MM/DD/YYYY ou MM-DD-YYYY
                let parts = dateInput.match(/^(\\d{1,2})[/-](\\d{1,2})[/-](\\d{2,4})$/);
                if (parts) {
                    date = new Date(`${parts[1]}/${parts[2]}/${parts[3]}T00:00:00`);
                }
            }
        } else if (dateInput instanceof Date) {
            // 5. Se já for um objeto Date, usa-o diretamente.
            date = dateInput;
        }

        // Retorna a data formatada ISO (apenas a parte da data) se for válida.
        if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
        }
        // Se a data for inválida, loga um aviso e retorna a data atual como fallback.
        console.warn('Data inválida detectada durante formatação:', dateInput, 'Usando data atual como fallback.');
        return new Date().toISOString().split('T')[0];
    } catch (error) {
        console.error('Erro na formatação da data:', error);
        return new Date().toISOString().split('T')[0];
    }
}

// Mostra a barra de progresso da importação usando classes CSS.
function showImportProgress() {
    const { importProgressDiv } = appState.domElements;
    if (importProgressDiv) {
        importProgressDiv.classList.remove('hidden-field');
        console.log('Barra de progresso de importação mostrada.');
    } else {
        console.warn('Elemento #importProgress não encontrado ao tentar mostrar o progresso.');
    }
}

// Atualiza o preenchimento e texto da barra de progresso.
function updateImportProgress(percentage) {
    const { progressFillDiv, progressTextP } = appState.domElements;

    if (progressFillDiv) {
        progressFillDiv.style.width = percentage + '%';
    }
    if (progressTextP) {
        progressTextP.textContent = Math.round(percentage) + '%';
    }
}

// Esconde a barra de progresso usando classes CSS.
function hideImportProgress() {
    const { importProgressDiv } = appState.domElements;
    if (importProgressDiv) {
        importProgressDiv.classList.add('hidden-field');
        console.log('Barra de progresso de importação escondida.');
    } else {
        console.warn('Elemento #importProgress não encontrado ao tentar esconder o progresso.');
    }
}

// ==================== EXIBIÇÃO DE TRANSAÇÕES ====================
// Alterna a ordem de ordenação da tabela de transações (crescente/decrescente por data).
function toggleSortOrder() {
    appState.currentSortOrder = (appState.currentSortOrder === 'desc') ? 'asc' : 'desc';
    loadTransactions();
}

// Carrega e exibe as transações filtradas na tabela.
async function loadTransactions() {
    try {
        console.log('Carregando transações...');
        const { transactionsBody, masterCheckbox, sortIconSpan } = appState.domElements;
        if (!transactionsBody) {
            console.warn("Elementos de categoria/subcategoria não encontrados. Pulando atualização.");
            return;
        }
        transactionsBody.innerHTML = '';

        const fragment = document.createDocumentFragment();

        const filteredTransactions = await getFilteredTransactions();

        if (masterCheckbox) masterCheckbox.checked = false;
        updateSelectedCount();

        // Itera sobre as transações e cria as linhas da tabela.
        filteredTransactions.forEach(transaction => {
            let description = transaction.descricao;
            // Adiciona informações de parcela à descrição se for transação parcelada.
            if (transaction.isInstallment && transaction.installmentInfo) {
                description = `${transaction.descricao} (Parcela ${transaction.installmentInfo.current}/${transaction.installmentInfo.total})`;
            }
            const row = document.createElement('tr');

            // ==================== REVISÃO: Prevenção de XSS na Renderização da Tabela ====================
            // Usando .textContent para evitar injeção de HTML e garantir que os dados sejam tratados como texto puro.
            const checkboxCell = document.createElement('td');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
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
            typeSpan.className = `badge ${transaction.tipo === CONSTANTS.TRANSACTION_TYPE_INCOME ? 'positive' : 'negative'}`;
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
            descriptionCell.textContent = description; // Usando textContent
            row.appendChild(descriptionCell);

            const amountCell = document.createElement('td');
            amountCell.className = `amount ${transaction.tipo === CONSTANTS.TRANSACTION_TYPE_INCOME ? 'positive' : 'negative'}`;
            amountCell.textContent = `R\$ ${transaction.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
            row.appendChild(amountCell);

            const meioCell = document.createElement('td');
            meioCell.textContent = formatMeio(transaction.meio);
            row.appendChild(meioCell);

            const actionsCell = document.createElement('td');
            actionsCell.className = 'table-actions-btns';

            const editBtn = document.createElement('button');
            editBtn.className = 'btn btn-sm btn-secondary';
            editBtn.onclick = () => editTransaction(transaction.id);
            editBtn.setAttribute('aria-label', `Editar transação de ${description}`);
            editBtn.textContent = '✏️';
            actionsCell.appendChild(editBtn);

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn-sm btn-danger';
            deleteBtn.onclick = () => deleteTransaction(transaction.id);
            deleteBtn.setAttribute('aria-label', `Excluir transação de ${description}`);
            deleteBtn.innerHTML = '&#x1F5D1;'; // Ícone da lixeira com entidade HTML
            actionsCell.appendChild(deleteBtn);

            row.appendChild(actionsCell);
            // ==============================================================================================

            checkbox.addEventListener('change', updateSelectedCount);
            fragment.appendChild(row);
        });
        transactionsBody.appendChild(fragment);

        updateTransactionStats(filteredTransactions);

        // Atualiza ícone de ordenação.
        if (sortIconSpan) {
            sortIconSpan.textContent = appState.currentSortOrder === 'desc' ? '🔽' : '🔼';
        }

        console.log('Transações carregadas:', filteredTransactions.length);
    } catch (error) {
        console.error('Erro ao carregar transações:', error);
        showAlert('Erro ao carregar transações: ' + error.message, CONSTANTS.ALERT_TYPE_ERROR);
    }
}

// Marca/desmarca todos os checkboxes da tabela de transações.
function toggleAllCheckboxes() {
    const { masterCheckbox } = appState.domElements;
    const checkboxes = document.querySelectorAll('.transaction-checkbox');
    if (masterCheckbox) {
        checkboxes.forEach(checkbox => {
            checkbox.checked = masterCheckbox.checked;
        });
    }
    updateSelectedCount();
}

// Atualiza a contagem de transações selecionadas e a visibilidade dos botões de ação em massa.
function updateSelectedCount() {
    const { selectedCountSpan, selectedCountMeioModalSpan, deleteSelectedBtn, editSelectedMeioBtn, masterCheckbox } = appState.domElements;
    const checkboxes = document.querySelectorAll('.transaction-checkbox:checked');

    if (selectedCountSpan) selectedCountSpan.textContent = checkboxes.length;
    if (selectedCountMeioModalSpan) selectedCountMeioModalSpan.textContent = checkboxes.length;

    // Controla a visibilidade dos botões.
    if (deleteSelectedBtn) {
        deleteSelectedBtn.style.display = checkboxes.length > 0 ? 'inline-block' : 'none';
    }
    if (editSelectedMeioBtn) {
        editSelectedMeioBtn.style.display = checkboxes.length > 0 ? 'inline-block' : 'none';
    }
    // Atualiza o estado do checkbox mestre.
    if (masterCheckbox) {
        const allCheckboxes = document.querySelectorAll('.transaction-checkbox');
        masterCheckbox.checked = allCheckboxes.length > 0 && checkboxes.length === allCheckboxes.length;
    }
}

// Exclui transações selecionadas em massa.
async function deleteSelectedTransactions() {
    const selectedCheckboxes = document.querySelectorAll('.transaction-checkbox:checked');
    if (selectedCheckboxes.length === 0) {
        showAlert('Nenhuma transação selecionada para exclusão.', CONSTANTS.ALERT_TYPE_ERROR);
        return;
    }

    // MELHORIA: Usa modal de confirmação customizado
    showConfirmationModal('Confirmar Exclusão em Massa', `Tem certeza que deseja excluir ${selectedCheckboxes.length} transação(ões) selecionada(s)?`, async (confirmed) => {
        if (confirmed) {
            const idsToDelete = Array.from(selectedCheckboxes).map(cb => parseFloat(cb.dataset.id));
            try {
                await db.transactions.bulkDelete(idsToDelete);
                showAlert(`${selectedCheckboxes.length} transação(ões) excluída(s) com sucesso!`, CONSTANTS.ALERT_TYPE_SUCCESS);
                // Recarrega dados na interface.
                loadTransactions();
                generateReports();
                updateFilterCategories();
                updateSystemStats();
            } catch (error) {
                console.error('Erro ao excluir transações selecionadas:', error);
                showAlert('Erro ao excluir transações selecionadas: ' + error.message, CONSTANTS.ALERT_TYPE_ERROR);
            }
        }
    });
}

// Abre o modal para edição em massa do meio de pagamento usando classes CSS.
function openEditMeioModal() {
    const { editMeioModal, selectedCountMeioModalSpan } = appState.domElements;
    const checkboxes = document.querySelectorAll('.transaction-checkbox:checked');
    if (checkboxes.length === 0) {
        showAlert('Selecione ao menos uma transação para modificar o meio de pagamento.', CONSTANTS.ALERT_TYPE_ERROR);
        return;
    }
    if (editMeioModal) editMeioModal.classList.add('is-active'); // Adiciona a classe 'is-active'
    if (selectedCountMeioModalSpan) selectedCountMeioModalSpan.textContent = checkboxes.length;
}

// Aplica a alteração em massa do meio de pagamento.
async function applyBulkMeioChange() {
    const { modalMeioSelect, editMeioModal } = appState.domElements;
    const newMeio = modalMeioSelect ? modalMeioSelect.value : '';
    if (!newMeio) {
        showAlert('Selecione um meio de pagamento válido.', CONSTANTS.ALERT_TYPE_ERROR);
        return;
    }

    const selectedIds = Array.from(document.querySelectorAll('.transaction-checkbox:checked')).map(cb => parseFloat(cb.dataset.id));
    let changedCount = 0;
    try {
        // Transação Dexie para atualizar múltiplos registros eficientemente.
        await db.transactions.where('id').anyOf(selectedIds).modify(t => {
            t.meio = newMeio;
            changedCount++;
        });
        if (editMeioModal) editMeioModal.classList.remove('is-active'); // Remove a classe 'is-active'
        showAlert(`${changedCount} transação(ões) modificada(s) com sucesso para ${formatMeio(newMeio)}!`, CONSTANTS.ALERT_TYPE_SUCCESS);
        // Recarrega dados na interface.
        loadTransactions();
        generateReports();
        updateSystemStats();
    } catch (error) {
        console.error('Erro ao aplicar alteração em massa:', error);
        showAlert('Erro ao aplicar alteração em massa: ' + error.message, CONSTANTS.ALERT_TYPE_ERROR);
    }
}

// Busca transações do banco de dados aplicando filtros e ordenação.
async function getFilteredTransactions() {
    try {
        let query = db.transactions;

        // Coleta os valores dos filtros.
        const { filterDataInicioInput, filterDataFimInput, filterTipoSelect, filterCategoriaSelect, searchBoxInput } = appState.domElements;
        const dataInicio = filterDataInicioInput ? filterDataInicioInput.value : null;
        const dataFim = filterDataFimInput ? filterDataFimInput.value : null;
        const tipo = filterTipoSelect ? filterTipoSelect.value : null;
        const categoria = filterCategoriaSelect ? filterCategoriaSelect.value : null;
        const searchTerm = searchBoxInput ? searchBoxInput.value?.toLowerCase() : null;

        let filtered;

        // Aplica filtros de data (lógica já robusta conforme análise).
        if (dataInicio && dataFim) {
            filtered = await query.where('data').between(dataInicio, dataFim, true, true).toArray();
        } else if (dataInicio) {
            filtered = await query.where('data').aboveOrEqual(dataInicio).toArray();
        } else if (dataFim) {
            filtered = await query.where('data').belowOrEqual(dataFim).toArray();
        } else {
            filtered = await query.toArray(); // Busca tudo se não houver filtro de data
        }

        // Aplica filtros de tipo e categoria em memória.
        if (tipo) {
            filtered = filtered.filter(t => t.tipo === tipo);
        }
        if (categoria) {
            filtered = filtered.filter(t => t.categoria === categoria);
        }

        // Filtro de termo de busca (aplicado em memória, pois includes não é otimizado para IndexedDB).
        if (searchTerm) {
            filtered = filtered.filter(t =>
                String(t.descricao).toLowerCase().includes(searchTerm) ||
                String(t.categoria).toLowerCase().includes(searchTerm) ||
                String(t.subcategoria || '').toLowerCase().includes(searchTerm) ||
                String(t.meio).toLowerCase().includes(searchTerm)
            );
        }

        // Ordena as transações por data e, em caso de empate, por dataCreated.
        filtered.sort((a, b) => {
            const dateA = new Date(a.data);
            const dateB = new Date(b.data);
            const timeA = dateA.getTime();
            const timeB = dateB.getTime();

            let compareResult = 0;
            if (appState.currentSortOrder === 'asc') {
                compareResult = timeA - timeB;
            } else { // 'desc'
                compareResult = timeB - timeA;
            }

            if (compareResult === 0) {
                // Desempate por dataCreated se as datas são iguais
                return new Date(a.dataCreated) - new Date(b.dataCreated);
            }
            return compareResult;
        });

        return filtered;
    } catch (error) {
        console.error('Erro ao filtrar transações:', error);
        return [];
    }
}

// NOVA FUNÇÃO AUXILIAR: Calcula totais de receitas, despesas e saldo.
function calculateStats(transactions) {
    const totalReceitas = transactions
        .filter(t => t.tipo === CONSTANTS.TRANSACTION_TYPE_INCOME)
        .reduce((sum, t) => sum + t.valor, 0);
    const totalDespesas = transactions
        .filter(t => t.tipo === CONSTANTS.TRANSACTION_TYPE_EXPENSE)
        .reduce((sum, t) => sum + t.valor, 0);
    const saldo = totalReceitas - totalDespesas;
    return { totalReceitas, totalDespesas, saldo };
}

// Atualiza as estatísticas de transações (receitas, despesas, saldo) na interface.
function updateTransactionStats(filteredTransactions) {
    try {
        const { transactionStatsContainer } = appState.domElements;
        const stats = calculateStats(filteredTransactions); // Usando função auxiliar
        const totalTransacoes = filteredTransactions.length;

        if (transactionStatsContainer) {
            transactionStatsContainer.innerHTML = `
                <div class="stat-card">
                    <div class="stat-value positive">R\$ ${stats.totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                    <div class="stat-label">Total Receitas</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value negative">R\$ ${stats.totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                    <div class="stat-label">Total Despesas</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value ${stats.saldo >= 0 ? 'positive' : 'negative'}">R\$ ${stats.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                    <div class="stat-label">Saldo</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value neutral">${totalTransacoes}</div>
                    <div class="stat-label">Transações</div>
                </div>
            `;
        }
    } catch (error) {
        console.error('Erro ao atualizar estatísticas:', error);
    }
}

// Atualiza as opções de categoria nos filtros da aba de transações.
async function updateFilterCategories() {
    try {
        const { filterCategoriaSelect } = appState.domElements;
        if (!filterCategoriaSelect) return;
        filterCategoriaSelect.innerHTML = '<option value="">Todos</option>';

        const allCategoriesSet = new Set();
        // Coleta todas as categorias únicas de receita e despesa.
        for (const tipo in appState.categoriesData) {
            for (const categoria in appState.categoriesData[tipo]) {
                allCategoriesSet.add(categoria);
            }
        }

        const allCategories = Array.from(allCategoriesSet).sort();

        allCategories.forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria;
            option.textContent = categoria;
            filterCategoriaSelect.appendChild(option);
        });
        console.log('Filtros de categoria atualizados');
    } catch (error) {
        console.error('Erro ao atualizar filtros de categoria:', error);
    }
}

// Aplica os filtros e recarrega as transações.
async function applyFilters() {
    console.log('Aplicando filtros...');
    await loadTransactions();
}

// Limpa todos os campos de filtro e recarrega as transações.
async function clearFilters() {
    try {
        console.log('Limpando filtros...');
        const { filterDataInicioInput, filterDataFimInput, filterTipoSelect, filterCategoriaSelect, searchBoxInput } = appState.domElements;
        if (filterDataInicioInput) filterDataInicioInput.value = '';
        if (filterDataFimInput) filterDataFimInput.value = '';
        if (filterTipoSelect) filterTipoSelect.value = '';
        if (filterCategoriaSelect) filterCategoriaSelect.value = '';
        if (searchBoxInput) searchBoxInput.value = '';

        await loadTransactions();
    } catch (error) {
        console.error('Erro ao limpar filtros:', error);
    }
}

// Executa a busca de transações (acionada após o debounce).
async function searchTransactions() {
    await loadTransactions();
}

// Carrega os dados de uma transação para edição no formulário.
async function editTransaction(id) {
    try {
        console.log('Editando transação:', id);
        const transaction = await db.transactions.get(id);
        if (!transaction) {
            showAlert('Transação não encontrada!', CONSTANTS.ALERT_TYPE_ERROR);
            return;
        }
        appState.editingTransactionId = id;
        clearAllValidationErrors();

        const { dataInput, tipoSelect, valorInput, meioSelect, descricaoInput,
                categoriaSelect, outraCategoriaInput, subcategoriaSelect, outraSubcategoriaInput,
                isRecurringCheckbox, recurringFrequencySelect, paymentTypeSingle, paymentTypeInstallment, numInstallmentsInput } = appState.domElements;

        // Preenche os campos básicos do formulário.
        if (dataInput) dataInput.value = transaction.data;
        if (tipoSelect) tipoSelect.value = transaction.tipo;
        // Formata o valor para exibição no input de moeda brasileiro
        if (valorInput) valorInput.value = formatFloatToBrazilianCurrencyString(transaction.valor);
        if (meioSelect) meioSelect.value = transaction.meio;
        if (descricaoInput) descricaoInput.value = transaction.descricao;

        if (outraCategoriaInput) outraCategoriaInput.value = '';
        if (outraSubcategoriaInput) outraSubcategoriaInput.value = '';

        updateCategories(); // Atualiza as categorias com base no tipo
        requestAnimationFrame(() => {
            let isCategoriaPredefinida = false;
            // Tenta selecionar a categoria existente.
            if (appState.categoriesData[transaction.tipo] && Object.keys(appState.categoriesData[transaction.tipo]).includes(transaction.categoria)) {
                if (categoriaSelect) categoriaSelect.value = transaction.categoria;
                isCategoriaPredefinida = true;
            } else {
                if (categoriaSelect) categoriaSelect.value = '';
                if (outraCategoriaInput) outraCategoriaInput.value = transaction.categoria;
            }

            updateSubcategories(); // Atualiza as subcategories com base na categoria
            requestAnimationFrame(() => {
                // Tenta selecionar a subcategoria existente.
                if (isCategoriaPredefinida && appState.categoriesData[transaction.tipo] && appState.categoriesData[transaction.tipo][transaction.categoria] && appState.categoriesData[transaction.tipo][transaction.categoria].includes(transaction.subcategoria)) {
                    if (subcategoriaSelect) subcategoriaSelect.value = transaction.subcategoria;
                } else {
                    if (subcategoriaSelect) subcategoriaSelect.value = '';
                    if (outraSubcategoriaInput) outraSubcategoriaInput.value = transaction.subcategoria;
                }
                toggleCustomCategoryFields();
            });
        });

        // Lógica para carregar estado de recorrência.
        if (isRecurringCheckbox && recurringFrequencySelect) {
            // Permite editar como recorrente apenas se for o modelo original (não uma ocorrência gerada).
            isRecurringCheckbox.checked = transaction.isRecurring && !transaction.parentRecurringId;
            recurringFrequencySelect.value = transaction.recurringFrequency || '';
            isRecurringCheckbox.disabled = transaction.parentRecurringId !== null;
            toggleRecurringFields();
        }

        // Lógica para carregar estado de parcelamento.
        if (paymentTypeSingle && paymentTypeInstallment && numInstallmentsInput && meioSelect) {
            // Dispara o evento 'change' no meioSelect para garantir que a interface de parcelamento apareça/esconda corretamente.
            meioSelect.dispatchEvent(new Event('change'));

            // Apenas a PRIMEIRA parcela de uma série pode ser editada para alterar o parcelamento.
            if (transaction.isInstallment && transaction.installmentInfo && transaction.installmentInfo.current === 1) {
                paymentTypeInstallment.checked = true;
                numInstallmentsInput.value = transaction.installmentInfo.total;
                // Habilita edição.
                paymentTypeSingle.disabled = false;
                paymentTypeInstallment.disabled = false;
                numInstallmentsInput.disabled = false;
            } else {
                paymentTypeSingle.checked = true;
                numInstallmentsInput.value = 1;
                // Se for uma parcela subsequente (current > 1), desabilita edição do parcelamento.
                if (transaction.isInstallment && transaction.installmentInfo && transaction.installmentInfo.current > 1) {
                    paymentTypeSingle.disabled = true;
                    paymentTypeInstallment.disabled = true;
                    numInstallmentsInput.disabled = true;
                }
            }
            toggleInstallmentFields();
        }

        enforceMutualExclusivity();

        showTab('panel-cadastro'); // MELHORIA: Usa o novo ID da seção
        showAlert('Transação carregada para edição!', CONSTANTS.ALERT_TYPE_SUCCESS);
    } catch (error) {
        console.error('Erro ao editar transação:', error);
        showAlert('Erro ao carregar transação para edição: ' + error.message, CONSTANTS.ALERT_TYPE_ERROR);
    }
}

// Exclui uma transação ou uma série de transações (parcelada/recorrente).
async function deleteTransaction(id) {
    try {
        const transactionToDelete = await db.transactions.get(id);
        if (!transactionToDelete) {
            showAlert('Transação não encontrada!', CONSTANTS.ALERT_TYPE_ERROR);
            return;
        }

        let confirmMessage = 'Tem certeza que deseja excluir esta transação?';
        let idsToDelete = [id];

        // Exclusão de série recorrente (apenas o modelo, não ocorrências geradas).
        if (transactionToDelete.isRecurring && !transactionToDelete.parentRecurringId) {
            confirmMessage = 'Esta transação é o modelo de uma série recorrente. Deseja excluir TODA a série (modelo e ocorrências geradas)?';
            // MELHORIA: Usa modal de confirmação customizado
            showConfirmationModal('Confirmar Exclusão de Série', confirmMessage, async (confirmed) => {
                if (confirmed) {
                    const relatedOccurrences = await db.transactions.where('parentRecurringId').equals(id).primaryKeys();
                    idsToDelete = idsToDelete.concat(relatedOccurrences);
                    idsToDelete.push(id); // Inclui o próprio modelo
                    await db.transactions.bulkDelete(idsToDelete);
                    showAlert(`${idsToDelete.length} transação(ões) excluída(s) com sucesso!`, CONSTANTS.ALERT_TYPE_SUCCESS);
                    loadTransactions(); generateReports(); updateFilterCategories(); updateSystemStats();
                } else {
                    // Se o usuário não quiser excluir a série completa, oferece opção de excluir apenas a ocorrência (o modelo)
                    showConfirmationModal('Confirmar Exclusão de Ocorrência', 'Tem certeza que deseja excluir APENAS esta ocorrência (o modelo), interrompendo a geração futura?', async (confirmedOnlyOne) => {
                        if (confirmedOnlyOne) {
                            await db.transactions.bulkDelete([id]);
                            showAlert(`1 transação excluída com sucesso!`, CONSTANTS.ALERT_TYPE_SUCCESS);
                            loadTransactions(); generateReports(); updateFilterCategories(); updateSystemStats();
                        }
                    });
                }
            });
        }
        // Exclusão de série parcelada (apenas a primeira parcela).
        else if (transactionToDelete.isInstallment && transactionToDelete.installmentInfo && transactionToDelete.installmentInfo.current === 1) {
            confirmMessage = 'Esta transação é a primeira parcela de uma série. Deseja excluir TODA a série (todas as parcelas desta compra)?';
            // MELHORIA: Usa modal de confirmação customizado
            showConfirmationModal('Confirmar Exclusão de Série Parcelada', confirmMessage, async (confirmed) => {
                if (confirmed) {
                    const relatedInstallments = await db.transactions.where('groupId').equals(transactionToDelete.groupId).primaryKeys();
                    idsToDelete = relatedInstallments;
                    await db.transactions.bulkDelete(idsToDelete);
                    showAlert(`${idsToDelete.length} transação(ões) excluída(s) com sucesso!`, CONSTANTS.ALERT_TYPE_SUCCESS);
                    loadTransactions(); generateReports(); updateFilterCategories(); updateSystemStats();
                } else {
                    // Se o usuário não quiser excluir a série completa, oferece opção de excluir apenas esta parcela
                    showConfirmationModal('Confirmar Exclusão de Parcela', 'Tem certeza que deseja excluir APENAS esta parcela?', async (confirmedOnlyOne) => {
                        if (confirmedOnlyOne) {
                            await db.transactions.bulkDelete([id]);
                            showAlert(`1 transação excluída com sucesso!`, CONSTANTS.ALERT_TYPE_SUCCESS);
                            loadTransactions(); generateReports(); updateFilterCategories(); updateSystemStats();
                        }
                    });
                }
            });
        } else {
            // Confirmação padrão para ocorrências geradas ou parcelas individuais.
            confirmMessage = 'Tem certeza que deseja excluir esta transação individual?';
            // MELHORIA: Usa modal de confirmação customizado
            showConfirmationModal('Confirmar Exclusão', confirmMessage, async (confirmed) => {
                if (confirmed) {
                    await db.transactions.bulkDelete([id]);
                    showAlert(`1 transação excluída com sucesso!`, CONSTANTS.ALERT_TYPE_SUCCESS);
                    loadTransactions(); generateReports(); updateFilterCategories(); updateSystemStats();
                }
            });
        }
    } catch (error) {
        console.error('Erro ao excluir transação:', error);
        showAlert('Erro ao excluir transação: ' + error.message, CONSTANTS.ALERT_TYPE_ERROR);
    }
}

// Define as datas padrão para os filtros de relatório (primeiro dia do mês até hoje).
function setupReportDates() {
    try {
        const { reportDataInicioInput, reportDataFimInput } = appState.domElements;
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
        console.error('Erro ao configurar datas dos relatórios:', error);
    }
}

// ==================== RELATÓRIOS ====================
// Gera os relatórios e gráficos com base nos filtros.
async function generateReports() {
    try {
        console.log('Gerando relatórios...');
        const { reportDataInicioInput, reportDataFimInput, mainChartArea, reportChartSelect, chartTypeDespesasSelect } = appState.domElements;
        const dataInicio = reportDataInicioInput ? reportDataInicioInput.value : null;
        const dataFim = reportDataFimInput ? reportDataFimInput.value : null;

        if (mainChartArea) mainChartArea.innerHTML = '';

        const reportTransactions = await getFilteredTransactionsForReports(dataInicio, dataFim);

        updateReportStats(reportTransactions);

        const selectedChart = reportChartSelect ? reportChartSelect.value : null;
        const chartTargetDivId = 'main-chart-area';

        // Escolhe qual gráfico gerar baseado na seleção do usuário.
        switch (selectedChart) {
            case 'receitasDespesasChart':
                createReceitasDespesasChart(reportTransactions, chartTargetDivId);
                break;
            case 'despesasCategoriaChart':
                const chartTypeDespesas = chartTypeDespesasSelect ? chartTypeDespesasSelect.value : 'pie';
                if (chartTypeDespesas === 'pie') {
                    createDespesasCategoriaChart(reportTransactions, chartTargetDivId);
                } else {
                    createDespesasCategoriaBarChart(reportTransactions, chartTargetDivId);
                }
                break;
            case 'evolucaoMensalChart':
                createEvolucaoMensalChart(reportTransactions, chartTargetDivId);
                break;
            case 'transacoesMeioChart':
                createTransacoesMeioChart(reportTransactions, chartTargetDivId);
                break;
            default:
                createReceitasDespesasChart(reportTransactions, chartTargetDivId);
        }

        console.log('Relatórios gerados com sucesso');
    } catch (error) {
        console.error('Erro ao gerar relatórios:', error);
        showAlert('Erro ao gerar relatórios: ' + error.message, CONSTANTS.ALERT_TYPE_ERROR);
    }
}

// Atualiza o painel de estatísticas dos relatórios usando a função auxiliar calculateStats.
function updateReportStats(reportTransactions) {
    try {
        const { reportStatsContainer } = appState.domElements;
        const stats = calculateStats(reportTransactions); // Usando função auxiliar
        const mediaGastoMensal = calculateMediaGastoMensal(reportTransactions);

        if (reportStatsContainer) {
            reportStatsContainer.innerHTML = `
                <div class="stat-card">
                    <div class="stat-value positive">R\$ ${stats.totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                    <div class="stat-label">Total Receitas</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value negative">R\$ ${stats.totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                    <div class="stat-label">Total Despesas</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value ${stats.saldo >= 0 ? 'positive' : 'negative'}">R\$ ${stats.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                    <div class="stat-label">Saldo Líquido</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value neutral">R\$ ${mediaGastoMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                    <div class="stat-label">Média Mensal</div>
                </div>
            `;
        }
    } catch (error) {
        console.error('Erro ao atualizar estatísticas do relatório:', error);
    }
}

// Calcula a média de gastos mensais com base nas despesas filtradas.
function calculateMediaGastoMensal(reportTransactions) {
    try {
        const despesas = reportTransactions.filter(t => t.tipo === CONSTANTS.TRANSACTION_TYPE_EXPENSE);
        if (despesas.length === 0) return 0;
        const meses = [...new Set(despesas.map(t => t.data.substring(0, 7)))];
        const totalDespesas = despesas.reduce((sum, t) => sum + t.valor, 0);
        return meses.length > 0 ? totalDespesas / meses.length : 0;
    }
    catch (error) {
        console.error('Erro ao calcular média mensal:', error);
        return 0;
    }
}

// Cria um gráfico de pizza para Receitas vs Despesas.
function createReceitasDespesasChart(reportTransactions, targetDivId) {
    try {
        const stats = calculateStats(reportTransactions); // Usando função auxiliar
        const chartDiv = document.getElementById(targetDivId);
        if (!chartDiv) return;

        if (stats.totalReceitas === 0 && stats.totalDespesas === 0) {
            chartDiv.innerHTML = '<p style="text-align: center; padding: 50px;">Nenhum dado disponível</p>';
            return;
        }
        const trace = {
            labels: ['Receitas', 'Despesas'],
            values: [stats.totalReceitas, stats.totalDespesas],
            type: 'pie',
            hole: 0.4,
            marker: {
                colors: ['#28a745', '#B00020']
            },
            textinfo: 'label+percent+value',
            texttemplate: '%{label}<br>%{percent}<br>R\$ %{value:,.2f}'
        };
        const layout = {
            title: 'Receitas vs Despesas',
            showlegend: true,
            margin: { t: 40, b: 20, l: 20, r: 20 },
            font: { size: 12 },
            autosize: true,
            automargin: true
        };
        Plotly.newPlot(chartDiv, [trace], layout, { responsive: true, displayModeBar: true });

        // Adiciona listener de clique para mostrar detalhes das transações.
        chartDiv.on('plotly_click', function(data) {
            if (data.points.length > 0) {
                const clickedLabel = data.points[0].label;
                const filtered = reportTransactions.filter(t =>
                    (clickedLabel === 'Receitas' && t.tipo === CONSTANTS.TRANSACTION_TYPE_INCOME) ||
                    (clickedLabel === 'Despesas' && t.tipo === CONSTANTS.TRANSACTION_TYPE_EXPENSE)
                );
                showTransactionDetailsModal(`Transações de ${clickedLabel}`, filtered);
            }
        });
    } catch (error) {
        console.error('Erro ao criar gráfico receitas vs despesas:', error);
    }
}

// Cria um gráfico de pizza para Despesas por Categoria.
function createDespesasCategoriaChart(reportTransactions, targetDivId) {
    try {
        const despesas = reportTransactions.filter(t => t.tipo === CONSTANTS.TRANSACTION_TYPE_EXPENSE);
        const despesasPorCategoria = {};
        despesas.forEach(t => {
            despesasPorCategoria[t.categoria] = (despesasPorCategoria[t.categoria] || 0) + t.valor;
        });
        const categorias = Object.keys(despesasPorCategoria);
        const valores = Object.values(despesasPorCategoria);

        const chartDiv = document.getElementById(targetDivId);
        if (!chartDiv) return;

        if (categorias.length === 0) {
            chartDiv.innerHTML = '<p style="text-align: center; padding: 50px;">Nenhum dado disponível</p>';
            return;
        }
        const trace = {
            labels: categorias,
            values: valores,
            type: 'pie',
            textinfo: 'label+percent',
            textposition: 'outside',
            marker: {
                colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9']
            }
        };
        const layout = {
            title: 'Despesas por Categoria (Pizza)',
            showlegend: true,
            margin: { t: 40, b: 20, l: 20, r: 20 },
            font: { size: 12 },
            autosize: true,
            automargin: true
        };
        Plotly.newPlot(chartDiv, [trace], layout, { responsive: true, displayModeBar: true });

        // Adiciona listener de clique para mostrar detalhes das transações.
        chartDiv.on('plotly_click', function(data) {
            if (data.points.length > 0) {
                const clickedCategory = data.points[0].label;
                const filtered = reportTransactions.filter(t => t.tipo === CONSTANTS.TRANSACTION_TYPE_EXPENSE && t.categoria === clickedCategory);
                showTransactionDetailsModal(`Despesas na Categoria: ${clickedCategory}`, filtered);
            }
        });
    } catch (error) {
        console.error('Erro ao criar gráfico despesas por categoria:', error);
    }
}

// Cria um gráfico de barras para Despesas por Categoria.
function createDespesasCategoriaBarChart(reportTransactions, targetDivId) {
    try {
        const despesas = reportTransactions.filter(t => t.tipo === CONSTANTS.TRANSACTION_TYPE_EXPENSE);
        const despesasPorCategoria = {};
        despesas.forEach(t => {
            despesasPorCategoria[t.categoria] = (despesasPorCategoria[t.categoria] || 0) + t.valor;
        });

        // Ordena categorias por valor decrescente.
        const sortedCategorias = Object.keys(despesasPorCategoria).sort((a, b) => despesasPorCategoria[b] - despesasPorCategoria[a]);
        const sortedValores = sortedCategorias.map(cat => despesasPorCategoria[cat]);

        const chartDiv = document.getElementById(targetDivId);
        if (!chartDiv) return;

        if (sortedCategorias.length === 0) {
            chartDiv.innerHTML = '<p style="text-align: center; padding: 50px;">Nenhuma dado disponível</p>';
            return;
        }
        const trace = {
            x: sortedCategorias,
            y: sortedValores,
            type: 'bar',
            marker: {
                colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9']
            }
        };
        const layout = {
            title: 'Despesas por Categoria (Barras)',
            xaxis: {
                title: 'Categoria',
                tickangle: -45,
                automargin: true
            },
            yaxis: {
                title: 'Valor (R\$)',
                automargin: true
            },
            margin: { t: 40, b: 150, l: 60, r: 20 },
            font: { size: 12 },
            autosize: true
        };
        Plotly.newPlot(chartDiv, [trace], layout, { responsive: true, displayModeBar: true });

        // Adiciona listener de clique para mostrar detalhes das transações.
        chartDiv.on('plotly_click', function(data) {
            if (data.points.length > 0) {
                const clickedCategory = data.points[0].label;
                const filtered = reportTransactions.filter(t => t.tipo === CONSTANTS.TRANSACTION_TYPE_EXPENSE && t.categoria === clickedCategory);
                showTransactionDetailsModal(`Despesas na Categoria: ${clickedCategory}`, filtered);
            }
        });
    } catch (error) {
        console.error('Erro ao criar gráfico de barras de despesas por categoria:', error);
    }
}

// Cria um gráfico de linha para a Evolução Mensal (Receitas vs Despesas).
function createEvolucaoMensalChart(reportTransactions, targetDivId) {
    try {
        const dadosPorMes = {};
        reportTransactions.forEach(t => {
            const mesAno = t.data.substring(0, 7);
            if (!dadosPorMes[mesAno]) {
                dadosPorMes[mesAno] = { receitas: 0, despesas: 0 };
            }
            if (t.tipo === CONSTANTS.TRANSACTION_TYPE_INCOME) {
                dadosPorMes[mesAno].receitas += t.valor;
            } else {
                dadosPorMes[mesAno].despesas += t.valor;
            }
        });
        const meses = Object.keys(dadosPorMes).sort();
        const receitas = meses.map(mes => dadosPorMes[mes].receitas);
        const despesas = meses.map(mes => dadosPorMes[mes].despesas);

        const chartDiv = document.getElementById(targetDivId);
        if (!chartDiv) return;

        if (meses.length === 0) {
            chartDiv.innerHTML = '<p style="text-align: center; padding: 50px;">Nenhum dado disponível</p>';
            return;
        }
        const traceReceitas = {
            x: meses,
            y: receitas,
            type: 'scatter',
            mode: 'lines+markers',
            name: 'Receitas',
            line: { color: '#28a745', width: 3 },
            marker: { color: '#28a745', size: 8 }
        };
        const traceDespesas = {
            x: meses,
            y: despesas,
            type: 'scatter',
            mode: 'lines+markers',
            name: 'Despesas',
            line: { color: '#B00020', width: 3 },
            marker: { color: '#B00020', size: 8 }
        };
        const layout = {
            title: 'Evolução Mensal (Receitas vs Despesas)',
            xaxis: { title: 'Mês', automargin: true },
            yaxis: { title: 'Valor (R\$)', automargin: true },
            margin: { t: 40, b: 50, l: 60, r: 20 },
            showlegend: true,
            autosize: true
        };
        Plotly.newPlot(chartDiv, [traceReceitas, traceDespesas], layout, { responsive: true, displayModeBar: true });
    } catch (error) {
        console.error('Erro ao criar gráfico evolução mensal:', error);
    }
}

// Cria um gráfico de barras para Transações por Meio de Pagamento.
function createTransacoesMeioChart(reportTransactions, targetDivId) {
    try {
        const transacoesPorMeio = {};
        reportTransactions.forEach(t => {
            const meio = formatMeio(t.meio);
            transacoesPorMeio[meio] = (transacoesPorMeio[meio] || 0) + t.valor;
        });
        // Ordena os meios de pagamento por valor decrescente.
        const sortedMeios = Object.keys(transacoesPorMeio).sort((a, b) => transacoesPorMeio[b] - transacoesPorMeio[a]);
        const sortedValores = sortedMeios.map(meio => transacoesPorMeio[meio]);

        const chartDiv = document.getElementById(targetDivId);
        if (!chartDiv) return;

        if (sortedMeios.length === 0) {
            chartDiv.innerHTML = '<p style="text-align: center; padding: 50px;">Nenhum dado disponível</p>';
            return;
        }
        const trace = {
            x: sortedMeios,
            y: sortedValores,
            type: 'bar',
            marker: {
                colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9']
            }
        };
        const layout = {
            title: 'Transações por Meio de Pagamento',
            xaxis: { title: 'Meio de Transação', tickangle: -45, automargin: true },
            yaxis: { title: 'Valor (R\$)', automargin: true },
            margin: { t: 40, b: 150, l: 60, r: 20 },
            autosize: true
        };
        Plotly.newPlot(chartDiv, [trace], layout, { responsive: true, displayModeBar: true });
    } catch (error) {
        console.error('Erro ao criar gráfico transações por meio:', error);
    }
}

// Exporta o relatório atual para um arquivo Excel.
async function exportReportToExcel() {
    try {
        console.log('Exportando relatório para Excel...');
        const { reportDataInicioInput, reportDataFimInput } = appState.domElements;
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
            if (t.isInstallment && t.installmentInfo) {
                description = `${t.descricao} (Parcela ${t.installmentInfo.current}/${t.installmentInfo.total})`;
            }
            return [formatDisplayDate(t.data), t.tipo.toUpperCase(), t.categoria, t.subcategoria, description, t.valor, formatMeio(t.meio)];
        });
        const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Relatorio Financeiro");
        XLSX.writeFile(wb, `relatorio_financeiro_${new Date().toISOString().split('T')[0]}.xlsx`);
        showAlert('Relatório exportado para Excel com sucesso!', CONSTANTS.ALERT_TYPE_SUCCESS);
    } catch (error) {
        console.error('Erro ao exportar relatório para Excel:', error);
        showAlert('Erro ao exportar relatório para Excel: ' + error.message, CONSTANTS.ALERT_TYPE_ERROR);
    }
}

// Exporta o relatório atual para um arquivo PDF.
async function exportReportToPdf() {
    try {
        console.log('Exportando relatório para PDF...');
        const { jspdf } = window.jspdf;
        const doc = new jspdf.jsPDF();
        const { reportDataInicioInput, reportDataFimInput } = appState.domElements;
        const reportTransactions = await getFilteredTransactionsForReports(
            reportDataInicioInput ? reportDataInicioInput.value : null,
            reportDataFimInput ? reportDataFimInput.value : null
        );
        if (reportTransactions.length === 0) {
            showAlert('Nenhuma transação para exportar neste período.', CONSTANTS.ALERT_TYPE_ERROR);
            return;
        }
        const headers = [
            ['Data', 'Tipo', 'Categoria', 'Subcategoria', 'Descrição', 'Valor (R\$)', 'Meio']
        ];
        const data = reportTransactions.map(t => {
            let description = t.descricao;
            if (t.isInstallment && t.installmentInfo) {
                description = `${t.descricao} (Parcela ${t.installmentInfo.current}/${t.installmentInfo.total})`;
            }
            return [formatDisplayDate(t.data), t.tipo.toUpperCase(), t.categoria, t.subcategoria, description, t.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 }), formatMeio(t.meio)];
        });
        doc.text("Relatório Financeiro Doméstico", 14, 20);
        doc.autoTable({
            startY: 30,
            head: headers,
            body: data,
            theme: 'striped',
            styles: { fontSize: 8, cellPadding: 2, halign: 'left' },
            headStyles: { fillColor: [44, 62, 80], textColor: [255, 255, 255], fontStyle: 'bold' },
            columnStyles: { 5: { halign: 'right' } },
            margin: { top: 25, right: 10, bottom: 10, left: 10 },
            didParseCell: function(data) {
                if (data.section === 'body' && data.column.index === 5) {
                    const transaction = reportTransactions[data.row.index];
                    if (transaction && transaction.tipo === CONSTANTS.TRANSACTION_TYPE_INCOME) {
                        data.cell.styles.textColor = [40, 167, 69];
                    } else if (transaction && transaction.tipo === CONSTANTS.TRANSACTION_TYPE_EXPENSE) {
                        data.cell.styles.textColor = [176, 0, 32];
                    }
                }
            }
        });
        doc.save(`relatorio_financeiro_${new Date().toISOString().split('T')[0]}.pdf`);
        showAlert('Relatório exportado para PDF com sucesso!', CONSTANTS.ALERT_TYPE_SUCCESS);
    } catch (error) {
        console.error('Erro ao exportar relatório para PDF:', error);
        showAlert('Erro ao exportar relatório para PDF: ' + error.message, CONSTANTS.ALERT_TYPE_ERROR);
    }
}

// Obtém transações filtradas por data para relatórios.
async function getFilteredTransactionsForReports(dataInicio, dataFim) {
    let query = db.transactions;
    // Usa a coluna 'data' (indexada) para filtros de intervalo, que é eficiente.
    if (dataInicio && dataFim) {
        query = query.where('data').between(dataInicio, dataFim, true, true);
    } else if (dataInicio) {
        query = query.where('data').aboveOrEqual(dataInicio);
    } else if (dataFim) {
        query = query.where('data').belowOrEqual(dataFim);
    }
    return await query.sortBy('data');
}

// Atualiza as estatísticas gerais do sistema na aba de configurações.
async function updateSystemStats() {
    try {
        const { systemStats } = appState.domElements;
        const totalTransacoes = await db.transactions.count();
        const totalReceitas = await db.transactions.where('tipo').equals(CONSTANTS.TRANSACTION_TYPE_INCOME).count();
        const totalDespesas = await db.transactions.where('tipo').equals(CONSTANTS.TRANSACTION_TYPE_EXPENSE).count();

        // Estima o tamanho dos dados armazenados (aproximado).
        const allTransactions = await db.transactions.toArray();
        // Utiliza appState.categoriesData para o cálculo de tamanho
        const dataSize = JSON.stringify(allTransactions).length + JSON.stringify(appState.categoriesData).length;

        if (systemStats) {
            systemStats.innerHTML = `
                <div class="stat-card">
                    <div class="stat-value neutral">${totalTransacoes}</div>
                    <div class="stat-label">Total de Transações Registradas</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value positive">${totalReceitas}</div>
                    <div class="stat-label">Total de Receitas Registradas</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value negative">${totalDespesas}</div>
                    <div class="stat-label">Total de Despesas Registradas</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value neutral">${(dataSize / 1024).toFixed(2)} KB</div>
                    <div class="stat-label">Tamanho dos Dados (Estimado)</div>
                </div>
            `;
        }
    } catch (error) {
        console.error('Erro ao atualizar estatísticas do sistema:', error);
    }
}

// ==================== EXPORTAÇÃO E IMPORTAÇÃO DE DADOS COMPLETOS ====================
// Exporta todos os dados da aplicação para um arquivo JSON (backup).
async function exportData() {
    try {
        console.log('Exportando dados de backup...');
        const allTransactions = await db.transactions.toArray();
        const currentSettings = await db.appSettings.get('generalSettings');

        const dataToExport = {
            transactions: allTransactions,
            // Usa appState.categoriesData para garantir que as últimas categorias personalizadas sejam salvas.
            categoriesData: appState.categoriesData,
            lastImportedTransactionIds: currentSettings ? currentSettings.lastImportedTransactionIds : [],
            exportDate: new Date().toISOString(),
            version: '47_indexeddb_full_recurring_installment_refactored_document_classification_fixed_v2' // Atualiza a versão
        };
        const dataStr = JSON.stringify(dataToExport, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `financeiro_backup_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        showAlert('Dados de backup exportado com sucesso!', CONSTANTS.ALERT_TYPE_SUCCESS);
    } catch (error) {
        console.error('Erro ao exportar dados de backup:', error);
        showAlert('Erro ao exportar dados de backup: ' + error.message, CONSTANTS.ALERT_TYPE_ERROR);
    }
}

// Importa dados de um arquivo JSON (restauração de backup).
async function importData() {
    try {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = function(event) {
            const file = event.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = async function(e) {
                try {
                    const importedData = JSON.parse(e.target.result);
                    // Valida a estrutura dos dados importados.
                    if (importedData.transactions && Array.isArray(importedData.transactions)) {
                        // MELHORIA: Usa modal de confirmação customizado
                        showConfirmationModal('Confirmar Importação', `Isso irá substituir TODOS os dados existentes por ${importedData.transactions.length} transações. Continuar?`, async (confirmed) => {
                            if (confirmed) {
                                await db.transactions.clear();
                                await db.appSettings.clear();

                                await db.transactions.bulkAdd(importedData.transactions);

                                // Atualiza appState com os dados importados
                                appState.categoriesData = importedData.categoriesData || DEFAULT_CATEGORIES_DATA;
                                appState.lastImportedTransactionIds = importedData.lastImportedTransactionIds || [];

                                await db.appSettings.put({
                                    id: 'generalSettings',
                                    categoriesData: appState.categoriesData,
                                    lastImportedTransactionIds: appState.lastImportedTransactionIds,
                                    lastBackup: importedData.exportDate,
                                });

                                showAlert('Dados importados com sucesso!', CONSTANTS.ALERT_TYPE_SUCCESS);
                                // Recarrega todos os dados na interface.
                                loadTransactions();
                                generateReports();
                                updateFilterCategories();
                                updateSystemStats();
                                loadCategoriesManagementTable();
                            }
                        });
                    } else {
                        showAlert('Arquivo de importação inválido! Formato esperado: JSON com array de "transactions".', CONSTANTS.ALERT_TYPE_ERROR);
                    }
                } catch (error) {
                    showAlert('Erro ao importar dados: ' + error.message, CONSTANTS.ALERT_TYPE_ERROR);
                }
            };
            reader.readAsText(file);
        };
        input.click();
    } catch (error) {
        console.error('Erro ao importar dados:', error);
        showAlert('Erro ao importar dados: ' + error.message, CONSTANTS.ALERT_TYPE_ERROR);
    }
}

// Limpa todos os dados da aplicação (transações e configurações).
async function clearAllData() {
    try {
        // MELHORIA: Usa modal de confirmação customizado
        showConfirmationModal('ATENÇÃO: Apagar Todos os Dados!', 'Isso irá apagar TODOS os dados do sistema. Esta ação não pode ser desfeita. Tem certeza?', async (confirmedFirst) => {
            if (confirmedFirst) {
                showConfirmationModal('Confirmação Final', 'Última confirmação: Todos os dados serão perdidos permanentemente. Continuar?', async (confirmedFinal) => {
                    if (confirmedFinal) {
                        await db.transactions.clear();
                        await db.appSettings.clear();

                        // Reseta appState para os valores padrão
                        appState.categoriesData = DEFAULT_CATEGORIES_DATA;
                        appState.lastImportedTransactionIds = [];

                        await db.appSettings.put({
                            id: 'generalSettings',
                            categoriesData: appState.categoriesData,
                            lastImportedTransactionIds: appState.lastImportedTransactionIds,
                        });

                        showAlert('Todos os dados foram removidos!', CONSTANTS.ALERT_TYPE_SUCCESS);
                        // Recarrega todos os dados na interface para um estado limpo.
                        loadTransactions();
                        generateReports();
                        updateFilterCategories();
                        updateSystemStats();
                        loadCategoriesManagementTable();
                    }
                });
            }
        });
    } catch (error) {
        console.error('Erro ao limpar dados:', error);
        showAlert('Erro ao limpar dados: ' + error.message, CONSTANTS.ALERT_TYPE_ERROR);
    }
}

// Formata uma string de data para exibição no formato local (pt-BR).
function formatDisplayDate(dateString) {
    try {
        const date = new Date(dateString + 'T00:00:00');
        // Verifica se a data é válida antes de formatar
        if (isNaN(date.getTime())) {
            console.warn('Data inválida para exibição:', dateString);
            return dateString; // Retorna a string original se inválida
        }
        return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
    } catch (error) {
        console.error('Erro ao formatar data para exibição:', error);
        return dateString;
    }
}

// Formata o valor 'meio' de pagamento para exibição amigável.
function formatMeio(meio) {
    const meios = {
        'pix': 'PIX',
        'cartao_credito': 'Cartão de Crédito',
        'debito': 'Débito',
        'dinheiro': 'Dinheiro',
        'boleto': 'Boleto',
        'transferencia': 'Transferência',
        'outros': 'Outros'
    };
    return meios[meio] || meio;
}

// Exibe um alerta de notificação na interface.
function showAlert(message, type) {
    try {
        let alertContainer = document.getElementById('globalAlertContainer');
        if (!alertContainer) {
            alertContainer = document.createElement('div');
            alertContainer.id = 'globalAlertContainer';
            alertContainer.className = 'alert-container';
            alertContainer.setAttribute('role', 'status');
            document.body.appendChild(alertContainer);
        }
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.textContent = message; // Usando textContent para evitar XSS em alertas
        alertContainer.appendChild(alertDiv);
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.parentNode.removeChild(alertDiv);
            }
        }, 5000);
        console.log(`${type.toUpperCase()}: ${message}`);
    } catch (error) {
        console.error('Erro ao mostrar alerta:', error);
    }
}

// Exibe um modal com detalhes de transações usando classes CSS.
async function showTransactionDetailsModal(title, transactionsToShow) {
    const { transactionDetailsModal, transactionDetailsTitle, transactionDetailsBody } = appState.domElements;

    if (!transactionDetailsModal || !transactionDetailsTitle || !transactionDetailsBody) {
        console.error('Elementos do modal de detalhes da transação não encontrados.');
        return;
    }

    transactionDetailsTitle.textContent = title; // Usando textContent
    transactionDetailsBody.innerHTML = '';

    if (transactionsToShow.length === 0) {
        const row = transactionDetailsBody.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 7;
        cell.textContent = 'Nenhuma transação encontrada para esta categoria.'; // Usando textContent
        cell.style.textAlign = 'center';
    } else {
        // Refatorado para usar criação programática de elementos e textContent
        transactionsToShow.forEach(transaction => {
            let description = transaction.descricao;
            if (transaction.isInstallment && transaction.installmentInfo) {
                description = `${transaction.descricao} (Parcela ${transaction.installmentInfo.current}/${transaction.installmentInfo.total})`;
            }
            const row = transactionDetailsBody.insertRow();

            const dateCell = document.createElement('td');
            dateCell.textContent = formatDisplayDate(transaction.data);
            row.appendChild(dateCell);

            const typeCell = document.createElement('td');
            const typeSpan = document.createElement('span');
            typeSpan.className = `badge ${transaction.tipo === CONSTANTS.TRANSACTION_TYPE_INCOME ? 'positive' : 'negative'}`;
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
            amountCell.textContent = `R\$ ${transaction.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
            row.appendChild(amountCell);

            const meioCell = document.createElement('td');
            meioCell.textContent = formatMeio(transaction.meio);
            row.appendChild(meioCell);
        });
    }

    transactionDetailsModal.classList.add('is-active'); // Adiciona a classe 'is-active'
}

// NOVO: Função para exibir o modal de confirmação customizado
/**
 * Exibe um modal de confirmação customizado.
 * @param {string} title - Título do modal.
 * @param {string} message - Mensagem a ser exibida.
 * @param {function(boolean): void} callback - Função a ser executada ao confirmar ou cancelar. Recebe 'true' para confirmar, 'false' para cancelar.
 */
function showConfirmationModal(title, message, callback) {
    const { confirmationModal, confirmationModalTitle, confirmationModalMessage, confirmActionBtn, cancelConfirmationBtn, closeConfirmationModalBtn } = appState.domElements;
    if (!confirmationModal) {
        console.error('Modal de confirmação não encontrado.');
        // Executa o callback com 'false' se o modal não existe para evitar travamento
        if (callback && typeof callback === 'function') callback(false);
        return;
    }

    confirmationModalTitle.textContent = title;
    confirmationModalMessage.textContent = message;

    // Remove ouvintes anteriores para evitar múltiplas execuções
    // Armazena o callback temporariamente no botão de confirmação
    confirmActionBtn.onclick = null; // Limpa qualquer listener inline
    confirmActionBtn._callback = null; // Limpa a referência anterior do callback

    // Removendo listeners com a função nomeada para que possam ser removidos corretamente
    const oldConfirmHandler = confirmActionBtn._confirmHandler;
    const oldCancelHandler = cancelConfirmationBtn._cancelHandler;
    const oldCloseHandler = closeConfirmationModalBtn._closeHandler;

    if (oldConfirmHandler) confirmActionBtn.removeEventListener('click', oldConfirmHandler);
    if (oldCancelHandler) cancelConfirmationBtn.removeEventListener('click', oldCancelHandler);
    if (oldCloseHandler) closeConfirmationModalBtn.removeEventListener('click', oldCloseHandler);

    const confirmHandler = () => {
        confirmationModal.classList.remove('is-active');
        if (callback && typeof callback === 'function') {
            callback(true); // Indica que a ação foi confirmada
        }
    };

    const cancelHandler = () => {
        confirmationModal.classList.remove('is-active');
        if (callback && typeof callback === 'function') {
            callback(false); // Indica que a ação foi cancelada
        }
    };

    // Adiciona ouvintes e armazena suas referências para remoção futura
    confirmActionBtn.addEventListener('click', confirmHandler, { once: true });
    cancelConfirmationBtn.addEventListener('click', cancelHandler, { once: true });
    closeConfirmationModalBtn.addEventListener('click', cancelHandler, { once: true }); // Fecha via 'x' no modal

    confirmActionBtn._confirmHandler = confirmHandler;
    cancelConfirmationBtn._cancelHandler = cancelHandler;
    closeConfirmationModalBtn._closeHandler = cancelHandler;

    // Armazena o callback para ser acessível se o modal for fechado sem clicar (ex: via close button)
    confirmActionBtn._callback = callback;


    confirmationModal.classList.add('is-active');
}

// Simula um backup automático (apenas atualiza um timestamp, não exporta de fato).
async function autoBackup() {
    try {
        const settings = await db.appSettings.get('generalSettings');
        const lastBackupTimestamp = settings?.lastBackup || 0;
        const now = new Date().getTime();
        const oneWeek = 7 * 24 * 60 * 60 * 1000;

        if ((now - lastBackupTimestamp) > oneWeek) {
            await db.appSettings.update('generalSettings', {
                lastBackup: now
            });
            console.log('Backup automático simulado (timestamp atualizado)');
        }
    } catch (error) {
        console.error('Erro no backup automático:', error);
    }
}
window.addEventListener('load', autoBackup);

// Manipuladores de erros globais para capturar e exibir alertas.
window.addEventListener('error', function(event) {
    console.error('Erro global capturado:', event.error);
    showAlert('Erro inesperado: ' + (event.error ? event.error.message : 'desconhecido'), CONSTANTS.ALERT_TYPE_ERROR);
});
window.addEventListener('unhandledrejection', function(event) {
    console.error('Promise rejeitada:', event.reason);
    showAlert('Erro de promessa: ' + (event.reason ? event.reason.message || event.reason : 'desconhecido'), CONSTANTS.ALERT_TYPE_ERROR);
});

// Função de depuração que pode ser removida em produção.
async function debugInfo() {
    console.log('=== DEBUG INFO ===');
    try {
        const transactionCount = await db.transactions.count();
        console.log('Transações no DB:', transactionCount);
        console.log('Categorias atuais (appState.categoriesData):', appState.categoriesData);
        console.log('Ordem de ordenação atual:', appState.currentSortOrder);
        const settings = await db.appSettings.get('generalSettings');
        console.log('Configurações do App (DB):', settings);
    } catch (error) {
        console.error('Erro ao coletar info de debug:', error);
    }
    console.log('==================');
}
setTimeout(debugInfo, 2000);

// ==================== AJUSTE DE GRÁFICOS ====================
// Redimensiona os gráficos Plotly para se ajustarem à tela.
function resizePlotlyCharts() {
    const { mainChartArea } = appState.domElements;
    if (mainChartArea && mainChartArea.offsetParent !== null && mainChartArea.innerHTML.trim() !== '') {
        try {
            Plotly.Plots.resize(mainChartArea);
        } catch (e) {
            console.warn("Aviso: não foi possível redimensionar o gráfico Plotly. Pode ainda não estar totalmente renderizado.");
        }
    }
}

window.addEventListener('resize', resizePlotlyCharts);


// ==================== NOVAS FUNÇÕES PARA RECORRÊNCIA E PARCELAMENTO ====================

/**
 * Calcula a próxima data de ocorrência com base na data inicial e frequência.
 * @param {string} startDate - Data inicial no formato 'YYYY-MM-DD'.
 * @param {string} frequency - Frequência ('weekly', 'monthly', 'bimestral', 'quarterly', 'semestral', 'yearly').
 * @returns {string|null} Próxima data no formato 'YYYY-MM-DD' ou null se a frequência for inválida.
 */
function calculateNextOccurrence(startDate, frequency) {
    let nextDate = new Date(startDate + 'T00:00:00');

    switch (frequency) {
        case CONSTANTS.RECURRING_FREQUENCY_WEEKLY:
            nextDate.setDate(nextDate.getDate() + 7);
            break;
        case CONSTANTS.RECURRING_FREQUENCY_MONTHLY:
            nextDate.setMonth(nextDate.getMonth() + 1);
            break;
        case CONSTANTS.RECURRING_FREQUENCY_BIMESTRAL:
            nextDate.setMonth(nextDate.getMonth() + 2);
            break;
        case CONSTANTS.RECURRING_FREQUENCY_QUARTERLY:
            nextDate.setMonth(nextDate.getMonth() + 3);
            break;
        case CONSTANTS.RECURRING_FREQUENCY_SEMESTRAL:
            nextDate.setMonth(nextDate.getMonth() + 6);
            break;
        case CONSTANTS.RECURRING_FREQUENCY_YEARLY:
            nextDate.setFullYear(nextDate.getFullYear() + 1);
            break;
        default:
            return null;
    }
    return nextDate.toISOString().split('T')[0];
}

/**
 * Adiciona meses a uma data, ajustando para o final do mês se necessário.
 * Usado para calcular datas de parcelas.
 * @param {Date} date - Objeto Date.
 * @param {number} months - Número de meses a adicionar.
 * @returns {Date} Nova data.
 */
function addMonths(date, months) {
    const d = new Date(date);
    const originalDay = d.getDate();
    d.setMonth(d.getMonth() + months);
    // Se o dia original era o último dia do mês, e o novo mês tem menos dias, ajusta para o último do mês correto
    if (d.getDate() !== originalDay && originalDay > d.getDate()) {
        d.setDate(0); // Último dia do mês anterior, para então setar para o último do mês correto
    }
    return d;
}

/**
 * Verifica e gera transações recorrentes pendentes.
 * Esta função é executada na inicialização do sistema.
 */
async function checkAndGenerateRecurringTransactions() {
    console.log('Verificando e gerando transações recorrentes pendentes...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
        const allTransactions = await db.transactions.toArray();
        // Filtra os modelos de recorrência (isRecurring=true e sem parentRecurringId)
        const recurringModels = allTransactions.filter(t => t.isRecurring && !t.parentRecurringId);

        let generatedCount = 0;
        const transactionsToBulkAdd = []; // Array para coletar novas ocorrências para bulkAdd

        for (const model of recurringModels) {
            if (!model.nextOccurrenceDate) continue; // Pula se nextOccurrenceDate não estiver definido

            let nextOccDateObj = new Date(model.nextOccurrenceDate + 'T00:00:00');
            nextOccDateObj.setHours(0, 0, 0, 0);

            // Gera ocorrências até a data atual
            while (nextOccDateObj <= today) {
                const newOccurrence = {
                    data: model.nextOccurrenceDate,
                    tipo: model.tipo,
                    categoria: model.categoria,
                    subcategoria: model.subcategoria,
                    valor: model.valor,
                    meio: model.meio,
                    descricao: model.descricao,
                    dataCreated: new Date().toISOString(),
                    isRecurring: true, // Marca como parte de uma série recorrente
                    recurringFrequency: model.recurringFrequency,
                    nextOccurrenceDate: null, // Ocorrências geradas não têm 'nextOccurrenceDate'
                    parentRecurringId: model.id, // Referência ao ID do modelo original
                    isInstallment: false,
                    installmentInfo: null,
                    groupId: null
                };
                transactionsToBulkAdd.push(newOccurrence); // Adiciona ao array para bulkAdd
                generatedCount++;

                // Calcula a próxima data de ocorrência para o modelo
                model.nextOccurrenceDate = calculateNextOccurrence(model.nextOccurrenceDate, model.recurringFrequency);
                if (!model.nextOccurrenceDate) { // Se não há próxima data válida, sai do loop
                    break;
                }
                nextOccDateObj.setTime(new Date(model.nextOccurrenceDate + 'T00:00:00').setHours(0, 0, 0, 0));
            }
            // Atualiza o modelo original com a próxima data de ocorrência calculada
            await db.transactions.put(model);
        }

        // Adiciona todas as transações geradas ao banco de dados em uma única operação bulk
        if (transactionsToBulkAdd.length > 0) {
            await db.transactions.bulkAdd(transactionsToBulkAdd);
        }

        if (generatedCount > 0) {
            showAlert(`${generatedCount} transação(ões) recorrente(s) gerada(s)!`, CONSTANTS.ALERT_TYPE_SUCCESS);
            loadTransactions(); // Recarrega a lista de transações para mostrar as novas
        }
    } catch (error) {
        console.error('Erro ao verificar e gerar transações recorrentes:', error);
        showAlert('Erro ao gerar transações recorrentes: ' + error.message, CONSTANTS.ALERT_TYPE_ERROR);
    }
}