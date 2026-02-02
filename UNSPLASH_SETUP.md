# Setup Unsplash API

## 1. Registre sua aplicação no Unsplash

1. Vá para https://unsplash.com/oauth/applications
2. Faça login (crie conta se não tiver)
3. Clique em "Create a new application"
4. Aceite os termos
5. Preencha:
   - **App name**: FreeFit
   - **Description**: AI workout generator app
6. Clique em "Create application"

## 2. Copie a Access Key

1. Na página da aplicação, procure por "Access Key"
2. Copie a chave (começa com algo como `xxxxxx_xxxxxxx`)

## 3. Configure a variável de ambiente

Abra o arquivo `.env.local` (ou crie um) e adicione:

```
VITE_UNSPLASH_API_KEY=sua_chave_aqui
```

## 4. Pronto!

A API do Unsplash é gratuita e oferece:
- 50 requisições/hora sem autenticação
- 5000 requisições/hora com autenticação (nossa chave)
- Imagens de alta qualidade
- Perfeito para fitness/exercises

Depois que configurar a chave, roda o app novamente e as imagens serão buscadas do Unsplash!
