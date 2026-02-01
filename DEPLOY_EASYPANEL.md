# Deploy no EasyPanel

Este arquivo documenta como fazer o deploy da aplicação FreeFit no EasyPanel.

## Pré-requisitos

- EasyPanel instalado e configurado
- Docker disponível
- GitHub repositório sincronizado

## Configuração

### 1. Caddyfile

O arquivo `Caddyfile` na raiz do projeto configura o servidor web para:
- Servir arquivos estáticos do diretório `/app/dist`
- Configurar headers MIME corretos para JavaScript/WebAssembly
- Redirecionar todas as rotas para `index.html` (SPA routing)
- Habilitar compressão gzip

### 2. Build

O projeto usa Vite para build. O comando de build está em `package.json`:

```bash
npm run build:full
```

Isso:
1. Compila TypeScript com `tsc -b`
2. Faz bundle com Vite em `/dist`

### 3. Deploy no EasyPanel

Ao fazer deploy no EasyPanel:

1. **Conecte seu repositório GitHub**
2. **Configurar Build**:
   - Build command: `npm run build:full`
   - Publish directory: `dist`

3. **Variáveis de Ambiente**:
   ```
   VITE_SUPABASE_URL=sua_url_supabase
   VITE_SUPABASE_ANON_KEY=sua_chave_anonima
   VITE_OPENROUTER_API_KEY=sua_chave_openrouter
   ```

4. **Servidor**:
   - EasyPanel usa Caddy automaticamente
   - O arquivo `Caddyfile` será detectado e usado

## Troubleshooting

### Erro: "Failed to load module script"

**Causa**: Headers MIME não configurados corretamente.

**Solução**: 
- Verifique se o `Caddyfile` está no repositório
- Verifique se a build está gerando `/dist/index.html`
- Limpe cache: DELETE `/etc/easypanel/projects/freefit/frontend/cache`

### Erro: "Cannot find module"

**Causa**: Dependências não instaladas ou versão desatualizada.

**Solução**:
- Atualize `package-lock.json`: `npm install`
- Verifique se todas as versões são compatíveis
- Delete `node_modules` e refaça: `npm ci`

### App fica em loading infinito

**Causa**: Credenciais Supabase não configuradas.

**Solução**:
- Verifique variáveis de ambiente em EasyPanel
- Confirme que as credenciais estão corretas
- Verifique o console do navegador (F12) para mais detalhes

## Arquivos Importantes

- `Caddyfile` - Configuração do servidor web
- `dist/` - Build compilado (gerado por `npm run build:full`)
- `.env.local` - Variáveis locais (não commitar)
- `package.json` - Scripts e dependências

## Links Úteis

- [Documentação Vite](https://vitejs.dev/)
- [Documentação Caddy](https://caddyserver.com/)
- [EasyPanel Docs](https://easypanel.io/)
