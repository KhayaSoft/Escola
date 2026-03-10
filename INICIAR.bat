@echo off
title Sistema de Gestao Escolar
color 0A
cls

echo.
echo  =====================================================
echo   SISTEMA DE GESTAO ESCOLAR
echo  =====================================================
echo.

:: ── Verificar Node.js ────────────────────────────────────────────────────────
where node >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo  [ERRO] Node.js nao esta instalado neste computador.
    echo.
    echo  Por favor instale o Node.js em: https://nodejs.org
    echo  Escolha a versao LTS e reinicie o computador.
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('node -v') do set NODE_VER=%%v
echo  [OK] Node.js %NODE_VER% detectado
echo.

:: ── Instalar dependencias se necessario ──────────────────────────────────────
if not exist "node_modules\" (
    echo  [INFO] Primeira execucao — a instalar dependencias...
    echo  [INFO] Isto pode demorar 1-2 minutos. Por favor aguarde.
    echo.
    call npm install
    if %errorlevel% neq 0 (
        color 0C
        echo.
        echo  [ERRO] Falha ao instalar dependencias.
        echo  Verifique a ligacao a internet e tente novamente.
        echo.
        pause
        exit /b 1
    )
    echo.
    echo  [OK] Dependencias instaladas com sucesso.
    echo.
)

:: ── Verificar porta 8080 ─────────────────────────────────────────────────────
netstat -an 2>nul | find ":8080 " | find "LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    echo  [INFO] Servidor ja esta em execucao na porta 8080.
    echo.
    echo  A abrir o browser...
    timeout /t 1 /nobreak >nul
    start http://localhost:8080
    echo.
    echo  Pressione qualquer tecla para fechar este assistente.
    echo  O sistema continuara a funcionar em segundo plano.
    pause >nul
    exit /b 0
)

:: ── Iniciar servidor ─────────────────────────────────────────────────────────
echo  [INFO] A iniciar o servidor...
echo.

:: Iniciar vite em segundo plano
start /b cmd /c "npm run dev > servidor.log 2>&1"

:: Aguardar o servidor arrancar (max 30 segundos)
echo  [INFO] A aguardar o servidor arrancar...
set /a tentativas=0

:aguardar
set /a tentativas=%tentativas%+1
timeout /t 2 /nobreak >nul

netstat -an 2>nul | find ":8080 " | find "LISTENING" >nul 2>&1
if %errorlevel% equ 0 goto servidor_pronto

if %tentativas% lss 15 goto aguardar

:: Timeout
color 0E
echo.
echo  [AVISO] O servidor demorou mais que o esperado.
echo  A tentar abrir o browser de qualquer forma...
echo.

:servidor_pronto
echo  [OK] Servidor iniciado com sucesso!
echo.
echo  =====================================================
echo   Acesso: http://localhost:8080
echo  =====================================================
echo.
echo  Credenciais de acesso:
echo    Admin:      admin / admin123
echo    Secretaria: secretaria / sec123
echo    Professor:  prof.joao / prof123
echo.
echo  A abrir o browser...
timeout /t 1 /nobreak >nul
start http://localhost:8080

echo.
echo  =====================================================
echo   Sistema em execucao. NAO feche esta janela.
echo   Para parar o servidor, feche esta janela.
echo  =====================================================
echo.

:: Manter a janela aberta
:loop
timeout /t 5 /nobreak >nul
netstat -an 2>nul | find ":8080 " | find "LISTENING" >nul 2>&1
if %errorlevel% neq 0 (
    echo  [AVISO] Servidor parou inesperadamente.
    echo  A reiniciar...
    start /b cmd /c "npm run dev > servidor.log 2>&1"
    timeout /t 3 /nobreak >nul
)
goto loop
