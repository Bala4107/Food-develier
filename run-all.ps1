# PowerShell Script to run all services in the Online Food Order Processing System

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host " Starting Online Food Order Processing System " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# 1. Terminate any existing Java processes to clear ports
Write-Host "1. Cleaning up old Java service instances..." -ForegroundColor Green
Stop-Process -Name "java" -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# 2. Check & Handle Docker
Write-Host "2. Checking Docker installation..." -ForegroundColor Green
$dockerInstalled = $null -ne (Get-Command docker -ErrorAction SilentlyContinue)

if ($dockerInstalled) {
    Write-Host "   - Docker detected. Starting MySQL and ActiveMQ via Docker Compose..." -ForegroundColor Yellow
    docker-compose up -d
    Write-Host "Waiting 5 seconds for backing services to initialize..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
} else {
    Write-Host "   - Docker not found. Proceeding with H2 / Embedded ActiveMQ mode..." -ForegroundColor Yellow
}

# 3. Check & Handle Maven (Download locally if missing)
Write-Host "3. Verifying Maven compiler..." -ForegroundColor Green
$mvnCmd = "mvn"
$mvnInstalled = $null -ne (Get-Command mvn -ErrorAction SilentlyContinue)

if (-not $mvnInstalled) {
    Write-Host "   - Global Maven compiler not found." -ForegroundColor Yellow
    $mavenHome = "$PSScriptRoot/.maven"
    $mvnCmd = "$mavenHome/apache-maven-3.9.6/bin/mvn.cmd"
    
    if (-not (Test-Path "$mavenHome/apache-maven-3.9.6")) {
        Write-Host "   - Downloading local Apache Maven 3.9.6..." -ForegroundColor Yellow
        $mavenZip = "$PSScriptRoot/maven.zip"
        
        try {
            [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
            Invoke-WebRequest -Uri "https://archive.apache.org/dist/maven/maven-3/3.9.6/binaries/apache-maven-3.9.6-bin.zip" -OutFile $mavenZip
            Write-Host "   - Extracting Maven locally..." -ForegroundColor Yellow
            Expand-Archive -Path $mavenZip -DestinationPath $mavenHome -Force
            Remove-Item $mavenZip -Force
            Write-Host "   - Local Maven installation complete." -ForegroundColor Green
        } catch {
            Write-Error "Failed to download Maven. Please verify your internet connection or install Maven manually."
            exit
        }
    } else {
        Write-Host "   - Local Maven compiler detected." -ForegroundColor Green
    }
} else {
    Write-Host "   - Global Maven compiler detected." -ForegroundColor Green
}

# 4. Build backend
Write-Host "4. Compiling and packaging backend modules..." -ForegroundColor Green
if ($mvnCmd -eq "mvn") {
    mvn clean package -DskipTests
} else {
    & $mvnCmd clean package -DskipTests
}

if ($LASTEXITCODE -ne 0) {
    Write-Error "Compilation failed. Check Maven output."
    exit
}
Write-Host "   - Backend packaged successfully." -ForegroundColor Green

# 5. Launch Java Services in the background (Redirecting logs)
Write-Host "5. Launching Microservices in headless background mode..." -ForegroundColor Green
$logDir = "$PSScriptRoot/logs"
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir | Out-Null
}

Write-Host "   - Launching Order Service (Port 8081)..." -ForegroundColor Yellow
Start-Process java -ArgumentList "-jar order-service/target/order-service-1.0.0-SNAPSHOT.jar" `
    -RedirectStandardOutput "$logDir/order-service.log" `
    -RedirectStandardError "$logDir/order-service-error.log" `
    -NoNewWindow

Write-Host "   - Launching Payment Service (Port 8082)..." -ForegroundColor Yellow
Start-Process java -ArgumentList "-jar payment-service/target/payment-service-1.0.0-SNAPSHOT.jar" `
    -RedirectStandardOutput "$logDir/payment-service.log" `
    -RedirectStandardError "$logDir/payment-service-error.log" `
    -NoNewWindow

Write-Host "   - Launching Kitchen Service (Port 8083)..." -ForegroundColor Yellow
Start-Process java -ArgumentList "-jar kitchen-service/target/kitchen-service-1.0.0-SNAPSHOT.jar" `
    -RedirectStandardOutput "$logDir/kitchen-service.log" `
    -RedirectStandardError "$logDir/kitchen-service-error.log" `
    -NoNewWindow

Write-Host "   - Launching Delivery Service (Port 8084)..." -ForegroundColor Yellow
Start-Process java -ArgumentList "-jar delivery-service/target/delivery-service-1.0.0-SNAPSHOT.jar" `
    -RedirectStandardOutput "$logDir/delivery-service.log" `
    -RedirectStandardError "$logDir/delivery-service-error.log" `
    -NoNewWindow

Write-Host "Waiting 8 seconds for Spring Boot context initialization..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

# 6. Start React Frontend
Write-Host "6. Starting React Dev Server..." -ForegroundColor Green
Set-Location -Path "$PSScriptRoot/react-frontend"
npm run dev
