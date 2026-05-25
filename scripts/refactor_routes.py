import os
import re

SCREENS_DIR = 'src/app/screens'

route_map = {
    "'dashboard'": "'/'",
    "'vocabulary'": "'/vocabulary'",
    "'add-word'": "'/vocabulary/new'",
    "'import'": "'/import'",
    "'import-step1'": "'/import/step1'",
    "'import-step2'": "'/import/step2'",
    "'import-step3'": "'/import/step3'",
    "'review'": "'/review'",
    "'review-session'": "'/review/session'",
    "'review-result'": "'/review/result'",
    "'collections'": "'/collections'",
    "'statistics'": "'/statistics'",
    "'settings'": "'/settings'",
}

for filename in os.listdir(SCREENS_DIR):
    if not filename.endswith('.tsx'): continue
    filepath = os.path.join(SCREENS_DIR, filename)
    with open(filepath, 'r') as f:
        content = f.read()

    # 1. Add import useNavigate
    if 'useNavigate' not in content:
        # insert after first import
        content = re.sub(r'^(import .*?;)\n', r'\1\nimport { useNavigate, useLocation } from "react-router";\n', content, count=1)
        if 'react-router' not in content: # if it didn't match (e.g. no imports)
            content = 'import { useNavigate, useLocation } from "react-router";\n' + content

    # 2. Remove onNavigate from props interface
    content = re.sub(r'\s*onNavigate:\s*\(page:\s*string(?:,\s*data\?:\s*any)?\)\s*=>\s*void;\n?', '\n', content)
    
    # If interface becomes empty, we could remove it, but let's just leave it or remove if easy
    content = re.sub(r'interface \w+Props \{\s*\}', '', content)

    # 3. Modify component signature
    content = re.sub(r'\{ onNavigate(?:,\s*data)? \}:\s*\w+Props', '()', content)
    content = re.sub(r'\{ onNavigate(?:,\s*data)? \}', '()', content)
    content = re.sub(r'export function (\w+)\(\(\)\)', r'export function \1()', content)

    # 4. Add const navigate = useNavigate(); inside component
    content = re.sub(r'(export function \w+\([^)]*\)\s*\{)', r'\1\n  const navigate = useNavigate();\n  const location = useLocation();\n  const data = location.state;', content)

    # 5. Replace onNavigate calls
    for old, new_ in route_map.items():
        content = content.replace(f'onNavigate({old})', f'navigate({new_})')
    
    # 6. Replace special cases with data
    content = re.sub(r"onNavigate\('word-detail',\s*([^)]+)\)", r"navigate('/vocabulary/' + \1.id, { state: \1 })", content)
    content = re.sub(r"onNavigate\('collection-detail',\s*([^)]+)\)", r"navigate('/collections/' + \1.id, { state: \1 })", content)

    with open(filepath, 'w') as f:
        f.write(content)

print("Done refactoring routes.")
