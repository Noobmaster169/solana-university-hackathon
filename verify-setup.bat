@echo off
REM Keystore Setup Verification Script for Windows
REM Run this to check if your environment is ready

echo.
echo ================================================================
echo                 Keystore Setup Verification
echo ================================================================
echo.

REM Check Node.js
where node >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Node.js is installed
    node --version
) else (
    echo [ERROR] Node.js is not installed
    echo        Download from: https://nodejs.org
)

echo.

REM Check npm
where npm >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] npm is installed
    npm --version
) else (
    echo [ERROR] npm is not installed
)

echo.

REM Check Rust
where rustc >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Rust is installed
    rustc --version
) else (
    echo [ERROR] Rust is not installed
    echo        Download from: https://rustup.rs
)

echo.

REM Check Cargo
where cargo >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Cargo is installed
    cargo --version
) else (
    echo [ERROR] Cargo is not installed
)

echo.

REM Check Solana
where solana >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Solana CLI is installed
    solana --version
) else (
    echo [ERROR] Solana CLI is not installed
    echo        Download from: https://docs.solana.com/cli/install-solana-cli-tools
)

echo.

REM Check Anchor
where anchor >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Anchor is installed
    anchor --version
) else (
    echo [ERROR] Anchor is not installed
    echo        Install with: cargo install --git https://github.com/coral-xyz/anchor anchor-cli --locked
)

echo.
echo ================================================================
echo                    Project Structure Check
echo ================================================================
echo.

REM Check project files
if exist "programs\keystore\src\lib.rs" (
    echo [OK] Solana program found
) else (
    echo [ERROR] Solana program not found
)

if exist "app\src\app\page.tsx" (
    echo [OK] Frontend found
) else (
    echo [ERROR] Frontend not found
)

if exist "Anchor.toml" (
    echo [OK] Anchor config found
) else (
    echo [ERROR] Anchor config not found
)

echo.
echo ================================================================
echo                    Dependencies Check
echo ================================================================
echo.

if exist "node_modules" (
    echo [OK] Root dependencies installed
) else (
    echo [WARNING] Root dependencies not installed
    echo           Run: npm install
)

if exist "app\node_modules" (
    echo [OK] Frontend dependencies installed
) else (
    echo [WARNING] Frontend dependencies not installed
    echo           Run: cd app ^&^& npm install
)

echo.
echo ================================================================
echo                        Build Status
echo ================================================================
echo.

if exist "target\deploy\keystore.so" (
    echo [OK] Program built
    dir "target\deploy\keystore.so" | find "keystore.so"
) else (
    echo [WARNING] Program not built yet
    echo           Run: anchor build
)

if exist "target\deploy\keystore-keypair.json" (
    echo [OK] Program keypair exists
    solana address -k target\deploy\keystore-keypair.json
) else (
    echo [WARNING] Program keypair not found
)

echo.
echo ================================================================
echo                         Next Steps
echo ================================================================
echo.
echo 1. npm install (if needed)
echo 2. cd app ^&^& npm install (if needed)
echo 3. anchor build
echo 4. anchor deploy --provider.cluster devnet
echo 5. Update program IDs in:
echo    - programs\keystore\src\lib.rs
echo    - app\src\lib\keystore.ts
echo    - Anchor.toml
echo 6. cd app ^&^& npm run dev
echo.
echo See QUICKSTART.md for detailed instructions
echo.

pause

