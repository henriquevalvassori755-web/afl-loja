// Importa as bibliotecas necessárias
require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const multer = require('multer');
const serverless = require('serverless-http'); // <-- Adicionada a biblioteca

// Inicializa o aplicativo Express
const app = express();

// Configura o multer para lidar com o upload de arquivos na memória
const upload = multer({ storage: multer.memoryStorage() });

// Configura o middleware para servir arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); // Middleware para processar JSON

// Recupera as variáveis de ambiente para conexão com o Supabase
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// Inicializa o cliente Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Rota para listar todos os produtos, filtrar por categoria, loja e buscar por termo
app.get('/api/produtos', async (req, res) => {
    // Recupera e sanitiza os query params
    const { categoria, termo, loja, fuzzy = 'false', page = 1, limit = 1000, orderBy = 'nome_asc' } = req.query; // limit alto para debug (todos itens)
    
    // Sanitização: remove espaços extras
    const cleanCategoria = categoria ? categoria.toString().trim() : null;
    const cleanLoja = loja ? loja.toString().trim() : null;
    const cleanTermo = termo ? termo.toString().trim() : null;
    const isFuzzy = fuzzy.toString().toLowerCase() === 'true';
    
    // LOGS PARA DEBUG: Veja isso no console/Netlify
    console.log('=== DEBUG FILTROS ===');
    console.log('Params recebidos:', { categoria: cleanCategoria, loja: cleanLoja, termo: cleanTermo, fuzzy: isFuzzy });
    console.log('Paginação:', { page: parseInt(page), limit: parseInt(limit) });
    
    let query = supabase.from('produtos').select('*');

    // Filtro por categoria
    if (cleanCategoria) {
        if (isFuzzy) {
            query = query.ilike('categoria', `%${cleanCategoria}%`);
            console.log(`Filtro categoria (fuzzy): categoria ILIKE '%${cleanCategoria}%'`);
        } else {
            query = query.eq('categoria', cleanCategoria);
            console.log(`Filtro categoria (exato): categoria = '${cleanCategoria}'`);
        }
    }
    
    // Filtro por loja
    if (cleanLoja) {
        if (isFuzzy) {
            query = query.ilike('loja', `%${cleanLoja}%`);
            console.log(`Filtro loja (fuzzy): loja ILIKE '%${cleanLoja}%'`);
        } else {
            query = query.eq('loja', cleanLoja);
            console.log(`Filtro loja (exato): loja = '${cleanLoja}'`);
        }
    }

    // Filtro por termo de busca (nome ou descrição) - Mantido original, pois funcionava
    if (cleanTermo) {
        const orCondition = `nome.ilike.%${cleanTermo}%,descricao.ilike.%${cleanTermo}%`;
        query = query.or(orCondition);
        console.log(`Filtro termo: OR (nome ILIKE '%${cleanTermo}%' OR descricao ILIKE '%${cleanTermo}%')`);
    }

    // Ordenação simples (padrão por nome asc)
    query = query.order('nome', { ascending: true });
    console.log('Ordenação: nome ASC');

    // Paginação (desabilitada por padrão para debug; use params para ativar)
    const pageNum = parseInt(page) || 1;
    const limitNum = Math.min(parseInt(limit) || 1000, 1000); // Máx 1000 para evitar overload
    const offset = (pageNum - 1) * limitNum;
    query = query.range(offset, offset + limitNum - 1);
    console.log(`Paginação aplicada: offset=${offset}, limit=${limitNum}`);

    console.log('Query final montada. Executando...');

    const { data, error } = await query;

    if (error) {
        console.error('Erro ao buscar produtos:', error);
        return res.status(500).json({ error: `Erro ao buscar produtos. Detalhes: ${error.message}` });
    }

    console.log(`Resultado: ${data ? data.length : 0} produtos encontrados.`);
    console.log('=== FIM DEBUG ===');

    // Resposta: APENAS o array de produtos
    res.status(200).json(data || []);
});

// Rota para cadastrar um novo produto com upload de imagem (mantida inalterada)
// Rota para cadastrar um novo produto com upload de imagem
app.post('/api/cadastrar-produto', upload.single('imagem'), async (req, res) => {
    const { nome, categoria, descricao, preco, loja, link } = req.body;
    const imagemFile = req.file;

    if (!imagemFile) {
        return res.status(400).json({ error: 'Nenhuma imagem foi enviada.' });
    }

    const fileName = `${Date.now()}-${imagemFile.originalname}`;
    const filePath = `produtos/${fileName}`;

    try {
        const { error: uploadError } = await supabase.storage
            .from('imagens-produtos')
            .upload(filePath, imagemFile.buffer, {
                contentType: imagemFile.mimetype,
            });

        if (uploadError) {
            console.error('Erro no upload da imagem:', uploadError);
            return res.status(500).json({ error: 'Erro ao fazer upload da imagem.' });
        }

        const { data: publicUrlData } = supabase.storage
            .from('imagens-produtos')
            .getPublicUrl(filePath);

        const imagem_url = publicUrlData.publicUrl;

        // Corrigido: Removida a tentativa de obter 'data' na inserção
        const { error: insertError } = await supabase
            .from('produtos')
            .insert([{
                nome,
                categoria,
                descricao,
                preco,
                loja,
                imagem_url,
                link
            }]);

        if (insertError) {
            await supabase.storage.from('imagens-produtos').remove([filePath]);
            console.error('Erro ao cadastrar produto:', insertError);
            return res.status(500).json({ error: 'Erro ao cadastrar produto.' });
        }

        // Corrigido: Retorna apenas a mensagem de sucesso
        res.status(201).json({ message: 'Produto cadastrado com sucesso!' });

    } catch (err) {
        console.error('Erro no servidor:', err);
        res.status(500).json({ error: 'Erro no servidor.' });
    }
});

// Exporta a aplicação para ser usada pelo Netlify Functions.
module.exports.handler = serverless(app);