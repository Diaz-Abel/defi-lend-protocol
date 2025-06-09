# DeFi Lend - Protocolo de Préstamos Descentralizado

Este proyecto implementa un protocolo de préstamos descentralizado que permite a los usuarios depositar tokens como colateral y solicitar préstamos con un ratio de colateralización del 150%. Incluye un frontend profesional inspirado en plataformas DeFi reales.

## 🎯 Características

- **Depósito de colateral**: Deposita cUSD como colateral
- **Préstamos descentralizados**: Solicita préstamos en dDAI
- **Ratio de colateralización**: 150% mínimo requerido
- **Interés fijo**: 5% semanal sin composición
- **Interfaz profesional**: Frontend moderno inspirado en Aave/Compound
- **ABIs automáticos**: Sistema de sincronización automática de ABIs

## 🚀 Tecnologías Utilizadas

### Backend
- **Solidity** - Contratos inteligentes
- **Hardhat** - Framework de desarrollo
- **OpenZeppelin** - Librerías de seguridad
- **Ephemery Testnet** - Red de pruebas

### Frontend
- **React 19** - Framework de UI
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Estilos modernos
- **ethers.js** - Interacción con blockchain
- **Lucide React** - Iconografía
- **MetaMask** - Integración de wallet

## 📦 Instalación Rápida

```bash
# Clonar e instalar dependencias
git clone <url-del-repositorio>
cd Final
npm run setup  # Instala dependencias del proyecto y frontend

# Configurar variables de entorno
cp .env.example .env
cp web_app/env.example web_app/.env
# Editar los archivos .env con tus datos
```

## 🛠️ Scripts Disponibles

### Desarrollo Principal
```bash
npm run setup           # Instalar todas las dependencias
npm run clean           # Limpiar artifacts y cache de Hardhat
npm run compile         # Solo compilar contratos
npm run build           # Compilar contratos + copiar ABIs (rápido)
npm run build-contracts # Limpiar + compilar + copiar ABIs (completo)
npm run copy-abi        # Solo copiar ABIs al frontend
npm run test            # Ejecutar tests
npm run coverage        # Coverage de tests
npm run deploy          # Desplegar a Ephemery
```

### Frontend
```bash
npm run start-app       # Iniciar frontend desde raíz del proyecto
npm run dev:frontend    # Servidor de desarrollo del frontend
npm run build:frontend  # Build del frontend para producción
```

## 🔄 Sistema de ABIs Automático

El proyecto incluye un sistema automatizado para mantener sincronizados los ABIs entre contratos y frontend:

```bash
# Flujo automático
npm run build  # compile + copy-abi

# Manual si es necesario
npm run copy-abi
```

**Qué hace:**
- Copia ABIs compilados a `web_app/src/abi/`
- Extrae solo información necesaria (ABI, bytecode)
- Crea archivo de índice para importaciones fáciles
- El frontend detecta automáticamente ABIs nuevos

## 📁 Estructura del Proyecto

```
├── contracts/
│   ├── LendingProtocol.sol     # Contrato principal
│   ├── CollateralToken.sol     # Token cUSD  
│   └── LoanToken.sol           # Token dDAI
├── scripts/
│   ├── deploy.js               # Script de despliegue
│   ├── copyAbi.js              # Copia ABIs al frontend
│   └── README.md               # Documentación de scripts
├── test/
│   └── LendingProtocol.test.js # Tests unitarios
├── web_app/                    # Frontend React
│   ├── src/
│   │   ├── components/         # Componentes React
│   │   ├── abi/               # ABIs auto-generados
│   │   └── App.jsx            # Componente principal
│   └── README.md              # Documentación del frontend
└── hardhat.config.js          # Configuración de Hardhat
```

## 🎨 Frontend Profesional

El frontend incluye:

- **Dashboard intuitivo** con métricas en tiempo real
- **Factor de salud visual** con alertas inteligentes
- **Panel de acciones** con validaciones en vivo
- **Sistema de notificaciones** para feedback inmediato
- **Diseño responsive** para todos los dispositivos
- **Tema oscuro profesional** con efectos glassmorphism

### Capturas de Funcionalidades

- ✅ Conexión de wallet con dropdown detallado
- ✅ Dashboard de métricas con cálculos automáticos
- ✅ Factor de salud con barras de progreso
- ✅ Alertas cuando el ratio está en riesgo
- ✅ Panel de acciones con tabs organizadas
- ✅ Validaciones en tiempo real
- ✅ Aprovación automática de tokens
- ✅ Estados de carga y feedback visual

## ⚙️ Configuración

### Variables de Entorno

**Raíz del proyecto (.env):**
```env
PRIVATE_KEY=tu_clave_privada_para_despliegue
```

**Frontend (web_app/.env):**
```env
VITE_LENDING_PROTOCOL_ADDRESS=0x7809790a4FF93B9CB9e563BB8D09771bcD75d51D
VITE_COLLATERAL_TOKEN_ADDRESS=0x464f40745CEd1b7Fd9D6FC91a4dbe8D74cb8ff37
VITE_LOAN_TOKEN_ADDRESS=0x7f17765F765bEaD532FcD456f01Da38B409a243c
VITE_RPC_URL=https://rpc.ephemery.dev
```

### Red Ephemery en MetaMask
```
Nombre: Ephemery Testnet
RPC URL: https://rpc.ephemery.dev
Chain ID: 39438135
Símbolo: ETH
```

## 🧪 Desarrollo y Testing

```bash
# Desarrollo local
npm run build-contracts  # Compilación completa (limpia + compila + ABIs)
npm run test            # Ejecutar tests
npm run coverage        # Ver cobertura de tests
npm run start-app       # Desarrollo del frontend (desde raíz)

# Desarrollo iterativo
npm run build           # Compilación rápida + ABIs
npm run clean           # Limpiar cuando hay problemas

# Despliegue
npm run deploy          # Despliega a Ephemery
# Luego actualiza las direcciones en web_app/.env
```

## 🔒 Testing y Cobertura

Los tests unitarios cubren:
- ✅ Depósito de colateral
- ✅ Solicitud de préstamos con validaciones
- ✅ Cálculo de intereses
- ✅ Pago de préstamos
- ✅ Retiro de colateral
- ✅ Casos de error y validaciones
- ✅ Ratio de colateralización
- ✅ Integración con tokens ERC20

```bash
npm run coverage  # Para ver reporte completo
```

## 📋 Contratos Desplegados en Ephemery Testnet

| Contrato | Dirección |
|----------|-----------|
| LendingProtocol | `0x7809790a4FF93B9CB9e563BB8D09771bcD75d51D` |
| CollateralToken (cUSD) | `0x464f40745CEd1b7Fd9D6FC91a4dbe8D74cb8ff37` |
| LoanToken (dDAI) | `0x7f17765F765bEaD532FcD456f01Da38B409a243c` |

> ✅ **Contratos verificados y desplegados en Ephemery Testnet**  
> 🔗 Puedes verificar estos contratos en el explorador de Ephemery

## 🌐 Uso de la DApp

### 1. Configuración Inicial
- Instalar MetaMask
- Añadir red Ephemery Testnet
- Obtener ETH de testnet para gas

### 2. Flujo de Usuario
1. **Conectar wallet** en la DApp
2. **Depositar colateral** (cUSD)
3. **Pedir préstamo** (hasta 66% del colateral)
4. **Gestionar posición** (ver métricas en dashboard)
5. **Pagar préstamo** (capital + interés)
6. **Retirar colateral** (cuando no hay deuda)

### 3. Características del Dashboard
- Métricas en tiempo real
- Factor de salud con alertas
- Cálculos automáticos de límites
- Historial visual de transacciones

## 🎯 Próximas Mejoras

- [ ] Modo claro/oscuro toggle
- [ ] Gráficos de métricas históricas
- [ ] Múltiples tokens de colateral
- [ ] Liquidaciones automáticas
- [ ] Gobernanza descentralizada
- [ ] Tests de integración frontend-backend

## 📄 Documentación Adicional

- [Frontend README](web_app/README.md) - Documentación detallada del frontend
- [Scripts README](scripts/README.md) - Documentación de scripts y automatización

## 🤝 Contribución

Este es un proyecto educativo del curso de Blockchain. Las contribuciones son bienvenidas:

1. Fork el repositorio
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📜 Licencia

MIT - Ver [LICENSE](LICENSE) para más detalles.

## 🎓 Contexto Académico

Proyecto final para:
- **Asignatura**: Blockchain
- **Institución**: FPUNA
- **Semestre**: 8° Semestre
- **Año**: 2025
