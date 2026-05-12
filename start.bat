@echo off
echo Starting Web Application...
echo.
echo Server will run on: http://10.17.92.32:8080
echo.

REM Check if main.exe exists
if exist main.exe (
    echo Starting existing executable...
    main.exe
) else (
    echo Compiling Go application...
    go build -o main.exe
    if %errorlevel% equ 0 (
        echo Compilation successful!
        echo Starting server...
        main.exe
    ) else (
        echo Compilation failed!
        echo Please check your Go environment.
        pause
    )
)
