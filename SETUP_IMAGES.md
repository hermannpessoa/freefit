# Setup: Imagens de Treino no Supabase

Este documento explica como configurar a geração e armazenamento de imagens de treino usando Replicate e Supabase Storage.

## Passos para Configurar

### 1. Criar Bucket no Supabase Storage

1. Acesse o dashboard Supabase → **Storage**
2. Clique em **Create a new bucket**
3. Nome: `workout-images`
4. Deixe como **Public** para permitir acesso público às imagens
5. Clique em **Create bucket**

### 2. Configurar as Políticas de Acesso (RLS)

No painel de **Storage**, selecione o bucket `workout-images` e vá para **Policies**:

```sql
-- Allow anyone to list files
CREATE POLICY "Allow public list on workout-images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'workout-images');

-- Allow authenticated users to upload
CREATE POLICY "Allow authenticated upload to workout-images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'workout-images');

-- Allow authenticated users to delete their own files
CREATE POLICY "Allow authenticated delete from workout-images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'workout-images' AND (auth.uid())::text = (storage.foldername(name))[1]);
```

### 3. Configurar Edge Function

Se estiver usando Supabase com CLI:

```bash
# Instale a CLI do Supabase (se não tiver)
npm install -g supabase

# Login
supabase login

# Deploy a function
supabase functions deploy generate-workout-image --project-id seu-project-id

# Configure as variáveis de ambiente
supabase secrets set REPLICATE_API_KEY=seu_replicate_api_key --project-id seu-project-id
```

Se estiver usando EasyPanel (hospedagem em produção):

- Configure a variável de ambiente `REPLICATE_API_KEY` no painel do EasyPanel
- A Edge Function será deployada automaticamente do repositório GitHub

### 4. Verificar as Variáveis de Ambiente

No arquivo `.env.local`:

```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key
VITE_OPENROUTER_API_KEY=sua_openrouter_key
VITE_REPLICATE_API_KEY=sua_replicate_key (não é usado no cliente, mas pode estar aqui)
```

### 5. Testar a Geração de Imagens

1. Clique em "Gerar Treino" na página de geração de treinos
2. Espere a imagem ser gerada (pode levar até 30 segundos)
3. Verifique se a imagem aparece acima dos detalhes do treino
4. Verifique o Storage do Supabase → verifique se o arquivo foi criado em `workout-images/`

## Troubleshooting

### Imagens não aparecem
- Verifique se o bucket `workout-images` existe e é **Public**
- Verifique se a REPLICATE_API_KEY está configurada
- Verifique os logs da Edge Function no Supabase

### Erro de CORS
- As imagens são geradas no servidor (Edge Function), não no cliente
- Se ainda receber erro de CORS, verifique as políticas de acesso do bucket

### Edge Function não existe
- Se deployar manualmente: `supabase functions deploy generate-workout-image`
- Se usar EasyPanel: commit e push o código para o GitHub, a função será deployada automaticamente

## Estrutura de Diretórios no Storage

```
workout-images/
├── user-id-1/
│   ├── treino-peito-1706816400000.jpg
│   ├── treino-costas-1706816500000.jpg
│   └── ...
├── user-id-2/
│   ├── treino-perna-1706816400000.jpg
│   └── ...
└── ...
```

Cada usuário tem sua pasta para organizar melhor as imagens.

## Custos

- **Replicate SDXL**: ~$0.02-0.04 por imagem gerada
- **Supabase Storage**: $5/mês para 100GB (tier pago)
- **Bandwidth**: Incluído no plano

## Próximos Passos

- [ ] Adicionar cache de imagens geradas
- [ ] Permitir ao usuário regenerar a imagem
- [ ] Adicionar galeria de imagens geradas
- [ ] Implementar otimização automática de imagens
