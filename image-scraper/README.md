# Image Scraper para Exercícios

Script Python para buscar automaticamente imagens de exercícios no Google Images via web scraping e atualizar o banco de dados Supabase.

## Configuração

### 1. Instalar dependências

```bash
cd image-scraper
pip install -r requirements.txt
```

### 2. Configurar variáveis de ambiente

As variáveis `VITE_SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` já devem estar configuradas no arquivo `.env.local` na raiz do projeto.

## Como usar

### Buscar imagens para todos os exercícios sem foto

```bash
python fetch_exercise_images.py
```

O script irá:
1. Conectar ao banco de dados Supabase
2. Buscar todos os exercícios que não possuem imagem (`demo_image` vazio ou NULL)
3. Para cada exercício, buscar uma foto no Google Images usando o nome + categoria
4. Fazer scraping do HTML do Google Images para extrair URLs de imagens
5. Atualizar a coluna `demo_image` com a URL da imagem encontrada
6. Mostrar um resumo ao final

## Recursos

- ✅ Busca automática via web scraping do Google Images
- ✅ Usa nome e categoria do exercício para busca mais precisa
- ✅ Headers de navegador para evitar bloqueios
- ✅ Rate limiting (2 segundos entre requisições)
- ✅ Tratamento de erros robusto
- ✅ Log detalhado do processo
- ✅ Atualização apenas de exercícios sem imagem

## Tecnologias

- **requests**: Para fazer as requisições HTTP
- **BeautifulSoup4**: Para parsear o HTML do Google Images
- **lxml**: Parser rápido para o BeautifulSoup
- **psycopg2**: Para conexão com PostgreSQL/Supabase

## Notas

- O script busca apenas exercícios sem imagens existentes
- As imagens são salvas apenas como URLs (não faz download dos arquivos)
- É possível rodar o script múltiplas vezes sem problemas
- Se um exercício não tiver imagem encontrada, ele continuará sem imagem
- O Google pode eventualmente bloquear requisições excessivas, por isso há um delay de 2 segundos entre cada busca
- O scraping busca URLs tanto em tags `<img>` quanto em scripts JavaScript embutidos no HTML
