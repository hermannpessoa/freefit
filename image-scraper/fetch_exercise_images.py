"""
Script para buscar automaticamente imagens de exercícios no Google Images e atualizar o banco de dados
Usa web scraping para encontrar fotos de exercícios
Usage: python fetch_exercise_images.py
"""

import os
import sys
import requests
import psycopg2
from dotenv import load_dotenv
import time
import re
from bs4 import BeautifulSoup
import json

# Set UTF-8 encoding for Windows console
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# Load environment variables from parent .env.local
load_dotenv('../.env.local')

# Database Configuration
SUPABASE_URL = os.getenv('VITE_SUPABASE_URL', '')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY', '')
DATABASE_URL = os.getenv('DATABASE_URL', '')

# Extract project reference from Supabase URL
if DATABASE_URL:
    connection_string = DATABASE_URL
else:
    project_ref = SUPABASE_URL.split('//')[1].split('.')[0] if SUPABASE_URL else ''
    connection_string = f'postgresql://postgres.{project_ref}:{SUPABASE_KEY}@aws-0-us-east-1.pooler.supabase.com:6543/postgres'

# Request headers to mimic a browser
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br',
    'DNT': '1',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1'
}

def search_exercise_image(exercise_name, exercise_category=''):
    """
    Busca uma imagem para o exercício no Google Images
    """
    # Criar query de busca mais específica
    search_query = f'{exercise_name} exercise fitness'
    if exercise_category:
        search_query += f' {exercise_category}'

    # URL do Google Images
    google_images_url = f'https://www.google.com/search?q={search_query}&tbm=isch'

    try:
        # Fazer a requisição
        response = requests.get(google_images_url, headers=HEADERS, timeout=10)
        response.raise_for_status()

        # Parsear HTML
        soup = BeautifulSoup(response.text, 'lxml')

        # Procurar por imagens no HTML
        # O Google Images usa JavaScript, mas algumas URLs ainda estão no HTML
        image_urls = []

        # Método 1: Procurar em tags <img>
        for img in soup.find_all('img'):
            src = img.get('src') or img.get('data-src')
            if src and src.startswith('http') and 'gstatic' not in src:
                image_urls.append(src)

        # Método 2: Procurar em scripts que contêm dados JSON
        scripts = soup.find_all('script')
        for script in scripts:
            if script.string and 'data:image' not in script.string:
                # Procurar por URLs de imagens no JavaScript
                matches = re.findall(r'https?://[^\s<>"]+?\.(?:jpg|jpeg|png|gif|webp)', script.string)
                for match in matches:
                    if 'gstatic' not in match and match not in image_urls:
                        image_urls.append(match)

        # Filtrar e pegar a primeira imagem válida
        for url in image_urls:
            # Verificar se a URL é válida e não é um ícone pequeno
            if len(url) > 50 and not any(skip in url for skip in ['logo', 'icon', 'button', 'gstatic']):
                print(f'   ✅ Imagem encontrada')
                return url

        print(f'   ⚠️  Nenhuma imagem encontrada')
        return None

    except requests.exceptions.RequestException as e:
        print(f'   ❌ Erro ao buscar imagem: {e}')
        return None
    except Exception as e:
        print(f'   ❌ Erro ao processar HTML: {e}')
        return None

def update_exercise_image(cursor, exercise_id, image_url):
    """
    Atualiza a coluna demo_image de um exercício
    """
    try:
        cursor.execute(
            'UPDATE exercises SET demo_image = %s WHERE id = %s',
            (image_url, exercise_id)
        )
        return True
    except Exception as e:
        print(f'   ❌ Erro ao atualizar banco: {e}')
        return False

def main():
    print('\n🔍 Iniciando busca de imagens de exercícios no Google Images...\n')

    # Conectar ao banco de dados
    try:
        conn = psycopg2.connect(
            connection_string,
            connect_timeout=10,
            sslmode='require'
        )
        cursor = conn.cursor()
        print('✅ Conectado ao banco de dados\n')
    except Exception as e:
        print(f'❌ Erro ao conectar ao banco: {e}')
        print(f'Connection string (sem senha): {connection_string.split(":")[0]}')
        return

    try:
        # Buscar exercícios sem imagem (ou todos, se preferir)
        cursor.execute("""
            SELECT id, name, category, demo_image
            FROM exercises
            WHERE demo_image IS NULL OR demo_image = ''
            ORDER BY name
        """)

        exercises = cursor.fetchall()

        if not exercises:
            print('✅ Todos os exercícios já possuem imagens!')
            return

        print(f'📋 Encontrados {len(exercises)} exercícios sem imagem\n')
        print('═' * 60)

        updated_count = 0
        skipped_count = 0

        for exercise in exercises:
            exercise_id, name, category, current_image = exercise

            print(f'\n📝 Processando: {name} (ID: {exercise_id})')
            print(f'   Categoria: {category or "N/A"}')

            # Buscar imagem
            image_url = search_exercise_image(name, category or '')

            if image_url:
                # Atualizar no banco
                if update_exercise_image(cursor, exercise_id, image_url):
                    conn.commit()
                    updated_count += 1
                    print(f'   💾 Atualizado com sucesso!')
                    print(f'   🔗 URL: {image_url[:80]}...')
                else:
                    skipped_count += 1
            else:
                skipped_count += 1

            # Rate limiting - evitar sobrecarga no Google
            time.sleep(2)  # 2 segundos entre requisições

        print('\n' + '═' * 60)
        print(f'\n✅ Processo concluído!')
        print(f'   - Imagens atualizadas: {updated_count}')
        print(f'   - Exercícios sem imagem: {skipped_count}')
        print()

    except Exception as e:
        print(f'\n❌ Erro: {e}')
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

if __name__ == '__main__':
    main()
